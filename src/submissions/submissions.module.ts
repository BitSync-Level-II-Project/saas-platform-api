import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module.js';
import { TasksModule } from '../tasks/tasks.module.js';
import { TemplatesModule } from '../templates/templates.module.js';
import { SubmissionsController } from './submissions.controller.js';
import { SubmissionsService } from './submissions.service.js';

@Module({
  imports: [PrismaModule, TasksModule, TemplatesModule],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
})
export class SubmissionsModule {}
