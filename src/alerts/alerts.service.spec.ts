import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AlertsService } from './alerts.service.js';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import type { TenantContext } from './types.js';

describe('AlertsService State Machine', () => {
  let alertsService: AlertsService;
  let mockPrisma: any;
  let mockAudit: any;
  let mockNotifications: any;

  const mockContext: TenantContext = {
    organizationId: 'test-org',
    userId: 'test-user',
    userName: 'Tester',
    userRole: 'SUPERVISOR',
  };

  beforeEach(() => {
    mockPrisma = {
      alert: {
        findFirst: vi.fn(),
        update: vi.fn(),
      },
      alertAction: {
        create: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => cb(mockPrisma)),
    };

    mockAudit = {
      log: vi.fn(),
    };

    mockNotifications = {
      notify: vi.fn(),
    };

    alertsService = new AlertsService(
      mockPrisma as any,
      mockAudit as any,
      mockNotifications as any,
    );
  });

  it('acknowledges a NEW alert', async () => {
    mockPrisma.alert.findFirst.mockResolvedValue({
      id: 'alt-1',
      organizationId: 'test-org',
      status: 'NEW',
      title: 'High Temp',
      severity: 'HIGH',
    });
    mockPrisma.alert.update.mockResolvedValue({
      id: 'alt-1',
      organizationId: 'test-org',
      status: 'ACKNOWLEDGED',
      title: 'High Temp',
      severity: 'HIGH',
    });

    const result = await alertsService.actOnAlert(
      mockContext,
      'alt-1',
      'acknowledge',
    );
    expect(result.status).toBe('ACKNOWLEDGED');
    expect(mockPrisma.alertAction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'ACKNOWLEDGE' }),
      }),
    );
    expect(mockAudit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'ALERT_ACKNOWLEDGED' }),
      mockPrisma,
    );
  });

  it('throws ConflictException when acknowledging an already RESOLVED alert', async () => {
    mockPrisma.alert.findFirst.mockResolvedValue({
      id: 'alt-1',
      organizationId: 'test-org',
      status: 'RESOLVED',
    });

    await expect(
      alertsService.actOnAlert(mockContext, 'alt-1', 'acknowledge'),
    ).rejects.toThrow(ConflictException);
  });

  it('escalates an alert and increments level', async () => {
    mockPrisma.alert.findFirst.mockResolvedValue({
      id: 'alt-2',
      organizationId: 'test-org',
      status: 'ACKNOWLEDGED',
      title: 'High Vibration',
      severity: 'CRITICAL',
    });
    mockPrisma.alert.update.mockResolvedValue({
      id: 'alt-2',
      organizationId: 'test-org',
      status: 'ESCALATED',
      escalationLevel: 1,
      title: 'High Vibration',
      severity: 'CRITICAL',
    });

    const result = await alertsService.actOnAlert(
      mockContext,
      'alt-2',
      'escalate',
      'Still exceeding limits after check',
    );
    expect(result.status).toBe('ESCALATED');
    expect(mockNotifications.notify).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ALERT_ESCALATED',
        recipientId: 'u-manager',
      }),
    );
  });

  it('requires a note when resolving an alert', async () => {
    mockPrisma.alert.findFirst.mockResolvedValue({
      id: 'alt-3',
      organizationId: 'test-org',
      status: 'ACKNOWLEDGED',
    });

    await expect(
      alertsService.actOnAlert(mockContext, 'alt-3', 'resolve', ''),
    ).rejects.toThrow(BadRequestException);
  });

  it('resolves an alert when note is provided', async () => {
    mockPrisma.alert.findFirst.mockResolvedValue({
      id: 'alt-3',
      organizationId: 'test-org',
      status: 'ACKNOWLEDGED',
      title: 'Sensor Check',
      severity: 'MEDIUM',
    });
    mockPrisma.alert.update.mockResolvedValue({
      id: 'alt-3',
      organizationId: 'test-org',
      status: 'RESOLVED',
      title: 'Sensor Check',
      severity: 'MEDIUM',
    });

    const result = await alertsService.actOnAlert(
      mockContext,
      'alt-3',
      'resolve',
      'Fixed sensor alignment',
    );
    expect(result.status).toBe('RESOLVED');
    expect(mockAudit.log).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'ALERT_RESOLVED' }),
      mockPrisma,
    );
  });

  it('throws NotFoundException if alert does not exist', async () => {
    mockPrisma.alert.findFirst.mockResolvedValue(null);

    await expect(
      alertsService.actOnAlert(mockContext, 'non-existent', 'acknowledge'),
    ).rejects.toThrow(NotFoundException);
  });

  it('propagates the audit write failure before sending a resolution notification', async () => {
    mockPrisma.alert.findFirst.mockResolvedValue({ id: 'alt-1', status: 'NEW' });
    mockPrisma.alert.update.mockResolvedValue({ id: 'alt-1', status: 'RESOLVED' });
    const failure = new Error('audit insert failed');
    mockAudit.log.mockRejectedValue(failure);

    await expect(
      alertsService.actOnAlert(mockContext, 'alt-1', 'resolve', 'Sensor checked'),
    ).rejects.toBe(failure);
    expect(mockPrisma.$transaction).toHaveBeenCalledOnce();
    expect(mockNotifications.notify).not.toHaveBeenCalled();
  });
});
