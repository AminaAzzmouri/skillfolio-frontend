// Goals & GoalSteps API helpers

import { api } from "../lib/api";

const qs = (obj = {}) =>
  Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

// ---------- Goals ----------

// GET /api/goals/?page=&ordering=&deadline=
export async function listGoals({ page, ordering, filters = {} } = {}) {
  const params = { page, ordering, ...filters };
  const q = qs(params);
  const url = `/api/goals/${q ? `?${q}` : ""}`;
  const { data } = await api.get(url);
  return data; // array or { results: [...] } depending on pagination
}

// POST /api/goals/
export async function createGoal({ title, target_projects, deadline, total_steps = 0, completed_steps = 0 }) {
  const payload = { title, target_projects, deadline, total_steps, completed_steps };
  const { data } = await api.post("/api/goals/", payload);
  return data;
}

// PATCH /api/goals/:id/
export async function updateGoal(id, patch) {
  const { data } = await api.patch(`/api/goals/${id}/`, patch);
  return data;
}

// DELETE /api/goals/:id/
export async function deleteGoal(id) {
  await api.delete(`/api/goals/${id}/`);
}

// ---------- GoalSteps ----------

// GET /api/goalsteps/?goal=<id>
export async function listGoalSteps(goalId) {
  const { data } = await api.get(`/api/goalsteps/?goal=${encodeURIComponent(goalId)}`);
  return data;
}

// POST /api/goalsteps/
export async function createGoalStep({ goal, title, is_done = false, order = 0 }) {
  const { data } = await api.post("/api/goalsteps/", { goal, title, is_done, order });
  return data;
}

// PATCH /api/goalsteps/:id/
export async function updateGoalStep(id, patch) {
  const { data } = await api.patch(`/api/goalsteps/${id}/`, patch);
  return data;
}

// DELETE /api/goalsteps/:id/
export async function deleteGoalStep(id) {
  await api.delete(`/api/goalsteps/${id}/`);
}