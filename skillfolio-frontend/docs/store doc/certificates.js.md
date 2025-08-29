## Purpose
API helper layer for Certificates. Keeps axios calls in one place so the store can stay lean.

## Exposed helpers
- listCertificates(params) → GET /api/certificates/
- createCertificateMultipart(form) → POST (multipart) /api/certificates/
- updateCertificate(id, payload) → PATCH /api/certificates/:id/
- deleteCertificate(id) → DELETE /api/certificates/:id/

## Notes
- Auto-selects multipart if `payload.file` is a File when updating.
- Works with the shared axios instance from src/lib/api.js, which injects the Bearer token.

docs/components/ConfirmDialog.jsx.md
## Purpose
Generic confirm modal used for destructive actions (e.g., delete).

## Props
- open (bool): show/hide
- title (string)
- message (string, optional)
- onCancel (fn)
- onConfirm (fn)

## Usage
<ConfirmDialog
  open={show}
  title="Delete certificate?"
  message="This action cannot be undone."
  onCancel={...}
  onConfirm={...}
/>

docs/pages/CertificateDetail.jsx.md
## Purpose
Certificate details and related projects view (future). Linked from lists.

## MVP Scope
- Display certificate metadata
- Link to downloadable file
- List projects linked to this certificate (click-through to project detail)

## Future Enhancements
- Edit from detail
- Breadcrumb back to list
- Share/print action
