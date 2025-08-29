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

