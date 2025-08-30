**Register.jsx**:

  ## Purpose:
  ================================================================================

  Provides the login interface for Skillfolio. Users authenticate with email + password; on success we call the store’s login action and redirect to /dashboard.
  
  The actual API call lives inside useAppStore().login. This page is UI + control flow only.

  ## Component signature:
  ================================================================================

  export default function Login() : JSX.Element

  ## State & hooks:
  ================================================================================

  - Local state
      • form – { email: string, password: string }
      • error: string for user-visible errors
  - Store
      • login – from useAppStore, performs the authentication (e.g., POST /api/auth/login/)

  - Routing
      • useNavigate – navigate to /dashboard after successful login

  ## UI / UX:
  ================================================================================

  - Two labeled inputs:
      • Email (type="email", required)
      • Password (type="password", required)
  - Submit button: “Log In”
  - Inline error surface under the form (text-accent) when login fails
  - Footer link to Register (/register)
  - Styling uses Tailwind tokens from your theme:
      • Background: bg-background
      • Text: text-text
      • Primary button: bg-primary hover:bg-primary/80
      • Inputs: bg-background/60 border border-gray-700

  ## Submit flow:
  ================================================================================
  
  - onSubmit prevents default and clears prior error.
  - Calls await login(form) (delegates to the store for API + session handling).
  - On success → navigate("/dashboard").
  - On failure → builds a helpful error string using:
        • err.response.data.detail
        • or stringified err.response.data
        • or err.message
        • fallback: "Login failed"

  - This mirrors the code:

        const detail = err?.response?.data?.detail ??
        (typeof err?.response?.data === "object" ? JSON.stringify(err.response.data) : err?.response?.data) ?? err?.message ?? "Login failed";

  ## Error handling:
  ================================================================================
  
  - Shows a single, concise error message below the inputs.
  - Preserves server detail when possible (useful for validation or 401s).

  ## Accessibility notes:
  ================================================================================
  
  - Inputs have visible <label> elements.
  - Form is keyboard-friendly; no custom key handling required.readers to announce it.
  - Sufficient color contrast comes from your dark palette; if you later tune light mode, keep contrast ≥ WCAG AA.

  ## Integration notes:
  ================================================================================
  
  - Expects useAppStore().login to:
      • Talk to the backend (e.g., POST /api/auth/login/).
      • Store user/session (tokens) in state (and optionally localStorage).
      • Throw on failure so this page can render the error.
  - Redirect target: /dashboard.
  - Login page can read location.state.msg to show a success banner/toast.

  If your Register page navigates to /login with a success banner in location state, this component currently does not read it. You can optionally read const { state } = useLocation() and display state?.msg in a non-error banner.

  ## Future enhancements:
  ================================================================================
  
  - Disabled state / spinner while awaiting response.
  - “Forgot password?” link → recovery flow.
  - Client-side email format hint.
  - Toasts instead of inline error.
  - Show a friendly success banner if location.state?.msg is present (from Register).

  ## What’s out of scope here:
  ================================================================================
  
  - No direct API code—handled by the store.
  - No token storage logic—also handled by the store.
  - No auto-redirect if already authenticated—handled globally (e.g., via restoreUser() + route guards).


