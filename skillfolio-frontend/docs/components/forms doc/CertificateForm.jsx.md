## Purpose:
================================================================================

Reusable form for creating and editing certificates.
    * Create mode (default): calls store createCertificate(form) and resets.
    * Edit mode: parent passes initial + onSubmit + submitLabel (parent runs updateCertificate).

## Props:
================================================================================

- initial (object | null) — when provided, switches to edit mode. Shape: { title, issuer, date_earned, file_upload? }
- onSubmit (function | null) — edit handler: async (form) => void
- submitLabel (string) — button text (e.g., "Save changes")
- onCancel (function | null) — optional cancel callback (e.g., close modal)
- onSuccess (function | null) — called after successful create/edit (e.g., close modal)

## Internal state:
================================================================================

- form = { title, issuer, date_earned, file } (File optional)
- submitting, error
- When initial changes, fields prefill; file input is cleared (no prefilled File).

Disabled button when submitting or any of title, issuer, date_earned is empty.

## Submit flow:
================================================================================

- Edit mode (has onSubmit):
      • await onSubmit(form) → parent calls updateCertificate(id, patch)
      • onSuccess?.()

- Create mode:
      • await createCertificate(form) (store)
      • Reset fields + file input
      • onSuccess?.()

### Error text comes from server when possible:
      err.response.data.detail → or stringified err.response.data → or err.message → fallback "Request failed".

## Backend contract (DRF):
================================================================================

- Create: POST /api/certificates/
- Update: PATCH|PUT /api/certificates/{id}/

### Fields
      • title (required)
      • issuer (required)
      • date_earned (required, YYYY-MM-DD, must not be future)
      • file (optional, PDF or image; multipart upload)

### Validation
      • Future dates rejected by CertificateSerializer.validate_date_earned with:
        400 {"date_earned":["date_earned cannot be in the future."]}

### Response (subset)
      • Includes id, title, issuer, date_earned, file_upload (string path/URL), project_count (read-only), and user (read-only).

- Edit note: If the user doesn’t re-upload a file, omit file so the backend keeps the existing file_upload.

## Reset / Cancel:
================================================================================

- Reset returns fields to initial (edit) or empties them (create) and clears the file input.
- Cancel calls onCancel if provided.

## Accessibility:
================================================================================

- Inputs have labels (via useId), error text is inline and readable.

## Future Enhancements:

================================================================================

- Client-side file validation (type/size).
- Upload progress indicator.
- Remove/replace existing upload in edit mode.
- Stronger validation and i18n for messages.

