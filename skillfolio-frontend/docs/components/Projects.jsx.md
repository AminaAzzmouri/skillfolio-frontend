**Projects.jsx**:

  ## Purpose:
  ================================================================================

  This component provides the interface for users to **add and manage projects** 
  within the Skillfolio app. 

  Projects can optionally be linked to certificates, allowing users to showcase how 
  their learning achievements are applied in practice.

  It now uses the live backend API:
  
    • GET `/api/projects/` to list projects
    • POST `/api/projects/` to create projects
    • Reads certificates from GET `/api/certificates/` to populate the link dropdown

   Authentication is handled globally (JWT), so requests include 
   Authorization: Bearer <access> via the axios helper.

  ================================================================================

  ## Structure:
  ================================================================================

  #### State (from Zustand: useAppStore):
      
      • projects / projectsLoading / projectsError
        Live project list + loading & error flags.

      • certificates / certificatesLoading / certificatesError
        Certificate list (used for the dropdown).

      • fetchProjects() → loads projects from the API

      • createProject({ title, description, certificateId }) → POST to API

      • fetchCertificates() → loads certificates for the dropdown

  #### Local component state:
      • form → { title, description (textarea for longer input), certificateId }
      • submitError → surfaces API errors on create
      • submitting → disables the submit button while posting

  #### Effects:
      • useEffect on mount:
            * fetchCertificates() then fetchProjects() to populate UI.

  #### Certificate title mapping:
      • useMemo creates a Map<id, title> from the certificates array so the 
        project list can show a readable certificate title (the API returns 
        only the certificate ID for each project).

  ================================================================================

  ## Form & Submission:
  ================================================================================

      • Fields:
            * Project Title (required)
            * Description (required)
            * Certificate (optional select; sends certificate: <id> or null)

      • Submit flow:            
            1. Validate locally.
            2. Call createProject({ title, description, certificateId }).
            3. On success, the new project is prepended to the list for a snappy UX.
            4. On failure, show a friendly error extracted from the API response (if present).

  ================================================================================

  ## UI States:
  ================================================================================

      • Loading:
            * Shows “Loading projects…” or “Loading certificates…” 
              while requests are in flight.

      • Error:
            * Renders a concise error message if projectsError 
              or certificatesError is set.
        
      • Empty:            
            * If projects is empty after loading, shows a gentle “No projects yet” message.

  ================================================================================

  ## Role in Project:
  ================================================================================

  Projects.jsx highlights the **applied side of learning**, showing how certificates 
  are connected to real-world projects. 
  
  It complements Certificates.jsx by demonstrating progress in action and feeds 
  into the Dashboard’s project stats (total projects, recent items).

  Establishes the standard list + create pattern for other entities.

  ================================================================================

  ## Future Enhancements:
  ================================================================================

  - Add edit/delete functionality for managing projects (PUT/PATCH/DELETE endpoints).
  - Filtering & search (e.g., ?certificate=<id>, ?search=..., ordering).
  - Support multiple certificate links per project.
  - Richer rendering (markdown description, attachments, screenshots).
  - Guided questions in the form (tools used, impact, problem solved).
  - Pagination support (swap data → data.results when DRF pagination is enabled).



