import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';

export type TaskWorkflowStatus =
  'Assigned' | 'In progress' | 'In review' | 'Complete';

export type ReviewDecision = 'Approved' | 'Rejected';

export type ReviewerRole = 'MANAGER' | 'SUPERVISOR' | 'WORKER';

export function taskStatusAfterSubmission(
  currentStatus: TaskWorkflowStatus,
): TaskWorkflowStatus {
  const canSubmit =
    currentStatus === 'Assigned' || currentStatus === 'In progress';

  if (!canSubmit) {
    throw new ConflictException(
      'This task cannot accept another attempt right now.',
    );
  }

  return 'In review';
}

export function taskStatusAfterReview(
  currentStatus: TaskWorkflowStatus,
  decision: ReviewDecision,
  reviewerRole: ReviewerRole,
): TaskWorkflowStatus {
  if (reviewerRole !== 'SUPERVISOR') {
    throw new ForbiddenException('Only supervisors can review submissions.');
  }

  if (decision !== 'Approved' && decision !== 'Rejected') {
    throw new BadRequestException('Choose Approved or Rejected.');
  }

  if (currentStatus !== 'In review') {
    throw new ConflictException(
      'Only tasks in review can receive a review decision.',
    );
  }

  return decision === 'Approved' ? 'Complete' : 'In progress';
}
