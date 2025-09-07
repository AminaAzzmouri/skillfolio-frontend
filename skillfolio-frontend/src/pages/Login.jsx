/* Docs: see docs/pages doc/Login.jsx.md */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";

export default function Login() {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const login = useAppStore((s) => s.login);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      const detail =
        err?.response?.data?.detail ??
        (typeof err?.response?.data === "object" ? JSON.stringify(err.response.data) : err?.response?.data) ??
        err?.message ??
        "Login failed";
      setError(detail);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-surface p-6 rounded-xl ring-1 ring-border/60 shadow-soft dark:bg-background/80 dark:ring-white/10">
        <h1 className="font-heading text-2xl mb-6 text-center">Log in to Skillfolio</h1>

        <label htmlFor="login-identifier" className="block text-sm mb-2">Email or username</label>
        <input
          id="login-identifier"
          type="text"
          autoComplete="username"
          required
          value={form.identifier}
          onChange={(e) => setForm({ ...form, identifier: e.target.value })}
          className="w-full mb-4 rounded p-3 bg-background/60 ring-1 ring-border/60 focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="you@example.com or username"
        />

        <label htmlFor="login-password" className="block text-sm mb-2">Password</label>
        <input
          id="login-password"
          type="password"
          autoComplete="password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full mb-2 rounded p-3 bg-background/60 ring-1 ring-border/60 focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="••••••••"
        />

        {error && <p className="text-sm text-accent mb-3">{error}</p>}

        <button className="btn btn-primary btn-block">Log In</button>

        <p className="text-sm mt-4 text-center">
          No account? <Link className="text-secondary hover:underline" to="/register">Create one</Link>
        </p>
      </form>
    </div>
  );
}
