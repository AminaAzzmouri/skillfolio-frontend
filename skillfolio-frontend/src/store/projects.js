/* Documentation: see docs/store/projects.js.md */

import { api } from "../lib/api";

const qs = (obj = {}) =>
  Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

// GET /api/projects/?page=&search=&ordering=&certificate=&status=
export async function listProjects({ page, search, filters = {}, ordering } = {}) {
  const params = {
    page,
    search,
    ordering, // 'date_created', '-date_created', 'title', '-title'
    ...filters, // certificate, status, etc.
  };
  const q = qs(params);
  const url = `/api/projects/${q ? `?${q}` : ""}`;
  const { data } = await api.get(url);
  return data; // array or { results: [...] }
}

// POST /api/projects/
export async function createProject(payload) {
  // FE uses certificateId; BE expects `certificate`
  const body = {
    title: payload.title,
    description: payload.description ?? "",
    certificate: payload.certificateId || null,
    status: payload.status ?? "planned",
    work_type: payload.work_type ?? null,
    duration_text: payload.duration_text ?? null,
    primary_goal: payload.primary_goal ?? null,
    challenges_short: payload.challenges_short ?? null,
    skills_used: payload.skills_used ?? null,
    outcome_short: payload.outcome_short ?? null,
    skills_to_improve: payload.skills_to_improve ?? null,
  };
  const { data } = await api.post("/api/projects/", body);
  return data;
}

// PATCH /api/projects/:id/
export async function updateProject(id, patch) {
  const body = { ...patch };
  if ("certificateId" in body) {
    body.certificate = body.certificateId || null;
    delete body.certificateId;
  }
  const { data } = await api.patch(`/api/projects/${id}/`, body);
  return data;
}

// DELETE /api/projects/:id/
export async function deleteProject(id) {
  await api.delete(`/api/projects/${id}/`);
}
