/* Docs: see docs/App.jsx.md */

import { useEffect } from "react";
import Navbar from "./components/Navbar.jsx";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import Home from "./pages/Home.jsx";              // NEW
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Certificates from "./pages/Certificates.jsx";
import Projects from "./pages/Projects.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAppStore } from "./store/useAppStore";

// Small inline gate: show Landing for guests, Home for authed users
function HomeGate() {
  const user = useAppStore((s) => s.user);
  const bootstrapped = useAppStore((s) => s.bootstrapped);
  if (!bootstrapped) return null; // or a tiny loader
  return user ? <Home /> : <LandingPage />;
}

export default function App() {
  const restoreUser = useAppStore((s) => s.restoreUser);

  useEffect(() => {
    restoreUser();
  }, [restoreUser]);

  return (
    <>
      <Navbar />
      <Routes>
        {/* Home now decides based on auth state */}
        <Route path="/" element={<HomeGate />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/certificates"
          element={
            <ProtectedRoute>
              <Certificates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
