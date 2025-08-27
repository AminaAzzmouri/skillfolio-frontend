**useAppStore.js**:

  ## Purpose:
  =============================================================================================================

  Centralized, lightweight global state for the Skillfolio frontend using Zustand.
  
  It manages:

    - Auth (JWT access/refresh, current user, restore on reload, logout),
    - Axios auth header control via setAuthToken,
    - Certificates integration (load list from live API, create with optional file upload).
    - Projects (temporary local list): kept for UI demo; will be API-backed next

  This keeps components lean and avoids prop drilling while remaining simpler than heavy state libraries.

  =============================================================================================================

  ## Structure:
  =================================================================================================================================================

  ### Data:

    • certificates: [] — live list fetched from the backend
    • projects: [] — local, temporary list (UI demo until projects API integration).
    • addCertificate(payload): → Adds a new certificate with a generated ID (pushes { id, ...payload } using a robust 
      ID generator (crypto.randomUUID when available, otherwise a random string))
    • addProject(payload): Adds a new project with a unique ID and links optionally to a certificate.
    • rid() — robust ID generator (prefers crypto.randomUUID, falls back to base-36 string)

  ### Authentication State:

    • user: null by default; becomes `{ email }` when logged in or registered
    • access: null → JWT access token (used for API calls).
    • refresh: null → JWT refresh token (reserved for future token refresh flow).
    • bootstrapped: false initially → flips to true after restoreUser() finishes so route guards can wait before redirecting.

  ### Authentication Actions:

    • async register({ email, password })
      Calls POST /api/auth/register/.
      **Intentional behavior:** does not auto-login. The UI should redirect the user to /login with a success message. 
      Returns { created: true, email, meta }.

    • async login({ email, password })
      Calls POST /api/auth/login/ with { username: email, password } (Django default user model expects username).
      On success:
          - Extracts { access, refresh }
          - Sets Authorization header globally via setAuthToken(access) so all future api (axios) calls are authenticated
          - Stores { user, access, refresh } in both Zustand and localStorage under sf_user
    
    • logout(): Clears the axios header, resets auth state in the store, and removes sf_user from localStorage.

    • restoreUser(): 
          - Reads sf_user from localStorage at app start
          - Restores { user, access, refresh } 
          - Reapplies the axios header if an access token is present.
          - Always sets bootstrapped: true in a finally block so components (e.g., ProtectedRoute) 
            can safely wait for session restoration before deciding to redirect.

  ### Certificates (API) Actions:

    • async fetchCertificates():
          - GET /api/certificates/
          - Populates certificates from server response.
          - Handles both array response and paginated { results: [...] } gracefully.

    • async createCertificate({ title, issuer, date_earned, file })
          - POST /api/certificates/ (multipart)
          - Builds a FormData payload:
                  * title, issuer, date_earned (YYYY-MM-DD)
                  * optional file_upload (PDF/image)
          - On success, prepends the created item to certificates.

  ### Projects (API) Actions:

    • projects: [] — list of projects from the backend  
    • projectsLoading / projectsError — track fetch/post states
    • async fetchProjects():
          - GET `/api/projects/`
          - Populates projects from server response (handles both array and paginated { results: [...] })
    • async createProject({...}):
          - POST /api/projects/
          - Payload now supports guided fields in addition to title/description/certificate:

            {
            title,
            description,              // final description (auto-generated but editable)
            certificate: certificateId || null,
            work_type,                // 'individual' | 'team' | null
            duration_text,            // string | null
            primary_goal,             // 'practice_skill' | 'deliver_feature' | 'build_demo' | 'solve_problem' | null
            challenges_short,         // string | null
            skills_used,              // string | null (CSV or short list)
            outcome_short,            // string | null
            skills_to_improve         // string | null
            }
            
    • On success, prepends the new project into state for snappy UX.
    • Errors are captured into `projectsError`.
    • Payload now includes status (default "planned") along with guided fields.
    • Remove mention of local demo adders as “temporary” → clarify both certificates & projects are now API-backed.

    **Note:** This replaces the earlier temporary `addProject` demo method with a full API-backed flow, aligning projects with certificates.

  ### Axios integration:
  

    • api and setAuthToken come from src/lib/api.
          - api is the preconfigured axios instance (baseURL, etc.).
          - setAuthToken(tokenOrNull) sets or clears the default global Authorization: Bearer <token> header.

  =================================================================================================================================================

  ## How It’s Used in the App:
  =========================================================================================================

  **Auth flow**:

  - Register → register() → navigate to /login with success message
  - Login → login() → navigate to /dashboard
  - Logout → logout() → navigate to /login
  - Navbar can show “Logout” and user email if user is set.
  - Axios interceptor cleans up stale tokens → no more “network error when hot reload auto-logs you in”.

  **Session persistence**:

  - ProtectedRoute should read bootstrapped and user:
          • If !bootstrapped → render a small loading placeholder.
          • If bootstrapped && !user → redirect to /login.
          • Otherwise → render children.

  - On app load, call restoreUser() once (e.g., in App.jsx useEffect) to keep users signed in on refresh.
  
  **Certificates page**: 

          • call fetchCertificates() on mount, 
          • createCertificate() on submit.

  =========================================================================================================
  
  ## Role in Project:
  ================================================================================================

  - Acts as the **single source of truth** for auth and certificate lists
  - Encapsulates JWT handling & anxios header management so pages/component can stay clean
  - Enables a smooth transition from mock lists to real API without refactoring the entire app
  - (Certificates are live now; Projects will follow the same pattern next)

  ================================================================================================

  ## Future Enhancements:
  ============================================================================================

  - Full projects CRUD with API: fetchProjects, createProject, update, delete
  - Token refresh using refresh + /api/auth/refresh/.
  - Introduce loading/error flags per async action for better UX.
  - Add selectors for derived data (e.g., counts for the dashboard).
  - Consider splitting into slices (auth slice, data slice) if the store grows.

  ================================================================================================

  ## Quick Reference (Common Flows):
  ==========================================================================================================

  • Register → Login redirect: 
                                await useAppStore.getState().register({ email, password });
                                navigate("/login", { state: { msg: "Account created. Please log in." } });

  • Login → Dashboard: 
                                await useAppStore.getState().login({ email, password });
                                navigate("/dashboard");

  • Logout: 
                                useAppStore.getState().logout();
                                navigate("/login");

  • Keep session on refresh: 
                                // App.jsx
                                const restoreUser = useAppStore((s) => s.restoreUser);
                                useEffect(() => { restoreUser(); }, [restoreUser]).

  • Certificates:
                                // Load on page mount
                                useEffect(() => { useAppStore.getState().fetchCertificates(); }, []);
                                
                                // Create with file
                                await useAppStore.getState().createCertificate({ title, issuer, date_earned, file /* optional */ });

  ================================================================================================

  ## Troubleshooting:
  ================================================================================================================================================

  **After refresh I get redirected to /login**

        • Ensure restoreUser() runs once on app boot (e.g., in App.jsx with useEffect).
        • In ProtectedRoute, wait for bootstrapped === true before deciding to redirect. Render a small loading placeholder while !bootstrapped.

  **401 Unauthorized after refresh**

        • restoreUser() must reapply the axios Authorization header. Confirm setAuthToken(access) is called when an access token is restored.
        • Check localStorage contains sf_user with { user, access, refresh }.

  **Login returns “username is required”**

        • For Django’s default User, the login payload must be { username: <email>, password }. Your store already maps this, but verify your login() sends username: email.

  **Register succeeds but I’m not logged in**

        • That’s intentional for now. register() does not auto-login; redirect your UI to /login with a success message.

  **White screen / blank page after edits**

        • Look at the browser console for syntax errors. Common culprits: a stray character, missing comma/semicolon, or accidentally pasting diff markers like +/-.
        • If the error mentions a specific file/line, fix that first. Vite updates instantly after save.

  **CORS errors in the browser**

        • Backend must allow your frontend origin. In development, CORS_ALLOW_ALL_ORIGINS = True is fine; for production, add explicit origins.
        
  **Requests still unauthenticated even after login**

        • Confirm setAuthToken(access) is called on successful login.
        • Open DevTools → Network → your API request → Request Headers. You should see Authorization: Bearer <access>.

  **State isn’t restoring on some browsers**

        • Make sure localStorage writes aren’t blocked (Incognito/Private modes may restrict).
        • Verify sf_user key exists in Application/Storage tab.

  **TypeScript or ESLint warnings (if you add TS/strict rules later)**

        • Add explicit return types to actions, or disable specific rules per file if needed. This repo is currently JS-first.