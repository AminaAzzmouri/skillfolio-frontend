/* Docs: see docs/components/Register.jsx.md */

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
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    try {
      await register({ email: form.email, password: form.password }); // mock
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-background text-text flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-background/80 p-6 rounded-xl border border-gray-700">
        <h1 className="font-heading text-2xl mb-6 text-center">Create your Skillfolio account</h1>

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
          className="w-full mb-4 rounded p-3 bg-background/60 border border-gray-700 focus:outline-none"
          placeholder="Create a password"
        />

        <label className="block text-sm mb-2">Confirm password</label>
        <input
          type="password"
          required
          value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          className="w-full mb-2 rounded p-3 bg-background/60 border border-gray-700 focus:outline-none"
          placeholder="Re-enter your password"
        />

        {error && <p className="text-sm text-accent mb-2">{error}</p>}

        <button className="w-full bg-primary hover:bg-primary/80 transition rounded p-3 font-semibold">Sign Up</button>

        <p className="text-sm mt-4 text-center">
          Already have an account? <Link className="text-secondary hover:underline" to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}

