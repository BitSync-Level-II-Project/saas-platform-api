import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import {
  TemplateFieldType,
  type TemplateFieldDto,
} from '../templates/dto/template-field.dto.js';

import { validateSubmissionAnswers } from './validate-submission-answers.js';

function field(type: TemplateFieldType): TemplateFieldDto {
  return {
    id: 'answer',
    label: 'Answer',
    required: true,
    type,
    options: ['Good', 'Needs attention'],
  };
}

const cases: Array<[TemplateFieldType, unknown, unknown]> = [
  [TemplateFieldType.ShortText, 'Checked', 123],
  [TemplateFieldType.LongText, 'Inspection completed.', false],
  [TemplateFieldType.Number, 0, '25'],
  [TemplateFieldType.YesNo, false, 'false'],
  [TemplateFieldType.Dropdown, 'Good', 'Unknown'],
  [TemplateFieldType.Barcode, '001234', 1234],
];

describe('Submission answer types', () => {
  it.each(cases)('validates %s answers', (type, validValue, invalidValue) => {
    const fields = [field(type)];

    expect(() =>
      validateSubmissionAnswers(fields, [
        { fieldId: 'answer', value: validValue },
      ]),
    ).not.toThrow();

    expect(() =>
      validateSubmissionAnswers(fields, [
        { fieldId: 'answer', value: invalidValue },
      ]),
    ).toThrow(BadRequestException);
  });

  it.each([NaN, Infinity, -Infinity])(
    'rejects a non-finite number: %s',
    (value) => {
      expect(() =>
        validateSubmissionAnswers(
          [field(TemplateFieldType.Number)],
          [{ fieldId: 'answer', value }],
        ),
      ).toThrow(BadRequestException);
    },
  );

  it('still rejects a missing required answer', () => {
    expect(() =>
      validateSubmissionAnswers([field(TemplateFieldType.ShortText)], []),
    ).toThrow(BadRequestException);
  });

  it('allows an optional field to be omitted', () => {
    const optional = {
      ...field(TemplateFieldType.ShortText),
      required: false,
    };

    expect(() => validateSubmissionAnswers([optional], [])).not.toThrow();
  });

  it('rejects unsupported photo answers', () => {
    expect(() =>
      validateSubmissionAnswers(
        [field(TemplateFieldType.Photo)],
        [{ fieldId: 'answer', value: 'photo.jpg' }],
      ),
    ).toThrow(BadRequestException);
  });
});
