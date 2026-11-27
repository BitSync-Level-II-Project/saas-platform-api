import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditLogsService } from './audit-logs.service.js';
import { NotificationsService } from './notifications.service.js';
import {
  alertMessage,
  evaluate,
  getByPath,
  notifyOf,
} from './engine/rule-evaluator.js';
import type { TenantContext } from './types.js';
import type { IngestEventDto, IngestResultDto } from './dto/event.dto.js';
import type { Prisma } from '../generated/prisma/client.js';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async ingest(
    context: TenantContext,
    dto: IngestEventDto,
  ): Promise<IngestResultDto> {
    // 1. Deduplication check
    const existing = await this.prisma.operationalEvent.findUnique({
      where: {
        organizationId_clientEventId: {
          organizationId: context.organizationId,
          clientEventId: dto.clientEventId,
        },
      },
    });

    if (existing) {
      return {
        id: existing.id,
        duplicate: true,
        alertsCreated: [],
      };
    }

    // 2. Persist event as RECEIVED
    const occurredAt = dto.occurredAt ? new Date(dto.occurredAt) : new Date();

    const event = await this.prisma.operationalEvent.create({
      data: {
        organizationId: context.organizationId,
        clientEventId: dto.clientEventId,
        sourceType: dto.sourceType,
        deviceId: dto.deviceId,
        userId: dto.userId ?? context.userId,
        siteId: dto.siteId,
        locationId: dto.locationId,
        templateId: dto.templateId,
        payload: dto.payload as Prisma.InputJsonValue,
        status: 'RECEIVED',
        occurredAt,
      },
    });

    await this.auditLogsService.log({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorName: context.userName,
      actorRole: context.userRole,
      action: 'EVENT_RECEIVED',
      resourceType: 'OperationalEvent',
      resourceId: event.id,
    });

    // 3. Process rules
    const alertsCreated: string[] = [];

    try {
      const activeRules = await this.prisma.automationRule.findMany({
        where: {
          organizationId: context.organizationId,
          enabled: true,
          deletedAt: null,
          ...(dto.siteId ? { OR: [{ siteId: null }, { siteId: dto.siteId }] } : { siteId: null }),
        },
      });

      for (const rule of activeRules) {
        // Location filter check
        if (rule.locationId && rule.locationId !== dto.locationId) continue;
        // Template filter check
        if (rule.templateId && rule.templateId !== dto.templateId) continue;

        const rawVal = getByPath(dto.payload, rule.fieldKey);
        if (rawVal == null) continue;

        const val = Number(rawVal);
        if (Number.isNaN(val)) continue;

        const matches = evaluate(
          {
            operator: rule.operator as any,
            thresholdValue: rule.thresholdValue,
            thresholdMax: rule.thresholdMax,
          },
          val,
        );

        if (!matches) continue;

        // Cooldown check
        if (rule.cooldownMinutes > 0) {
          const cooldownSince = new Date(
            Date.now() - rule.cooldownMinutes * 60 * 1000,
          );

          const existingAlert = await this.prisma.alert.findFirst({
            where: {
              organizationId: context.organizationId,
              ruleId: rule.id,
              deviceId: dto.deviceId ?? undefined,
              locationId: dto.locationId ?? undefined,
              status: { not: 'RESOLVED' },
              createdAt: { gte: cooldownSince },
            },
          });

          if (existingAlert) {
            continue; // Suppress alert because cooldown window is active
          }
        }

        // Trigger Alert
        const title = rule.name;
        const message = alertMessage(
          {
            operator: rule.operator as any,
            thresholdValue: rule.thresholdValue,
            thresholdMax: rule.thresholdMax,
            fieldKey: rule.fieldKey,
          },
          val,
        );

        const alert = await this.prisma.alert.create({
          data: {
            organizationId: context.organizationId,
            title,
            message,
            severity: rule.severity,
            status: 'NEW',
            ruleId: rule.id,
            eventId: event.id,
            siteId: dto.siteId,
            locationId: dto.locationId,
            deviceId: dto.deviceId,
            escalationLevel: 0,
          },
        });

        await this.prisma.alertAction.create({
          data: {
            organizationId: context.organizationId,
            alertId: alert.id,
            action: 'CREATED',
            actorName: 'System',
            actorRole: 'SYSTEM',
          },
        });

        await this.auditLogsService.log({
          organizationId: context.organizationId,
          action: 'ALERT_CREATED',
          resourceType: 'Alert',
          resourceId: alert.id,
          after: alert,
        });

        // Dispatch notifications
        const targets =
          notifyOf({
            notify: rule.notify as any,
            severity: rule.severity as any,
          }) === 'SUPERVISOR_MANAGER'
            ? ['u-supervisor', 'u-manager']
            : ['u-supervisor'];

        for (const recipientId of targets) {
          await this.notificationsService.notify({
            organizationId: context.organizationId,
            recipientId,
            type: 'ALERT_CREATED',
            title: alert.title,
            body: alert.message,
            severity: alert.severity as any,
            alertId: alert.id,
          });
        }

        alertsCreated.push(alert.id);
      }

      // Mark event as PROCESSED
      await this.prisma.operationalEvent.update({
        where: { id: event.id },
        data: { status: 'PROCESSED' },
      });

      await this.auditLogsService.log({
        organizationId: context.organizationId,
        action: 'EVENT_PROCESSED',
        resourceType: 'OperationalEvent',
        resourceId: event.id,
      });

      return {
        id: event.id,
        duplicate: false,
        alertsCreated,
      };
    } catch (err: any) {
      this.logger.error(Failed to process event : );

      await this.prisma.operationalEvent.update({
        where: { id: event.id },
        data: { status: 'FAILED', error: String(err) },
      });

      await this.auditLogsService.log({
        organizationId: context.organizationId,
        action: 'EVENT_FAILED',
        resourceType: 'OperationalEvent',
        resourceId: event.id,
        outcome: 'FAILURE',
      });

      return {
        id: event.id,
        duplicate: false,
        alertsCreated: [],
        failed: true,
      };
    }
  }
}
