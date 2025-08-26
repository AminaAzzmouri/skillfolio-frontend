# Skillfolio Frontend

This is the frontend of **Skillfolio**, a web application that helps self-learners archive their certificates, track skills, and connect achievements to projects.  

Built with **React + Tailwind CSS**, the frontend provides a responsive, modern, and user-friendly interface for learners.

---

## 🚀 Features (Planned)

- Landing page (Skillfolio intro + call-to-action)
- User authentication (login, register, logout)(✅ wired to backend)
- Dashboard for managing certificates & achievements (✅ shows real cert count; projects local)
- Forms to add certificates (✅ live API) and projects (🟨 local for now)
- Responsive design (desktop + mobile)
---

## 🛠️ Tech Stack

- React (with Vite)
- Tailwind CSS
- Zustand (state management)
- Axios (API requests → Django backend)

---

## 📅 Project Timeline

- Week 3: Project setup + basic layout (Landing + Auth pages)
- Week 4: Backend integration for auth (JWT) + Certificates API (GET/POST with file upload); keep projects local
- Week 5: Styling, polish, integration with backend data (projects, goals, profile)

---

## ⚡ Getting Started

==============================================================================
# Clone repo
git clone https://github.com/AminaAzzmouri/skillfolio-frontend.git

# Create project (If you didn’t scaffold with Vite already)
npm create vite@latest skillfolio-frontend

# Navigate into project folder
cd skillfolio-frontend

# Install dependencies
npm install

# Install tailwindcss postcss autoprefixer (if not present yet)
npm install -D tailwindcss@3 postcss autoprefixer

# Initialize
npx tailwindcss init -p

# Run development server
npm run dev

# Install react-router-dom
npm install react-router-dom

# Install Zustand for state management
npm install zustand

# Install Axios for API requests
npm install axios
==============================================================================

📌 **Backend setup required**  

Make sure the Django backend is running at `http://127.0.0.1:8000` with these endpoints available:  

- `POST /api/auth/register/`  
- `POST /api/auth/login/`  (expects { username: <email>, password })
- `GET /api/certificates/`  
- `POST /api/certificates/` (multipart; field name: file_upload)
- `GET /api/projects/`
- `POST /api/projects/`

If your backend base URL isn’t http://127.0.0.1:8000, update it in src/lib/api.js.

---

## 📅 Documentation

- /docs//components/* - [UI components & pages]
- /docs//state - [Global State (Zustand)

---

## Branches Strategy:

- **chore/react-setup**:

  - Purpose: Scaffold the React app and styling foundation.

  - Current Status:

    - Project bootstrapped with Vite
    - Tailwind CSS + PostCSS + Autoprefixer configured
    - Custom theme tokens (primary, secondary, background, text, accent) + fonts (Roboto / Roboto Mono) in tailwind.config.js
    - Dev server runs with npm run dev

  - Key files: `tailwind.config.js`, `postcss.config.js`, `index.html`

  - Next Steps: Keep this branch limited to tooling/config changes only (future chores go to new chore/\* branches).

---

- **feature/routing-and-navbar**:

  - Purpose: Introduce client-side routing and a global, reusable navigation bar.

  - Current Status:

    - Installed react-router-dom
    - Wrapped app with <BrowserRouter> in src/main.jsx
    - Added routes for /, /dashboard, /login, /register in src/App.jsx
    - Created src/components/Navbar.jsx with links (Home, Dashboard, Login, Register)
    - Scaffolded placeholder pages in src/pages (LandingPage, Dashboard, Login, Register)

  - Key files: `src/main.jsx`, `src/App.jsx`, `src/components/Navbar.jsx`, `src/pages/*`

  - Next Steps: Add mobile hamburger nav later in a small feature/navbar-mobile branch (optional)

---

- **feature/landing-page**:
  
  - Purpose: Build the landing page with hero section and CTAs (Sign Up / Log In).

  - Current Status:

    - Created `LandingPage.jsx` under `src/pages/`
    - Integrated `Navbar` at the top of the page
    - Added hero section with:
      - App name: **Skillfolio**
      - Tagline: “Store your learning journey in one place.”
      - Two CTA buttons: **Sign Up** → `/register`, **Log In** → `/login`
    - Applied Tailwind styling for a dark-sleek vibe (using custom theme colors + fonts)
    - Fully responsive (mobile-first design with centered layout)

  - Key files: `src/pages/LandingPage.jsx`

  - Next Steps:

    - Polish responsiveness further with optional animations

---

