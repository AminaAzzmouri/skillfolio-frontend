// src/store/useAppStore.js
// Minimal, clean Zustand store with JWT auth + bootstrapping + local demo lists.

import { create } from "zustand";
import { api, setAuthToken } from "../lib/api";

// Fallback id if crypto.randomUUID is unavailable
const rid = () =>
  (typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2));

export const useAppStore = create((set, get) => ({
  // -----------------------
  // Data (local placeholders until API hookup for lists)
  // -----------------------
  certificates: [],
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
      username: email,
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

  // -----------------------
  // Local adders (still useful for UI testing)
  // -----------------------
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