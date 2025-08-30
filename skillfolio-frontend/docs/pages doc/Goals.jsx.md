**Dashboard.jsx**:

## Purpose:
===============================================================================

- The Goals page lets users create, track, and complete goals. Each goal has:

      • A target number of completed projects (target_projects)
      • A deadline
      • Optional named steps (checklist) with ordering

- The page buckets goals into:

      • Completed (≥100% projects or steps)
      • Not started (0% projects and steps)

- It supports inline step management (add, toggle done, rename, reorder, delete) and editing the goal itself.

## Data & Integration:
===============================================================================

- Store actions (Zustand / useAppStore)
      • fetchGoals(), createGoal(payload), updateGoal(id, patch), deleteGoal(id)

- Step API helpers
      • createGoalStep({ goal, title, is_done, order })
      • updateGoalStep(stepId, patch)
      • deleteGoalStep(stepId)

- Derived values
      • daysLeft = daysUntil(deadline)
      • Bucketing via progress_percent and steps_progress_percent

- Persistence
      • Per-goal collapse state saved to localStorage under key sf_goal_steps_collapsed

## Structure:
===============================================================================

- Local state
      • showCreate — show “Add Goal” modal
      • editingId — goal currently being edited (inline)
      • confirmDeleteId — goal pending deletion confirmation
      • submitting / submitError — goal create/update submit states
      • Steps cache: stepsMap: { [goalId]: Step[] }
      • Collapsed: Set<number> persisted to localStorage
      • Inline step edit: editingStepId, editingTitle
      • Add-step inputs per goal: stepInputs: { [goalId]: string }

- Derived lists
      • goalsWithDays → add daysLeft, _bucket, and _onAskDelete helpers
      • Split into sections: In progress, Completed, Not started

- UI composition
      • <Section /> (a local child) renders a grid of goals for one bucket.
        * Kept as a top-level child to minimize re-mounting and preserve input focus.

## Key Behaviors:
===============================================================================

### Loading & hydration
- On mount: fetchGoals()
- Steps cache hydration: when goals change, build a sorted list of steps per goal and update stepsMap only if content actually changed (deep-ish check by id/title/is_done/order).

> Why: prevents input focus loss when editing/typing inside step fields.

### Create
- “Add Goal” opens a modal with <GoalForm />.
- On submit:
      • createGoal(payload)
      • Create initial steps (if any) via createGoalStep(...)
      • Refresh list with fetchGoals()
      • Close modal

### Edit goal (inline)
- Clicking Edit toggles a <GoalForm initial={g} /> in place.
- On submit: updateGoal(id, patch), then fetchGoals(), exit edit mode.

### Delete goal
- Confirmation dialog → deleteGoal(id) → refresh.

### Steps
- Add step
      • Reads from stepInputs[goalId]
      • Calls createGoalStep({ goal, title, is_done:false, order: list.length })
      • Appends to local stepsMap[goalId], then fetchGoals()

### Toggle done
- updateGoalStep(step.id, { is_done: !step.is_done })
- Update local list and fetchGoals()

### Rename
- Inline input with Enter/Escape handling
- updateGoalStep(stepId, { title }) then update local list

### Reorder
- Local swap [idx] <-> [idx+dir], reindex all items (order = i), optimistic update
- Persist all new orders with Promise.all(updateGoalStep(...))
- On error: show alert and fetchGoals() (rollback)

### Delete step
- deleteGoalStep(stepId) then remove from local list and fetchGoals()

### Collapse / expand
- Toggle per-goal; persisted to localStorage.

### Nudges
- If daysLeft <= 3, show a small deadline nudge banner on the goal card.

 ## UX & Accessibility:
 ===============================================================================

- Inputs use semantic labels and keyboard support:
      • Add step via Enter
      • Rename step: Enter to save, Escape to cancel
- Buttons have titles/tooltips (Move up/down, Rename, Delete step)
- Progress bars show numeric percentage and labels

 ## Edge Cases:
 ===============================================================================

- Invalid/NaN dates are rendered as raw strings or “—”
- Defensive sorting for steps: primarily by order, then id
- Network errors when mutating steps show a basic alert(), and the list is reloaded

 ## Future Enhancements:
 ===============================================================================

- LToasts for step CRUD success/error (non-blocking)
- Bulk operations on steps (clear completed)
- Drag-and-drop sorting
- Goal detail screen with activity history