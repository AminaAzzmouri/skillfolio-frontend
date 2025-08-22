import { useState } from "react";
import { Link } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ email: "", password: "" });

  const onSubmit = (e) => {
    e.preventDefault();
    // Day 3: mock only — just log. Week 4: replace with axios POST /api/auth/login
    console.log("Login submit", form);
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
          className="w-full mb-6 rounded p-3 bg-background/60 border border-gray-700 focus:outline-none"
          placeholder="••••••••"
        />

        <button className="w-full bg-primary hover:bg-primary/80 transition rounded p-3 font-semibold">Log In</button>

        <p className="text-sm mt-4 text-center">
          No account? <Link className="text-secondary hover:underline" to="/register">Create one</Link>
        </p>
      </form>
    </div>
  );
}
