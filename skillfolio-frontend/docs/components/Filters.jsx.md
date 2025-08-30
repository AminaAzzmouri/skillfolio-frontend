## Purpose
================================================================================

Reusable filter UI for list pages. Renders fields based on `type`.

## Types & Fields
================================================================================

- certificates: issuer (text), date_earned (date)
- projects: certificate (text/ID), status (select)

## Props
================================================================================

- type: 'certificates' | 'projects'
- value: object of current filter values
- onChange: (obj) => void

## Behavior
================================================================================

Calls onChange with a new filter object when a field changes.
