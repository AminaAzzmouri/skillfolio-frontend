## purpose:
================================================================================

A minimal route guard that:
    > Waits until the app has tried to restore a session (bootstrapped).
    > Lets authenticated users through.
    > Redirects unauthenticated users to /login.

- This prevents a “flash” redirect during app start and keeps private routes private.

## Props:
================================================================================

- children (ReactNode, required): The protected content to render after the checks pass.

- Note: The loading UI is currently baked in (“Loading…”). If you want a custom spinner, replace that JSX in the component.

## Data Sources (Zustand):
================================================================================

- Reads from useAppStore:
    • user: The authenticated user object (or null).
    • bootstrapped: true once restoreUser() has run at least once on app load.

## Behavior (Decision flow):
================================================================================

- Bootstrapping
If bootstrapped === false → render a minimal, full-height “Loading…” placeholder.

- Auth check
If bootstrapped === true and user == null → <Navigate to="/login" replace />.

- Pass through
If bootstrapped === true and user exists → render children.

- Why replace? It avoids leaving a useless entry in history (Back won’t bounce the user back into the protected path).

## Usage
================================================================================

- Wrap a single routeimport ProtectedRoute from "../components/ProtectedRoute";

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

- Nest under a layout

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/certificates" element={<CertificatesPage />} />
          </Route>

## Integration Notes:
================================================================================

- Ensure your store runs restoreUser() on app start and sets bootstrapped to true (even if no session is found).
- Logout should clear user, tokens, and any persisted session. After logout, navigating to a protected route will redirect to /login.

## Edge Cases & Tips:
================================================================================

- Token expiry: If you later add token refresh, perform it before rendering children; if refresh fails, clear session and redirect.
- Role/permission gating: You can extend the guard to accept required roles and redirect to /forbidden or a 403 page.
- Loading UX: Swap the inline “Loading…” for your shared <Loading /> component to keep visuals consistent.

## Testing Ideas (what to cover):
================================================================================

- Renders Loading… when bootstrapped is false.
- Redirects to /login when bootstrapped === true and user == null.
- Renders children when bootstrapped === true and user exists.
- Uses replace so that Back doesn’t return to the protected route.




