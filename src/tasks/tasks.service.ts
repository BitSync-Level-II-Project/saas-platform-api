import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';
import type { Prisma } from '../generated/prisma/client.js';
import type { TaskStatus } from '../generated/prisma/enums.js';
import type { AssignTaskDto } from './dto/assign-task.dto.js';
import type { CreateTaskDto } from './dto/create-task.dto.js';
import type { ListTasksDto } from './dto/list-tasks.dto.js';
import type { UpdateTaskDto } from './dto/update-task.dto.js';
import type { TaskSubmissionContext, TaskWorkflowEvent } from './tasks.types.js';

const STATUS_LABEL = {
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In progress',
  IN_REVIEW: 'In review',
  COMPLETE: 'Complete',
} as const;

const ASSIGNEE_LABEL = {
  WORKER: 'Worker',
  STATIONED_PHONE: 'Stationed phone',
} as const;

// Single source of truth for the review workflow.
// Worker submits -> In review. Approve -> Complete. Reject -> In progress.
// A new attempt after a reject is SUBMITTED again (In progress -> In review).
const WORKFLOW: Record<TaskWorkflowEvent, { from: TaskStatus[]; to: TaskStatus }> = {
  SUBMITTED: { from: ['ASSIGNED', 'IN_PROGRESS'], to: 'IN_REVIEW' },
  APPROVED: { from: ['IN_REVIEW'], to: 'COMPLETE' },
  REJECTED: { from: ['IN_REVIEW'], to: 'IN_PROGRESS' },
};

const TASK_INCLUDE = {
  templateVersion: {
    select: { id: true, templateId: true, version: true, name: true },
  },
} satisfies Prisma.TaskInclude;

