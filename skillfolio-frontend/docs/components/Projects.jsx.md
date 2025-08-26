**Projects.jsx**:

## Purpose:
===============================================================================

This page lets users **create and list projects** and optionally link each project
to a certificate (by certificate ID). It now uses the **live backend API**:

  • `GET /api/projects/` — list projects  
  • `POST /api/projects/` — create a project  
  • Reads certificates from `GET /api/certificates/` to populate the link dropdown

Authentication is handled globally (JWT), so requests include
`Authorization: Bearer <access>` via the axios helper.

===============================================================================

## Structure:
===============================================================================

### State (Zustand: useAppStore):
  • Projects slice:
    - `projects` / `projectsLoading` / `projectsError`
    - `fetchProjects()` — GET `/api/projects/`
    - `createProject({ title, description, certificateId })` — POST `/api/projects/`
      (sends `{ title, description, certificate: certificateId || null }`)

  • Certificates slice (for dropdown):
    - `certificates` / `certificatesLoading` / `certificatesError`
    - `fetchCertificates()` — GET `/api/certificates/`

### Local component state:
  • `form` → `{ title, description, certificateId }`  
  • `submitting` → disables submit button while posting  
  • `submitError` → shows API error if creation fails

### Effects:
  • On mount:
    1) `fetchCertificates()` — populate the dropdown
    2) `fetchProjects()` — load the list

### Certificate title mapping:
  • Use `useMemo` to build a `Map<id, title>` from `certificates` so each project row
    can show the certificate title (API returns only `certificate` id).

===============================================================================

## Form & Submission:
===============================================================================

Fields:
  - Project Title (required)
  - Description (required)
  - Certificate (optional select; sends `certificate: <id>` or `null`)

Submit flow:
  1) Validate locally
  2) Call `createProject({ title, description, certificateId })`
  3) On success, the new project is **prepended** for snappy UX
  4) On failure, show a user-friendly error extracted from the API response

===============================================================================

## UI States:
===============================================================================

- Loading:
    • “Loading certificates…” while certificates fetch  
    • “Loading projects…” while projects fetch
- Error:
    • Render concise errors when `certificatesError` or `projectsError` is set
- Empty:
    • If `projects` is empty after loading, show a gentle “No projects yet” message

===============================================================================

## Role in Project:
===============================================================================

Projects showcase the **applied side of learning**—how certificates translate into
real work. The page complements Certificates by feeding the Dashboard’s project
stats (total projects, recent items) and establishes the list + create pattern
that other entities can follow.

===============================================================================

## Future Enhancements:
===============================================================================

- Edit/delete (PUT/PATCH/DELETE)
- Filtering & search (e.g., `?certificate=<id>`, `?search=...`, ordering)
- Richer rendering (markdown, attachments, screenshots)
- Guided questions in the form (tools used, impact, problem solved)
- Pagination support (switch to `data.results` with DRF pagination)
- Guided questions in the form (tools used, impact, problem solved).
- Pagination support (swap data → data.results when DRF pagination is enabled).



