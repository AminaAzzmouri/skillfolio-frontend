**App.jsx**:

  ## Purpose:
  ================================================================================

  This is the **root component** of the Skillfolio frontend.  
  It orchestrates the **overall navigation** of the application by combining the 
  global Navbar and the React Router configuration.  

  Essentially, App.jsx acts as the central “map” that connects each URL path 
  to its corresponding page component.

  it runs a one-time **session restore** so the app knows whether a user is logged in
  right after a page refresh.

  ================================================================================

  ## Structure:
  ================================================================================

  #### Navbar:
    • Always visible at the top of the app.  
    • Provides navigation links: Home, Dashboard, Login, Register.

  #### Routes:
    • "/" → LandingPage (public entry point).  
    • "/dashboard" → Dashboard (protected by `ProtectedRoute`).  
    • "/login" → Login page.  
    • "/register" → Register page.  
    • "/certificates" → Certificates page (add/view certificates).  
    • "/projects" → Projects page (add/view projects).
    • "/ " now uses HomeGate: LandingPage for guests, Home.jsx for authed users - New Home.jsx page is different from Dashboard.

  #### ProtectedRoute:
    • Wraps private pages (currently `/dashboard`) to ensure only authenticated users can access them.  
    • Redirects unauthenticated users to the Login page.
    • It also waits for the session to finish restoring before deciding (prevents “flash” redirects).

  ## Session Restore (Bootstrapping):
  ================================================================================

  On mount, `App.jsx` calls `restoreUser()` from the global store:
  ```jsx
    const restoreUser = useAppStore((s) => s.restoreUser);

    useEffect(() => { restoreUser(); }, 
                    [restoreUser]);

  • Reads any previously saved { user, access, refresh } from localStorage.
  • Re-applies the Authorization header for API calls when an access token exists.
  • Sets bootstrapped=true so route guards know restoration is complete.

  This ensures a page refresh keeps you logged in, and the UI won’t prematurely
  redirect to /login while the session is still being restored.

  Navbar is always visible and works with auth-aware HomeGate.

  ================================================================================

  ## Role in Project:
  ================================================================================

  - Provides the **navigation backbone** of the app.  
  - Keeps routing centralized and easy to maintain.  
  - Ensures consistent global layout with Navbar on every page.  
  - Coordinates authentication flow by restoring sessions and guarding private routes.

  ================================================================================

  ## Future Enhancements:
  ================================================================================

  - Add more protected routes (e.g., Profile, Goals).  
  - Improve layout by introducing a global wrapper (e.g., footer, theme toggle).  
  - Implement a mobile hamburger menu in Navbar for smaller screens.  
  - Lazy-load heavy pages for faster first paint.
  - Route-level loading boundaries or skeletons.
  