**Certificates.jsx**:

## Purpose:

===============================================================================

This page lets users **add and view certificates** (title, issuer, date earned, optional file).
In the `feature/add-certificates` work, it talks to the **Django API** (`/api/certificates/`)
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

### Hooks:

• `useAppStore()` → read `certificates` and call `fetchCertificates()` / `createCertificate()`  
 • `useEffect` → call `fetchCertificates()` on mount so the list shows server data

### Form:

• Fields: Title, Issuer, Date Earned, optional File  
 • On submit: 1) Build a `FormData` instance

- `title`, `issuer`, `date_earned`
- `file_upload` (only if a file is present)

2.  Call `createCertificate(formData)`
3.  Clear the form (the store prepends the created cert for snappy UX)

### Certificate List:

• Renders `certificates` from the store (server data)  
 • Each entry may show: - Title - Issuer + `date_earned` - A small “file uploaded” chip or link if `file_upload` is present

===============================================================================

## States to handle (recommended):

===============================================================================

• Loading — show a small spinner/placeholder while `certificatesLoading` is true  
 • Empty — show a friendly “No certificates yet” message  
 • Error — surface `certificatesError` if present (401, validation, network, etc.)

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

## Implementation Notes:

===============================================================================

Use `FormData` for POST when a file is present:

```js
const fd = new FormData();
fd.append("title", form.title);
fd.append("issuer", form.issuer);
fd.append("date_earned", form.date_earned);
if (form.file) fd.append("file_upload", form.file);
await createCertificate({ title: form.title, issuer: form.issuer, date_earned: form.date_earned, file: form.file });

• Your axios instance (api) gets the Authorization header via setAuthToken(access) on login/restore.

• If you see 401 Unauthorized:
  • ensure you’re logged in (valid access)
  • confirm setAuthToken(access) was called (DevTools → Request Headers)

================================================================================

## Role in Project:

================================================================================

A core Skillfolio feature: tracking learning achievements.
It feeds the Dashboard’s stats and “recent certificates” list.

================================================================================

## Future Enhancements:

================================================================================

  - File preview/download (render link when file_upload URL is absolute)
  - Edit/delete (PUT/PATCH/DELETE endpoints)
  - Search & filters (issuer, year via query params)
  - Better UX: drag-and-drop, progress for large files
  - Optimistic updates with reconciliation

================================================================================

## Minimal Usage Pattern (example):
================================================================================

// On mount
useEffect(() => {
  fetchCertificates(); // GET /api/certificates/
}, []);

// On submit
const onSubmit = async (e) => {
  e.preventDefault();
  await createCertificate({ title, issuer, date_earned, file }); // handles FormData internally
  resetForm();
};

```
