import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { AlertsService } from './alerts.service.js';
import { TenantContextService } from './tenant-context.service.js';
import { ActOnAlertDto, ListAlertsDto } from './dto/alert.dto.js';

@Controller('alerts')
export class AlertsController {
  constructor(
    private readonly alertsService: AlertsService,
    private readonly tenantContextService: TenantContextService,
  ) {}

  @Get()
  findAll(@Req() req: Request, @Query() query: ListAlertsDto) {
    const context = this.tenantContextService.getContext(req);
    return this.alertsService.findAll(context, query);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    const context = this.tenantContextService.getContext(req);
    return this.alertsService.findOne(context, id);
  }

  @Post(':id/acknowledge')
  acknowledge(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: ActOnAlertDto,
  ) {
    const context = this.tenantContextService.getContext(req);
    return this.alertsService.actOnAlert(context, id, 'acknowledge', dto?.note);
  }

  @Post(':id/escalate')
  escalate(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: ActOnAlertDto,
  ) {
    const context = this.tenantContextService.getContext(req);
    return this.alertsService.actOnAlert(context, id, 'escalate', dto?.note);
  }

  @Post(':id/resolve')
  resolve(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: ActOnAlertDto,
  ) {
    const context = this.tenantContextService.getContext(req);
    return this.alertsService.actOnAlert(context, id, 'resolve', dto?.note);
  }
}
