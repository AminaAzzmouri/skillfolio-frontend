**Login.jsx**:

  ## Purpose:
  ================================================================================

  This component provides the **login interface** for Skillfolio.  
  It allows users to authenticate by submitting their **email + password**.  
  On success, the app stores JWT tokens and redirects the user to their dashboard. 

  ================================================================================

  ## Structure:
  ================================================================================

  #### State:
      • form: Holds the email + password values.
      • error: Stores user-visible validation or login errors.
  
  #### Hooks:
      • useAppStore: Accesses the global Zustand store for the `login` action, which:
        - Sends POST to `/api/auth/login/` (with `{ username: email, password }`)
        - Stores returned `access` + `refresh` JWT tokens
        - Persists session to localStorage

      • useNavigate: From React Router, used to redirect users to `/dashboard` after success.

  #### Form:
      • Input fields for email + password (required)
      • Validation: Requires both fields to be filled.
      • On submit:
        1. Calls `await login({ email, password })`  
        2. On success → navigate to `/dashboard`  
        3. On error → display error message under the form  

  #### Error Handling:
      • Surfaces API errors when available:
        - `err.response.data` (string or object)  
        - Fallbacks: `err.message` or `"Login failed"

  #### Routing:
      • Success → `/dashboard`  
      • Provides a link to `/register` if the user doesn’t yet have an account  


  ================================================================================

  ## Role in Project:
  ================================================================================

  Login is part of the **authentication flow**:
    - Completes the second half of the **auth flow** (login after registration).  
    - Verifies credentials directly against the backend.  
    - On success, initializes the app’s authenticated state and unlocks protected routes.

  ================================================================================

  ## Current Integration Notes:
  ================================================================================

  - Uses real backend API: `/api/auth/login/`  
  - Persists `{ user, access, refresh }` in both Zustand state and localStorage  
  - Restored automatically on page reload (`restoreUser()` in store)  

  ## Future Enhancements:
  ================================================================================

  
  - Add loading state on submit (spinner or disabled button).
  - Add "Forgot Password?" link + recovery flow.
  - Stronger validation (regex for email, minimum password length). 
  - Optional toast/banner for login errors instead of inline text.  
