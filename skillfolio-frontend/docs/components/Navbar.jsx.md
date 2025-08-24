  **Navbar.jsx**:

  ## Purpose:
  ================================================================================

  The **Navbar** component provides a consistent, global navigation bar 
  across the Skillfolio frontend. It allows users to move between 
  major routes (Home, Dashboard, Login, Register) without reloading the page.  

  By keeping navigation centralized, the Navbar improves the 
  **user experience (UX)** and establishes a clear layout 
  pattern for authenticated and unauthenticated users.
  
  It provides quick links to key routes and reflects the current **auth state** 
  (e.g., shows the user’s email + a Logout button when authenticated).

  ================================================================================

  ## Structure:
  ================================================================================

  #### Layout:
      • Left: App name **Skillfolio**, styled as a brand identity.
      • Right: Navigation links displayed in a horizontal row.
      • Hidden links on mobile via `hidden md:flex` (only visible on `md+` screen sizes).

  #### Links (unauthenticated):
      • Home → `/`
      • Dashboard → `/dashboard` (works but typically redirects to login via `ProtectedRoute`)
      • Login → `/login`
      • Register → `/register`

  ### Links/Actions (authenticated)
      • Home → `/`
      • Dashboard → `/dashboard`
      • **User indicator**: shows the logged-in user’s email
      • **Logout button**: clears tokens + state and returns to a public route

  #### Styling:
      • Dark background (`bg-background`) and light text (`text-text`) 
        from Tailwind’s custom theme.
      • Flexbox layout to distribute brand name and links  (`flex`, `justify-between`, `gap-4`)

  #### Mobile Support:
      • Currently hides navigation links on small screens (`hidden md:flex`).
      • A hamburger menu placeholder (`...`) exists for a future responsive menu.

  ================================================================================

  ## Behavior & Data Flow:
  ================================================================================

  - Reads `user` from the global store (`useAppStore`) to decide which links to show.
  - Calls `logout()` from the store to:
    • clear `user`, `access`, and `refresh`
    • remove localStorage session
    • clear the axios Authorization header
  - (Optional) You may use `useNavigate()` to redirect after logout if desired.


  ### Minimal example (reference)
    ```jsx
      import { Link, useNavigate } from "react-router-dom";
      import { useAppStore } from "../store/useAppStore";

      export default function Navbar() {
        const user = useAppStore((s) => s.user);
        const logout = useAppStore((s) => s.logout);
        const navigate = useNavigate();

        const onLogout = () => {
          logout();
          navigate("/"); // optional: send user home
        };

        return (
          <nav className="bg-background text-text p-4 flex justify-between items-center">
            <Link to="/" className="font-heading text-xl">Skillfolio</Link>

            <div className="hidden md:flex gap-4">
              <Link to="/">Home</Link>
              <Link to="/dashboard">Dashboard</Link>

              {user ? (
                <>
                  <span className="opacity-80">{user.email}</span>
                  <button onClick={onLogout} className="underline">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login">Login</Link>
                  <Link to="/register">Register</Link>
                </>
              )}
            </div>
          </nav>
        );
      }

  ================================================================================

  ## Role in Project:
  ================================================================================

  - Provides **top-level navigation** so users can quickly switch 
    between public pages (Landing, Login/Register) and private pages (Dashboard).
  - Acts as a **persistent layout component** likely to appear 
    across multiple routes.
  - Communicates auth state at a glance (logged in vs. guest).
  - Works hand-in-hand with ProtectedRoute and restoreUser() to keep UX consistent across refreshes.

  ================================================================================

  ## Future Enhancements:
  ================================================================================

  - Add a responsive hamburger menu with dropdown for small screens.
  - Avatar dropdown with profile/goal links.
  - Make Navbar sticky or transparent on scroll for better UX.
  - Active link styles, keyboard focus improvements, and ARIA roles.
  - Toast/confirmation on logout (optional).
