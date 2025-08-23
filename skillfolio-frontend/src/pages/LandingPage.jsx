
/*
 **LandingPage.jsx**: 
    
  - Purpose:
  ================================================================================

  This component serves as the **public entry point** of the Skillfolio app.
  It introduces new users to the application and encourages them to either sign up or log in. 
  The landing page is designed with a simple hero section and call-to-action (CTA) buttons to guide the user toward authentication.
  
  ================================================================================

  - Structure:
  ================================================================================

  **Background & Layout:** Uses Tailwind custom theme (dark background, light text) for a sleek, professional look.
  *Hero Section:**
            • App title: "Skillfolio"
            • Tagline: "Store your learning journey in one place."
            • Two CTA buttons:
                                → "Sign Up" → navigates to /register
                                → "Log In"  → navigates to /login
 
  ================================================================================

  - Routing:
  ================================================================================

  - Uses React Router's <Link> to provide client-side navigation.
  - Ensures smooth navigation without page reloads.

  ================================================================================

  - Role in Project:
  ================================================================================

  The landing page is the **first touchpoint** for new and returning users.
  It clearly communicates the purpose of the app and funnels users into the authentication flow.
 
  ================================================================================
 
  - Future Enhancements:
  ================================================================================

  - Add branding/logo for stronger identity.
  - Animate hero text/buttons for improved UX.
  - Display sample screenshots or features below the hero section.
*/

import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="bg-background min-h-screen text-text flex flex-col items-center justify-center px-4">
      <section className="text-center h-[80vh] flex flex-col items-center justify-center">
        <h1 className="text-4xl md:text-6xl font-heading mb-4">Skillfolio</h1>
        <p className="text-lg md:text-2xl mb-6">
          Store your learning journey in one place.
        </p>
        <div className="flex gap-4">
          <Link to="/register"
            className="bg-primary px-6 py-3 rounded hover:bg-primary/80 transition"
          >
            Sign Up
          </Link>
          <Link to= "/login"
            className="bg-secondary px-6 py-3 rounded hover:bg-secondary/80 transition"
          >
            Log In
          </Link>
        </div>
      </section>
    </div>
  );
}
