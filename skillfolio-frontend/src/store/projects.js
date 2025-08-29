/* Docs: see docs/store doc/projects
.js.md */

import { api } from "../lib/api";

// GET /api/projects/
export async function listProjects(params = {}) {
  const res = await api.get("/api/projects/", { params });
  return res.data;
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
  const res = await api.post("/api/projects/", body);
  return res.data;
}

// PATCH /api/projects/:id/
export async function updateProject(id, patch) {
  const body = { ...patch };
  if ("certificateId" in body) {
    body.certificate = body.certificateId || null;
    delete body.certificateId;
  }
  const res = await api.patch(`/api/projects/${id}/`, body);
  return res.data;
}

// DELETE /api/projects/:id/
export async function deleteProject(id) {
  await api.delete(`/api/projects/${id}/`);
}
