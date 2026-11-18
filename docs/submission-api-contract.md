# Shared Submission API Contract

Status: Proposed for team review

## Goal

Save answers against an exact published template version.
Tasks and Collected Data must use the same submission records.

## Proposed input

- clientAttemptId: a UUID v4 generated once for each new attempt.
  Reuse the same ID when retrying that attempt.
- templateVersionId: must match the published version linked to the task.
- taskId: required; must identify a task assigned to the submitting worker.
- answers: fieldId and typed value.

## Retry and duplicate prevention

- Generate clientAttemptId once when a new attempt is prepared.
- Retrying the same attempt must reuse its ID and payload.
- Preserve the ID and payload while a request is awaiting confirmation.
- A correction after rejection is a new attempt and gets a new ID.
- The server must not create another record for an identical retry.
- The first successful creation returns 201.
- An authorized identical retry returns the existing result with 200.
- Reusing an ID with different task, version or answers returns 409.
- A retry of an already saved attempt must not create another attempt,
  even if that task has since been approved.
- Identity and organization come from trusted server context.

Organization and submitter identity must come from trusted
server context, not from client claims.

## Proposed endpoints

- POST /api/v1/submissions
- GET /api/v1/submissions
- GET /api/v1/submissions/:id
- POST /api/v1/submissions/:id/reviews

These endpoints are proposed and are not implemented yet.

## Confirmed business rules

- Managers create forms.
- Supervisors create tasks using published forms.
- Workers submit only against tasks assigned to them.
- Only supervisors can approve or reject submissions.
- Each task has one submission record.
- Each submission can have multiple attempts.
- Sending an attempt moves the task to In review.
- Approval moves the task to Complete.
- Rejection moves the task back to In progress.
- After rejection, the worker sends a new attempt.
- Previous attempts and reviews remain in history.
- Approved submissions cannot receive another attempt
  under this workflow.

## Required checks

- Valid answers are saved and survive an API restart.
- Invalid answers are rejected without partial data.
- Retrying does not create duplicates.
- Another organization cannot access the record.
- A review records the reviewer, time and note.