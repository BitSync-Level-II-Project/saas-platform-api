import { BadRequestException } from '@nestjs/common';
import type { TemplateFieldDto } from '../templates/dto/template-field.dto.js';
import type { SubmissionAnswerDto } from './dto/create-submission.dto.js';

type PresenceField = Pick<TemplateFieldDto, 'id' | 'label' | 'required'>;

function isEmpty(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    (typeof value === 'string' && value.trim() === '') ||
    (Array.isArray(value) && value.length === 0)
  );
}

export function validateAnswerPresence(
  fields: readonly PresenceField[],
  answers: readonly SubmissionAnswerDto[],
): void {
  const knownFields = new Map(fields.map((field) => [field.id, field]));

  const provided = new Map<string, unknown>();
  const errors: string[] = [];

  for (const answer of answers) {
    if (!knownFields.has(answer.fieldId)) {
      errors.push(`Unknown field: ${answer.fieldId}.`);
    }

    if (provided.has(answer.fieldId)) {
      errors.push(`Duplicate answer for field: ${answer.fieldId}.`);
    }

    provided.set(answer.fieldId, answer.value);
  }

  for (const field of fields) {
    if (field.required && isEmpty(provided.get(field.id))) {
      errors.push(`${field.label} is required.`);
    }
  }

  if (errors.length > 0) {
    throw new BadRequestException(errors);
  }
}
