---

### 🔹 **Frontend repo (`skillfolio-frontend`) README**
Focus on React, UI, and user experience.  

```markdown
# Skillfolio Frontend

This is the frontend of **Skillfolio**, a web application that helps self-learners archive their certificates, track skills, and connect achievements to projects.  

Built with **React + Tailwind CSS**, the frontend provides a responsive, modern, and user-friendly interface for learners.

---

## 🚀 Features (Planned)

- Landing page (Skillfolio intro + call-to-action)
- User authentication (login, register, logout)
- Dashboard for managing certificates & achievements
- Form to describe projects linked to certificates
- Responsive design (desktop + mobile)

---

## 🛠️ Tech Stack

- React (with Vite)
- Tailwind CSS
- Zustand (state management)
- Axios (API requests)

---

## 📅 Project Timeline

- Week 3: Project setup + basic layout (Landing + Auth pages)
- Week 4: Dashboard + forms for certificates/projects
- Week 5: Styling, polish, integration with backend

---

## ⚡ Getting Started

```bash
# Clone repo
git clone https://github.com/AminaAzzmouri/skillfolio-frontend.git

# Create project
npm create vite@latest skillfolio-frontend

# Navigate into project folder
cd skillfolio-frontend

# Install dependencies
npm install

# Install tailwindcss postcss autoprefixer
npm install -D tailwindcss@3 postcss autoprefixer

# Initialize
npx tailwindcss init -p

# Run development server
npm run dev

# Install react-router-dom
npm install react-router-dom
```

---

## Branches Strategy:

- **chore/react-setup**:

  - Purpose: Scaffold the React app and styling foundation.

  - Current Status:

    - Project bootstrapped with Vite
    - Tailwind CSS + PostCSS + Autoprefixer configured
    - Custom theme tokens (primary, secondary, background, text, accent) + fonts (Roboto / Roboto Mono) in tailwind.config.js
    - Dev server runs with npm run dev

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

  - Key files: src/main.jsx, src/App.jsx, src/components/Navbar.jsx, src/pages/*

  - Next Steps:

    - Merge, then build the hero section in feature/landing-page
    - Add mobile hamburger nav later in a small feature/navbar-mobile branch (optional)

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

  - Key files: src/pages/LandingPage.jsx

  - Next Steps:

    - Polish responsiveness further with optional animations
    - Merge, then move on to `feature/dashboard` for dashboard skeleton

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
        - Recent Certificates list (static items for now)
    - Styled using the dark-sleek theme tokens (background, text, etc.)
    - Responsive design → Sidebar hidden on small screens, content remains accessible

  - Key files: src/pages/Dashboard.jsx

  - Next Steps:
    - Add a collapsible mobile sidebar (later branch: `feature/dashboard-mobile`)
    - Connect dashboard stats to backend once APIs are ready
    - Replace placeholder certificate list with dynamic data

---

- **feature/auth-pages**:

  - Purpose: Implement Login & Register pages with styled forms (mock submit for now).
  - Current Status: Two pages created, basic validation, ready to integrate with backend JWT in Week 4.
  - Key files: src/pages/Login.jsx, src/pages/Register.jsx, src/components/ProtectedRoute.jsx
  - Next Steps: Replace console.log with axios calls to /auth endpoints.

---

- **feature/state-management**:

  - Purpose: Introduce a tiny global store (Zustand) to hold mock certificates & projects until backend integration.
  - Current Status: addCertificate/addProject actions available, arrays stored in memory.
  - Key files: src/store/useAppStore.js
  - Next Steps: Replace with API calls and persist auth token in Week 4.

---

- **feature/add-certificates**:

  - Purpose: Allow users to add certificates (title, issuer, date, file placeholder) and list them.
  - Current Status: Form saves to global store; list renders beneath the form.
  - Key files (planned): src/pages/Certificates.jsx, src/components/forms/CertificateForm.jsx, route /certificates and /certificates/new
  - Next Steps: Replace with backend POST/GET and real file uploads in Week 4.

---

- **feature/add-project**:

  - Purpose: Let users capture projects and optionally link them to certificates.
  - Current Status: Form + list powered by store; certificate linking supported.
  - Key files (planned): src/pages/Projects.jsx, src/components/forms/ProjectForm.jsx, route /projects and /projects/new
  - Next Steps: Persist to backend and show guided questions in Week 4.
