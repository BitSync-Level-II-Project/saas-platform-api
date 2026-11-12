import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/configure-app.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

const base = '/api/v1/templates';
const organizationId = `e2e-templates-${randomUUID()}`;
const otherOrganizationId = `e2e-templates-${randomUUID()}`;
const context = {
  NODE_ENV: 'development',
  ENABLE_TEMPLATE_DEV_API: 'true',
  DEV_ORGANIZATION_ID: organizationId,
  DEV_USER_ID: 'e2e-manager',
};
const details = {
  name: 'QA Status Filter',
  description: 'Template status filtering verification',
  industry: 'Logistics',
  process: 'Inspection',
  warehouse: 'colombo',
};
const fields = [
  {
    id: 'inspection-note',
    type: 'short-text',
    label: 'Inspection note',
    required: true,
  },
];

describe('Template API contract from the PDF (PostgreSQL)', () => {
  let app: INestApplication<Server>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(ConfigService)
      .useValue(new ConfigService(context))
      .compile();
    app = module.createNestApplication();
    configureApp(app);
    await app.init();
    prisma = app.get(PrismaService);
  }, 30000);

  afterAll(async () => {
    try {
      if (prisma) {
        const where = {
          organizationId: { in: [organizationId, otherOrganizationId] },
        };
        await prisma.$transaction([
          prisma.templateVersion.deleteMany({ where }),
          prisma.template.deleteMany({ where }),
        ]);
      }
    } finally {
      await app?.close();
    }
  }, 30000);

  const api = () => request(app.getHttpServer());
  const createDraft = (name = details.name) =>
    api()
      .post(base)
      .send({ ...details, name })
      .expect(201);
  const saveDraft = (id: string, revision = 1) =>
    api()
      .patch(`${base}/${id}`)
      .send({ expectedRevision: revision, details, fields });

  describe('status, search, and pagination', () => {
    const draftIds: string[] = [];
    const publishedIds: string[] = [];
    let inspectionId: string;

    beforeAll(async () => {
      // Publish the oldest records so filtering after pagination would fail.
      for (const name of ['PDF Fixture Inspection', 'PDF Fixture Checklist']) {
        const created = await createDraft(name);
        const id: string = created.body.id;
        await api()
          .patch(`${base}/${id}`)
          .send({ expectedRevision: 1, details: { ...details, name }, fields })
          .expect(200);
        await api()
          .post(`${base}/${id}/publish`)
          .send({ expectedRevision: 2 })
          .expect(201);
        publishedIds.push(id);
        if (name.includes('Inspection')) inspectionId = id;
      }
      for (const name of [
        'PDF Fixture Draft Inspection',
        'PDF Fixture Draft',
      ]) {
        const created = await createDraft(name);
        draftIds.push(created.body.id);
      }
    }, 30000);

    it.each(['', '?status=all'])(
      'returns both statuses for GET /templates%s',
      async (query) => {
        const { body } = await api().get(`${base}${query}`).expect(200);
        expect(body).toMatchObject({ page: 1, limit: 20, hasMore: false });
        expect(
          body.items.map((item: { id: string }) => item.id).sort(),
        ).toEqual([...draftIds, ...publishedIds].sort());
      },
    );

    it.each(['draft', 'published'])(
      'returns only %s templates',
      async (status) => {
        const { body } = await api().get(base).query({ status }).expect(200);
        expect(body.items).toHaveLength(2);
        expect(
          body.items.every(
            (item: { status: string }) => item.status === status,
          ),
        ).toBe(true);
        expect(
          body.items.map((item: { id: string }) => item.id).sort(),
        ).toEqual((status === 'draft' ? draftIds : publishedIds).toSorted());
      },
    );

    it.each(['draft', 'published'])(
      'filters %s before paginating',
      async (status) => {
        const first = await api()
          .get(base)
          .query({ status, page: 1, limit: 1 })
          .expect(200);
        const second = await api()
          .get(base)
          .query({ status, page: 2, limit: 1 })
          .expect(200);
        const empty = await api()
          .get(base)
          .query({ status, page: 3, limit: 1 })
          .expect(200);
        expect(first.body).toMatchObject({ page: 1, limit: 1, hasMore: true });
        expect(second.body).toMatchObject({
          page: 2,
          limit: 1,
          hasMore: false,
        });
        expect(empty.body).toMatchObject({ items: [], hasMore: false });
        expect(
          [...first.body.items, ...second.body.items]
            .map((item: { id: string }) => item.id)
            .sort(),
        ).toEqual((status === 'draft' ? draftIds : publishedIds).toSorted());
      },
    );

    it('combines published status with trimmed, case-insensitive search', async () => {
      const { body } = await api()
        .get(base)
        .query({ status: 'published', search: '  INSPECTION  ', limit: 1 })
        .expect(200);
      expect(body.items).toHaveLength(1);
      expect(body.items[0].id).toBe(inspectionId);
      expect(body.hasMore).toBe(false);
    });

    it('returns a successful empty list when nothing matches', async () => {
      const { body } = await api()
        .get(base)
        .query({ status: 'published', search: 'no-matching-template' })
        .expect(200);
      expect(body.items).toEqual([]);
      expect(body.hasMore).toBe(false);
    });

    it.each([
      { status: 'invalid' },
      { status: '' },
      { status: ['draft', 'published'] },
      { page: 0 },
      { page: 1.5 },
      { page: 10001 },
      { page: 'abc' },
      { limit: 0 },
      { limit: 101 },
      { limit: 'abc' },
      { unexpected: 'value' },
    ])('rejects invalid list parameters %j', async (query) => {
      await api().get(base).query(query).expect(400);
    });
  });

  it('creates, saves, publishes, and returns an immutable snapshot', async () => {
    const created = await createDraft();
    const id: string = created.body.id;
    expect(created.body).toMatchObject({
      status: 'draft',
      draftRevision: 1,
      fields: [],
      details,
    });
    await api().get(`${base}/${id}`).expect(200).expect(created.body);
    await api().get(`${base}/${id}/published`).expect(404);
    await api()
      .get(base)
      .query({ status: 'draft', search: details.name })
      .expect(200)
      .expect(({ body }) =>
        expect(body.items.map((item: { id: string }) => item.id)).toContain(id),
      );

    const saved = await saveDraft(id).expect(200);
    expect(saved.body).toMatchObject({
      status: 'draft',
      draftRevision: 2,
      details,
      fields,
    });
    await saveDraft(id)
      .expect(409)
      .expect(({ body }) => {
        expect(body.message).toContain('This draft has changed');
      });
    await api()
      .post(`${base}/${id}/publish`)
      .send({ expectedRevision: 1 })
      .expect(409);

    const published = await api()
      .post(`${base}/${id}/publish`)
      .send({ expectedRevision: saved.body.draftRevision })
      .expect(201);
    expect(published.body).toMatchObject({
      id,
      status: 'published',
      version: 1,
      sourceDraftRevision: 2,
      details,
      fields,
    });
    await api()
      .get(`${base}/${id}/published`)
      .expect(200)
      .expect(published.body);
    await api()
      .get(`${base}/${id}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          status: 'published',
          version: 1,
          draftRevision: 2,
        });
      });
    for (const status of ['draft', 'published']) {
      const { body } = await api()
        .get(base)
        .query({ status, search: details.name })
        .expect(200);
      expect(body.items.some((item: { id: string }) => item.id === id)).toBe(
        status === 'published',
      );
    }
    await saveDraft(id, 2)
      .expect(409)
      .expect(({ body }) => {
        expect(body.message).toBe('Published templates are read-only.');
      });
    await api()
      .post(`${base}/${id}/publish`)
      .send({ expectedRevision: 2 })
      .expect(409);
    await api()
      .get(`${base}/${id}/published`)
      .expect(200)
      .expect(published.body);
  });

  it('rejects incomplete PATCH JSON and invalid fields without changing the draft', async () => {
    const { body: draft } = await createDraft('Validation Draft');
    await api().patch(`${base}/${draft.id}`).send({}).expect(400);
    await api()
      .patch(`${base}/${draft.id}`)
      .send({
        expectedRevision: 1,
        details,
        fields: [fields[0], fields[0]],
      })
      .expect(400);
    await api()
      .patch(`${base}/${draft.id}`)
      .send({
        expectedRevision: 1,
        details,
        fields: [{ ...fields[0], type: 'unsupported' }],
      })
      .expect(400);
    await api().get(`${base}/${draft.id}`).expect(200).expect(draft);
  });

  it.each([
    {},
    { name: '' },
    { name: '   ' },
    { ...details, organizationId: 'spoofed' },
  ])('rejects invalid creation payload %j', async (body) => {
    await api().post(base).send(body).expect(400);
  });

  it('rejects publishing an empty draft and an invalid publish body', async () => {
    const { body: draft } = await createDraft('Empty Draft');
    await api().post(`${base}/${draft.id}/publish`).send({}).expect(400);
    await api()
      .post(`${base}/${draft.id}/publish`)
      .send({ expectedRevision: 1 })
      .expect(400);
    await api().get(`${base}/${draft.id}/published`).expect(404);
    await api().get(`${base}/${draft.id}`).expect(200).expect(draft);
  });

  it('allows only one of two simultaneous saves with the same revision', async () => {
    const { body: draft } = await createDraft('Concurrent Saves');
    const responses = await Promise.all([
      saveDraft(draft.id),
      saveDraft(draft.id),
    ]);
    expect(responses.map(({ status }) => status).sort()).toEqual([200, 409]);
    await api()
      .get(`${base}/${draft.id}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.draftRevision).toBe(2);
      });
  });

  it('allows only one publication when two requests race', async () => {
    const { body: draft } = await createDraft('Concurrent Publications');
    await saveDraft(draft.id).expect(200);
    const publish = () =>
      api().post(`${base}/${draft.id}/publish`).send({ expectedRevision: 2 });
    const responses = await Promise.all([publish(), publish()]);
    expect(responses.map(({ status }) => status).sort()).toEqual([201, 409]);
    expect(
      await prisma.templateVersion.count({
        where: { templateId: draft.id, organizationId },
      }),
    ).toBe(1);
  });

  it.each(['not-a-uuid', randomUUID()])(
    'validates and handles unknown IDs: %s',
    async (id) => {
      const status = id === 'not-a-uuid' ? 400 : 404;
      await api().get(`${base}/${id}`).expect(status);
      await api().get(`${base}/${id}/published`).expect(status);
      await saveDraft(id).expect(status);
      await api()
        .post(`${base}/${id}/publish`)
        .send({ expectedRevision: 1 })
        .expect(status);
    },
  );

  it('prevents access to another organization’s templates', async () => {
    let id: string;
    context.DEV_ORGANIZATION_ID = otherOrganizationId;
    try {
      const { body: draft } = await createDraft(
        'Other Organization Inspection',
      );
      id = draft.id;
      await saveDraft(id).expect(200);
      await api()
        .post(`${base}/${id}/publish`)
        .send({ expectedRevision: 2 })
        .expect(201);
    } finally {
      context.DEV_ORGANIZATION_ID = organizationId;
    }
    await api()
      .get(base)
      .query({ search: 'Other Organization' })
      .expect(200)
      .expect(({ body }) => expect(body.items).toEqual([]));
    await api().get(`${base}/${id}`).expect(404);
    await api().get(`${base}/${id}/published`).expect(404);
    await saveDraft(id, 2).expect(404);
    await api()
      .post(`${base}/${id}/publish`)
      .send({ expectedRevision: 2 })
      .expect(404);
  });

  it.each([{ NODE_ENV: 'production' }, { ENABLE_TEMPLATE_DEV_API: 'false' }])(
    'hides development endpoints when disabled: %j',
    async (override) => {
      const original = { ...context };
      Object.assign(context, override);
      try {
        const id = randomUUID();
        await api().get(base).expect(404);
        await api().post(base).send(details).expect(404);
        await api().get(`${base}/${id}`).expect(404);
        await saveDraft(id).expect(404);
        await api()
          .post(`${base}/${id}/publish`)
          .send({ expectedRevision: 1 })
          .expect(404);
        await api().get(`${base}/${id}/published`).expect(404);
      } finally {
        Object.assign(context, original);
      }
    },
  );
});
