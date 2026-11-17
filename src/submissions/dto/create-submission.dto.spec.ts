import 'reflect-metadata';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { CreateSubmissionDto } from './create-submission.dto.js';

const pipe = new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
});

function validBody() {
  return {
    taskId: '33333333-3333-4333-8333-333333333333',
    templateVersionId: '11111111-1111-4111-8111-111111111111',
    clientAttemptId: '22222222-2222-4222-8222-222222222222',
    answers: [
      {
        fieldId: 'temperature',
        value: 24.5,
      },
    ],
  };
}

function validateBody(body: unknown) {
  return pipe.transform(body, {
    type: 'body',
    metatype: CreateSubmissionDto,
  });
}

const invalidBodies: Array<[string, Record<string, unknown>]> = [
  ['missing task ID', { taskId: undefined }],
  ['blank task ID', { taskId: '   ' }],
  ['invalid version ID', { templateVersionId: 'wrong' }],
  ['invalid attempt ID', { clientAttemptId: 'wrong' }],
  ['answers must be a list', { answers: 'wrong' }],
  ['answer value is missing', { answers: [{ fieldId: 'temperature' }] }],
  ['client must not supply its role', { role: 'SUPERVISOR' }],
  [
    'client must not choose its organization',
    { organizationId: 'another-organization' },
  ],
];

describe('Create submission request validation', () => {
  it('accepts a structurally valid request', async () => {
    await expect(validateBody(validBody())).resolves.toMatchObject(validBody());
  });

  it.each(invalidBodies)('rejects %s', async (_description, changes) => {
    await expect(
      validateBody({
        ...validBody(),
        ...changes,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
