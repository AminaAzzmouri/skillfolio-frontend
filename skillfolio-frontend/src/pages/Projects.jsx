/* Docs: see docs/pages/Projects.jsx.md */

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import SearchBar from "../components/SearchBar";
import Filters from "../components/Filters";
import SortSelect from "../components/SortSelect";
import ProjectForm from "../components/forms/ProjectForm";
import ConfirmDialog from "../components/ConfirmDialog";

function formatDateLong(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return String(iso).slice(0, 10);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

const projSortOptions = [
  { value: "", label: "Sort…" },
  { value: "date_created", label: "Created (oldest)" },
  { value: "-date_created", label: "Created (newest)" },
  { value: "title", label: "Title (A→Z)" },
  { value: "-title", label: "Title (Z→A)" },
];

export default function ProjectsPage() {
  // URL params (search / filters / ordering / pagination)
  const [sp, setSp] = useSearchParams();
  const search = sp.get("search") || "";
  const ordering = sp.get("ordering") || "";
  const page = sp.get("page") || 1;
  const filters = {
    certificate: sp.get("certificate") || "",
    status: sp.get("status") || "",
  };

  // Store reads
  const {
    projects,
    projectsLoading,
    projectsError,
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
    fetchProjects: s.fetchProjects,
    createProject: s.createProject,
    updateProject: s.updateProject,
    deleteProject: s.deleteProject,
    certificates: s.certificates,
    certificatesLoading: s.certificatesLoading,
    certificatesError: s.certificatesError,
    fetchCertificates: s.fetchCertificates,
  }));

  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const formRef = useRef(null);

  // Load dropdown data + list on param changes
  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  useEffect(() => {
    fetchProjects({ search, ordering, filters, page });
  }, [fetchProjects, search, ordering, page, filters.certificate, filters.status]);

  // Map certificate id -> title
  const certTitleById = useMemo(() => {
    const m = new Map();
    for (const c of certificates) m.set(c.id, c.title);
    return m;
  }, [certificates]);

  // Scroll to create form
  useEffect(() => {
    if (showCreate && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showCreate]);

  // Helper to write params (and reset page)
  const writeParams = (patch) => {
    const next = new URLSearchParams(sp);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === "" || v == null) next.delete(k);
      else next.set(k, v);
    });
    next.delete("page");
    setSp(next);
  };

  // Create
  const handleCreate = async (payload) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      await createProject(payload);
      // Optionally: setShowCreate(false);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ??
        (typeof err?.response?.data === "object" ? JSON.stringify(err.response.data) : err?.response?.data) ??
        err?.message ??
        "Failed to create project";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Update
  const handleUpdate = async (id, patch) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      await updateProject(id, patch);
      setEditingId(null);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ??
        (typeof err?.response?.data === "object" ? JSON.stringify(err.response.data) : err?.response?.data) ??
        err?.message ??
        "Failed to update project";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete
  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    await deleteProject(confirmDeleteId);
    setConfirmDeleteId(null);
  };

  return (
    <div className="min-h-screen bg-background text-text p-6">
      <h1 className="font-heading text-2xl mb-4">Projects</h1>

      {/* Controls: Search / Filters / Sort */}
      <div className="grid gap-3 mb-4 max-w-xl">
        <SearchBar
          value={search}
          onChange={(v) => writeParams({ search: v })}
          placeholder="Search projects (title/description)…"
        />
        <Filters
          type="projects"
          value={filters}
          onChange={(f) =>
            writeParams({
              certificate: f.certificate || "",
              status: f.status || "",
            })
          }
          certificates={certificates}
          certificatesLoading={certificatesLoading}
        />
        <SortSelect
          value={ordering}
          options={projSortOptions}
          onChange={(v) => writeParams({ ordering: v || "" })}
        />
      </div>

      <div className="max-w-xl mb-6">
        {projectsLoading ? (
          <div className="opacity-80 text-sm">Loading projects…</div>
        ) : projectsError ? (
          <div className="text-accent text-sm">Error loading projects: {projectsError}</div>
        ) : projects.length === 0 ? (
          <div className="opacity-80 text-sm">No projects yet.</div>
        ) : (
          <ul className="space-y-2">
            {projects.map((p) => {
              const isEditing = editingId === p.id;
              const linkedTitle = p.certificate != null ? certTitleById.get(p.certificate) : null;

              return (
                <li key={p.id} className="p-3 rounded border border-gray-700 bg-background/70">
                  {!isEditing ? (
                    <>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold">{p.title}</div>
                          <div className="text-sm text-gray-300">{p.description}</div>
                          <div className="text-xs mt-1 opacity-80">Status: {p.status || "planned"}</div>
                          <div className="text-xs mt-1">
                            {linkedTitle ? `Linked to: ${linkedTitle}` : "Not linked"}
                            {" • "}
                            Created: {formatDateLong(p.date_created)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingId(p.id)}
                            className="px-3 py-1 rounded border border-gray-600 hover:bg-white/5"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(p.id)}
                            className="px-3 py-1 rounded bg-accent text-black font-semibold hover:bg-accent/80"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="mt-2">
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
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {certificatesError && <div className="text-accent mb-4">Certificates error: {certificatesError}</div>}

      <div className="max-w-xl">
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="bg-secondary rounded p-3 font-semibold hover:bg-secondary/80 transition"
        >
          {showCreate ? "Hide Add Project" : "Add Project"}
        </button>
      </div>

      {showCreate && (
        <div ref={formRef} className="mt-4 max-w-xl">
          <ProjectForm
            certificates={certificates}
            submitting={submitting}
            error={submitError}
            onCreate={handleCreate}
            submitLabel="Add Project"
          />
        </div>
      )}

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
