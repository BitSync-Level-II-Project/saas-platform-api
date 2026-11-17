import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { CreateLocationDto } from './create-location.dto.js';
import { SiteStatus } from '../../generated/prisma/enums.js';

describe('CreateLocationDto validation', () => {
  it('should pass with a valid complete payload', async () => {
    const plain = {
      name: 'Cold Storage Room A',
      description: 'Pharmaceutical grade temperature controlled area',
      assignedWork: '5 tasks',
      status: 'ACTIVE',
    };
    const dto = plainToInstance(CreateLocationDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.name).toBe('Cold Storage Room A');
    expect(dto.description).toBe(
      'Pharmaceutical grade temperature controlled area',
    );
    expect(dto.assignedWork).toBe('5 tasks');
    expect(dto.status).toBe(SiteStatus.ACTIVE);
  });

  it('should pass with minimal payload containing only name', async () => {
    const plain = { name: 'Dock 1' };
    const dto = plainToInstance(CreateLocationDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.name).toBe('Dock 1');
  });

  it('should trim leading and trailing whitespace from string fields', async () => {
    const plain = {
      name: '   Machine Bay 4   ',
      description: '   Heavy equipment sector   ',
    };
    const dto = plainToInstance(CreateLocationDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.name).toBe('Machine Bay 4');
    expect(dto.description).toBe('Heavy equipment sector');
  });

  it('should reject a missing name', async () => {
    const plain = {};
    const dto = plainToInstance(CreateLocationDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const nameError = errors.find((e) => e.property === 'name');
    expect(nameError).toBeDefined();
  });

  it('should reject an empty string for name', async () => {
    const plain = { name: '' };
    const dto = plainToInstance(CreateLocationDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const nameError = errors.find((e) => e.property === 'name');
    expect(nameError).toBeDefined();
    expect(nameError?.constraints).toHaveProperty('isNotEmpty');
  });

  it('should reject a blank name containing only whitespace after trimming', async () => {
    const plain = { name: '     ' };
    const dto = plainToInstance(CreateLocationDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const nameError = errors.find((e) => e.property === 'name');
    expect(nameError).toBeDefined();
    expect(nameError?.constraints).toHaveProperty('isNotEmpty');
  });

  it('should reject non-string name (e.g. number)', async () => {
    const plain = { name: 12345 };
    const dto = plainToInstance(CreateLocationDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const nameError = errors.find((e) => e.property === 'name');
    expect(nameError).toBeDefined();
    expect(nameError?.constraints).toHaveProperty('isString');
  });

  it('should reject a name exceeding 100 characters', async () => {
    const plain = { name: 'A'.repeat(101) };
    const dto = plainToInstance(CreateLocationDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const nameError = errors.find((e) => e.property === 'name');
    expect(nameError).toBeDefined();
    expect(nameError?.constraints).toHaveProperty('maxLength');
  });

  it('should allow null or undefined for optional description', async () => {
    const plain = { name: 'Aisle B', description: null };
    const dto = plainToInstance(CreateLocationDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.description).toBeNull();
  });

  it('should accept valid SiteStatus enum values', async () => {
    const plain = { name: 'Zone C', status: 'INACTIVE' };
    const dto = plainToInstance(CreateLocationDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.status).toBe(SiteStatus.INACTIVE);
  });

  it('should normalize lowercase status string to uppercase enum', async () => {
    const plain = { name: 'Zone D', status: 'active' };
    const dto = plainToInstance(CreateLocationDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
    expect(dto.status).toBe(SiteStatus.ACTIVE);
  });

  it('should reject an invalid status string', async () => {
    const plain = { name: 'Zone E', status: 'ARCHIVED' };
    const dto = plainToInstance(CreateLocationDto, plain);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    const statusError = errors.find((e) => e.property === 'status');
    expect(statusError).toBeDefined();
    expect(statusError?.constraints).toHaveProperty('isEnum');
  });
});
