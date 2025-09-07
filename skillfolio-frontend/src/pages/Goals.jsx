/* Docs: see docs/pages/Goals.jsx.md */

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { createGoalStep, updateGoalStep, deleteGoalStep } from "../store/goals";
import { daysUntil } from "../store/utils/date";
import ProgressBar from "../components/ProgressBar";
import ConfirmDialog from "../components/ConfirmDialog";
import GoalForm from "../components/forms/GoalForm";
import Modal from "../components/Modal";
import SearchBar from "../components/SearchBar";
import Filters from "../components/Filters";
import Pagination from "../components/Pagination";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Clock } from "lucide-react";
import ActionButton from "../components/ActionButton";

/* ---------- helpers ---------- */
function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d) ? String(iso) : d.toLocaleDateString();
}
function bucketForGoal(g) {
  // Prefer BE-provided projects/overall if available
  const projects = Number(
    g.projects_progress_percent ?? g.progress_percent ?? 0
  );
  const steps = Number(g.steps_progress_percent ?? 0);
  const overall =
    g.overall_progress_percent != null
      ? Number(g.overall_progress_percent)
      : Math.round(((projects || 0) + (steps || 0)) / 2);

  if (overall >= 100 || projects >= 100 || steps >= 100) return "completed";
  if ((projects === 0 || isNaN(projects)) && (steps === 0 || isNaN(steps)))
    return "not_started";
  return "in_progress";
}

