## Purpose:
===============================================================================

The Certificates page lets learners search, filter, sort, paginate, add, edit, preview, and delete certificates. It also shows how many projects reference each certificate (per-card “Projects” count).

## UI Structure:
===============================================================================

### Header
    • Title + “← Back to dashboard”.certificates/`)  
    • “Add Certificate” opens a modal with the create form.

### ID chip (optional)
    • If ?id=<pk> is present, show a chip with Clear filter.

### Controls
    • SearchBar – free text search over title/issuer.
    • Filters – issuer + date_earned.
    • SortSelect – date_earned/title asc/desc.

### Grid
    • Card per certificate (title/issuer/date, preview if file, project count, edit/delete).
    • Edit swaps the card body for CertificateForm (inline).
    • Delete uses ConfirmDialog.

### Create Modal
    • CertificateForm in create mode; closes on success.

### Pagination
    • Bottom pager (pageSize=10).

## Routing & URL contract:
===============================================================================

- Driven by useSearchParams:

    • search — text query.
    • ordering — one of: "", "date_earned", "-date_earned", "title", "-title".
    • issuer — filter.
    • date_earned — filter (YYYY-MM-DD).
    • id — optional, narrow to a specific PK (also shown as a chip).

- Changing any control updates params and resets page to 1.

## Backend Contract (Django DRF):
===============================================================================

- Endpoints (owner-scoped by ViewSet)
    • List / create: GET /api/certificates/, POST /api/certificates/
    • Detail / update / delete: GET /api/certificates/{id}/, PATCH|PUT /api/certificates/{id}/, DELETE /api/certificates/{id}/

- Server features from CertificateViewSet
    • Filters: ?id=<pk>&issuer=<str>&date_earned=<YYYY-MM-DD>
    • Search: ?search=<substring> over title, issuer
    • Ordering: ?ordering=date_earned|-date_earned|title|-title (default -date_earned)
    • Annotation: each row includes project_count (distinct) for FE display.
    • Ownership: only records for request.user are returned; user is assigned on create.

- Serializer validation
    • date_earned cannot be in the future → 400 {"date_earned":["date_earned cannot be in the future."]}

- Create / update payload (multipart if uploading a file)

          {
            "title": "Google Data Analytics",
            "issuer": "Coursera",
            "date_earned": "2025-02-01",
            "file": "<PDF or image file> (optional)"
          }

- Response shape (subset)

          {
            "id": 17,
            "title": "Google Data Analytics",
            "issuer": "Coursera",
            "date_earned": "2025-02-01",
            "file_upload": "/media/certs/ga.pdf",
            "project_count": 3,
            "user": 5

          }

Note: If file_upload is a relative path, FE resolves it with makeFileUrl() using api.defaults.baseURL.

## Data flow & store contract:
===============================================================================

- Zustand useAppStore:
  - State
        • certificates, certificatesLoading, certificatesError
        • certificatesMeta (expects count for pagination)

  - Actions
        • fetchCertificates({ search, ordering, filters, page })
        • updateCertificate(id, patch) (omit file to keep existing upload)
        • deleteCertificate(id)

- Create happens inside CertificateForm via createCertificate(form).

## Project counts shown on cards:
===============================================================================

- Priority:
        • If server provides project_count, use it.
        • Else FE fetches /api/projects/?certificate=<id> and derives count from length/count/results.length. Results are cached per visible cert.

Backend already annotates project_count, so you can later remove the FE fallback if you prefer.

## File previews:
===============================================================================

- Images → inline <img> (via isImageUrl).
- PDFs → <object type="application/pdf"> with fallback link (via isPdfUrl).
- Others → link only.

## States & UX:
===============================================================================

- Loading, error, and empty messages appear above the grid.
- Edit mode uses in-card CertificateForm.
- Delete uses ConfirmDialog.

## Accessibility:
===============================================================================

- Labeled inputs, alt text on previews, keyboardable buttons/links.

## Future Enhancements:
===============================================================================

- Rely solely on project_count (drop FE fallback).
- Skeleton loaders.
- Drag & drop upload with progress.
- Bulk actions.
- Debounced search / prefetch next page.