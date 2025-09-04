// Tiny helpers for /api/auth/me and /api/auth/change-password
import { api } from "../lib/api";

// GET /api/auth/me/
export async function getProfile() {
  const { data } = await api.get("/api/auth/me/");
  return data; // { id, username, email }
}

// PATCH /api/auth/me/
export async function patchProfile(patch) {
  const { data } = await api.patch("/api/auth/me/", patch);
  return data; // { id, username, email }
}

// PUT /api/auth/me/
export async function putProfile(full) {
  const { data } = await api.put("/api/auth/me/", full);
  return data; // { id, username, email }
}

// POST /api/auth/change-password/
export async function changePassword(current_password, new_password) {
  const { data } = await api.post("/api/auth/change-password/", {
    current_password,
    new_password,
  });
  return data; // { detail: "Password updated." }
}

// DELETE /api/auth/me/
export async function deleteAccount() {
  await api.delete("/api/auth/me/");
}
