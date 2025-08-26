/* Docs: see docs/components/Projects.jsx.md */

import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "../store/useAppStore";

export default function Projects() {
  // Store reads
  const projects             = useAppStore((s) => s.projects);
  const projectsLoading      = useAppStore((s) => s.projectsLoading);
  const projectsError        = useAppStore((s) => s.projectsError);
  const fetchProjects        = useAppStore((s) => s.fetchProjects);
  const createProject        = useAppStore((s) => s.createProject);

  const certificates         = useAppStore((s) => s.certificates);
  const certificatesLoading  = useAppStore((s) => s.certificatesLoading);
  const certificatesError    = useAppStore((s) => s.certificatesError);
  const fetchCertificates    = useAppStore((s) => s.fetchCertificates);

  // Local form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    certificateId: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // On mount: ensure both dropdown (certs) and projects list are fresh
  useEffect(() => {
    // fetch certificates first (so dropdown has options), then projects
    // (order isn’t strictly required, but this feels nicer)
    fetchCertificates();
    fetchProjects();
  }, [fetchCertificates, fetchProjects]);

  // Map certificate id -> title for rendering project list
  const certTitleById = useMemo(() => {
    const m = new Map();
    for (const c of certificates) m.set(c.id ?? c.pk ?? c.uuid, c.title);
    return m;
  }, [certificates]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        certificateId: form.certificateId || null, // null = optional link
      };
      await createProject(payload);
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
          onChange={(e) =>
            setForm({ ...form, certificateId: e.target.value })
          }
          disabled={certificatesLoading}
        >
          <option value="">
            {certificatesLoading
              ? "Loading certificates…"
              : "(Optional) Link to a Certificate"}
          </option>
          {certificates.map((c) => (
            <option value={c.id} key={c.id}>
              {c.title}
            </option>
          ))}
        </select>

        {submitError && (
          <p className="text-sm text-accent -mt-2">{submitError}</p>
        )}

        <button
          disabled={submitting}
          className="bg-secondary rounded p-3 font-semibold hover:bg-secondary/80 transition disabled:opacity-60"
        >
          {submitting ? "Adding…" : "Add Project"}
        </button>
      </form>

      {/* Certificates list state (for dropdown) */}
      {certificatesError && (
        <div className="text-accent mb-2">
          Certificates error: {certificatesError}
        </div>
      )}

      {/* Projects list states */}
      <div className="max-w-xl">
        {projectsLoading ? (
          <div className="opacity-80 text-sm">Loading projects…</div>
        ) : projectsError ? (
          <div className="text-accent text-sm">
            Error loading projects: {projectsError}
          </div>
        ) : projects.length === 0 ? (
          <div className="opacity-80 text-sm">No projects yet.</div>
        ) : (
          <ul className="space-y-2">
            {projects.map((p) => {
              const linkedTitle =
                p.certificate != null
                  ? certTitleById.get(p.certificate) || "Linked certificate"
                  : null;
              return (
                <li
                  key={p.id || p.pk || p.uuid}
                  className="p-3 rounded border border-gray-700 bg-background/70"
                >
                  <div className="font-semibold">{p.title}</div>
                  <div className="text-sm text-gray-300">{p.description}</div>
                  <div className="text-xs mt-1">
                    {linkedTitle ? `Linked to: ${linkedTitle}` : "Not linked"}
                    {" • "}
                    Created: {p.created_at ?? "—"}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
