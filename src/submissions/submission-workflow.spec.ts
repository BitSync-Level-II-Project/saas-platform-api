import { ConflictException, ForbiddenException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import {
  taskStatusAfterReview,
  taskStatusAfterSubmission,
} from './submission-workflow.js';

describe('Submission workflow', () => {
  it('moves an assigned task into review', () => {
    expect(taskStatusAfterSubmission('Assigned')).toBe('In review');
  });

  it('allows a new attempt after rejection', () => {
    const rejectedStatus = taskStatusAfterReview(
      'In review',
      'Rejected',
      'SUPERVISOR',
    );

    expect(rejectedStatus).toBe('In progress');

    expect(taskStatusAfterSubmission(rejectedStatus)).toBe('In review');
  });

  it('blocks another attempt while review is pending', () => {
    expect(() => taskStatusAfterSubmission('In review')).toThrow(
      ConflictException,
    );
  });

  it('blocks another attempt after completion', () => {
    expect(() => taskStatusAfterSubmission('Complete')).toThrow(
      ConflictException,
    );
  });

  it('completes a task after supervisor approval', () => {
    expect(taskStatusAfterReview('In review', 'Approved', 'SUPERVISOR')).toBe(
      'Complete',
    );
  });

  it('prevents a manager from reviewing', () => {
    expect(() =>
      taskStatusAfterReview('In review', 'Approved', 'MANAGER'),
    ).toThrow(ForbiddenException);
  });

  it('prevents a worker from reviewing', () => {
    expect(() =>
      taskStatusAfterReview('In review', 'Approved', 'WORKER'),
    ).toThrow(ForbiddenException);
  });

  it('blocks another review after completion', () => {
    expect(() =>
      taskStatusAfterReview('Complete', 'Rejected', 'SUPERVISOR'),
    ).toThrow(ConflictException);
  });
});
