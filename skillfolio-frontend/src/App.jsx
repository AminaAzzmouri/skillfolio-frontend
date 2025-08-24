/* Docs: see docs/App.jsx.md */

import { useEffect } from "react";
import Navbar from "./components/Navbar.jsx";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Certificates from "./pages/Certificates.jsx";
import Projects from "./pages/Projects.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAppStore } from "./store/useAppStore";

export default function App() {
  const restoreUser = useAppStore((s) => s.restoreUser);

  useEffect(() => {
    restoreUser();
  }, [restoreUser]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
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
        <Route path="/certificates" element={<Certificates />} />
        <Route path="/projects" element={<Projects />} />
      </Routes>
    </>
  );
}