/* ---------- sort options (server-supported) ---------- */
const goalSortOptions = [
  { value: "", label: "Sort…" },
  { value: "deadline", label: "Deadline (oldest)" },
  { value: "-deadline", label: "Deadline (newest)" },
  { value: "created_at", label: "Created (oldest)" },
  { value: "-created_at", label: "Created (newest)" },
  { value: "title", label: "Title (A→Z)" },
  { value: "-title", label: "Title (Z→A)" },
  { value: "total_steps", label: "Total steps (low→high)" },
  { value: "-total_steps", label: "Total steps (high→low)" },
  { value: "completed_steps", label: "Done steps (low→high)" },
  { value: "-completed_steps", label: "Done steps (high→low)" },
];

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

  // flash → focus integration (same pattern as Projects/Certificates)
  const flash = useAppStore((s) => s.flash);
  const [highlightId, setHighlightId] = useState(null);
  useEffect(() => {
    if (!flash?.goalId) return;
    const id = String(flash.goalId);
    // wait a tick so the refreshed list is in the DOM
    const t = setTimeout(() => {
      const el = document.getElementById(`goal-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightId(id);
        setTimeout(() => setHighlightId(null), 1600);
      }
    }, 50);
    return () => clearTimeout(t);
  }, [flash, goals]); // depend on goals so it runs after list refresh

  /* ----- URL params ----- */
  const [sp, setSp] = useSearchParams();
  const search = sp.get("search") || "";
  const ordering = sp.get("ordering") || "";
  const deadline = sp.get("deadline") || "";
  const status = sp.get("status") || "";
  const page = Number(sp.get("page") || 1);

  const writeParams = (patch) => {
    const next = new URLSearchParams(sp);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === "" || v == null) next.delete(k);
      else next.set(k, v);
    });
    next.delete("page");
    setSp(next);
  };

  const appliedCount = useMemo(() => {
    let n = 0;
    if (status) n += 1;
    if (ordering) n += 1;
    if (deadline) n += 1;
    return n;
  }, [status, ordering, deadline]);

  const clearAllCompactFilters = () => {
    const next = new URLSearchParams(sp);
    next.delete("status");
    next.delete("ordering");
    next.delete("deadline");
    next.delete("page");
    setSp(next);
  };

  /* ----- CRUD UI states ----- */
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const formRef = useRef(null);

  /* ----- steps local cache ----- */
  const [stepsMap, setStepsMap] = useState({});
  const setStepsFor = (goalId, next) =>
    setStepsMap((m) => ({ ...m, [goalId]: next }));

  /* ----- collapsed steps per goal (persisted) ----- */
  const COLLAPSE_KEY = "sf_goal_steps_collapsed_v2";
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

  /* ----- fetch goals when server-side params change ----- */
  useEffect(() => {
    fetchGoals({
      page,
      ordering: ordering || undefined,
      filters: {
        deadline: deadline || undefined,
      },
    });
  }, [fetchGoals, page, ordering, deadline]);

  /* ----- hydrate steps map, but only when changed ----- */
  useEffect(() => {
    setStepsMap((prev) => {
      const next = {};
      let changed = false;

      for (const g of goals || []) {
        const sorted = [...(g.steps || [])].sort((a, b) => {
          if (a.order === b.order) return a.id - b.id;
          return (a.order ?? 0) - (b.order ?? 0);
        });
        next[g.id] = sorted;

        const prevList = prev[g.id] || [];
        if (!changed) {
          if (prevList.length !== sorted.length) {
            changed = true;
          } else {
            for (let i = 0; i < sorted.length; i++) {
              const a = prevList[i];
              const b = sorted[i];
              if (
                !a ||
                !b ||
                a.id !== b.id ||
                a.title !== b.title ||
                a.is_done !== b.is_done ||
                a.order !== b.order
              ) {
                changed = true;
                break;
              }
            }
          }
        }
      }

      if (!changed) {
        const prevKeys = Object.keys(prev);
        const nextKeys = Object.keys(next);
        if (prevKeys.length !== nextKeys.length) changed = true;
        else if (prevKeys.some((k, i) => k !== nextKeys[i])) changed = true;
      }

      return changed ? next : prev;
    });
  }, [goals]);

  /* ----- transform with buckets + days ----- */
  const goalsWithMeta = useMemo(
    () =>
      (goals || []).map((g) => ({
        ...g,
        daysLeft: daysUntil(g.deadline),
        _bucket: bucketForGoal(g),
      })),
    [goals]
  );

  /* ----- client-side search + status filter ----- */
  const filtered = useMemo(() => {
    let arr = goalsWithMeta;

    if (search) {
      const q = search.toLowerCase();
      arr = arr.filter((g) =>
        String(g.title || "")
          .toLowerCase()
          .includes(q)
      );
    }
    if (status) {
      arr = arr.filter((g) => g._bucket === status);
    }
    return arr;
  }, [goalsWithMeta, search, status]);

  /* ----- CRUD handlers ----- */
  const handleCreate = async (payload, initialSteps) => {
    setSubmitError("");
    setSubmitting(true);
    try {
      const created = await createGoal(payload);
      for (const title of initialSteps || []) {
        await createGoalStep({
          goal: created.id,
          title,
          is_done: false,
          order: 0,
        });
      }
      await fetchGoals({
        page: 1,
        ordering,
        filters: { deadline: deadline || undefined },
      });
      setShowCreate(false);
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        (typeof e?.response?.data === "object"
          ? JSON.stringify(e?.response?.data)
          : e?.response?.data) ||
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
      await fetchGoals({
        page,
        ordering,
        filters: { deadline: deadline || undefined },
      });
      setEditingId(null);
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        (typeof e?.response?.data === "object"
          ? JSON.stringify(e?.response?.data)
          : e?.response?.data) ||
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
      await fetchGoals({
        page,
        ordering,
        filters: { deadline: deadline || undefined },
      });
    } finally {
      setConfirmDeleteId(null);
    }
  };

  /* ----- Steps helpers ----- */
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

  const [stepInputs, setStepInputs] = useState({});
  const onStepInputChange = (goalId, val) =>
    setStepInputs((m) => ({ ...m, [goalId]: val }));

  const addStep = async (goalId, title) => {
    const t = String(title || "").trim();
    if (!t) return;
    try {
      const created = await createGoalStep({
        goal: goalId,
        title: t,
        is_done: false,
        order: stepsMap[goalId]?.length || 0,
      });
      setStepsFor(goalId, [...(stepsMap[goalId] || []), created]);
      await fetchGoals({
        page,
        ordering,
        filters: { deadline: deadline || undefined },
      });
    } catch (e) {
      alert(e?.response?.data?.detail || e?.message || "Failed to add step");
    }
  };

  const toggleStep = async (goalId, step) => {
    try {
      const updated = await updateGoalStep(step.id, { is_done: !step.is_done });
      setStepsFor(
        goalId,
        (stepsMap[goalId] || []).map((s) => (s.id === step.id ? updated : s))
      );
      await fetchGoals({
        page,
        ordering,
        filters: { deadline: deadline || undefined },
      });
    } catch (e) {
      alert(e?.response?.data?.detail || e?.message || "Failed to toggle step");
    }
  };

  const renameStep = async (goalId, stepId, title) => {
    const t = String(title || "").trim();
    if (!t) return;
    try {
      const updated = await updateGoalStep(stepId, { title: t });
      setStepsFor(
        goalId,
        (stepsMap[goalId] || []).map((s) => (s.id === stepId ? updated : s))
      );
    } catch (e) {
      alert(e?.response?.data?.detail || e?.message || "Failed to rename step");
    }
  };

  const deleteStepLocal = async (goalId, stepId) => {
    try {
      await deleteGoalStep(stepId);
      setStepsFor(
        goalId,
        (stepsMap[goalId] || []).filter((s) => s.id !== stepId)
      );
      await fetchGoals({
        page,
        ordering,
        filters: { deadline: deadline || undefined },
      });
    } catch (e) {
      alert(e?.response?.data?.detail || e?.message || "Failed to delete step");
    }
  };

  const moveStep = async (goalId, stepId, dir) => {
    const list = [...(stepsMap[goalId] || [])];
    const idx = list.findIndex((s) => s.id === stepId);
    const to = idx + dir;
    if (idx < 0 || to < 0 || to >= list.length) return;

    [list[idx], list[to]] = [list[to], list[idx]];
    const reindexed = list.map((s, i) => ({ ...s, order: i }));
    setStepsFor(goalId, reindexed);

    try {
      await Promise.all(
        reindexed.map((s) => updateGoalStep(s.id, { order: s.order }))
      );
      setStepsFor(
        goalId,
        [...reindexed].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      );
    } catch (e) {
      alert(
        e?.response?.data?.detail || e?.message || "Failed to reorder step"
      );
      fetchGoals({
        page,
        ordering,
        filters: { deadline: deadline || undefined },
      });
    }
  };

  /* ----- render ----- */
  return (
    <div className="min-h-screen bg-background text-text p-6">
      {/* Header */}
      <div className="relative mt-8 mb-12">
        <Link
          to="/dashboard"
          className="absolute left-0 top-1/2 -translate-y-1/2 text-sm underline opacity-90 hover:opacity-100"
        >
          ← Back to dashboard
        </Link>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/projects"
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border hover:bg-gradient-to-r hover:from-primary/20 hover:via-secondary/20 hover:to-accent/20 transition"
            aria-label="Go to Projects"
            title="Projects"
          >
            ‹
          </Link>
          <h1 className="font-heading text-2xl flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" aria-hidden="true" />
            Goals
          </h1>

          <Link
            to="/certificates"
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border hover:bg-gradient-to-r hover:from-primary/20 hover:via-secondary/20 hover:to-accent/20 transition"
            aria-label="Go to Certificates"
            title="Certificates"
          >
            ›
          </Link>
        </div>
      </div>

      {/* Search + Filters toggle */}
      <div className="flex items-center gap-2 max-w-3xl mt-20 mb-2">
        <div className="w-full max-w-sm">
          <SearchBar
            value={search}
            onChange={(v) => writeParams({ search: v })}
            placeholder="Search goals…"
          />
        </div>

        <button
          type="button"
          className="px-3 py-2 rounded border border-gray-700 hover:bg-white/5 text-sm relative"
          onClick={() =>
            setSp((prev) => {
              const next = new URLSearchParams(prev);
              const cur = next.get("_showFilters") === "1";
              if (cur) next.delete("_showFilters");
              else next.set("_showFilters", "1");
              return next;
            })
          }
        >
          Filters ▾
          {appliedCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center min-w-[1.25rem] h-5 rounded-full bg-secondary/30 border border-secondary/50 text-xs px-1 text-secondary">
              {appliedCount}
            </span>
          )}
        </button>
      </div>

      {/* Compact filter panel */}
      <AnimatePresence initial={false}>
        {sp.get("_showFilters") === "1" && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            <Filters
              type="goals"
              value={{ status, deadline, ordering }}
              onChange={(patch) => writeParams(patch)}
              onClear={clearAllCompactFilters}
              layout="grid"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {goalsError && (
        <div className="text-accent mb-3">Error: {goalsError}</div>
      )}

      {/* Grid of cards */}
      <div className="mb-6 mt-8">
        {goalsLoading ? (
          <div className="opacity-80 text-sm">Loading goals…</div>
        ) : filtered.length === 0 ? (
          <div className="opacity-80 text-sm mt-3">No goals found.</div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((g) => {
              const isEditing = editingId === g.id;
              const steps = stepsMap[g.id] || [];
              const isCollapsed = collapsed.has(g.id);
              const showNudge = (g.daysLeft ?? 0) <= 3;

              // Progress: prefer BE-provided names, fallback to legacy
              const projectsPct = Number(
                g.projects_progress_percent ?? g.progress_percent ?? 0
              );
              const stepsPct = Number(g.steps_progress_percent ?? 0);
              const overall =
                g.overall_progress_percent != null
                  ? Number(g.overall_progress_percent)
                  : Math.round(((projectsPct || 0) + (stepsPct || 0)) / 2);

              const cardId = `goal-${g.id}`;
              const highlight = String(highlightId) === String(g.id);

              return (
                <motion.li
                  key={g.id}
                  id={cardId}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 320, damping: 22 }}
                  className={
                    "group relative rounded-xl bg-background/70 overflow-hidden transition-shadow h-full shadow-xl hover:shadow-lg dark:shadow-none dark:border dark:border-border/50" +
                    (highlight ? " ring-2 ring-accent shadow-lg" : "")
                  }
                >
                  <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />

                  {!isEditing ? (
                    <div className="flex h-full flex-col">
                      <div className="p-3 flex-1 flex flex-col gap-2 min-h-[10rem]">
                        {/* header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-semibold truncate mt-1">
                              {g.title || "Untitled goal"}
                            </div>
                            {/* inline meta row like Projects */}
                            <div className="text-xs opacity-80 mt-1 flex items-center gap-1.5">
                              <span>Target: {g.target_projects} projects</span>
                              <span aria-hidden className="opacity-60">
                                •
                              </span>
                              <span>Deadline: {formatDate(g.deadline)}</span>
                            </div>

                            {showNudge && (
                              <div className="mt-2 text-xs rounded bg-accent/20 border border-accent/40 p-2">
                                ⏰ Heads up: deadline is very close. You’ve got
                                this!
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <ActionButton
                              icon="edit"
                              title="Edit"
                              shape="circle"
                              onClick={() => setEditingId(g.id)}
                            />
                            <ActionButton
                              type="button"
                              icon="delete"
                              title="Delete"
                              shape="circle"
                              variant="danger"
                              onClick={() => setConfirmDeleteId(g.id)}
                            />
                          </div>
                        </div>

                        {/* progress bar */}
                        {/* progress + days-left on the right */}
                        <div className="mt-14 pl-2 grid grid-cols-[1fr,auto] gap-x-4">
                          {/* left: the 3 bars, unchanged */}
                          <div className="space-y-2">
                            <ProgressBar
                              value={projectsPct}
                              label={`Projects Progress (${
                                g.completed_projects ?? 0
                              } / ${g.target_projects ?? 0})`}
                            />
                            <ProgressBar
                              value={stepsPct}
                              label={`Checklist Progress (${
                                g.steps_completed ?? 0
                              } / ${g.steps_total ?? 0})`}
                            />
                            <ProgressBar
                              value={overall}
                              label="Overall Progress"
                            />
                          </div>

                          {/* right: vertically centered “days left” */}
                          <div className="h-full flex items-center self-center pr-3 md:pr-4">
                            <div className="flex items-center gap-2 text-sm font-medium opacity-80">
                              <Clock className="w-4 h-4 opacity-70" />
                              {g.daysLeft > 0
                                ? `${g.daysLeft} day${
                                    g.daysLeft === 1 ? "" : "s"
                                  } left`
                                : g.daysLeft === 0
                                ? "Today!"
                                : `${Math.abs(g.daysLeft)} day${
                                    Math.abs(g.daysLeft) === 1 ? "" : "s"
                                  } past`}
                            </div>
                          </div>
                        </div>

                        {/* Steps header + collapse toggle */}
                        <div className="flex items-center justify-between mt-4">
                          <button
                            type="button"
                            className="text-xs underline hover:opacity-80"
                            onClick={() => toggleCollapsed(g.id)}
                          >
                            {isCollapsed ? "Show checklist" : "Hide checklist"}
                          </button>
                        </div>

                        {!isCollapsed && (
                          <>
                            {/* add step */}
                            <div className="flex items-center gap-2 mt-2">
                              <input
                                className="flex-1 rounded p-3 bg-[#fbf1d8] ring-0 focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm text-sm dark:bg-background/60 dark:ring-1 dark:ring-white/10"
                                placeholder="Add a step…"
                                value={stepInputs[g.id] || ""}
                                onChange={(e) =>
                                  onStepInputChange(g.id, e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    const t = stepInputs[g.id] || "";
                                    onStepInputChange(g.id, "");
                                    addStep(g.id, t);
                                  }
                                }}
                              />
                              <ActionButton
                                icon="plus"
                                title="Add step"
                                shape="circle"
                                size="sm"
                                onClick={() => {
                                  const t = stepInputs[g.id] || "";
                                  onStepInputChange(g.id, "");
                                  addStep(g.id, t);
                                }}
                              />
                            </div>

                            {/* steps list */}
                            <ul className="mt-2 space-y-1">
                              {steps.length === 0 ? (
                                <li className="text-xs opacity-70">
                                  No steps yet. Add your first one.
                                </li>
                              ) : (
                                steps.map((s, idx) => (
                                  <li
                                    key={s.id}
                                    className="flex items-center justify-between gap-2 text-sm p-2 rounded bg-[#fbf1d8] dark:bg-background/60 dark:ring-1 dark:ring-white/10"
                                  >
                                    <div className="flex items-center gap-2 flex-1">
                                      <input
                                        id={`step-${s.id}`}
                                        type="checkbox"
                                        checked={!!s.is_done}
                                        onChange={() => toggleStep(g.id, s)}
                                      />
                                      {editingStepId === s.id ? (
                                        <input
                                          className={`w-full rounded p-2 bg-[#fbf1d8] ring-0 focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm text-sm dark:bg-background/60 dark:ring-1 dark:ring-white/10`}
                                          value={editingTitle}
                                          onChange={(e) =>
                                            setEditingTitle(e.target.value)
                                          }
                                          autoFocus
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter")
                                              saveEditStep(g.id, s.id);
                                            if (e.key === "Escape")
                                              cancelEditStep();
                                          }}
                                        />
                                      ) : (
                                        <label
                                          htmlFor={`step-${s.id}`}
                                          className={`${
                                            s.is_done
                                              ? "line-through opacity-70"
                                              : ""
                                          } cursor-pointer flex-1`}
                                        >
                                          {s.title}
                                        </label>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-1">
                                      {editingStepId === s.id ? (
                                        <>
                                          <button
                                            type="button"
                                            className="text-xs rounded px-2 py-1 bg-primary hover:bg-primary/80"
                                            onClick={() =>
                                              saveEditStep(g.id, s.id)
                                            }
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
                                            className="text-xs rounded px-2 py-1 ring-1 ring-border/60 hover:bg-background/40"
                                            onClick={() =>
                                              moveStep(g.id, s.id, -1)
                                            }
                                            title="Move up"
                                            disabled={idx === 0}
                                          >
                                            ↑
                                          </button>
                                          <button
                                            type="button"
                                            className="text-xs rounded px-2 py-1 ring-1 ring-border/60 hover:bg-background/40"
                                            onClick={() =>
                                              moveStep(g.id, s.id, +1)
                                            }
                                            title="Move down"
                                            disabled={idx === steps.length - 1}
                                          >
                                            ↓
                                          </button>
                                          <ActionButton
                                            icon="edit"
                                            title="Rename"
                                            shape="rounded"
                                            size="sm"
                                            onClick={() => startEditStep(s)}
                                          />
                                          <ActionButton
                                            icon="delete"
                                            title="Delete step"
                                            shape="rounded"
                                            size="sm"
                                            variant="danger"
                                            onClick={() =>
                                              deleteStepLocal(g.id, s.id)
                                            }
                                          />
                                        </>
                                      )}
                                    </div>
                                  </li>
                                ))
                              )}
                            </ul>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3">
                      <GoalForm
                        initial={g}
                        submitting={submitting}
                        error={submitError}
                        onUpdate={handleUpdate}
                        onCancel={() => setEditingId(null)}
                        submitLabel="Save changes"
                      />
                    </div>
                  )}
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Pagination (server drives page size via DRF PAGE_SIZE) */}
      <div className="max-w-xl mt-4">
        <Pagination
          page={page}
          pageSize={10}
          total={
            (Array.isArray(goals) ? goals.length : 0) + (goalsLoading ? 10 : 0)
          }
          loading={goalsLoading}
          onPageChange={(n) => {
            const next = new URLSearchParams(sp);
            next.set("page", String(n));
            setSp(next);
          }}
        />
      </div>

      {/* Floating + (Add Goal) */}
      <div className="fixed right-6 bottom-6 z-50 group">
        <motion.button
          type="button"
          onClick={() => setShowCreate(true)}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="h-12 w-12 rounded-full bg-primary text-white text-2xl leading-none shadow-lg hover:bg-gradient-to-r hover:from-primary hover:via-secondary hover:to-accent transition flex items-center justify-center"
          aria-label="New goal"
          title="New goal"
        >
          +
        </motion.button>
      </div>

      {/* Create Modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Add Goal"
      >
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
