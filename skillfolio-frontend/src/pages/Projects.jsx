import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import SearchBar from "../components/SearchBar";
import Filters from "../components/Filters";
import SortSelect from "../components/SortSelect";
import Pagination from "../components/Pagination";
import ProjectForm from "../components/forms/ProjectForm";
import ConfirmDialog from "../components/ConfirmDialog";
import Modal from "../components/Modal";

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

  // Accept BOTH ?certificate= and ?certificateId=
  const effectiveCertificate = sp.get("certificate") || sp.get("certificateId") || "";

  const filters = {
    certificate: effectiveCertificate,
    status: sp.get("status") || "",
  };

  // Store reads
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

  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const formRef = useRef(null);

  // Load dropdown data (for id->title mapping)
  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  // Fetch list when query params change
  useEffect(() => {
    fetchProjects({ search, ordering, filters, page });
  }, [fetchProjects, search, ordering, page, filters.certificate, filters.status]);

  // Map certificate id -> title
  const certTitleById = useMemo(() => {
    const m = new Map();
    for (const c of certificates) m.set(c.id, c.title);
    return m;
  }, [certificates]);

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

  // Clear cert filter (remove BOTH keys)
  const clearCertFilter = () => {
    const next = new URLSearchParams(sp);
    next.delete("certificate");
    next.delete("certificateId");
    next.delete("page");
    setSp(next);
  };

  // Create / Update / Delete
  const handleCreate = async (payload) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      await createProject(payload);
      setShowCreate(false);
    } catch (err) {
      const msg =
        err?.response?.data?.detail ??
        (typeof err?.response?.data === "object" ? JSON.stringify(err.response.data) : err?.response?.data) ??
        err?.message ?? "Failed to create project";
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
        (typeof err?.response?.data === "object" ? JSON.stringify(err.response.data) : err?.response?.data) ??
        err?.message ?? "Failed to update project";
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

  const activeCertTitle = effectiveCertificate ? certTitleById.get(Number(effectiveCertificate)) : null;

  return (
    <div className="min-h-screen bg-background text-text p-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-heading text-2xl">Projects</h1>
        <Link to="/dashboard" className="text-sm underline opacity-90 hover:opacity-100">← Back to dashboard</Link>
      </div>

      {/* Active certificate filter chip (if any) */}
      {effectiveCertificate && (
        <div className="mb-3 text-sm">
          <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full border border-gray-600">
            <span className="opacity-90">
              Filtered by certificate: <strong>{activeCertTitle ?? `#${effectiveCertificate}`}</strong>
            </span>
            <button className="underline hover:opacity-80" onClick={clearCertFilter}>
              Clear filter
            </button>
          </span>
        </div>
      )}

      {/* Controls */}
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

      {/* GRID */}
      <div className="mb-6">
        {projectsLoading ? (
          <div className="opacity-80 text-sm">Loading projects…</div>
        ) : projectsError ? (
          <div className="text-accent text-sm">Error loading projects: {projectsError}</div>
        ) : projects.length === 0 ? (
          <div className="opacity-80 text-sm">No projects yet.</div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => {
              const isEditing = editingId === p.id;
              const linkedTitle = p.certificate != null ? certTitleById.get(p.certificate) : null;

              return (
                <li key={p.id} className="rounded border border-gray-700 bg-background/70 overflow-hidden">
                  {!isEditing ? (
                    <>
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold">{p.title}</div>
                            <div className="text-sm text-gray-300">{p.description}</div>
                            <div className="text-xs mt-1 opacity-80">Status: {p.status || "planned"}</div>
                            <div className="text-xs mt-1">
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
                      </div>

                      {/* Bottom bar: linked cert + optional link */}
                      <div className="flex items-center justify-between gap-2 px-3 py-2 border-t border-gray-700">
                        <div className="text-sm opacity-90">
                          {p.certificate != null
                            ? `Linked to: ${linkedTitle ?? `#${p.certificate}`}`
                            : "Not linked"}
                        </div>
                        {p.certificate != null && (
                          <Link
                            to={`/certificates?id=${p.certificate}`}
                            className="text-sm underline hover:opacity-80"
                          >
                            View certificate
                          </Link>
                        )}
                      </div>
                    </>
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
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {certificatesError && <div className="text-accent mb-4">Certificates error: {certificatesError}</div>}

      <div className="max-w-xl">
        <button
          onClick={() => setShowCreate(true)}
          className="bg-secondary rounded p-3 font-semibold hover:bg-secondary/80 transition"
        >
          Add Project
        </button>
      </div>

      {/* Create in Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add Project">
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
