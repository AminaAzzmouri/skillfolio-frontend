/* Docs: see docs/pages doc/Register.jsx.md */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";

export default function Register() {
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const register = useAppStore((s) => s.register);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    try {
      await register({ email: form.email, password: form.password });
      navigate("/login", { state: { msg: "Account created, please log in." } });
    } catch (err) {
      const detail =
        err?.response?.data?.detail ??
        (typeof err?.response?.data === "object"
          ? JSON.stringify(err.response.data)
          : err?.response?.data) ??
        err?.message ??
        "Registration failed";
      setError(detail);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text flex items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md bg-surface p-6 rounded-xl ring-1 ring-border/60 shadow-soft dark:bg-background/80 dark:ring-white/10"
      >
        <h1 className="font-heading text-2xl mb-6 text-center">
          Create your Skillfolio account
        </h1>

        <label htmlFor="reg-email" className="block text-sm mb-2">Email</label>
        <input
          id="reg-email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full mb-4 rounded p-3 bg-background/60 ring-1 ring-border/60 focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="you@example.com"
        />

        <label htmlFor="reg-password" className="block text-sm mb-2">Password</label>
        <input
          id="reg-password"
          type="password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full mb-4 rounded p-3 bg-background/60 ring-1 ring-border/60 focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="Create a password"
        />

        <label htmlFor="reg-confirm" className="block text-sm mb-2">Confirm password</label>
        <input
          id="reg-confirm" 
          type="password"
          required
          value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          className="w-full mb-3 rounded p-3 bg-background/60 ring-1 ring-border/60 focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="Re-enter your password"
        />

        {error && <p className="text-sm text-accent mb-3">{error}</p>}

        {/* Unified button */}
        <button className="btn btn-primary btn-block">Sign Up</button>

        <p className="text-sm mt-4 text-center">
          Already have an account?{" "}
          <Link className="text-secondary hover:underline" to="/login">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}

