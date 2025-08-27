## Purpose:
===============================================================================

This page lets users **add and view certificates** (title, issuer, date earned, optional file).
In the `feature/add-certificates` + `feature/certificates-polish` work, it talks to the **Django API** (`/api/certificates/`)
instead of local mock state.

===============================================================================

## Structure:
===============================================================================

### State & Data (Zustand store):

• `certificates` — array populated by `fetchCertificates()` (GET `/api/certificates/`)  
• `certificatesLoading` — boolean while fetching  
• `certificatesError` — string/null on fetch/post failures  
• `createCertificate({ title, issuer, date_earned, file })` — POST multipart to `/api/certificates/`

- Builds a `FormData` payload (fields: `title`, `issuer`, `date_earned`, optional `file_upload`)
- Store prepends new items for snappy UX

### Hooks:

• `useAppStore()` → read `certificates` and call `fetchCertificates()` / `createCertificate()`  
• `useEffect` → call `fetchCertificates()` on mount so the list always shows server data  

### Form:

• Provided by `CertificateForm.jsx` child component (split out for clarity).  
• Fields: Title, Issuer, Date Earned, optional File  
• On submit:  
  1. Build a `FormData` instance  
  2. Call `createCertificate(form)` (store handles FormData + API)  
  3. Reset inputs (file input fully resets via `ref`)  

### Certificate List:

• Renders `certificates` from the store (server data), newest first (sorted by date_earned desc).  
• Each entry shows:  
  - Title  
  - Issuer + `date_earned`  
  - A small file link if `file_upload` is present (absolute URL built from API base if needed)
• Certificates are listed first (newest → oldest), followed by a button to open/close the CertificateForm.

===============================================================================

## States to handle:
===============================================================================

• **Loading** — “Loading certificates…” message  
• **Empty** — “No certificates yet” message  
• **Error** — surface `certificatesError` in red text  

===============================================================================

## Backend Contract (DRF):
===============================================================================

- `GET /api/certificates/` → list current user’s certificates  
- `POST /api/certificates/` (multipart) fields:  
  - `title` (string, required)  
  - `issuer` (string, required)  
  - `date_earned` (YYYY-MM-DD, required)  
  - `file_upload` (file, optional)  

- Requires header: `Authorization: Bearer <access_token>`

===============================================================================

## Role in Project:
===============================================================================

A core Skillfolio feature: tracking learning achievements.  
Feeds the Dashboard’s stats and “recent certificates” list.

===============================================================================

## Future Enhancements:
===============================================================================

- File preview/download with styled chip  
- Edit/delete endpoints  
- Filters (issuer, year)  
- Drag-and-drop file upload, progress bar  
- Optimistic updates with reconciliation
