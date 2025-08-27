/* Docs: see docs/state/api.js.md */

// Tiny axios instance to talk to Django API
import axios from "axios";

// Read base URL from env (fallback to localhost for dev)
const BASE_URL = import.meta.env?.VITE_API_BASE ?? "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: BASE_URL,
  // We use JWT Authorization headers, not cookies:
  withCredentials: false,
});

// Helper to set/remove Authorization header globally
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

/**
 * Global 401 handler:
 * - clears stale tokens from axios + localStorage
 * - hard-redirects to /login (avoids rendering protected pages with broken state)
 */
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      try {
        setAuthToken(null);
        localStorage.removeItem("sf_user");
      } finally {
        if (!window.location.pathname.startsWith("/login")) {
          window.location.replace("/login");
        }
      }
    }
    return Promise.reject(error);
  }
);
