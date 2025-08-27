/* Docs: see docs/State/useAppStore.js.md */

// Zustand store: JWT auth + certificates (API) + projects (API) + bootstrapping.

import { create } from "zustand";
import { api, setAuthToken, logoutApi } from "../lib/api";

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

  async fetchCertificates() {
    set({ certificatesLoading: true, certificatesError: null });
    try {
      const { data } = await api.get("/api/certificates/");
      const items = Array.isArray(data) ? data : data?.results || [];
      set({ certificates: items, certificatesLoading: false });
    } catch (err) {
      const msg =
        err?.response?.data?.detail ??
        (typeof err?.response?.data === "object"
          ? JSON.stringify(err.response.data)
          : err?.response?.data) ??
        err?.message ??
        "Failed to load certificates";
      set({ certificatesLoading: false, certificatesError: msg });
    }
  },

  async createCertificate({ title, issuer, date_earned, file }) {
    // multipart because of optional file
    const fd = new FormData();
    fd.append("title", title);
    fd.append("issuer", issuer);
    fd.append("date_earned", date_earned);
    if (file) fd.append("file_upload", file);

    set({ certificatesError: null });
    const { data } = await api.post("/api/certificates/", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // Prepend for snappy UX
    set((s) => ({ certificates: [data, ...s.certificates] }));
    return data;
  },

  // -----------------------
  // Projects (NOW LIVE API)
  // -----------------------
  projects: [],
  projectsLoading: false,
  projectsError: null,

  async fetchProjects() {
    set({ projectsLoading: true, projectsError: null });
    try {
      const { data } = await api.get("/api/projects/");
      const items = Array.isArray(data) ? data : data?.results || [];
      set({ projects: items, projectsLoading: false });
    } catch (err) {
      const msg =
        err?.response?.data?.detail ??
        (typeof err?.response?.data === "object"
          ? JSON.stringify(err.response.data)
          : err?.response?.data) ??
        err?.message ??
        "Failed to load projects";
      set({ projectsLoading: false, projectsError: msg });
    }
  },

  // DRF ProjectSerializer exposes fields="__all__"
  // We now send guided fields + status; BE expects 'certificate' key (ID or null).
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

    const { data } = await api.post("/api/projects/", payload);
    set((s) => ({ projects: [data, ...s.projects] })); // prepend for snappy UX
    return data;
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
