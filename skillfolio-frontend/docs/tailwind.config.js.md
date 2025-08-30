**tailwind.config.js**:

## Purpose:
================================================================================

Central Tailwind configuration for Skillfolio. It:
  - Enables **class-based dark mode**.
  - Scans your source for class names.
  - Extends the theme with **design tokens** (colors + fonts) that are powered by **CSS variables** at runtime.

## Highlights:
================================================================================

- **darkMode: "class"** — dark theme turns on when `<html class="dark">` is present.
- **Variable-driven colors** — every color uses `rgb(var(--color-*) / <alpha-value>)`.
    * This lets you switch themes instantly by changing CSS variables (see `index.css`).
-**Fonts** — `heading` uses *Roboto Mono*, `body` uses *Roboto*.

## Config Shape:  ================================================================================

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--color-background) / <alpha-value>)",
        surface:    "rgb(var(--color-surface) / <alpha-value>)",
        text:       "rgb(var(--color-text) / <alpha-value>)",
        muted:      "rgb(var(--color-muted) / <alpha-value>)",
        border:     "rgb(var(--color-border) / <alpha-value>)",

        primary:    "rgb(var(--color-primary) / <alpha-value>)",
        secondary:  "rgb(var(--color-secondary) / <alpha-value>)",
        accent:     "rgb(var(--color-accent) / <alpha-value>)",
      },
      fontFamily: {
        heading: ['"Roboto Mono"', "monospace"],
        body: ["Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

## How it works with CSS Variables:
================================================================================

- See index.css for the actual values of --color-* in light (:root) and dark (.dark) themes.
- Because colors are RGB triplets, you can use Tailwind opacity utilities naturally:
    * bg-primary/20, text-text/80, border-border/50, etc.

## Usage Examples:
================================================================================

    <div class="bg-background text-text">
      <button class="bg-primary hover:bg-primary/80 text-white rounded px-4 py-2">Primary</button>
    </div>

## Tips:
================================================================================

- Add plugins (forms/typography) by filling the plugins array later.
- If you add new tokens, declare both the Tailwind color key here and the CSS variable in index.css.
