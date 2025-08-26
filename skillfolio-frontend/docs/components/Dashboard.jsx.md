**Dashboard.jsx**:

## Purpose:
===============================================================================

This component serves as the **main authenticated area** of the Skillfolio app.
Once logged in, users land here to view their overall progress and quickly
navigate to certificates, projects, and profile-related features.

The dashboard **fetches certificates and projects on mount** and surfaces
**loading / empty / error** states in the stats so the UI stays informative
while data is loading.

===============================================================================

## Structure:
===============================================================================

Layout:
  - **Sidebar (left side)**:
      • Navigation links → Certificates, Projects, Profile (Profile is a placeholder for now).
      • Visible on medium screens and above (hidden on small screens).

  - **Main content (right side)**:
      • Welcome header
      • **Statistics section**:
          → Total Certificates (from API-backed store)
          → Total Projects (from API-backed store)
          → Goal progress (static placeholder for now)
          → Each card can show loading/empty/error states depending on fetch status
      • **Recent Certificates**:
          → Short list of the most recently loaded certificates (from API-backed store).
          → If empty, show an “empty” placeholder.

Styling:
  - Tailwind custom theme (dark background, light text).
  - Grid layout for statistics (responsive).
  - Rounded cards with subtle background.

===============================================================================

## Data Flow & State:
===============================================================================

- Uses the global store `useAppStore` (Zustand).

  Certificates:
    - API-backed via `fetchCertificates()` (GET `/api/certificates/`)
    - Create via `createCertificate()` (POST `/api/certificates/`, multipart)
    - Exposed state: `certificates`, `certificatesLoading`, `certificatesError`

  Projects:
    - API-backed via `fetchProjects()` (GET `/api/projects/`)
    - Create via `createProject()` (POST `/api/projects/`)
    - Exposed state: `projects`, `projectsLoading`, `projectsError`

- **Dashboard behavior**:
    - On mount, calls **both** `fetchCertificates()` and `fetchProjects()` so counts are always fresh.
    - Counts:
        → Total Certificates → `certificates.length` (from API once loaded)
        → Total Projects → `projects.length` (from API once loaded)
    - Recent Certificates reads from `certificates` once fetched; renders empty/placeholder when none.

Tip:
  If you later enable server pagination, the store already normalizes list
  responses using `Array.isArray(data) ? data : data.results || []`.

===============================================================================

## Routing:
===============================================================================

- Uses React Router’s `<Link>` for client-side navigation.
  → “/certificates” → Certificates page
  → “/projects”     → Projects page
  → “/profile”      → reserved for future profile page

- The Dashboard route is wrapped by `<ProtectedRoute>`, so it only renders for authenticated users.

===============================================================================

## Role in Project:
===============================================================================

The dashboard is the **central hub** for the user’s learning journey.
It consolidates certificate tracking, project management, and (future) goal
progress into one place. It also acts as the first screen where FE↔BE integration
is visible, since totals and recent lists reflect the live backend.

===============================================================================

## Future Enhancements:
===============================================================================

- Add a “Recent Projects” panel (mirroring Recent Certificates).
- Add lightweight skeleton loaders for the stat cards.
- Make the sidebar collapsible on mobile (hamburger) or introduce a layout shell.
- Compute and visualize goal progress (e.g., projects completed vs. target).
- Link items to detail pages (certificate/project detail routes).


