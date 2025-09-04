/* Docs: see components/Navbar.jsx.md */

import { useEffect, useState, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import { User } from "lucide-react";

export default function Navbar() {
  const user = useAppStore((s) => s.user);
  const logout = useAppStore((s) => s.logout);

  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const onKeyDown = useCallback((e) => {
    if (e.key === "Escape") setOpen(false);
  }, []);
  useEffect(() => {
    if (!open) return;
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onKeyDown]);

  const navLinks = [{ to: "/dashboard", label: "Dashboard" }];

  const displayName =
    user?.username || (user?.email ? user.email.split("@")[0] : "");

  // Reusable hover/tap animation for items
  const hoverAnim = {
    whileHover: { scale: 1.04 },
    whileTap: { scale: 0.98 },
    transition: { type: "spring", stiffness: 400, damping: 30 },
  };

  // Shared colorful-hover classes
  const colorfulHover =
    "rounded transition-colors hover:bg-gradient-to-r hover:from-primary/30 hover:to-secondary/30";

  return (
    <header className="sticky top-0 z-40 bg-surface/95 backdrop-blur border-b border-border shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-heading text-lg">
          Skillfolio
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-3">
          {navLinks.map((n) => (
            <motion.div key={n.to} {...hoverAnim}>
              <Link
                to={n.to}
                className={`px-3 py-1 ${colorfulHover}`}
              >
                {n.label}
              </Link>
            </motion.div>
          ))}

          {user ? (
            <>
              {/* Profile chip: icon + name; all clickable */}
              <motion.div className="ml-2" {...hoverAnim}>
                <Link
                  to="/profile"
                  title="Open profile"
                  className={`inline-flex items-center gap-1 px-3 py-1 text-sm opacity-90 underline-offset-2 ${colorfulHover}`}
                >
                  <User size={16} className="opacity-90" />
                  <span>{displayName}</span>
                </Link>
              </motion.div>

              <motion.button
                type="button"
                className={`btn btn-outline ml-1 ${colorfulHover}`}
                onClick={logout}
                {...hoverAnim}
              >
                Logout
              </motion.button>
            </>
          ) : (
            <>
              <motion.div {...hoverAnim}>
                <Link className={`btn btn-primary ml-2 ${colorfulHover}`} to="/login">
                  Login
                </Link>
              </motion.div>
              <motion.div {...hoverAnim}>
                <Link className={`btn btn-outline ${colorfulHover}`} to="/register">
                  Register
                </Link>
              </motion.div>
            </>
          )}

          {/* Theme toggle with the same hover/scale treatment */}
          <motion.div {...hoverAnim} className={`p-1 ${colorfulHover}`}>
            <ThemeToggle />
          </motion.div>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden inline-flex items-center justify-center rounded border border-border px-3 py-2"
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
              className="fixed left-0 top-0 bottom-0 w-72 bg-surface border-r border-border p-4"
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
                  className="rounded border border-border px-2 py-1"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>

              <nav className="flex flex-col gap-2">
                {navLinks.map((n) => (
                  <motion.div key={n.to} {...hoverAnim}>
                    <Link
                      to={n.to}
                      className={`rounded px-3 py-2 hover:bg-background/40 ${colorfulHover}`}
                    >
                      {n.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-6 border-t border-border pt-4 flex flex-col gap-2">
                <motion.div {...hoverAnim} className={`self-start p-1 ${colorfulHover}`}>
                  <ThemeToggle />
                </motion.div>

                {user ? (
                  <>
                    <motion.div {...hoverAnim}>
                      <Link
                        to="/profile"
                        className={`inline-flex items-center gap-1 text-sm opacity-90 truncate underline-offset-2 px-3 py-2 ${colorfulHover}`}
                        title="Open profile"
                      >
                        <User size={16} className="opacity-90" />
                        <span className="truncate">{displayName}</span>
                      </Link>
                    </motion.div>

                    <motion.button
                      className={`btn btn-outline text-left ${colorfulHover}`}
                      onClick={logout}
                      {...hoverAnim}
                    >
                      Logout
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.div {...hoverAnim}>
                      <Link className={`btn btn-primary ${colorfulHover}`} to="/login">
                        Login
                      </Link>
                    </motion.div>
                    <motion.div {...hoverAnim}>
                      <Link className={`btn btn-outline ${colorfulHover}`} to="/register">
                        Register
                      </Link>
                    </motion.div>
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
