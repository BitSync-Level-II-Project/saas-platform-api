import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateWarehouseDto } from './dto/create-warehouse.dto.js';
import { ListWarehousesDto } from './dto/list-warehouses.dto.js';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto.js';
import { WarehousesService } from './warehouses.service.js';

@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  // 1. Register a new warehouse: POST /api/v1/warehouses
  @Post()
  create(@Body() dto: CreateWarehouseDto) {
    return this.warehousesService.create(dto);
  }

  // 2. Search & list warehouses: GET /api/v1/warehouses
  @Get()
  findAll(@Query() query: ListWarehousesDto) {
    return this.warehousesService.findAll(query);
  }

  // 3. Get warehouse details by ID: GET /api/v1/warehouses/:id
  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' }))
    id: string,
  ) {
    return this.warehousesService.findOne(id);
  }

  // 4. Update warehouse details or toggle status: PATCH /api/v1/warehouses/:id
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' }))
    id: string,
    @Body() dto: UpdateWarehouseDto,
  ) {
    return this.warehousesService.update(id, dto);
  }

  // 5. Delete a warehouse: DELETE /api/v1/warehouses/:id
  @Delete(':id')
  remove(
    @Param('id', new ParseUUIDPipe({ version: '4' }))
    id: string,
  ) {
    return this.warehousesService.remove(id);
  }
}
