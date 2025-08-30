## Purpose
=================================================================================================================================================

API helpers for Goals and GoalSteps. Keeps axios details isolated so pages/components remain thin.

## Exports
=================================================================================================================================================

### Goals

- listGoals({ page, ordering, filters }) → GET /api/goals/
    * ordering can include: created_at, -created_at, deadline, -deadline, total_steps, -total_steps, completed_steps, -completed_steps, title
    * filters supports at least deadline
    * Returns array or a paginated object { results, count } depending on DRF config.

- createGoal({ title, target_projects, deadline, total_steps = 0, completed_steps = 0 }) → POST /api/goals/

- updateGoal(id, patch) → PATCH /api/goals/:id/

- deleteGoal(id) → DELETE /api/goals/:id/

### GoalSteps

- listGoalSteps(goalId) → GET /api/goalsteps/?goal=<id>
- createGoalStep({ goal, title, is_done = false, order = 0 }) → POST /api/goalsteps/
- updateGoalStep(id, patch) → PATCH /api/goalsteps/:id/
- deleteGoalStep(id) → DELETE /api/goalsteps/:id/

## Notes
=================================================================================================================================================

- Goal progress numbers (progress_percent, steps_progress_percent, etc.) are computed on the backend (see serializers/viewsets) and returned by the list/create/update endpoints.

- GoalSteps are owner-scoped through the parent Goal—the backend enforces that the goal belongs to the current user.

- Reordering steps: send multiple PATCH requests updating each step’s order (the Goals page batching logic does this).

## Example
=================================================================================================================================================

    // Create a goal with two seed steps (frontend calls these in sequence)
    const goal = await createGoal({
    title: "Ship portfolio v1",
    target_projects: 1,
    deadline: "2025-05-01",
    total_steps: 2,
    completed_steps: 0
    });
    await createGoalStep({ goal: goal.id, title: "Outline pages", order: 0 });
    await createGoalStep({ goal: goal.id, title: "Set up repo", order: 1 });

    // Toggle a step
    await updateGoalStep(stepId, { is_done: true });

    // Reorder a step (example: move to index 0)
    await updateGoalStep(stepId, { order: 0 });
