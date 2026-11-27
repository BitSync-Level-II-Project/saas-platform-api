# SiteTrace Backend — Module 5: Events, Alerts, Notifications & Audit Trails

**Author:** Member 05 — Nelithma (Index: 245057J)  
**Team:** BitSync (ITM 01) — IS 2901 Software Development Project  
**Client:** Nagarro  
**Branch:** `feature/events-audit-api` (based on `origin/chore/api-foundation`)

---

## 1. Overview
Module 5 provides the real-time event processing and operational governance spine for SiteTrace:
- **Operational Event Ingestion**: Ingests field inspection and stationed phone telemetry data with idempotency (`clientEventId` deduplication).
- **Dynamic Rule Engine**: Evaluates incoming readings against configurable multi-tenant conditions (`GT`, `GTE`, `LT`, `LTE`, `EQ`, `NEQ`, `BETWEEN`) with cooldown throttling (`cooldownMinutes`) to prevent alert flooding.
- **Alert Lifecycle State Machine**: Tracks alert status (`NEW` -> `ACKNOWLEDGED` -> `ESCALATED` / `RESOLVED`), action logs, escalation levels, and mandatory notes.
- **In-App Notifications**: Automatically dispatches alerts to targeted roles (`SUPERVISOR`, `MANAGER`), tracks unread badges, and supports user notification preferences.
- **Immutable Operational Audit Trail**: Append-only log recording actor, role, action, resource, timestamp, and JSON diffs (`before` / `after`).
- **Reference Data Provider**: Supplies warehouse sites, locations, stationed devices, and templates to immediately feed frontend UI dropdowns.

---

## 2. Directory Structure

```
src/alerts/
├── dto/
│   ├── alert.dto.ts              # Validation DTOs for alerts and actions
│   ├── audit-log.dto.ts          # Validation DTOs for audit logs
│   ├── event.dto.ts              # Ingest event & result DTOs
│   ├── notification.dto.ts       # Notification & preference DTOs
│   └── rule.dto.ts               # Automation rule CRUD & filter DTOs
├── engine/
│   ├── rule-evaluator.ts         # Math operator comparisons, path lookup & message formatting
│   └── rule-evaluator.spec.ts    # Unit test suite for evaluator engine
├── alerts.controller.ts          # /api/v1/alerts endpoints
├── alerts.service.ts             # Alert lifecycle state machine
├── alerts.service.spec.ts        # Unit test suite for state machine
├── alerts.module.ts              # NestJS Module definition
├── automation-rules.controller.ts# /api/v1/automation-rules endpoints
├── automation-rules.service.ts   # Rule management service
├── events.controller.ts          # /api/v1/events endpoints
├── events.service.ts             # Ingestion, deduplication & rule execution
├── events.service.spec.ts        # Unit test suite for ingestion & cooldown
├── notifications.controller.ts   # /api/v1/notifications endpoints
├── notifications.service.ts      # In-app notification delivery & preferences
├── audit-logs.controller.ts      # /api/v1/audit-logs endpoints
├── audit-logs.service.ts         # Append-only audit logger
├── reference.controller.ts       # /api/v1/reference endpoint
├── reference.service.ts          # Aggregates sites, devices & templates
├── tenant-context.service.ts     # Multi-tenant and user context resolver
└── types.ts                      # Shared types aligning with frontend UI
```

---

## 3. Database & Local Setup

### 3.1 Environment Configuration (`.env`)
Create or update `.env` in the project root:
```env
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173
DATABASE_URL="postgresql://sitetrace:YOUR_PASSWORD@127.0.0.1:5432/sitetrace_dev"
NODE_ENV=development
ENABLE_ALERTS_DEV_API=true
ENABLE_TEMPLATE_DEV_API=true
ENABLE_WAREHOUSE_DEV_API=true
DEV_ORGANIZATION_ID=local-demo-org
DEV_USER_ID=local-demo-manager
```

### 3.2 Install Dependencies & Apply Migrations
```bash
# 1. Install packages matching committed lockfile
npm ci

# 2. Apply migrations to your local PostgreSQL database
npx prisma migrate deploy

# 3. Generate Prisma client
npx prisma generate
```

---

## 4. Running the Application & Tests

```bash
# Start development server with hot-reload
npm run start:dev

# Run unit tests (Vitest)
npm run test

# Run build check
npm run check

# Run linter
npm run lint
```

---

## 5. REST API Documentation (`/api/v1`)

### Automation Rules (`/api/v1/automation-rules`)
* `GET /api/v1/automation-rules`: List rules with pagination (`page`, `pageSize`), search, and filters (`siteId`, `templateId`, `enabled`).
* `GET /api/v1/automation-rules/:id`: Get rule details.
* `POST /api/v1/automation-rules`: Create rule.
* `PATCH /api/v1/automation-rules/:id`: Update rule fields.
* `PATCH /api/v1/automation-rules/:id/enabled`: Toggle rule active state (`{ enabled: boolean }`).
* `DELETE /api/v1/automation-rules/:id`: Soft delete rule (`{ reason: string }`).

### Operational Events (`/api/v1/events`)
* `POST /api/v1/events`: Ingest operational event from edge phone.
  - Body: `{ clientEventId, sourceType, deviceId, siteId, locationId, templateId, payload, occurredAt }`
  - Response: `{ id, duplicate: boolean, alertsCreated: string[] }`

### Alerts (`/api/v1/alerts`)
* `GET /api/v1/alerts`: List alerts with pagination, status, severity, and site filters.
* `GET /api/v1/alerts/:id`: Get full alert details with triggering rule, raw event, and action timeline.
* `POST /api/v1/alerts/:id/acknowledge`: Transition alert from `NEW` to `ACKNOWLEDGED`.
* `POST /api/v1/alerts/:id/escalate`: Transition alert to `ESCALATED` (requires `{ note }`, increments level, notifies manager).
* `POST /api/v1/alerts/:id/resolve`: Transition alert to `RESOLVED` (requires `{ note }`, notifies supervisor).

### Notifications (`/api/v1/notifications`)
* `GET /api/v1/notifications`: List current user's notifications.
* `GET /api/v1/notifications/unread-count`: Returns `{ count: number }`.
* `PATCH /api/v1/notifications/:id/read`: Mark single notification as read.
* `PATCH /api/v1/notifications/read-all`: Mark all notifications as read.
* `GET /api/v1/notifications/preferences`: Get notification delivery preferences.
* `PUT /api/v1/notifications/preferences`: Update preferences (`emailEnabled`, `inAppEnabled`, `minSeverity`).

### Audit Logs (`/api/v1/audit-logs`)
* `GET /api/v1/audit-logs`: List immutable audit records with filters (`search`, `action`, `resourceType`, `page`, `pageSize`).

### Reference Data (`/api/v1/reference`)
* `GET /api/v1/reference`: Returns current tenant, warehouses/sites, functional locations, stationed devices, and templates.

---

## 6. Connecting to Your Frontend UI

In your React UI project folder (`C:\Users\NN\OneDrive\Desktop\Nelithma- Alerts,Notification and Audit log`):
1. In the `.env` file, switch to the real backend:
   ```env
   VITE_USE_MOCK=false
   VITE_API_URL=http://localhost:3000/api/v1
   ```
2. Start the backend:
   ```bash
   npm run start:dev
   ```
3. Start the frontend:
   ```bash
   npm run dev
   ```
The frontend UI will now communicate directly with your NestJS backend and PostgreSQL database!
