**Register.jsx**:

  ## Purpose:
  ================================================================================

  This component provides the **registration interface** for Skillfolio.  
  It enables new users to create an account by submitting their email, password, 
  and a confirmation password.  

  Like Login.jsx, registration Submits email + password to the backend (`/api/auth/register/`). 

  On success, redirects the user to **/login** (we do **not** auto-login after signup).

  ================================================================================

  ## Structure:
  ================================================================================

  #### State:
      • form: Stores email, password, and confirm password values.
      • error: Holds user-visible registration error messages.

  #### Hooks:
      • useAppStore: Accesses Zustand’s `register` action (mock user creation).
      • useNavigate: redirects to `/login` after a successful registration.

  #### Form:
      • Email input (required).
      • Password input (required).
      • Confirm password input (required; validates match).
      • On submit:
        1) client-side check that passwords match  
        2) `await register({ email, password })` → backend call  
        3) on success → `navigate("/login", { state: { msg: "Account created, please log in." } })`  
        4) on error → show message in `<p className="text-accent">...</p>`

  #### Error handling:
      • Surfaces server errors when possible:
        1) `err.response.data.detail`
        2) or stringified `err.response.data`
        3) or `err.message`
        4) fallback: `"Registration failed"`

  #### Routing:
      • After successful signup → redirect to `/login` (with a success message in location state)
      • Provides a link to `/login` if the user already has an account.

  ================================================================================

  ## Role in Project:
  ================================================================================

  - Register.jsx completes the first half of the **auth flow** (signup → then login).
  - Keeps UX explicit: users confirm signup by logging in, which also validates the backend JWT login path.

  ================================================================================

    ## Current Integration Notes:
  ================================================================================

  - Uses the real API via the `useAppStore.register()` action (Axios instance in `lib/api`).
  - No auto-login on signup by design (simplifies error handling; avoids partial auth state).
  - Success message is passed to `/login` via `navigate(..., { state })` so the login page can show a friendly banner/toast.

  ================================================================================

  ## Future Enhancements:
  ================================================================================
  
  - Client-side validations (email format, password strength/match hints).
  - Consider adding reCAPTCHA or email verification.  
  - Loading state on submit (disable button / small spinner / success message).
  - Server-side password rules surfaced inline (e.g., min length).
  - Optional: auto-login on success (exchange for tokens), if desired later.
