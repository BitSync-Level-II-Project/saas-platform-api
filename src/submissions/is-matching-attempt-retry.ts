type RetryPayload = {
  taskId: string;
  templateVersionId: string;
  answers: readonly { fieldId: string; value: unknown }[];
};

type SavedAttempt = {
  submittedById: string;
  answers: unknown;
  submission: Pick<RetryPayload, 'taskId' | 'templateVersionId'>;
};

function toAnswerMap(answers: unknown) {
  if (!Array.isArray(answers)) return null;

  const result = new Map<string, string | number | boolean>();

  for (const answer of answers as unknown[]) {
    if (
      answer === null ||
      typeof answer !== 'object' ||
      !('fieldId' in answer) ||
      typeof answer.fieldId !== 'string' ||
      answer.fieldId.trim().length === 0 ||
      !('value' in answer) ||
      result.has(answer.fieldId)
    )
      return null;

    const value = answer.value;
    if (
      typeof value !== 'string' &&
      typeof value !== 'boolean' &&
      !(typeof value === 'number' && Number.isFinite(value))
    )
      return null;

    result.set(answer.fieldId, value);
  }

  return result;
}

export function isMatchingAttemptRetry(
  saved: SavedAttempt,
  input: RetryPayload,
  workerId: string,
): boolean {
  if (
    saved.submittedById !== workerId ||
    saved.submission.taskId !== input.taskId ||
    saved.submission.templateVersionId !== input.templateVersionId
  )
    return false;

  const previous = toAnswerMap(saved.answers);
  const incoming = toAnswerMap(input.answers);

  if (!previous || !incoming || previous.size !== incoming.size) return false;

  return [...previous].every(
    ([fieldId, value]) => incoming.get(fieldId) === value,
  );
}
