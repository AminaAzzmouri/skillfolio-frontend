/* Docs: see docs/components/Projects.jsx.md */

import { useEffect, useMemo, useRef, useState } from "react";
import { useAppStore } from "../store/useAppStore";

const GOAL_LABEL = {
  practice_skill: "Practice a new skill",
  deliver_feature: "Deliver a feature",
  build_demo: "Build a demo",
  solve_problem: "Solve a real problem",
};

function buildPreview({
  title,
  work_type,
  duration_text,
  primary_goal,
  challenges_short,
  skills_used,
  outcome_short,
  skills_to_improve,
}) {
  const role =
    work_type === "team" ? "Team project" : work_type === "individual" ? "Individual project" : "Project";
  const goalPhrase = GOAL_LABEL[primary_goal] || "N/A";
  const dur = duration_text || "N/A";

  const bits = [];
  bits.push(`${title || "Untitled"} — ${role} (~${dur}).`);
  bits.push(`Goal: ${goalPhrase}.`);
  bits.push(`Challenges: ${challenges_short?.trim() || "N/A"}.`);
  bits.push(`Skills/Tools: ${skills_used?.trim() || "N/A"}.`);
  bits.push(`Outcome: ${outcome_short?.trim() || "N/A"}.`);
  bits.push(`Next focus: ${skills_to_improve?.trim() || "N/A"}.`);
  return bits.join(" ");
}

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

  // Show/hide form toggle
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);

  // Local form state
  const [form, setForm] = useState({
     title: "",
     status: "planned",          // NEW: 'planned' | 'in_progress' | 'completed'
     // guided fields
     work_type: "",
     duration_text: "",
     primary_goal: "",
     challenges_short: "",
     skills_used: "",
     outcome_short: "",
     skills_to_improve: "",
     // description (editable)
     description: "",
     // linking
     certificateId: "",
   });

  // track if user manually edited description (to stop auto-syncing)
  const [descDirty, setDescDirty] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // On mount: load certs then projects
  useEffect(() => {
    fetchCertificates();
    fetchProjects();
  }, [fetchCertificates, fetchProjects]);

  // Map certificate id -> title for rendering project list
  const certTitleById = useMemo(() => {
    const m = new Map();
    for (const c of certificates) m.set(c.id ?? c.pk ?? c.uuid, c.title);
    return m;
  }, [certificates]);

  // Live preview text from guided fields
  const preview = useMemo(() => buildPreview(form), [form]);

  // Keep `description` synced with preview until the user edits it manually
  useEffect(() => {
    if (!descDirty) {
      setForm((f) => ({ ...f, description: preview }));
    }
  }, [preview, descDirty]);

  const onChange = (patch) => setForm((f) => ({ ...f, ...patch }));

  const onDescriptionChange = (e) => {
    setDescDirty(true);
    onChange({ description: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        certificateId: form.certificateId || null,
        status: form.status, // pass through to BE 
        work_type: form.work_type || null,
        duration_text: form.duration_text.trim() || null,
        primary_goal: form.primary_goal || null,
        challenges_short: form.challenges_short.trim() || null,
        skills_used: form.skills_used.trim() || null,
        outcome_short: form.outcome_short.trim() || null,
        skills_to_improve: form.skills_to_improve.trim() || null,
      };

      await createProject(payload);

      // reset
      setForm({
        title: "",
        status: "planned",
        work_type: "",
        duration_text: "",
        primary_goal: "",
        challenges_short: "",
        skills_used: "",
        outcome_short: "",
        skills_to_improve: "",
        description: "",
        certificateId: "",
      });
      setDescDirty(false);
      // Optional: hide form after successful add
      // setShowForm(false);
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

  // When opening the form, scroll to it for nice UX
  useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showForm]);

  return (
    <div className="min-h-screen bg-background text-text p-6">
      <h1 className="font-heading text-2xl mb-4">Projects</h1>

      {/* Projects list FIRST */}
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
              const linkedTitle =
                p.certificate != null ? certTitleById.get(p.certificate) || "Linked certificate" : null;
              return (
                <li
                  key={p.id || p.pk || p.uuid}
                  className="p-3 rounded border border-gray-700 bg-background/70"
                >
                  <div className="font-semibold">{p.title}</div>
                  <div className="text-sm text-gray-300">{p.description}</div>
                  <div className="text-xs mt-1 opacity-80">Status: {p.status || "planned"}</div>
                  <div className="text-xs mt-1">
                    {linkedTitle ? `Linked to: ${linkedTitle}` : "Not linked"}
                    {" • "}
                    Created: {p.date_created ?? "—"}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Certificates list state (for dropdown) */}
      {certificatesError && (
        <div className="text-accent mb-4">Certificates error: {certificatesError}</div>
      )}

      {/* Toggle button at the bottom */}
      <div className="max-w-xl">
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-secondary rounded p-3 font-semibold hover:bg-secondary/80 transition"
        >
          {showForm ? "Hide Add Project" : "Add Project"}
        </button>
      </div>

      {/* Form (hidden until toggled) */}
      {showForm && (
        <form
          ref={formRef}
          onSubmit={onSubmit}
          className="mt-4 bg-background/80 border border-gray-700 p-4 rounded max-w-xl grid gap-4"
        >
          <input
            className="rounded p-3 bg-background/60 border border-gray-700"
            placeholder="Project Title"
            value={form.title}
            onChange={(e) => onChange({ title: e.target.value })}
            required
          />
          <select
            className="rounded p-3 bg-background/60 border border-gray-700"
            value={form.status}
            onChange={(e) => onChange({ status: e.target.value })}
          >
            <option value="planned">Planned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          {/* Guided inputs */}
          <select
            className="rounded p-3 bg-background/60 border border-gray-700"
            value={form.work_type}
            onChange={(e) => onChange({ work_type: e.target.value })}
          >
            <option value="">Work Type (optional)</option>
            <option value="individual">Individual</option>
            <option value="team">Team</option>
          </select>

          <input
            className="rounded p-3 bg-background/60 border border-gray-700"
            placeholder='Duration (e.g., "3 weeks")'
            value={form.duration_text}
            onChange={(e) => onChange({ duration_text: e.target.value })}
          />

          <select
            className="rounded p-3 bg-background/60 border border-gray-700"
            value={form.primary_goal}
            onChange={(e) => onChange({ primary_goal: e.target.value })}
          >
            <option value="">Primary Goal (optional)</option>
            <option value="practice_skill">{GOAL_LABEL.practice_skill}</option>
            <option value="deliver_feature">{GOAL_LABEL.deliver_feature}</option>
            <option value="build_demo">{GOAL_LABEL.build_demo}</option>
            <option value="solve_problem">{GOAL_LABEL.solve_problem}</option>
          </select>

          <textarea
            className="rounded p-3 bg-background/60 border border-gray-700"
            rows="2"
            placeholder="Challenges faced (short)"
            value={form.challenges_short}
            onChange={(e) => onChange({ challenges_short: e.target.value })}
          />

          <input
            className="rounded p-3 bg-background/60 border border-gray-700"
            placeholder="Skills/Tools (comma-separated)"
            value={form.skills_used}
            onChange={(e) => onChange({ skills_used: e.target.value })}
          />

          <textarea
            className="rounded p-3 bg-background/60 border border-gray-700"
            rows="2"
            placeholder="Outcome / impact (short)"
            value={form.outcome_short}
            onChange={(e) => onChange({ outcome_short: e.target.value })}
          />

          <input
            className="rounded p-3 bg-background/60 border border-gray-700"
            placeholder="Skills to practice more (comma-separated)"
            value={form.skills_to_improve}
            onChange={(e) => onChange({ skills_to_improve: e.target.value })}
          />

          {/* Certificate link */}
          <select
            className="rounded p-3 bg-background/60 border border-gray-700"
            value={form.certificateId}
            onChange={(e) => onChange({ certificateId: e.target.value })}
            disabled={certificatesLoading}
          >
            <option value="">
              {certificatesLoading ? "Loading certificates…" : "(Optional) Link to a Certificate"}
            </option>
            {certificates.map((c) => (
              <option value={c.id} key={c.id}>
                {c.title}
              </option>
            ))}
          </select>

          {/* Live preview (editable) */}
          <label className="text-sm opacity-80">
            Auto-generated description (you can edit):
          </label>
          <textarea
            className="rounded p-3 bg-background/60 border border-gray-700"
            rows="4"
            value={form.description}
            onChange={onDescriptionChange}
            placeholder="Auto preview will appear here…"
          />

          {submitError && <p className="text-sm text-accent -mt-2">{submitError}</p>}

          <button
            disabled={submitting || !form.title.trim()}
            className="bg-secondary rounded p-3 font-semibold hover:bg-secondary/80 transition disabled:opacity-60"
          >
            {submitting ? "Adding…" : "Add Project"}
          </button>
        </form>
      )}
    </div>
  );
}
