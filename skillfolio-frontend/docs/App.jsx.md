## Purpose:  ================================================================================

  Coordinates the **entire app shell**: renders the global `Navbar`, wires up **routing (React Router v6)**, and kicks off a **one-time session restore** so auth-gated routes behave correctly after refresh.

## Key ideas:  ================================================================================

#### HomeGate: 
  - a tiny gatekeeper for `/` that shows:
    • `LandingPage` for guests
    • `Home` for authenticated users
  - • `null` while the app is **bootstrapping** (prevents flicker)

#### ProtectedRoute: 
  wraps any route that requires authentication.

#### Session Restore:  
`restoreUser()` runs on mount; it hydrates `{ user, access, refresh }` from `localStorage` and reapplies the JWT header.

## Structure
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

  ## What's done so far:
  ================================================================================

  - Navbar always visible.
  - Auth-aware HomeGate implemented.
  - Protected routes working with ProtectedRoute.
  - Session restore wired in via Zustand store.
  - Implemented a mobile hamburger menu in Navbar for smaller screens.

  ================================================================================

  ## Future Enhancements:
  ================================================================================

  - Add more protected routes (e.g., Profile, Goals).  
  - Improve layout by introducing a global wrapper (e.g., footer, theme toggle).  
  - Lazy-load heavy pages for faster first paint.
  - Route-level loading boundaries or skeletons.
  