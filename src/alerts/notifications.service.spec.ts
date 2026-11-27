import { describe, expect, it, vi } from 'vitest';
import { NotificationsService } from './notifications.service.js';
import type { AuditLogsService } from './audit-logs.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

const message = {
  organizationId: 'local-org',
  recipientId: 'u-manager',
  type: 'ALERT_CREATED',
  title: 'Temperature limit exceeded',
  body: 'Temperature reached 85',
  severity: 'HIGH' as const,
};

describe('in-app notification delivery', () => {
  it.each([
    { preferences: null, delivered: true },
    { preferences: { inAppEnabled: false, minSeverity: 'INFO' }, delivered: false },
    { preferences: { inAppEnabled: true, minSeverity: 'CRITICAL' }, delivered: false },
    { preferences: { inAppEnabled: true, minSeverity: 'HIGH' }, delivered: true },
  ])('respects recipient preferences $preferences', async ({ preferences, delivered }) => {
    const db = {
      notificationPreference: { findUnique: vi.fn().mockResolvedValue(preferences) },
      appNotification: { create: vi.fn().mockResolvedValue({ id: 'notification-1' }) },
    };
    const audit = { log: vi.fn() };
    const service = new NotificationsService(
      db as unknown as PrismaService,
      audit as unknown as AuditLogsService,
    );

    await service.notify(message);
    expect(db.notificationPreference.findUnique).toHaveBeenCalledWith({
      where: { organizationId_userId: { organizationId: 'local-org', userId: 'u-manager' } },
    });
    expect(db.appNotification.create).toHaveBeenCalledTimes(Number(delivered));
    expect(audit.log).toHaveBeenCalledTimes(Number(delivered));
  });
});
