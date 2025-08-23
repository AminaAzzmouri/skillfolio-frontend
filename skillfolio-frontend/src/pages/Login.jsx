/*
  Login.jsx

  Purpose:
  ================================================================================

  This component provides the **login interface** for Skillfolio.  
  It allows existing users to enter their credentials (email + password) and 
  access their dashboard after successful authentication.  

  Currently, authentication is mocked using Zustand state management.  
  Later, it will connect to backend APIs (JWT or session-based) for real login.  

  ================================================================================

  Structure:
  ================================================================================

  - State:
      • form: Holds the email + password values.
      • error: Stores validation or login errors.
  
  - Hooks:
      • useAppStore: Accesses the global Zustand store for the `login` action.
      • useNavigate: From React Router, used to redirect users on success.

  - Form:
      • Input fields for email + password.
      • Validation: Requires both fields to be filled.
      • Error display: Shows error message if login fails.
      • Submit button: Calls `login()` from store, then redirects to `/dashboard`.

  - Routing:
      • Provides a link to `/register` if the user doesn’t yet have an account.

  ================================================================================

  Role in Project:
  ================================================================================

  Login is part of the **authentication flow**:
    - Acts as a gateway to the dashboard.
    - Verifies user credentials (mocked now, backend later).
    - Redirects authenticated users to their personalized data.

  ================================================================================

  Future Enhancements:
  ================================================================================

  - Replace mock login with API integration (`/api/auth/login`).
  - Add loading state on submit (spinner or disabled button).
  - Add "Forgot Password?" link + recovery flow.
  - Stronger validation (regex for email, minimum password length).
*/


import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";


export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const login = useAppStore((s) => s.login);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form);         // mock auth
      navigate("/dashboard");    // go to dashboard
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };
  return (
    <div className="min-h-screen bg-background text-text flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-background/80 p-6 rounded-xl border border-gray-700">
        <h1 className="font-heading text-2xl mb-6 text-center">Log in to Skillfolio</h1>

        <label className="block text-sm mb-2">Email</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full mb-4 rounded p-3 bg-background/60 border border-gray-700 focus:outline-none"
          placeholder="you@example.com"
        />

        <label className="block text-sm mb-2">Password</label>
        <input
          type="password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full mb-2 rounded p-3 bg-background/60 border border-gray-700 focus:outline-none"
          placeholder="••••••••"
        />

        {error && <p className="text-sm text-accent mb-2">{error}</p>}

        <button className="w-full bg-primary hover:bg-primary/80 transition rounded p-3 font-semibold">Log In</button>

        <p className="text-sm mt-4 text-center">
          No account? <Link className="text-secondary hover:underline" to="/register">Create one</Link>
        </p>
      </form>
    </div>
  );
}
