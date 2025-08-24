/* Docs: see docs/components/ProtectedRoute.jsx.md */

import { Navigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore.js";

export default function ProtectedRoute({ children }) {
  const user = useAppStore((s) => s.user);
  const bootstrapped = useAppStore((s) => s.bootstrapped);

  // Wait until we've attempted to restore the session
  if (!bootstrapped) return <div className="min-h-screen flex items-center justify-center text-text bg-background">Loading…</div>;

  // Not logged in? Kick to /login
  if (!user) return <Navigate to="/login" replace />;

  // Authenticated → render the protected content
  return children;
}
