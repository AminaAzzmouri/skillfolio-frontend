/* Docs: see docs/pages/Dashboard.jsx.md */

import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "../store/useAppStore.js";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import ProgressBar from "../components/ProgressBar"; // kept for recents list usage
import Loading from "../components/Loading";
import EmptyState from "../components/EmptyState";
import ToastContainer from "../components/Toast.jsx";
import SectionHeader from "../components/SectionHeader";
import { motion } from "framer-motion";

import StatCard from "../components/StatCard";
import {
  Award,
  Layers3,
  Target,
  CheckCircle2,
  CalendarDays,
  Clock3,
} from "lucide-react";

// preview helpers
const isImageUrl = (url) => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(url || "");
const isPdfUrl = (url) => /\.pdf$/i.test(url || "");
const makeFileUrl = (maybeUrl) => {
  if (!maybeUrl || typeof maybeUrl !== "string") return null;
  if (maybeUrl.startsWith("http")) return maybeUrl;
  const base = api?.defaults?.baseURL || "";
  return `${base.replace(/\/$/, "")}/${maybeUrl.replace(/^\//, "")}`;
};

const STATUS_META = {
  planned: { label: "Planned", Icon: CalendarDays, className: "text-sky-400" },
  in_progress: {
    label: "In Progress",
    Icon: Clock3,
    className: "text-amber-400",
  },
  completed: {
    label: "Completed",
    Icon: CheckCircle2,
    className: "text-green-400",
  },
};

