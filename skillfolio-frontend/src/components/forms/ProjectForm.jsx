/* Docs: see docs/components/ProjectForm.jsx.md */

import { useEffect, useId, useMemo, useState } from "react";

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

/**
 * ProjectForm
 * - Create mode: provide onCreate
 * - Edit mode: pass initial + onUpdate
 *
 * Props:
 *  - initial?: existing project to prefill (edit mode)
 *  - certificates: [{id,title}, ...] for dropdown
 *  - submitting: bool
 *  - error: string
 *  - onCreate?: (payload) => Promise
 *  - onUpdate?: (id, payload) => Promise
 *  - onCancel?: () => void
 *  - submitLabel?: string
 */
export default function ProjectForm({
  initial = null,
  certificates = [],
  submitting = false,
  error = "",
  onCreate = null,
  onUpdate = null,
  onCancel = null,
  submitLabel = "Add Project",
}) {
  const titleId = useId();
  const statusId = useId();
  const workId = useId();
  const durationId = useId();
  const goalId = useId();
  const challengesId = useId();
  const skillsId = useId();
  const outcomeId = useId();
  const improveId = useId();
  const certId = useId();
  const descId = useId();

  const [descDirty, setDescDirty] = useState(false);
  const [form, setForm] = useState({
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

  // Prefill edit
  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title ?? "",
        status: initial.status ?? "planned",
        work_type: initial.work_type ?? "",
        duration_text: initial.duration_text ?? "",
        primary_goal: initial.primary_goal ?? "",
        challenges_short: initial.challenges_short ?? "",
        skills_used: initial.skills_used ?? "",
        outcome_short: initial.outcome_short ?? "",
        skills_to_improve: initial.skills_to_improve ?? "",
        description: initial.description ?? "",
        certificateId: initial.certificate ?? "",
      });
      setDescDirty(true); // keep user’s existing description intact
    }
  }, [initial]);

  const preview = useMemo(() => buildPreview(form), [form]);

  // Auto-sync description until user edits
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

  const handleReset = () => {
    if (initial) {
      setForm({
        title: initial.title ?? "",
        status: initial.status ?? "planned",
        work_type: initial.work_type ?? "",
        duration_text: initial.duration_text ?? "",
        primary_goal: initial.primary_goal ?? "",
        challenges_short: initial.challenges_short ?? "",
        skills_used: initial.skills_used ?? "",
        outcome_short: initial.outcome_short ?? "",
        skills_to_improve: initial.skills_to_improve ?? "",
        description: initial.description ?? "",
        certificateId: initial.certificate ?? "",
      });
      setDescDirty(true);
    } else {
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: form.title.trim(),
      description: (form.description ?? "").trim(),
      certificateId: form.certificateId || null,
      status: form.status,
      work_type: form.work_type || null,
      duration_text: (form.duration_text ?? "").trim() || null,
      primary_goal: form.primary_goal || null,
      challenges_short: (form.challenges_short ?? "").trim() || null,
      skills_used: (form.skills_used ?? "").trim() || null,
      outcome_short: (form.outcome_short ?? "").trim() || null,
      skills_to_improve: (form.skills_to_improve ?? "").trim() || null,
    };

    if (initial && onUpdate) {
      await onUpdate(initial.id, payload);
    } else if (onCreate) {
      await onCreate(payload);
      // reset after create
      handleReset();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-1">
        <label htmlFor={titleId} className="text-sm opacity-80">Project title</label>
        <input
          id={titleId}
          className="rounded p-3 bg-background/60 border border-gray-700"
          placeholder="e.g., Portfolio website"
          value={form.title}
          onChange={(e) => onChange({ title: e.target.value })}
          required
        />
      </div>

      <div className="grid gap-1">
        <label htmlFor={statusId} className="text-sm opacity-80">Status</label>
        <select
          id={statusId}
          className="rounded p-3 bg-background/60 border border-gray-700"
          value={form.status}
          onChange={(e) => onChange({ status: e.target.value })}
        >
          <option value="planned">Planned</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="grid gap-1">
        <label htmlFor={workId} className="text-sm opacity-80">Work type (optional)</label>
        <select
          id={workId}
          className="rounded p-3 bg-background/60 border border-gray-700"
          value={form.work_type}
          onChange={(e) => onChange({ work_type: e.target.value })}
        >
          <option value="">—</option>
          <option value="individual">Individual</option>
          <option value="team">Team</option>
        </select>
      </div>

      <div className="grid gap-1">
        <label htmlFor={durationId} className="text-sm opacity-80">Duration (optional)</label>
        <input
          id={durationId}
          className="rounded p-3 bg-background/60 border border-gray-700"
          placeholder='e.g., "3 weeks"'
          value={form.duration_text}
          onChange={(e) => onChange({ duration_text: e.target.value })}
        />
      </div>

      <div className="grid gap-1">
        <label htmlFor={goalId} className="text-sm opacity-80">Primary goal (optional)</label>
        <select
          id={goalId}
          className="rounded p-3 bg-background/60 border border-gray-700"
          value={form.primary_goal}
          onChange={(e) => onChange({ primary_goal: e.target.value })}
        >
          <option value="">—</option>
          <option value="practice_skill">{GOAL_LABEL.practice_skill}</option>
          <option value="deliver_feature">{GOAL_LABEL.deliver_feature}</option>
          <option value="build_demo">{GOAL_LABEL.build_demo}</option>
          <option value="solve_problem">{GOAL_LABEL.solve_problem}</option>
        </select>
      </div>

      <div className="grid gap-1">
        <label htmlFor={challengesId} className="text-sm opacity-80">Challenges (short)</label>
        <textarea
          id={challengesId}
          className="rounded p-3 bg-background/60 border border-gray-700"
          rows="2"
          placeholder="What was tricky?"
          value={form.challenges_short}
          onChange={(e) => onChange({ challenges_short: e.target.value })}
        />
      </div>

      <div className="grid gap-1">
        <label htmlFor={skillsId} className="text-sm opacity-80">Skills/Tools</label>
        <input
          id={skillsId}
          className="rounded p-3 bg-background/60 border border-gray-700"
          placeholder="Comma-separated"
          value={form.skills_used}
          onChange={(e) => onChange({ skills_used: e.target.value })}
        />
      </div>

      <div className="grid gap-1">
        <label htmlFor={outcomeId} className="text-sm opacity-80">Outcome / impact</label>
        <textarea
          id={outcomeId}
          className="rounded p-3 bg-background/60 border border-gray-700"
          rows="2"
          placeholder="What happened as a result?"
          value={form.outcome_short}
          onChange={(e) => onChange({ outcome_short: e.target.value })}
        />
      </div>

      <div className="grid gap-1">
        <label htmlFor={improveId} className="text-sm opacity-80">Skills to improve</label>
        <input
          id={improveId}
          className="rounded p-3 bg-background/60 border border-gray-700"
          placeholder="Comma-separated"
          value={form.skills_to_improve}
          onChange={(e) => onChange({ skills_to_improve: e.target.value })}
        />
      </div>

      <div className="grid gap-1">
        <label htmlFor={certId} className="text-sm opacity-80">(Optional) Link to a certificate</label>
        <select
          id={certId}
          className="rounded p-3 bg-background/60 border border-gray-700"
          value={form.certificateId}
          onChange={(e) => onChange({ certificateId: e.target.value })}
        >
          <option value="">—</option>
          {certificates.map((c) => (
            <option value={c.id} key={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-1">
        <label htmlFor={descId} className="text-sm opacity-80">Description</label>
        <textarea
          id={descId}
          className="rounded p-3 bg-background/60 border border-gray-700"
          rows="4"
          value={form.description}
          onChange={onDescriptionChange}
          placeholder="Auto-generated preview will appear; you can edit."
        />
      </div>

      {error && <p className="text-sm text-accent">{error}</p>}

      <div className="flex items-center gap-2">
        <button
          disabled={submitting || !form.title.trim()}
          className="bg-secondary rounded p-3 font-semibold hover:bg-secondary/80 transition disabled:opacity-60"
        >
          {submitting ? "Saving…" : submitLabel}
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="px-3 py-2 rounded border border-gray-600 hover:bg-white/5"
        >
          Reset
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 rounded border border-gray-600 hover:bg-white/5"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
