**index.html**:

## Purpose:
================================================================================

- Root HTML shell for the Vite + React app. React mounts into `<div id="root">`. Also:
- Loads Google Fonts.
- Sets the **initial theme (light/dark)** *before paint* to prevent a flash of the wrong theme.

## Key Parts:
================================================================================

- **Fonts**:

  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Roboto+Mono:wght@700&display=swap" rel="stylesheet">

- Initial theme script (runs ASAP in <head>):

      <script>
        (function () {
          try {
            const saved = localStorage.getItem("sf-theme"); // "light" | "dark" | null
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            const useDark = saved ? saved === "dark" : prefersDark;
            document.documentElement.classList.toggle("dark", useDark);
          } catch (e) {}
        })();
      </script>

      > Reads user preference from localStorage (sf-theme).
      > Falls back to OS preference via prefers-color-scheme.
      > Toggles <html class="dark">, which Tailwind uses for dark mode.
  
  - Mount point + entry:

    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>

## Why the Early Theme Script?
================================================================================

- Prevents FOUC (flash of unthemed content).
- Ensures that Tailwind’s dark classes apply before the first paint.

## Role in Project:
================================================================================

- Provides the single page shell.
- Coordinates theming with Tailwind (darkMode: "class").
- Delivers consistent fonts across the app.  

## Notes:
================================================================================

  - Replace the default favicon when you add branding.
  - Consider adding SEO/Open Graph meta later.
  - If you add a strict CSP, ensure style-src/font-src for Google Fonts and avoid inline scripts (or use a nonce).
 