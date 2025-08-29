// src/components/Navbar.jsx
import { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const user = useAppStore((s) => s.user);
  const logout = useAppStore((s) => s.logout);

  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // ESC to close
  const onKeyDown = useCallback((e) => {
    if (e.key === "Escape") setOpen(false);
  }, []);
  useEffect(() => {
    if (!open) return;
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onKeyDown]);

  const navLinks = [
    { to: "/dashboard", label: "Dashboard" }
  ];

  return (
    <header className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b border-gray-700">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-heading text-lg">
          Skillfolio
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="opacity-90 hover:opacity-100"
            >
              {n.label}
            </Link>
          ))}
          {user ? (
            <>
              <span className="text-sm opacity-70">{user.email}</span>
              <button
                className="rounded bg-gray-800 px-3 py-1 hover:bg-gray-700"
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="rounded bg-primary px-3 py-1 hover:bg-primary/80" to="/login">
                Login
              </Link>
              <Link className="rounded border border-gray-700 px-3 py-1 hover:bg-background/60" to="/register">
                Register
              </Link>
            </>
          )}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden inline-flex items-center justify-center rounded border border-gray-700 px-3 py-2"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          ☰
        </button>
      </div>

      {/* Drawer + overlay */}
      <AnimatePresence>
        {open && (
          <>
            {/* overlay */}
            <motion.div
              className="fixed inset-0 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            {/* panel */}
            <motion.aside
              className="fixed left-0 top-0 bottom-0 w-72 bg-background border-r border-gray-700 p-4"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              role="dialog"
              aria-modal="true"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-heading text-lg">Menu</span>
                <button
                  className="rounded border border-gray-700 px-2 py-1"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>

              <nav className="flex flex-col gap-3">
                {navLinks.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    className="rounded px-3 py-2 hover:bg-background/60"
                  >
                    {n.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-6 border-t border-gray-800 pt-4 flex flex-col gap-2">
                {user ? (
                  <>
                    <div className="text-sm opacity-70 truncate">{user.email}</div>
                    <button
                      className="rounded bg-gray-800 px-3 py-2 hover:bg-gray-700 text-left"
                      onClick={logout}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      className="rounded bg-primary px-3 py-2 hover:bg-primary/80"
                      to="/login"
                    >
                      Login
                    </Link>
                    <Link
                      className="rounded border border-gray-700 px-3 py-2 hover:bg-background/60"
                      to="/register"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
