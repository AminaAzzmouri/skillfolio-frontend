/* Docs: see docs/components/Dashboard.jsx.md */

import { useEffect, useMemo } from "react";
import { useAppStore } from "../store/useAppStore.js";
import { Link } from "react-router-dom";

export default function Dashboard() {
  // data
  const certificates         = useAppStore((s) => s.certificates);
  const projects             = useAppStore((s) => s.projects);

  // loading / errors
  const certsLoading         = useAppStore((s) => s.certificatesLoading);
  const certsError           = useAppStore((s) => s.certificatesError);
  const projectsLoading      = useAppStore((s) => s.projectsLoading);
  const projectsError        = useAppStore((s) => s.projectsError);

  // actions
  const fetchCertificates    = useAppStore((s) => s.fetchCertificates);
  const fetchProjects        = useAppStore((s) => s.fetchProjects);

  useEffect(() => {
    // Load both so counts & recent are real on first paint
    fetchCertificates();
    fetchProjects();
  }, [fetchCertificates, fetchProjects]);

  const goalProgress = 0; // (placeholder for future Goals)

  // recent 5 certificates (just slice, assuming BE already returns user-scoped)
  const recentCertificates = useMemo(() => {
    if (!Array.isArray(certificates)) return [];
    return certificates.slice(0, 5);
  }, [certificates]);

  return (
    <div className="flex min-h-screen bg-background text-text">
      {/* Sidebar */}
      <aside className="w-64 bg-background/90 p-4 border-r border-gray-700 hidden md:block">
        <h2 className="font-heading text-xl mb-6">Dashboard</h2>
        <ul className="flex flex-col gap-3">
          <li><Link to="/certificates">Certificates</Link></li>
          <li><Link to="/projects">Projects</Link></li>
          <li>Profile</li>
        </ul>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-heading mb-4">Welcome to Your Dashboard</h1>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-background/70 p-4 rounded border border-gray-700">
            <div className="font-semibold mb-1">Total Certificates</div>
            {certsLoading ? (
              <div className="opacity-70">Loading…</div>
            ) : certsError ? (
              <div className="text-accent text-sm">Error: {certsError}</div>
            ) : (
              <div className="text-2xl">{certificates.length}</div>
            )}
          </div>

          <div className="bg-background/70 p-4 rounded border border-gray-700">
            <div className="font-semibold mb-1">Total Projects</div>
            {projectsLoading ? (
              <div className="opacity-70">Loading…</div>
            ) : projectsError ? (
              <div className="text-accent text-sm">Error: {projectsError}</div>
            ) : (
              <div className="text-2xl">{projects.length}</div>
            )}
          </div>

          <div className="bg-background/70 p-4 rounded border border-gray-700">
            <div className="font-semibold mb-1">Goal Progress</div>
            <div className="text-2xl">{goalProgress}%</div>
          </div>
        </div>

        {/* Recent Certificates */}
        <div className="bg-background/70 p-4 rounded border border-gray-700">
          <h2 className="font-heading mb-2">Recent Certificates</h2>

          {certsLoading ? (
            <div className="opacity-70">Loading…</div>
          ) : certsError ? (
            <div className="text-accent">Error: {certsError}</div>
          ) : certificates.length === 0 ? (
            <div className="opacity-70">No certificates yet. <Link className="underline" to="/certificates">Add your first one</Link>.</div>
          ) : (
            <ul className="list-disc pl-6 space-y-1">
              {recentCertificates.map((c) => (
                <li key={c.id}>
                  <span className="font-medium">{c.title}</span>
                  {c.issuer ? <span className="opacity-80"> — {c.issuer}</span> : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
