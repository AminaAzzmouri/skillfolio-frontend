/* Docs: see docs/components/ProjectForm.jsx.md */

import { useEffect, useId, useMemo, useState } from "react";
import FormShell from "./FormShell";
import Field from "./Field";
import { TextInput, NumberInput, DateInput, Select, TextArea } from "./Inputs";

/* ---------- helpers ---------- */
const GOAL_LABEL = {
  practice_skill: "Practice a new skill",
  deliver_feature: "Deliver a feature",
  build_demo: "Build a demo",
  solve_problem: "Solve a real problem",
};

// Always return YYYY-MM-DD (or "")
const toISO = (v) => {
  if (!v) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};

const todayISO = () => {
  const d = new Date();
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};
const addDaysISO = (iso, n) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map((x) => parseInt(x, 10));
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  const z = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};

// small helpers
const nonEmpty = (s) => !!(s && String(s).trim());
const roleFrom = (work_type) =>
  work_type === "team" ? "team" : work_type === "individual" ? "individual" : null;

// backend-like duration guess (days/weeks/months/years)
const durationFromDates = (startISO, endISO) => {
  if (!startISO || !endISO) return null;
  const sd = new Date(startISO);
  const ed = new Date(endISO);
  const days = Math.floor((ed - sd) / (24 * 3600 * 1000));
  if (isNaN(days) || days <= 0) return null;
  if (days < 14) return `${days} ${days === 1 ? "day" : "days"}`;
  if (days < 60) {
    const w = Math.round(days / 7) || 1;
    return `${w} ${w === 1 ? "week" : "weeks"}`;
  }
  if (days < 365) {
    const mo = Math.round(days / 30) || 1;
    return `${mo} ${mo === 1 ? "month" : "months"}`;
  }
  const y = Math.round(days / 365) || 1;
  return `${y} ${y === 1 ? "year" : "years"}`;
};

/* ---------- description generator ---------- */
function buildDescription(form) {
  const {
    title,
    status,
    work_type,
    start_date,
    end_date,
    primary_goal,
    problem_solved,
    challenges_short,
    tools_used,
    skills_used,
    skills_to_improve,
  } = form;

  const t = nonEmpty(title) ? title.trim() : "This project";
  const role = roleFrom(work_type); // "individual" | "team" | null
  const goalPhrase = GOAL_LABEL[primary_goal] || null;
  const dur = status === "completed" ? durationFromDates(start_date, end_date) : null;

  const bits = [];

  if (status === "completed") {
    if (role && dur) bits.push(`${t} was a ${role} project completed in ${dur}.`);
    else if (role) bits.push(`${t} was a ${role} project.`);
    else if (dur) bits.push(`${t} was completed in ${dur}.`);
    else bits.push(`${t} was completed.`);
    if (goalPhrase) bits.push(`The main goal was to ${goalPhrase.toLowerCase()}.`);
  } else if (status === "in_progress") {
    const since = start_date ? ` since ${start_date}` : "";
    if (role) bits.push(`${t} is a ${role} project${since}.`);
    else bits.push(`${t} is a project${since}.`);
    if (goalPhrase) bits.push(`The main goal is to ${goalPhrase.toLowerCase()}.`);
  } else {
    if (role && start_date) bits.push(`${t} is a planned ${role} project starting on ${start_date}.`);
    else if (role) bits.push(`${t} is a planned ${role} project.`);
    else if (start_date) bits.push(`${t} is planned to start on ${start_date}.`);
    else bits.push(`${t} is a planned project.`);
    if (goalPhrase) bits.push(`The main goal is to ${goalPhrase.toLowerCase()}.`);
  }

  if (status === "in_progress" && nonEmpty(problem_solved)) {
    bits.push(`So far it addresses: ${problem_solved.trim()}.`);
  } else if (status === "planned" && nonEmpty(problem_solved)) {
    bits.push(`It aims to address: ${problem_solved.trim()}.`);
  } else if (nonEmpty(problem_solved)) {
    bits.push(`It addressed: ${problem_solved.trim()}.`);
  }

  if (status === "in_progress" && nonEmpty(challenges_short)) {
    bits.push(`Challenges encountered so far: ${challenges_short.trim()}.`);
  } else if (status === "planned" && nonEmpty(challenges_short)) {
    bits.push(`Potential challenges: ${challenges_short.trim()}.`);
  } else if (nonEmpty(challenges_short)) {
    bits.push(`Challenges encountered: ${challenges_short.trim()}.`);
  }

  const used = [];
  if (nonEmpty(tools_used)) used.push(tools_used.trim());
  if (nonEmpty(skills_used) && skills_used.trim() !== (tools_used || "").trim()) used.push(skills_used.trim());
  if (used.length) {
    if (status === "in_progress") bits.push(`Key skills/tools practiced so far: ${used.join(", ")}.`);
    else if (status === "planned") bits.push(`Planned tools/skills: ${used.join(", ")}.`);
    else bits.push(`Key tools/skills: ${used.join(", ")}.`);
  }

  if (nonEmpty(skills_to_improve)) {
    const nextPhrase =
      status === "in_progress" ? "Next I’ll improve" : status === "planned" ? "I plan to improve" : "Next, I plan to improve";
    bits.push(`${nextPhrase}: ${skills_to_improve.trim()}.`);
  }

  return bits.join(" ").trim();
}

