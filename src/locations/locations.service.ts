import {
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateLocationDto } from './dto/create-location.dto.js';
import type { UpdateLocationDto } from './dto/update-location.dto.js';

@Injectable()
export class LocationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private getDevelopmentContext() {
    const enabled =
      this.config.get<string>('NODE_ENV') === 'development' &&
      this.config.get<string>('ENABLE_WAREHOUSE_DEV_API') === 'true';

    if (!enabled) {
      throw new NotFoundException();
    }

    const organizationId = this.config
      .get<string>('DEV_ORGANIZATION_ID')
      ?.trim();

    const userId = this.config
      .get<string>('DEV_USER_ID')
      ?.trim();

    if (!organizationId || !userId) {
      throw new ServiceUnavailableException(
        'Warehouse development context is not configured.',
      );
    }

    return { organizationId, userId };
  }

  private async assertWarehouseExists(
    warehouseId: string,
    organizationId: string,
  ) {
    const warehouse = await this.prisma.warehouse.findUnique({
      where: {
        id_organizationId: {
          id: warehouseId,
          organizationId,
        },
      },
    });

    if (!warehouse) {
      throw new NotFoundException(
        `Warehouse with ID "${warehouseId}" not found.`,
      );
    }

    return warehouse;
  }

  // 1. Get all locations for a specific warehouse
  async findAll(warehouseId: string) {
    const context = this.getDevelopmentContext();
    await this.assertWarehouseExists(warehouseId, context.organizationId);

    const locations = await this.prisma.location.findMany({
      where: {
        warehouseId,
        organizationId: context.organizationId,
      },
      orderBy: { createdAt: 'desc' },
    });

    return locations.map((loc) => ({
      id: loc.id,
      warehouseId: loc.warehouseId,
      name: loc.name,
      description: loc.description ?? '',
      assignedWork: loc.assignedWork,
      status: loc.status === 'ACTIVE' ? ('Active' as const) : ('Inactive' as const),
      createdAt: loc.createdAt.toISOString(),
      updatedAt: loc.updatedAt.toISOString(),
    }));
  }

  // 2. Get a single location by ID within a warehouse
  async findOne(warehouseId: string, id: string) {
    const context = this.getDevelopmentContext();
    await this.assertWarehouseExists(warehouseId, context.organizationId);

    const location = await this.prisma.location.findFirst({
      where: {
        id,
        warehouseId,
        organizationId: context.organizationId,
      },
    });

    if (!location) {
      throw new NotFoundException(
        `Location with ID "${id}" not found in this warehouse.`,
      );
    }

    return {
      id: location.id,
      warehouseId: location.warehouseId,
      name: location.name,
      description: location.description ?? '',
      assignedWork: location.assignedWork,
      status:
        location.status === 'ACTIVE' ? ('Active' as const) : ('Inactive' as const),
      createdAt: location.createdAt.toISOString(),
      updatedAt: location.updatedAt.toISOString(),
    };
  }

  // 3. Create a new location under a warehouse
  async create(warehouseId: string, dto: CreateLocationDto) {
    const context = this.getDevelopmentContext();
    await this.assertWarehouseExists(warehouseId, context.organizationId);

    const location = await this.prisma.location.create({
      data: {
        warehouseId,
        organizationId: context.organizationId,
        name: dto.name.trim(),
        description:
          typeof dto.description === 'string' ? dto.description.trim() : '',
        assignedWork:
          typeof dto.assignedWork === 'string' && dto.assignedWork.trim()
            ? dto.assignedWork.trim()
            : '0 tasks',
        status: dto.status ?? 'ACTIVE',
      },
    });

    return {
      id: location.id,
      warehouseId: location.warehouseId,
      name: location.name,
      description: location.description ?? '',
      assignedWork: location.assignedWork,
      status:
        location.status === 'ACTIVE' ? ('Active' as const) : ('Inactive' as const),
      createdAt: location.createdAt.toISOString(),
      updatedAt: location.updatedAt.toISOString(),
    };
  }

  // 4. Update an existing location
  async update(warehouseId: string, id: string, dto: UpdateLocationDto) {
    const context = this.getDevelopmentContext();
    await this.assertWarehouseExists(warehouseId, context.organizationId);

    const existing = await this.prisma.location.findFirst({
      where: {
        id,
        warehouseId,
        organizationId: context.organizationId,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Location with ID "${id}" not found in this warehouse.`,
      );
    }

    const updated = await this.prisma.location.update({
      where: {
        id_organizationId: {
          id,
          organizationId: context.organizationId,
        },
      },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.description !== undefined
          ? {
              description:
                typeof dto.description === 'string'
                  ? dto.description.trim()
                  : '',
            }
          : {}),
        ...(dto.assignedWork !== undefined
          ? {
              assignedWork:
                typeof dto.assignedWork === 'string' && dto.assignedWork.trim()
                  ? dto.assignedWork.trim()
                  : '0 tasks',
            }
          : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      },
    });

    return {
      id: updated.id,
      warehouseId: updated.warehouseId,
      name: updated.name,
      description: updated.description ?? '',
      assignedWork: updated.assignedWork,
      status:
        updated.status === 'ACTIVE' ? ('Active' as const) : ('Inactive' as const),
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  // 5. Delete a location
  async remove(warehouseId: string, id: string) {
    const context = this.getDevelopmentContext();
    await this.assertWarehouseExists(warehouseId, context.organizationId);

    const existing = await this.prisma.location.findFirst({
      where: {
        id,
        warehouseId,
        organizationId: context.organizationId,
      },
    });

    if (!existing) {
      throw new NotFoundException(
        `Location with ID "${id}" not found in this warehouse.`,
      );
    }

    await this.prisma.location.delete({
      where: {
        id_organizationId: {
          id,
          organizationId: context.organizationId,
        },
      },
    });

    return { success: true };
  }
}
