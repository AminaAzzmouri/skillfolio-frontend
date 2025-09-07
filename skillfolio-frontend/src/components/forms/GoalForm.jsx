/* Docs: see docs/components/forms/GoalForm.jsx.md */
import { useEffect, useId, useRef, useState } from "react";
import FormShell from "./FormShell";
import Field from "./Field";
import { TextInput, NumberInput, DateInput } from "./Inputs";
import ActionIconButton from "../ActionButton";

/* ----- date helpers ----- */
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

/* ----- normalize ints (empty -> "") ----- */
const normInt = (v) => {
  if (v === "" || v === null || v === undefined) return "";
  const n = Number(v);
  return Number.isFinite(n) ? String(n) : "";
};

/* ----- “dirty” snapshots ----- */
const snapOf = (f) =>
  JSON.stringify({
    title: String(f.title ?? "").trim(),
    target_projects: normInt(f.target_projects),
    completed_projects: normInt(f.completed_projects),
    total_steps: normInt(f.total_steps),
    completed_steps: normInt(f.completed_steps),
    deadline: toISO(f.deadline ?? ""),
  });

export default function GoalForm({
  initial = null,
  initialDraft = null,
  submitting = false,
  error = "",
  submitLabel = initial ? "Save changes" : "Create Goal",
  onCreate,
  onUpdate,
  onCancel,
}) {
  const titleId = useId();
  const targetId = useId();
  const doneProjId = useId();
  const totalStepsId = useId();
  const doneStepsId = useId();
  const dateId = useId();
  const stepId = useId();

  // Base form (create/edit)
  const [form, setForm] = useState({
    title: initial?.title ?? initialDraft?.title ?? "",
    target_projects: normInt(
      initial?.target_projects ?? initialDraft?.target_projects ?? ""
    ),
    completed_projects: normInt(
      initial?.completed_projects ?? initialDraft?.completed_projects ?? ""
    ),
    total_steps: normInt(
      initial?.total_steps ?? initialDraft?.total_steps ?? ""
    ),
    completed_steps: normInt(
      initial?.completed_steps ?? initialDraft?.completed_steps ?? ""
    ),
    deadline: toISO(initial?.deadline ?? initialDraft?.deadline ?? ""),
  });

  // Baseline + dirty
  const [baseline, setBaseline] = useState(form);
  const [userTouched, setUserTouched] = useState(false);

  useEffect(() => {
    const next = {
      title: initial?.title ?? initialDraft?.title ?? "",
      target_projects: normInt(
        initial?.target_projects ?? initialDraft?.target_projects ?? ""
      ),
      completed_projects: normInt(
        initial?.completed_projects ?? initialDraft?.completed_projects ?? ""
      ),
      total_steps: normInt(
        initial?.total_steps ?? initialDraft?.total_steps ?? ""
      ),
      completed_steps: normInt(
        initial?.completed_steps ?? initialDraft?.completed_steps ?? ""
      ),
      deadline: toISO(initial?.deadline ?? initialDraft?.deadline ?? ""),
    };
    setForm(next);
    setBaseline(next);
    setUserTouched(false);
  }, [initial, initialDraft]);

  const isEdit = !!initial && !!onUpdate;

  const onChange = (patch) =>
    setForm((prev) => {
      const next = { ...prev, ...patch };
      if (!userTouched) {
        const changed = Object.keys(patch).some(
          (k) => String(prev[k] ?? "") !== String(next[k] ?? "")
        );
        if (changed) setUserTouched(true);
      }
      return next;
    });

  // Create-mode extras (initial steps list)
  const [stepInput, setStepInput] = useState("");
  const [initialSteps, setInitialSteps] = useState([]);
  const inputRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    // when the form opens, focus Title
    if (titleRef.current) {
      titleRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
      titleRef.current.focus();
    }
  }, [initial]);

  const today = todayISO();

  const baseSnap = snapOf(baseline);
  const curSnap = snapOf(form);
  const isDirty = !isEdit || baseSnap !== curSnap;

  // Soft guards
  const tgt = Number(form.target_projects) || 0;
  const tot = Number(form.total_steps) || 0;
  const doneProj = Math.max(
    0,
    Math.min(Number(form.completed_projects) || 0, tgt)
  );
  const doneSteps = Math.max(
    0,
    Math.min(Number(form.completed_steps) || 0, tot)
  );

  const disabledSubmit =
    submitting ||
    !String(form.title).trim() ||
    !String(form.target_projects).trim() ||
    Number(form.target_projects) <= 0 ||
    !form.deadline ||
    (isEdit && !isDirty);

  const handleReset = () => {
    if (!userTouched) return;
    setForm(baseline);
    setUserTouched(false);
  };

  const addInitialStep = () => {
    const t = (stepInput || "").trim();
    if (!t) return;
    setInitialSteps((arr) => [...arr, t]);
    setStepInput("");
    inputRef.current?.focus();
  };
  const removeInitialStep = (idx) => {
    setInitialSteps((arr) => arr.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      title: String(form.title || "").trim() || "Untitled goal",
      target_projects: Number(form.target_projects),
      completed_projects:
        String(form.completed_projects).trim() === "" ? 0 : doneProj,
      total_steps:
        String(form.total_steps).trim() === "" ? 0 : Number(form.total_steps),
      completed_steps:
        String(form.completed_steps).trim() === "" ? 0 : doneSteps,
      deadline: toISO(form.deadline),
    };

    if (isEdit) {
      onUpdate?.(initial.id, payload);
      return;
    }
    onCreate?.({ ...payload }, initialSteps);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      {error ? (
        <div className="rounded border p-3 text-sm border-red-900 bg-red-950/30 text-red-200">
          {error}
        </div>
      ) : null}

      {/* Core info */}
      <FormShell title={isEdit ? "Edit goal" : "New goal"}>
        <Field label="Goal title" htmlFor={titleId}>
          <TextInput
            id={titleId}
            ref={titleRef}
            placeholder="e.g., Ship portfolio v1"
            value={form.title}
            onChange={(e) => onChange({ title: e.target.value })}
            required
          />
        </Field>

        <Field
          label="Target number of projects to build"
          htmlFor={targetId}
          note="Must be at least 1."
        >
          <NumberInput
            id={targetId}
            min={1}
            step={1}
            placeholder="e.g., 3"
            value={form.target_projects}
            onChange={(e) => {
              const raw = e.target.value;
              const n = Math.max(1, Number(raw || 0));
              const patch = { target_projects: String(n) };
              const curCompleted = Number(form.completed_projects) || 0;
              if (curCompleted > n) patch.completed_projects = String(n);
              onChange(patch);
            }}
            required
          />
        </Field>

        <Field
          label="Accomplished projects (optional)"
          htmlFor={doneProjId}
          note="If set, cannot exceed the target."
        >
          <NumberInput
            id={doneProjId}
            min={0}
            step={1}
            max={tgt || undefined}
            placeholder="e.g., 1"
            value={form.completed_projects}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") return onChange({ completed_projects: "" });
              const n = Math.max(0, Math.min(Number(raw || 0), tgt || 0));
              onChange({ completed_projects: String(n) });
            }}
          />
        </Field>

        {/* Overall required steps (optional) */}
        <Field label="Overall required steps (optional)" htmlFor={totalStepsId}>
          <NumberInput
            id={totalStepsId}
            min={0}
            step={1}
            placeholder="e.g., 10"
            value={form.total_steps}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") return onChange({ total_steps: "" });
              const n = Math.max(0, Number(raw || 0));
              const patch = { total_steps: String(n) };
              if ((Number(form.completed_steps) || 0) > n) {
                patch.completed_steps = String(n);
              }
              onChange(patch);
            }}
            /* 👇 force beige, subtle ring in light; match other inputs */
            className="bg-[#fbf1d8] ring-0 focus:ring-2 focus:ring-primary/40 shadow-sm dark:bg-background/60 dark:ring-1 dark:ring-white/10"
          />
        </Field>

        {/* Accomplished steps (optional) */}
        <Field
          label="Accomplished steps (optional)"
          htmlFor={doneStepsId}
          note="If set, cannot exceed overall steps."
        >
          <NumberInput
            id={doneStepsId}
            min={0}
            step={1}
            max={tot || undefined}
            placeholder="e.g., 3"
            value={form.completed_steps}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") return onChange({ completed_steps: "" });
              const n = Math.max(0, Math.min(Number(raw || 0), tot || 0));
              onChange({ completed_steps: String(n) });
            }}
            /* 👇 same beige styling */
            className="bg-[#fbf1d8] ring-0 focus:ring-2 focus:ring-primary/40 shadow-sm dark:bg-background/60 dark:ring-1 dark:ring-white/10"
          />
        </Field>

        <Field
          label="Deadline"
          htmlFor={dateId}
          note="Target deadline (must be today or future)."
        >
          <DateInput
            id={dateId}
            min={today}
            value={form.deadline}
            onChange={(e) => onChange({ deadline: toISO(e.target.value) })}
            required
          />
        </Field>
      </FormShell>

      {/* Initial steps (create only) */}
      {!initial && (
        <FormShell title="Initial steps (optional)">
          <div className="flex items-center gap-2">
            <TextInput
              id={stepId}
              ref={inputRef}
              placeholder="e.g., Outline tasks"
              value={stepInput}
              onChange={(e) => setStepInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addInitialStep();
                }
              }}
              /* 👇 match the beige input look */
              className="bg-[#fbf1d8] ring-border/50 shadow-sm
                   dark:bg-background/60 dark:ring-white/10"
            />
            <ActionIconButton
              icon="plus"
              title="Add step"
              shape="circle"
              size="sm"
              onClick={addInitialStep}
            />
          </div>

          {initialSteps.length > 0 && (
            <ul className="mt-2 space-y-1">
              {initialSteps.map((t, i) => (
                <li
                  key={`${t}-${i}`}
                  className="
              flex items-center justify-between gap-2 text-sm p-2 rounded
              bg-[#fbf1d8] /* light: soft chip */
              dark:bg-background/60 dark:ring-1 dark:ring-white/10
            "
                >
                  <span className="truncate">{t}</span>
                  <button
                    type="button"
                    className="
                text-xs rounded px-2 py-1
                ring-1 ring-border/60 hover:bg-background/40
                dark:ring-white/10
              "
                    onClick={() => removeInitialStep(i)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </FormShell>
      )}

      {/* Actions row — unified buttons */}
      <div className="flex items-center gap-2">
        <button
          className="btn btn-primary"
          disabled={disabledSubmit}
          title={isEdit && !isDirty ? "No changes to save" : undefined}
        >
          {submitting ? (initial ? "Saving…" : "Creating…") : submitLabel}
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={!userTouched}
          className="btn btn-ghost disabled:cursor-default"
          title={!userTouched ? "Nothing to reset" : undefined}
        >
          Reset
        </button>

        {onCancel && (
          <button type="button" className="btn btn-outline" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
