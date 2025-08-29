## Purpose
API layer for Projects to keep axios calls out of components/store logic.

## Exports
- listProjects(params)        → GET /api/projects/
- createProject(payload)      → POST /api/projects/
- updateProject(id, patch)    → PATCH /api/projects/:id/
- deleteProject(id)           → DELETE /api/projects/:id/

## Notes
- FE uses `certificateId` for clarity; functions map it to backend `certificate`.
- Works with shared axios instance (injects Bearer token).
