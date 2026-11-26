# SiteTrace Worker Mobile API Contract

**Status:** Proposed — awaiting Task API and Auth confirmation  
**Work item:** [SCRUM-22 — Collect and Submit Data](https://gunasekarapdvp.atlassian.net/browse/SCRUM-22)  
**Related contract:** [Shared Submission API Contract](./submission-api-contract.md)

## 1. Goal

A signed-in worker can open a task assigned to them, fill the exact published
form version linked to that task, and submit answers. The app shows the task
state confirmed by the API. If the worker loses the response and retries, the
API returns the original attempt without creating a duplicate.

This phase covers assigned-task reads and answer submission. Live photo upload,
background synchronization, and supervisor review screens are separate work.

## 2. Ownership and decisions to confirm

| Owner | Responsibility |
|---|---|
| Kanchana — Task API | Worker-scoped task list/detail, pinned form data, and task workflow updates inside the submission transaction. |
| Damith — Submission API and worker mobile | Submission endpoint, validation, durable retry, response mapping, and mobile verification. |
| Auth owner | Worker sign-in, session renewal or re-authentication, and trusted worker/organization/role context in the API. |

Before connecting mobile to the live API, agree on:

- [ ] Final route paths and field names, including the task list and detail response.
- [ ] How mobile authenticates requests, and what it does when a session expires.
- [ ] The `403`/`404` policy, validation errors, and conflict error codes below.
- [ ] How the task write checks assignment, template version, and allowed state
      in the same transaction as the submission write.
- [ ] A shared local test fixture and the order in which the dependencies will
      be integrated.

## 3. Authentication and access

All three routes require an authenticated worker session. The API derives the
worker ID, organization ID, and role from trusted session context. Do not accept
worker ID, organization ID, or role from the request body as proof of identity.
The auth owner will confirm the session transport; this contract does not assume
bearer tokens or cookies.

A worker can read or submit only for tasks in their organization that are
currently assigned to them as a worker and are not archived. The general
development task routes are not a substitute for these checks.

Proposed policy: return `401` for an absent or expired session; `403` if an
authenticated user does not have the worker role; and `404` if the task is
missing, archived, assigned to someone else, or in another organization.
The task response must not reveal which of those `404` cases occurred.

## 4. Read assigned tasks

Paths below include the `/api/v1` prefix.

| Method and path | Response |
|---|---|
| `GET /api/v1/worker/tasks` | `200`. Return only tasks assigned to this worker. An empty result is `{ "items": [] }`. Agree any pagination before wiring the list. |
| `GET /api/v1/worker/tasks/:taskId` | `200`. Return one authorized task with the published form version pinned to it. |

Proposed list response:

```json
{
  "items": [
    {
      "id": "11111111-1111-4111-8111-111111111111",
      "code": "TSK-1042",
      "title": "Morning equipment check",
      "status": "ASSIGNED",
      "warehouse": "Colombo",
      "location": "Machine room",
      "dueDate": "2026-11-30"
    }
  ]
}
```

Proposed detail response:

```json
{
  "id": "11111111-1111-4111-8111-111111111111",
  "code": "TSK-1042",
  "title": "Morning equipment check",
  "status": "ASSIGNED",
  "warehouse": "Colombo",
  "location": "Machine room",
  "dueDate": "2026-11-30",
  "supervisorName": "Test Supervisor",
  "instructions": "Record the equipment code and current reading.",
  "templateVersionId": "22222222-2222-4222-8222-222222222222",
  "evidencePolicy": "optional",
  "form": {
    "versionId": "22222222-2222-4222-8222-222222222222",
    "version": 3,
    "name": "Equipment inspection",
    "fields": [
      {
        "id": "equipment-code",
        "type": "barcode",
        "label": "Equipment code",
        "required": true
      },
      {
        "id": "reading",
        "type": "number",
        "label": "Current reading",
        "required": true
      },
      {
        "id": "clear",
        "type": "yes-no",
        "label": "Is the work area clear?",
        "required": true
      }
    ]
  }
}
```

- Task states are `ASSIGNED`, `IN_PROGRESS`, `IN_REVIEW`, and `COMPLETE`.
  Mobile maps these values to display labels.
- `form.versionId` must equal `templateVersionId`. Return the pinned published
  version even if a manager has published a newer version.
- Field IDs are stable within that version. Include `options` for dropdown
  fields. Confirm any additional field rules before the client relies on them.
- For the first live test, use field types supported by both mobile and API:
  `short-text`, `number`, `yes-no`, `barcode`, and `dropdown`. If the app cannot
  render an answer needed by the form, show a clear message and block submission.
- `evidencePolicy` is proposed as `optional` or `required`. Block live submission
  for required-photo tasks until the upload contract is ready. Do not use a local
  photo path as evidence in the API request.

## 5. Submit an attempt

**`POST /api/v1/submissions`**

Proposed request:

```json
{
  "taskId": "11111111-1111-4111-8111-111111111111",
  "templateVersionId": "22222222-2222-4222-8222-222222222222",
  "clientAttemptId": "33333333-3333-4333-8333-333333333333",
  "answers": [
    { "fieldId": "equipment-code", "value": "001234" },
    { "fieldId": "reading", "value": 0 },
    { "fieldId": "clear", "value": false }
  ]
}
```

Mobile generates one UUID v4 per new attempt and saves it with the exact answers
before sending. Preserve barcode strings with leading zeros, numbers such as
`0`, and booleans such as `false`. Omit unanswered optional fields rather than
sending `null`. The API validates required answers, types, allowed dropdown
values, unknown fields, and duplicate field IDs against the pinned version.

Proposed success response:

```json
{
  "submissionId": "44444444-4444-4444-8444-444444444444",
  "attemptId": "55555555-5555-4555-8555-555555555555",
  "clientAttemptId": "33333333-3333-4333-8333-333333333333",
  "taskId": "11111111-1111-4111-8111-111111111111",
  "templateVersionId": "22222222-2222-4222-8222-222222222222",
  "taskStatus": "IN_REVIEW"
}
```

- **`201 Created`:** The API saved a new attempt and moved the task to
  `IN_REVIEW`. Save the attempt and change task status in one DB transaction.
  If either fails, neither change should remain.
- **`200 OK`:** An authorized identical retry returns the original submission
  and attempt IDs plus the current task state. No new attempt is created.
- **`409 Conflict`:** Reusing the same UUID with different answers, task, or
  template version is a conflict. An identical retry must be resolved before
  applying the rules for creating a new attempt. Otherwise a lost response
  would cause a retry to fail just because the task had moved to `IN_REVIEW`.

For a new attempt, allow only `ASSIGNED` or `IN_PROGRESS`. Check organization,
worker assignment, pinned version, and allowed state when committing the task
update so reassignment cannot race a submission. Reuse the task service's
transaction-aware helpers and existing submission uniqueness rules. Concurrent
identical requests must converge on one stored attempt: the retry returns that
attempt rather than creating another one.

Each task has one submission record and may have multiple attempts. Only a
supervisor can review. Approval means `COMPLETE`. Rejection means `IN_PROGRESS`;
a worker's correction is a **new attempt with a new UUID**, and previous
attempts and reviews remain in history. A timeout retry uses the **old UUID and
the same answers**.

## 6. Errors and mobile behavior

Proposed envelope for worker errors. Agree this with the existing API exception
format before wiring the mobile adapter.

```json
{
  "code": "INVALID_ANSWERS",
  "message": "Check the form answers.",
  "fieldErrors": [
    { "fieldId": "reading", "message": "Enter a number." }
  ]
}
```

| Result | Proposed code | Mobile action |
|---|---|---|
| `400` Invalid request or answers | `INVALID_REQUEST` / `INVALID_ANSWERS` | Show the error. For definitively rejected answers, allow correction and create a new attempt when sending the corrected payload. |
| `401` No valid session | `AUTH_REQUIRED` | Preserve pending data locally; resume only after the same worker signs in again. |
| `403` Role not allowed | `WORKER_ROLE_REQUIRED` | Show access denied. |
| `404` Task unavailable | `TASK_NOT_FOUND` | Return to the refreshed task list. Do not show cached details for a task that is no longer authorized. |
| `409` UUID used for a different request | `ATTEMPT_PAYLOAD_CONFLICT` | Show a conflict. Do not generate a new UUID and resend automatically. |
| `409` Pinned version or task state changed | `TEMPLATE_VERSION_MISMATCH` / `TASK_STATE_CONFLICT` | Refresh. Never send old answers to a newer form automatically. |
| Timeout or unknown outcome | No reliable receipt | Keep the saved attempt pending. Retry the same UUID and answers after reconnecting. |

Mobile confirms the pending attempt only when the receipt matches its
`taskId`, `templateVersionId`, and `clientAttemptId`. A task status by itself
does not identify which attempt was saved. Scope saved live records by
organization + worker + task + template version and keep them separate from
demo data.

## 7. Acceptance checks

Use a local PostgreSQL test setup: one organization, a published form without
required photos, a task assigned to Worker A, and a second worker who is not
assigned. Include another organization in the API integration tests.

- [ ] Worker A sees the assigned task and the pinned form. Publishing a newer
      version does not change the form for that existing task.
- [ ] A valid send returns `201`, stores one attempt, and moves the task to
      `IN_REVIEW`. Reopening the mobile app shows server-confirmed status.
- [ ] After the first request reaches the API, lose the response and retry with
      the same UUID and answers. The API returns the original attempt with `200`.
- [ ] Parallel identical requests leave one stored attempt. Changing the answers
      while keeping the UUID returns `409`.
- [ ] An invalid required answer leaves no attempt or task status change.
- [ ] Worker B, a worker from another organization, and an unauthenticated
      caller cannot read or submit Worker A's task.
- [ ] A task reassigned before the submission takes effect cannot be submitted
      by the previous worker.
- [ ] Record the API commit, mobile commit, database test results, and phone
      model/OS. Label fixture-only runs separately from live results.