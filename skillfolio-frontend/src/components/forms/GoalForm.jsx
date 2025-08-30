/* Docs: see docs/components/forms/GoalForm.md */

import { useEffect, useId, useRef, useState } from "react";

/**
 * GoalForm
 * - Create: title/target/deadline + "Initial steps" builder
 * - Edit:   only core fields (no step builder)
 *
 * Props:
 *  - initial?              goal object for edit mode
 *  - initialDraft?         OPTIONAL defaults for create mode (prefill without edit mode)
 *  - submitting?           boolean
 *  - error?                string
 *  - submitLabel?          string
 *  - onCreate?(payload, initialSteps: string[])
 *  - onUpdate?(id, patch)
 *  - onCancel?()
 */
export default function GoalForm({
  initial = null,
  initialDraft = null, // <<< NEW
  submitting = false,
  error = "",
  submitLabel = initial ? "Save changes" : "Create Goal",
  onCreate,
  onUpdate,
  onCancel,
}) {
  const titleId = useId();
  const targetId = useId();
  const dateId = useId();
  const stepId = useId();

  // Use initial if provided (edit mode), else fall back to initialDraft (create mode prefill)
  const [form, setForm] = useState({
    title: initial?.title ?? initialDraft?.title ?? "",
    target_projects: initial?.target_projects ?? initialDraft?.target_projects ?? "",
    deadline: initial?.deadline ?? initialDraft?.deadline ?? "",
  });

  // Only in create mode
  const [stepInput, setStepInput] = useState("");
  const [initialSteps, setInitialSteps] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!initial) inputRef.current?.focus();
  }, [initial]);

  const disabled =
    submitting ||
    !String(form.title).trim() ||
    !String(form.target_projects).trim() ||
    Number(form.target_projects) <= 0 ||
    !form.deadline;

  const addInitialStep = () => {
    const t = stepInput.trim();
    if (!t) return;
    setInitialSteps((arr) => [...arr, t]);
    setStepInput("");
    inputRef.current?.focus();
  };

  const removeInitialStep = (idx) => {
    setInitialSteps((arr) => arr.filter((_, i) => i !== idx));
  };

  const handleReset = () => {
    if (initial) {
      setForm({
        title: initial?.title || "",
        target_projects: initial?.target_projects ?? "",
        deadline: initial?.deadline || "",
      });
    } else if (initialDraft) { // <<< NEW
      setForm({
        title: initialDraft?.title || "",
        target_projects: initialDraft?.target_projects ?? "",
        deadline: initialDraft?.deadline || "",
      });
      setInitialSteps([]);
      setStepInput("");
    } else {
      setForm({ title: "", target_projects: "", deadline: "" });
      setInitialSteps([]);
      setStepInput("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (initial) {
      onUpdate?.(initial.id, {
        title: String(form.title || "").trim() || "Untitled goal",
        target_projects: Number(form.target_projects),
        deadline: form.deadline,
      });
      return;
    }

    onCreate?.(
      {
        title: String(form.title || "").trim() || "Untitled goal",
        target_projects: Number(form.target_projects),
        deadline: form.deadline,
        total_steps: initialSteps.length,
        completed_steps: 0,
      },
      initialSteps
    );
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      {error ? <div className="text-accent text-sm -mb-1">{error}</div> : null}

      <div className="grid gap-1">
        <label htmlFor={titleId} className="text-sm opacity-80">Goal title</label>
        <input
          id={titleId}
          type="text"
          className="rounded p-3 bg-background/60 border border-gray-700"
          placeholder="e.g., Ship portfolio v1"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
        />
      </div>

      <div className="grid gap-1">
        <label htmlFor={targetId} className="text-sm opacity-80">Target number of completed projects</label>
        <input
          id={targetId}
          type="number"
          min={1}
          className="rounded p-3 bg-background/60 border border-gray-700"
          placeholder="e.g., 1"
          value={form.target_projects}
          onChange={(e) =>
            setForm((f) => ({ ...f, target_projects: e.target.value }))
          }
          required
        />
      </div>

      <div className="grid gap-1">
        <label htmlFor={dateId} className="text-sm opacity-80">Deadline</label>
        <input
          id={dateId}
          type="date"
          className="rounded p-3 bg-background/60 border border-gray-700"
          value={form.deadline}
          onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
          required
        />
      </div>

      {/* Initial steps builder (only create mode) */}
      {!initial && (
        <div className="mt-2">
          <div className="text-sm font-semibold mb-2">Initial steps (optional)</div>

          <div className="flex items-center gap-2">
            <input
              id={stepId}
              ref={inputRef}
              className="rounded p-2 bg-background/60 border border-gray-700 flex-1 text-sm"
              placeholder="e.g., Outline tasks"
              value={stepInput}
              onChange={(e) => setStepInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addInitialStep();
                }
              }}
            />
            <button
              type="button"
              className="rounded bg-secondary/70 px-3 py-2 text-sm hover:bg-secondary/90 transition"
              onClick={addInitialStep}
            >
              Add step
            </button>
          </div>

          {initialSteps.length > 0 && (
            <ul className="mt-2 space-y-1">
              {initialSteps.map((t, i) => (
                <li
                  key={`${t}-${i}`}
                  className="flex items-center justify-between gap-2 text-sm p-2 rounded border border-gray-800"
                >
                  <span className="truncate">{t}</span>
                  <button
                    type="button"
                    className="text-xs rounded px-2 py-1 bg-gray-800 hover:bg-gray-700"
                    onClick={() => removeInitialStep(i)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          className="bg-secondary rounded p-3 font-semibold hover:bg-secondary/80 transition disabled:opacity-60"
          disabled={disabled}
        >
          {submitting ? (initial ? "Saving…" : "Creating…") : submitLabel}
        </button>

        <button
          type="button"
          className="px-4 py-3 rounded border border-gray-600 hover:bg-white/5"
          onClick={handleReset}
        >
          Reset
        </button>

        {onCancel && (
          <button
            type="button"
            className="px-4 py-3 rounded border border-gray-600 hover:bg-white/5"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}


