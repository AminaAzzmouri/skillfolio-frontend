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

export const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  writeCredentials: false,
});

    • baseURL → points to the local Django backend during development.
    (Change this to your deployed backend URL for production.)

    • withCredentials (typo: currently written as writeCredentials) → determines
    whether cross-site cookies are sent. Since we’re using JWT headers instead,
    this can safely remain false.

#### Auth Header Helper

    export function setAuthToken(token) {
    if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
        } 
        else {
            delete api.defaults.headers.common.Authorization;
            }
        }

    • setAuthToken(token): Sets or clears the Authorization: Bearer <token> header
        on all outgoing requests.

    • Used by the store’s login/logout/restore actions:
        - After login: call setAuthToken(access) so every API request is authenticated.
        - On logout: call setAuthToken(null) to remove the header.

## Role in Project
================================================================================

    • Provides a single, consistent entry point for API calls across the app.
    • Ensures authentication headers are applied globally rather than individually.
    • Makes it easy to update the backend base URL without touching multiple files.
     
## Future Enhancements
================================================================================

    • Switch baseURL dynamically based on environment (dev, staging, production).

    • Add interceptors to:
        - Automatically refresh JWT tokens when expired.
        - Log or handle errors in a centralized way.
    • Support file uploads by attaching Content-Type: multipart/form-data when needed.