/* ---------- snapshots for dirty detection ---------- */
const snapshotOf = (f, opts = {}) => {
  const includeDescription = !!opts.includeDescription;
  const pick = {
    title: (f.title ?? "").trim(),
    status: f.status ?? "planned",
    start_date: toISO(f.start_date ?? ""),
    end_date: toISO(f.end_date ?? ""),
    work_type: f.work_type ?? "",
    primary_goal: f.primary_goal ?? "",
    certificateId: f.certificateId ?? "",
    problem_solved: (f.problem_solved ?? "").trim(),
    tools_used: (f.tools_used ?? "").trim(),
    skills_used: (f.skills_used ?? "").trim(),
    challenges_short: (f.challenges_short ?? "").trim(),
    skills_to_improve: (f.skills_to_improve ?? "").trim(),
    ...(includeDescription ? { description: (f.description ?? "").trim() } : {}),
  };
  return JSON.stringify(pick);
};

/* ---------- component ---------- */
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
  const startId = useId();
  const endId = useId();
  const workId = useId();
  const durationId = useId();
  const goalId = useId();
  const certId = useId();
  const probId = useId();
  const toolsId = useId();
  const skillsId = useId();
  const challId = useId();
  const improveId = useId();
  const descId = useId();

  const [descDirty, setDescDirty] = useState(false);
  const [userTouched, setUserTouched] = useState(false);
  const [baseline, setBaseline] = useState(null);

  const [form, setForm] = useState({
    title: "",
    status: "planned",
    start_date: "",
    end_date: "",
    work_type: "",
    duration_text: "",
    primary_goal: "",
    certificateId: "",
    problem_solved: "",
    tools_used: "",
    skills_used: "",
    challenges_short: "",
    skills_to_improve: "",
    outcome_short: "",
    description: "",
  });

  // Prefill + baseline
  useEffect(() => {
    if (initial) {
      const next = {
        title: initial.title ?? "",
        status: initial.status ?? "planned",
        start_date: toISO(initial.start_date ?? ""),
        end_date: toISO(initial.end_date ?? ""),
        work_type: initial.work_type ?? "",
        duration_text: initial.duration_text ?? "",
        primary_goal: initial.primary_goal ?? "",
        certificateId: initial.certificate ?? "",
        problem_solved: initial.problem_solved ?? "",
        tools_used: initial.tools_used ?? "",
        skills_used: initial.skills_used ?? "",
        challenges_short: initial.challenges_short ?? "",
        skills_to_improve: initial.skills_to_improve ?? "",
        outcome_short: initial.outcome_short ?? "",
        description: initial.description ?? "",
      };
      setForm(next);
      setBaseline(next);
      setDescDirty(false);
      setUserTouched(false);
    } else {
      const empty = {
        title: "",
        status: "planned",
        start_date: "",
        end_date: "",
        work_type: "",
        duration_text: "",
        primary_goal: "",
        certificateId: "",
        problem_solved: "",
        tools_used: "",
        skills_used: "",
        challenges_short: "",
        skills_to_improve: "",
        outcome_short: "",
        description: "",
      };
      setForm(empty);
      setBaseline(empty);
      setDescDirty(false);
      setUserTouched(false);
    }
  }, [initial]);

  // Auto-sync description until user edits
  const preview = useMemo(() => buildDescription(form), [form]);
  useEffect(() => {
    if (!descDirty) setForm((f) => ({ ...f, description: preview }));
  }, [preview, descDirty]);

  // mark touched only when real change happens
  const onChange = (patch) =>
    setForm((prev) => {
      const next = { ...prev, ...patch };
      const changed = Object.keys(patch).some((k) => String(prev[k] ?? "") !== String(next[k] ?? ""));
      if (changed) setUserTouched(true);
      return next;
    });

  const onDescriptionChange = (e) => {
    setDescDirty(true);
    onChange({ description: e.target.value });
  };

  // lock start date in EDIT mode
  const isEdit = !!initial && !!onUpdate;

  useEffect(() => {
    if (form.status !== "completed" && form.end_date) {
      setForm((f) => ({ ...f, end_date: "" }));
      setUserTouched(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.status]);

  // Date handlers
  const onStartChange = (e) => onChange({ start_date: toISO(e.target.value) });
  const onEndChange = (e) => onChange({ end_date: toISO(e.target.value) });

  // Dirty detection vs BASELINE
  const baselineSnapshot = snapshotOf(baseline || {}, { includeDescription: false });
  const currentSnapshot = snapshotOf(form, { includeDescription: descDirty });
  const isDirty = !isEdit || baselineSnapshot !== currentSnapshot;

  const handleReset = () => {
    if (!userTouched) return;
    if (baseline) setForm(baseline);
    setDescDirty(false);
    setUserTouched(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: form.title.trim(),
      description: (form.description ?? "").trim(),
      certificateId: form.certificateId || null,
      status: form.status,
      work_type: form.work_type || null,
      primary_goal: form.primary_goal || null,
      problem_solved: (form.problem_solved ?? "").trim(),
      tools_used: (form.tools_used ?? "").trim(),
      skills_used: (form.skills_used ?? "").trim(),
      challenges_short: (form.challenges_short ?? "").trim(),
      skills_to_improve: (form.skills_to_improve ?? "").trim(),
      start_date: toISO(form.start_date),
      end_date: form.status === "completed" ? toISO(form.end_date) : undefined,
    };

    if (initial && onUpdate) {
      await onUpdate(initial.id, payload);
      setBaseline((prev) => ({ ...(prev || {}), ...form }));
      setUserTouched(false);
      setDescDirty(false);
    } else if (onCreate) {
      await onCreate(payload);
      handleReset();
    }
  };

  // Visibility sets
  const isPlanned = form.status === "planned";
  const isInProgress = form.status === "in_progress";
  const isCompleted = form.status === "completed";

  // min/max for native calendar greying
  const today = todayISO();
  const startMin = isPlanned ? today : undefined;
  const startMax = isCompleted ? addDaysISO(today, -1) : isInProgress ? today : undefined;
  const endMin = form.start_date ? addDaysISO(form.start_date, 1) : undefined;
  const endMax = today;

  // Dynamic labels
  const L = isPlanned
    ? {
        tools: "Tools to be used",
        skills: "Possible skills to be practiced",
        challenges: "Potential challenges to be encountered",
        improve: "Possible skills to improve",
        problem: "Problem to solve (optional)",
      }
    : isInProgress
    ? {
        tools: "Tools used so far",
        skills: "Skills practiced so far",
        challenges: "Challenges encountered so far",
        improve: "Skills to improve",
        problem: "Problem solved so far",
      }
    : {
        tools: "Tools used",
        skills: "Skills practiced",
        challenges: "Challenges encountered",
        improve: "Skills to improve in the future",
        problem: "Problem solved",
      };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      {error ? (
        <div className="rounded border p-3 text-sm border-red-900 bg-red-950/30 text-red-200">
          {error}
        </div>
      ) : null}

      <FormShell title={isEdit ? "Edit project" : "New project"}>
        {/* Title */}
        <Field label="Project title" htmlFor={titleId}>
          <TextInput
            id={titleId}
            placeholder="e.g., Portfolio website"
            value={form.title}
            onChange={(e) => onChange({ title: e.target.value })}
            required
          />
        </Field>

        {/* Status */}
        <Field
          label="Status"
          htmlFor={statusId}
          note={
            isEdit
              ? "After creation, projects can only move between “In Progress” and “Completed”. If it was created as “Planned”, that state is shown but locked."
              : undefined
          }
        >
          <Select
            id={statusId}
            value={form.status}
            onChange={(e) => onChange({ status: e.target.value })}
          >
            {isEdit ? (
              initial?.status === "planned" ? (
                <>
                  <option value="planned" disabled>
                    Planned (locked)
                  </option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </>
              ) : (
                <>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </>
              )
            ) : (
              <>
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </>
            )}
          </Select>
        </Field>

        {/* Start date */}
        <Field
          label="Start date"
          htmlFor={startId}
          note={
            isPlanned ? "Must be today or future." : isCompleted ? "Must be before today." : "Must be today or past."
          }
        >
          <DateInput
            id={startId}
            value={form.start_date}
            onChange={onStartChange}
            min={startMin}
            max={startMax}
            required
            disabled={isEdit}
            title={isEdit ? "Start date is locked after the project is created" : undefined}
          />
        </Field>

        {/* End date (completed only) */}
        {isCompleted && (
          <Field label="End date" htmlFor={endId} note="Must be after Start date and not in the future.">
            <DateInput
              id={endId}
              value={form.end_date}
              onChange={onEndChange}
              min={endMin}
              max={endMax}
              required
            />
          </Field>
        )}

        {/* Duration (auto) */}
        <Field label="Duration (auto)" htmlFor={durationId}>
          <TextInput
            id={durationId}
            value={isCompleted && form.start_date && form.end_date ? durationFromDates(form.start_date, form.end_date) || "—" : "—"}
            readOnly
            className="w-full"
          />
        </Field>

        {/* Work type */}
        <Field label="Work type (optional)" htmlFor={workId}>
          <Select
            id={workId}
            value={form.work_type}
            onChange={(e) => onChange({ work_type: e.target.value })}
          >
            <option value="">—</option>
            <option value="individual">Individual</option>
            <option value="team">Team</option>
          </Select>
        </Field>

        {/* Linked certificate */}
        <Field label="Link to a certificate (optional)" htmlFor={certId}>
          <Select
            id={certId}
            value={form.certificateId}
            onChange={(e) => onChange({ certificateId: e.target.value })}
          >
            <option value="">—</option>
            {certificates.map((c) => (
              <option value={c.id} key={c.id}>
                {c.title}
              </option>
            ))}
          </Select>
        </Field>

        {/* Primary goal */}
        <Field label="Primary goal (optional)" htmlFor={goalId}>
          <Select
            id={goalId}
            className="w-full rounded p-3 bg-background/60 ring-1 ring-border/60 focus:outline-none focus:ring-2 focus:ring-primary/40"
            value={form.primary_goal}
            onChange={(e) => onChange({ primary_goal: e.target.value })}
          >
            <option value="">—</option>
            <option value="practice_skill">{GOAL_LABEL.practice_skill}</option>
            <option value="deliver_feature">{GOAL_LABEL.deliver_feature}</option>
            <option value="build_demo">{GOAL_LABEL.build_demo}</option>
            <option value="solve_problem">{GOAL_LABEL.solve_problem}</option>
          </Select>
        </Field>

        {/* Shared fields */}
        <Field label={L.problem} htmlFor={probId}>
          <TextArea
            id={probId}
            rows={2}
            value={form.problem_solved}
            onChange={(e) => onChange({ problem_solved: e.target.value })}
            className="min-h-[5.5rem]"
          />
        </Field>

        <Field label={L.tools} htmlFor={toolsId}>
          <TextInput
            id={toolsId}
            placeholder="Comma-separated"
            value={form.tools_used}
            onChange={(e) => onChange({ tools_used: e.target.value })}
          />
        </Field>

        <Field label={L.skills} htmlFor={skillsId}>
          <TextInput
            id={skillsId}
            placeholder="Comma-separated"
            value={form.skills_used}
            onChange={(e) => onChange({ skills_used: e.target.value })}
          />
        </Field>

        <Field label={L.challenges} htmlFor={challId}>
          <TextArea
            id={challId}
            rows={2}
            value={form.challenges_short}
            onChange={(e) => onChange({ challenges_short: e.target.value })}
            className="min-h-[5.5rem]"
          />
        </Field>

        <Field label={L.improve} htmlFor={improveId}>
          <TextInput
            id={improveId}
            placeholder="Comma-separated"
            value={form.skills_to_improve}
            onChange={(e) => onChange({ skills_to_improve: e.target.value })}
          />
        </Field>

        {/* Description */}
        <Field label="Description" htmlFor={descId} note="Auto-generated preview appears; you can edit.">
          <TextArea
            id={descId}
            rows={4}
            value={form.description}
            onChange={onDescriptionChange}
            placeholder="Auto-generated preview will appear; you can edit."
            className="min-h-[5.5rem]"
          />
        </Field>
      </FormShell>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          disabled={
            submitting ||
            !form.title.trim() ||
            !form.start_date ||
            (isEdit && (!userTouched || !isDirty)) ||
            (form.status === "completed" && !form.end_date)
          }
          className="btn btn-primary disabled:cursor-not-allowed"
          title={
            isEdit && (!userTouched || !isDirty)
              ? "No changes to save"
              : form.status === "completed" && !form.end_date
              ? "End date is required for completed projects"
              : undefined
          }
        >
          {submitting ? "Saving…" : submitLabel}
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={!userTouched}
          className="btn btn-ghost disabled:cursor-not-allowed"
          title={!userTouched ? "Nothing to reset" : undefined}
        >
          Reset
        </button>

        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-outline">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}