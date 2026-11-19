# Warehouse & Location Management API Verification

The endpoint contract for **Module 2: Site, Location, Device Management & Monitoring** (Warehouses & Locations).

## Automated verification

With PostgreSQL running and `.env` pointing at the development database:

```sh
npm run check
npm run lint
npm test
npm run test:e2e
```

The end-to-end suite uses the real Nest application, production request validation settings (`ValidationPipe` with whitelist and transform), and PostgreSQL. It overrides the development context with random test organization IDs (`e2e-warehouses-${randomUUID()}`) and safely removes all test records in `afterAll` via `$transaction`. Existing development and demo records are preserved.

## Verified Endpoints

All paths are relative to `http://localhost:3000/api/v1`.

### 1. Warehouse Endpoints

| Method | Path | Expected Behavior |
| :--- | :--- | :--- |
| `GET` | `/warehouses` | `200`, lists warehouses with pagination and live `locationCount` |
| `GET` | `/warehouses?status=all` | `200`, returns all warehouses regardless of status |
| `GET` | `/warehouses?status=active` | `200`, filters active warehouses |
| `GET` | `/warehouses?status=inactive` | `200`, filters inactive warehouses |
| `GET` | `/warehouses?search=colombo` | `200`, case-insensitive search by name, city, or supervisor |
| `GET` | `/warehouses?page=1&limit=5` | `200`, returns paginated items with pagination metadata |
| `GET` | `/warehouses/:id` | `200`, returns single warehouse details with live `locationCount` |
| `GET` | `/warehouses/:id` (invalid UUID) | `400`, validates UUID parameter |
| `GET` | `/warehouses/:id` (non-existent) | `404`, warehouse not found |
| `POST` | `/warehouses` | `201`, creates a new warehouse record |
| `POST` | `/warehouses` (invalid body) | `400`, rejects blank name, blank city, or unknown fields |
| `PATCH` | `/warehouses/:id` | `200`, updates warehouse metadata (name, city, address, supervisor, status) |
| `DELETE` | `/warehouses/:id` | `200`, deletes warehouse and cascade-deletes all child locations |

### 2. Location Sub-Resource Endpoints

Locations are strictly nested sub-resources under their parent warehouse (`/warehouses/:warehouseId/locations`).

| Method | Path | Expected Behavior |
| :--- | :--- | :--- |
| `GET` | `/warehouses/:warehouseId/locations` | `200`, lists all locations belonging to the warehouse |
| `GET` | `/warehouses/:warehouseId/locations/:id` | `200`, returns single location details |
| `GET` | `/warehouses/:warehouseId/locations/:id` (invalid) | `404`, returns 404 if warehouse or location not found |
| `POST` | `/warehouses/:warehouseId/locations` | `201`, creates a new location under the parent warehouse |
| `POST` | `/warehouses/:warehouseId/locations` (invalid) | `400`, rejects blank name or invalid status |
| `PATCH` | `/warehouses/:warehouseId/locations/:id` | `200`, updates location details (name, description, status) |
| `DELETE` | `/warehouses/:warehouseId/locations/:id` | `200`, deletes the specific location |

---

## Business & Technical Rules

1. **Multi-Tenant Isolation**:
   - Every warehouse and location query is scoped to the requesting tenant's `organizationId`.
   - Accessing a warehouse or location belonging to another tenant returns `404 Not Found`.

2. **Live Location Count Aggregation**:
   - The warehouse list and warehouse detail endpoints calculate live location counts using Prisma `_count: { select: { locations: true } }`. No client-side counts or localStorage counters are used.

3. **Cascade Deletion**:
   - Deleting a parent warehouse automatically cascades and deletes all locations associated with that warehouse via the database foreign key constraint (`onDelete: Cascade`).

4. **Sub-Resource Integrity**:
   - Creating a location validates that the parent `warehouseId` exists within the tenant organization before creating the record.
