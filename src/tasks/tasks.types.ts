import type { AssigneeType, TaskStatus } from '../generated/prisma/enums.js';

// What the submission module needs to know about a task.
export interface TaskSubmissionContext {
  taskId: string;
  organizationId: string;
  // Set only when the task is assigned to a worker (not a stationed phone)
  assignedWorkerId: string | null;
  assigneeType: AssigneeType | null;
  supervisorId: string;
  templateVersionId: string;
  status: TaskStatus;
}

// Events that move a task through the review workflow.
export type TaskWorkflowEvent = 'SUBMITTED' | 'APPROVED' | 'REJECTED';