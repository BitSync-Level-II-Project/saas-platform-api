import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { validateAnswerPresence } from './validate-answer-presence.js';

const fields = [
  { id: 'reading', label: 'Reading', required: true },
  { id: 'note', label: 'Note', required: false },
];

describe('Submission answer presence', () => {
  it('accepts required and optional answers', () => {
    expect(() =>
      validateAnswerPresence(fields, [
        { fieldId: 'reading', value: 25 },
        { fieldId: 'note', value: 'Checked' },
      ]),
    ).not.toThrow();
  });

  it('rejects a missing required answer', () => {
    expect(() => validateAnswerPresence(fields, [])).toThrow(
      BadRequestException,
    );
  });

  it('rejects blank required text', () => {
    expect(() =>
      validateAnswerPresence(fields, [{ fieldId: 'reading', value: '   ' }]),
    ).toThrow(BadRequestException);
  });

  it('rejects an unknown field', () => {
    expect(() =>
      validateAnswerPresence(fields, [
        { fieldId: 'reading', value: 25 },
        { fieldId: 'unknown', value: 10 },
      ]),
    ).toThrow(BadRequestException);
  });

  it('rejects duplicate answers', () => {
    expect(() =>
      validateAnswerPresence(fields, [
        { fieldId: 'reading', value: 25 },
        { fieldId: 'reading', value: 26 },
      ]),
    ).toThrow(BadRequestException);
  });

  it.each([0, false])('counts %s as a provided answer', (value) => {
    expect(() =>
      validateAnswerPresence(fields, [{ fieldId: 'reading', value }]),
    ).not.toThrow();
  });

  it('allows an optional answer to be omitted', () => {
    expect(() =>
      validateAnswerPresence(fields, [{ fieldId: 'reading', value: 25 }]),
    ).not.toThrow();
  });
});
