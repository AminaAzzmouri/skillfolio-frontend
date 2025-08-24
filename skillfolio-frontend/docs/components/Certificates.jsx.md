**Certificates.jsx**:

  ## Purpose:
  ================================================================================

  This component allows users to **add and view certificates** within the Skillfolio app.  
  It serves as the interface for managing educational or professional achievements, 
  supporting certificate title, issuer, date earned, and an optional file upload.  

  In feature/add-certificates branch the page talks to the Django API (/api/certificates/) instead of using local mock state.

  ================================================================================

  ## Structure:
  ================================================================================

  #### State & Data:
      • form: Local React state for certificate input fields (title, issuer, date_earned, file).

      • Global store (Zustand):
        → certificates: array populated by fetchCertificates() (GET /api/certificates/).
        → createCertificate(formData): POST to /api/certificates/ using FormData (handles file upload).
        → Optional UI flags you may add: loading, error for fetch/create.

  #### Hooks:
      • useAppStore() → read certificates and call fetchCertificates() / createCertificate().
      • useEffect → call fetchCertificates() on mount so the list shows server data.

  #### Form:
      • Title: Certificate name (e.g., "Full-Stack Web Development").
      • Issuer: Organization or platform (e.g., "Coursera").
      • Date Earned: Date field for when certificate was issued.
      • File Upload: Optional file input to attach a certificate file.
      • On submit: 

        1. Build a FormData instance:
            . title, issuer, date_earned
            . file_upload (only if a file is present)

        2. Call createCertificate(formData).

        3. Clear the form and optionally refresh the list or optimistically add.

  #### Certificate List:
      • Renders the store’s certificates (server data).
      • Each entry shows:
          → Title
          → Issuer + Date_earned
          → file label if file_upload exists (you can render a link once you expose absolute URLs).

  ================================================================================

  ## States to handle (recommended):
  ================================================================================

  . Loading: show a small spinner/placeholder while fetching/creating.
  . Empty: show a friendly “No certificates yet” message.
  . Error: surface a short error message if the API fails (e.g., 401, validation).
  
  ================================================================================

  ## Backend Contract (DRF):
  ================================================================================

  - GET /api/certificates/ → list current user’s certs.

  - POST /api/certificates/ (multipart) fields:
    * title (string, required)
    * issuer (string, required)
    * date_earned (YYYY-MM-DD, required)
    * file_upload (file, optional)

  - Requires Authorization: Bearer <access_token>.
  
  ================================================================================

  ## Implementation Notes:
  ================================================================================

  - Use FormData for POST when a file input is present:
    
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("issuer", form.issuer);
    fd.append("date_earned", form.date_earned);
    if (form.file) fd.append("file_upload", form.file);
    await createCertificate(fd);
    
    * Ensure your axios instance sends Authorization (store sets this via setAuthToken(access) on login/restore).

    * If you’re seeing 401 Unauthorized, confirm:
        * You are logged in, and
        * setAuthToken(access) was called (check Network tab → Request Headers).
  
  ================================================================================

  ## Role in Project:
  ================================================================================

  Certificates.jsx represents a **core feature** of Skillfolio:  
  helping users track their learning and qualifications.  
  It complements the Dashboard by feeding certificate data into stats and recent activity lists.

  ================================================================================

  ## Future Enhancements:
  ================================================================================

  - File preview/download (render link when file_upload URL is returned).
  - Add edit and delete functionality for certificates (PUT/PATCH/DELETE endpoints).
  - Search & filters (issuer, year; passthrough query params to DRF).
  - Improve form UX (e.g., date picker enhancements, drag-and-drop file upload? progress for large files).
  - Integrate validation feedback (required fields, file size/type checks).
  - Optimistic updates: update the UI instantly, then reconcile with server.

  ================================================================================

  ## Minimal Usage Pattern (example):
  ================================================================================
  
  // On mount
  useEffect(() => {
    fetchCertificates(); // pulls from /api/certificates/
  }, []);

  // On submit
  const onSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("title", title);
    fd.append("issuer", issuer);
    fd.append("date_earned", date_earned);
    if (file) fd.append("file_upload", file);
    await createCertificate(fd);
    resetForm();
  };
