# Template API verification

The endpoint contract comes from pages 5–7 of `SaaS Platform.pdf`.

## Automated verification

With PostgreSQL running and `.env` pointing at the existing development database:

```sh
npm run check
npm run lint
npm test
npm run test:e2e
```

The end-to-end suite uses the real Nest application, its production request
validation settings, and PostgreSQL. It overrides the development context with
random test organization IDs, then removes only those organizations' test
templates and versions after the run. Existing development templates are preserved.
The suite uses an ephemeral HTTP port, so the normal API can remain on port 3000.

## Verified endpoints

All paths are relative to `http://localhost:3000/api/v1`.

| Method | Path                                            | Expected behavior                               |
| ------ | ----------------------------------------------- | ----------------------------------------------- |
| GET    | `/`                                             | 200, greeting                                   |
| GET    | `/health`                                       | 200, service health response                    |
| POST   | `/templates`                                    | 201, new draft with revision 1 and empty fields |
| GET    | `/templates`                                    | 200, all statuses by default                    |
| GET    | `/templates?status=all`                         | 200, all statuses                               |
| GET    | `/templates?status=draft`                       | 200, unpublished templates only                 |
| GET    | `/templates?status=published`                   | 200, published templates only                   |
| GET    | `/templates?status=invalid`                     | 400                                             |
| GET    | `/templates?status=draft&page=1&limit=1`        | 200, at most one draft                          |
| GET    | `/templates?status=published&search=inspection` | 200, both filters applied                       |
| GET    | `/templates/:id`                                | 200, current draft/template details             |
| PATCH  | `/templates/:id`                                | 200, saves fields and increments draft revision |
| POST   | `/templates/:id/publish`                        | 201, immutable version 1 snapshot               |
| GET    | `/templates/:id/published`                      | 200, published snapshot; 404 before publication |

Filtering happens before pagination. Search is trimmed and case-insensitive.
An empty matching list is a successful response. Page overflow, invalid query
values, invalid UUIDs, malformed request bodies, and duplicate field IDs are
also covered.

The suite verifies that published templates leave the draft list and appear in
the published list. It checks stale saves/publications, repeated publication,
published edits, snapshot immutability, simultaneous saves/publications,
organization isolation, and disabled development endpoints.

## Postman

1. Start the API with `npm run start:dev`.
2. In the Postman VS Code extension, import
   `postman/SiteTrace-Templates.postman_collection.json`.
3. Keep the collection's `baseUrl` at `http://localhost:3000/api/v1`, or change it
   to your development server.
4. Send the requests in numeric order. The collection captures the newly created
   template ID and revision after successful responses, so no IDs need to be pasted.

Each collection run creates and publishes one uniquely named QA template in the
configured development organization. The collection does not remove it.

The collection includes response assertions. Requests named as rejection tests
are successful when they return the specified 400 or 409 status.

### Understanding the reported errors

- **400 Bad Request:** select **Body → raw → JSON** and include
  `expectedRevision`, `details`, and `fields` in PATCH requests. The content type
  must be `application/json`.
- **409 for a draft:** GET the latest draft, review its current values, and use its
  `draftRevision` as the next request's `expectedRevision`. Every successful save
  increments it.
- **409 for a published template:** published templates are read-only. Create a
  new draft for the PDF's test flow.
- Publishing must use the revision returned by the successful PATCH, rather than
  the revision returned at creation.

The Postman collection is provided for import; the automated verification runs
through the HTTP end-to-end suite.
