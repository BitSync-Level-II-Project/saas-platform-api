import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CreateWarehouseDto } from './dto/create-warehouse.dto.js';
import type { ListWarehousesDto } from './dto/list-warehouses.dto.js';
import type { UpdateWarehouseDto } from './dto/update-warehouse.dto.js';

@Injectable()
export class WarehousesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private getDevelopmentContext() {
    const organizationId =
      this.config.get<string>('DEV_ORGANIZATION_ID')?.trim() ??
      'local-demo-org';
    const userId =
      this.config.get<string>('DEV_USER_ID')?.trim() ?? 'local-demo-manager';

    return { organizationId, userId };
  }

  // 1. Get all warehouses with search, status filter, and pagination
  async findAll(query: ListWarehousesDto) {
    const context = this.getDevelopmentContext();
    const { page, limit, search, status } = query;

    const where = {
      organizationId: context.organizationId,
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { city: { contains: search, mode: 'insensitive' as const } },
              { supervisor: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.warehouse.count({ where }),
      this.prisma.warehouse.findMany({
        where,
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      items: items.map((w) => ({
        id: w.id,
        name: w.name,
        city: w.city,
        address: w.address ?? '',
        supervisor: w.supervisor,
        status: w.status === 'ACTIVE' ? 'Active' : 'Inactive',
        locations: 0,
        createdAt: w.createdAt,
        updatedAt: w.updatedAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // 2. Get a single warehouse by ID
  async findOne(id: string) {
    const context = this.getDevelopmentContext();

    const warehouse = await this.prisma.warehouse.findFirst({
      where: {
        id,
        organizationId: context.organizationId,
      },
    });

    if (!warehouse) {
      throw new NotFoundException(`Warehouse with ID "${id}" was not found.`);
    }

    return {
      id: warehouse.id,
      name: warehouse.name,
      city: warehouse.city,
      address: warehouse.address ?? '',
      supervisor: warehouse.supervisor,
      status: warehouse.status === 'ACTIVE' ? 'Active' : 'Inactive',
      locations: 0,
      createdAt: warehouse.createdAt,
      updatedAt: warehouse.updatedAt,
    };
  }

  // 3. Create a new warehouse
  async create(dto: CreateWarehouseDto) {
    const context = this.getDevelopmentContext();

    const warehouse = await this.prisma.warehouse.create({
      data: {
        organizationId: context.organizationId,
        createdById: context.userId,
        name: dto.name,
        city: dto.city,
        address: dto.address?.trim() ?? '',
        supervisor: dto.supervisor?.trim() || 'Unassigned',
        status: 'ACTIVE',
      },
    });

    return {
      id: warehouse.id,
      name: warehouse.name,
      city: warehouse.city,
      address: warehouse.address ?? '',
      supervisor: warehouse.supervisor,
      status: warehouse.status === 'ACTIVE' ? 'Active' : 'Inactive',
      locations: 0,
      createdAt: warehouse.createdAt,
      updatedAt: warehouse.updatedAt,
    };
  }

  // 4. Update an existing warehouse (partial update & status toggle)
  async update(id: string, dto: UpdateWarehouseDto) {
    const context = this.getDevelopmentContext();

    // Verify existence first
    await this.findOne(id);

    const warehouse = await this.prisma.warehouse.update({
      where: {
        id_organizationId: {
          id,
          organizationId: context.organizationId,
        },
      },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.city !== undefined ? { city: dto.city } : {}),
        ...(dto.address !== undefined ? { address: dto.address.trim() } : {}),
        ...(dto.supervisor !== undefined
          ? { supervisor: dto.supervisor.trim() || 'Unassigned' }
          : {}),
        ...(dto.status !== undefined ? { status: dto.status } : {}),
      },
    });

    return {
      id: warehouse.id,
      name: warehouse.name,
      city: warehouse.city,
      address: warehouse.address ?? '',
      supervisor: warehouse.supervisor,
      status: warehouse.status === 'ACTIVE' ? 'Active' : 'Inactive',
      locations: 0,
      createdAt: warehouse.createdAt,
      updatedAt: warehouse.updatedAt,
    };
  }

  // 5. Delete a warehouse
  async remove(id: string) {
    const context = this.getDevelopmentContext();

    // Verify existence first
    await this.findOne(id);

    await this.prisma.warehouse.delete({
      where: {
        id_organizationId: {
          id,
          organizationId: context.organizationId,
        },
      },
    });

    return {
      success: true,
      message: `Warehouse with ID "${id}" was deleted successfully.`,
    };
  }
}
