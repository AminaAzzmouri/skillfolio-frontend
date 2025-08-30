## Purpose
===============================================================================
This page lets users **create, list, edit, and delete projects** and optionally
link each project to a certificate (by certificate ID). It uses the live API:

  • GET /api/projects/           — list projects
  • POST /api/projects/          — create a project
  • PATCH /api/projects/{id}/    — update a project
  • DELETE /api/projects/{id}/   — delete a project
  • GET /api/certificates/       — populate link dropdown

Auth is global (JWT). The axios helper injects `Authorization: Bearer <access>`.
===============================================================================

## Structure
===============================================================================
### State (Zustand: useAppStore)
Projects slice:
  - projects / projectsLoading / projectsError
  - fetchProjects()   → GET /api/projects/
  - createProject(p)  → POST /api/projects/
  - updateProject(id, patch) → PATCH /api/projects/:id/
  - deleteProject(id) → DELETE /api/projects/:id/

Certificates slice (for dropdown):
  - certificates / certificatesLoading / certificatesError
  - fetchCertificates() → GET /api/certificates/

### Local UI state:
  - showCreate: toggle for create form
  - editingId: which project is currently in edit mode
  - confirmDeleteId: which project is pending deletion
  - submitting / submitError: form submit states

### Certificate title mapping:
  - useMemo to map certificate id → title so rows can display it
===============================================================================

## Form & Submission
===============================================================================
Fields:
  - title (required)
  - status (planned | in_progress | completed)
  - work_type (individual | team)
  - duration_text (short string)
  - primary_goal (practice_skill | deliver_feature | build_demo | solve_problem)
  - challenges_short / skills_used / outcome_short / skills_to_improve
  - certificateId (optional)
  - description (auto-generated preview, editable)

Submit flow:
  1) Live preview composed from guided fields; user can edit description
  2) POST sends JSON with guided fields + final description
  3) After success: page prepends new item
  4) Edit uses inline <ProjectForm> with initial data, PATCH on save
  5) Delete uses a confirm dialog
===============================================================================

## UI States
===============================================================================
- Loading: “Loading projects…”
- Error: concise message for both list and form
- Empty: “No projects yet.”
- Create form is toggled by a button; edit form is inline per row
===============================================================================

## Role in Project
===============================================================================
Projects demonstrate applying learning (certificates) to real work.
Feeds dashboard stats; mirrors Certificates CRUD pattern for consistency.
===============================================================================

## Future Enhancements
===============================================================================
- Search, filters, ordering
- Project detail page with richer rendering
- Markdown description support, attachments/screenshots
- Pagination and infinite scroll

===============================================================================

# What's new:

   - Cards rendered in a responsive GRID (1 / 2 / 3 cols).
   - Each card shows a bottom bar:
       • If linked: "Linked to: <Certificate Title>" + "View certificate" link
         that navigates to /certificates?id=<certificateId>.
       • If not linked: "Not linked" (no link).
   - Keeps existing filters/search/sort/pagination/editing.