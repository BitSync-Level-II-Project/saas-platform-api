import { Body, Controller, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { EventsService } from './events.service.js';
import { TenantContextService } from './tenant-context.service.js';
import { IngestEventDto } from './dto/event.dto.js';

@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly tenantContextService: TenantContextService,
  ) {}

  @Post()
  ingest(@Req() req: Request, @Body() dto: IngestEventDto) {
    const context = this.tenantContextService.getContext(req);
    return this.eventsService.ingest(context, dto);
  }
}
