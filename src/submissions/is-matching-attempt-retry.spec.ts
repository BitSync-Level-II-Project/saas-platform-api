import { describe, expect, it } from 'vitest';
import { isMatchingAttemptRetry } from './is-matching-attempt-retry.js';

const ids = { taskId: 'task-1', templateVersionId: 'version-3' };
const answers = [
  { fieldId: 'barcode', value: '001234' },
  { fieldId: 'count', value: 0 },
  { fieldId: 'damaged', value: false },
];
const saved = { submittedById: 'worker-a', submission: ids, answers };

describe('Submission attempt retry', () => {
  it('matches identical answers in a different order', () => {
    expect(
      isMatchingAttemptRetry(
        saved,
        { ...ids, answers: [...answers].reverse() },
        'worker-a',
      ),
    ).toBe(true);
  });

  it.each([
    [{ ...ids, taskId: 'task-2', answers }, 'worker-a'],
    [{ ...ids, templateVersionId: 'version-4', answers }, 'worker-a'],
    [{ ...ids, answers }, 'worker-b'],
    [{ ...ids, answers: [...answers, answers[0]] }, 'worker-a'],
    [{ ...ids, answers: answers.slice(1) }, 'worker-a'],
    [{ ...ids, answers: [{ fieldId: '   ', value: 'invalid' }] }, 'worker-a'],
    [
      {
        ...ids,
        answers: answers.map((answer) =>
          answer.fieldId === 'count' ? { ...answer, value: '0' } : answer,
        ),
      },
      'worker-a',
    ],
  ] as const)('does not match a changed attempt or worker', (input, worker) => {
    expect(isMatchingAttemptRetry(saved, input, worker)).toBe(false);
  });
});
