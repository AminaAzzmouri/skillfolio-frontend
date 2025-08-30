# Skillfolio Frontend

Skillfolio helps self-learners archive certificates, document projects, and hit goals—so progress is visible, connected, and shareable.

  - Frontend: React (Vite) · Zustand · Tailwind CSS · Axios
  - Backend: Django + DRF (JWT auth)
  - Data sources: Live API + a small local JSON “feed” for public announcements

---

## ✨ Overview

- Auth with JWT (register, login, logout, session restore)
- Private routes guarded by ProtectedRoute
- Certificates: create (multipart upload), list, map to projects
- Projects: create, list, link to certificates, guided fields + live auto-description
- Goals: create, steps/checklist per goal, progress via completed steps and/or completed projects, days-left nudges, local step reordering with persistence
- Home (for authed users): motivation, rotating “Did you know?” facts, and an Announcements section backed by a small local JSON feed (with “Save as Goal” one-click)
- Dashboard: live stats (certs/projects), recent items
- Shared UI: Navbar (desktop + mobile drawer), Modal, ConfirmDialog, ProgressBar, Pagination, SearchBar, Filters, SortSelect, ThemeToggle, Toasts
- Docs everywhere (/docs/*) so contributors know how each piece works

---

🧭 Architecture & Repo Map

src/
  components/
    forms/ (CertificateForm, ProjectForm, GoalForm)
    Modal, ConfirmDialog, ProgressBar, Pagination,
    SearchBar, Filters, SortSelect, ThemeToggle, ToastContainer, Navbar
  pages/
    LandingPage, Home, Dashboard, Certificates, Projects, Goals
  sections/
    AnnouncementsSection (cards + filters)
  store/ (useAppStore + API slices: certificates, projects, goals)
  lib/
    api.js (axios instance + auth header + 401 interceptor)
    announcements.js (fetch from /public/announcements.json)
  styles/
    index.css (theme tokens & base styles)
  App.jsx (routing + HomeGate + guards)
public/
  announcements.json (static feed for enrollments & deals)
tailwind.config.js (colors via CSS vars, dark mode = class)

- Auth flow: Zustand keeps { user, access, refresh }, writes to localStorage, and re-applies the Authorization header on reload via restoreUser().

- API base URL: VITE_API_BASE (set in .env.local) + axios api instance + a global 401 interceptor that clears stale tokens and bounces to /login.

---

✅ What’s Done (from the start → now)

- Foundations & First Screens
  - Project setup: Vite + Tailwind + folder structure; pushed chore/react-setup
  - Routing & Navbar: react-router-dom, global <Navbar />, routes for /, /dashboard, /login, /register
  - Landing Page: hero + CTAs; dark, responsive theme
  - Dashboard skeleton: sidebar layout, placeholder stats & recent certificates
  - State (Zustand): mock auth + mock data actions; localStorage persistence
  - ProtectedRoute: private access to /dashboard
  - Branch hygiene: one feature per branch; frequent rebases; README notes-

- Live Auth & API-backed Data
  - JWT auth: register/login/logout wired to DRF; restoreUser() on boot with bootstrapped flag
  - Navbar: Login/Register vs email + Logout, dynamic by auth state
  - Certificates (live): GET/POST (multipart), loading/error/empty states, dashboard count, recent list
  - Projects (live): GET/POST (link to cert), loading/error/empty states, dashboard counters
  - Infrastructure: .env.local with VITE_API_BASE, axios instance, 401 interceptor

- Goals, UX polish, and rich list tooling
  - **Goals page:** create/update/delete goals, steps per goal (add, rename, toggle done, reorder with persisted order), progress bars, deadline countdown, “nudge” when close
  - **Reusable primitives:** ProgressBar, Pagination (Prev/Next), SearchBar (debounced), Filters (per type), SortSelect, Modal, ConfirmDialog, ToastContainer, Loading, EmptyState
  - Projects page upgrades: responsive card grid; filters/search/sort/pagination; “linked certificate” chip with deep link; guided fields → live auto-description (still editable)
  ( )
  - Certificates page polish: consistent states; ready for edit/delete (store & page support added)
  - Home (authed): motivation blocks + AnnouncementsSection (local JSON feed of enrollments/deals) with filters & search; Save as Goal prefilled modal using GoalForm’s initialDraft
  - Theme: CSS-variable based design tokens with dark/light toggle; theme applied early in index.html to avoid FOUC
  - Docs: component/page/store docs added or refreshed for easier onboarding

---

##  🔭 What’s Next

### Short term:
- Certificates/Projects edit & delete UI (store methods already in)
- “Recent Projects” on Dashboard; richer certificate/project detail pages
- Markdown support for project descriptions; chips for skills lists

### Mid term
- JWT refresh flow; role/permission hooks for routes
- Backend feed for announcements (replace /public/announcements.json)
- Analytics endpoints for richer dashboard (+ goal streaks)

### Nice-to-have
- Attachments/screenshots on projects; image/PDF previews
- Confetti/special animations on milestones; more personalization
- Pagination controls with direct page numbers (1…N)

---

## 📦 Announcements feed (why it exists & how it works)

While the backend API for public promotions/enrollments is being scoped, we ship a tiny static feed:
  - File: public/announcements.json
  - Fetcher: src/lib/announcements.js (no-store fetch, small normalization)
  - UI: src/sections/AnnouncementsSection.jsx + src/components/AnnouncementCard.jsx
  - Integration: Appears on Home for signed-in users with filters (platform/type) and search; each item has “Visit” + “Save as Goal”

> Why: lets the UX ship immediately (browse, filter, and convert announcements to goals) without waiting on a backend table.

> Upgrade path: later replace the fetcher with a backend endpoint (e.g., /api/announcements/) or a small service app, add caching/ETag support, and enrich with authenticated personalization (e.g., show deals matching a user’s certificates/skills).

## 🧪 Testing

- Scope covered (unit/integration via React Testing Library):
  * Pages: Certificates, Projects, Goals (list states, CRUD handlers, filters/sort/pagination behaviors)
  * Forms: CertificateForm, ProjectForm (guided fields & description preview), GoalForm (create & edit, initialDraft)
  * Components: Pagination, ProgressBar, ConfirmDialog, Navbar (auth states), etc.

- Run tests: npm test
(If you’re using Vitest: npx vitest; with Jest: npm test—both work with RTL.)

## 🧰 Setup (clone & run locally)

### Prereqs
- Node 18+ and npm
- Python 3.10+ for the backend (Django + DRF)
- A running backend (dev): http://127.0.0.1:8000

1) Clone & install

          git clone https://github.com/AminaAzzmouri/skillfolio-frontend.git
          cd skillfolio-frontend
          npm install

2) Env config

          Create .env.local in the project root:
          VITE_API_BASE=http://127.0.0.1:8000

Restart the dev server if you change it later.

3) Run frontend

          npm run dev

4) Backend quickstart (high level)

  - Create and activate a Python venv
  - Install backend requirements
  - Add the frontend origin to CORS allowed origins
  - Run migrations & start the server
  - Confirm endpoints:
        * POST /api/auth/register/
        * POST /api/auth/login/ (expects { username: <email>, password })
        * GET/POST /api/certificates/ (POST is multipart, field file_upload)
        * GET/POST /api/projects/
        * GET/POST/PATCH/DELETE /api/goals/
        * GET/POST/PATCH/DELETE /api/goalsteps/

5) Optional sample data
Edit public/announcements.json to try the announcements flow quickly.

## 🚢 Deployment

- Frontend:
      - Build: npm run build → static assets in dist/
      - Host on Netlify/Vercel/static host
      - Set environment variable VITE_API_BASE=https://<your-backend-domain>
      - Ensure dark mode class toggling script stays in index.html head

- Backend:
      - Configure allowed origins (CORS) to include your deployed FE domain
      - Serve over HTTPS
      - Ensure JWT endpoints and file uploads are accessible from FE
      - Set correct file/media static hosting if you serve uploaded files

- Common gotchas:
      - 401s after deploy → check that FE VITE_API_BASE matches the deployed BE; verify CORS and HTTPS
      - File uploads blocked → confirm content types and media storage configuration

## 🔌 API Quick Reference (used by FE)

### Auth:
    - POST /api/auth/register/
    - POST /api/auth/login/ → { access, refresh }
    - POST /api/auth/logout/ → { refresh } (best-effort blacklist)

### Certificates:
    - GET /api/certificates/
    - POST /api/certificates/ (multipart: title, issuer, date_earned, file_upload)
    - PATCH /api/certificates/:id/
    - DELETE /api/certificates/:id/

### Projects:
    - GET /api/projects/?search=&ordering=&certificate=&status=&page=
    - POST /api/projects/ (FE sends certificateId, mapped to certificate)
    - PATCH /api/projects/:id/ (maps certificateId → certificate)
    - DELETE /api/projects/:id/

### Goals & Steps:
    - GET/POST/PATCH/DELETE /api/goals/
    - GET /api/goalsteps/?goal=<id>
    - POST /api/goalsteps/ (goal, title, is_done, order)
    - PATCH /api/goalsteps/:id/
    - DELETE /api/goalsteps/:id/

## 🗂 Past Branches & Purpose (kept for history)chore/react-setup — Vite, Tailwind, tokens, fonts

- feature/routing-and-navbar — Router + global Navbar
- feature/landing-page — hero + CTAs
- feature/dashboard-skeleton — layout + placeholders
- feature/auth-pages — login/register + ProtectedRoute
- feature/state-management — Zustand store (auth & mock data → later API)
- feature/add-certificates / feature/certificates-polish — live API + UX
- feature/add-project / feature/projects-polish — live API + guided fields
- feature/guided-questions — live auto-description for projects
- feature/dashboard-polish — stats wired, states surfaced

(Later work folded in main: Goals, steps, filters/sort/pagination, announcements feed, mobile drawer, docs)

## 📝 Changelog Highlights

- Week 1: Scaffolding, routing, Navbar, Landing, Dashboard skeleton, mock state, ProtectedRoute

- Week 2: JWT auth; restore session; Certificates & Projects live API; dashboard data; .env and axios refactor

- Later: Goals & steps with reordering; Projects & Certificates polish; Home with Announcements feed; shared UI primitives; dark/light theme with CSS vars; broad documentation across pages/components/store

## 🙌 Credits & License

- Built by Amina Azzmouri
- Frontend uses open-source libraries (React, Vite, Tailwind, Zustand, Axios, RTL)