- **feature/dashboard-skeleton**:

  - Purpose: Provide a base layout for the user dashboard with sidebar navigation and placeholder content.

  - Current Status:

    - Created `Dashboard.jsx` under `src/pages/`
    - Implemented responsive layout with **Tailwind CSS**:
      - **Sidebar** (desktop view): links for Certificates, Projects, Profile
      - **Main Content** area with:
        - Welcome heading
        - Three placeholder stat cards: Total Certificates, Total Projects, Goal Progress
        - Total Certificates now reflects live backend data (via store)
        - Recent Certificates list pulls from store (backed by API load)
    - Styled using the dark-sleek theme tokens (background, text, etc.)
    - Responsive design → Sidebar hidden on small screens, content remains accessible
    - Connected dashboard stats to backend API

  - Key files: src/pages/Dashboard.jsx

  - Next Steps:
    - Add a collapsible mobile sidebar (later branch: `feature/dashboard-mobile`)
    - Feed stats dynamically from backend.  

---

- **feature/dashboard-polish**

  - Purpose: Pull fresh data on load and surface states for a smooth UX.

  - Current Status:
    - ✅ Dashboard calls `fetchCertificates()` and `fetchProjects()` on mount
    - ✅ Stats show loading/error/empty states
    - ✅ “Recent Certificates” lists latest items from API
    - ⏳ Optional: add “Recent Projects” and skeleton loaders

  - Key files:
    - `src/pages/Dashboard.jsx`

  - Next Steps:
    - Add a collapsible mobile sidebar (`feature/dashboard-mobile`)
    - Add “Recent Projects” panel fed by API

---

- **feature/auth-pages**:

  - Purpose: Implement Login & Register pages with styled forms connected to backend authentication (Django JWT)

  - Current Status: 
    - Register form sends POST request to `/api/auth/register/` (backend Django endpoint).
    - Login form sends POST request to `/api/auth/login/` and stores issued JWT tokens (access & refresh).
    - Session is persisted via `localStorage` → users remain logged in after page refresh.
    - Logout clears tokens and resets app state.
    - Added <ProtectedRoute> so pages like /dashboard are only accessible when authenticated.
    - Navbar now dynamically updates to show Login/Register when logged out, and Logout + email when logged in

  - Key files: 
    - `src/pages/Login.jsx` 
    - `src/pages/Register.jsx`
    - `src/components/ProtectedRoute.jsx`
    - `src/components/Navbar.jsx`
    - `src/store/useAppStore.js` (Zustand auth logic)
    - `src/lib/api.js`

  - Next Steps: 
    - Handle API error messages more gracefully in UI.

---

- **feature/state-management**:

  - Purpose: Global state store using Zustand.

  - Current Status: 
    - Auth state (user, tokens, session persistence via `restoreUser()){}`.
    - Certificates/projects slices added  
    - Local addProject still available for now (will be swapped with API calls).
    - Bootstrapping mechanism ensures guards wait
  
  - Key files: `src/store/useAppStore.js`
  
  - Next Steps: 
    - Add projects API (GET/POST), then edit/delete

---

- **feature/add-certificates**:

  - Purpose: Allow users to add certificates (title, issuer, date, file placeholder) and list them.
             wired to backend
  
  - Current Status: 
    - Certificates list loads from `GET /api/certificates/`  
    - Add Certificate form sends POST `/api/certificates/` with single file upload (file_upload)
    - Loading + error states handled in store  
    - Dashboard certificate count now reflects backend  
  
  - Key files (planned): 
    - `src/pages/Certificates.jsx`  
    - `src/components/forms/CertificateForm.jsx`  
    - `src/store/useAppStore.js` (fetchCertificates/createCertificate)  
  
  - Next Steps: Add certificate detail page, edit/delete support. 

---

- **feature/add-project**

  - Purpose: Let users capture projects and optionally link them to certificates.

  - Current Status:
    - ✅ Projects list loads from `GET /api/projects/`
    - ✅ Add Project sends `POST /api/projects/` with payload:
        { title, description, certificate: <certificateId | null> }
    - ✅ Dropdown options come from Certificates (already loaded from API)
    - ✅ Basic loading / error states in store
    - ⏳ Edit/Delete planned next

  - Key files:
    - `src/pages/Projects.jsx`
    - `src/store/useAppStore.js` (fetchProjects/createProject)

  - Next Steps:
    - Add project edit/delete in UI
    - Show “recent projects” on Dashboard
    - Optional: guided questions UI on the project form

---

- **feature/documentation**:

  - Purpose: keep README + docs in sync with implemented features

  - Key files (planned): 
    - `README.md`
    - `skillfolio-frontend/*`
    - `skillfolio-frontend/docs/components/*`
    - `skillfolio-frontend/state`
