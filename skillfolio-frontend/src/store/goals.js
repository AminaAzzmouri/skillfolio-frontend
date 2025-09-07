/* Docs: see docs/store/goals.js.md */

// Goals & GoalSteps API helpers
import { api } from "../lib/api";

const qs = (obj = {}) =>
  Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

// --- tiny util: coerce numeric fields so backend gets numbers, not strings
const toIntOr = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};
const normalizeGoalPayload = (p = {}) => {
  const out = { ...p };
  if ("target_projects" in out) out.target_projects = toIntOr(out.target_projects, 1);
  if ("completed_projects" in out) out.completed_projects = toIntOr(out.completed_projects, 0);
  if ("total_steps" in out) out.total_steps = toIntOr(out.total_steps, 0);
  if ("completed_steps" in out) out.completed_steps = toIntOr(out.completed_steps, 0);
  return out;
};

/* ---------- Goals ---------- */

// GET /api/goals/?page=&ordering=&deadline=
export async function listGoals({ page, ordering, filters = {} } = {}) {
  const params = { page, ordering, ...filters }; // backend supports deadline filter + ordering
  const q = qs(params);
  const url = `/api/goals/${q ? `?${q}` : ""}`;
  const { data } = await api.get(url);
  // may be an array (no pagination) or { results, count, next, previous }
  return data;
}

// GET /api/goals/:id/
export async function getGoal(id) {
  const { data } = await api.get(`/api/goals/${id}/`);
  return data;
}

// POST /api/goals/
export async function createGoal({
  title,
  target_projects,
  completed_projects = 0,   // NEW
  deadline,
  total_steps = 0,
  completed_steps = 0,
}) {
  const payload = normalizeGoalPayload({
    title,
    target_projects,
    completed_projects,     // NEW
    deadline,
    total_steps,
    completed_steps,
  });
  const { data } = await api.post("/api/goals/", payload);
  return data;
}

// PATCH /api/goals/:id/
export async function updateGoal(id, patch) {
  // patch may include any of:
  // title, target_projects, completed_projects, deadline, total_steps, completed_steps
  const payload = normalizeGoalPayload(patch);
  const { data } = await api.patch(`/api/goals/${id}/`, payload);
  return data;
}

// Convenience: bump/decrement counters (keeps UI simple)
export async function incrementCompletedProjects(id, delta = 1) {
  const g = await getGoal(id);
  return updateGoal(id, { completed_projects: toIntOr(g.completed_projects, 0) + toIntOr(delta, 1) });
}
export async function setCompletedProjects(id, value) {
  return updateGoal(id, { completed_projects: value });
}
export async function setCompletedSteps(id, value) {
  return updateGoal(id, { completed_steps: value });
}

// DELETE /api/goals/:id/
export async function deleteGoal(id) {
  await api.delete(`/api/goals/${id}/`);
}

/* ---------- GoalSteps ---------- */

// GET /api/goalsteps/?goal=<id>
export async function listGoalSteps(goalId) {
  const { data } = await api.get(`/api/goalsteps/?goal=${encodeURIComponent(goalId)}`);
  return data;
}

// POST /api/goalsteps/
export async function createGoalStep({ goal, title, is_done = false, order = 0 }) {
  const { data } = await api.post("/api/goalsteps/", { goal, title, is_done, order: toIntOr(order, 0) });
  return data;
}

// PATCH /api/goalsteps/:id/
export async function updateGoalStep(id, patch) {
  const payload = { ...patch };
  if ("order" in payload) payload.order = toIntOr(payload.order, 0);
  const { data } = await api.patch(`/api/goalsteps/${id}/`, payload);
  return data;
}

// DELETE /api/goalsteps/:id/
export async function deleteGoalStep(id) {
  await api.delete(`/api/goalsteps/${id}/`);
}
