**Register.jsx**:

  ## Purpose:
  ================================================================================

  The Register page lets a new user create a Skillfolio account with email + password.
  
  On success we redirect to /login (we do not auto-login).

  ## Route
  ================================================================================

  #### Pah: 
      • /register
  #### Used by: 
      • Unauthenticated users
  
  #### Data flow (high level)
  ================================================================================

      • User fills email, password, confirm password.
      • Client validates passwords match
      • Calls useAppStore.register({ email, password }) → backend request.
      • On success: navigate("/login", { state: { msg: "Account created, please log in." } })
      • On failure: show a readable error string above the submit button.

  ## State & hooks:
  ================================================================================

  - Local state
      • form: { email, password, confirm }
      • error: string for user-visible errors
  - Hooks
        • useAppStore() → register action
        • useNavigate() → redirect to Login
        • (No props; component is self-contained)

  ## UI / UX:
  ================================================================================

  - Inputs
      • Email (required)
      • Password (required)
      • Confirm password (required; must match)
  - Actions
        • Sign Up (primary button)
        • Link to Log in if user already has an account

  - Visual tokens come from Tailwind theme (background, text, primary, etc.)

  ## Validation & errors:
  ================================================================================
  
  - Client-side: checks that password === confirm. If not, sets "Passwords do not match".
  - Server-side surface: tries, in order:
        • err.response.data.detail
        • JSON.stringify(err.response.data) (if it’s an object)
        • err.message
        • Fallback: "Registration failed"

  ## Control flow (submit):
  ================================================================================
  
  - onSubmit
  
   ├─ preventDefault
   ├─ clear error
   ├─ if mismatch → set error and return
   └─ await register({ email, password })
    ├─ success → navigate("/login", { state: { msg } })
    └─ failure → set error (best available message)

  ## Accessibility notes:
  ================================================================================
  
  - Inputs have <label> elements bound by proximity (explicit htmlFor optional but recommended).
  - Consider adding aria-live="polite" to the error <p> if you want screen readers to announce it.
  - Future improvement: add autoComplete="email" / autoComplete="new-password" attributes.

  ## Integration notes:
  ================================================================================
  
  - Relies on the app store’s register action (Axios instance in lib/api).
  - Keeps auth state simple: no auto-login on signup; user must log in afterward (good for demos and clearer flow).
  - Login page can read location.state.msg to show a success banner/toast.

  ## Edge cases to expect:
  ================================================================================
  
  - Duplicate email / existing account → backend validation error surfaced in error.
  - Network failure / timeout → generic "Registration failed" or err.message.
  - Weak password rules → ideally returned by backend and surfaced via detail

  ## Testing checklist:
  ================================================================================
  
  - Password mismatch shows client error and blocks submit.
  - Server error (e.g., duplicate email) renders readable message.
  - Successful submit redirects to /login with state message.
  - Inputs keep their values until a successful redirect (no premature clearing).

  ## Future enhancements:
  ================================================================================
  
  - Password strength meter and inline hints.
  - Loading state on submit (disable button + “Creating…” label).
  - reCAPTCHA or email verification flow.
  - Optional: auto-login after successful registration (if product direction changes).




