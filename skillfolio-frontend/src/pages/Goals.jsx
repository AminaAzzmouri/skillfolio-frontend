/* Docs: see docs/pages/GoalsPage.md */

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { createGoalStep, updateGoalStep, deleteGoalStep } from "../store/goals";
import { daysUntil } from "../store/utils/date";
import ProgressBar from "../components/ProgressBar";
import ConfirmDialog from "../components/ConfirmDialog";
import GoalForm from "../components/forms/GoalForm";
import Modal from "../components/Modal";

const COLLAPSE_KEY = "sf_goal_steps_collapsed";

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d) ? String(iso) : d.toLocaleDateString();
}

function bucketForGoal(g) {
  const p = Number(g.progress_percent || 0);
  const s = Number(g.steps_progress_percent || 0);
  if (p >= 100 || s >= 100) return "completed";
  if (p === 0 && s === 0) return "not_started";
  return "in_progress";
}

/** Keeps focus stable even if parent re-renders */
function AddStepRow({ value, onChange, onAdd }) {
  const ref = useRef(null);

  useEffect(() => {
    // Re-focus after every value change; preserves typing continuity.
    ref.current?.focus();
    // place caret at end
    const el = ref.current;
    if (el && typeof el.selectionStart === "number") {
      const end = el.value.length;
      el.selectionStart = end;
      el.selectionEnd = end;
    }
  }, [value]);

  const submit = useCallback(() => {
    const t = (value || "").trim();
    if (!t) return;
    onChange(""); // clear immediately
    onAdd(t);
  }, [value, onAdd, onChange]);

  return (
    <div className="flex items-center gap-2 mt-2">
      <input
        ref={ref}
        className="rounded p-2 bg-background/60 border border-gray-700 flex-1 text-sm"
        placeholder="Add a step…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
      />
      <button
        type="button"
        className="rounded bg-secondary/70 px-3 py-2 text-sm hover:bg-secondary/90 transition"
        onClick={submit}
      >
        Add
      </button>
    </div>
  );
}

