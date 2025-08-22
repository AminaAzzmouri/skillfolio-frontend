import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-background text-text p-4 flex justify-between items-center">
      <Link to="/" className="font-heading text-xl">Skillfolio</Link>
      <div className="hidden md:flex gap-4">
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </div>
      {/* Hamburger menu for mobile will be added later */}
    </nav>
  );
}
