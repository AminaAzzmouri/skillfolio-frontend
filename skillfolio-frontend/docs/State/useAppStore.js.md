**useAppStore.js**:

  ## Purpose:
  =============================================================================================================

  Centralized, lightweight global state for the Skillfolio frontend using Zustand.
  
  It manages:

    - Auth (JWT access/refresh, current user, restore on reload, logout),
    - Axios auth header control via setAuthToken,
    - Certificates integration (load list from API, create with file upload).
    - Temporary local lists for projects (to be replaced by live API calls next).

  This keeps components lean and avoids prop drilling while remaining simpler than heavy state libraries.

  =============================================================================================================

  ## Structure:
  =================================================================================================================================================

  ### Data:

    • certificates: [] — list of certificates (now fetched from the backend).
    • projects: [] — local, temporary list (UI demo until projects API integration).

    • addCertificate(payload): → Adds a new certificate with a generated ID (pushes { id, ...payload } using a robust 
      ID generator (crypto.randomUUID when available, otherwise a random string))
    • addProject(payload): Adds a new project with a unique ID and links optionally to a certificate.

  ### Authentication State:

    • user: null by default; becomes `{ email }` when logged in or registered
    • access: null → JWT access token (used for API calls).
    • refresh: null → JWT refresh token (reserved for future token refresh flow).
    • bootstrapped: false → flips to true after restoreUser() finishes so route guards can wait before redirecting.

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
          - Stores { user, access, refresh } in both Zustand and localStorage (sf_user)
    
    • logout(): Clears the axios header, resets auth state in the store, and removes sf_user from localStorage.

    • restoreUser(): 
      Reads sf_user from localStorage at app start, restores { user, access, refresh }, and reapplies the axios header if an access token is present.
      Always sets bootstrapped: true in a finally block so components (e.g., ProtectedRoute) can safely wait for session restoration before deciding to redirect.

  ### Certificates (API) Actions:

    • async fetchCertificates():
          - GET /api/certificates/
          - Populates certificates from server response.

    • async createCertificate({ title, issuer, date_earned, file })
          - POST /api/certificates/ (multipart)
          - Builds a FormData payload:
                  * title, issuer, date_earned (YYYY-MM-DD)
                  * optional file_upload (PDF/image)
          - Appends the created certificate to certificates.
      
      These replace the earlier mock flow for certificates. Projects will follow in the next branch.

  ### Local demo adders (kept only for UI testing of projects):

    • addProject(payload) — pushes { id, ...payload } to projects using a robust ID generator.
    • rid() prefers crypto.randomUUID() if available, falling back to a base-36 random string.

  ### Axios integration:

    • api and setAuthToken come from src/lib/api.
          - api is the preconfigured axios instance (baseURL, etc.).
          - setAuthToken(tokenOrNull) sets or clears the default global Authorization: Bearer <token> header.

  =================================================================================================================================================

  ## How It’s Used in the App:
  =========================================================================================================

  - Login/Register pages call register() then navigate to /login, or call login() then navigate to /dashboard.
  
  - Navbar can show “Logout” and user email if user is set.

  - ProtectedRoute should read bootstrapped and user:
          • If !bootstrapped → render a small loading placeholder.
          • If bootstrapped && !user → redirect to /login.
          • Otherwise → render children.

  - On app load, call restoreUser() once (e.g., in App.jsx useEffect) to keep users signed in on refresh.
  
  - Certificates page: call fetchCertificates() on mount, createCertificate() on submit.

  =========================================================================================================
  
  ## Role in Project:
  ================================================================================================

  - Acts as the **single source of truth** for auth and certificate lists
  - Encapsulates JWT handling & anxios header management so pages/component can stay clean
  - Enables a smooth transition from mock lists to real API without refactoring the entire app
  - We swapped certificates first; projects come next with the same pattern.

  ================================================================================================

  ## Future Enhancements:
  ============================================================================================

  - Replace local list actions with real CRUD (GET/POST/PUT/DELETE) against the backend:
        ** fetchCertificates(), createCertificate(), fetchProjects(), createProject(), etc.

  - Add projects CRUD: fetchProjects, createProject, update, delete.
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
                                useEffect(() => {
                                useAppStore.getState().fetchCertificates();
                                }, []);
                                
                                // Create with file
                                await useAppStore.getState().createCertificate({
                                title, issuer, date_earned, file, // file optional
                                });

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