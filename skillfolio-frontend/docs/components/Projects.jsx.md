**Projects.jsx**:

  ## Purpose:
  ================================================================================

  This component provides the interface for users to **add and manage projects** 
  within the Skillfolio app. Projects can optionally be linked to certificates, 
  allowing users to showcase how their learning achievements are applied in practice.

  For now, all data is stored locally in Zustand state (mock implementation).  
  In Week 4, this will connect to the backend API (`/api/projects`) to persist projects.

  ================================================================================

  ## Structure:
  ================================================================================

  #### State:
      • form: Local React state for project input fields (title, description, certificateId).
      • projects: Zustand state storing all user projects.
      • certificates: Zustand state, used to populate the dropdown for linking a certificate.

  #### Hooks:
      • useAppStore: Provides `addProject`, `projects`, and `certificates` from global state.
      • useState: Manages temporary form values before adding them to the store.

  #### Form:
      • Project Title: Name of the project.
      • Description: Details of the project (textarea for longer input).
      • Certificate Link (optional): Dropdown populated with existing certificates.
      • Submit Button: Adds the project to the store.

  #### Project List:
      • Renders all saved projects.
      • Each entry displays:
          → Title
          → Description
          → Linked Certificate (if any)
          → Creation date (auto-generated on submit)

  ================================================================================

  ## Role in Project:
  ================================================================================

  Projects.jsx highlights the **applied side of learning**, showing how certificates 
  are connected to real-world projects. It complements Certificates.jsx by demonstrating 
  progress in action and feeds into the Dashboard’s project stats.

  ================================================================================

  ## Future Enhancements:
  ================================================================================

  - Replace mock storage with backend persistence (`POST /api/projects`).
  - Add edit/delete functionality for managing projects.
  - Support multiple certificate links per project.
  - Improve UX with markdown support or file attachments for project details.
  - Allow filtering/sorting projects (e.g., by linked certificate, date).