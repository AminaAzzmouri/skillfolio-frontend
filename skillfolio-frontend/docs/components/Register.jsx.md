**Register.jsx**:

  ## Purpose:
  ================================================================================

  This component provides the **registration interface** for Skillfolio.  
  It enables new users to create an account by submitting their email, password, 
  and a confirmation password.  

  Like Login.jsx, registration is currently mocked using Zustand state management.  
  Later, this will connect to backend APIs (e.g., `/api/auth/register`) for real signup.  

  ================================================================================

  ## Structure:
  ================================================================================

  #### State:
      • form: Stores email, password, and confirm password values.
      • error: Holds validation or registration error messages.

  #### Hooks:
      • useAppStore: Accesses Zustand’s `register` action (mock user creation).
      • useNavigate: Redirects user to `/dashboard` after successful signup.

  #### Form:
      • Email input (required).
      • Password input (required).
      • Confirm password input (required; validates match).
      • Error message displayed if validation or registration fails.
      • Submit button labeled **Sign Up**.

  #### Routing:
      • After successful signup → navigates to `/dashboard`.
      • Provides a link to `/login` if the user already has an account.

  ================================================================================

  ## Role in Project:
  ================================================================================

  Register.jsx completes the **auth flow** alongside Login.jsx:  
    - Provides entry point for new users.  
    - Validates credentials before creating an account.  
    - Redirects to dashboard on success.  

  ================================================================================

  ## Future Enhancements:
  ================================================================================

  - Replace mock registration with real backend API call (`/api/auth/register`).  
  - Stronger validation (e.g., email format, password strength).  
  - Add feedback during signup (loading spinner, success message).  
  - Consider adding reCAPTCHA or email verification.  