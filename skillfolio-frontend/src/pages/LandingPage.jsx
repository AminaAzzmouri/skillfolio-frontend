/* Docs: see docs/pages doc/LandingPage.jsx.md */

import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="bg-background min-h-screen text-text">
      {/* HERO / INTRO */}
      <section className="relative overflow-hidden">
        {/* soft background flare */}
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
          <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl bg-primary/20" />
          <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full blur-3xl bg-secondary/20" />
        </div>

        <div className="mx-auto max-w-7xl px-4 pt-20 pb-10 grid gap-10 md:grid-cols-2 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-heading leading-tight">
              Build a portfolio of your <span className="text-primary">learning</span>.
            </h1>
            <p className="mt-4 text-lg text-muted">
              Skillfolio helps self-learners <strong>archive certificates</strong>, <strong>track skills</strong>,
              and <strong>connect achievements to projects</strong> — so your growth is clear and shareable.
            </p>

            {/* value chips */}
            <div className="mt-6 flex flex-wrap gap-2 text-sm">
              <span className="rounded-full border border-border px-3 py-1 bg-surface/70">🎓 Archive certificates</span>
              <span className="rounded-full border border-border px-3 py-1 bg-surface/70">🧪 Document projects</span>
              <span className="rounded-full border border-border px-3 py-1 bg-surface/70">🧠 Track skills</span>
              <span className="rounded-full border border-border px-3 py-1 bg-surface/70">🎯 Hit goals</span>
            </div>
          </div>

          {/* simple “product preview” cards */}
          <div className="grid gap-4">
            <PreviewCard title="Certificates" subtitle="Google Data Analytics • 2024" badge="PDF attached" />
            <PreviewCard title="Projects" subtitle="Portfolio Website" badge="Completed" tone="secondary" />
            <PreviewCard title="Goals" subtitle="Ship 5 projects by May" badge="60% progress" tone="accent" />
          </div>
        </div>
      </section>

      {/* FEATURES / EXPLANATION */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="font-heading text-2xl mb-6">What to expect</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Feature icon="🎓" title="Certificates">
            Upload PDFs or images and keep your achievements organized.
          </Feature>
          <Feature icon="🧪" title="Projects">
            Explain what you built, the skills you used, and the outcome.
          </Feature>
          <Feature icon="🎯" title="Goals">
            Set targets, add steps, and track progress with clarity.
          </Feature>
          <Feature icon="📈" title="Dashboard">
            A clean overview of your latest work and momentum.
          </Feature>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        <h2 className="font-heading text-2xl mb-4">How Skillfolio helps self-learners</h2>
        <ol className="grid md:grid-cols-3 gap-4 text-sm">
          <Step n={1} title="Capture your wins">
            Add certificates and projects as you go — nothing gets lost.
          </Step>
          <Step n={2} title="Connect the dots">
            Link projects to certificates and skills to show evidence of ability.
          </Step>
          <Step n={3} title="Share your growth">
            Use your dashboard to talk about progress in applications and reviews.
          </Step>
        </ol>
      </section>

      {/* CTA (after intro + features) */}
      <section className="mx-auto max-w-7xl px-4 py-12 border-t border-border">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-lg">
            Ready to turn your learning into a clear, living portfolio?
          </p>
          <div className="flex gap-3">
            <Link to="/register" className="btn btn-primary">Create your account</Link>
            <Link to="/login" className="btn btn-outline">Log in</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Feature({ icon, title, children }) {
  return (
    <div className="rounded-lg border border-border p-4 bg-surface/70">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="font-semibold mb-1">{title}</div>
      <p className="text-sm text-muted">{children}</p>
    </div>
  );
}

function Step({ n, title, children }) {
  return (
    <li className="rounded-lg border border-border p-4 bg-surface/60">
      <div className="text-xs mb-1 opacity-70">Step {n}</div>
      <div className="font-semibold">{title}</div>
      <p className="text-sm text-muted mt-1">{children}</p>
    </li>
  );
}

function PreviewCard({ title, subtitle, badge, tone = "primary" }) {
  const toneBg =
    tone === "secondary" ? "bg-secondary/15 text-secondary" :
    tone === "accent"    ? "bg-accent/15 text-accent" :
                           "bg-primary/15 text-primary";
  return (
    <div className="rounded-xl border border-border bg-surface/80 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="font-semibold">{title}</div>
        <span className={`text-xs ${toneBg} px-2 py-1 rounded-full`}>{badge}</span>
      </div>
      <div className="text-sm text-muted mt-1">{subtitle}</div>
      <div className="mt-3 h-2 rounded bg-background/60 overflow-hidden">
        <div className={`h-full ${tone === "secondary" ? "bg-secondary/60" : tone === "accent" ? "bg-accent/60" : "bg-primary/60"}`} style={{ width: "60%" }} />
      </div>
    </div>
  );
}