type TaskWithVersion = Prisma.TaskGetPayload<{ include: typeof TASK_INCLUDE }>;

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private getDevelopmentContext() {
    const enabled =
      this.config.get<string>('NODE_ENV') === 'development' &&
      this.config.get<string>('ENABLE_TASK_DEV_API') === 'true';

    if (!enabled) {
      throw new NotFoundException();
    }

    const organizationId = this.config.get<string>('DEV_ORGANIZATION_ID')?.trim();
    const userId = this.config.get<string>('DEV_USER_ID')?.trim();

    if (!organizationId || !userId) {
      throw new ServiceUnavailableException(
        'Task development context is not configured.',
      );
    }

    return { organizationId, userId };
  }

  private toResponse(task: TaskWithVersion) {
    return {
      id: task.id,
      code: `TSK-${1000 + task.number}`,
      title: task.title,
      warehouse: task.warehouse,
      location: task.location,
      templateVersionId: task.templateVersionId,
      templateName: task.templateVersion.name,
      templateVersion: task.templateVersion.version,
      supervisorId: task.supervisorId,
      dueDate: task.dueDate.toISOString().slice(0, 10),
      instructions: task.instructions,
      status: STATUS_LABEL[task.status],
      assigneeType: task.assigneeType ? ASSIGNEE_LABEL[task.assigneeType] : null,
      assigneeId: task.assigneeId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }

  private async getRecord(id: string, organizationId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, organizationId, archivedAt: null },
      include: TASK_INCLUDE,
    });

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" was not found.`);
    }

    return task;
  }

  // The version must exist and belong to this organization (it exists only if published)
  private async assertPublishedVersion(
    organizationId: string,
    templateVersionId: string,
  ) {
    const version = await this.prisma.templateVersion.findFirst({
      where: { id: templateVersionId, organizationId },
      select: { id: true },
    });

    if (!version) {
      throw new BadRequestException('Published template version was not found.');
    }
  }

  private assertAssigneeEditable(task: { status: TaskStatus }) {
    if (task.status === 'IN_REVIEW' || task.status === 'COMPLETE') {
      throw new ConflictException(
        'The assignee cannot be changed while the task is In review or Complete.',
      );
    }
  }

  // 1. Create a task
  async create(dto: CreateTaskDto) {
    const context = this.getDevelopmentContext();
    await this.assertPublishedVersion(context.organizationId, dto.templateVersionId);

    const task = await this.prisma.task.create({
      data: {
        organizationId: context.organizationId,
        createdById: context.userId,
        title: dto.title.trim(),
        warehouse: dto.warehouse.trim(),
        location: dto.location.trim(),
        templateVersionId: dto.templateVersionId,
        supervisorId: dto.supervisorId.trim(),
        dueDate: new Date(dto.dueDate),
        instructions: dto.instructions?.trim() ?? '',
        status: 'ASSIGNED',
      },
      include: TASK_INCLUDE,
    });

    return this.toResponse(task);
  }

  // 2. List tasks with search, status filter and pagination
  async findAll(query: ListTasksDto) {
    const context = this.getDevelopmentContext();
    const { page, limit, search, status } = query;

    // "TSK-1042" or "1042" style search matches the task code
    const codeMatch = search?.match(/^(?:tsk-?)?(\d{4,})$/i);
    const codeNumber = codeMatch ? Number(codeMatch[1]) - 1000 : undefined;

    const where = {
      organizationId: context.organizationId,
      archivedAt: null,
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' as const } },
              { warehouse: { contains: search, mode: 'insensitive' as const } },
              { location: { contains: search, mode: 'insensitive' as const } },
              {
                templateVersion: {
                  name: { contains: search, mode: 'insensitive' as const },
                },
              },
              ...(codeNumber !== undefined && codeNumber > 0
                ? [{ number: codeNumber }]
                : []),
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.task.count({ where }),
      this.prisma.task.findMany({
        where,
        include: TASK_INCLUDE,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      items: items.map((t) => this.toResponse(t)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 3. Get one task
  async findOne(id: string) {
    const context = this.getDevelopmentContext();
    return this.toResponse(await this.getRecord(id, context.organizationId));
  }

  // 4. Edit a task (status is not editable here)
  async update(id: string, dto: UpdateTaskDto) {
    const context = this.getDevelopmentContext();
    await this.getRecord(id, context.organizationId);

    const task = await this.prisma.task.update({
      where: {
        id_organizationId: { id, organizationId: context.organizationId },
      },
      data: {
        ...(dto.title !== undefined ? { title: dto.title.trim() } : {}),
        ...(dto.supervisorId !== undefined
          ? { supervisorId: dto.supervisorId.trim() }
          : {}),
        ...(dto.dueDate !== undefined ? { dueDate: new Date(dto.dueDate) } : {}),
        ...(dto.instructions !== undefined
          ? { instructions: dto.instructions.trim() }
          : {}),
      },
      include: TASK_INCLUDE,
    });

    return this.toResponse(task);
  }

  // 5. Assign a worker or stationed phone
  async assign(id: string, dto: AssignTaskDto) {
    const context = this.getDevelopmentContext();
    this.assertAssigneeEditable(await this.getRecord(id, context.organizationId));

    const task = await this.prisma.task.update({
      where: {
        id_organizationId: { id, organizationId: context.organizationId },
      },
      data: { assigneeType: dto.assigneeType, assigneeId: dto.assigneeId.trim() },
      include: TASK_INCLUDE,
    });

    return this.toResponse(task);
  }

  // 6. Unassign
  async unassign(id: string) {
    const context = this.getDevelopmentContext();
    this.assertAssigneeEditable(await this.getRecord(id, context.organizationId));

    const task = await this.prisma.task.update({
      where: {
        id_organizationId: { id, organizationId: context.organizationId },
      },
      data: { assigneeType: null, assigneeId: null },
      include: TASK_INCLUDE,
    });

    return this.toResponse(task);
  }

  // 7. Archive (soft delete, so history is kept)
  async archive(id: string) {
    const context = this.getDevelopmentContext();
    await this.getRecord(id, context.organizationId);

    await this.prisma.task.update({
      where: {
        id_organizationId: { id, organizationId: context.organizationId },
      },
      data: { archivedAt: new Date() },
    });

    return {
      success: true,
      message: `Task with ID "${id}" was archived.`,
    };
  }

  // ---------------------------------------------------------------------
  // Internal methods for the submission module (not exposed over HTTP).
  // Pass the same `tx` from prisma.$transaction so the task status change
  // and the submission/review save succeed or fail together.
  // ---------------------------------------------------------------------

  // Returns what the submission service needs. Throws NotFoundException if the
  // task does not exist in this organization, and ForbiddenException if a
  // workerId is given and the task is not assigned to that worker.
  async getSubmissionContext(
    params: { organizationId: string; taskId: string; workerId?: string },
    tx?: Prisma.TransactionClient,
  ): Promise<TaskSubmissionContext> {
    const db: Prisma.TransactionClient = tx ?? this.prisma;

    const task = await db.task.findFirst({
      where: {
        id: params.taskId,
        organizationId: params.organizationId,
        archivedAt: null,
      },
      select: {
        id: true,
        organizationId: true,
        assigneeType: true,
        assigneeId: true,
        supervisorId: true,
        templateVersionId: true,
        status: true,
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID "${params.taskId}" was not found.`);
    }

    const assignedWorkerId = task.assigneeType === 'WORKER' ? task.assigneeId : null;

    if (params.workerId !== undefined && assignedWorkerId !== params.workerId) {
      throw new ForbiddenException('This task is not assigned to the worker.');
    }

    return {
      taskId: task.id,
      organizationId: task.organizationId,
      assignedWorkerId,
      assigneeType: task.assigneeType,
      supervisorId: task.supervisorId,
      templateVersionId: task.templateVersionId,
      status: task.status,
    };
  }

  // Moves the task along the workflow. The update only happens if the current
  // status allows the event, so a double submit or double approve gets a 409.
  async applyWorkflowEvent(
    params: { organizationId: string; taskId: string; event: TaskWorkflowEvent },
    tx?: Prisma.TransactionClient,
  ): Promise<TaskStatus> {
    const db: Prisma.TransactionClient = tx ?? this.prisma;
    const rule = WORKFLOW[params.event];

    const result = await db.task.updateMany({
      where: {
        id: params.taskId,
        organizationId: params.organizationId,
        archivedAt: null,
        status: { in: rule.from },
      },
      data: { status: rule.to },
    });

    if (result.count === 0) {
      const current = await db.task.findFirst({
        where: {
          id: params.taskId,
          organizationId: params.organizationId,
          archivedAt: null,
        },
        select: { status: true },
      });

      if (!current) {
        throw new NotFoundException(`Task with ID "${params.taskId}" was not found.`);
      }

      throw new ConflictException(
        `A task that is ${STATUS_LABEL[current.status]} cannot accept the ${params.event} event.`,
      );
    }

    return rule.to;
  }
}