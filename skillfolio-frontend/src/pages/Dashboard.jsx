/* Docs: see docs/pages/Dashboard.jsx.md */

import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "../store/useAppStore.js";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import ProgressBar from "../components/ProgressBar";
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import ToastContainer from "../components/Toast.jsx";
import { motion } from "framer-motion";

// preview helpers
const isImageUrl = (url) => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(url || "");
const isPdfUrl   = (url) => /\.pdf$/i.test(url || "");
const makeFileUrl = (maybeUrl) => {
  if (!maybeUrl || typeof maybeUrl !== "string") return null;
  if (maybeUrl.startsWith("http")) return maybeUrl;
  const base = api?.defaults?.baseURL || "";
  return `${base.replace(/\/$/, "")}/${maybeUrl.replace(/^\//, "")}`;
};

// small animation presets
const containerStagger = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.06, when: "beforeChildren" },
  },
};
const itemFade = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  // store data
  const certificates   = useAppStore((s) => s.certificates);
  const projects       = useAppStore((s) => s.projects);
  const goals          = useAppStore((s) => s.goals);

  // loading / errors
  const certsLoading   = useAppStore((s) => s.certificatesLoading);
  const certsError     = useAppStore((s) => s.certificatesError);
  const projectsLoading= useAppStore((s) => s.projectsLoading);
  const projectsError  = useAppStore((s) => s.projectsError);
  const goalsLoading   = useAppStore((s) => s.goalsLoading);
  const goalsError     = useAppStore((s) => s.goalsError);

  // actions
  const fetchCertificates = useAppStore((s) => s.fetchCertificates);
  const fetchProjects     = useAppStore((s) => s.fetchProjects);
  const fetchGoals        = useAppStore((s) => s.fetchGoals);

  // --- analytics states (from /api/analytics/*) ---
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  const [goalsProgress, setGoalsProgress] = useState([]); // array of goals w/ progress fields
  const [goalsProgressLoading, setGoalsProgressLoading] = useState(false);
  const [goalsProgressError, setGoalsProgressError] = useState("");

  // toasts
  const [toasts, setToasts] = useState([]);
  const pushToast = (type, message) =>
    setToasts((t) => [
      ...t,
      { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, type, message },
    ]);
  const dismissToast = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  // Fetch store lists for recents
  useEffect(() => {
    fetchCertificates();
    fetchProjects();
    fetchGoals();
  }, [fetchCertificates, fetchProjects, fetchGoals]);

  // Fetch analytics summary
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setSummaryLoading(true);
      setSummaryError("");
      try {
        const { data } = await api.get("/api/analytics/summary/");
        if (!cancelled) setSummary(data);
      } catch (e) {
        const msg =
          e?.response?.data?.detail ||
          (typeof e?.response?.data === "object" ? JSON.stringify(e?.response?.data) : e?.response?.data) ||
          e?.message ||
          "Failed to load analytics summary";
        if (!cancelled) {
          setSummaryError(msg);
          // toast for analytics errors
          pushToast("error", msg);
        }
      } finally {
        if (!cancelled) setSummaryLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Fetch analytics goals progress
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setGoalsProgressLoading(true);
      setGoalsProgressError("");
      try {
        const { data } = await api.get("/api/analytics/goals-progress/");
        const items = Array.isArray(data) ? data : data?.results || [];
        if (!cancelled) setGoalsProgress(items);
      } catch (e) {
        const msg =
          e?.response?.data?.detail ||
          (typeof e?.response?.data === "object" ? JSON.stringify(e?.response?.data) : e?.response?.data) ||
          e?.message ||
          "Failed to load goals progress";
        if (!cancelled) {
          setGoalsProgressError(msg);
          // toast for analytics errors
          pushToast("error", msg);
        }
      } finally {
        if (!cancelled) setGoalsProgressLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Average progress from /api/analytics/goals-progress/
  // Prefer steps_progress_percent if present; else fall back to progress_percent.
  const goalProgress = useMemo(() => {
    if (!Array.isArray(goalsProgress) || goalsProgress.length === 0) return 0;
    const vals = goalsProgress.map((g) => {
      const a = Number(g?.steps_progress_percent);
      const b = Number(g?.progress_percent);
      if (!isNaN(a)) return a;
      if (!isNaN(b)) return b;
      return 0;
    });
    const sum = vals.reduce((acc, v) => acc + v, 0);
    return Math.round(sum / goalsProgress.length);
  }, [goalsProgress]);

  // recent 5 of each
  const recentCertificates = useMemo(
    () => (Array.isArray(certificates) ? certificates.slice(0, 5) : []),
    [certificates]
  );
  const recentProjects = useMemo(
    () => (Array.isArray(projects) ? projects.slice(0, 5) : []),
    [projects]
  );
  const recentGoals = useMemo(
    () => (Array.isArray(goals) ? goals.slice(0, 5) : []),
    [goals]
  );

  return (
    <div className="flex min-h-screen bg-background text-text">
      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Sidebar */}
      <aside className="w-64 bg-background/90 p-4 border-r border-gray-700 hidden md:block">
        <h2 className="font-heading text-xl mb-6">Dashboard</h2>
        <ul className="flex flex-col gap-3">
          <li><Link to="/certificates">Certificates</Link></li>
          <li><Link to="/projects">Projects</Link></li>
          <li><Link to="/goals">Goals</Link></li>
        </ul>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-heading mb-4">Welcome to Your Dashboard</h1>

        {/* KPI cards — animated container & items */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
          variants={containerStagger}
          initial="hidden"
          animate="show"
        >
          {/* Total Certificates */}
          <motion.div className="bg-background/70 p-4 rounded border border-gray-700" variants={itemFade}>
            <div className="flex items-center justify-between">
              <div className="font-semibold mb-1">Total Certificates</div>
            </div>
            {summaryLoading ? (
              <Loading compact />
            ) : summaryError ? (
              <EmptyState message={summaryError} isError />
            ) : summary ? (
              <div className="text-2xl">{summary.certificates_count ?? 0}</div>
            ) : (
              <EmptyState message="No data yet." />
            )}
          </motion.div>

          {/* Total Projects */}
          <motion.div className="bg-background/70 p-4 rounded border border-gray-700" variants={itemFade}>
            <div className="flex items-center justify-between">
              <div className="font-semibold mb-1">Total Projects</div>
            </div>
            {summaryLoading ? (
              <Loading compact />
            ) : summaryError ? (
              <EmptyState message={summaryError} isError />
            ) : summary ? (
              <div className="text-2xl">{summary.projects_count ?? 0}</div>
            ) : (
              <EmptyState message="No data yet." />
            )}
          </motion.div>

          {/* Goal Progress */}
          <motion.div className="bg-background/70 p-4 rounded border border-gray-700" variants={itemFade}>
            <div className="flex items-center justify-between">
              <div className="font-semibold mb-1">Goal Progress</div>
            </div>
            {goalsProgressLoading ? (
              <Loading compact />
            ) : goalsProgressError ? (
              <EmptyState message={goalsProgressError} isError />
            ) : goalsProgress.length === 0 ? (
              <EmptyState message="No goals yet." />
            ) : (
              <>
                <div className="text-2xl mb-1">{goalProgress}%</div>
                <ProgressBar value={goalProgress} />
              </>
            )}
          </motion.div>
        </motion.div>

        {/* Recent Certificates */}
        <motion.div
          className="bg-background/70 p-4 rounded border border-gray-700 mb-6"
          variants={containerStagger}
          initial="hidden"
          animate="show"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-heading mb-2">Recent Certificates</h2>
          </div>

          {certsLoading ? (
            <Loading />
          ) : certsError ? (
            <EmptyState message={certsError} isError />
          ) : certificates.length === 0 ? (
            <EmptyState
              message={
                <>
                  No certificates yet.{" "}
                  <Link className="underline" to="/certificates">
                    Add your first one
                  </Link>.
                </>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentCertificates.map((c) => {
                const url = makeFileUrl(c?.file_upload);
                const showImg = url && isImageUrl(url);
                const showPdf = url && isPdfUrl(url);

                return (
                  <motion.div
                    key={c.id}
                    className="rounded border border-gray-700 bg-background/60 p-3 flex gap-3"
                    variants={itemFade}
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
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Recent Projects */}
        <motion.div
          className="bg-background/70 p-4 rounded border border-gray-700 mb-6"
          variants={containerStagger}
          initial="hidden"
          animate="show"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-heading mb-2">Recent Projects</h2>
          </div>

          {projectsLoading ? (
            <Loading />
          ) : projectsError ? (
            <EmptyState message={projectsError} isError />
          ) : projects.length === 0 ? (
            <EmptyState message="No projects yet." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentProjects.map((p) => (
                <motion.div
                  key={p.id}
                  className="rounded border border-gray-700 bg-background/60 p-3"
                  variants={itemFade}
                >
                  <div className="font-medium truncate">{p.title}</div>
                  <div className="text-xs opacity-80 mt-1">
                    Status: <span className="opacity-90">{p.status || "planned"}</span>
                  </div>
                  {p.description && (
                    <div className="text-sm opacity-80 mt-2 line-clamp-3">{p.description}</div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Goals */}
        <motion.div
          className="bg-background/70 p-4 rounded border border-gray-700"
          variants={containerStagger}
          initial="hidden"
          animate="show"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-heading mb-2">Recent Goals</h2>
          </div>

          {goalsLoading ? (
            <Loading />
          ) : goalsError ? (
            <EmptyState message={goalsError} isError />
          ) : goals.length === 0 ? (
            <EmptyState message="No goals yet." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentGoals.map((g) => (
                <motion.div
                  key={g.id}
                  className="rounded border border-gray-700 bg-background/60 p-3"
                  variants={itemFade}
                >
                  <div className="font-medium truncate">{g.title || "Untitled goal"}</div>
                  <div className="text-xs opacity-80 mt-1">
                    Target: {g.target_projects} • Deadline: {g.deadline}
                  </div>
                  <div className="mt-2">
                    <ProgressBar value={g.steps_progress_percent ?? 0} label="Checklist progress" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
