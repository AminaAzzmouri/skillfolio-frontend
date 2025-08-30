## Purpose
=================================================================================================================================================

Typed helper layer for Projects API to keep axios calls out of components and the store.

## Exports
=================================================================================================================================================

- listProjects({ page, search, filters, ordering }) → GET /api/projects/
    * Supports filters like certificate, status
    * ordering ∈ { "date_created", "-date_created", "title", "-title" }
    * Returns either an array or a paginated object { results, count }.

- createProject(payload) → POST /api/projects/
    * Maps FE certificateId → BE certificate.
    * Payload supports guided fields: status, work_type, duration_text, primary_goal, challenges_short, skills_used, outcome_short, skills_to_improve.

- updateProject(id, patch) → PATCH /api/projects/:id/
    * If certificateId is present, it is mapped to certificate.

- deleteProject(id) → DELETE /api/projects/:id/

## Query building
=================================================================================================================================================

- A tiny qs(obj) builder removes empty/undefined params and URL-encodes keys/values.

## Auth
=================================================================================================================================================

- Uses the shared axios instance (api) which already injects Authorization: Bearer <access> via setAuthToken.

## Example
=================================================================================================================================================

        await listProjects({
        page: 2,
        search: "portfolio",
        ordering: "-date_created",
        filters: { status: "completed", certificate: 12 }
        });

        await createProject({
        title: "Personal website",
        description: "Deployed to Vercel",
        certificateId: 12,
        status: "completed",
        skills_used: "Next.js, Tailwind"
        });

