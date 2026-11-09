import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client.js';
import { prepareTemplateSnapshot } from './prepare-template-snapshot.js';

const field = {
  id: 'equipment-id',
  type: 'short-text',
  label: 'Equipment ID',
  required: true,
};

function draft(fields: Prisma.JsonValue) {
  return {
    name: 'Equipment Inspection',
    metadata: { warehouse: 'colombo' },
    fields,
  };
}

describe('prepareTemplateSnapshot', () => {
  it('accepts a complete template', () => {
    const result = prepareTemplateSnapshot(draft([field]));

    expect(result.fields).toEqual([field]);
  });

  const invalidCases: Array<{
    name: string;
    fields: Prisma.JsonValue;
  }> = [
    { name: 'empty fields', fields: [] },
    {
      name: 'blank label',
      fields: [{ ...field, label: ' ' }],
    },
    {
      name: 'duplicate field IDs',
      fields: [field, { ...field, label: 'Another field' }],
    },
    {
      name: 'unsupported field type',
      fields: [{ ...field, type: 'unsupported' }],
    },
    {
      name: 'duplicate dropdown options',
      fields: [{
        ...field,
        type: 'dropdown',
        options: ['Good', ' good '],
      }],
    },
    {
      name: 'invalid number range',
      fields: [{
        ...field,
        type: 'number',
        min: 10,
        max: 1,
      }],
    },
  ];

  it.each(invalidCases)('rejects $name', ({ fields }) => {
    expect(() => prepareTemplateSnapshot(draft(fields)))
      .toThrow(BadRequestException);
  });
});