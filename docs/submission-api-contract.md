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

## Decisions to agree

- Must every submission belong to a task?
- Who can submit and who can review?
- What do approve, reject and recheck mean?
- How does each review decision affect task status?
- Is a correction a new attempt or an edit?
- Are evidence uploads required in the first milestone?

## Required checks

- Valid answers are saved and survive an API restart.
- Invalid answers are rejected without partial data.
- Retrying does not create duplicates.
- Another organization cannot access the record.
- A review records the reviewer, time and note.