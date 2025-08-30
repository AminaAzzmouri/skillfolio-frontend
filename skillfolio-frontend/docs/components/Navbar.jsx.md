## Purpose:
================================================================================

  A persistent, auth-aware top navigation bar. It shows the brand, a Dashboard link, a theme toggle, and either Login/Register (guest) or the user email + Logout (authed). On mobile it presents a slide-in drawer.

## What it renders:
================================================================================

  - Brand: Skillfolio (links to /).
  - Desktop nav (≥ md):
      • Links: Dashboard (/dashboard)
      • <ThemeToggle />
      • If authed: user email + Logout button
        If guest: Login (/login) + Register (/register)
- Mobile (＜ md):
      • A hamburger opens a left drawer with:
              > Same Dashboard link
              > <ThemeToggle />
              > Auth actions (email + Logout, or Login/Register)

## Key behaviors
================================================================================

  - Auth-aware: Reads user and logout from useAppStore.
  - Mobile drawer lifecycle:
    • Open via hamburger.
    • Close on:
        * Clicking the backdrop overlay
        * Pressing Esc
        * Route change (useLocation() watcher)
        * Clicking the close “✕” button
    • Animation: Drawer + overlay use framer-motion (AnimatePresence, motion) with spring transitions.
    • Sticky header: position: sticky; top: 0; with blur and border.

## State & effects:
================================================================================

  - open (boolean) – drawer visibility.
  - useEffect on location.pathname → closes the drawer when the route changes.
  - useCallback + keydown Esc handler; added/removed only while drawer is open

## Accessibility:
================================================================================

  - Hamburger has aria-label="Open menu" and aria-expanded={open}.
  - Drawer uses role="dialog" and aria-modal="true".
  - Overlay click to dismiss.
  - (Future nice-to-have) Focus management/trap in the drawer while open.

## Styling:
================================================================================

  - Uses your Tailwind design tokens (bg-surface/95, border-border, bg-background/40, etc.).
  - Desktop hides drawer with hidden md:flex; mobile shows hamburger with md:hidden.

## Integration points:
================================================================================

  - Store: useAppStore((s) => s.user) and useAppStore((s) => s.logout).
  - Routing: Link and useLocation from react-router-dom.
  - Theme: <ThemeToggle /> is embedded in both desktop and mobile navs.
  - Animation: framer-motion for overlay/panel enter/exit.

## Edge cases handled:
================================================================================

  - Drawer cannot “stick” open after navigation (auto-closes on route change).
  - No event-listener leak: keydown listener added only when open and removed on cleanup.
  - Auth switch updates visible actions immediately (reads from store on render).

## Future enhancements:
================================================================================

  - Active-link styles (e.g., highlight current route).
  - Keyboard focus trapping inside the drawer; focus restore on close.
  - Avatar/profile menu with more links (Profile, Goals, Certificates).
  - Optional redirect after logout() (e.g., navigate("/")).


