/* Docs: see docs/components/LandingPage.jsx.md */

import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="bg-background min-h-screen text-text flex flex-col items-center justify-center px-4">
      <section className="text-center h-[80vh] flex flex-col items-center justify-center">
        <h1 className="text-4xl md:text-6xl font-heading mb-4">Skillfolio</h1>
        <p className="text-lg md:text-2xl mb-6">
          Store your learning journey in one place.
        </p>
        <div className="flex gap-4">
          <Link
            to="/register"
            className="bg-primary px-6 py-3 rounded hover:bg-primary/80 transition"
          >
            Sign Up
          </Link>
          <Link
            to="/login"
            className="bg-secondary px-6 py-3 rounded hover:bg-secondary/80 transition"
          >
            Log In
          </Link>
        </div>
      </section>
    </div>
  );
}
