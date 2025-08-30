## Purpose
===============================================================================

Reusable form for create and edit Project with guided fields that build an
 auto-generated preview description the user can keep or edit.

## Props
===============================================================================

- initial?: project object for edit mode
- certificates: list for the “link to certificate” dropdown
- submitting: boolean (disables submit while true)
- error: string (displayed under fields)
- onCreate?(payload): called in create mode
- onUpdate?(id, payload): called in edit mode
- onCancel?(): optional cancel handler (modal/inline)

## Fields
===============================================================================

- title (required)
- status: planned | in_progress | completed
- work_type (optional): individual | team
- duration_text (optional): free text (e.g., “3 weeks”)
- primary_goal (optional):
        * practice_skill | deliver_feature | build_demo | solve_problem
- challenges_short, skills_used, outcome_short, skills_to_improve (optional, short strings)
- (Optional) Link to a certificate: select by id from certificates
- description: free textarea; starts from auto-generated preview

## Behavior
===============================================================================

- Create mode

        * As the guided fields change, a preview description is composed (buildPreview) and written to description until the user types into the description (sets descDirty=true).
Submits onCreate(payload) with:
        {
        title, description,
        certificateId: <id or null>,
        status, work_type, duration_text,
        primary_goal, challenges_short, skills_used,
        outcome_short, skills_to_improve
        }

        * Resets form after a successful create.

- Edit mode
        * Prefills from initial (keeps existing description and sets descDirty=true so it won’t be auto-overwritten).
        * Submits onUpdate(initial.id, payload) with the same shape as above.

- Reset
        * Create mode: clears all fields and re-enables auto-preview (descDirty=false).
        * Edit mode: restores the original initial values and keeps descDirty=true.

## Validation & UX
===============================================================================

- Submit is disabled while submitting or when title is empty.
- Errors (string) render inline above the actions.
- All inputs are labeled via useId() so labels are stable and accessible.

## Integration Notes
===============================================================================

- Backend expects certificate (FK) — the page/store maps certificateId → certificate.
- No file uploads here (pure JSON).
- Used by Projects page in both inline edit and modal create contexts.

## Future Enhancements
===============================================================================

- Field-level validation hints
- Rich text/Markdown for description
- Autosave drafts / unsaved-changes prompt
