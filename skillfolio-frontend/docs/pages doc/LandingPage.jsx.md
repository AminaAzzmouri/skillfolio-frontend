**LandingPage.jsx**: 
    
  ## Purpose:
  ================================================================================

  Public entry point that introduces Skillfolio and funnels visitors to **Sign up** or **Log in**. Uses a clean hero, lightweight product previews, feature highlights, and a simple “How it works” sequence.

  ## Structure:
  ================================================================================

  - **Hero section** 
      • Big headline: “Build a portfolio of your learning.”
      • Subtext explaining certificates, projects, skills, goals
      • “Value chips” for quick scannability
      • Decorative background flares (subtle Tailwind utility layers)

  - **Product preview cards**
      • Small static cards for **Certificates**, **Projects**, **Goals** with badges

  - **Features grid**
      • Four tiles: Certificates / Projects / Goals / Dashboard

- **How it works**
      • Three simple steps: Capture → Connect → Share

- **CTA section**
      • Primary: **Create your account** → `/register`
      • Secondary: **Log in** → `/login`

## Styling:
================================================================================

- ailwind theme tokens (`bg-background`, `text-text`, `border-border`, `bg-surface/*`).
- Soft “flare” accents for a friendly, modern look.

## Data:
================================================================================

- Static page; no API calls.

## Routing:
================================================================================

- Uses `<Link>` for client-side navigation to **/register** and **/login**.

## Role in Project:
================================================================================

- Marketing/intro layer for unauthenticated users that clearly communicates value and drives them into the auth flow.
 
## Future Enhancements:
================================================================================

- Add screenshots or a short demo video.
- Testimonials and trust markers.
- Internationalized copy.