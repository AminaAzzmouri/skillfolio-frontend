## Purpose:
================================================================================

The CertificateForm component encapsulates the **form UI and logic** for creating new certificates.
It is reusable and mounted inside Certificates.jsx (or later inside a Dashboard modal).

By isolating the form from the list view, we keep code cleaner and easier to maintain.

================================================================================

## Structure:
================================================================================

### Store usage:
• Uses `useAppStore()` to access `createCertificate(form)`  
• Store handles FormData creation and API POST  

### Local State:
• `form` object → { title, issuer, date_earned, file }  
• `submitting` → disables button & shows spinner text  
• `error` → shows inline API error  

### Form Fields:
• Title (required)  
• Issuer (required)  
• Date Earned (required)  
• File Upload (optional, accepts PDF/images) 
• Status dropdown (planned | in_progress | completed). 

### Behavior:
1. Prevent default  
2. Call `createCertificate(form)` (store turns it into FormData)  
3. Reset form (including hard reset of file input via `ref`)  
4. Show API error if request fails 
5. The form resets after submit and is shown/hidden via a toggle on the Certificates page. 

================================================================================

## Example Usage:
================================================================================

```jsx
// Certificates.jsx
<CertificateForm />
<ul>
  {certificates.map(c => <li key={c.id}>{c.title}</li>)}
</ul>

================================================================================

## Role in Project:

================================================================================

- Keeps Certificates.jsx focused on rendering list & states
- Central form logic in one place → reusable later in modals or profile pages

================================================================================

## Future Enhancements:

================================================================================

- AStronger validation (file size/type, required)
- Inline validation messages
- Drag-and-drop upload, progress indicators
- Support edit mode (prefill form values)
- Extract common input styles into shared components
- “Edit existing certificate” since toggle UI paves the way.
