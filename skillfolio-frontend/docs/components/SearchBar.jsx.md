## Purpose
================================================================================

Debounced text input that calls `onChange(term)` after a short delay. Used to drive `search` query param.

## Props
================================================================================

- value: string (controlled)
- onChange: function(term)
- placeholder: string
- delay: number (ms), default 400

## Notes
================================================================================

Keeps local state in sync with prop changes; prevents chatty network calls by debouncing.
