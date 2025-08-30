## Purpose
================================================================================

Lightweight placeholder to show either a neutral “nothing here yet” message or an inline error message.

## Props
================================================================================

- message: string — Text to display. Defaults to "Nothing here yet."
- isError: boolean — If true, renders error styling; otherwise renders subdued/neutral styling.

## Behavior & Styling
================================================================================

- When isError is true, uses an accent color and smaller text (text-accent text-sm).
- Otherwise uses a muted tone (opacity-70) appropriate for empty states.

## Accessibility
================================================================================

- Component renders plain text. If you need assertive announcement for errors, consider wrapping it in an element with role="alert" higher up.

## Usage
================================================================================

<EmptyState />
<EmptyState message="No projects yet." />
<EmptyState isError message="Failed to fetch projects." />

## Role in Project
================================================================================

- Used across list pages (Certificates, Projects, Dashboard sections) to display empty and error states consistently.

## Future Enhancements
================================================================================

- Optional icon prop.
- Optional role prop for ARIA semantics (e.g., "status" | "alert").
- Support rich children instead of a single string.



