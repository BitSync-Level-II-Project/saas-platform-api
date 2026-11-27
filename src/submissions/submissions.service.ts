import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { isUUID, validateSync } from 'class-validator';

import { PrismaService } from '../prisma/prisma.service.js';
import { TasksService } from '../tasks/tasks.service.js';
import { TemplateFieldDto } from '../templates/dto/template-field.dto.js';
import { TemplatesService } from '../templates/templates.service.js';
import type { CreateSubmissionDto } from './dto/create-submission.dto.js';
import { isMatchingAttemptRetry } from './is-matching-attempt-retry.js';
import { validateSubmissionAnswers } from './validate-submission-answers.js';

export type WorkerContext = {
  organizationId: string;
  userId: string;
};

function taskUnavailable() {
  return new NotFoundException({
    code: 'TASK_NOT_FOUND',
    message: 'Task unavailable.',
  });
}

function versionMismatch() {
  return new ConflictException({
    code: 'TEMPLATE_VERSION_MISMATCH',
    message: 'Refresh the task before submitting.',
  });
}

function readPublishedFields(raw: unknown): TemplateFieldDto[] {
  if (!Array.isArray(raw)) {
    throw new InternalServerErrorException('Invalid published form.');
  }

  return raw.map((item: unknown) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      throw new InternalServerErrorException('Invalid published field.');
    }

    const field = plainToInstance(TemplateFieldDto, item);
    if (validateSync(field).length > 0) {
      throw new InternalServerErrorException('Invalid published field.');
    }
    return field;
  });
}

function answersForStorage(dto: CreateSubmissionDto) {
  return dto.answers.map(({ fieldId, value }) => {
    if (
      typeof value === 'string' ||
      typeof value === 'boolean' ||
      (typeof value === 'number' && Number.isFinite(value))
    ) {
      return { fieldId, value };
    }
    throw new BadRequestException({
      code: 'INVALID_ANSWERS',
      message: 'Unsupported answer value.',
    });
  });
}

@Injectable()
export class SubmissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tasks: TasksService,
    private readonly templates: TemplatesService,
  ) {}

  async submit(worker: WorkerContext, dto: CreateSubmissionDto) {
    // CreateSubmissionDto accepts a text task ID. The integrated Task table
    // uses PostgreSQL UUIDs. Check before using the SQL UUID cast.
    if (!isUUID(dto.taskId)) throw taskUnavailable();

    const organizationId = worker.organizationId;
    const taskId = dto.taskId.toLowerCase();
    const templateVersionId = dto.templateVersionId.toLowerCase();
    const clientAttemptId = dto.clientAttemptId.toLowerCase();
    const input = { taskId, templateVersionId, answers: dto.answers };

    return this.prisma.$transaction(
      async (tx) => {
        // All requests handled by this endpoint take locks in the same order.
        // This first lock also covers one UUID reused across two different tasks.
        await tx.$queryRaw`
        SELECT 1 AS locked
        FROM pg_advisory_xact_lock(
          hashtext(${organizationId}), hashtext(${clientAttemptId})
        )
      `;

        // Lock the currently authorized task row until commit or rollback.
        const rows = await tx.$queryRaw<{ id: string }[]>`
        SELECT id FROM tasks
        WHERE id = ${taskId}::uuid
          AND "organizationId" = ${organizationId}
          AND "assigneeType" = 'WORKER'
          AND "assigneeId" = ${worker.userId}
          AND "archivedAt" IS NULL
        FOR UPDATE
      `;
        if (rows.length === 0) throw taskUnavailable();

        const task = await this.tasks.getSubmissionContext(
          { organizationId, taskId, workerId: worker.userId },
          tx,
        );

        const saved = await tx.submissionAttempt.findUnique({
          where: {
            organizationId_clientAttemptId: { organizationId, clientAttemptId },
          },
          include: { submission: true },
        });

        if (saved) {
          if (!isMatchingAttemptRetry(saved, input, worker.userId)) {
            throw new ConflictException({
              code: 'ATTEMPT_PAYLOAD_CONFLICT',
              message:
                'This attempt ID was already used for different content.',
            });
          }
          if (task.templateVersionId !== templateVersionId) {
            throw versionMismatch();
          }
          return {
            created: false,
            receipt: {
              submissionId: saved.submissionId,
              attemptId: saved.id,
              clientAttemptId,
              taskId,
              templateVersionId,
              taskStatus: task.status,
            },
          };
        }

        if (task.templateVersionId !== templateVersionId) {
          throw versionMismatch();
        }
        if (task.status !== 'ASSIGNED' && task.status !== 'IN_PROGRESS') {
          throw new ConflictException({
            code: 'TASK_STATE_CONFLICT',
            message: 'This task cannot accept a new attempt.',
          });
        }

        const evidencePolicy =
          'evidencePolicy' in task ? task.evidencePolicy : undefined;
        if (evidencePolicy === 'required') {
          throw new ConflictException({
            code: 'PHOTO_REQUIRED',
            message: 'This task requires a photo before it can be submitted.',
          });
        }
        if (evidencePolicy !== 'optional') {
          throw new ServiceUnavailableException({
            code: 'EVIDENCE_POLICY_UNAVAILABLE',
            message: 'The evidence requirement could not be verified.',
          });
        }

        const form = await this.templates.findPublishedVersionForTask(
          { organizationId, templateVersionId },
          tx,
        );
        const fields = readPublishedFields(form.fields);

        try {
          validateSubmissionAnswers(fields, dto.answers);
        } catch (error) {
          if (!(error instanceof BadRequestException)) throw error;
          const details = error.getResponse();
          throw new BadRequestException({
            code: 'INVALID_ANSWERS',
            message: 'Check the form answers.',
            details,
          });
        }

        const answers = answersForStorage(dto);
        const submission = await tx.submission.upsert({
          where: { organizationId_taskId: { organizationId, taskId } },
          create: { organizationId, taskId, templateVersionId },
          update: {},
        });
        if (submission.templateVersionId !== templateVersionId) {
          throw versionMismatch();
        }

        const previous = await tx.submissionAttempt.findFirst({
          where: { organizationId, submissionId: submission.id },
          orderBy: { attemptNumber: 'desc' },
          select: { attemptNumber: true },
        });
        const attempt = await tx.submissionAttempt.create({
          data: {
            organizationId,
            submissionId: submission.id,
            submittedById: worker.userId,
            clientAttemptId,
            attemptNumber: (previous?.attemptNumber ?? 0) + 1,
            answers,
          },
        });

        const taskStatus = await this.tasks.applyWorkflowEvent(
          { organizationId, taskId, event: 'SUBMITTED' },
          tx,
        );
        return {
          created: true,
          receipt: {
            submissionId: submission.id,
            attemptId: attempt.id,
            clientAttemptId,
            taskId,
            templateVersionId,
            taskStatus,
          },
        };
      },
      { isolationLevel: 'ReadCommitted' },
    );
  }
}
