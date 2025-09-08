// Tiny axios instance to talk to Django API
import axios from "axios";

// Read base URL from env (fallback to localhost for dev)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
console.log('API_BASE at runtime:', import.meta.env.VITE_API_BASE_URL);

export const api = axios.create({
  baseURL: BASE_URL,
  // We use JWT Authorization headers, not cookies:
  withCredentials: false,
});

// Helper to set/remove Authorization header globally
let currentAccessToken = null;

export function setAuthToken(token) {
  currentAccessToken = token || null;
  if (currentAccessToken) {
    api.defaults.headers.common["Authorization"] = `Bearer ${currentAccessToken}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
}




/**
 * Global 401 handler:
 * - clears stale tokens from axios + localStorage
 * - hard-redirects to /login (avoids rendering protected pages with broken state)
 */
let isRefreshing = false;
let queued = [];

function queueRequest(cb) {
  return new Promise((resolve, reject) => {
    queued.push({ resolve, reject, cb });
  });
}
function flushQueue(error, token = null) {
  queued.forEach(({ resolve, reject, cb }) => {
    if (error) reject(error);
    else resolve(cb(token));
  });
  queued = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error?.config;
    const status = error?.response?.status;

    // If not 401 or we've already retried, just fail
    if (status !== 401 || original?._retry) {
      return Promise.reject(error);
    }

    // Mark this request so we don't loop
    original._retry = true;

    // Try to refresh once for all queued requests
    const raw = localStorage.getItem("sf_user");
    const refresh = raw ? JSON.parse(raw)?.refresh : null;
    if (!refresh) {
      return Promise.reject(error);
    }

    // If a refresh is in-flight, queue this request
    if (isRefreshing) {
      return queueRequest((newAccess) => {
        if (newAccess) original.headers["Authorization"] = `Bearer ${newAccess}`;
        return api(original);
      });
    }

    try {
      isRefreshing = true;
      const { data } = await axios.post(
        `${BASE_URL}/api/auth/refresh/`,
        { refresh },
        { withCredentials: false }
      );
      const newAccess = data?.access;
      if (!newAccess) throw new Error("No access in refresh response");

      // Persist + apply
      const parsed = raw ? JSON.parse(raw) : {};
      parsed.access = newAccess;
      localStorage.setItem("sf_user", JSON.stringify(parsed));
      setAuthToken(newAccess);

      // Retry queued + this one
      flushQueue(null, newAccess);
      original.headers["Authorization"] = `Bearer ${newAccess}`;
      return api(original);
    } catch (e) {
      flushQueue(e, null);
      // Hard logout client side
      setAuthToken(null);
      localStorage.removeItem("sf_user");
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }
);


/**
 * Logout API: blacklist the refresh token server-side.
 * POST /api/auth/logout/  { refresh: <refresh_token> }
 * - If this fails, FE still clears local state (best-effort).
 */
export async function logoutApi(refreshToken) {
  try {
    await api.post("/api/auth/logout/", { refresh: refreshToken });
  } catch {
    // ignore; we’ll clear locally regardless
  }
}
