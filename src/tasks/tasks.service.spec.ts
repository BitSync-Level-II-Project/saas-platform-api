import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TasksService } from './tasks.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

const record = {
  id: 'b567a1c8-89ab-4cde-bf01-23456789abcd',
  organizationId: 'local-demo-org',
  createdById: 'local-demo-manager',
  number: 42,
  title: 'Morning equipment check',
  warehouse: 'Colombo',
  location: 'Machine room',
  templateVersionId: 'c1111111-89ab-4cde-bf01-23456789abcd',
  supervisorId: 'supervisor-1',
  dueDate: new Date('2026-11-15'),
  instructions: '',
  status: 'ASSIGNED',
  assigneeType: null,
  assigneeId: null,
  archivedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  templateVersion: {
    id: 'c1111111-89ab-4cde-bf01-23456789abcd',
    templateId: 't1',
    version: 2,
    name: 'Equipment inspection',
  },
};

const assignedToWorker = {
  ...record,
  status: 'IN_PROGRESS',
  assigneeType: 'WORKER',
  assigneeId: 'worker-1',
};

describe('TasksService', () => {
  let service: TasksService;
  let configGet: ReturnType<typeof vi.fn>;
  let prisma: any;

  beforeEach(() => {
    configGet = vi.fn((key: string) => {
      switch (key) {
        case 'NODE_ENV':
          return 'development';
        case 'ENABLE_TASK_DEV_API':
          return 'true';
        case 'DEV_ORGANIZATION_ID':
          return 'local-demo-org';
        case 'DEV_USER_ID':
          return 'local-demo-manager';
        default:
          return undefined;
      }
    });

    prisma = {
      task: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
      templateVersion: { findFirst: vi.fn() },
    };

    service = new TasksService(
      prisma as PrismaService,
      { get: configGet } as unknown as ConfigService,
    );
  });

  it('throws NotFoundException when the task dev API is disabled', async () => {
    configGet.mockImplementation((key: string) =>
      key === 'ENABLE_TASK_DEV_API' ? 'false' : 'development',
    );

    await expect(service.findAll({ page: 1, limit: 10 })).rejects.toThrow(
      NotFoundException,
    );
  });

  describe('create', () => {
    const dto = {
      title: '  Morning equipment check  ',
      warehouse: 'Colombo',
      location: 'Machine room',
      templateVersionId: record.templateVersionId,
      supervisorId: 'supervisor-1',
      dueDate: '2026-11-15',
    };

    it('rejects a template version that is not published for this organization', async () => {
      prisma.templateVersion.findFirst.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      expect(prisma.task.create).not.toHaveBeenCalled();
    });

    it('links the published version and returns code, status and template name', async () => {
      prisma.templateVersion.findFirst.mockResolvedValue({ id: record.templateVersionId });
      prisma.task.create.mockResolvedValue(record);

      const result = await service.create(dto);

      expect(prisma.task.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Morning equipment check',
            organizationId: 'local-demo-org',
            templateVersionId: record.templateVersionId,
            supervisorId: 'supervisor-1',
          }),
        }),
      );
      expect(result.code).toBe('TSK-1042');
      expect(result.status).toBe('Assigned');
      expect(result.templateName).toBe('Equipment inspection');
      expect(result.dueDate).toBe('2026-11-15');
    });
  });

  it('throws NotFoundException for a missing task', async () => {
    prisma.task.findFirst.mockResolvedValue(null);

    await expect(service.findOne(record.id)).rejects.toThrow(NotFoundException);
  });

  describe('assignment', () => {
    it('assigns a worker by ID', async () => {
      prisma.task.findFirst.mockResolvedValue(record);
      prisma.task.update.mockResolvedValue({
        ...record,
        assigneeType: 'WORKER',
        assigneeId: 'worker-1',
      });

      const result = await service.assign(record.id, {
        assigneeType: 'WORKER',
        assigneeId: 'worker-1',
      });

      expect(result.assigneeType).toBe('Worker');
      expect(result.assigneeId).toBe('worker-1');
    });

    it('does not allow changing the assignee while the task is In review', async () => {
      prisma.task.findFirst.mockResolvedValue({ ...record, status: 'IN_REVIEW' });

      await expect(
        service.assign(record.id, { assigneeType: 'WORKER', assigneeId: 'worker-2' }),
      ).rejects.toThrow(ConflictException);
      expect(prisma.task.update).not.toHaveBeenCalled();
    });
  });

  it('archives a task by setting archivedAt', async () => {
    prisma.task.findFirst.mockResolvedValue(record);
    prisma.task.update.mockResolvedValue({ ...record, archivedAt: new Date() });

    const result = await service.archive(record.id);

    expect(prisma.task.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { archivedAt: expect.any(Date) },
      }),
    );
    expect(result.success).toBe(true);
  });

  describe('getSubmissionContext', () => {
    it('returns the IDs and status the submission module needs', async () => {
      prisma.task.findFirst.mockResolvedValue(assignedToWorker);

      const result = await service.getSubmissionContext({
        organizationId: 'local-demo-org',
        taskId: record.id,
        workerId: 'worker-1',
      });

      expect(result).toEqual({
        taskId: record.id,
        organizationId: 'local-demo-org',
        assignedWorkerId: 'worker-1',
        assigneeType: 'WORKER',
        supervisorId: 'supervisor-1',
        templateVersionId: record.templateVersionId,
        status: 'IN_PROGRESS',
      });
    });

    it('throws NotFoundException when the task does not exist', async () => {
      prisma.task.findFirst.mockResolvedValue(null);

      await expect(
        service.getSubmissionContext({ organizationId: 'local-demo-org', taskId: record.id }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when the task is assigned to another worker', async () => {
      prisma.task.findFirst.mockResolvedValue(assignedToWorker);

      await expect(
        service.getSubmissionContext({
          organizationId: 'local-demo-org',
          taskId: record.id,
          workerId: 'worker-2',
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('uses the transaction client when one is passed', async () => {
      const tx = { task: { findFirst: vi.fn().mockResolvedValue(assignedToWorker) } };

      await service.getSubmissionContext(
        { organizationId: 'local-demo-org', taskId: record.id },
        tx as any,
      );

      expect(tx.task.findFirst).toHaveBeenCalled();
      expect(prisma.task.findFirst).not.toHaveBeenCalled();
    });
  });

  describe('applyWorkflowEvent', () => {
    it('moves a task to In review when it is submitted', async () => {
      prisma.task.updateMany.mockResolvedValue({ count: 1 });

      const status = await service.applyWorkflowEvent({
        organizationId: 'local-demo-org',
        taskId: record.id,
        event: 'SUBMITTED',
      });

      expect(status).toBe('IN_REVIEW');
      expect(prisma.task.updateMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          id: record.id,
          organizationId: 'local-demo-org',
          status: { in: ['ASSIGNED', 'IN_PROGRESS'] },
        }),
        data: { status: 'IN_REVIEW' },
      });
    });

    it('moves a rejected task back to In progress', async () => {
      prisma.task.updateMany.mockResolvedValue({ count: 1 });

      const status = await service.applyWorkflowEvent({
        organizationId: 'local-demo-org',
        taskId: record.id,
        event: 'REJECTED',
      });

      expect(status).toBe('IN_PROGRESS');
    });

    it('throws ConflictException when the current status does not allow the event', async () => {
      prisma.task.updateMany.mockResolvedValue({ count: 0 });
      prisma.task.findFirst.mockResolvedValue({ status: 'IN_PROGRESS' });

      await expect(
        service.applyWorkflowEvent({
          organizationId: 'local-demo-org',
          taskId: record.id,
          event: 'APPROVED',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('throws NotFoundException when the task does not exist', async () => {
      prisma.task.updateMany.mockResolvedValue({ count: 0 });
      prisma.task.findFirst.mockResolvedValue(null);

      await expect(
        service.applyWorkflowEvent({
          organizationId: 'local-demo-org',
          taskId: record.id,
          event: 'SUBMITTED',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});