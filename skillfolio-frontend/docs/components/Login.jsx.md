**Login.jsx**:

  ## Purpose:
  ================================================================================

  This component provides the **login interface** for Skillfolio.  
  It allows existing users to enter their credentials (email + password) and 
  access their dashboard after successful authentication.  

  Currently, authentication is mocked using Zustand state management.  
  Later, it will connect to backend APIs (JWT or session-based) for real login.  

  ================================================================================

  ## Structure:
  ================================================================================

  #### State:
      • form: Holds the email + password values.
      • error: Stores validation or login errors.
  
  #### Hooks:
      • useAppStore: Accesses the global Zustand store for the `login` action.
      • useNavigate: From React Router, used to redirect users on success.

  #### Form:
      • Input fields for email + password.
      • Validation: Requires both fields to be filled.
      • Error display: Shows error message if login fails.
      • Submit button: Calls `login()` from store, then redirects to `/dashboard`.

  #### Routing:
      • Provides a link to `/register` if the user doesn’t yet have an account.

  ================================================================================

  ## Role in Project:
  ================================================================================

  Login is part of the **authentication flow**:
    - Acts as a gateway to the dashboard.
    - Verifies user credentials (mocked now, backend later).
    - Redirects authenticated users to their personalized data.

  ================================================================================

  ## Future Enhancements:
  ================================================================================

  - Replace mock login with API integration (`/api/auth/login`).
  - Add loading state on submit (spinner or disabled button).
  - Add "Forgot Password?" link + recovery flow.
  - Stronger validation (regex for email, minimum password length).