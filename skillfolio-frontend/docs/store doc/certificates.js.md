## Purpose
=================================================================================================================================================

API helpers for Certificates: listing, creating (multipart), updating, and deleting.

## Exports
=================================================================================================================================================

- listCertificates({ page, search, filters, ordering }) → GET /api/certificates/
    * Filters include issuer, date_earned, and optionally id.
    * Ordering supports date_earned, -date_earned, title, -title.
    * Returns an array or a paginated object { results, count }.

- createCertificateMultipart({ title, issuer, date_earned, file }) → POST /api/certificates/ (multipart)
    * Builds FormData. Maps file to backend’s file_upload field.
- updateCertificate(id, patch) → PATCH /api/certificates/:id/
    * If patch.file is present, uses multipart and maps to file_upload; otherwise JSON.
- deleteCertificate(id) → DELETE /api/certificates/:id/

## Notes
=================================================================================================================================================

- The frontend always deals with file; the helper maps it to file_upload expected by DRF.
- The list endpoint may annotate project_count; the UI shows this when present.
- Uses the shared axios instance (api) so requests are authenticated

## Example
=================================================================================================================================================

        await createCertificateMultipart({
        title: "Google Data Analytics",
        issuer: "Coursera",
        date_earned: "2024-03-15",
        file: selectedFile // File | null
        });
