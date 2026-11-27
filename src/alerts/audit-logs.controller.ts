import { Controller, Get, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuditLogsService } from './audit-logs.service.js';
import { TenantContextService } from './tenant-context.service.js';
import { ListAuditLogsDto } from './dto/audit-log.dto.js';

@Controller('audit-logs')
export class AuditLogsController {
  constructor(
    private readonly auditLogsService: AuditLogsService,
    private readonly tenantContextService: TenantContextService,
  ) {}

  @Get()
  findAll(@Req() req: Request, @Query() query: ListAuditLogsDto) {
    const context = this.tenantContextService.getContext(req);
    return this.auditLogsService.findAll(context, query);
  }
}
