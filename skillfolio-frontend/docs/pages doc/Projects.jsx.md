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
  • `submitError` → shows API error inline if creation fails

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
  - Work type (select: individual | team)
  - Duration (short text, e.g., "3 weeks")
  - Primary goal (select: practice_skill, deliver_feature, build_demo, solve_problem)
  - Challenges faced (short textarea)
  - Skills/tools used (short comma-separated list)
  - Outcome/impact (short textarea)
  - Skills to practice more (short comma-separated list)
  - Auto-generated Description (preview, editable)
  - Status is now part of the form (same enum values as backend).
  - Projects list is rendered first, with a button at the bottom to toggle form visibility.

Submit flow:
  1. User fills guided fields
  2. Component builds a live preview string (auto-description) following template:
      ${title} — ${work_type === 'team' ? 'Team project' : 'Individual project'} (~${duration_text || 'N/A'}).
      Goal: ${goalPhrase}.
      Challenges: ${challenges_short || 'N/A'}.
      Skills/Tools: ${skills_used || 'N/A'}.
      Outcome: ${outcome_short || 'N/A'}.
      Next focus: ${skills_to_improve || 'N/A'}.
      Where `goalPhrase` maps from `primary_goal`.
  3. User may edit the description before submit.
  4. Submit sends payload with guided fields + final description.

===============================================================================

## UI States:
===============================================================================

- Loading:
    • “Loading certificates…” while certificates fetch  
    • “Loading projects…” while projects fetch  
- Error:
    • Render concise errors when `certificatesError` or `projectsError` is set  
    • Show inline error message if form submission fails  
- Empty:
    • If `projects` is empty after loading, show “No projects yet—add your first above.”
- The “Add Project” form no longer always shows — it’s toggled

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
- Filtering & search  
- Richer rendering (markdown, attachments, screenshots)  
- **UI polish: chips/multi-selects for challenges and skills**  
- Pagination support  
