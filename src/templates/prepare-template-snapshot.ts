import { BadRequestException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import type { Prisma } from '../generated/prisma/client.js';
import { TemplateFieldDto } from './dto/template-field.dto.js';

type SnapshotSource = {
  name: string;
  metadata: Prisma.JsonValue;
  fields: Prisma.JsonValue;
};

export function prepareTemplateSnapshot(
  source: SnapshotSource,
): {
  metadata: Prisma.InputJsonObject;
  fields: Prisma.InputJsonArray;
} {
  const errors: string[] = [];

  if (source.name.trim() === '') {
    errors.push('Enter a template name.');
  }

  const metadata: Prisma.InputJsonObject =
    source.metadata !== null &&
    typeof source.metadata === 'object' &&
    !Array.isArray(source.metadata)
      ? { ...source.metadata }
      : {};

  if (
    typeof metadata.warehouse !== 'string' ||
    metadata.warehouse.trim() === ''
  ) {
    errors.push('Select an applicable warehouse.');
  }

  if (
    !Array.isArray(source.fields) ||
    source.fields.length === 0 ||
    source.fields.length > 200
  ) {
    throw new BadRequestException([
      ...errors,
      'A published template must have between 1 and 200 fields.',
    ]);
  }

  const fields: Prisma.InputJsonObject[] = [];
  const fieldIds = new Set<string>();

  source.fields.forEach((rawField, index) => {
    const prefix = `Field ${index + 1}`;

    if (
      rawField === null ||
      typeof rawField !== 'object' ||
      Array.isArray(rawField)
    ) {
      errors.push(`${prefix}: Invalid configuration.`);
      return;
    }

    const field = plainToInstance(TemplateFieldDto, rawField);

    const structuralErrors = validateSync(field, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (structuralErrors.length > 0) {
      errors.push(`${prefix}: Invalid configuration.`);
      return;
    }

    if (fieldIds.has(field.id)) {
      errors.push(`${prefix}: Duplicate field ID.`);
    }

    fieldIds.add(field.id);

    if (field.label.trim() === '') {
      errors.push(`${prefix}: Enter a field label.`);
    }

    if (field.type === 'dropdown') {
      const options = field.options ?? [];

      if (
        options.length === 0 ||
        options.some((option) => option.trim() === '')
      ) {
        errors.push(`${prefix}: Add non-empty dropdown options.`);
      }

      const normalizedOptions = options.map((option) =>
        option.trim().toLowerCase(),
      );

      if (new Set(normalizedOptions).size !== options.length) {
        errors.push(`${prefix}: Remove duplicate dropdown options.`);
      }
    }

    if (
      field.type === 'number' &&
      field.min != null &&
      field.max != null &&
      field.min > field.max
    ) {
      errors.push(
        `${prefix}: Maximum must be greater than or equal to minimum.`,
      );
    }

    fields.push({
      id: field.id,
      type: field.type,
      label: field.label,
      required: field.required,

      ...(field.type === 'dropdown'
        ? { options: field.options ?? [] }
        : {}),

      ...(field.type === 'number'
        ? {
            min: field.min ?? null,
            max: field.max ?? null,
          }
        : {}),
    });
  });

  if (errors.length > 0) {
    throw new BadRequestException(errors);
  }

  return { metadata, fields };
}