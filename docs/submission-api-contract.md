# Shared Submission API Contract

Status: Proposed for team review

## Goal

Save answers against an exact published template version.
Tasks and Collected Data must use the same submission records.

## Proposed input

- clientSubmissionId: reused when retrying the same submission.
- templateVersionId: the published template response's versionId.
- taskId: format and requiredness to be agreed with the Task owner.
- answers: fieldId and typed value.

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