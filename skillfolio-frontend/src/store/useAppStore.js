// src/store/useAppStore.js
// Minimal, clean Zustand store with JWT auth + bootstrapping + local demo lists.

import { create } from "zustand";
import { api, setAuthToken } from "../lib/api";

// Fallback id if crypto.randomUUID is unavailable (kept for local demo adders)
const rid = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2));

export const useAppStore = create((set, get) => ({
  // -----------------------
  // Lists (Certificates API-backed, Projects still local for now)
  // -----------------------
  certificates: [],
  certificatesLoading: false,
  certificatesError: null,


  projects: [],

  // -----------------------
  // Auth state
  // -----------------------
  user: null,          // { email }
  access: null,        // JWT access token
  refresh: null,       // JWT refresh token
  bootstrapped: false, // set to true after restoreUser runs (so guards can wait)

  // -----------------------
  // Auth actions
  // -----------------------
  // Register → POST /api/auth/register/ (no auto-login here)
  async register({ email, password }) {
    if (!email || !password) throw new Error("Missing credentials");
    const { data } = await api.post("/api/auth/register/", { email, password });
    // Let UI redirect to /login with a success message
    return { created: true, email, meta: data };
  },

  // Login → POST /api/auth/login/ (Django expects username for default User)
  async login({ email, password }) {
    if (!email || !password) throw new Error("Missing credentials");
    const { data } = await api.post("/api/auth/login/", {
      username: email, // important: backend expects "username"
      password,
    });
    const { access, refresh } = data;
    const user = { email };

    // Set axios default auth header
    setAuthToken(access);

    // Persist to store + localStorage
    set({ user, access, refresh });
    localStorage.setItem("sf_user", JSON.stringify({ user, access, refresh }));
    return user;
  },

  // Logout → clear memory + storage + axios header
  logout() {
    setAuthToken(null);
    set({ user: null, access: null, refresh: null });
    localStorage.removeItem("sf_user");
  },

  // Restore session on reload; always mark bootstrapped at the end
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

  // ----------------------------------------------------
  // Certificates (LIVE API)
  // ----------------------------------------------------
  // Fetch all certificates (GET /api/certificates/)
  async fetchCertificates() {
    set({ certificatesLoading: true, certificatesError: null });
    try {
      const { data } = await api.get("/api/certificates/");
      // DRF default list returns array (if you didn't enable pagination).

      // If you enable DRF pagination later, swap to: const items = data.results
      const items = Array.isArray(data) ? data : data.results || [];
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

  // Create one certificate (POST /api/certificates/) – supports file upload
  async createCertificate({ title, issuer, date_earned, file }) {

    // Use FormData because of optional file
    const fd = new FormData();
    fd.append("title", title);
    fd.append("issuer", issuer);
    fd.append("date_earned", date_earned);
    if (file) fd.append("file_upload", file);

  // Clear previous error before trying
  set({ certificatesError: null });

  const { data } = await api.post("/api/certificates/", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });

    // Optimistically add to the list (or call fetchCertificates again)
    set((s) => ({ certificates: [data, ...s.certificates] }));
    return data;
  },

  // -----------------------
  // Local adders (still useful for UI testing)
  // -----------------------
  
  // (Optional) keep local adder for quick UI testing of Certificates
  addCertificate(payload) {
    set((s) => ({
      certificates: [...s.certificates, { id: rid(), ...payload }],
    }));
  },

  addProject(payload) {
    set((s) => ({
      projects: [...s.projects, { id: rid(), ...payload }],
    }));
  },
}));