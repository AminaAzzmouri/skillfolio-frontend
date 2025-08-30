## Purpose
===============================================================================
Lets users create, list, edit, and delete projects, and (optionally) link a project to a certificate. 
 
 Uses the live API:

  • GET /api/projects/           — list projects
  • POST /api/projects/          — create a project
  • PATCH /api/projects/{id}/    — update a project
  • DELETE /api/projects/{id}/   — delete a project
  • GET /api/certificates/       — populate the “link to certificate” dropdown

Auth is global (JWT); the axios instance injects Authorization: Bearer <access>.
 Accepts both ?certificate=<id> and ?certificateId=<id> for filtering.

## Structure
===============================================================================

### URL/query params
  - search: free text (title/description)
  - ordering: date_created | -date_created | title | -title
  - page: page number (int)
  - certificate or certificateId: filter by linked certificate id
  - status: planned | in_progress | completed

### Store (Zustand: useAppStore)
  - Projects slice
        • projects / projectsLoading / projectsError / projectsMeta
        • fetchProjects({ search, ordering, filters, page })
        • createProject(payload)
        • updateProject(id, patch)
        • deleteProject(id)

  - Certificates slice (for dropdown + chip titles)
        • certificates / certificatesLoading / certificatesError
        • fetchCertificates()

  - Local UI state
        • showCreate — open/close create modal
        • editingId — id of the row currently in edit mode
        • confirmDeleteId — id pending deletion
        • submitting / submitError — form submit states (shared by create/edit)

  - Effects & helpers
        • On mount: fetchCertificates() to populate dropdown.
        • On param change: fetchProjects({ ... }).
        • certTitleById (memo): maps certificate id → title for row display & chips.
        • writeParams(patch): updates search/filters/order (resets page to 1).
        • clearCertFilter(): removes both certificate and certificateId.

## UI & Behavior
===============================================================================

### Controls (top)
  - <SearchBar /> — updates search
  - <Filters type="projects" /> — writes { certificate, status }
  - <SortSelect /> — writes ordering
  - “Add Project” button — opens modal with <ProjectForm />

### Grid (cards)
  - View mode
        • Title, description, status, created date.
        • Bottom bar:
            * If linked: Linked to: <Certificate Title> + link to /certificates?id=<id>
            * Else: “Not linked”.
        • “Edit” toggles inline <ProjectForm initial={p} …/>.
        • “Delete” opens <ConfirmDialog/>.

  - Edit mode
        • Inline <ProjectForm initial={p} submitLabel="Save changes" onUpdate={...} />

  - Modal (create)
        • <Modal open={showCreate} title="Add Project">
        • <ProjectForm onCreate={handleCreate} certificates={certificates} …/>

  - States
        • Loading: “Loading projects…”
        • Error (list): “Error loading projects: …”
        • Empty: “No projects yet.”
        • Certificate list error (for dropdown) shown below the grid if present.

  - Pagination
        • <Pagination page pageSize=10 total={projectsMeta?.count} …/>
        • Writes ?page= while preserving active query params.

## Role in Project
===============================================================================
Projects showcase applied learning. This page mirrors Certificates CRUD for
 consistency and powers dashboard counts and progress.

## What's new:
===============================================================================

- Certificate filter alias: accepts both ?certificate= and ?certificateId=.
- Filter chip shows linked certificate title; clearing removes both keys.
- Card bottom bar with clear link to the certificate detail filter.
- Cleaned request/error handling for create/update flows.

## Future Enhancements
===============================================================================
- Project detail route
- Attachments/screenshots
- Markdown preview for description
- Infinite scroll option