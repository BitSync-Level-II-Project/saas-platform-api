import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { CreateSubmissionDto } from './dto/create-submission.dto.js';
import { SubmissionsService } from './submissions.service.js';

type WorkerRequest = Request & {
  user?: { userId: string; organizationId: string; role: string };
};

@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissions: SubmissionsService) {}

  @Post()
  async submit(
    @Req() request: WorkerRequest,
    @Body() dto: CreateSubmissionDto,
    @Res() response: Response,
  ) {
    const user = request.user;
    if (!user?.userId || !user.organizationId) {
      throw new UnauthorizedException({
        code: 'AUTH_REQUIRED',
        message: 'Sign in to submit this task.',
      });
    }
    if (user.role !== 'WORKER') {
      throw new ForbiddenException({
        code: 'WORKER_ROLE_REQUIRED',
        message: 'A worker account is required.',
      });
    }

    const result = await this.submissions.submit(user, dto);
    response.status(result.created ? 201 : 200).json(result.receipt);
  }
}
