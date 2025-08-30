## Purpose
================================================================================

Tiny “loading” label component for consistent spinners/placeholders across the app.

## Props
================================================================================

- text: string — Label to show; defaults to "Loading...".

## Accessibility
================================================================================

- For live updates, consider placing this inside a region with aria-live="polite" at the call site if you need screen readers to announce state changes.

## Usage
================================================================================

<Loading />
<Loading text="Loading certificates…" />

## Role in Project
================================================================================

- Used in Dashboard KPI cards, list pages, and anywhere an async fetch is pending.

## Future Enhancements
================================================================================

- Optional spinner glyph.
- Optional ARIA role props for finer-grained control.

