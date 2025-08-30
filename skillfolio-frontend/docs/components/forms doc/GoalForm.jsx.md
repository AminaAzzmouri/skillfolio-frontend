**Dashboard.jsx**:

## Purpose:
===============================================================================

- Reusable form for creating and editing goals.
      • Create mode: title, target, deadline, and an optional initial-steps builder.
      • Edit mode: core fields only (no step builder).

## Props:
===============================================================================

- initial? — goal object; when present → edit mode
- initialDraft? — prefill for create mode (e.g., from Announcements)
- submitting? — disables form + updates button label
- error? — inline error text
- submitLabel? — button label override (defaults to “Save changes” in edit, “Create Goal” in create)
- onCreate?(payload, initialSteps: string[])
- onUpdate?(id, patch)
- onCancel?()

## Behavior:
===============================================================================

- Validation (UI): button disabled unless:
      • title non-empty
      • target_projects > 0
      • deadline present

- Reset button:
      • Edit mode: reverts to initial
      • Create mode with initialDraft: reverts to draft defaults
      • Plain create mode: empties the form

- Auto-focus: in create mode, the initial step field receives focus when visible
- Submit
      • Edit: calls onUpdate(initial.id, patch)
      • Create: calls
        onCreate({ title, target_projects, deadline, total_steps, completed_steps: 0 }, initialSteps)
            * total_steps equals the number of items in the local initial-steps builder

## Payload Shapes (examples):
===============================================================================

### Create

            {
                "title": "Ship portfolio v1",
                "target_projects": 1,
                "deadline": "2025-03-31",
                "total_steps": 3,
                "completed_steps": 0
            }
            
            * with initialSteps = ["Outline", "Design", "Implement"]

### Edit

            {
                "title": "Ship portfolio v1.1",
                "target_projects": 2,
                "deadline": "2025-04-15"
            }
            
            * with initialSteps = ["Outline", "Design", "Implement"]

### Notes
- This component is UI-only; backend validation (e.g., “deadline cannot be in the past”) is enforced by the API and surfaced via error.