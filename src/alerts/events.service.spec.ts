import { describe, expect, it, vi, beforeEach } from 'vitest';
import { EventsService } from './events.service.js';
import type { TenantContext } from './types.js';

describe('EventsService Ingestion & Cooldown Engine', () => {
  let eventsService: EventsService;
  let mockPrisma: any;
  let mockAudit: any;
  let mockNotifications: any;

  const mockContext: TenantContext = {
    organizationId: 'test-org',
    userId: 'test-user',
    userName: 'Tester',
    userRole: 'WORKER',
  };

  beforeEach(() => {
    mockPrisma = {
      operationalEvent: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      automationRule: {
        findMany: vi.fn(),
      },
      alert: {
        findFirst: vi.fn(),
        create: vi.fn(),
      },
      alertAction: {
        create: vi.fn(),
      },
    };

    mockAudit = {
      log: vi.fn(),
    };

    mockNotifications = {
      notify: vi.fn(),
    };

    eventsService = new EventsService(
      mockPrisma as any,
      mockAudit as any,
      mockNotifications as any,
    );
  });

  it('detects and suppresses duplicate client events', async () => {
    mockPrisma.operationalEvent.findUnique.mockResolvedValue({
      id: 'evt-dup',
      clientEventId: 'client-123',
    });

    const result = await eventsService.ingest(mockContext, {
      clientEventId: 'client-123',
      sourceType: 'STATIONED_TELEMETRY',
      payload: { temperature: 85 },
    });

    expect(result.duplicate).toBe(true);
    expect(result.alertsCreated).toEqual([]);
    expect(mockPrisma.operationalEvent.create).not.toHaveBeenCalled();
  });

  it('ingests a new event and triggers an alert for matching rule', async () => {
    mockPrisma.operationalEvent.findUnique.mockResolvedValue(null);
    mockPrisma.operationalEvent.create.mockResolvedValue({
      id: 'evt-1',
      clientEventId: 'client-456',
    });
    mockPrisma.automationRule.findMany.mockResolvedValue([
      {
        id: 'rule-temp',
        name: 'High Machine Temperature',
        fieldKey: 'temperature',
        operator: 'GT',
        thresholdValue: 80,
        severity: 'CRITICAL',
        notify: 'SUPERVISOR_MANAGER',
        cooldownMinutes: 15,
        enabled: true,
      },
    ]);
    mockPrisma.alert.findFirst.mockResolvedValue(null); // not in cooldown
    mockPrisma.alert.create.mockResolvedValue({
      id: 'alt-created',
      title: 'High Machine Temperature',
      severity: 'CRITICAL',
      message: 'temperature = 88 (rule: temperature > 80)',
    });

    const result = await eventsService.ingest(mockContext, {
      clientEventId: 'client-456',
      sourceType: 'STATIONED_TELEMETRY',
      deviceId: 'phone-01',
      payload: { temperature: 88 },
    });

    expect(result.duplicate).toBe(false);
    expect(result.alertsCreated).toEqual(['alt-created']);
    expect(mockPrisma.alert.create).toHaveBeenCalled();
    expect(mockNotifications.notify).toHaveBeenCalledTimes(2); // supervisor and manager
    expect(mockPrisma.operationalEvent.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'evt-1' },
        data: { status: 'PROCESSED' },
      }),
    );
  });

  it('suppresses alert creation when cooldown window is active', async () => {
    mockPrisma.operationalEvent.findUnique.mockResolvedValue(null);
    mockPrisma.operationalEvent.create.mockResolvedValue({
      id: 'evt-2',
      clientEventId: 'client-789',
    });
    mockPrisma.automationRule.findMany.mockResolvedValue([
      {
        id: 'rule-temp',
        name: 'High Machine Temperature',
        fieldKey: 'temperature',
        operator: 'GT',
        thresholdValue: 80,
        severity: 'CRITICAL',
        cooldownMinutes: 15,
        enabled: true,
      },
    ]);
    // Simulate active cooldown alert
    mockPrisma.alert.findFirst.mockResolvedValue({
      id: 'existing-alert',
      status: 'NEW',
      createdAt: new Date(),
    });

    const result = await eventsService.ingest(mockContext, {
      clientEventId: 'client-789',
      sourceType: 'STATIONED_TELEMETRY',
      deviceId: 'phone-01',
      payload: { temperature: 95 },
    });

    expect(result.duplicate).toBe(false);
    expect(result.alertsCreated).toEqual([]);
    expect(mockPrisma.alert.create).not.toHaveBeenCalled();
    expect(mockPrisma.operationalEvent.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'evt-2' },
        data: { status: 'PROCESSED' },
      }),
    );
  });
});
