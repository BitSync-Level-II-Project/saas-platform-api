import {
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WarehousesService } from './warehouses.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('WarehousesService regression tests', () => {
  let service: WarehousesService;
  let configService: Partial<ConfigService>;
  let prismaService: any;

  beforeEach(() => {
    configService = {
      get: vi.fn((key: string) => {
        switch (key) {
          case 'NODE_ENV':
            return 'development';
          case 'ENABLE_WAREHOUSE_DEV_API':
            return 'true';
          case 'DEV_ORGANIZATION_ID':
            return 'local-demo-org';
          case 'DEV_USER_ID':
            return 'local-demo-manager';
          default:
            return undefined;
        }
      }) as any,
    };

    prismaService = {
      warehouse: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    service = new WarehousesService(
      prismaService as PrismaService,
      configService as ConfigService,
    );
  });

  describe('Development context restrictions', () => {
    it('should throw NotFoundException if NODE_ENV is not development', async () => {
      vi.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'production';
        if (key === 'ENABLE_WAREHOUSE_DEV_API') return 'true';
        return 'test';
      });

      await expect(service.findAll({ page: 1, limit: 10 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if ENABLE_WAREHOUSE_DEV_API is not true', async () => {
      vi.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'development';
        if (key === 'ENABLE_WAREHOUSE_DEV_API') return 'false';
        return 'test';
      });

      await expect(service.findAll({ page: 1, limit: 10 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ServiceUnavailableException if DEV_ORGANIZATION_ID is missing', async () => {
      vi.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'development';
        if (key === 'ENABLE_WAREHOUSE_DEV_API') return 'true';
        if (key === 'DEV_ORGANIZATION_ID') return undefined;
        if (key === 'DEV_USER_ID') return 'user-1';
        return undefined;
      });

      await expect(service.findAll({ page: 1, limit: 10 })).rejects.toThrow(
        ServiceUnavailableException,
      );
    });

    it('should throw ServiceUnavailableException if DEV_USER_ID is missing', async () => {
      vi.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'development';
        if (key === 'ENABLE_WAREHOUSE_DEV_API') return 'true';
        if (key === 'DEV_ORGANIZATION_ID') return 'org-1';
        if (key === 'DEV_USER_ID') return undefined;
        return undefined;
      });

      await expect(service.findAll({ page: 1, limit: 10 })).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });

  describe('Null handling for optional fields in update()', () => {
    const existingWarehouse = {
      id: 'b567a1c8-89ab-4cde-bf01-23456789abcd',
      organizationId: 'local-demo-org',
      createdById: 'local-demo-manager',
      name: 'Existing Warehouse',
      city: 'Colombo',
      address: '123 Main St',
      supervisor: 'John Doe',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      prismaService.warehouse.findFirst.mockResolvedValue(existingWarehouse);
      prismaService.warehouse.update.mockImplementation(
        ({ data }: { data: any }) =>
          Promise.resolve({
            ...existingWarehouse,
            ...data,
          }),
      );
    });

    it('should handle null address without runtime error and normalize to empty string', async () => {
      const result = await service.update(existingWarehouse.id, {
        address: null,
      });

      expect(prismaService.warehouse.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            address: '',
          }),
        }),
      );
      expect(result.address).toBe('');
    });

    it('should handle null supervisor without runtime error and fallback to Unassigned', async () => {
      const result = await service.update(existingWarehouse.id, {
        supervisor: null,
      });

      expect(prismaService.warehouse.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            supervisor: 'Unassigned',
          }),
        }),
      );
      expect(result.supervisor).toBe('Unassigned');
    });

    it('should trim string values for name and city', async () => {
      await service.update(existingWarehouse.id, {
        name: '  Trimmed Name  ',
        city: '  Kandy  ',
      });

      expect(prismaService.warehouse.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: 'Trimmed Name',
            city: 'Kandy',
          }),
        }),
      );
    });
  });
});
