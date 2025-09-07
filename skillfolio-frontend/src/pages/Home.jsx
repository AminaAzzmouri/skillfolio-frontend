
/* Docs: see docs/pages/Home.jsx.md */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { motion } from "framer-motion";
import AnnouncementsSection from "../sections/AnnouncementsSection";
import PlatformDiscoverySection from "../sections/PlatformDiscoverySection";
import Modal from "../components/Modal";
import GoalForm from "../components/forms/GoalForm";
import { fetchRandomFact } from "../lib/facts";
import { Sparkles } from "lucide-react";

export default function Home() {
  const user = useAppStore((s) => s.user);
  const createGoal = useAppStore((s) => s.createGoal);
  const name = user?.first_name || user?.username || user?.email || "there";

  // Live fact
  const [fact, setFact] = useState(null);
  const [factLoading, setFactLoading] = useState(false);
  const [factErr, setFactErr] = useState("");

  async function loadFact() {
    setFactLoading(true);
    setFactErr("");
    try {
      const f = await fetchRandomFact();
      setFact(f);
    } catch (e) {
      setFactErr(e?.message || "Failed to load fact");
    } finally {
      setFactLoading(false);
    }
  }
  useEffect(() => { loadFact(); }, []);

  // Save as Goal modal state
  const [showGoal, setShowGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState(null);
  const [justCreated, setJustCreated] = useState(null);
  const onSaveGoalRequest = (item) => {
    const title =
      item?.title
        ? `Enroll in: ${item.title}`
        : item?.name
          ? `Explore ${item.name} and pick a course`
          : "Explore a new learning platform";
    setGoalDraft({
      title,
      target_projects: 1,
      deadline: item?.ends_at || "",
    });
    setShowGoal(true);
  };
  const handleCreateGoal = async (payload) => {
    const created = await createGoal(payload);
    setShowGoal(false);
    setJustCreated(created);
  };

  return (
    <div className="min-h-screen bg-background text-text font-body">
      {/* top flare */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 mt-6 mb-3">
          {/* Welcome — calmer card, no borders */}
          <motion.section
            className="
              w-full md:max-w-xl rounded-xl bg-surface/90
              shadow-soft hover:shadow-brand transition
              ring-1 ring-border/60 dark:bg-background/70 dark:ring-white/10
              p-5
            "
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-heading text-2xl">
              Welcome back, {name} 👋
            </h1>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              Keep stacking small wins. Every certificate, every project, every
              step you check off — it’s all evidence of who you’re becoming.
            </p>
          </motion.section>
        </div>
      </div>

      {/* Sections */}
      <div className="mt-10">
        <AnnouncementsSection onSaveGoal={onSaveGoalRequest} />
        <PlatformDiscoverySection onSaveGoal={onSaveGoalRequest} />

        {/* Save as Goal Modal */}
        <Modal open={showGoal} onClose={() => setShowGoal(false)} title="Save as Goal">
          <GoalForm
            initialDraft={goalDraft || undefined}
            submitLabel="Create Goal"
            onCreate={handleCreateGoal}
            onCancel={() => setShowGoal(false)}
          />
        </Modal>

        {/* Created toast-style sheet */}
        {justCreated && (
          <div className="fixed bottom-6 right-6 z-[70] w-[320px] rounded-lg ring-1 ring-border/60 bg-surface/95 shadow-lg p-4 dark:bg-background/95 dark:ring-white/10">
            <div className="font-semibold">Saved to Goals</div>
            <div className="text-sm opacity-80 truncate">“{justCreated.title}”</div>
            <div className="mt-3 flex gap-2">
              <Link
                 className="px-3 py-1.5 rounded bg-primary hover:bg-primary/80 text-sm text-white"
                 to={`/goals?focus=${justCreated.id}`}
                 onClick={() => setJustCreated(null)}
              >
                See it
              </Link>
              <button
                className="px-3 py-1.5 rounded ring-1 ring-border/60 hover:bg-background/40 text-sm"
                onClick={() => setJustCreated(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Did you know — stylized */}
      <div className="mx-auto max-w-7xl px-4 mt-10 pb-16 flex justify-end">
        <motion.aside
          className="
            w-full md:max-w-md rounded-xl p-5
            bg-animated ring-1 ring-border/60 shadow-soft dark:ring-white/10
          "
          initial={{ x: 140, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ amount: 0.4 }}
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        >
          <div className="flex items-center gap-2 text-sm opacity-90 font-heading">
            <Sparkles className="w-4 h-4 opacity-80" />
            Did you know?
          </div>

          {factLoading && <div className="mt-2 opacity-80">Loading…</div>}
          {factErr && <div className="mt-2 text-accent text-sm">Error: {factErr}</div>}

          {!factLoading && !factErr && fact && (
            <>
              <div className="mt-2 font-medium">{fact.text}</div>
              {fact.url ? (
                <a
                  className="mt-2 inline-block text-xs underline opacity-80 hover:opacity-100"
                  href={fact.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Source{fact.source ? `: ${fact.source}` : ""}
                </a>
              ) : (
                fact.source && (
                  <div className="mt-2 text-xs opacity-70">Source: {fact.source}</div>
                )
              )}
            </>
          )}

          <div className="mt-3">
            <button
              className="px-3 py-2 rounded bg-primary text-white hover:bg-primary/90 text-sm"
              onClick={loadFact}
              disabled={factLoading}
            >
              New fact
            </button>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}
