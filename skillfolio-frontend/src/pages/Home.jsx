/* Docs: see docs/pages doc/Home.jsx.md */

import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
      <div className="mx-auto max-w-6xl px-4 py-16">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-heading mb-3">
            Welcome back 👋
          </h1>
          <p className="text-lg text-muted">
            Keep momentum: add a new certificate, document a project, or set a goal.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
            <Link to="/projects" className="btn btn-outline">View Projects</Link>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAction
            title="Add Certificate"
            to="/certificates"
            desc="Upload a PDF or image, and keep it linked to your work."
          />
          <QuickAction
            title="Add Project"
            to="/projects"
            desc="Describe what you built and what you learned."
          />
          <QuickAction
            title="Create Goal"
            to="/goals"
            desc="Set a target and outline steps you can check off."
          />
        </div>
      </div>
    </div>
  );
}

function QuickAction({ title, desc, to }) {
  return (
    <Link
      to={to}
      className="rounded-lg border border-border p-4 bg-surface/70 hover:bg-surface/90 transition block"
    >
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-muted mt-1">{desc}</div>
    </Link>
  );
}


