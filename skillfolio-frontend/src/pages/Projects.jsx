/* Docs: see docs/pages doc/Projects.jsx.md */

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import SearchBar from "../components/SearchBar";
import Filters from "../components/Filters";
// Local compact filters (we don't use the generic Filters/SortSelect here)
import Pagination from "../components/Pagination";
import ProjectForm from "../components/forms/ProjectForm";
import ConfirmDialog from "../components/ConfirmDialog";
import Modal from "../components/Modal";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, CalendarDays, Clock3, Layers3 } from "lucide-react";
import ActionButton from "../components/ActionButton";

function formatDateLong(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return String(iso).slice(0, 10);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const projSortOptions = [
  { value: "", label: "Sort…" },
  { value: "date_created", label: "Created (oldest)" },
  { value: "-date_created", label: "Created (newest)" },
  { value: "title", label: "Title (A→Z)" },
  { value: "-title", label: "Title (Z→A)" },
];

// status icon + label mapping
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

export default function ProjectsPage() {
  // URL params
  const [sp, setSp] = useSearchParams();
  const search = sp.get("search") || "";
  const ordering = sp.get("ordering") || "";
  const page = sp.get("page") || 1;

  // Accept BOTH ?certificate= and ?certificateId= (deep links from Certificates)
  const effectiveCertificate =
    sp.get("certificate") || sp.get("certificateId") || "";

  // User-facing compact filter: linked to a certificate? (any|yes|no)
  const linked = sp.get("linked") || "any";

  const filters = {
    certificate: effectiveCertificate,
    status: sp.get("status") || "",
  };

  const {
    projects,
    projectsLoading,
    projectsError,
    projectsMeta,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    certificates,
    certificatesLoading,
    certificatesError,
    fetchCertificates,
  } = useAppStore((s) => ({
    projects: s.projects,
    projectsLoading: s.projectsLoading,
    projectsError: s.projectsError,
    projectsMeta: s.projectsMeta,
    fetchProjects: s.fetchProjects,
    createProject: s.createProject,
    updateProject: s.updateProject,
    deleteProject: s.deleteProject,
    certificates: s.certificates,
    certificatesLoading: s.certificatesLoading,
    certificatesError: s.certificatesError,
    fetchCertificates: s.fetchCertificates,
  }));

  // flash → focus integration
  const flash = useAppStore((s) => s.flash);
  const [highlightId, setHighlightId] = useState(null);

  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const formRef = useRef(null);

  // Compact filter drawer like Certificates
  const [showFilters, setShowFilters] = useState(false);

  // Load cert titles (used in cards & forms)
  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  // Fetch server-side list when params change
  useEffect(() => {
    fetchProjects({ search, ordering, filters, page });
  }, [
    fetchProjects,
    search,
    ordering,
    page,
    filters.certificate,
    filters.status,
  ]);

  // flash → focus
  useEffect(() => {
    if (!flash?.projectId) return;
    const id = String(flash.projectId);
    const t = setTimeout(() => {
      const el = document.getElementById(`project-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightId(id);
        setTimeout(() => setHighlightId(null), 1600);
      }
    }, 50);
    return () => clearTimeout(t);
  }, [flash, projects]);

  // Map certificate id -> title
  const certTitleById = useMemo(() => {
    const m = new Map();
    for (const c of certificates) m.set(c.id, c.title);
    return m;
  }, [certificates]);

  // Update URL params helper
  const writeParams = (patch) => {
    const next = new URLSearchParams(sp);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === "" || v == null) next.delete(k);
      else next.set(k, v);
    });
    next.delete("page");
    setSp(next);
  };

  // Deep-link cert filter chip clear
  const clearCertFilter = () => {
    const next = new URLSearchParams(sp);
    next.delete("certificate");
    next.delete("certificateId");
    next.delete("page");
    setSp(next);
  };

  // Compact panel "Clear all"
  const clearAllCompactFilters = () => {
    const next = new URLSearchParams(sp);
    next.delete("linked");
    next.delete("status");
    next.delete("ordering");
    next.delete("page");
    setSp(next);
  };

  // Count applied (linked/status/sort)
  const appliedCount = useMemo(() => {
    let n = 0;
    if (linked && linked !== "any") n += 1;
    if (filters.status) n += 1;
    if (ordering) n += 1;
    return n;
  }, [linked, filters.status, ordering]);

  // Client-side "linked" filter
  const displayProjects = useMemo(() => {
    if (linked === "any") return projects;
    const wantLinked = linked === "yes";
    return projects.filter((p) =>
      wantLinked ? p.certificate != null : p.certificate == null
    );
  }, [projects, linked]);

  // ---- CRUD ----
  const handleCreate = async (payload) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      await createProject(payload);
      setShowCreate(false);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ??
        (typeof err?.response?.data === "object"
          ? JSON.stringify(err.response.data)
          : err?.response?.data) ??
        err?.message ??
        "Failed to create project";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (id, patch) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      await updateProject(id, patch);
      setEditingId(null);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ??
        (typeof err?.response?.data === "object"
          ? JSON.stringify(err.response.data)
          : err?.response?.data) ??
        err?.message ??
        "Failed to update project";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    await deleteProject(confirmDeleteId);
    setConfirmDeleteId(null);
  };

  const activeCertTitle = effectiveCertificate
    ? certTitleById.get(Number(effectiveCertificate))
    : null;

  return (
    <div className="min-h-screen bg-background text-text p-6">
      {/* Header row */}
      <div className="relative mt-8 mb-12">
        <Link
          to="/dashboard"
          className="absolute left-0 top-1/2 -translate-y-1/2 text-sm underline opacity-90 hover:opacity-100"
        >
          ← Back to dashboard
        </Link>

        <div className="flex items-center justify-center gap-3">
          <Link
            to="/certificates"
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border hover:bg-gradient-to-r hover:from-primary/20 hover:via-secondary/20 hover:to-accent/20 transition"
            aria-label="Go to Certificates"
            title="Certificates"
          >
            ‹
          </Link>

          <h1 className="font-heading text-2xl flex items-center gap-2">
            <Layers3 className="w-6 h-6 text-primary" aria-hidden="true" />
            Projects
          </h1>

          <Link
            to="/goals"
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border hover:bg-gradient-to-r hover:from-primary/20 hover:via-secondary/20 hover:to-accent/20 transition"
            aria-label="Go to Goals"
            title="Goals"
          >
            ›
          </Link>
        </div>
      </div>

      {/* Deep-link certificate chip */}
      {effectiveCertificate && (
        <div className="mb-3 text-sm">
          <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full border border-gray-600">
            <span className="opacity-90">
              Filtered by certificate:{" "}
              <strong>{activeCertTitle ?? `#${effectiveCertificate}`}</strong>
            </span>
            <button
              className="underline hover:opacity-80"
              onClick={clearCertFilter}
            >
              Clear filter
            </button>
          </span>
        </div>
      )}

      {/* Search + Filters toggle */}
      <div className="flex items-center gap-2 max-w-3xl mt-20 mb-2">
        <div className="w-full max-w-sm">
          <SearchBar
            value={search}
            onChange={(v) => writeParams({ search: v })}
            placeholder="Search projects…"
          />
        </div>

        <button
          type="button"
          className="px-3 py-2 rounded bg-[#fdf6e3] ring-1 ring-border/50 shadow-sm text-sm hover:bg-[#f6edda]
             dark:bg-background/60 dark:ring-white/10"
          onClick={() => setShowFilters((v) => !v)}
        >
          Filters ▾
          {appliedCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center min-w-[1.25rem] h-5 rounded-full bg-secondary/30 border border-secondary/50 text-xs px-1 text-secondary">
              {appliedCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      <AnimatePresence initial={false}>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            <Filters
              type="projects"
              value={{
                linked,
                status: sp.get("status") || "",
                ordering,
              }}
              onChange={(patch) => writeParams(patch)}
              onClear={clearAllCompactFilters}
              layout="grid"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* GRID */}
      <div className="mb-6 mt-8 h-100">
        {projectsLoading ? (
          <div className="opacity-80 text-sm">Loading projects…</div>
        ) : projectsError ? (
          <div className="text-accent text-sm">
            Error loading projects: {projectsError}
          </div>
        ) : displayProjects.length === 0 ? (
          <div className="opacity-80 text-sm mt-3">No projects yet.</div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayProjects.map((p) => {
              const isEditing = editingId === p.id;
              const linkedTitle =
                p.certificate != null ? certTitleById.get(p.certificate) : null;
              const cardId = `project-${p.id}`;
              const highlight = String(highlightId) === String(p.id);
              const meta =
                STATUS_META[p.status || "planned"] || STATUS_META.planned;

              return (
                <motion.li
                  key={p.id}
                  id={cardId}
                  // Remove 3D rotate to prevent blur; scale is crisp + GPU
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  className={
                    "group relative rounded-xl bg-background/70 overflow-hidden transition-shadow h-full " +
                    "shadow-xl hover:shadow-lg dark:shadow-none dark:border dark:border-border/50 " +
                    (highlight ? "ring-2 ring-accent shadow-lg" : "")
                  }
                >
                  {/* subtle glow on hover */}
                  <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />

                  {!isEditing ? (
                    /* Column layout: content grows; footer pinned */
                    <div className="flex h-full flex-col min-h-[18rem]">
                      {" "}
                      {/* <- ensure comfortable min height */}
                      <div className="p-3 flex-1 flex flex-col gap-2">
                        {/* Header row */}
                        <div className="flex items-start justify-between gap-3 mt-2">
                          <div className="min-w-0">
                            <div className="font-semibold line-clamp-1 break-words">
                              {p.title}
                            </div>

                            {/* Status + Created INLINE */}
                            <div className="text-xs opacity-80 flex items-center gap-1.5 truncate mt-1">
                              {/* status */}
                              <span className="inline-flex items-center gap-1.5">
                                <meta.Icon
                                  size={14}
                                  className={meta.className}
                                  aria-hidden="true"
                                />
                                <span>{meta.label}</span>
                              </span>

                              {/* dot divider */}
                              <span aria-hidden className="opacity-60">
                                •
                              </span>

                              {/* created date */}
                              <span>
                                Created: {formatDateLong(p.date_created)}
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            <ActionButton
                              icon="edit"
                              title="Edit"
                              shape="circle"
                              onClick={() => setEditingId(p.id)}
                            />
                            <ActionButton
                              icon="delete"
                              title="Delete"
                              shape="circle"
                              variant="danger"
                              onClick={() => setConfirmDeleteId(p.id)}
                            />
                          </div>
                        </div>

                        {/* Description section */}
                        <div className="mt-4 flex-1">
                          <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide opacity-60">
                            <div className="h-px bg-border/70 dark:bg-white/10 flex-1" />
                          </div>

                          {/* fixed height box with shadow + scroll */}
                          <div className="mt-2 h-40 rounded ring-1 ring-border/50 dark:ring-white/5 bg-background/40 shadow-lg overflow-y-auto">
                            <div className="p-3 text-sm opacity-90 whitespace-pre-wrap">
                              {p.description || (
                                <span className="opacity-60 italic">
                                  No description
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Footer — pinned */}
                      <div className="flex items-center justify-between gap-2 px-3 py-2">
                        <div className="text-xs opacity-80 whitespace-nowrap overflow-hidden text-ellipsis">
                          {p.certificate != null
                            ? `Linked to: ${linkedTitle ?? `#${p.certificate}`}`
                            : "Not linked"}
                        </div>
                        {p.certificate != null && (
                          <Link
                            to={`/certificates?id=${p.certificate}`}
                            className="text-xs inline-block underline hover:opacity-80 whitespace-nowrap"
                          >
                            View certificate
                          </Link>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3">
                      <ProjectForm
                        initial={p}
                        certificates={certificates}
                        submitting={submitting}
                        error={submitError}
                        onUpdate={handleUpdate}
                        onCancel={() => setEditingId(null)}
                        submitLabel="Save changes"
                      />
                    </div>
                  )}
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>

      {certificatesError && (
        <div className="text-accent mb-4">
          Certificates error: {certificatesError}
        </div>
      )}

      {/* Pagination */}
      <div className="max-w-xl mt-4">
        <Pagination
          page={Number(sp.get("page") || 1)}
          pageSize={10}
          total={projectsMeta?.count || 0}
          loading={projectsLoading}
          onPageChange={(n) => {
            const next = new URLSearchParams(sp);
            next.set("page", String(n));
            setSp(next);
          }}
        />
      </div>

      {/* Floating + (Add Project) */}
      <div className="fixed right-6 bottom-6 z-50 group">
        <motion.button
          type="button"
          onClick={() => setShowCreate(true)}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="h-12 w-12 rounded-full bg-primary text-white text-2xl leading-none shadow-lg hover:bg-gradient-to-r hover:from-primary hover:via-secondary hover:to-accent transition flex items-center justify-center"
          aria-label="New project"
          title="New project"
        >
          +
        </motion.button>
      </div>

      {/* Create in Modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Add Project"
        maxWidth="max-w-3xl"
      >
        <div ref={formRef}>
          <ProjectForm
            certificates={certificates}
            submitting={submitting}
            error={submitError}
            onCreate={handleCreate}
            submitLabel="Add Project"
            onCancel={() => setShowCreate(false)}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Delete project?"
        message="This action cannot be undone."
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
