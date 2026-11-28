import {
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LocationsService } from './locations.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('LocationsService', () => {
  let service: LocationsService;
  let configService: Partial<ConfigService>;
  let prismaService: any;

  const mockWarehouseId = 'a123b456-c789-4012-d345-e67890abcdef';
  const mockLocationId = 'b234c567-d890-4123-e456-f78901bcdefa';

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
        findUnique: vi.fn(),
      },
      location: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    };

    service = new LocationsService(
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

      await expect(service.findAll(mockWarehouseId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if ENABLE_WAREHOUSE_DEV_API is not true', async () => {
      vi.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'development';
        if (key === 'ENABLE_WAREHOUSE_DEV_API') return 'false';
        return 'test';
      });

      await expect(service.findAll(mockWarehouseId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ServiceUnavailableException if DEV_ORGANIZATION_ID is missing', async () => {
      vi.spyOn(configService, 'get').mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'development';
        if (key === 'ENABLE_WAREHOUSE_DEV_API') return 'true';
        if (key === 'DEV_USER_ID') return 'user-1';
        return '';
      });

      await expect(service.findAll(mockWarehouseId)).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });

  describe('Parent warehouse verification (assertWarehouseExists)', () => {
    it('should throw NotFoundException when target warehouse does not exist', async () => {
      prismaService.warehouse.findUnique.mockResolvedValue(null);

      await expect(service.findAll(mockWarehouseId)).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaService.warehouse.findUnique).toHaveBeenCalledWith({
        where: {
          id_organizationId: {
            id: mockWarehouseId,
            organizationId: 'local-demo-org',
          },
        },
      });
    });
  });

  describe('CRUD Operations', () => {
    beforeEach(() => {
      // Default: warehouse exists
      prismaService.warehouse.findUnique.mockResolvedValue({
        id: mockWarehouseId,
        organizationId: 'local-demo-org',
        name: 'Colombo Main Warehouse',
      });
    });

    it('findAll: should return mapped locations for valid warehouse', async () => {
      const now = new Date();
      prismaService.location.findMany.mockResolvedValue([
        {
          id: mockLocationId,
          warehouseId: mockWarehouseId,
          organizationId: 'local-demo-org',
          name: 'Dock 1',
          description: 'Loading bay dock',
          assignedWork: '2 tasks',
          status: 'ACTIVE',
          createdAt: now,
          updatedAt: now,
        },
      ]);

      const result = await service.findAll(mockWarehouseId);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockLocationId,
        warehouseId: mockWarehouseId,
        name: 'Dock 1',
        description: 'Loading bay dock',
        assignedWork: '2 tasks',
        status: 'Active',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      });
      expect(prismaService.location.findMany).toHaveBeenCalledWith({
        where: {
          warehouseId: mockWarehouseId,
          organizationId: 'local-demo-org',
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('findOne: should return mapped location when found', async () => {
      const now = new Date();
      prismaService.location.findFirst.mockResolvedValue({
        id: mockLocationId,
        warehouseId: mockWarehouseId,
        organizationId: 'local-demo-org',
        name: 'Dock 1',
        description: 'Loading bay dock',
        assignedWork: '0 tasks',
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      });

      const result = await service.findOne(mockWarehouseId, mockLocationId);

      expect(result.id).toBe(mockLocationId);
      expect(result.name).toBe('Dock 1');
      expect(result.status).toBe('Active');
    });

    it('findOne: should throw NotFoundException when location not found in warehouse', async () => {
      prismaService.location.findFirst.mockResolvedValue(null);

      await expect(
        service.findOne(mockWarehouseId, mockLocationId),
      ).rejects.toThrow(NotFoundException);
    });

    it('create: should trim strings and persist new location with defaults', async () => {
      const now = new Date();
      prismaService.location.create.mockResolvedValue({
        id: mockLocationId,
        warehouseId: mockWarehouseId,
        organizationId: 'local-demo-org',
        name: 'Aisle 3',
        description: 'Dry goods storage',
        assignedWork: '0 tasks',
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
      });

      const result = await service.create(mockWarehouseId, {
        name: '   Aisle 3   ',
        description: '   Dry goods storage   ',
      });

      expect(prismaService.location.create).toHaveBeenCalledWith({
        data: {
          warehouseId: mockWarehouseId,
          organizationId: 'local-demo-org',
          name: 'Aisle 3',
          description: 'Dry goods storage',
          assignedWork: '0 tasks',
          status: 'ACTIVE',
        },
      });
      expect(result.name).toBe('Aisle 3');
      expect(result.status).toBe('Active');
    });

    it('update: should apply partial updates with trimmed values', async () => {
      const now = new Date();
      prismaService.location.findFirst.mockResolvedValue({
        id: mockLocationId,
        warehouseId: mockWarehouseId,
        organizationId: 'local-demo-org',
        name: 'Old Name',
      });

      prismaService.location.update.mockResolvedValue({
        id: mockLocationId,
        warehouseId: mockWarehouseId,
        organizationId: 'local-demo-org',
        name: 'New Name',
        description: '',
        assignedWork: '0 tasks',
        status: 'INACTIVE',
        createdAt: now,
        updatedAt: now,
      });

      const result = await service.update(mockWarehouseId, mockLocationId, {
        name: '  New Name  ',
        status: 'INACTIVE' as any,
      });

      expect(prismaService.location.update).toHaveBeenCalledWith({
        where: {
          id_organizationId: {
            id: mockLocationId,
            organizationId: 'local-demo-org',
          },
        },
        data: {
          name: 'New Name',
          status: 'INACTIVE',
        },
      });
      expect(result.name).toBe('New Name');
      expect(result.status).toBe('Inactive');
    });

    it('remove: should delete location when it exists', async () => {
      prismaService.location.findFirst.mockResolvedValue({
        id: mockLocationId,
        warehouseId: mockWarehouseId,
        organizationId: 'local-demo-org',
      });
      prismaService.location.delete.mockResolvedValue({});

      const result = await service.remove(mockWarehouseId, mockLocationId);

      expect(prismaService.location.delete).toHaveBeenCalledWith({
        where: {
          id_organizationId: {
            id: mockLocationId,
            organizationId: 'local-demo-org',
          },
        },
      });
      expect(result).toEqual({ success: true });
    });
  });
});
