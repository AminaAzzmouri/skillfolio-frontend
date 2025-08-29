/* Docs: see docs/pages/GoalsPage.md */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  listGoals,
  createGoal,
  deleteGoal,
  updateGoal,
  listGoalSteps,
  createGoalStep,
  updateGoalStep,
  deleteGoalStep,
} from "../store/goals";
import { daysUntil } from "../store/utils/date";
import ProgressBar from "../components/ProgressBar";

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d) ? String(iso) : d.toLocaleDateString();
}

export default function Goals() {
  // server data
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // form (NOW includes title + initial checklist counts)
  const [form, setForm] = useState({
    title: "",
    target_projects: "",
    deadline: "",
    total_steps: 0,
    completed_steps: 0,
  });
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef(null);

  // steps per goal (local cache): { [goalId]: Step[] }
  const [stepsMap, setStepsMap] = useState({});
  const [stepInputs, setStepInputs] = useState({}); // { [goalId]: "new step title" }

  // ✏️ inline rename state
  const [editingStepId, setEditingStepId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");

  const fetchAll = async () => {
    setLoading(true);
    setErr("");
    try {
      const data = await listGoals();
      const items = Array.isArray(data) ? data : data?.results || [];
      setGoals(items);
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        (typeof e?.response?.data === "object"
          ? JSON.stringify(e?.response?.data)
          : e?.response?.data) ||
        e?.message ||
        "Failed to load goals";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Load steps for a goal (on-demand)
  const loadSteps = async (goalId) => {
    try {
      const items = await listGoalSteps(goalId);
      setStepsMap((m) => ({ ...m, [goalId]: items }));
      // Also refresh the parent goal so totals/percent reflect (BE syncs counts automatically)
      const fresh = await listGoals();
      const arr = Array.isArray(fresh) ? fresh : fresh?.results || [];
      setGoals(arr);
    } catch (e) {
      // silent error into toast/alert if you want
      console.error("Failed to load steps:", e);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErr("");
    try {
      const created = await createGoal({
        title: String(form.title || "").trim() || "Untitled goal",
        target_projects: Number(form.target_projects),
        deadline: form.deadline,
        total_steps: Number(form.total_steps || 0),
        completed_steps: Math.min(
          Number(form.completed_steps || 0),
          Number(form.total_steps || 0)
        ),
      });
      setGoals((g) => [created, ...g]);
      setForm({
        title: "",
        target_projects: "",
        deadline: "",
        total_steps: 0,
        completed_steps: 0,
      });
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        (typeof e?.response?.data === "object"
          ? JSON.stringify(e?.response?.data)
          : e?.response?.data) ||
        e?.message ||
        "Failed to create goal";
      setErr(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this goal?")) return;
    try {
      await deleteGoal(id);
      setGoals((g) => g.filter((x) => x.id !== id));
      setStepsMap((m) => {
        const copy = { ...m };
        delete copy[id];
        return copy;
      });
    } catch (e) {
      alert(e?.response?.data?.detail || e?.message || "Failed to delete goal");
    }
  };

  // Demo: bump target_projects
  const onNudgeTarget = async (g) => {
    try {
      const updated = await updateGoal(g.id, {
        target_projects: (g.target_projects || 0) + 1,
      });
      setGoals((arr) => arr.map((it) => (it.id === g.id ? updated : it)));
    } catch (e) {
      alert(e?.response?.data?.detail || e?.message || "Failed to update goal");
    }
  };

  const disabled =
    submitting ||
    !String(form.title).trim() ||
    !String(form.target_projects).trim() ||
    !form.deadline ||
    Number(form.target_projects) <= 0;

  // Enrich with “days left”
  const goalsWithDays = useMemo(
    () =>
      (goals || []).map((g) => ({
        ...g,
        daysLeft: daysUntil(g.deadline),
      })),
    [goals]
  );

  // --- Step handlers ---
  const onStepInputChange = (goalId, val) =>
    setStepInputs((m) => ({ ...m, [goalId]: val }));

  const onAddStep = async (goalId) => {
    const title = (stepInputs[goalId] || "").trim();
    if (!title) return;
    try {
      const created = await createGoalStep({ goal: goalId, title });
      setStepsMap((m) => ({ ...m, [goalId]: [...(m[goalId] || []), created] }));
      setStepInputs((m) => ({ ...m, [goalId]: "" }));
      // refresh parent goal (totals/percent)
      const updated = await listGoals();
      const arr = Array.isArray(updated) ? updated : updated?.results || [];
      setGoals(arr);
    } catch (e) {
      alert(e?.response?.data?.detail || e?.message || "Failed to add step");
    }
  };

  const onToggleStep = async (goalId, step) => {
    try {
      const updated = await updateGoalStep(step.id, { is_done: !step.is_done });
      setStepsMap((m) => ({
        ...m,
        [goalId]: (m[goalId] || []).map((s) => (s.id === step.id ? updated : s)),
      }));
      // refresh goal counts
      const fresh = await listGoals();
      const arr = Array.isArray(fresh) ? fresh : fresh?.results || [];
      setGoals(arr);
    } catch (e) {
      alert(e?.response?.data?.detail || e?.message || "Failed to toggle step");
    }
  };

  const onDeleteStep = async (goalId, stepId) => {
    try {
      await deleteGoalStep(stepId);
      setStepsMap((m) => ({
        ...m,
        [goalId]: (m[goalId] || []).filter((s) => s.id !== stepId),
      }));
      // refresh goal counts
      const fresh = await listGoals();
      const arr = Array.isArray(fresh) ? fresh : fresh?.results || [];
      setGoals(arr);
    } catch (e) {
      alert(e?.response?.data?.detail || e?.message || "Failed to delete step");
    }
  };

  // simple reorder: bump order value (+/-1) and refresh
  const onBumpStep = async (goalId, step, dir = +1) => {
    try {
      const nextOrder = (step.order || 0) + dir;
      await updateGoalStep(step.id, { order: nextOrder });
      await loadSteps(goalId); // ensures ordering stabilized from BE
    } catch (e) {
      alert(e?.response?.data?.detail || e?.message || "Failed to reorder step");
    }
  };

  // ✏️ inline rename handlers
  const startEditStep = (step) => {
    setEditingStepId(step.id);
    setEditingTitle(step.title || "");
  };

  const cancelEditStep = () => {
    setEditingStepId(null);
    setEditingTitle("");
  };

  const saveEditStep = async (goalId, stepId) => {
    const title = editingTitle.trim();
    if (!title) return;
    try {
      const updated = await updateGoalStep(stepId, { title });
      setStepsMap((m) => ({
        ...m,
        [goalId]: (m[goalId] || []).map((s) => (s.id === stepId ? updated : s)),
      }));
    } catch (e) {
      alert(e?.response?.data?.detail || e?.message || "Failed to rename step");
    } finally {
      cancelEditStep();
    }
  };

  return (
    <div className="min-h-screen bg-background text-text p-6">
      <h1 className="font-heading text-2xl mb-4">Goals</h1>

      {/* States */}
      {loading && <div className="opacity-80 mb-2">Loading goals…</div>}
      {err && <div className="text-accent mb-2">Error: {err}</div>}
      {!loading && !err && goals.length === 0 && (
        <div className="opacity-80 mb-2">No goals yet.</div>
      )}

      {/* List */}
      <ul className="space-y-3 max-w-xl mb-6">
        {goalsWithDays.map((g) => {
          const steps = stepsMap[g.id] || [];
          const showNudge = (g.daysLeft ?? 0) <= 3;
          return (
            <li
              key={g.id}
              className="p-3 rounded border border-gray-700 bg-background/70"
            >
              {/* Title + deadline + nudge */}
              <div className="font-semibold">
                {g.title ? g.title : "Untitled goal"}
              </div>
              <div className="text-sm opacity-80">
                Target: {g.target_projects} projects by {formatDate(g.deadline)}
              </div>
              <div className="text-xs opacity-80 mt-1">
                {g.daysLeft > 0
                  ? `${g.daysLeft} day${g.daysLeft === 1 ? "" : "s"} left`
                  : g.daysLeft === 0
                  ? "Today!"
                  : `${Math.abs(g.daysLeft)} day${
                      Math.abs(g.daysLeft) === 1 ? "" : "s"
                    } past deadline`}
              </div>
              {showNudge && (
                <div className="mt-2 text-xs rounded bg-accent/20 border border-accent/40 p-2">
                  ⏰ Heads up: deadline is very close. You’ve got this!
                </div>
              )}

              {/* Progress: projects-based */}
              <div className="mt-3">
                <ProgressBar
                  value={g.progress_percent ?? 0}
                  label="Progress (from completed projects)"
                />
              </div>

              {/* Progress: checklist-based */}
              <div className="mt-2">
                <ProgressBar
                  value={g.steps_progress_percent ?? 0}
                  label={`Checklist Progress (${g.completed_steps ?? 0} / ${g.total_steps ?? 0})`}
                />
              </div>

              {/* Steps UI */}
              <div className="mt-4">
                <div className="flex items-center gap-2">
                  <input
                    className="rounded p-2 bg-background/60 border border-gray-700 flex-1 text-sm"
                    placeholder="Add a step…"
                    value={stepInputs[g.id] || ""}
                    onChange={(e) => onStepInputChange(g.id, e.target.value)}
                  />
                  <button
                    className="rounded bg-secondary/70 px-3 py-2 text-sm hover:bg-secondary/90 transition"
                    onClick={() => onAddStep(g.id)}
                  >
                    Add
                  </button>
                  <button
                    className="rounded bg-gray-800 px-3 py-2 text-sm hover:bg-gray-700 transition"
                    onClick={() => loadSteps(g.id)}
                    title="Refresh steps"
                  >
                    Refresh
                  </button>
                </div>

                {/* Steps list */}
                <ul className="mt-2 space-y-1">
                  {steps.length === 0 ? (
                    <li className="text-xs opacity-70">
                      No steps yet. Add your first one.
                    </li>
                  ) : (
                    steps.map((s) => (
                      <li
                        key={s.id}
                        className="flex items-center justify-between gap-2 text-sm p-2 rounded border border-gray-800"
                      >
                        <label className="flex items-center gap-2 flex-1">
                          <input
                            type="checkbox"
                            checked={!!s.is_done}
                            onChange={() => onToggleStep(g.id, s)}
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
                            <span className={s.is_done ? "line-through opacity-70" : ""}>
                              {s.title}
                            </span>
                          )}
                        </label>

                        <div className="flex items-center gap-1">
                          {editingStepId === s.id ? (
                            <>
                              <button
                                className="text-xs rounded px-2 py-1 bg-primary hover:bg-primary/80"
                                onClick={() => saveEditStep(g.id, s.id)}
                                title="Save"
                              >
                                Save
                              </button>
                              <button
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
                                className="text-xs rounded px-2 py-1 bg-gray-800 hover:bg-gray-700"
                                onClick={() => onBumpStep(g.id, s, -1)}
                                title="Move up"
                              >
                                ↑
                              </button>
                              <button
                                className="text-xs rounded px-2 py-1 bg-gray-800 hover:bg-gray-700"
                                onClick={() => onBumpStep(g.id, s, +1)}
                                title="Move down"
                              >
                                ↓
                              </button>
                              <button
                                className="text-xs rounded px-2 py-1 bg-gray-800 hover:bg-gray-700"
                                onClick={() => startEditStep(s)}
                                title="Rename"
                              >
                                ✏️
                              </button>
                              <button
                                className="text-xs rounded px-2 py-1 bg-accent/80 hover:bg-accent"
                                onClick={() => onDeleteStep(g.id, s.id)}
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
              </div>

              {/* Small actions */}
              <div className="mt-3 flex gap-2 text-xs">
                <button
                  className="rounded bg-primary p-2 hover:bg-primary/80 transition"
                  onClick={() => onNudgeTarget(g)}
                >
                  +1 target
                </button>
                <button
                  className="rounded bg-accent/80 p-2 hover:bg-accent transition"
                  onClick={() => onDelete(g.id)}
                >
                  Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Form */}
      <div ref={formRef} className="max-w-xl">
        <h2 className="font-heading text-xl mb-2">Add a Goal</h2>
        <form
          onSubmit={onSubmit}
          className="bg-background/80 border border-gray-700 p-4 rounded grid gap-3"
        >
          <input
            type="text"
            className="rounded p-3 bg-background/60 border border-gray-700"
            placeholder="Goal title (e.g., Ship portfolio v1)"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            required
          />
          <input
            type="number"
            min={1}
            className="rounded p-3 bg-background/60 border border-gray-700"
            placeholder="Target number of completed projects"
            value={form.target_projects}
            onChange={(e) =>
              setForm((f) => ({ ...f, target_projects: e.target.value }))
            }
            required
          />
          <input
            type="date"
            className="rounded p-3 bg-background/60 border border-gray-700"
            value={form.deadline}
            onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
            required
          />

          {/* Initial checklist seeding (optional) */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs mb-1 opacity-75">Total steps</label>
              <input
                type="number"
                min={0}
                className="rounded p-3 bg-background/60 border border-gray-700 w-full"
                value={form.total_steps}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    total_steps: Math.max(0, Number(e.target.value || 0)),
                    completed_steps: Math.min(
                      f.completed_steps,
                      Math.max(0, Number(e.target.value || 0))
                    ),
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-xs mb-1 opacity-75">Completed steps</label>
              <input
                type="number"
                min={0}
                className="rounded p-3 bg-background/60 border border-gray-700 w-full"
                value={form.completed_steps}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    completed_steps: Math.min(
                      Math.max(0, Number(e.target.value || 0)),
                      Math.max(0, Number(f.total_steps || 0))
                    ),
                  }))
                }
              />
            </div>
          </div>

          <button
            disabled={disabled}
            className="bg-secondary rounded p-3 font-semibold hover:bg-secondary/80 transition disabled:opacity-60"
          >
            {submitting ? "Creating…" : "Create Goal"}
          </button>
        </form>
      </div>
    </div>
  );
}