## Purpose
================================================================================

A lightweight modal dialog with backdrop, ESC-to-close, and an explicit close button.

## Props
================================================================================

- open: boolean — Controls visibility. When false, renders null.
- onClose: () => void — Called on backdrop click or ESC key.
- title: string — Title text shown in the header.
- children: ReactNode — Dialog content.
- maxWidth: string — Tailwind width class for the dialog container (default: "max-w-2xl").

## Behavior
================================================================================

- Mounts/unmounts based on open.
- Backdrop click triggers onClose.
- Adds a keydown listener when open and closes on Escape.
- Clicks inside the dialog are stopped from bubbling to the backdrop.

## Accessibility
================================================================================

- Dialog container sets role="dialog" and aria-modal="true".
- Close button includes aria-label="Close".
- Note: This modal does not trap focus or restore focus automatically.

## Usage
================================================================================

<Modal open={show} onClose={() => setShow(false)} title="Add Project">
  <ProjectForm onCreate={handleCreate} />
</Modal>

- Used in Dashboard KPI cards, list pages, and anywhere an async fetch is pending.

## Integration Notes
================================================================================

- If you need to prevent background scroll, apply overflow-hidden to <body> when open is true at the app shell.
- For long forms, content area is scrollable (max-h-[80vh] overflow-auto)

## Future Enhancements
================================================================================

- Focus trap and initial focus.
- Return-focus to trigger element when closed.
- Portal to document.body to avoid stacking-context issues.


