**Certificates.jsx**:

  ## Purpose:
  ================================================================================

  This component allows users to **add and view certificates** within the Skillfolio app.  
  It serves as the interface for managing educational or professional achievements, 
  supporting certificate title, issuer, date earned, and an optional file upload.  

  Currently, certificates are stored in local Zustand state (mock storage).  
  In Week 4, this will connect to the backend API (`/api/certificates`) to persist data.

  ================================================================================

  ## Structure:
  ================================================================================

  #### State:
      • form: Local React state for certificate input fields (title, issuer, date_earned, file).
      • certificates: Zustand state holding the current list of certificates.

  #### Hooks:
      • useAppStore: Provides `addCertificate` and `certificates` state from the global store.
      • useState: Manages temporary form input values before submission.

  #### Form:
      • Title: Certificate name (e.g., "Full-Stack Web Development").
      • Issuer: Organization or platform (e.g., "Coursera").
      • Date Earned: Date field for when certificate was issued.
      • File Upload: Optional file input to attach a certificate file.
      • Submit Button: Adds the new certificate to the store.

  #### Certificate List:
      • Displays all certificates currently stored in Zustand.
      • Each entry shows:
          → Title
          → Issuer + Date
          → File name (if uploaded)

  ================================================================================

  ## Role in Project:
  ================================================================================

  Certificates.jsx represents a **core feature** of Skillfolio:  
  helping users track their learning and qualifications.  
  It complements the Dashboard by feeding certificate data into stats and recent activity lists.

  ================================================================================

  ## Future Enhancements:
  ================================================================================

  - Replace mock state with backend persistence (`POST /api/certificates`).
  - Support file previews or downloads for uploaded certificates.
  - Add edit and delete functionality for certificates.
  - Improve form UX (e.g., date picker enhancements, drag-and-drop file upload).
  - Integrate validation feedback (required fields, file size/type checks).