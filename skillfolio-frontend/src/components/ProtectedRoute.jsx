/*
  ProtectedRoute.jsx

  Purpose:
  ================================================================================

  The **ProtectedRoute** component is a simple **route guard**.  
  Its job is to ensure that only authenticated users (those with a valid `user` 
  state in the global store) can access certain routes — like the dashboard.  

  If the user is not logged in, they are redirected to the **./login** page.  
  If authenticated, the protected child components are rendered.

  ================================================================================

  How it Works:
  ================================================================================

  - Uses `useAppStore` (Zustand) to read the current `user` object from global state.
  - If `user` is `null` or missing → returns `<Navigate to="/login" replace />`, 
    which automatically redirects to the login page.
  - If `user` exists → simply renders the `children` components that were wrapped 
    inside `<ProtectedRoute>`.

  Example usage in `App.jsx`:
  ------------------------------------------------------------------------------
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />
  ------------------------------------------------------------------------------

  ================================================================================

  Role in Project:
  ================================================================================

  - Prevents unauthenticated users from directly accessing private pages 
    via URL typing (e.g., `/dashboard`).
  - Acts as a **first layer of client-side protection** until backend-based 
    authentication/authorization is implemented in Week 4.

  ================================================================================

  Future Enhancements:
  ================================================================================

  - Replace mock auth state with real JWT tokens from the backend.
  - Add logic to verify token validity (e.g., expired tokens → redirect to login).
  - Extend functionality to role-based routes (e.g., admin-only pages).
  - Optionally display a "loading" state if authentication is being restored 
    from localStorage or backend.
*/


import { Navigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";

export default function ProtectedRoute({ children }) {
  const user = useAppStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
