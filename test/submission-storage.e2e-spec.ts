import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaModule } from '../src/prisma/prisma.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

const organizationId = `storage-test-${randomUUID()}`;
const otherOrganizationId = `storage-other-${randomUUID()}`;

describe('Submission storage with PostgreSQL', () => {
  let testModule: TestingModule | undefined;
  let prisma: PrismaService;
  let templateVersionId: string;

  beforeAll(async () => {
    testModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule],
    }).compile();

    prisma = testModule.get(PrismaService);
    await testModule.init();

    const template = await prisma.template.create({
      data: {
        organizationId,
        createdById: 'fixture-manager',
        name: 'Submission storage test',
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
          {
            id: 'reading',
            type: 'number',
            label: 'Reading',
            required: true,
          },
        ],
        publishedById: 'fixture-manager',
      },
    });

    templateVersionId = version.id;
  }, 30000);

  afterAll(async () => {
    try {
      if (prisma) {
        const where = {
          organizationId: {
            in: [organizationId, otherOrganizationId],
          },
        };

        await prisma.$transaction([
          prisma.submissionReview.deleteMany({ where }),
          prisma.submissionAttempt.deleteMany({ where }),
          prisma.submission.deleteMany({ where }),
          prisma.templateVersion.deleteMany({ where }),
          prisma.template.deleteMany({ where }),
        ]);
      }
    } finally {
      await testModule?.close();
    }
  }, 30000);

  const createSubmission = (taskId = randomUUID()) =>
    prisma.submission.create({
      data: {
        organizationId,
        taskId,
        templateVersionId,
      },
    });

  const createAttempt = (
    submissionId: string,
    attemptNumber: number,
    clientAttemptId = randomUUID(),
  ) =>
    prisma.submissionAttempt.create({
      data: {
        organizationId,
        submissionId,
        attemptNumber,
        clientAttemptId,
        submittedById: 'fixture-worker',
        answers: [
          {
            fieldId: 'reading',
            value: 20 + attemptNumber,
          },
        ],
      },
    });

  it('preserves attempts and their reviews', async () => {
    const submission = await createSubmission();
    const decisions = ['REJECTED', 'APPROVED'] as const;

    for (const [index, decision] of decisions.entries()) {
      const attempt = await createAttempt(submission.id, index + 1);

      await prisma.submissionReview.create({
        data: {
          organizationId,
          attemptId: attempt.id,
          reviewedById: 'fixture-supervisor',
          decision,
          note:
            decision === 'REJECTED'
              ? 'Please correct the reading.'
              : 'Accepted.',
        },
      });
    }

    const saved = await prisma.submission.findFirstOrThrow({
      where: {
        id: submission.id,
        organizationId,
      },
      include: {
        attempts: {
          orderBy: { attemptNumber: 'asc' },
          include: { review: true },
        },
      },
    });

    expect(saved.attempts).toHaveLength(2);

    expect(
      saved.attempts.map((attempt) => ({
        number: attempt.attemptNumber,
        decision: attempt.review?.decision,
      })),
    ).toEqual([
      { number: 1, decision: 'REJECTED' },
      { number: 2, decision: 'APPROVED' },
    ]);

    expect(saved.attempts[0].answers).toEqual([
      { fieldId: 'reading', value: 21 },
    ]);
  });

  it('rejects a second submission for the same task', async () => {
    const taskId = randomUUID();

    await createSubmission(taskId);

    await expect(createSubmission(taskId)).rejects.toMatchObject({
      code: 'P2002',
    });
  });

  it('rejects a reused client attempt ID', async () => {
    const submission = await createSubmission();
    const clientAttemptId = randomUUID();

    await createAttempt(submission.id, 1, clientAttemptId);

    await expect(
      createAttempt(submission.id, 2, clientAttemptId),
    ).rejects.toMatchObject({ code: 'P2002' });
  });

  it('rejects a template version from another organization', async () => {
    await expect(
      prisma.submission.create({
        data: {
          organizationId: otherOrganizationId,
          taskId: randomUUID(),
          templateVersionId,
        },
      }),
    ).rejects.toMatchObject({ code: 'P2003' });
  });

  it('rolls back submission and attempt after an error', async () => {
    const taskId = randomUUID();
    const clientAttemptId = randomUUID();

    await expect(
      prisma.$transaction(async (tx) => {
        const submission = await tx.submission.create({
          data: {
            organizationId,
            taskId,
            templateVersionId,
          },
        });

        await tx.submissionAttempt.create({
          data: {
            organizationId,
            submissionId: submission.id,
            attemptNumber: 1,
            clientAttemptId,
            submittedById: 'fixture-worker',
            answers: [{ fieldId: 'reading', value: 25 }],
          },
        });

        throw new Error('Deliberate rollback test');
      }),
    ).rejects.toThrow('Deliberate rollback test');

    expect(
      await prisma.submission.count({
        where: { organizationId, taskId },
      }),
    ).toBe(0);

    expect(
      await prisma.submissionAttempt.count({
        where: { organizationId, clientAttemptId },
      }),
    ).toBe(0);
  });
});
