**useAppStore.js**:

  ## Purpose:
  ================================================================================

  This file defines the **global state management layer** for the Skillfolio 
  frontend using **Zustand**.  
  It centralizes the application's core data: certificates, projects, and 
  authentication state.  

  Instead of passing props down multiple levels or using complex state libraries, 
  Zustand provides a lightweight store with easy-to-use `get` and `set` APIs.  

  ================================================================================

  ## Structure:
  ================================================================================

  #### Certificates State:
    • certificates: [] → Array of all certificate objects.
    • addCertificate(payload): Adds a new certificate with a generated ID 
      (using `nanoid` or fallback random string).

  #### Projects State:
    • projects: [] → Array of all project objects.
    • addProject(payload): Adds a new project with a unique ID and links 
      optionally to a certificate.

  #### Authentication State:
    • user: null by default; becomes `{ email }` when logged in or registered.
    • login({ email, password }): Mock login. Stores `user` in state + localStorage.
    • register({ email, password }): Mock signup. Stores `user` in state + localStorage.
    • logout(): Clears user state + removes it from localStorage.
    • restoreUser(): Rehydrates user state from localStorage at app load.

  #### ID Generation:
    • Uses `nanoid/non-secure` for unique IDs.
    • Falls back to a random string if `nanoid` is unavailable.

  ================================================================================

  ## Role in Project:
  ================================================================================

  - Provides **single source of truth** for certificates, projects, and 
    authentication across the frontend.
  - Enables **reactive updates**: when data changes in the store, UI components 
    (e.g., Dashboard, Certificates, Projects) automatically re-render.
  - Simplifies mock development: allows building UI features without 
    depending on backend readiness.

  ================================================================================

  ## Future Enhancements:
  ================================================================================

  - Replace mock login/register with real API calls (JWT authentication).
  - Persist projects and certificates to the backend instead of in-memory state.
  - Add actions for editing & deleting certificates/projects.
  - Extend goals state (tracking user learning objectives).
  - Implement error/loading states for async actions.