## Purpose
Reusable form for **create** and **edit** Project. Supports guided fields with a
live auto-generated description that users can edit.

## Props
- initial?: project object for edit mode
- certificates: list for the link dropdown
- submitting: bool
- error: string
- onCreate?: (payload) => Promise
- onUpdate?: (id, payload) => Promise
- onCancel?: () => void
- submitLabel?: string

## Behavior
- In create mode, composes a preview from guided fields until the user edits the description.
- In edit mode, pre-fills all fields and preserves existing description.
- Emits payload with `certificateId` to be mapped to backend `certificate`.
