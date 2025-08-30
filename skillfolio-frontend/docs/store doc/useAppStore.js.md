**useAppStore.js**:

## Purpose:
=============================================================================================================

Centralized global state (Zustand) for auth (JWT) and CRUD over Certificates, Projects, and Goals, plus a bootstrapping flag so route guards can wait for session restore.

  
## What it stores
=============================================================================================================

- Auth: user, access, refresh, bootstrapped
- Certificates: certificates, certificatesLoading, certificatesError, certificatesMeta: { count }
- Projects: projects, projectsLoading, projectsError, projectsMeta: { count }
- Goals: goals, goalsLoading, goalsError (meta optional later)

## Actions (by slice)
=================================================================================================================================================

### Auth:

    • register({ email, password }) → POST /api/auth/register/register({ email, password }) → POST /api/auth/register/
    Does not auto-login; caller should redirect to /login on success.

    • login({ email, password }) → POST /api/auth/login/ with { username: email, password }
    Saves { user, access, refresh } to store + localStorage, calls setAuthToken(access).

    • logout()
      POST /api/auth/logout/ (best-effort), clears tokens, store, axios header, and localStorage.

    • restoreUser()
      Loads sf_user from localStorage, reapplies Authorization header if present, then sets bootstrapped = true in a finally block.

### Certificates (LIVE API)

    • fetchCertificates({ search, ordering, filters, page })
      >  GET /api/certificates/ with query params.
      > Accepts array or paginated { results, count }.

    • createCertificate({ title, issuer, date_earned, file })
      >  Multipart POST; prepends created row and bumps count optimistically.

    • updateCertificate(id, patch)
      >  PATCH; replaces the updated row in-place.

    • deleteCertificate(id)
      >  DELETE; removes the row and decrements count (never < 0).
  
### Projects (LIVE API)

    • fetchProjects({ search, ordering, filters, page })
      >  GET /api/projects/; handles array or paginated responses.

    • createProject(payload)
      >  POST; maps FE’s certificateId → BE’s certificate, prepends on success, bumps count.

    • updateProject(id, patch)
      >  PATCH; replaces the updated row in-place (also maps certificateId if present).

    • deleteProject(id)
      >  DELETE; removes row and decrements count.

### Goals  (LIVE API)

    • fetchGoals(params)
      >  GET /api/goals/; handles array or paginated responses (meta optional).

    • createGoal({ title, target_projects, deadline, total_steps = 0, completed_steps = 0 })
      >  POST; prepends created row.

    • updateGoal(id, patch) → PATCH

    • deleteGoal(id) → DELETE

### Error handling

    • Fetch actions normalize common axios errors into readable strings:
      >  err.response.data.detail
      > stringified err.response.data if it’s an object
      > err.response.data or err.message
      > final fallback labels: e.g., "Failed to fetch projects"

### Bootstrapping flow (why it matters)

    • restoreUser() must run once at app start.
    • ProtectedRoute waits on bootstrapped to avoid flash redirects.

## Quick usage
=================================================================================================================================================

// App.jsx
const restoreUser = useAppStore((s) => s.restoreUser);
useEffect(() => { restoreUser(); }, [restoreUser]);

// Certificates page
const { fetchCertificates, createCertificate } = useAppStore.getState();
await fetchCertificates({ search: "sql", ordering: "-date_earned" });
await createCertificate({ title, issuer, date_earned, file });
