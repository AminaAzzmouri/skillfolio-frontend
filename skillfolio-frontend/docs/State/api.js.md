**api.js**

## Purpose
================================================================================

This file defines the **Axios instance** used by the Skillfolio frontend to
communicate with the Django REST backend.  
It centralizes the base URL and authentication header logic so that all API
requests share the same configuration.

By abstracting this into a single file, components and store actions can simply
import `api` or `setAuthToken` without worrying about low-level details.  


## Structure
================================================================================

#### Axios Instance

**import axios from "axios";**

    const BASE_URL = import.meta.env?.VITE_API_BASE ?? "http://127.0.0.1:8000";

    export const api = axios.create({
      baseURL: BASE_URL,
      withCredentials: false,
    });

  * baseURL → now read from environment variable VITE_API_BASE
    (fallbacks to http://127.0.0.1:8000 for local dev).
  * withCredentials: false → we explicitly use JWT Authorization headers, not cookies.

**Config via .env.local (Vite)**

    - Create a .env.local file in the repo root:  VITE_API_BASE=http://127.0.0.1:8000
    - Restart the dev server: after changing env vars so Vite picks them up.

**Auth Header Helper**

      export function setAuthToken(token) {
        if (token) {
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
        } else {
          delete api.defaults.headers.common.Authorization;
        }
      }

    * setAuthToken(token) sets or clears the Authorization: Bearer <token> header on all outgoing requests.

**Global 401 Interceptor**

    * Clears stale tokens from localStorage.
    * Hard-redirects to /login if any request comes back unauthorized.

        api.interceptors.response.use(
          (res) => res,
          (error) => {
            if (error?.response?.status === 401) {
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


**Logout API Helper**

        export async function logoutApi(refresh) {
          if (!refresh) return;
          try {
            await api.post("/api/auth/logout/", { refresh });
          } catch {
            // best-effort; FE still clears locally
            }
          }

    * Blacklists refresh tokens server-side (best-effort).
    * Works in tandem with frontend store logout().

## Role in Project
================================================================================

  - Provides a single, consistent entry point for API calls across the app.
  - Ensures authentication headers are applied globally rather than individually.
  - Avoids scattering headers and error handling across components.
  - Makes it easy to swap backend environments without touching code (configure VITE_API_BASE instead).

## What's done so far
================================================================================

  - Configured Axios with env-based baseURL.
  - JWT auth header helper
  - 401 global interceptor (auto-logout on expired/stale tokens)
  - Logout API integration.

## Future Enhancements
================================================================================

  - Auto-refresh JWT tokens via /api/auth/refresh/.
  - Centralized error logging for debugging.
  - Retry mechanism for transient failures.
  - Optional request/response logging in dev mode
