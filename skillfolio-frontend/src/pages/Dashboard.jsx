/* Docs: see docs/pages doc/Dashboard.jsx.md */

import { useEffect, useMemo } from "react";
import { useAppStore } from "../store/useAppStore.js";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import ProgressBar from "../components/ProgressBar";

// Same helpers to detect previewable file types
const isImageUrl = (url) => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(url || "");
const isPdfUrl   = (url) => /\.pdf$/i.test(url || "");

// Build absolute URL if BE returns relative path
const makeFileUrl = (maybeUrl) => {
  if (!maybeUrl || typeof maybeUrl !== "string") return null;
  if (maybeUrl.startsWith("http")) return maybeUrl;
  const base = api?.defaults?.baseURL || "";
  return `${base.replace(/\/$/, "")}/${maybeUrl.replace(/^\//, "")}`;
};

export default function Dashboard() {
  // data
  const certificates         = useAppStore((s) => s.certificates);
  const projects             = useAppStore((s) => s.projects);
  const goals                = useAppStore((s) => s.goals);

  // loading / errors
  const certsLoading         = useAppStore((s) => s.certificatesLoading);
  const certsError           = useAppStore((s) => s.certificatesError);
  const projectsLoading      = useAppStore((s) => s.projectsLoading);
  const projectsError        = useAppStore((s) => s.projectsError);
  const goalsLoading         = useAppStore((s) => s.goalsLoading);
  const goalsError           = useAppStore((s) => s.goalsError);

  // actions
  const fetchCertificates    = useAppStore((s) => s.fetchCertificates);
  const fetchProjects        = useAppStore((s) => s.fetchProjects);
  const fetchGoals           = useAppStore((s) => s.fetchGoals);

  useEffect(() => {
    // Load all so counts & recent are real on first paint
    fetchCertificates();
    fetchProjects();
    fetchGoals();
  }, [fetchCertificates, fetchProjects, fetchGoals]);

  // Average checklist progress across goals (fallback 0)
  const goalProgress = useMemo(() => {
    if (!Array.isArray(goals) || goals.length === 0) return 0;
    const vals = goals.map((g) => Number(g?.steps_progress_percent || 0));
    const sum = vals.reduce((a, b) => a + b, 0);
    return Math.round(sum / goals.length);
  }, [goals]);

  // recent 5 certificates (just slice, assuming BE returns user-scoped)
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
          <li><Link to="/goals">Goals</Link></li>
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
            {goalsLoading ? (
              <div className="opacity-70">Loading…</div>
            ) : goalsError ? (
              <div className="text-accent text-sm">Error: {goalsError}</div>
            ) : (
              <>
                <div className="text-2xl mb-1">{goalProgress}%</div>
                <ProgressBar value={goalProgress} />
              </>
            )}
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
            <div className="opacity-70">
              No certificates yet.{" "}
              <Link className="underline" to="/certificates">
                Add your first one
              </Link>.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentCertificates.map((c) => {
                const url = makeFileUrl(c?.file_upload);
                const showImg = url && isImageUrl(url);
                const showPdf = url && isPdfUrl(url);

                return (
                  <div
                    key={c.id}
                    className="rounded border border-gray-700 bg-background/60 p-3 flex gap-3"
                  >
                    {/* Thumbnail */}
                    <div className="w-20 h-20 shrink-0 rounded border border-gray-700 overflow-hidden flex items-center justify-center">
                      {showImg ? (
                        <img
                          src={url}
                          alt={`${c.title} file`}
                          className="object-cover w-full h-full"
                          loading="lazy"
                        />
                      ) : showPdf ? (
                        <div className="text-xs opacity-80 text-center px-1">
                          PDF
                          <br />
                          preview
                        </div>
                      ) : (
                        <div className="text-xs opacity-50">No file</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{c.title}</div>
                      <div className="text-sm opacity-80 truncate">
                        {c.issuer} {c.date_earned ? `• ${c.date_earned}` : null}
                      </div>
                      {url && (
                        <a
                          className="text-xs underline inline-block mt-1"
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View file
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
