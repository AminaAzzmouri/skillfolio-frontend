/* Docs: see docs/components/ProtectedRoute.jsx.md */

import { Navigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore.js";

export default function ProtectedRoute({ children }) {
  const user = useAppStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
