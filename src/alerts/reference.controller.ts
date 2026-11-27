import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ReferenceService } from './reference.service.js';
import { TenantContextService } from './tenant-context.service.js';

@Controller('reference')
export class ReferenceController {
  constructor(
    private readonly referenceService: ReferenceService,
    private readonly tenantContextService: TenantContextService,
  ) {}

  @Get()
  getReference(@Req() req: Request) {
    const context = this.tenantContextService.getContext(req);
    return this.referenceService.getReference(context);
  }
}
