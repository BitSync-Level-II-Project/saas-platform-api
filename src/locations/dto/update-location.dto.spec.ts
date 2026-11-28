import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { UpdateLocationDto } from './update-location.dto.js';
import { SiteStatus } from '../../generated/prisma/enums.js';

describe('UpdateLocationDto validation', () => {
  it('should pass with an empty payload (empty partial update)', async () => {
    const plain = {};
    const dto = plainToInstance(UpdateLocationDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should pass with a single-field name update', async () => {
    const plain = { name: 'Renamed Loading Bay' };
    const dto = plainToInstance(UpdateLocationDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.name).toBe('Renamed Loading Bay');
  });

  it('should pass with a partial update including status toggle', async () => {
    const plain = { status: 'INACTIVE' };
    const dto = plainToInstance(UpdateLocationDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.status).toBe(SiteStatus.INACTIVE);
  });

  it('should trim leading and trailing whitespace from name', async () => {
    const plain = { name: '   Aisle 3 North   ' };
    const dto = plainToInstance(UpdateLocationDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.name).toBe('Aisle 3 North');
  });

  it('should reject a blank name containing only whitespace', async () => {
    const plain = { name: '     ' };
    const dto = plainToInstance(UpdateLocationDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const nameError = errors.find((e) => e.property === 'name');
    expect(nameError).toBeDefined();
    expect(nameError?.constraints).toHaveProperty('isNotEmpty');
  });

  it('should reject an empty string for name', async () => {
    const plain = { name: '' };
    const dto = plainToInstance(UpdateLocationDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const nameError = errors.find((e) => e.property === 'name');
    expect(nameError).toBeDefined();
    expect(nameError?.constraints).toHaveProperty('isNotEmpty');
  });

  it('should reject null for name', async () => {
    const plain = { name: null };
    const dto = plainToInstance(UpdateLocationDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const nameError = errors.find((e) => e.property === 'name');
    expect(nameError).toBeDefined();
  });

  it('should allow null for description to clear it in the database', async () => {
    const plain = { description: null };
    const dto = plainToInstance(UpdateLocationDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.description).toBeNull();
  });

  it('should allow null for assignedWork to clear it', async () => {
    const plain = { assignedWork: null };
    const dto = plainToInstance(UpdateLocationDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.assignedWork).toBeNull();
  });

  it('should accept valid SiteStatus enum values', async () => {
    const plain = { status: 'ACTIVE' };
    const dto = plainToInstance(UpdateLocationDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.status).toBe(SiteStatus.ACTIVE);
  });

  it('should normalize lowercase status string to uppercase enum', async () => {
    const plain = { status: 'inactive' };
    const dto = plainToInstance(UpdateLocationDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.status).toBe(SiteStatus.INACTIVE);
  });

  it('should reject an invalid status value', async () => {
    const plain = { status: 'DELETED' };
    const dto = plainToInstance(UpdateLocationDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const statusError = errors.find((e) => e.property === 'status');
    expect(statusError).toBeDefined();
    expect(statusError?.constraints).toHaveProperty('isEnum');
  });

  it('should reject name exceeding 100 characters', async () => {
    const plain = { name: 'X'.repeat(101) };
    const dto = plainToInstance(UpdateLocationDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const nameError = errors.find((e) => e.property === 'name');
    expect(nameError).toBeDefined();
    expect(nameError?.constraints).toHaveProperty('maxLength');
  });
});
