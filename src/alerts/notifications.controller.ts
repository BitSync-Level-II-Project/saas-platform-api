import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { NotificationsService } from './notifications.service.js';
import { TenantContextService } from './tenant-context.service.js';
import {
  ListNotificationsDto,
  UpdatePreferencesDto,
} from './dto/notification.dto.js';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly tenantContextService: TenantContextService,
  ) {}

  @Get()
  findAll(@Req() req: Request, @Query() query: ListNotificationsDto) {
    const context = this.tenantContextService.getContext(req);
    return this.notificationsService.findAll(context, query);
  }

  @Get('unread-count')
  getUnreadCount(@Req() req: Request) {
    const context = this.tenantContextService.getContext(req);
    return this.notificationsService.getUnreadCount(context);
  }

  @Patch(':id/read')
  markRead(@Req() req: Request, @Param('id') id: string) {
    const context = this.tenantContextService.getContext(req);
    return this.notificationsService.markRead(context, id);
  }

  @Patch('read-all')
  markAllRead(@Req() req: Request) {
    const context = this.tenantContextService.getContext(req);
    return this.notificationsService.markAllRead(context);
  }

  @Get('preferences')
  getPreferences(@Req() req: Request) {
    const context = this.tenantContextService.getContext(req);
    return this.notificationsService.getPreferences(context);
  }

  @Put('preferences')
  updatePreferences(
    @Req() req: Request,
    @Body() dto: UpdatePreferencesDto,
  ) {
    const context = this.tenantContextService.getContext(req);
    return this.notificationsService.updatePreferences(context, dto);
  }
}
