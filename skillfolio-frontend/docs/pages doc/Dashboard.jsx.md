**Dashboard.jsx**:

## Purpose:
===============================================================================

The Dashboard is the main authenticated hub of Skillfolio.

After login, users land here to see a snapshot of progress and jump to key areas.
This screen:

      • Loads lists from the store (certificates, projects, goals).
      • Loads analytics directly from API endpoints for overall stats.
      • Shows loading / empty / error states clearly.
      • Uses small animations (Framer Motion) for a pleasant feel.

It now includes three stat cards (Total Certificates, Total Projects, Goal Progress) and three “Recent” panels (Certificates, Projects, Goals). Certificate cards render thumbnails (image or PDF placeholder).

## Structure:
===============================================================================

- Layout:
  - **Sidebar (left side, md+)**:
      • Quick links: Certificates, Projects, Goals, Profile (placeholder).
      • Hidden on small screens.

  - **Main content (right side)**:
      • Header: “Welcome to Your Dashboard”
      • KPI cards (animated):
          → Total Certificates (from /api/analytics/summary/)
          → Total Projects (from /api/analytics/summary/)
          → Goal Progress (avg from /api/analytics/goals-progress/)
      • Recent panels
          → Recent Certificates (first 5)
          → Recent Projects (first 5)
          → Recent Goals (first 5)
- Styling & Motion:
  - Tailwind theme tokens (dark background, light text).
  - Card grid layouts with borders and rounded corners.
  - Framer Motion variants:
      • containerStagger (staggered children)
      • itemFade (fade + lift-in)

## Data Flow & State:
===============================================================================

- Store (Zustand): lists for “Recents”

  - useAppStore exposes:
      • Certificates
          → certificates, certificatesLoading, certificatesError
          → fetchCertificates() → GET /api/certificates/
      • Projects
          → projects, projectsLoading, projectsError
          → fetchProjects() → GET /api/projects/
      • Goals
          → goals, goalsLoading, goalsError
          → fetchGoals() → GET /api/goals/

- On mount, the Dashboard calls fetchCertificates, fetchProjects, and fetchGoals.
 The “Recent” panels simply slice the first 5 items from each list.

- Tip: If backend uses pagination, the store already normalizes responses like
 Array.isArray(data) ? data : data?.results || [].

## Direct API calls: analytics:
===============================================================================

- Summary (/api/analytics/summary/)
  - Local state: summary, summaryLoading, summaryError
  - Provides counts for certificates and projects.

- Goals progress (/api/analytics/goals-progress/)
  - Local state: goalsProgress, goalsProgressLoading, goalsProgressError
  - UI computes an average:
      • Prefer steps_progress_percent; fallback to progress_percent.

- Toasts
  - Local toasts array + <ToastContainer />.
  - Analytics errors push a toast (pushToast("error", msg)).
  - Users can dismiss toasts.

 ## Preview Helpers:
 ===============================================================================

- isImageUrl(url): checks common image extensions.
- isPdfUrl(url): checks .pdf.
- makeFileUrl(maybeUrl): resolves relative file paths against api.defaults.baseURL.

These utilities let certificate cards show:
- An image thumbnail for image files,
- A small “PDF preview” placeholder for PDFs,
- “No file” otherwise.

 ## Routing:
 ===============================================================================

- Uses <Link> for navigation:
  - /certificates, /projects, /goals
  - “Profile” is a placeholder for future route.

- The Dashboard route itself is protected by <ProtectedRoute> (outside this file).

 ## States & UI Behavior:
 ===============================================================================

- Loading: shows <Loading /> (with compact where appropriate).
- Error: shows <EmptyState isError /> with the error message.
- Empty: shows <EmptyState /> with helpful CTAs (e.g., “Add your first one”).
- Animated appearance for cards and recent lists via Framer Motion.

## Role in Project:
===============================================================================

- The Dashboard is the single place where a learner sees:
      • What they’ve archived (certificates),
      • What they’re building (projects),
      • How they’re progressing (goals)

- It’s also the first point where full FE↔BE integration is visible:
      • Store-backed lists for content,
      • API-backed analytics for global stats,
      • Clear UX for empty/loading/error.

## Future Enhancements:
===============================================================================

- Sidebar collapse on mobile (or a shared layout shell with a hamburger).
- Skeleton loaders for KPI cards and recent lists.
- “View all” routes for richer list pages (already linked).
- Per-item actions in recent (e.g., quick edit/delete).
- More analytics: streaks, time-to-goal, category breakdowns.
- Deep links from KPI cards to filtered views.

## Key Dependencies:
===============================================================================

- Zustand for global state (lists + loading/error flags).
- Axios instance (api) for analytics endpoints.
- Framer Motion for micro-animations.
- Custom components: ProgressBar, Loading, EmptyState, ToastContainer.




