/* Docs: see docs/pages doc/Home.jsx.md */

import { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { motion } from "framer-motion";
import AnnouncementsSection from "../sections/AnnouncementsSection";
import Modal from "../components/Modal";
import GoalForm from "../components/forms/GoalForm";

const FACTS = [
  {
    text: "73% of hiring managers say a strong portfolio weighs more than a resume for creative/technical roles.",
    source: "LinkedIn Workplace Learning Report",
    url: "https://learning.linkedin.com/"
  },
  {
    text: "Project-based learning improves long-term retention and engagement compared to lecture-only formats.",
    source: "Buck Institute for Education (PBLWorks)",
    url: "https://www.pblworks.org/"
  },
  {
    text: "Team projects improve problem-solving and communication outcomes versus solo work on average.",
    source: "Cognitive Science of Learning (meta-analyses)",
    url: "https://www.apa.org/science/about/psa/2018/06/learning-groups"
  },
  {
    text: "Sharing tangible artifacts (projects, demos) increases perceived credibility in job applications.",
    source: "Behavioral signaling research",
    url: "https://papers.ssrn.com/"
  },
];

function useDailyIndex(len) {
  const i = useMemo(() => {
    const today = new Date();
    const seed = Number(`${today.getFullYear()}${today.getMonth()+1}${today.getDate()}`);
    return seed % Math.max(1, len);
  }, [len]);
  return i;
}

export default function Home() {
  const user = useAppStore((s) => s.user);
  const createGoal = useAppStore((s) => s.createGoal);
  const name = user?.first_name || user?.username || user?.email || "there";

  // Facts: cycle every 12s but also pick a daily default
  const daily = useDailyIndex(FACTS.length);
  const [factIdx, setFactIdx] = useState(daily);
  useEffect(() => {
    const id = setInterval(() => setFactIdx((i) => (i + 1) % FACTS.length), 12000);
    return () => clearInterval(id);
  }, []);
  const fact = FACTS[factIdx];

  // --- Save as Goal modal state ---
  const [showGoal, setShowGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState(null);
  const onSaveGoalRequest = (ann) => {
    setGoalDraft({
      title: `Enroll in: ${ann.title}`,
      target_projects: 1,
      deadline: ann.ends_at || "",
    });
    setShowGoal(true);
  };
  const handleCreateGoal = async (payload /*, initialSteps */) => {
    await createGoal(payload);
    setShowGoal(false);
  };

  return (
    <div className="min-h-screen bg-background text-text">
      {/* top flare */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 py-10 grid gap-6 lg:grid-cols-3">
          {/* MOTIVATION */}
          <motion.section
            className="rounded-lg border border-gray-700/50 bg-background/70 p-5 lg:col-span-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-heading text-2xl">Welcome back, {name} 👋</h1>
            <p className="mt-3 text-lg text-gray-200/90">
              Keep stacking small wins. Every certificate, every project, every step you check off —
              it’s all evidence of who you’re becoming.
            </p>

            <div className="mt-4 grid sm:grid-cols-3 gap-3">
              <Link className="px-4 py-2 rounded font-semibold bg-primary hover:bg-primary/80 text-center transition" to="/projects">Add a Project</Link>
              <Link className="px-4 py-2 rounded font-semibold bg-secondary hover:bg-secondary/80 text-black text-center transition" to="/goals">Set a Goal</Link>
              <Link className="px-4 py-2 rounded font-semibold border border-gray-700 hover:bg-white/5 text-center transition" to="/certificates">Archive a Certificate</Link>
            </div>
          </motion.section>

          {/* DID YOU KNOW */}
          <motion.aside
            className="rounded-lg border border-gray-700/50 bg-background/70 p-5"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-sm opacity-80">Did you know?</div>
            <div className="mt-2 font-medium">{fact.text}</div>
            <a
              className="mt-2 inline-block text-xs underline opacity-80 hover:opacity-100"
              href={fact.url}
              target="_blank"
              rel="noreferrer"
            >
              Source: {fact.source}
            </a>

            <div className="mt-3 flex gap-2">
              <button
                className="px-3 py-2 rounded border border-gray-700 hover:bg-white/5 text-sm"
                onClick={() => setFactIdx((i) => (i + 1) % FACTS.length)}
              >
                New fact
              </button>
              <Link className="px-3 py-2 rounded bg-secondary/80 hover:bg-secondary text-black text-sm" to="/dashboard">
                See my progress
              </Link>
            </div>
          </motion.aside>

          {/* HOLD ON TO DREAMS */}
          <motion.section
            className="rounded-lg border border-gray-700/50 bg-background/70 p-5 lg:col-span-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="font-heading text-xl">Hold on to your dreams ✨</h2>
            <p className="mt-2 text-gray-200/90">
              Solo or with a team, build something that makes you curious. Sketch it,
              set the first step, and show your work.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link to="/projects?status=planned" className="border border-gray-700 rounded px-4 py-2 hover:bg-white/5">Start a solo idea</Link>
              <Link to="/projects" className="bg-primary rounded px-4 py-2 hover:bg-primary/80">Propose a team project</Link>
              <Link to="/goals" className="bg-secondary rounded px-4 py-2 text-black hover:bg-secondary/80">Break it into steps</Link>
            </div>
          </motion.section>
        </div>
      </div>

      {/* ANNOUNCEMENTS */}
      <AnnouncementsSection onSaveGoal={onSaveGoalRequest} />

      {/* Save as Goal Modal (prefilled) */}
      <Modal open={showGoal} onClose={() => setShowGoal(false)} title="Save as Goal">
        <GoalForm
          // NEW: initialDraft lets us prefill in create mode (see patched GoalForm below)
          initialDraft={goalDraft || undefined}
          submitLabel="Create Goal"
          onCreate={handleCreateGoal}
          onCancel={() => setShowGoal(false)}
        />
      </Modal>
    </div>
  );
}


