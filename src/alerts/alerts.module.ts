import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { TenantContextService } from './tenant-context.service.js';
import { AuditLogsService } from './audit-logs.service.js';
import { AuditLogsController } from './audit-logs.controller.js';
import { NotificationsService } from './notifications.service.js';
import { NotificationsController } from './notifications.controller.js';
import { AutomationRulesService } from './automation-rules.service.js';
import { AutomationRulesController } from './automation-rules.controller.js';
import { AlertsService } from './alerts.service.js';
import { AlertsController } from './alerts.controller.js';
import { EventsService } from './events.service.js';
import { EventsController } from './events.controller.js';
import { ReferenceService } from './reference.service.js';
import { ReferenceController } from './reference.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [
    AlertsController,
    AutomationRulesController,
    EventsController,
    NotificationsController,
    AuditLogsController,
    ReferenceController,
  ],
  providers: [
    TenantContextService,
    AuditLogsService,
    NotificationsService,
    AutomationRulesService,
    AlertsService,
    EventsService,
    ReferenceService,
  ],
  exports: [
    AlertsService,
    AutomationRulesService,
    EventsService,
    NotificationsService,
    AuditLogsService,
    TenantContextService,
  ],
})
export class AlertsModule {}
