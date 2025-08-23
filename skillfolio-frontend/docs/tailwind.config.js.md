**tailwind.config.js**:

  ## Purpose:
  ================================================================================

  This is the **configuration file** for Tailwind CSS in the Skillfolio frontend.  
  It defines which files Tailwind should scan for class names, and it extends 
  the default theme with custom colors and fonts to establish a consistent design system.

  ================================================================================

  ## Structure:
  ================================================================================

  #### content:
    • Lists all files where Tailwind should look for utility classes.
    • Includes index.html and all JS/TS/JSX/TSX files under src/.

  #### theme.extend:
    • Custom colors:
      • primary    → "#0EA5E9" (Sky Blue)
      • secondary  → "#22C55E" (Green)
      • background → "#0F172A" (Deep Navy)
      • text       → "#F1F5F9" (Light Gray)
      • accent     → "#EAB308" (Yellow)
    • Custom fonts:
      • heading → Roboto Mono (monospace fallback)
      • body    → Roboto (sans-serif fallback)

  #### plugins:
    • Currently empty.
    • Can be extended with Tailwind plugins (e.g., typography, forms, animations).

  ================================================================================

  ## Role in Project:
  ================================================================================

  - Provides the **design tokens** (colors, typography) used consistently across 
    all components and pages.
  - Enables Skillfolio’s unique visual identity while still leveraging 
    Tailwind’s utility-first workflow.
  - Ensures dark, sleek theme matches the app’s branding.

  ================================================================================

  ## Future Enhancements:
  ================================================================================

  - Add responsive breakpoints or container widths if custom sizing is needed.
  - Extend Tailwind with plugins like @tailwindcss/forms for styled forms.
  - Add custom spacing, shadows, or animations for richer UI polish.