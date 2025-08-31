/* Documentation: see docs/store/useAppStore.js.md */

// Zustand store: JWT auth + certificates (API) + projects (API) + goals (API) + bootstrapping.

import { create } from "zustand";
import { api, setAuthToken, logoutApi } from "../lib/api";

// ---- Certificates API helpers ----
import {
  listCertificates,
  createCertificateMultipart,
  updateCertificate as apiUpdateCertificate,
  deleteCertificate as apiDeleteCertificate,
} from "./certificates";

// ---- Projects API helpers ----
import {
  listProjects,
  createProject as apiCreateProject,
  updateProject as apiUpdateProject,
  deleteProject as apiDeleteProject,
} from "./projects";

// ---- Goals API helpers ----
import {
  listGoals,
  createGoal as apiCreateGoal,
  updateGoal as apiUpdateGoal,
  deleteGoal as apiDeleteGoal,
} from "./goals";

// Fallback id if needed (kept for any local/demo adders)
const rid = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(0, 10));

export const useAppStore = create((set, get) => ({
  // -----------------------
  // Certificates (LIVE API)
  // -----------------------
  certificates: [],
  certificatesLoading: false,
  certificatesError: null,
  // DRF pagination meta
  certificatesMeta: { count: 0 },

  async fetchCertificates(params) {
    set({ certificatesLoading: true, certificatesError: null });
    try {
      const data = await listCertificates(params);
      const items = Array.isArray(data) ? data : data?.results || [];
      const count = Array.isArray(data) ? items.length : (data?.count ?? items.length);
      set({
        certificates: items,
        certificatesMeta: { count },
        certificatesLoading: false,
      });
    } catch (err) {
      const msg =
        err?.response?.data?.detail ??
        (typeof err?.response?.data === "object" ? JSON.stringify(err.response.data) : err?.response?.data) ??
        err?.message ??
        "Failed to fetch certificates";
      set({ certificatesLoading: false, certificatesError: msg });
    }
  },

  async createCertificate({ title, issuer, date_earned, file }) {
    set({ certificatesError: null });
    const created = await createCertificateMultipart({ title, issuer, date_earned, file });
    // Prepend for snappy UX
    set((s) => ({ certificates: [created, ...s.certificates] }));
    // Optional optimistic bump
    set((s) => ({ certificatesMeta: { count: (s.certificatesMeta?.count ?? 0) + 1 } }));
    return created;
  },

  async updateCertificate(id, patch) {
    const updated = await apiUpdateCertificate(id, patch);
    set((s) => ({
      certificates: (s.certificates ?? []).map((c) => (c.id === id ? updated : c)),
    }));
    return updated;
  },

  async deleteCertificate(id) {
    await apiDeleteCertificate(id);
    set((s) => ({
      certificates: (s.certificates ?? []).filter((c) => c.id !== id),
      certificatesMeta: { count: Math.max(0, (s.certificatesMeta?.count ?? 1) - 1) },
    }));
  },

  // -----------------------
  // Projects (LIVE API)
  // -----------------------
  projects: [],
  projectsLoading: false,
  projectsError: null,
  projectsMeta: { count: 0 },

  async fetchProjects(params) {
    set({ projectsLoading: true, projectsError: null });
    try {
      const data = await listProjects(params);
      const items = Array.isArray(data) ? data : data?.results || [];
      const count = Array.isArray(data) ? items.length : (data?.count ?? items.length);
      set({
        projects: items,
        projectsMeta: { count },
        projectsLoading: false,
      });
    } catch (err) {
      const msg =
        err?.response?.data?.detail ??
        (typeof err?.response?.data === "object" ? JSON.stringify(err.response.data) : err?.response?.data) ??
        err?.message ??
        "Failed to fetch projects";
      set({ projectsLoading: false, projectsError: msg });
    }
  },

  async createProject({
    title,
    description,
    certificateId,
    status = "planned",
    work_type = null,
    duration_text = null,
    primary_goal = null,
    challenges_short = null,
    skills_used = null,
    outcome_short = null,
    skills_to_improve = null,
  }) {
    set({ projectsError: null });

    const payload = {
      title,
      description,
      certificate: certificateId || null,
      status,
      work_type,
      duration_text,
      primary_goal,
      challenges_short,
      skills_used,
      outcome_short,
      skills_to_improve,
    };

    const created = await apiCreateProject(payload);
    set((s) => ({ projects: [created, ...s.projects] }));
    set((s) => ({ projectsMeta: { count: (s.projectsMeta?.count ?? 0) + 1 } }));
    return created;
  },

  async updateProject(id, patch) {
    const updated = await apiUpdateProject(id, patch);
    set((s) => ({
      projects: (s.projects ?? []).map((p) => (p.id === id ? updated : p)),
    }));
    return updated;
  },

  async deleteProject(id) {
    await apiDeleteProject(id);
    set((s) => ({
      projects: (s.projects ?? []).filter((p) => p.id !== id),
      projectsMeta: { count: Math.max(0, (s.projectsMeta?.count ?? 1) - 1) },
    }));
  },

  // -----------------------
  // Goals (LIVE API)
  // -----------------------
  goals: [],
  goalsLoading: false,
  goalsError: null,
  // If you add DRF pagination to goals later, add: goalsMeta: { count: 0 }

  async fetchGoals(params) {
    set({ goalsLoading: true, goalsError: null });
    try {
      const data = await listGoals(params);
      const items = Array.isArray(data) ? data : data?.results || [];
      set({ goals: items, goalsLoading: false });
      // If paginated later, also set goalsMeta.count the same way as above
    } catch (err) {
      const msg =
        err?.response?.data?.detail ??
        (typeof err?.response?.data === "object" ? JSON.stringify(err.response.data) : err?.response?.data) ??
        err?.message ??
        "Failed to fetch goals";
      set({ goalsLoading: false, goalsError: msg });
    }
  },

  /**
   * Create Goal — now accepts:
   * - title
   * - target_projects
   * - deadline
   * - total_steps (seeded from initial steps builder)
   * - completed_steps (usually 0 on create)
   */
  async createGoal({ title, target_projects, deadline, total_steps = 0, completed_steps = 0 }) {
    set({ goalsError: null });
    const created = await apiCreateGoal({ title, target_projects, deadline, total_steps, completed_steps });
    set((s) => ({ goals: [created, ...s.goals] }));
    return created;
  },

  async updateGoal(id, patch) {
    const updated = await apiUpdateGoal(id, patch);
    set((s) => ({
      goals: (s.goals ?? []).map((g) => (g.id === id ? updated : g)),
    }));
    return updated;
  },

  async deleteGoal(id) {
    await apiDeleteGoal(id);
    set((s) => ({
      goals: (s.goals ?? []).filter((g) => g.id !== id),
    }));
  },

  // -----------------------
  // Auth
  // -----------------------
  user: null,          // { email }
  access: null,        // JWT access token
  refresh: null,       // JWT refresh token
  bootstrapped: false, // flip true after restoreUser()

  async register({ email, password }) {
    if (!email || !password) throw new Error("Missing credentials");
    const { data } = await api.post("/api/auth/register/", { email, password });
    return { created: true, email, meta: data };
  },

  async login({ email, password }) {
    if (!email || !password) throw new Error("Missing credentials");
    const { data } = await api.post("/api/auth/login/", {
      email,
      password,
    });
    const { access, refresh } = data;
    const user = { email };
    setAuthToken(access);
    set({ user, access, refresh });
    localStorage.setItem("sf_user", JSON.stringify({ user, access, refresh }));
    return user;
  },

  /**
   * Logout:
   * - POST /api/auth/logout/ with { refresh } to blacklist server-side
   * - Clear client tokens/state/localStorage regardless of API success
   */
  async logout() {
    const { refresh } = get();
    try {
      await logoutApi(refresh);
    } finally {
      setAuthToken(null);
      set({ user: null, access: null, refresh: null });
      localStorage.removeItem("sf_user");
    }
  },

  restoreUser() {
    try {
      const raw = localStorage.getItem("sf_user");
      if (raw) {
        const { user, access, refresh } = JSON.parse(raw);
        set({ user, access, refresh });
        if (access) setAuthToken(access);
      }
    } finally {
      set({ bootstrapped: true });
    }
  },

  // -----------------------
  // Optional local demo adders (kept)
  // -----------------------
  addCertificate(payload) {
    set((s) => ({ certificates: [...s.certificates, { id: rid(), ...payload }] }));
  },
  addProject(payload) {
    set((s) => ({ projects: [...s.projects, { id: rid(), ...payload }] }));
  },
}));
