## Purpose:
===============================================================================

The **Home** page is the first-stop screen for authenticated users.
It displays a warm, motivational message with a **typing (programmer-style) animation**.
No links are embedded in the text—navigation remains in the global Navbar.

This page reinforces Skillfolio’s purpose and nudges users to check their Dashboard
for progress and motivation.

## Structure:
===============================================================================

- Simple centered layout
- Header “Home”
- Intro text welcoming the user back
- **Animation**: character-by-character typing effect implemented with a small
  `useEffect` + `setInterval`.
- **Content**: a multi-paragraph message encouraging progress and consistency.
- **No internal links**: Navbar already provides navigation.

## Behavior:
===============================================================================

- For unauthenticated users, /home is inaccessible (redirects to /landingPage).
- For authenticated users, the text types out on each visit/mount.
- The Home link in Navbar points to /home when authenticated, and / when logged out.

## Data:
===============================================================================

- No API calls here. Only reads auth state via HomeGate in App.jsx.

## Role in Project:
===============================================================================

- Provides a clean separation between the LandingPage (public) and the
first screen for logged-in users.
- Avoids confusion of landing page CTAs when user is already authenticated.
- Sets an encouraging tone for logged-in users.
- Keeps navigation consistent by relying on the global Navbar.
- Complements the Dashboard by reinforcing motivation without analytics or links.

## Future Enhancements:
===============================================================================

- Personalize message using the user’s name.
- Add subtle background animations or confetti on milestones.
- Provide settings to toggle typing speed or switch to a static message.
