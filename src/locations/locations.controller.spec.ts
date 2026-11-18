import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LocationsController } from './locations.controller.js';
import { LocationsService } from './locations.service.js';
import { CreateLocationDto } from './dto/create-location.dto.js';
import { UpdateLocationDto } from './dto/update-location.dto.js';

describe('LocationsController', () => {
  let controller: LocationsController;
  let service: LocationsService;

  const mockWarehouseId = 'a123b456-c789-4012-d345-e67890abcdef';
  const mockLocationId = 'b234c567-d890-4123-e456-f78901bcdefa';

  const mockLocationResult = {
    id: mockLocationId,
    warehouseId: mockWarehouseId,
    organizationId: 'local-demo-org',
    name: 'Aisle 1',
    description: 'Cold storage aisle',
    assignedWork: null,
    status: 'Active',
    createdAt: new Date('2026-11-17T08:00:00Z'),
    updatedAt: new Date('2026-11-17T08:00:00Z'),
  };

  beforeEach(async () => {
    const mockService = {
      findAll: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocationsController],
      providers: [
        {
          provide: LocationsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<LocationsController>(LocationsController);
    service = module.get<LocationsService>(LocationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to service.findAll with warehouseId', async () => {
      vi.mocked(service.findAll).mockResolvedValue([mockLocationResult] as any);

      const result = await controller.findAll(mockWarehouseId);

      expect(service.findAll).toHaveBeenCalledWith(mockWarehouseId);
      expect(result).toEqual([mockLocationResult]);
    });
  });

  describe('findOne', () => {
    it('should delegate to service.findOne with warehouseId and id', async () => {
      vi.mocked(service.findOne).mockResolvedValue(mockLocationResult as any);

      const result = await controller.findOne(mockWarehouseId, mockLocationId);

      expect(service.findOne).toHaveBeenCalledWith(mockWarehouseId, mockLocationId);
      expect(result).toEqual(mockLocationResult);
    });
  });

  describe('create', () => {
    it('should delegate to service.create with warehouseId and dto', async () => {
      const dto: CreateLocationDto = {
        name: 'Aisle 1',
        description: 'Cold storage aisle',
        status: 'Active' as any,
      };
      vi.mocked(service.create).mockResolvedValue(mockLocationResult as any);

      const result = await controller.create(mockWarehouseId, dto);

      expect(service.create).toHaveBeenCalledWith(mockWarehouseId, dto);
      expect(result).toEqual(mockLocationResult);
    });
  });

  describe('update', () => {
    it('should delegate to service.update with warehouseId, id and dto', async () => {
      const dto: UpdateLocationDto = {
        name: 'Aisle 1 - Updated',
      };
      const updatedResult = { ...mockLocationResult, name: 'Aisle 1 - Updated' };
      vi.mocked(service.update).mockResolvedValue(updatedResult as any);

      const result = await controller.update(mockWarehouseId, mockLocationId, dto);

      expect(service.update).toHaveBeenCalledWith(mockWarehouseId, mockLocationId, dto);
      expect(result).toEqual(updatedResult);
    });
  });

  describe('remove', () => {
    it('should delegate to service.remove with warehouseId and id', async () => {
      const deleteResult = { message: 'Location deleted successfully' };
      vi.mocked(service.remove).mockResolvedValue(deleteResult as any);

      const result = await controller.remove(mockWarehouseId, mockLocationId);

      expect(service.remove).toHaveBeenCalledWith(mockWarehouseId, mockLocationId);
      expect(result).toEqual(deleteResult);
    });
  });
});
