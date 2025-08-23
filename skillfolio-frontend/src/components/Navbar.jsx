/*
  Navbar.jsx

  Purpose:
  ================================================================================

  The **Navbar** component provides a consistent, global navigation bar 
  across the Skillfolio frontend. It allows users to move between 
  major routes (Home, Dashboard, Login, Register) without reloading the page.  

  By keeping navigation centralized, the Navbar improves the 
  **user experience (UX)** and establishes a clear layout 
  pattern for authenticated and unauthenticated users.

  ================================================================================

  Structure:
  ================================================================================

  - Layout:
      • Left: App name **Skillfolio**, styled as a brand identity.
      • Right: Navigation links displayed in a horizontal row.
      • Hidden links on mobile (only visible on `md+` screen sizes).

  - Links:
      • Home → `/`
      • Dashboard → `/dashboard`
      • Login → `/login`
      • Register → `/register`

  - Styling:
      • Dark background (`bg-background`) and light text (`text-text`) 
        from Tailwind’s custom theme.
      • Flexbox layout to distribute brand name and links.

  - Mobile Support:
      • Currently hides navigation links on small screens (`hidden md:flex`).
      • A hamburger menu placeholder (`{* … *}`) exists for future enhancement.

  ================================================================================

  Role in Project:
  ================================================================================

  - Provides **top-level navigation** so users can quickly switch 
    between public pages (Landing, Login/Register) and private pages (Dashboard).
  - Acts as a **persistent layout component** likely to appear 
    across multiple routes.

  ================================================================================

  Future Enhancements:
  ================================================================================

  - Add a responsive hamburger menu with dropdown for small screens.
  - Show/hide links conditionally based on authentication state 
    (e.g., hide Login/Register if user is logged in).
  - Include logout button and/or user avatar when authentication is implemented.
  - Make Navbar sticky or transparent on scroll for better UX.
*/


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
