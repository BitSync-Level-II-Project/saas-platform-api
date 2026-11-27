import { Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import type { Role, TenantContext } from './types.js';

@Injectable()
export class TenantContextService {
  constructor(private readonly config: ConfigService) {}

  getContext(req?: Request): TenantContext {
    const headerOrgId = req?.headers['x-organization-id'];
    const headerUserId = req?.headers['x-user-id'];
    const headerUserName = req?.headers['x-user-name'];
    const headerUserRole = req?.headers['x-user-role'];

    const organizationId =
      (typeof headerOrgId === 'string' && headerOrgId.trim()) ||
      this.config.get<string>('DEV_ORGANIZATION_ID')?.trim();

    const userId =
      (typeof headerUserId === 'string' && headerUserId.trim()) ||
      this.config.get<string>('DEV_USER_ID')?.trim();

    const userName =
      (typeof headerUserName === 'string' && headerUserName.trim()) ||
      this.config.get<string>('DEV_USER_NAME')?.trim() ||
      'Dinesh Wijesinghe';

    const userRole =
      (typeof headerUserRole === 'string' && (headerUserRole.toUpperCase() as Role)) ||
      (this.config.get<string>('DEV_USER_ROLE')?.toUpperCase() as Role) ||
      'MANAGER';

    const devEnabled =
      this.config.get<string>('NODE_ENV') === 'development' &&
      (this.config.get<string>('ENABLE_ALERTS_DEV_API') === 'true' ||
        this.config.get<string>('ENABLE_TEMPLATE_DEV_API') === 'true');

    if (!organizationId || !userId) {
      if (!devEnabled) {
        throw new NotFoundException('Organization or user context not found.');
      }
      throw new ServiceUnavailableException('Development context is not configured.');
    }

    return {
      organizationId,
      userId,
      userName,
      userRole,
    };
  }
}
