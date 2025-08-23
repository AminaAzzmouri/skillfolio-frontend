**index.css**

  ## Purpose:
  ================================================================================

  This is the **global stylesheet** for the Skillfolio frontend.  
  It acts as the entry point for Tailwind CSS styles, ensuring that all 
  base styles, components, and utilities are available across the React app.

  ================================================================================

  ## Structure:
  ================================================================================

  #### @tailwind base:
    • Applies Tailwind’s CSS reset (Preflight) to normalize styles across browsers.
    • Provides consistent defaults for typography, spacing, and elements.

  #### @tailwind components:
    • Enables the use of Tailwind’s component-level utilities (like buttons, cards).
    • Can be extended with custom classes if needed.

  #### @tailwind utilities:
    • Provides Tailwind’s utility classes (e.g., flex, grid, text-center, bg-primary).
    • Forms the foundation of the utility-first workflow in Skillfolio.

  ================================================================================

  ## Role in Project:
  ================================================================================

  - Ensures Tailwind’s styling system is available globally.
  - Applies consistent **dark-sleek theme** defined in tailwind.config.js.
  - Guarantees the same design tokens (colors, fonts) are applied to all pages.

  ================================================================================

  ## Future Enhancements:
  ================================================================================

  - Add global overrides or custom CSS if specific tweaks are needed.
  - Extend with custom animations, transitions, or utility layers.
  - Import external CSS files here (e.g., for third-party libraries) if required.