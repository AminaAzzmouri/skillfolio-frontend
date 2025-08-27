## Purpose:
===============================================================================
Authenticated users’ dedicated home page (separate from Dashboard).
Serves as a lightweight entry point after login, showing quick links
to Dashboard, Certificates, and Projects.

===============================================================================
## Structure:
- Simple centered layout
- Header “Home”
- Intro text welcoming the user back
- List of quick links: Dashboard, Certificates, Projects

===============================================================================
## Data:
- No API calls here. Only reads auth state via HomeGate in App.jsx.

===============================================================================
## Role in Project:
- Provides a clean separation between the LandingPage (public) and the
first screen for logged-in users.
- Avoids confusion of landing page CTAs when user is already authenticated.

===============================================================================
## Future Enhancements:
- Show recent activity summary
- Personalized welcome message with user email
- Quick actions (e.g., Add Project / Add Certificate buttons)
