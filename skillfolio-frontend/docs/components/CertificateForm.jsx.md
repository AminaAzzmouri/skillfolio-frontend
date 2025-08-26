**CertificatesForm.jsx**:

## Purpose:

================================================================================

The CertificateForm component encapsulates the form UI and logic for creating new certificates in Skillfolio.
It’s designed to be a reusable, self-contained piece that can be mounted inside the Certificates.jsx page (or elsewhere, e.g. a modal in Dashboard).
By isolating the form from the list view, we keep components focused and easier to maintain.

================================================================================

## Structure:
================================================================================

#### Props (planned):

      • onSubmit(formData) → callback passed by parent. Receives either:
        → payload object (title, issuer, date_earned, file) when mocking, or
        → a FormData object when integrated with the backend API.

      • Global store (Zustand):
        → certificates: array populated by fetchCertificates() (GET /api/certificates/).
        → createCertificate(formData): POST to /api/certificates/ using FormData (handles file upload).
        → Optional UI flags you may add: loading, error for fetch/create.

#### Local State:

      • form object with keys: 
        → title
        → issuer
        → date_earned
        → file (File or null)

#### Hooks:

      • useState → manages local inputs.
      • (Optional) useAppStore → not directly required here if submit is delegated to parent.

#### Form Fields:

      • Title: text input, required
      • Issuer: text input, required
      • Date Earned: date input, required
      • File Upload: file input (optional, accepts PDF/image)
      • Submit Button: triggers parent onSubmit.

#### Behavior:

      • On form submission:
          1. Prevent default
          2. Construct payload or FormData
          3. Call onSubmit(payload)
          4. Reset fields

================================================================================

## Example Usage:

================================================================================

// Certificates.jsx
import CertificateForm from "../components/forms/CertificateForm";

export default function Certificates() {
  const { createCertificate } = useAppStore();

  const handleSubmit = async (form) => {
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("issuer", form.issuer);
    fd.append("date_earned", form.date_earned);
    if (form.file) fd.append("file_upload", form.file);
    await createCertificate(fd);
  };

  return (
    <div>
      <h1>Certificates</h1>
      <CertificateForm onSubmit={handleSubmit} />
      {/* … list of certificates … */}
    </div>
  );
}

================================================================================

## Role in Project:

================================================================================

- Provides a dedicated, reusable form for adding certificates.
- Keeps Certificates.jsx clean by separating presentation (list) from form logic.
- Encourages consistency (can be reused in dashboard modals or profile pages later).

================================================================================

## Future Enhancements:

================================================================================

- Add stronger validation (required fields, file size/type checks).
- Show inline validation errors (instead of just preventing submit).
- Add UX polish: drag-and-drop area, progress bar for uploads, date picker.
- Allow editing existing certificates (form populated with initial values).
- Extract common form input styles into shared components for reusability.