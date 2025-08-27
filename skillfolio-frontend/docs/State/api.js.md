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
  * withCredentials: false → we use JWT Authorization headers, not cookies.

**Config via .env.local (Vite)**

  Create a .env.local file in the repo root:  VITE_API_BASE=http://127.0.0.1:8000

  Restart the dev server: after changing env vars so Vite picks them up.

**Auth Header Helper**

      export function setAuthToken(token) {
        if (token) {
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
        } else {
          delete api.defaults.headers.common.Authorization;
        }
      }

    * setAuthToken(token) sets or clears the Authorization: Bearer <token> header on all outgoing requests.

    * Used by the store’s login/logout/restore actions:
          - After login: setAuthToken(access) so every API request is authenticated.
          - On logout: setAuthToken(null) to remove the header.


## Role in Project
================================================================================

  - Provides a single, consistent entry point for API calls across the app.
  - Ensures authentication headers are applied globally rather than individually.
  - Makes it easy to swap backend environments without touching code (configure VITE_API_BASE instead).


## Future Enhancements
================================================================================

  - Add Axios interceptors to:
  - Automatically refresh JWT tokens when expired (use refresh token).
  - Centralize error logging/handling.
  - Support file uploads by attaching Content-Type: multipart/form-data when needed
 (we already do this on specific POSTs).