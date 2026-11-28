import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AuditOutcome, Page, TenantContext } from './types.js';
import type { ListAuditLogsDto } from './dto/audit-log.dto.js';
import type { Prisma } from '../generated/prisma/client.js';

export interface AuditLogEntry {
  organizationId: string;
  actorId?: string;
  actorName?: string;
  actorRole?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  outcome?: AuditOutcome;
  before?: unknown;
  after?: unknown;
}

@Injectable()
export class AuditLogsService {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(entry: AuditLogEntry, transaction?: Prisma.TransactionClient) {
    try {
      return await (transaction ?? this.prisma).auditLog.create({
        data: {
          organizationId: entry.organizationId,
          actorId: entry.actorId,
          actorName: entry.actorName ?? 'System',
          actorRole: entry.actorRole ?? 'SYSTEM',
          action: entry.action,
          resourceType: entry.resourceType,
          resourceId: entry.resourceId,
          outcome: entry.outcome ?? 'SUCCESS',
          before: entry.before === undefined ? undefined : (entry.before as Prisma.InputJsonValue),
          after: entry.after === undefined ? undefined : (entry.after as Prisma.InputJsonValue),
        },
      });
    } catch (error) {
      if (transaction) throw error;
      this.logger.error(
        `Audit write failed for ${entry.action} on ${entry.resourceType} ${entry.resourceId}`,
        String(error),
      );
      return null;
    }
  }

  async findAll(
    context: TenantContext,
    query: ListAuditLogsDto,
  ): Promise<Page<any>> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.max(1, query.pageSize ?? query.limit ?? 20);
    const skip = (page - 1) * pageSize;

    const where: Prisma.AuditLogWhereInput = {
      organizationId: context.organizationId,
      ...(query.action ? { action: query.action } : {}),
      ...(query.resourceType ? { resourceType: query.resourceType } : {}),
      ...(query.search
        ? {
            OR: [
              { action: { contains: query.search, mode: 'insensitive' as const } },
              { actorName: { contains: query.search, mode: 'insensitive' as const } },
              { resourceId: { contains: query.search, mode: 'insensitive' as const } },
              { resourceType: { contains: query.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
    };
  }
}
