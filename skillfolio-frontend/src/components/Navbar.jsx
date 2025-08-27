/* Docs: see docs/components/Navbar.jsx.md */

// Global top navigation with links.

import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";

export default function Navbar() {
  const user = useAppStore((s) => s.user);
  const logout = useAppStore((s) => s.logout);
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/login",{ replace: true });
  };

  return (
    <nav className="bg-background text-text p-4 flex justify-between items-center">
      <Link to="/" className="font-heading text-xl">Skillfolio</Link>

      <div className="hidden md:flex gap-4 items-center">
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>

        {user ? (
          <>
            <span className="opacity-80 text-sm">{user.email}</span>
            <button onClick={onLogout} className="underline">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
      {/* Hamburger menu for mobile will be added later */}
    </nav>
  );
  }