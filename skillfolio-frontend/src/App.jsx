/*
  App.jsx

  Purpose:
  ================================================================================

  This is the **root component** of the Skillfolio frontend.  
  It orchestrates the **overall navigation** of the application by combining the 
  global Navbar and the React Router configuration.  

  Essentially, App.jsx acts as the central “map” that connects each URL path 
  to its corresponding page component.

  ================================================================================

  Structure:
  ================================================================================

  - Navbar:
    • Always visible at the top of the app.  
    • Provides navigation links: Home, Dashboard, Login, Register.

  - Routes:
    • "/" → LandingPage (public entry point).  
    • "/dashboard" → Dashboard (protected route).  
    • "/login" → Login page (mock auth for now).  
    • "/register" → Register page (mock auth for now).  
    • "/certificates" → Certificates page (add/view certificates).  
    • "/projects" → Projects page (add/view projects).  

  - ProtectedRoute:
    • Wraps the Dashboard route to ensure only authenticated users can access it.  
    • Redirects unauthenticated users to the Login page.

  ================================================================================

  Role in Project:
  ================================================================================

  - Provides the **navigation backbone** of the app.  
  - Keeps routing centralized and easy to maintain.  
  - Ensures consistent global layout with Navbar on every page.  
  - Coordinates authentication by applying ProtectedRoute where needed.

  ================================================================================

  Future Enhancements:
  ================================================================================

  - Add more protected routes (e.g., Profile, Goals) once backend auth is live.  
  - Improve layout by introducing a global wrapper (e.g., footer, theme toggle).  
  - Implement a mobile hamburger menu in Navbar for smaller screens.  
  - Possibly introduce lazy-loading for routes to improve performance.  
*/


import Navbar from "./components/Navbar.jsx";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Certificates from "./pages/Certificates.jsx";
import Projects from "./pages/Projects.jsx";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/certificates" element={<Certificates />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

