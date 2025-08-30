## Purpose
================================================================================

Generic confirm modal used for destructive actions (e.g., delete).

## Props
================================================================================

- open (bool): show/hide
- title (string)
- message (string, optional)
- onCancel (fn)
- onConfirm (fn)

## Usage
================================================================================

<ConfirmDialog
  open={show}
  title="Delete certificate?"
  message="This action cannot be undone."
  onCancel={...}
  onConfirm={...}
/>
