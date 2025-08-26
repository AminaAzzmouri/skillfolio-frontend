/* Docs: see docs/state/api.js.md */

// Tiny axios instance to talk to Django API
import axios from "axios";

// Read base URL from env (fallback to localhost for dev)
const BASE_URL = import.meta.env?.VITE_API_BASE ?? "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: BASE_URL,
  // We use JWT Authorization headers, not cookies:
  withCredentials: false, // (fixed: was "writeCredentials")
});

// Helper to set/remove Authorization header globally
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}
