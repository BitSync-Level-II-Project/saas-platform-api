import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { UpdateWarehouseDto } from './update-warehouse.dto.js';
import { SiteStatus } from '../../generated/prisma/enums.js';

describe('UpdateWarehouseDto validation', () => {
  it('should pass with a valid partial update', async () => {
    const plain = { name: 'Colombo Main Warehouse', city: 'Colombo' };
    const dto = plainToInstance(UpdateWarehouseDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.name).toBe('Colombo Main Warehouse');
    expect(dto.city).toBe('Colombo');
  });

  it('should reject a blank name containing only whitespace after trimming', async () => {
    const plain = { name: '   ' };
    const dto = plainToInstance(UpdateWarehouseDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const nameError = errors.find((e) => e.property === 'name');
    expect(nameError).toBeDefined();
    expect(nameError?.constraints).toHaveProperty('isNotEmpty');
  });

  it('should reject an empty string for name', async () => {
    const plain = { name: '' };
    const dto = plainToInstance(UpdateWarehouseDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const nameError = errors.find((e) => e.property === 'name');
    expect(nameError).toBeDefined();
  });

  it('should reject null for name', async () => {
    const plain = { name: null };
    const dto = plainToInstance(UpdateWarehouseDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const nameError = errors.find((e) => e.property === 'name');
    expect(nameError).toBeDefined();
  });

  it('should reject a blank city containing only whitespace after trimming', async () => {
    const plain = { city: '   ' };
    const dto = plainToInstance(UpdateWarehouseDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const cityError = errors.find((e) => e.property === 'city');
    expect(cityError).toBeDefined();
    expect(cityError?.constraints).toHaveProperty('isNotEmpty');
  });

  it('should reject null for city', async () => {
    const plain = { city: null };
    const dto = plainToInstance(UpdateWarehouseDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const cityError = errors.find((e) => e.property === 'city');
    expect(cityError).toBeDefined();
  });

  it('should explicitly accept and handle null address for optional field', async () => {
    const plain = { address: null };
    const dto = plainToInstance(UpdateWarehouseDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.address).toBeNull();
  });

  it('should explicitly accept and handle null supervisor for optional field', async () => {
    const plain = { supervisor: null };
    const dto = plainToInstance(UpdateWarehouseDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.supervisor).toBeNull();
  });

  it('should transform and accept case-insensitive status', async () => {
    const plain = { status: 'active' };
    const dto = plainToInstance(UpdateWarehouseDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.status).toBe(SiteStatus.ACTIVE);
  });

  it('should reject an invalid status enum value', async () => {
    const plain = { status: 'INVALID_STATUS' };
    const dto = plainToInstance(UpdateWarehouseDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const statusError = errors.find((e) => e.property === 'status');
    expect(statusError).toBeDefined();
  });
});
