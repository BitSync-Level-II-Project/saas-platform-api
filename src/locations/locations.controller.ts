import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto.js';
import { UpdateLocationDto } from './dto/update-location.dto.js';
import { LocationsService } from './locations.service.js';

@Controller('warehouses/:warehouseId/locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  // 1. List all locations in a warehouse: GET /api/v1/warehouses/:warehouseId/locations
  @Get()
  findAll(
    @Param('warehouseId', new ParseUUIDPipe({ version: '4' }))
    warehouseId: string,
  ) {
    return this.locationsService.findAll(warehouseId);
  }

  // 2. Get a single location: GET /api/v1/warehouses/:warehouseId/locations/:id
  @Get(':id')
  findOne(
    @Param('warehouseId', new ParseUUIDPipe({ version: '4' }))
    warehouseId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' }))
    id: string,
  ) {
    return this.locationsService.findOne(warehouseId, id);
  }

  // 3. Create a location in a warehouse: POST /api/v1/warehouses/:warehouseId/locations
  @Post()
  create(
    @Param('warehouseId', new ParseUUIDPipe({ version: '4' }))
    warehouseId: string,
    @Body() dto: CreateLocationDto,
  ) {
    return this.locationsService.create(warehouseId, dto);
  }

  // 4. Update a location: PATCH /api/v1/warehouses/:warehouseId/locations/:id
  @Patch(':id')
  update(
    @Param('warehouseId', new ParseUUIDPipe({ version: '4' }))
    warehouseId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' }))
    id: string,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.locationsService.update(warehouseId, id, dto);
  }

  // 5. Delete a location: DELETE /api/v1/warehouses/:warehouseId/locations/:id
  @Delete(':id')
  remove(
    @Param('warehouseId', new ParseUUIDPipe({ version: '4' }))
    warehouseId: string,
    @Param('id', new ParseUUIDPipe({ version: '4' }))
    id: string,
  ) {
    return this.locationsService.remove(warehouseId, id);
  }
}