// small animation presets for recents sections (not for stat cards)
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
  const certificates = useAppStore((s) => s.certificates);
  const projects = useAppStore((s) => s.projects);
  const goals = useAppStore((s) => s.goals);

  // loading / errors
  const certsLoading = useAppStore((s) => s.certificatesLoading);
  const certsError = useAppStore((s) => s.certificatesError);
  const projectsLoading = useAppStore((s) => s.projectsLoading);
  const projectsError = useAppStore((s) => s.projectsError);
  const goalsLoading = useAppStore((s) => s.goalsLoading);
  const goalsError = useAppStore((s) => s.goalsError);

  // actions
  const fetchCertificates = useAppStore((s) => s.fetchCertificates);
  const fetchProjects = useAppStore((s) => s.fetchProjects);
  const fetchGoals = useAppStore((s) => s.fetchGoals);

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
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type,
        message,
      },
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
          (typeof e?.response?.data === "object"
            ? JSON.stringify(e?.response?.data)
            : e?.response?.data) ||
          e?.message ||
          "Failed to load analytics summary";
        if (!cancelled) {
          setSummaryError(msg);
          pushToast("error", msg);
        }
      } finally {
        if (!cancelled) setSummaryLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
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
          (typeof e?.response?.data === "object"
            ? JSON.stringify(e?.response?.data)
            : e?.response?.data) ||
          e?.message ||
          "Failed to load goals progress";
        if (!cancelled) {
          setGoalsProgressError(msg);
          pushToast("error", msg);
        }
      } finally {
        if (!cancelled) setGoalsProgressLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
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
    () => (Array.isArray(certificates) ? certificates.slice(0, 3) : []),
    [certificates]
  );
  const recentProjects = useMemo(
    () => (Array.isArray(projects) ? projects.slice(0, 3) : []),
    [projects]
  );
  const recentGoals = useMemo(
    () => (Array.isArray(goals) ? goals.slice(0, 3) : []),
    [goals]
  );

  // Sidebar links
  const sideLinks = [
    { to: "/certificates", label: "Certificates" },
    { to: "/projects", label: "Projects" },
    { to: "/goals", label: "Goals" },
  ];

  return (
    <div className="flex min-h-screen bg-background text-text">
      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Sidebar (no borders on items now) */}
      <aside className="w-64 bg-background/90 p-4 border-r border-gray-700 hidden md:block">
        <h2 className="font-heading text-xl mb-6">Dashboard</h2>
        <ul className="flex flex-col gap-3">
          {sideLinks.map((item) => (
            <li key={item.to}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.99 }}
                transition={{ type: "spring", stiffness: 420, damping: 26 }}
                className="rounded-lg overflow-hidden"
              >
                <Link
                  to={item.to}
                  className="block px-3 py-2 bg-background/60 hover:bg-gradient-to-r hover:from-primary/25 hover:via-secondary/25 hover:to-accent/25 transition-colors"
                >
                  {item.label}
                </Link>
              </motion.div>
            </li>
          ))}
        </ul>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-heading mb-4">
          Welcome to Your Dashboard
        </h1>

        {/* KPI cards — static cards (hover/scale handled in StatCard), animated bar only */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Total Certificates */}
          <StatCard
            title="Total Certificates"
            value={summaryLoading ? "…" : summary?.certificates_count ?? 0}
            icon={Award}
            note={summaryError ? "Error loading stats" : "All-time total"}
          />

          {/* Total Projects */}
          <StatCard
            title="Total Projects"
            value={summaryLoading ? "…" : summary?.projects_count ?? 0}
            icon={Layers3}
            note={summaryError ? "Error loading stats" : "All-time total"}
          />

          {/* Goal Progress — number + animated progress bar in one row */}
          <StatCard
            title="Goal Progress"
            value="" // we'll render custom layout below
            icon={Target}
            note={
              goalsProgressLoading
                ? "Calculating…"
                : goalsProgressError
                ? "Error loading progress"
                : goalsProgress.length === 0
                ? "No goals yet"
                : "Average across goals"
            }
          >
            <div className="flex items-center gap-3">
              <div className="flex-1 max-w-[220px]">
                {/* animated stripes on track only */}
                <div
                  className="h-2 w-full rounded bg-gray-800/80 overflow-hidden bg-stripes"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={goalsProgressLoading ? 0 : goalProgress}
                >
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{
                      width: `${goalsProgressLoading ? 0 : goalProgress}%`,
                    }}
                    aria-hidden="true"
                  />
                </div>
              </div>
              <div className="text-lg font-semibold">
                {goalsProgressLoading ? "…" : `${goalProgress}%`}
              </div>
            </div>
          </StatCard>
          <StatCard
            title="Goals Completed"
            value={
              summaryLoading
                ? "…"
                : `${summary?.goals_completed_count ?? 0}/${
                    summary?.goals_count ?? 0
                  }`
            }
            icon={CheckCircle2}
            note={
              summaryLoading
                ? "Calculating…"
                : summaryError
                ? "Error loading stats"
                : (summary?.goals_count ?? 0) === 0
                ? "No goals yet"
                : "Completed vs total"
            }
          >
            <div className="flex items-center gap-3">
              <div className="flex-1 max-w-[220px]">
                <div
                  className="h-2 w-full rounded bg-gray-800/80 overflow-hidden"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={
                    summaryLoading
                      ? 0
                      : summary?.goals_completion_rate_percent ?? 0
                  }
                >
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{
                      width: `${
                        summaryLoading
                          ? 0
                          : summary?.goals_completion_rate_percent ?? 0
                      }%`,
                    }}
                    aria-hidden="true"
                  />
                </div>
              </div>
              <div className="text-lg font-semibold">
                {summaryLoading
                  ? "…"
                  : `${summary?.goals_completion_rate_percent ?? 0}%`}
              </div>
            </div>
          </StatCard>
        </div>

        {/* Recent Certificates */}
        <motion.div
          className="bg-background/70 p-4 rounded-lg shadow-md dark:shadow-xl dark:shadow-black/40 mb-6 mt-20"
          variants={containerStagger}
          initial="hidden"
          animate="show"
        >
          <SectionHeader
            icon={Award}
            title="Recent Certificates"
            count={Array.isArray(certificates) ? certificates.length : 0}
          /> 

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
                  </Link>
                  .
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
                    className="rounded-lg bg-background/80 backdrop-blur-sm p-4 flex gap-3 shadow-md dark:shadow-none ring-1 ring-border/50 dark:ring-white/5"
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
                      <div className="text-xs mt-1 opacity-80 truncate">
                        {c.issuer} {c.date_earned ? `• ${c.date_earned}` : null}
                      </div>
                      {/* Spacer pushes link down */}
                      <div className="flex-1" />
                      { /* View file link */ }
                      {url && (
                        <a
                          className="text-xs underline inline-block mt-5"
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
          className="bg-background/70 p-4 rounded-lg shadow-md dark:shadow-xl dark:shadow-black/40 mb-6 mt-20"
          variants={containerStagger}
          initial="hidden"
          animate="show"
        >
          <SectionHeader
            icon={Layers3}
            title="Recent Projects"
            count={Array.isArray(projects) ? projects.length : 0}
          />

          {projectsLoading ? (
            <Loading />
          ) : projectsError ? (
            <EmptyState message={projectsError} isError />
          ) : projects.length === 0 ? (
            <EmptyState
              message={
                <>
                  No projects yet.{" "}
                  <Link className="underline" to="/projects">
                    Start Building Now
                  </Link>
                  .
                </>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentProjects.map((p) => (
                <motion.div
                  key={p.id}
                  className="rounded-lg bg-background/80 backdrop-blur-sm p-4 shadow-md dark:shadow-none ring-1 ring-border/50 dark:ring-white/5"
                  variants={itemFade}
                >
                  <div className="font-medium truncate">{p.title}</div>
                  <div className="text-xs opacity-80 mt-1 flex items-center gap-1.5">
                    {(() => {
                      const meta =
                        STATUS_META[p.status || "planned"] ||
                        STATUS_META.planned;
                      const Icon = meta.Icon;
                      return (
                        <>
                          <Icon
                            className={`w-4 h-4 ${meta.className}`}
                            aria-hidden="true"
                          />
                          <span className="opacity-90">{meta.label}</span>
                        </>
                      );
                    })()}
                  </div>
                  {p.description && (
                    <div className="text-sm opacity-80 mt-8 line-clamp-3">
                      {p.description}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Goals */}
        <motion.div
          className="bg-background/70 p-4 rounded-lg shadow-md dark:shadow-xl dark:shadow-black/40 mb-6 mt-20"
          variants={containerStagger}
          initial="hidden"
          animate="show"
        >
          <SectionHeader
            icon={Target}
            title="Recent Goals"
            count={Array.isArray(goals) ? goals.length : 0}
          />

          {goalsLoading ? (
            <Loading />
          ) : goalsError ? (
            <EmptyState message={goalsError} isError />
          ) : goals.length === 0 ? (
            <EmptyState
              message={
                <>
                  No goals yet.{" "}
                  <Link className="underline" to="/goals">
                    Set a new goal here
                  </Link>
                  .
                </>
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentGoals.map((g) => (
                <motion.div
                  key={g.id}
                  className="rounded-lg bg-background/80 backdrop-blur-sm p-4 shadow-md dark:shadow-none ring-1 ring-border/50 dark:ring-white/5"
                  variants={itemFade}
                >
                  <div className="font-medium truncate">
                    {g.title || "Untitled goal"}
                  </div>
                  <div className="text-xs opacity-80 mt-1">
                    Target: {g.target_projects} • Deadline: {g.deadline}
                  </div>
                  <div className="mt-9 max-w-[160px]">
                    <ProgressBar
                      value={g.projects_progress_percent ?? 0}
                      label="Project progress"
                    />
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
