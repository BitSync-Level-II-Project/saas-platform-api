import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditLogsService } from './audit-logs.service.js';
import { NotificationsService } from './notifications.service.js';
import type {
  AlertActionName,
  AlertStatus,
  Page,
  TenantContext,
} from './types.js';
import type { ListAlertsDto } from './dto/alert.dto.js';

const ALLOWED_MOVES: Record<
  AlertActionName,
  { from: AlertStatus[]; to: AlertStatus }
> = {
  acknowledge: { from: ['NEW'], to: 'ACKNOWLEDGED' },
  resolve: { from: ['NEW', 'ACKNOWLEDGED', 'ESCALATED'], to: 'RESOLVED' },
  escalate: { from: ['NEW', 'ACKNOWLEDGED'], to: 'ESCALATED' },
};

@Injectable()
export class AlertsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(
    context: TenantContext,
    query: ListAlertsDto,
  ): Promise<Page<any>> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.max(1, query.pageSize ?? query.limit ?? 20);
    const skip = (page - 1) * pageSize;

    const where: Prisma.AlertWhereInput = {
      organizationId: context.organizationId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.severity ? { severity: query.severity } : {}),
      ...(query.siteId ? { siteId: query.siteId } : {}),
      ...(query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' as const } },
              { message: { contains: query.search, mode: 'insensitive' as const } },
              { locationId: { contains: query.search, mode: 'insensitive' as const } },
              { deviceId: { contains: query.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.alert.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.alert.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
    };
  }

  async findOne(context: TenantContext, id: string) {
    const alert = await this.prisma.alert.findFirst({
      where: {
        id,
        organizationId: context.organizationId,
      },
      include: {
        rule: true,
        event: true,
        actions: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!alert) {
      throw new NotFoundException('Alert not found.');
    }

    return alert;
  }

  async actOnAlert(
    context: TenantContext,
    id: string,
    action: AlertActionName,
    note?: string,
  ) {
    const alert = await this.prisma.alert.findFirst({
      where: {
        id,
        organizationId: context.organizationId,
      },
    });

    if (!alert) {
      throw new NotFoundException('Alert not found.');
    }

    const move = ALLOWED_MOVES[action];
    if (!move || !move.from.includes(alert.status as AlertStatus)) {
      throw new ConflictException(
        `Cannot ${action} an alert with status ${alert.status}.`,
      );
    }

    if (action === 'resolve' && (!note || !note.trim())) {
      throw new BadRequestException('A note is required when resolving an alert.');
    }

    if (action === 'escalate' && (!note || !note.trim())) {
      throw new BadRequestException('A reason is required when escalating an alert.');
    }

    const actionCode =
      action === 'acknowledge'
        ? 'ALERT_ACKNOWLEDGED'
        : action === 'escalate'
          ? 'ALERT_ESCALATED'
          : 'ALERT_RESOLVED';

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedAlert = await tx.alert.update({
        where: { id: alert.id, status: alert.status },
        data: {
          status: move.to,
          ...(action === 'escalate' ? { escalationLevel: { increment: 1 } } : {}),
        },
      }).catch((error: unknown) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
          throw new ConflictException('The alert changed. Refresh it and try again.');
        }
        throw error;
      });

      await tx.alertAction.create({
        data: {
          organizationId: context.organizationId,
          alertId: alert.id,
          action: action.toUpperCase(),
          actorId: context.userId,
          actorName: context.userName,
          actorRole: context.userRole,
          note: note?.trim(),
        },
      });

      await this.auditLogsService.log({
        organizationId: context.organizationId,
        actorId: context.userId,
        actorName: context.userName,
        actorRole: context.userRole,
        action: actionCode,
        resourceType: 'Alert',
        resourceId: alert.id,
        before: alert,
        after: updatedAlert,
      }, tx);

      return updatedAlert;
    });


    // Send notifications on escalation or resolution
    if (action === 'escalate') {
      await this.notificationsService.notify({
        organizationId: context.organizationId,
        recipientId: 'u-manager',
        type: 'ALERT_ESCALATED',
        title: `${updated.title} escalated`,
        body: `Escalated by ${context.userName}: ${note?.trim()}`,
        severity: updated.severity as any,
        alertId: updated.id,
      });
    } else if (action === 'resolve') {
      await this.notificationsService.notify({
        organizationId: context.organizationId,
        recipientId: 'u-supervisor',
        type: 'ALERT_RESOLVED',
        title: `${updated.title} resolved`,
        body: `Resolved by ${context.userName}: ${note?.trim()}`,
        severity: updated.severity as any,
        alertId: updated.id,
      });
    }

    return updated;
  }
}
