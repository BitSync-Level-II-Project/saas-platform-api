import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuditLogsService } from './audit-logs.service.js';
import { notifyOf } from './engine/rule-evaluator.js';
import type { Page, TenantContext } from './types.js';
import type {
  CreateRuleDto,
  ListRulesDto,
  UpdateRuleDto,
} from './dto/rule.dto.js';
import type { Prisma } from '../generated/prisma/client.js';

@Injectable()
export class AutomationRulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  async create(context: TenantContext, dto: CreateRuleDto) {
    const rule = await this.prisma.automationRule.create({
      data: {
        organizationId: context.organizationId,
        createdById: context.userId,
        name: dto.name,
        description: dto.description ?? '',
        siteId: dto.siteId,
        locationId: dto.locationId,
        templateId: dto.templateId,
        fieldKey: dto.fieldKey,
        operator: dto.operator,
        thresholdValue: dto.thresholdValue,
        thresholdMax: dto.thresholdMax,
        severity: dto.severity,
        notify: notifyOf(dto),
        enabled: dto.enabled ?? true,
        cooldownMinutes: dto.cooldownMinutes ?? 15,
      },
    });

    await this.auditLogsService.log({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorName: context.userName,
      actorRole: context.userRole,
      action: 'RULE_CREATED',
      resourceType: 'AutomationRule',
      resourceId: rule.id,
      after: rule,
    });

    return rule;
  }

  async findAll(
    context: TenantContext,
    query: ListRulesDto,
  ): Promise<Page<any>> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.max(1, query.pageSize ?? query.limit ?? 20);
    const skip = (page - 1) * pageSize;

    const where: Prisma.AutomationRuleWhereInput = {
      organizationId: context.organizationId,
      deletedAt: null,
      ...(query.siteId ? { siteId: query.siteId } : {}),
      ...(query.templateId ? { templateId: query.templateId } : {}),
      ...(query.enabled !== undefined ? { enabled: query.enabled } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' as const } },
              { description: { contains: query.search, mode: 'insensitive' as const } },
              { fieldKey: { contains: query.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.automationRule.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.automationRule.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
    };
  }

  async findOne(context: TenantContext, id: string) {
    const rule = await this.prisma.automationRule.findFirst({
      where: {
        id,
        organizationId: context.organizationId,
        deletedAt: null,
      },
    });

    if (!rule) {
      throw new NotFoundException('Automation rule not found.');
    }

    return rule;
  }

  async update(context: TenantContext, id: string, dto: UpdateRuleDto) {
    const existing = await this.findOne(context, id);

    const updated = await this.prisma.automationRule.update({
      where: { id: existing.id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.siteId !== undefined ? { siteId: dto.siteId } : {}),
        ...(dto.locationId !== undefined ? { locationId: dto.locationId } : {}),
        ...(dto.templateId !== undefined ? { templateId: dto.templateId } : {}),
        ...(dto.fieldKey !== undefined ? { fieldKey: dto.fieldKey } : {}),
        ...(dto.operator !== undefined ? { operator: dto.operator } : {}),
        ...(dto.thresholdValue !== undefined ? { thresholdValue: dto.thresholdValue } : {}),
        ...(dto.thresholdMax !== undefined ? { thresholdMax: dto.thresholdMax } : {}),
        ...(dto.severity !== undefined ? { severity: dto.severity } : {}),
        ...(dto.notify !== undefined ? { notify: dto.notify } : {}),
        ...(dto.enabled !== undefined ? { enabled: dto.enabled } : {}),
        ...(dto.cooldownMinutes !== undefined ? { cooldownMinutes: dto.cooldownMinutes } : {}),
      },
    });

    await this.auditLogsService.log({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorName: context.userName,
      actorRole: context.userRole,
      action: 'RULE_UPDATED',
      resourceType: 'AutomationRule',
      resourceId: updated.id,
      before: existing,
      after: updated,
    });

    return updated;
  }

  async setEnabled(context: TenantContext, id: string, enabled: boolean) {
    const existing = await this.findOne(context, id);

    const updated = await this.prisma.automationRule.update({
      where: { id: existing.id },
      data: { enabled },
    });

    await this.auditLogsService.log({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorName: context.userName,
      actorRole: context.userRole,
      action: enabled ? 'RULE_ENABLED' : 'RULE_DISABLED',
      resourceType: 'AutomationRule',
      resourceId: updated.id,
      before: existing,
      after: updated,
    });

    return updated;
  }

  async remove(context: TenantContext, id: string, reason?: string) {
    const existing = await this.findOne(context, id);

    await this.prisma.automationRule.update({
      where: { id: existing.id },
      data: { deletedAt: new Date() },
    });

    await this.auditLogsService.log({
      organizationId: context.organizationId,
      actorId: context.userId,
      actorName: context.userName,
      actorRole: context.userRole,
      action: 'RULE_DELETED',
      resourceType: 'AutomationRule',
      resourceId: existing.id,
      before: existing,
      after: { reason },
    });

    return { ok: true as const };
  }
}
