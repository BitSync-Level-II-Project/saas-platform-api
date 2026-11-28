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

const warehouseBase = '/api/v1/warehouses';
const organizationId = `e2e-wh-${randomUUID()}`;
const otherOrganizationId = `e2e-wh-other-${randomUUID()}`;

const context = {
  NODE_ENV: 'development',
  ENABLE_WAREHOUSE_DEV_API: 'true',
  DEV_ORGANIZATION_ID: organizationId,
  DEV_USER_ID: 'e2e-manager',
};

const warehouseFixture = {
  name: 'QA Regional Distribution Center',
  city: 'Colombo, Sri Lanka',
  address: '100 Port Access Road',
  supervisor: 'Nimal Jayawardena',
};

const locationFixture = {
  name: 'Zone A - Cold Storage',
  description: 'Temperature controlled section (-18C)',
  status: 'Active',
};

describe('Warehouse & Location API E2E (PostgreSQL)', () => {
  let app: INestApplication<Server>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(ConfigService)
      .useValue(new ConfigService(context))
      .compile();

    app = module.createNestApplication();
    configureApp(app);
    await app.init();
    prisma = app.get(PrismaService);
  }, 30000);

  afterAll(async () => {
    try {
      if (prisma) {
        const where = {
          organizationId: { in: [organizationId, otherOrganizationId] },
        };
        await prisma.$transaction([
          prisma.location.deleteMany({ where }),
          prisma.warehouse.deleteMany({ where }),
        ]);
      }
    } finally {
      await app?.close();
    }
  }, 30000);

  const api = () => request(app.getHttpServer());

  describe('Warehouse CRUD operations', () => {
    let createdWarehouseId: string;

    it('POST /warehouses creates a new warehouse with locations: 0', async () => {
      const res = await api()
        .post(warehouseBase)
        .send(warehouseFixture)
        .expect(201);

      expect(res.body).toMatchObject({
        name: warehouseFixture.name,
        city: warehouseFixture.city,
        address: warehouseFixture.address,
        supervisor: warehouseFixture.supervisor,
        status: 'Active',
      });
      expect(res.body.id).toBeDefined();
      createdWarehouseId = res.body.id;
    });

    it('POST /warehouses rejects blank name or missing fields with 400', async () => {
      await api()
        .post(warehouseBase)
        .send({
          name: '   ',
          city: 'Colombo',
        })
        .expect(400);

      await api()
        .post(warehouseBase)
        .send({
          name: 'Valid Name',
          // city is required
        })
        .expect(400);
    });

    it('GET /warehouses returns list with live aggregated locations count', async () => {
      const res = await api().get(warehouseBase).expect(200);

      expect(res.body.items).toBeDefined();
      expect(Array.isArray(res.body.items)).toBe(true);

      const found = res.body.items.find(
        (w: { id: string }) => w.id === createdWarehouseId,
      );
      expect(found).toBeDefined();
      expect(found.locations).toBe(0);
    });

    it('GET /warehouses/:id returns single warehouse with locations count', async () => {
      const res = await api()
        .get(`${warehouseBase}/${createdWarehouseId}`)
        .expect(200);

      expect(res.body.id).toBe(createdWarehouseId);
      expect(res.body.name).toBe(warehouseFixture.name);
      expect(res.body.locations).toBe(0);
    });

    it('GET /warehouses/:id validates UUID and returns 400 for malformed IDs', async () => {
      await api().get(`${warehouseBase}/not-a-valid-uuid`).expect(400);
    });

    it('GET /warehouses/:id returns 404 for non-existent UUID', async () => {
      await api().get(`${warehouseBase}/${randomUUID()}`).expect(404);
    });

    it('PATCH /warehouses/:id updates warehouse fields', async () => {
      const updatedData = {
        name: 'QA Regional Distribution Hub (Updated)',
        supervisor: 'Sunil Weerasinghe',
      };

      const res = await api()
        .patch(`${warehouseBase}/${createdWarehouseId}`)
        .send(updatedData)
        .expect(200);

      expect(res.body.name).toBe(updatedData.name);
      expect(res.body.supervisor).toBe(updatedData.supervisor);
    });
  });

  describe('Location Sub-Resource CRUD & Live Count Aggregation', () => {
    let parentWarehouseId: string;
    let createdLocationId: string;

    beforeAll(async () => {
      const res = await api()
        .post(warehouseBase)
        .send({
          name: 'Location Testing Warehouse',
          city: 'Gampaha',
          supervisor: 'Kamal Silva',
        })
        .expect(201);
      parentWarehouseId = res.body.id;
    });

    it('POST /warehouses/:warehouseId/locations creates a new location', async () => {
      const res = await api()
        .post(`${warehouseBase}/${parentWarehouseId}/locations`)
        .send(locationFixture)
        .expect(201);

      expect(res.body).toMatchObject({
        name: locationFixture.name,
        description: locationFixture.description,
        status: locationFixture.status,
        warehouseId: parentWarehouseId,
      });
      expect(res.body.id).toBeDefined();
      createdLocationId = res.body.id;
    });

    it('POST /warehouses/:warehouseId/locations rejects blank name with 400', async () => {
      await api()
        .post(`${warehouseBase}/${parentWarehouseId}/locations`)
        .send({
          name: '   ',
          description: 'Empty name test',
        })
        .expect(400);
    });

    it('POST /warehouses/:warehouseId/locations returns 404 for non-existent parent warehouse', async () => {
      await api()
        .post(`${warehouseBase}/${randomUUID()}/locations`)
        .send(locationFixture)
        .expect(404);
    });

    it('GET /warehouses now reflects locations: 1 dynamically from DB', async () => {
      const res = await api().get(warehouseBase).expect(200);

      const warehouse = res.body.items.find(
        (w: { id: string }) => w.id === parentWarehouseId,
      );
      expect(warehouse).toBeDefined();
      expect(warehouse.locations).toBe(1);
    });

    it('GET /warehouses/:warehouseId/locations returns array containing the location', async () => {
      const res = await api()
        .get(`${warehouseBase}/${parentWarehouseId}/locations`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);

      const found = res.body.find(
        (l: { id: string }) => l.id === createdLocationId,
      );
      expect(found).toBeDefined();
      expect(found.name).toBe(locationFixture.name);
    });

    it('GET /warehouses/:warehouseId/locations/:id returns specific location details', async () => {
      const res = await api()
        .get(`${warehouseBase}/${parentWarehouseId}/locations/${createdLocationId}`)
        .expect(200);

      expect(res.body.id).toBe(createdLocationId);
      expect(res.body.name).toBe(locationFixture.name);
    });

    it('PATCH /warehouses/:warehouseId/locations/:id updates location', async () => {
      const res = await api()
        .patch(
          `${warehouseBase}/${parentWarehouseId}/locations/${createdLocationId}`,
        )
        .send({
          name: 'Zone A - Cold Storage (Renamed)',
          status: 'Inactive',
        })
        .expect(200);

      expect(res.body.name).toBe('Zone A - Cold Storage (Renamed)');
      expect(res.body.status).toBe('Inactive');
    });

    it('DELETE /warehouses/:warehouseId/locations/:id deletes location and decrements count', async () => {
      await api()
        .delete(
          `${warehouseBase}/${parentWarehouseId}/locations/${createdLocationId}`,
        )
        .expect(200);

      // Verify location is no longer retrieved
      await api()
        .get(
          `${warehouseBase}/${parentWarehouseId}/locations/${createdLocationId}`,
        )
        .expect(404);

      // Verify parent warehouse locations count dropped back to 0
      const warehouseRes = await api()
        .get(`${warehouseBase}/${parentWarehouseId}`)
        .expect(200);
      expect(warehouseRes.body.locations).toBe(0);
    });
  });

  describe('Database Cascade Deletion', () => {
    it('deleting parent warehouse cascades and deletes all child locations', async () => {
      // 1. Create warehouse
      const whRes = await api()
        .post(warehouseBase)
        .send({
          name: 'Cascade Test Warehouse',
          city: 'Kandy',
          supervisor: 'Anura Bandara',
        })
        .expect(201);
      const whId = whRes.body.id;

      // 2. Create 2 locations under it
      const loc1Res = await api()
        .post(`${warehouseBase}/${whId}/locations`)
        .send({ name: 'Bay 1' })
        .expect(201);
      const loc2Res = await api()
        .post(`${warehouseBase}/${whId}/locations`)
        .send({ name: 'Bay 2' })
        .expect(201);

      // 3. Delete parent warehouse
      await api().delete(`${warehouseBase}/${whId}`).expect(200);

      // 4. Verify directly in database that child locations no longer exist
      const remainingLocations = await prisma.location.findMany({
        where: {
          id: { in: [loc1Res.body.id, loc2Res.body.id] },
        },
      });
      expect(remainingLocations).toHaveLength(0);
    });
  });

  describe('Multi-Tenant Data Isolation', () => {
    it('does not allow another tenant to read or delete warehouse', async () => {
      // Create warehouse in another organization directly in DB
      const otherTenantWarehouse = await prisma.warehouse.create({
        data: {
          name: 'Other Tenant Warehouse',
          city: 'Galle',
          organizationId: otherOrganizationId,
        },
      });

      // Attempting to read it through the current tenant's API should return 404
      await api().get(`${warehouseBase}/${otherTenantWarehouse.id}`).expect(404);

      // Attempting to delete it through current tenant's API should return 404
      await api()
        .delete(`${warehouseBase}/${otherTenantWarehouse.id}`)
        .expect(404);
    });

    it('rejects a location linked to a warehouse from another organization at the database level', async () => {
      // Create a warehouse belonging to the primary test organization
      const wh = await prisma.warehouse.create({
        data: {
          name: 'Primary Org Warehouse',
          city: 'Colombo',
          organizationId,
        },
      });

      // Attempting to directly insert a location with a mismatched organizationId
      // must be rejected by the composite foreign key constraint in PostgreSQL
      await expect(
        prisma.location.create({
          data: {
            name: 'Mismatched Org Location',
            warehouseId: wh.id,
            organizationId: otherOrganizationId,
          },
        }),
      ).rejects.toMatchObject({ code: 'P2003' });
    });
  });
});
