/* Docs: see docs/store/useAppStore.js.md */

// Zustand store: JWT auth + certificates (API) + projects (API) + bootstrapping.

import { create } from "zustand";
import { api, setAuthToken, logoutApi } from "../lib/api";

// ---- Certificates API helpers ----
import {
  listCertificates,
  createCertificateMultipart,
  updateCertificate as apiUpdateCertificate,
  deleteCertificate as apiDeleteCertificate,
} from "./certificates";

// ---- Projects API helpers (new) ----
import {
  listProjects,
  createProject as apiCreateProject,
  updateProject as apiUpdateProject,
  deleteProject as apiDeleteProject,
} from "./projects";

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
  // NEW: pagination meta (for DRF {count, next, previous, results})
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
        (typeof err?.response?.data === "object"
          ? JSON.stringify(err.response.data)
          : err?.response?.data) ??
        err?.message ??
        "Failed to fetch certificates";
      set({ certificatesLoading: false, certificatesError: msg });
    }
  },

  async createCertificate({ title, issuer, date_earned, file }) {
    set({ certificatesError: null });
    const created = await createCertificateMultipart({
      title,
      issuer,
      date_earned,
      file,
    });
    // Prepend for snappy UX
    set((s) => ({ certificates: [created, ...s.certificates] }));
    // (Optional) optimistic meta bump
    set((s) => ({ certificatesMeta: { count: (s.certificatesMeta?.count ?? 0) + 1 } }));
    return created;
  },

  // PATCH /api/certificates/:id/
  async updateCertificate(id, patch) {
    const updated = await apiUpdateCertificate(id, patch);
    set((s) => ({
      certificates: (s.certificates ?? []).map((c) => (c.id === id ? updated : c)),
    }));
    return updated;
  },

  // DELETE /api/certificates/:id/
  async deleteCertificate(id) {
    await apiDeleteCertificate(id);
    set((s) => ({
      certificates: (s.certificates ?? []).filter((c) => c.id !== id),
      // (Optional) optimistic meta decrement
      certificatesMeta: { count: Math.max(0, (s.certificatesMeta?.count ?? 1) - 1) },
    }));
  },

  // -----------------------
  // Projects (LIVE API)
  // -----------------------
  projects: [],
  projectsLoading: false,
  projectsError: null,
  // NEW: pagination meta
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
        (typeof err?.response?.data === "object"
          ? JSON.stringify(err.response.data)
          : err?.response?.data) ??
        err?.message ??
        "Failed to fetch projects";
      set({ projectsLoading: false, projectsError: msg });
    }
  },

  // DRF ProjectSerializer exposes fields="__all__"
  // We send guided fields + status; BE expects 'certificate' key (ID or null).
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
      status, // 'planned' | 'in_progress' | 'completed'
      work_type,
      duration_text,
      primary_goal,
      challenges_short,
      skills_used,
      outcome_short,
      skills_to_improve,
    };

    const created = await apiCreateProject(payload);
    set((s) => ({ projects: [created, ...s.projects] })); // prepend for snappy UX
    // (Optional) optimistic meta bump
    set((s) => ({ projectsMeta: { count: (s.projectsMeta?.count ?? 0) + 1 } }));
    return created;
  },

  // NEW: PATCH /api/projects/:id/
  async updateProject(id, patch) {
    const updated = await apiUpdateProject(id, patch);
    set((s) => ({
      projects: (s.projects ?? []).map((p) => (p.id === id ? updated : p)),
    }));
    return updated;
  },

  // NEW: DELETE /api/projects/:id/
  async deleteProject(id) {
    await apiDeleteProject(id);
    set((s) => ({
      projects: (s.projects ?? []).filter((p) => p.id !== id),
      // (Optional) optimistic meta decrement
      projectsMeta: { count: Math.max(0, (s.projectsMeta?.count ?? 1) - 1) },
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
      username: email, // default Django User expects "username"
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
