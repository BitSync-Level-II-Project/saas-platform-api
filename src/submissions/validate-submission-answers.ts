import { BadRequestException } from '@nestjs/common';

import {
  TemplateFieldType,
  type TemplateFieldDto,
} from '../templates/dto/template-field.dto.js';

import type { SubmissionAnswerDto } from './dto/create-submission.dto.js';
import { validateAnswerPresence } from './validate-answer-presence.js';

export function validateSubmissionAnswers(
  fields: readonly TemplateFieldDto[],
  answers: readonly SubmissionAnswerDto[],
): void {
  // Required fields, unknown IDs and duplicate answers.
  validateAnswerPresence(fields, answers);

  const provided = new Map(
    answers.map((answer) => [answer.fieldId, answer.value]),
  );

  const errors: string[] = [];

  for (const field of fields) {
    // Optional fields may be omitted.
    if (!provided.has(field.id)) {
      continue;
    }

    const value = provided.get(field.id);
    let valid = false;

    switch (field.type) {
      case TemplateFieldType.ShortText:
      case TemplateFieldType.LongText:
      case TemplateFieldType.Barcode:
        valid = typeof value === 'string';
        break;

      case TemplateFieldType.Number:
        valid = typeof value === 'number' && Number.isFinite(value);
        break;

      case TemplateFieldType.YesNo:
        valid = typeof value === 'boolean';
        break;

      case TemplateFieldType.Dropdown:
        valid =
          typeof value === 'string' &&
          (field.options?.includes(value) ?? false);
        break;

      default:
        errors.push(
          `${field.label}: ${field.type} answers are not supported yet.`,
        );
        continue;
    }

    if (!valid) {
      errors.push(`${field.label} has an invalid ${field.type} answer.`);
    }
  }

  if (errors.length > 0) {
    throw new BadRequestException(errors);
  }
}
