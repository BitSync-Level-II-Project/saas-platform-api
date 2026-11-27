import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditLogsService } from './audit-logs.service.js';
import type {
  NotifStatus,
  Severity,
  TenantContext,
} from './types.js';
import type {
  ListNotificationsDto,
  UpdatePreferencesDto,
} from './dto/notification.dto.js';

const severityOrder: Record<Severity, number> = {
  INFO: 0, LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4,
};

export interface CreateNotificationParams {
  organizationId: string;
  recipientId: string;
  type: string;
  title: string;
  body: string;
  severity?: Severity;
  alertId?: string;
  status?: NotifStatus;
}

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async notify(params: CreateNotificationParams) {
    const preferences = await this.prisma.notificationPreference.findUnique({
      where: {
        organizationId_userId: {
          organizationId: params.organizationId,
          userId: params.recipientId,
        },
      },
    });
    if (preferences && (!preferences.inAppEnabled ||
      severityOrder[params.severity ?? 'INFO'] < severityOrder[preferences.minSeverity])) {
      return null;
    }

    const notification = await this.prisma.appNotification.create({
      data: {
        organizationId: params.organizationId,
        recipientId: params.recipientId,
        type: params.type,
        title: params.title,
        body: params.body,
        severity: params.severity,
        alertId: params.alertId,
        status: params.status ?? 'DELIVERED',
      },
    });

    await this.auditLogsService.log({
      organizationId: params.organizationId,
      action: 'NOTIFICATION_GENERATED',
      resourceType: 'Notification',
      resourceId: notification.id,
      after: notification,
    });

    return notification;
  }

  async findAll(context: TenantContext, query: ListNotificationsDto) {
    const limit = Math.max(1, query.pageSize ?? query.limit ?? 20);

    return this.prisma.appNotification.findMany({
      where: {
        organizationId: context.organizationId,
        recipientId: context.userId,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getUnreadCount(context: TenantContext): Promise<{ count: number }> {
    const count = await this.prisma.appNotification.count({
      where: {
        organizationId: context.organizationId,
        recipientId: context.userId,
        readAt: null,
      },
    });

    return { count };
  }

  async markRead(context: TenantContext, id: string): Promise<{ ok: true }> {
    const { count } = await this.prisma.appNotification.updateMany({
      where: {
        id,
        organizationId: context.organizationId,
        recipientId: context.userId,
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    if (count) {
      await this.auditLogsService.log({
        organizationId: context.organizationId,
        actorId: context.userId,
        actorName: context.userName,
        actorRole: context.userRole,
        action: 'NOTIFICATION_READ',
        resourceType: 'Notification',
        resourceId: id,
      });
    }

    return { ok: true };
  }

  async markAllRead(context: TenantContext): Promise<{ ok: true }> {
    await this.prisma.appNotification.updateMany({
      where: {
        organizationId: context.organizationId,
        recipientId: context.userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return { ok: true };
  }

  async getPreferences(context: TenantContext) {
    return this.prisma.notificationPreference.upsert({
      where: {
        organizationId_userId: {
          organizationId: context.organizationId,
          userId: context.userId,
        },
      },
      create: { organizationId: context.organizationId, userId: context.userId },
      update: {},
    });
  }

  async updatePreferences(
    context: TenantContext,
    dto: UpdatePreferencesDto,
  ) {
    return this.prisma.notificationPreference.upsert({
      where: {
        organizationId_userId: {
          organizationId: context.organizationId,
          userId: context.userId,
        },
      },
      create: {
        organizationId: context.organizationId,
        userId: context.userId,
        emailEnabled: dto.emailEnabled ?? true,
        inAppEnabled: dto.inAppEnabled ?? true,
        minSeverity: dto.minSeverity ?? 'INFO',
      },
      update: {
        ...(dto.emailEnabled !== undefined ? { emailEnabled: dto.emailEnabled } : {}),
        ...(dto.inAppEnabled !== undefined ? { inAppEnabled: dto.inAppEnabled } : {}),
        ...(dto.minSeverity !== undefined ? { minSeverity: dto.minSeverity } : {}),
      },
    });
  }
}
