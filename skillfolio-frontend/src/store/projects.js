/* Documentation: see docs/store/projects.js.md */
import { api } from "../lib/api";

const qs = (obj = {}) =>
  Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

// Normalizers
const S = (v) => (v == null ? "" : String(v));           // -> "" for text fields
const N = (v) => (v == null || v === "" ? null : v);     // enums / FKs

const pad2 = (n) => (n < 10 ? `0${n}` : `${n}`);
const toISO = (v) => {
  if (!v) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};
const normalizeDateLoose = (s) => {
  if (!s) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = String(s).trim().match(/^(\d{1,4})[\/\-.](\d{1,2})[\/\-.](\d{1,4})$/);
  if (m) {
    const a = parseInt(m[1], 10);
    const b = parseInt(m[2], 10);
    const c = parseInt(m[3], 10);
    if (m[1].length === 4) {
      const year = a, month = b, day = c;
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) return `${year}-${pad2(month)}-${pad2(day)}`;
    }
    if (m[3].length === 4) {
      const year = c;
      const mm = a > 12 ? b : a;
      const dd = a > 12 ? a : b;
      if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) return `${year}-${pad2(mm)}-${pad2(dd)}`;
    }
  }
  return toISO(s);
};

// GET /api/projects/?page=&search=&ordering=&certificate=&status=
export async function listProjects({ page, search, filters = {}, ordering } = {}) {
  const params = { page, search, ordering, ...filters };
  const q = qs(params);
  const url = `/api/projects/${q ? `?${q}` : ""}`;
  const { data } = await api.get(url);
  return data;
}

/**
 * POST /api/projects/
 * REQUIRED: start_date (always). end_date only when status === 'completed'
 */
export async function createProject(payload) {
  const status = payload.status ?? "planned";

  // Accept either snake_case or camelCase coming from the form
  const rawStart = payload.start_date ?? payload.startDate ?? "";
  const rawEnd   = payload.end_date   ?? payload.endDate   ?? "";

  // Normalize to strict YYYY-MM-DD (no fallback to today anywhere)
  const startISO = normalizeDateLoose(rawStart);
  const endISO   = normalizeDateLoose(rawEnd);

  // Enforce dates up front so we don't silently post wrong data
  if (!startISO) {
    throw new Error("A start date is required.");
  }
  if (status === "completed" && !endISO) {
    throw new Error("Completed projects require an end date.");
  }

  const body = {
    title: S(payload.title),
    description: S(payload.description),
    certificate: payload.certificate ?? payload.certificateId ?? null,
    status,
    work_type: N(payload.work_type),
    primary_goal: N(payload.primary_goal),
    tools_used: S(payload.tools_used),
    skills_used: S(payload.skills_used),
    problem_solved: S(payload.problem_solved),
    challenges_short: S(payload.challenges_short),
    skills_to_improve: S(payload.skills_to_improve),
    start_date: startISO,
    ...(status === "completed" ? { end_date: endISO } : {}),
  };

  // debug
  window.__LAST_PROJECT_PAYLOAD__ = body;

  const { data } = await api.post("/api/projects/", body);
  return data;
}


/**
 * PATCH /api/projects/:id/
 * Only send allowed fields; never send null for CharFields.
 */
export async function updateProject(id, patch) {
  const allowed = new Set([
    "title",
    "description",
    "certificate",
    "status",
    "work_type",
    "primary_goal",
    "tools_used",
    "skills_used",
    "problem_solved",
    "challenges_short",
    "skills_to_improve",
    "start_date",
    "end_date",
  ]);

  const body = { ...patch };

  // Map FE alias
  if ("certificateId" in body) {
    body.certificate = body.certificateId || null;
    delete body.certificateId;
  }

  // Accept multiple date prop names
  if ("startDate" in body && !("start_date" in body)) body.start_date = body.startDate;
  if ("endDate" in body   && !("end_date" in body))   body.end_date   = body.endDate;

  // Normalize text
  if ("title" in body) body.title = S(body.title);
  if ("description" in body) body.description = S(body.description);
  if ("tools_used" in body) body.tools_used = S(body.tools_used);
  if ("skills_used" in body) body.skills_used = S(body.skills_used);
  if ("problem_solved" in body) body.problem_solved = S(body.problem_solved);
  if ("challenges_short" in body) body.challenges_short = S(body.challenges_short);
  if ("skills_to_improve" in body) body.skills_to_improve = S(body.skills_to_improve);

  // Normalize enums/FKs
  if ("work_type" in body) body.work_type = N(body.work_type);
  if ("primary_goal" in body) body.primary_goal = N(body.primary_goal);

  // Normalize dates
  if ("start_date" in body) {
    body.start_date = normalizeDateLoose(body.start_date) || "";
  }
  if ("end_date" in body) {
    body.end_date = normalizeDateLoose(body.end_date) || "";
  }

  // If status becomes non-completed, never send end_date
  if ("status" in body && body.status !== "completed") delete body.end_date;

  // Keep only allowed keys
  Object.keys(body).forEach((k) => {
    if (!allowed.has(k)) delete body[k];
  });

  const { data } = await api.patch(`/api/projects/${id}/`, body);
  return data;
}

// DELETE /api/projects/:id/
export async function deleteProject(id) {
  await api.delete(`/api/projects/${id}/`);
}
