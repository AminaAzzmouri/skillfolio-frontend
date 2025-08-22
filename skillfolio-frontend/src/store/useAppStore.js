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
}));
