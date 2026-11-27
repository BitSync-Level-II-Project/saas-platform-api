import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import type { NextFunction, Request, Response } from 'express';
import request from 'supertest';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/configure-app.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import type { CreateSubmissionDto } from '../src/submissions/dto/create-submission.dto.js';
import { SubmissionsService } from '../src/submissions/submissions.service.js';
import { TasksService } from '../src/tasks/tasks.service.js';

const organizationId = `worker-submissions-${randomUUID()}`;
const otherOrganizationId = `worker-submissions-${randomUUID()}`;
const worker = { organizationId, userId: 'worker-a', role: 'WORKER' };
const supervisor = { organizationId, userId: 'supervisor', role: 'SUPERVISOR' };
const otherWorker = { ...worker, userId: 'worker-b' };
const sessions = new Map([
  ['worker-a', worker],
  ['worker-b', otherWorker],
  ['supervisor', supervisor],
  ['other-organization', { ...worker, organizationId: otherOrganizationId }],
]);

function transactionGate<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}

describe('Worker submissions with PostgreSQL', () => {
  let app: INestApplication<Server> | undefined;
  let prisma: PrismaService;
  let tasks: TasksService;
  let service: SubmissionsService;
  let templateVersionId: string;
  let newerVersionId: string;
  let body: CreateSubmissionDto;
  const evidencePolicies = new Map<string, 'optional' | 'required'>();

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(ConfigService)
      .useValue(
        new ConfigService({
          DATABASE_URL: process.env.DATABASE_URL,
          NODE_ENV: 'development',
          ENABLE_TASK_DEV_API: 'true',
          DEV_ORGANIZATION_ID: organizationId,
          DEV_USER_ID: supervisor.userId,
        }),
      )
      .compile();
    app = module.createNestApplication<INestApplication<Server>>();
    configureApp(app);
    // Populate the server principal in this test app while worker auth is pending.
    app.use((req: Request, _res: Response, next: NextFunction) => {
      const user = sessions.get(req.get('x-test-session') ?? '');
      if (user) Object.assign(req, { user });
      next();
    });
    await app.init();

    prisma = app.get(PrismaService);
    tasks = app.get(TasksService);
    service = app.get(SubmissionsService);

    // Supply the pending Task API contract field alongside the real task lookup.
    const getContext = tasks.getSubmissionContext.bind(tasks);
    vi.spyOn(tasks, 'getSubmissionContext').mockImplementation(
      async (input, tx) => ({
        ...(await getContext(input, tx)),
        evidencePolicy: evidencePolicies.get(input.taskId),
      }),
    );

    const template = await prisma.template.create({
      data: {
        organizationId,
        createdById: 'manager',
        name: 'Equipment inspection',
      },
    });
    const version = await prisma.templateVersion.create({
      data: {
        templateId: template.id,
        organizationId,
        version: 1,
        sourceDraftRevision: 1,
        name: template.name,
        metadata: {},
        fields: [
          { id: 'reading', type: 'number', label: 'Reading', required: true },
        ],
        publishedById: 'manager',
      },
    });
    const newer = await prisma.templateVersion.create({
      data: {
        templateId: template.id,
        organizationId,
        version: 2,
        sourceDraftRevision: 2,
        name: template.name,
        metadata: {},
        fields: [
          {
            id: 'reading',
            type: 'short-text',
            label: 'Reading',
            required: true,
          },
        ],
        publishedById: 'manager',
      },
    });
    templateVersionId = version.id;
    newerVersionId = newer.id;
  }, 30_000);

  afterAll(async () => {
    vi.restoreAllMocks();
    try {
      if (prisma) {
        const where = { organizationId };
        await prisma.$transaction([
          prisma.submissionReview.deleteMany({ where }),
          prisma.submissionAttempt.deleteMany({ where }),
          prisma.submission.deleteMany({ where }),
          prisma.task.deleteMany({ where }),
          prisma.templateVersion.deleteMany({ where }),
          prisma.template.deleteMany({ where }),
        ]);
      }
    } finally {
      await app?.close();
    }
  }, 30_000);

  async function createTask() {
    const task = await prisma.task.create({
      data: {
        organizationId,
        title: 'Inspect equipment',
        warehouse: 'Colombo',
        location: 'Machine room',
        dueDate: new Date('2026-11-30'),
        status: 'ASSIGNED',
        templateVersionId,
        supervisorId: supervisor.userId,
        assigneeType: 'WORKER',
        assigneeId: worker.userId,
      },
    });
    evidencePolicies.set(task.id, 'optional');
    return task;
  }

  beforeEach(async () => {
    const task = await createTask();
    body = {
      taskId: task.id,
      templateVersionId,
      clientAttemptId: randomUUID(),
      answers: [{ fieldId: 'reading', value: 0 }],
    };
  });

  function post(payload: CreateSubmissionDto, session = 'worker-a') {
    if (!app) throw new Error('Test app was not initialized');
    const submission = request(app.getHttpServer()).post('/api/v1/submissions');
    if (session) submission.set('x-test-session', session);
    return submission.send(payload);
  }

  function taskState() {
    return prisma.task.findUniqueOrThrow({
      where: { id: body.taskId },
      select: { status: true, assigneeId: true },
    });
  }

  function savedSubmissions(taskId = body.taskId) {
    return prisma.submission.findMany({
      where: { organizationId, taskId },
      include: {
        attempts: {
          orderBy: { attemptNumber: 'asc' },
          include: { review: true },
        },
      },
    });
  }

  async function expectNoWrites() {
    expect(await savedSubmissions()).toEqual([]);
    expect(
      await prisma.submissionAttempt.count({
        where: { organizationId, clientAttemptId: body.clientAttemptId },
      }),
    ).toBe(0);
    expect(await taskState()).toMatchObject({ status: 'ASSIGNED' });
  }

  async function waitForBlockedQuery(blockingPid: number) {
    await expect
      .poll(
        async () => {
          const [activity] = await prisma.$queryRaw<{ blocked: boolean }[]>`
          SELECT EXISTS (
            SELECT FROM pg_stat_activity
            WHERE datname = current_database()
              AND ${blockingPid}::int = ANY(pg_blocking_pids(pid))
          ) AS blocked
        `;
          return activity.blocked;
        },
        { interval: 20, timeout: 2_000 },
      )
      .toBe(true);
  }

  it('returns 201 and stores one attempt against the pinned version, then replays it with 200', async () => {
    const created = await post(body).expect(201);
    expect(created.body).toEqual({
      taskId: body.taskId,
      templateVersionId,
      clientAttemptId: body.clientAttemptId,
      submissionId: expect.any(String),
      attemptId: expect.any(String),
      taskStatus: 'IN_REVIEW',
    });

    const replay = await post(body).expect(200);
    expect(replay.body).toEqual(created.body);
    const [saved, ...duplicates] = await savedSubmissions();
    expect(duplicates).toEqual([]);
    expect(saved.id).toBe(created.body.submissionId);
    expect(saved.attempts).toHaveLength(1);
    expect(saved.attempts[0]).toMatchObject({
      id: created.body.attemptId,
      answers: body.answers,
      submittedById: worker.userId,
    });
    expect(await taskState()).toMatchObject({ status: 'IN_REVIEW' });
  });

  it('stores one attempt when identical requests run concurrently', async () => {
    const results = await Promise.all([
      service.submit(worker, body),
      service.submit(worker, body),
    ]);
    expect(results.filter((result) => result.created)).toHaveLength(1);
    expect(results[0].receipt).toEqual(results[1].receipt);
    const saved = await savedSubmissions();
    expect(saved).toHaveLength(1);
    expect(saved[0].attempts).toHaveLength(1);
    expect(await taskState()).toMatchObject({ status: 'IN_REVIEW' });
  });

  it('rejects reuse of an attempt ID for different answers, task or version', async () => {
    await post(body).expect(201);
    const secondTask = await createTask();
    const changes = [
      { answers: [{ fieldId: 'reading', value: 12 }] },
      { taskId: secondTask.id },
      { templateVersionId: newerVersionId },
    ];
    for (const change of changes) {
      const response = await post({ ...body, ...change }).expect(409);
      expect(response.body.code).toBe('ATTEMPT_PAYLOAD_CONFLICT');
    }
    const [saved] = await savedSubmissions();
    expect(saved.attempts).toHaveLength(1);
    expect(saved.attempts[0].answers).toEqual(body.answers);
    expect(await savedSubmissions(secondTask.id)).toEqual([]);
  });

  it('rejects a new request with the wrong template version', async () => {
    const response = await post({
      ...body,
      templateVersionId: newerVersionId,
    }).expect(409);
    expect(response.body.code).toBe('TEMPLATE_VERSION_MISMATCH');
    await expectNoWrites();
  });

  it.each([
    { name: 'a missing required answer', answers: [] },
    { name: 'a numeric string', answers: [{ fieldId: 'reading', value: '0' }] },
  ])('rejects $name without persisting anything', async ({ answers }) => {
    const response = await post({ ...body, answers }).expect(400);
    expect(response.body.code).toBe('INVALID_ANSWERS');
    await expectNoWrites();
  });

  it('rejects an invalid request DTO without persisting anything', async () => {
    await post({ ...body, clientAttemptId: 'invalid' }).expect(400);
    await expectNoWrites();
  });

  it.each([
    ['', 401, 'AUTH_REQUIRED'],
    ['supervisor', 403, 'WORKER_ROLE_REQUIRED'],
    ['worker-b', 404, 'TASK_NOT_FOUND'],
    ['other-organization', 404, 'TASK_NOT_FOUND'],
  ] as const)(
    'checks access for session "%s"',
    async (session, status, code) => {
      const response = await post(body, session).expect(status);
      expect(response.body.code).toBe(code);
      await expectNoWrites();
    },
  );

  it('blocks required photos and fails closed when the policy is unavailable', async () => {
    evidencePolicies.set(body.taskId, 'required');
    const required = await post(body).expect(409);
    expect(required.body.code).toBe('PHOTO_REQUIRED');

    evidencePolicies.delete(body.taskId);
    const unknown = await post(body).expect(503);
    expect(unknown.body.code).toBe('EVIDENCE_POLICY_UNAVAILABLE');
    await expectNoWrites();
  });

  it('rolls back the task transition and both submission records on failure', async () => {
    const apply = tasks.applyWorkflowEvent.bind(tasks);
    const workflow = vi
      .spyOn(tasks, 'applyWorkflowEvent')
      .mockImplementationOnce(async (input, tx) => {
        await apply(input, tx);
        throw new Error('Rollback check');
      });

    try {
      await expect(service.submit(worker, body)).rejects.toThrow(
        'Rollback check',
      );
    } finally {
      workflow.mockRestore();
    }
    await expectNoWrites();
  });

  it('rejects submission when reassignment locks the task first', async () => {
    const locked = transactionGate<number>();
    const release = transactionGate<void>();
    const reassignment = prisma.$transaction(async (tx) => {
      await tx.task.update({
        where: { id: body.taskId },
        data: { assigneeId: otherWorker.userId },
      });
      const [connection] = await tx.$queryRaw<
        { pid: number }[]
      >`SELECT pg_backend_pid() AS pid`;
      locked.resolve(connection.pid);
      await release.promise;
    });
    void reassignment.catch(locked.reject);

    const submit = post(body).expect(404);
    try {
      const blockingPid = await locked.promise;
      await Promise.all([
        submit.then((result) =>
          expect(result.body.code).toBe('TASK_NOT_FOUND'),
        ),
        waitForBlockedQuery(blockingPid).finally(() => release.resolve()),
      ]);
    } finally {
      release.resolve();
      await reassignment;
    }
    await expectNoWrites();
    expect(await taskState()).toEqual({
      status: 'ASSIGNED',
      assigneeId: otherWorker.userId,
    });
  });

  it.each(['reassignment', 'unassignment'] as const)(
    'rejects concurrent %s when submission locks the task first',
    async (operation) => {
      const locked = transactionGate<number>();
      const release = transactionGate<void>();
      const apply = tasks.applyWorkflowEvent.bind(tasks);
      const workflow = vi
        .spyOn(tasks, 'applyWorkflowEvent')
        .mockImplementationOnce(async (input, tx) => {
          if (!tx) throw new Error('Submission must provide its transaction');
          const status = await apply(input, tx);
          const [connection] = await tx.$queryRaw<
            { pid: number }[]
          >`SELECT pg_backend_pid() AS pid`;
          locked.resolve(connection.pid);
          await release.promise;
          return status;
        });
      const submission = service.submit(worker, body);
      void submission.catch(locked.reject);

      try {
        const blockingPid = await locked.promise;
        const assignmentChange =
          operation === 'reassignment'
            ? tasks.assign(body.taskId, {
                assigneeType: 'WORKER',
                assigneeId: otherWorker.userId,
              })
            : tasks.unassign(body.taskId);
        await Promise.all([
          expect(assignmentChange).rejects.toMatchObject({ status: 409 }),
          waitForBlockedQuery(blockingPid).finally(() => release.resolve()),
        ]);
      } finally {
        release.resolve();
        workflow.mockRestore();
        await submission;
      }

      const [saved] = await savedSubmissions();
      expect(saved.attempts).toHaveLength(1);
      expect(saved.attempts[0].submittedById).toBe(worker.userId);
      expect(await taskState()).toEqual({
        status: 'IN_REVIEW',
        assigneeId: worker.userId,
      });
    },
  );

  async function reviewAttempt(
    attemptId: string,
    decision: 'APPROVED' | 'REJECTED',
  ) {
    await prisma.$transaction(async (tx) => {
      await tx.submissionReview.create({
        data: {
          organizationId,
          attemptId,
          decision,
          reviewedById: supervisor.userId,
        },
      });
      await tasks.applyWorkflowEvent(
        { organizationId, taskId: body.taskId, event: decision },
        tx,
      );
    });
  }

  it('returns the original receipt with the current status after approval', async () => {
    const created = await post(body).expect(201);
    await reviewAttempt(created.body.attemptId as string, 'APPROVED');

    const replay = await post(body).expect(200);
    expect(replay.body).toEqual({ ...created.body, taskStatus: 'COMPLETE' });
    const [saved] = await savedSubmissions();
    expect(saved.attempts).toHaveLength(1);
    expect(saved.attempts[0].review?.decision).toBe('APPROVED');
  });

  it('adds a numbered correction after rejection and preserves the earlier review', async () => {
    const created = await post(body).expect(201);
    await reviewAttempt(created.body.attemptId as string, 'REJECTED');
    const correction = await post({
      ...body,
      clientAttemptId: randomUUID(),
      answers: [{ fieldId: 'reading', value: 12 }],
    }).expect(201);

    expect(correction.body.submissionId).toBe(created.body.submissionId);
    expect(correction.body.attemptId).not.toBe(created.body.attemptId);
    const [saved] = await savedSubmissions();
    expect(
      saved.attempts.map(({ attemptNumber, review }) => [
        attemptNumber,
        review?.decision,
      ]),
    ).toEqual([
      [1, 'REJECTED'],
      [2, undefined],
    ]);
    expect(await taskState()).toMatchObject({ status: 'IN_REVIEW' });
  });
});
