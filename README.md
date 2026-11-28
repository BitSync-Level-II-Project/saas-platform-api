# SiteTrace API

SiteTrace is a field operations platform for managing warehouses, assigning work, collecting structured data, and reviewing results. This repository provides the shared NestJS backend for the web and mobile clients. It uses TypeScript, Prisma, and PostgreSQL.

| Repository | Role | Integration branch |
| --- | --- | --- |
| [SiteTrace Web](https://github.com/BitSync-Level-II-Project/saas-platform-web) | Browser workspace for managers and supervisors | `chore/web-foundation` |
| [SiteTrace API](https://github.com/BitSync-Level-II-Project/saas-platform-api) | Shared API, data model, and database migrations | `chore/api-foundation` |
| [SiteTrace Mobile](https://github.com/BitSync-Level-II-Project/saas-platform-mobile) | Worker task and form capture app | `main` |

## Available on the API foundation

| Area | Current behavior |
| --- | --- |
| Templates | List, create and update drafts, publish by draft revision, and retrieve immutable published snapshots. |
| Warehouses and locations | Warehouse CRUD, nested location CRUD, and warehouse location counts. The foundation includes the PostgreSQL location migration. |
| Submissions | Storage models for submissions, attempts, reviews, and validation/retry helpers are present. Authenticated submission and review routes are not yet available on the foundation branch. |
| Tasks and authentication | Worker task lookup, assignment integration, and authenticated manager and worker flows are still being integrated. |

The template, warehouse, and location routes use a local development context. The development flags and IDs below are for local use only; they are not user authentication or production permissions.

## Run locally

**Prerequisites:** Git, Node.js 24 (see [`.nvmrc`](./.nvmrc)), npm, and a running local PostgreSQL instance. CI uses PostgreSQL 17; Docker is not required for local development.

```bash
git clone --branch chore/api-foundation https://github.com/BitSync-Level-II-Project/saas-platform-api.git
cd saas-platform-api
npm ci
```

Create a local PostgreSQL login and an empty database it owns. If you already have a local database and credentials, reuse them and skip the creation commands. For a fresh setup, open `psql -U postgres -d postgres` (replace `postgres` after `-U` if you use a different local administrator) and run:

```sql
CREATE ROLE sitetrace LOGIN;
\password sitetrace
CREATE DATABASE sitetrace_dev OWNER sitetrace;
CREATE DATABASE sitetrace_test OWNER sitetrace;
```

In the API repo root, copy [`.env.example`](./.env.example) to `.env` and update `DATABASE_URL` to match your login and database. The table lists the local defaults.

| Variable | Local setting |
| --- | --- |
| `DATABASE_URL` | `postgresql://sitetrace:YOUR_PASSWORD@127.0.0.1:5432/sitetrace_dev` |
| `PORT` | `3000` |
| `FRONTEND_ORIGIN` | `http://localhost:5173` (must match the actual web origin) |
| `NODE_ENV` | `development` |
| `ENABLE_TEMPLATE_DEV_API` | `true` to enable the local template routes |
| `ENABLE_WAREHOUSE_DEV_API` | `true` to enable the local warehouse and location routes |
| `DEV_ORGANIZATION_ID` | `local-demo-org` |
| `DEV_USER_ID` | `local-demo-manager` |

Replace `YOUR_PASSWORD` with your local password. URL-encode reserved characters in the password and do not commit `.env`. Apply the migrations already committed to the branch, generate the Prisma client, then start the server:

```bash
npx prisma migrate deploy
npm run prisma:generate
npm run start:dev
```

The base URL is `http://localhost:3000/api/v1`. Open [the health route](http://localhost:3000/api/v1/health) to check startup. If startup fails, check the PostgreSQL service and connection settings first. If health works but development routes are missing, check the development flags and restart the API.

## HTTP routes

The paths below are relative to `/api/v1`.

| Methods | Path | Purpose |
| --- | --- | --- |
| GET | `/health` | Service health |
| GET, POST | `/templates` | List templates or create a draft |
| GET, PATCH | `/templates/:id` | Read template details or save a draft revision |
| POST | `/templates/:id/publish` | Publish the current draft revision |
| GET | `/templates/:id/published` | Read the published snapshot |
| GET, POST | `/warehouses` | List or create warehouses |
| GET, PATCH, DELETE | `/warehouses/:id` | Read, update, or delete a warehouse |
| GET, POST | `/warehouses/:warehouseId/locations` | List or create locations within a warehouse |
| GET, PATCH, DELETE | `/warehouses/:warehouseId/locations/:id` | Read, update, or delete a location |

- [Template verification and Postman instructions](./docs/template-api-verification.md) · [Postman collection](./postman/SiteTrace-Templates.postman_collection.json)
- [Warehouse and location verification](./docs/warehouse-location-api-verification.md)
- [Worker mobile API contract](./docs/worker-mobile-api-contract.md) and [submission API contract](./docs/submission-api-contract.md) describe proposed flows. A contract in this repository does not mean its endpoints are deployed or runnable on this branch.

## Tests

Set `DATABASE_URL` to the separate local `sitetrace_test` database before applying migrations and running end-to-end tests. In a separate PowerShell terminal, replace the password in the example and set the variable for that terminal only:

```powershell
$env:DATABASE_URL = 'postgresql://sitetrace:YOUR_PASSWORD@127.0.0.1:5432/sitetrace_test'
```

```bash
npx prisma migrate deploy
npm run check:all
```

Close the test terminal before starting the development API from a fresh one, so it reads the development database URL from `.env` again.

| Command | What it checks |
| --- | --- |
| `npm run check` | Generate the Prisma client and build the NestJS app |
| `npm run lint` | Lint API sources and tests |
| `npm test` | Run the unit tests |
| `npm run test:e2e` | Run the end-to-end tests against PostgreSQL |
| `npm run check:all` | Run build, lint, unit tests, and end-to-end tests |

GitHub [API CI](./.github/workflows/ci.yml) uses its own PostgreSQL service and applies migrations before database tests. On Windows PowerShell, use `npm.cmd` and `npx.cmd` if the PowerShell wrappers are blocked.

## Project layout

| Path | Purpose |
| --- | --- |
| [`src/templates/`](./src/templates), [`src/warehouses/`](./src/warehouses), [`src/locations/`](./src/locations) | HTTP controllers, business logic, and request types |
| [`src/submissions/`](./src/submissions) | Submission validation, workflow, and retry logic |
| [`src/prisma/`](./src/prisma) | Prisma database connection for NestJS |
| [`prisma/`](./prisma) | Database schema and committed migrations |
| [`test/`](./test) | End-to-end specifications |

## Contribute

Use your existing API feature branch and target `chore/api-foundation` with your PR. Use `main` for reviewed project milestones. Include the Jira issue, affected routes, migration details, and test evidence. If a change relies on another PR or uses identity fixtures, describe that explicitly. Review data model changes alongside their migration and both client contracts where applicable.

[BitSync Jira board](https://gunasekarapdvp.atlassian.net/jira/software/projects/SCRUM/boards/1)
