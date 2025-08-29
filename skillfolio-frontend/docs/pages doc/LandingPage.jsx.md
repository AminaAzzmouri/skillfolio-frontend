**LandingPage.jsx**: 
    
  ## Purpose:
  ================================================================================

  This component serves as the **public entry point** of the Skillfolio app.
  It introduces new users to the application and encourages them to either sign up or log in. 
  The landing page is designed with a simple hero section and call-to-action (CTA) buttons to guide the user toward authentication.
  
  ================================================================================

  ## Structure:
  ================================================================================

  **Background & Layout:** Uses Tailwind custom theme (dark background, light text) for a sleek, professional look.
  **Hero Section:**
            • App title: "Skillfolio"
            • Tagline: "Store your learning journey in one place."
            • Two CTA buttons:
                                → "Sign Up" → navigates to /register
                                → "Log In"  → navigates to /login
 
  ================================================================================

  ## Routing:
  ================================================================================

  - Uses React Router's <Link> to provide client-side navigation.
  - Ensures smooth navigation without page reloads.

  ================================================================================

  ## Role in Project:
  ================================================================================

  The landing page is the **first touchpoint** for new and returning users.
  It clearly communicates the purpose of the app and funnels users into the authentication flow.
 
  ================================================================================
 
  ## Future Enhancements:
  ================================================================================

  - Add branding/logo for stronger identity.
  - Animate hero text/buttons for improved UX.
  - Display sample screenshots or features below the hero section.