export default function GoalsPage() {
  const {
    goals,
    goalsLoading,
    goalsError,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
  } = useAppStore((s) => ({
    goals: s.goals,
    goalsLoading: s.goalsLoading,
    goalsError: s.goalsError,
    fetchGoals: s.fetchGoals,
    createGoal: s.createGoal,
    updateGoal: s.updateGoal,
    deleteGoal: s.deleteGoal,
  }));

  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const formRef = useRef(null);

  // steps local cache
  const [stepsMap, setStepsMap] = useState({}); // { [goalId]: Step[] }

  // collapsed per goal (persisted)
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const arr = JSON.parse(localStorage.getItem(COLLAPSE_KEY) || "[]");
      return new Set(arr.map(Number));
    } catch {
      return new Set();
    }
  });
  const saveCollapsed = (nextSet) => {
    setCollapsed(nextSet);
    localStorage.setItem(COLLAPSE_KEY, JSON.stringify(Array.from(nextSet)));
  };
  const toggleCollapsed = (goalId) => {
    const next = new Set(collapsed);
    if (next.has(goalId)) next.delete(goalId);
    else next.add(goalId);
    saveCollapsed(next);
  };

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // hydrate steps list from server
  useEffect(() => {
    const map = {};
    for (const g of goals || []) {
      const sorted = [...(g.steps || [])].sort((a, b) => {
        if (a.order === b.order) return a.id - b.id;
        return (a.order ?? 0) - (b.order ?? 0);
      });
      map[g.id] = sorted;
    }
    setStepsMap(map);
  }, [goals]);

  const goalsWithDays = useMemo(
    () =>
      (goals || []).map((g) => ({
        ...g,
        daysLeft: daysUntil(g.deadline),
        _bucket: bucketForGoal(g),
      })),
    [goals]
  );
  const inProgress = goalsWithDays.filter((g) => g._bucket === "in_progress");
  const completed = goalsWithDays.filter((g) => g._bucket === "completed");
  const notStarted = goalsWithDays.filter((g) => g._bucket === "not_started");

  // ---- CRUD ----
  const handleCreate = async (payload, initialSteps) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      const created = await createGoal(payload);
      for (const title of initialSteps || []) {
        await createGoalStep({ goal: created.id, title, is_done: false, order: 0 });
      }
      await fetchGoals();
      setShowCreate(false);
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        (typeof e?.response?.data === "object" ? JSON.stringify(e?.response?.data) : e?.response?.data) ||
        e?.message ||
        "Failed to create goal";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (id, patch) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      await updateGoal(id, patch);
      await fetchGoals();
      setEditingId(null);
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        (typeof e?.response?.data === "object" ? JSON.stringify(e?.response?.data) : e?.response?.data) ||
        e?.message ||
        "Failed to update goal";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteGoal(confirmDeleteId);
      await fetchGoals();
    } finally {
      setConfirmDeleteId(null);
    }
  };

  // ---- Steps helpers ----
  const setStepsFor = (goalId, next) => setStepsMap((m) => ({ ...m, [goalId]: next }));

  const addStep = async (goalId, title) => {
    const t = String(title || "").trim();
    if (!t) return;
    try {
      const created = await createGoalStep({
        goal: goalId,
        title: t,
        is_done: false,
        order: (stepsMap[goalId]?.length || 0),
      });
      setStepsFor(goalId, [...(stepsMap[goalId] || []), created]);
      await fetchGoals();
    } catch (e) {
      alert(e?.response?.data?.detail || e?.message || "Failed to add step");
    }
  };

  const toggleStep = async (goalId, step) => {
    try {
      const updated = await updateGoalStep(step.id, { is_done: !step.is_done });
      setStepsFor(goalId, (stepsMap[goalId] || []).map((s) => (s.id === step.id ? updated : s)));
      await fetchGoals();
    } catch (e) {
      alert(e?.response?.data?.detail || e?.message || "Failed to toggle step");
    }
  };

  const renameStep = async (goalId, stepId, title) => {
    const t = String(title || "").trim();
    if (!t) return;
    try {
      const updated = await updateGoalStep(stepId, { title: t });
      setStepsFor(goalId, (stepsMap[goalId] || []).map((s) => (s.id === stepId ? updated : s)));
    } catch (e) {
      alert(e?.response?.data?.detail || e?.message || "Failed to rename step");
    }
  };

  const deleteStepLocal = async (goalId, stepId) => {
    try {
      await deleteGoalStep(stepId);
      setStepsFor(goalId, (stepsMap[goalId] || []).filter((s) => s.id !== stepId));
      await fetchGoals();
    } catch (e) {
      alert(e?.response?.data?.detail || e?.message || "Failed to delete step");
    }
  };

  // inline edit state per step
  const [editingStepId, setEditingStepId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const startEditStep = (step) => {
    setEditingStepId(step.id);
    setEditingTitle(step.title || "");
  };
  const cancelEditStep = () => {
    setEditingStepId(null);
    setEditingTitle("");
  };
  const saveEditStep = async (goalId, stepId) => {
    await renameStep(goalId, stepId, editingTitle);
    cancelEditStep();
  };

  // add-step input per goal (controlled values)
  const [stepInputs, setStepInputs] = useState({});
  const onStepInputChange = useCallback(
    (goalId, val) => setStepInputs((m) => ({ ...m, [goalId]: val })),
    []
  );

  const Section = ({ title, items }) => (
    <section className="mb-8">
      <h2 className="font-heading text-xl mb-3">{title}</h2>

      {goalsLoading && items.length === 0 ? (
        <div className="opacity-80 mb-2">Loading…</div>
      ) : items.length === 0 ? (
        <div className="opacity-70 text-sm">No goals here.</div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((g) => {
            const steps = stepsMap[g.id] || [];
            const isCollapsed = collapsed.has(g.id);
            const isEditing = editingId === g.id;
            const showNudge = (g.daysLeft ?? 0) <= 3;

            return (
              <li key={g.id} className="p-3 rounded border border-gray-700 bg-background/70">
                {!isEditing ? (
                  <>
                    {/* header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{g.title || "Untitled goal"}</div>
                        <div className="text-sm opacity-80">
                          Target: {g.target_projects} projects by {formatDate(g.deadline)}
                        </div>
                        <div className="text-xs opacity-80 mt-1">
                          {g.daysLeft > 0
                            ? `${g.daysLeft} day${g.daysLeft === 1 ? "" : "s"} left`
                            : g.daysLeft === 0
                            ? "Today!"
                            : `${Math.abs(g.daysLeft)} day${Math.abs(g.daysLeft) === 1 ? "" : "s"} past deadline`}
                        </div>
                        {showNudge && (
                          <div className="mt-2 text-xs rounded bg-accent/20 border border-accent/40 p-2">
                            ⏰ Heads up: deadline is very close. You’ve got this!
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditingId(g.id)}
                          className="px-3 py-1 rounded border border-gray-600 hover:bg-white/5"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(g.id)}
                          className="px-3 py-1 rounded bg-accent text-black font-semibold hover:bg-accent/80"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* progress */}
                    <div className="mt-3">
                      <ProgressBar value={g.progress_percent ?? 0} label="Progress (from completed projects)" />
                    </div>
                    <div className="mt-2">
                      <ProgressBar
                        value={g.steps_progress_percent ?? 0}
                        label={`Checklist Progress (${g.completed_steps ?? 0} / ${g.total_steps ?? 0})`}
                      />
                    </div>

                    {/* Steps header + collapse toggle */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm font-semibold">Steps</div>
                      <button
                        type="button"
                        className="text-xs underline hover:opacity-80"
                        onClick={() => toggleCollapsed(g.id)}
                      >
                        {isCollapsed ? "Show steps" : "Hide steps"}
                      </button>
                    </div>

                    {!isCollapsed && (
                      <>
                        {/* add step (focus-stable row) */}
                        <AddStepRow
                          value={stepInputs[g.id] || ""}
                          onChange={(v) => onStepInputChange(g.id, v)}
                          onAdd={(t) => addStep(g.id, t)}
                        />

                        {/* steps list */}
                        <ul className="mt-2 space-y-1">
                          {steps.length === 0 ? (
                            <li className="text-xs opacity-70">No steps yet. Add your first one.</li>
                          ) : (
                            steps.map((s, idx) => (
                              <li
                                key={s.id}
                                className="flex items-center justify-between gap-2 text-sm p-2 rounded border border-gray-800"
                              >
                                <label className="flex items-center gap-2 flex-1">
                                  <input
                                    type="checkbox"
                                    checked={!!s.is_done}
                                    onChange={() => toggleStep(g.id, s)}
                                  />
                                  {editingStepId === s.id ? (
                                    <input
                                      className="rounded p-1 bg-background/60 border border-gray-700 text-sm w-full"
                                      value={editingTitle}
                                      onChange={(e) => setEditingTitle(e.target.value)}
                                      autoFocus
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") saveEditStep(g.id, s.id);
                                        if (e.key === "Escape") cancelEditStep();
                                      }}
                                    />
                                  ) : (
                                    <span className={s.is_done ? "line-through opacity-70" : ""}>{s.title}</span>
                                  )}
                                </label>

                                <div className="flex items-center gap-1">
                                  {editingStepId === s.id ? (
                                    <>
                                      <button
                                        type="button"
                                        className="text-xs rounded px-2 py-1 bg-primary hover:bg-primary/80"
                                        onClick={() => saveEditStep(g.id, s.id)}
                                        title="Save"
                                      >
                                        Save
                                      </button>
                                      <button
                                        type="button"
                                        className="text-xs rounded px-2 py-1 bg-gray-800 hover:bg-gray-700"
                                        onClick={cancelEditStep}
                                        title="Cancel"
                                      >
                                        Cancel
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        type="button"
                                        className="text-xs rounded px-2 py-1 bg-gray-800 hover:bg-gray-700"
                                        onClick={() => moveStep(g.id, s.id, -1)}
                                        title="Move up"
                                        disabled={idx === 0}
                                      >
                                        ↑
                                      </button>
                                      <button
                                        type="button"
                                        className="text-xs rounded px-2 py-1 bg-gray-800 hover:bg-gray-700"
                                        onClick={() => moveStep(g.id, s.id, +1)}
                                        title="Move down"
                                        disabled={idx === steps.length - 1}
                                      >
                                        ↓
                                      </button>
                                      <button
                                        type="button"
                                        className="text-xs rounded px-2 py-1 bg-gray-800 hover:bg-gray-700"
                                        onClick={() => startEditStep(s)}
                                        title="Rename"
                                      >
                                        ✏️
                                      </button>
                                      <button
                                        type="button"
                                        className="text-xs rounded px-2 py-1 bg-accent/80 hover:bg-accent"
                                        onClick={() => deleteStepLocal(g.id, s.id)}
                                        title="Delete step"
                                      >
                                        🗑
                                      </button>
                                    </>
                                  )}
                                </div>
                              </li>
                            ))
                          )}
                        </ul>
                      </>
                    )}
                  </>
                ) : (
                  <GoalForm
                    initial={g}
                    submitting={submitting}
                    error={submitError}
                    onUpdate={handleUpdate}
                    onCancel={() => setEditingId(null)}
                    submitLabel="Save changes"
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );

  return (
    <div className="min-h-screen bg-background text-text p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-heading text-2xl">Goals</h1>
        <Link to="/dashboard" className="text-sm underline opacity-90 hover:opacity-100">← Back to dashboard</Link>
      </div>

      {goalsError && <div className="text-accent mb-3">Error: {goalsError}</div>}

      {/* Toggle create */}
      <div className="max-w-xl mb-4">
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="bg-secondary rounded p-3 font-semibold hover:bg-secondary/80 transition"
        >
          Add Goal
        </button>
      </div>

      {/* Create in Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add Goal">
        <div ref={formRef}>
          <GoalForm
            submitting={submitting}
            error={submitError}
            onCreate={handleCreate}
            submitLabel="Create Goal"
            onCancel={() => setShowCreate(false)}
          />
        </div>
      </Modal>

      {/* Sections */}
      <Section title="In progress" items={inProgress} />
      <Section title="Completed" items={completed} />
      <Section title="Not started" items={notStarted} />

      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Delete goal?"
        message="This action cannot be undone."
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
