**ProtectedRoute.jsx**:

  ## purpose:
  ================================================================================

  The **ProtectedRoute** component is a simple **route guard**.  
  Its job is to ensure that only authenticated users (those with a valid `user` 
  state in the global store) can access certain routes — like the dashboard.  

  It also waits for the app to finish **restoring a session**
  from localStorage (bootstrapping) before deciding whether to redirect or render.

  ================================================================================

  ## How it Works:
  ================================================================================

  - Reads two values from the global Zustand store:
    • `user`: the current authenticated user (or `null` if logged out)
    • `bootstrapped`: `true` after `restoreUser()` has run at least once on app load
    
  - **Bootstrapping guard:**  
    • If `bootstrapped === false`, it renders a minimal “Loading…” screen.  
    • This prevents a flash redirect to `/login` while the app is still restoring a session.
  
  - **Auth guard:**  
    • Once bootstrapped, if `user` is missing → redirects to `/login` (`<Navigate replace />`).  
    • If `user` exists → renders the protected `children`.


  #### Pseudocode:
  ------------------------------------------------------------------------------

  if (!bootstrapped) {
    render "Loading..." 
    } 
    else if (!user) {
      redirect to /login 
      } 
      else {
        render children
        }

  #### Example usage in `App.jsx`:
  ------------------------------------------------------------------------------
  import ProtectedRoute from "./components/ProtectedRoute";

  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  </Routes>

  ------------------------------------------------------------------------------

  ================================================================================

  ## Role in Project:
  ================================================================================

  - Prevents unauthenticated users from directly accessing private pages 
    via URL typing (e.g., `/dashboard`).
  - Works hand-in-hand with:
    • useAppStore.restoreUser() (sets bootstrapped when done)
    • Navbar’s logout() (which clears auth state and token)
  - Provides a clean UX with a tiny loading state during session restoration.

  ================================================================================

  ## Notes & Extensibility:
  ================================================================================

  - JWT awareness: The guard relies on user state (which is set after a successful JWT login).
  - If you add token expiry checks later, you can verify/refresh tokens before rendering children.
  - Role-based routing: You can extend the guard to check roles/permissions and redirect accordingly.
  - Custom loading UI: Replace the inline “Loading…” div with a skeleton/spinner component if desired.

