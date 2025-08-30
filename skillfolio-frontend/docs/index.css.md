**index.css**

## Purpose:
================================================================================

Global stylesheet and **theme token** definitions. It:
    - Imports Tailwind layers.
    - Defines light/dark **CSS variable tokens** (`--color-*`) consumed by Tailwind’s config.
    - Sets global base styles and a few utility button classes.

## Tailwind Layers:
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

## Theme Tokens:
================================================================================

- Tokens are defined as RGB triplets to work with Tailwind’s <alpha-value> opacity.
        * Light theme: defined on :root
        * Dark theme: overrides inside .dark

        :root {
                --color-background: 250 250 249; /* zinc-50 */
                --color-surface:    255 255 255; /* white */
                --color-text:       17 24 39;    /* slate-900 */
                --color-muted:      87 96 111;   /* custom muted */
                --color-border:     229 231 235; /* gray-200 */

                /* Brand */
                --color-primary:    99 102 241;  /* indigo-500 */
                --color-secondary:  6 182 212;   /* cyan-500  */
                --color-accent:     245 158 11;  /* amber-500 */
              }

        .dark {
                --color-background: 15 23 42;    /* slate-900 */
                --color-surface:    17 24 39;    /* deep surface */
                --color-text:       241 245 249; /* slate-100 */
                --color-muted:      148 163 184; /* slate-400 */
                --color-border:     71 85 105;   /* slate-600 */

                /* Brand (kept similar for contrast consistency) */
                --color-primary:    14 165 233;  /* sky-500 */
                --color-secondary:  34 197 94;   /* green-500 */
                --color-accent:     234 179 8;   /* amber-500 */
              }

## Base Layer & Defaults:
================================================================================

@layer base {
  html, body, #root { height: 100%; }
  body {
    @apply bg-background text-text;
    font-family: 'Roboto', system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif;
  }
  a { @apply hover:opacity-90 transition; }
}

## Helper Button Classes:
================================================================================

.btn          { @apply inline-flex items-center justify-center rounded font-semibold px-4 py-2 transition disabled:opacity-60; }
.btn-primary  { @apply bg-primary hover:bg-primary/90 text-white; }
.btn-secondary{ @apply bg-secondary hover:bg-secondary/90 text-white; }
.btn-outline  { @apply border border-border hover:bg-surface/60; }

## How Dark Mode Works
================================================================================

- Tailwind is configured with darkMode: "class".
- Toggling <html class="dark"> swaps all tokens by CSS variable override.
- See index.html for the small inline script that sets the initial theme before paint.

## Extending Tokens
================================================================================

When adding a new token:
    1. Add a new CSS variable in both :root and .dark.
    2. Reference it in tailwind.config.js with rgb(var(--color-new) / <alpha-value>).
