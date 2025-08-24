**Dashboard.jsx**:

  ## Purpose:
  ================================================================================

  This component serves as the **main authenticated area** of the Skillfolio app. 
  Once logged in, users land here to view their overall progress, achievements, and 
  quick access to certificates, projects, and profile-related features.

  ================================================================================

  ## Structure:
  ================================================================================

  Layout:
    - **Sidebar (left side)**: 
        • Navigation links → Certificates, Projects, Profile (Profile is a placeholder for now).
        • Visible on medium screens and above (hidden on small screens).
    
    - **Main content (right side)**:
        • Welcome header
        • Statistics section:
            → Displays total certificates (from store)
            → Displays total projects (from store)
            → Displays goal progress (static placeholder for now, dynamic later)
        • Recent Certificates section:
            → Short list of recently added certificates.

  Styling:
    - Uses Tailwind’s custom theme (dark background, light text).
    - Grid layout for statistics (responsive for small/large screens).
    - Rounded cards with subtle background for UI clarity.

  ================================================================================

  ## Data Flow & State:
  ================================================================================

  - Uses the global store useAppStore.
    → certificates: now intended to be hydrated from the backend via fetchCertificates() (feature/add-certificates branch).
    → projects: still local mock list (will be API-backed in a later branch).

  - Counts: 
    → Total Certificates → certificates.length (real API count once fetchCertificates() has run).
    → Total Projects → projects.length (mock for now).

  - Recent Certificates:
    → Render from certificates (already in store). If empty, show an “empty state”.

  Tip: In feature/add-certificates branch, call fetchCertificates() somewhere (e.g., Certificates page on mount, or here in Dashboard in a useEffect) so the count reflects the real API.

  ================================================================================

  ## Routing:
  ================================================================================

  - Uses React Router’s <Link> for client-side navigation.
    → “/Certificates” → /certificates
    → “/Projects”    → /projects
    → “/Profile”     → reserved for future profile page

  Dashboard is wrapped by <ProtectedRoute> at the route level, so it only renders for authenticated users.

  ================================================================================

  ## Role in Project:
  ================================================================================

  The dashboard is the **central hub** for the user’s learning journey. 
  It consolidates certificate tracking, project management, and goal progress 
  into one interface, allowing users to quickly gauge their skill-building activity.
  Surfaces live certificate stats (after integration) and quick navigation.
  It acts as the first place where FE↔BE integration becomes visible to the user (the certificate count will reflect server data).

  ================================================================================

  ## Future Enhancements:
  ================================================================================

  - Replace projects mock with real API (fetchProjects()), then show live project count.
  - Add a small loader/empty state for the stats section if data hasn’t loaded yet.
  - Clickable “Recent Certificates” items → detail pages.
  - Goal progress:
    → Compute from backend data (e.g., completed projects / target).
    → Visualize with a progress bar or mini chart.
  - Add a mobile sidebar (hamburger) and/or a layout shell component.