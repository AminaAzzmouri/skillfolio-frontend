/* Docs: see docs/state/useAppStore.js.md */

import { create } from "zustand";
import { nanoid } from "nanoid/non-secure"; // no install needed; optional fallback if not available

const fallbackId = () => Math.random().toString(36).slice(2);

export const useAppStore = create((set, get) => ({
  certificates: [],
  projects: [],
  
  addCertificate: (payload) =>
    set((s) => ({ certificates: [...s.certificates, { id: (nanoid?.() || fallbackId()), ...payload }] })),

  addProject: (payload) =>
    set((s) => ({ projects: [...s.projects, { id: (nanoid?.() || fallbackId()), ...payload }] })),

  // auth --
  user: null, // {email} when logged in

  login: async ({email, password }) => {
    // Mock success if both fields provided
    if (!email || !password) throw new Error("Mising credentials");
    const user = { email };
    set({ user }),
    // optional: persist
    localStorage.setItem("sf_user",JSON.stringify(user));
    return user;
},

  register: async ({ email, password }) => {
    if (!email || !password) throw new Error("Missing credentials");
    const user = { email };
    set({user});
    localStorage.setItem("sf_user", JSON.stringify(user));
    return user;
  },

  logout: () => {
    set({user: null});
    localStorage.removeItem("sf_user");
  },

  // restore on load:
  restoreUser: () => {
    const raw = localStorage.getItem("sf_user");
    if (raw) set({ user: JSON.parse(raw) });
  },
}));
