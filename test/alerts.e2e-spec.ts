import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import type { Server } from 'node:http';
import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/configure-app.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('Local alerts API (PostgreSQL)', () => {
  const organizationId = `e2e-alerts-${randomUUID()}`;
  let app: INestApplication<Server>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(ConfigService)
      .useValue(new ConfigService({
        NODE_ENV: 'development',
        ENABLE_ALERTS_DEV_API: 'true',
        DEV_ORGANIZATION_ID: organizationId,
        DEV_USER_ID: 'u-manager',
      }))
      .compile();
    app = module.createNestApplication();
    configureApp(app);
    await app.init();
    prisma = app.get(PrismaService);
  }, 30000);

  afterAll(async () => {
    try {
      if (prisma) {
        const where = { organizationId };
        await prisma.$transaction([
          prisma.appNotification.deleteMany({ where }),
          prisma.alert.deleteMany({ where }),
          prisma.operationalEvent.deleteMany({ where }),
          prisma.automationRule.deleteMany({ where }),
          prisma.auditLog.deleteMany({ where }),
        ]);
      }
    } finally {
      await app?.close();
    }
  }, 30000);

  it('deduplicates a threshold breach, notifies the manager, and audits each transition', async () => {
    const api = request(app.getHttpServer());
    await api.post('/api/v1/automation-rules').send({
      name: 'Maximum temperature',
      fieldKey: 'temperature',
      operator: 'GT',
      thresholdValue: 80,
      severity: 'HIGH',
    }).expect(201);

    const reading = {
      clientEventId: 'temperature-85',
      sourceType: 'STATIONED_TELEMETRY',
      payload: { temperature: 85 },
    };
    const first = await api.post('/api/v1/events').send(reading).expect(201);
    expect(first.body.alertsCreated).toHaveLength(1);
    const duplicate = await api.post('/api/v1/events').send(reading).expect(201);
    expect(duplicate.body).toMatchObject({ duplicate: true, alertsCreated: [] });

    await api.get('/api/v1/notifications/unread-count').expect(200, { count: 1 });
    const [alertId] = first.body.alertsCreated;
    for (const action of ['acknowledge', 'escalate', 'resolve']) {
      await api.post(`/api/v1/alerts/${alertId}/${action}`)
        .send({ note: 'Checked locally' })
        .expect(201);
    }
    const audit = await api.get('/api/v1/audit-logs?resourceType=Alert').expect(200);
    expect(audit.body.items).toEqual(expect.arrayContaining(
      ['ALERT_ACKNOWLEDGED', 'ALERT_ESCALATED', 'ALERT_RESOLVED'].map(action =>
        expect.objectContaining({ action, resourceId: alertId }),
      ),
    ));
  }, 30000);
});
