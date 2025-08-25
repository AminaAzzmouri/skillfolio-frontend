/* Docs: see docs/components/Projects.jsx.md */

import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "../store/useAppStore";

export default function Projects() {
  const {
    // lists
    certificates,
    certificatesLoading,
    certificatesError,
    fetchCertificates,

    projects,
    projectsLoading,
    projectsError,
    fetchProjects,
    createProject,
  } = useAppStore((s) => ({
    certificates: s.certificates,
    certificatesLoading: s.certificatesLoading,
    certificatesError: s.certificatesError,
    fetchCertificates: s.fetchCertificates,

    projects: s.projects,
    projectsLoading: s.projectsLoading,
    projectsError: s.projectsError,
    fetchProjects: s.fetchProjects,
    createProject: s.createProject,
  }));

  const [form, setForm] = useState({ title: "", description: "", certificateId: "" });
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // load lists on first render
  useEffect(() => {
    fetchCertificates();
    fetchProjects();
  }, [fetchCertificates, fetchProjects]);

  // helper: map cert id -> title
  const certTitleById = useMemo(() => {
    const map = new Map();
    certificates.forEach((c) => map.set(String(c.id), c.title));
    return map;
  }, [certificates]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitting(true);
    try {
      await createProject({
        title: form.title,
        description: form.description,
        certificateId: form.certificateId ? Number(form.certificateId) : null,
      });
      setForm({ title: "", description: "", certificateId: "" });
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

  return (
    <div className="min-h-screen bg-background text-text p-6">
      <h1 className="font-heading text-2xl mb-4">Projects</h1>

      {/* Create form */}
      <form
        onSubmit={onSubmit}
        className="bg-background/80 border border-gray-700 p-4 rounded mb-6 max-w-xl grid gap-4"
      >
        <input
          className="rounded p-3 bg-background/60 border border-gray-700"
          placeholder="Project Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />

        <textarea
          className="rounded p-3 bg-background/60 border border-gray-700"
          rows="4"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />

        <select
          className="rounded p-3 bg-background/60 border border-gray-700"
          value={form.certificateId}
          onChange={(e) => setForm({ ...form, certificateId: e.target.value })}
        >
          <option value="">(Optional) Link to a Certificate</option>
          {certificates.map((c) => (
            <option value={c.id} key={c.id}>
              {c.title}
            </option>
          ))}
        </select>

        {submitError && <p className="text-sm text-accent">{submitError}</p>}

        <button
          className="bg-secondary rounded p-3 font-semibold hover:bg-secondary/80 transition disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? "Adding…" : "Add Project"}
        </button>
      </form>

      {/* Lists state */}
      {projectsLoading && <p className="max-w-xl text-sm opacity-80">Loading projects…</p>}
      {projectsError && <p className="max-w-xl text-sm text-accent">{projectsError}</p>}
      {!projectsLoading && !projectsError && projects.length === 0 && (
        <p className="max-w-xl text-sm opacity-80">No projects yet—add your first above.</p>
      )}

      {/* Projects list */}
      <ul className="space-y-2 max-w-xl">
        {projects.map((p) => {
          const certTitle =
            p.certificate != null
              ? certTitleById.get(String(p.certificate)) || `Certificate #${p.certificate}`
              : null;

        return (
            <li key={p.id} className="p-3 rounded border border-gray-700 bg-background/70">
              <div className="font-semibold">{p.title}</div>
              <div className="text-sm text-gray-300">{p.description}</div>
              <div className="text-xs mt-1">
                {certTitle ? `Linked to: ${certTitle}` : "Not linked"}
                {p.date_created ? ` • Created: ${new Date(p.date_created).toLocaleDateString()}` : null}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Certificates list state (for the dropdown) */}
      <div className="max-w-xl mt-8 text-xs opacity-70">
        {certificatesLoading && <p>Loading certificates…</p>}
        {certificatesError && <p className="text-accent">{certificatesError}</p>}
      </div>
    </div>
  );
}
