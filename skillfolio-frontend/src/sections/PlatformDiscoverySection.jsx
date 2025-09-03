import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api } from "../lib/api";

 export default function PlatformDiscoverySection({ onSaveGoal }) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      setLoading(true);
      setErr("");
      try {
        const { data } = await api.get("/api/platforms/", { params: { q } });
        if (!cancelled) setItems(data?.platforms || []);
      } catch (e) {
        if (!cancelled) setErr(e?.message || "Failed to load platforms");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [q]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-3">
        <h2 className="font-heading text-xl">Find where to learn it</h2>
        <p className="text-sm opacity-80 mt-1">
          Type what you want to learn — we’ll link you to platform search pages.
        </p>
      </div>

      <input
        className="w-full rounded p-3 bg-background/60 border border-gray-700"
        placeholder="e.g., machine learning, react, Excel"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {loading && <div className="mt-3 opacity-80">Loading…</div>}
      {err && <div className="mt-3 text-accent">{err}</div>}

      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-4">
        {items.map((p) => (
          <motion.div
            key={p.name}
            className="rounded border border-gray-700 bg-background/70 p-4 flex flex-col"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="font-semibold">{p.name}</div>
            {p.category && <div className="text-xs opacity-70">{p.category}</div>}
            <div className="mt-3 flex gap-2">
              <button
                className="rounded px-3 py-2 bg-secondary hover:bg-secondary/80 text-black text-sm"
                onClick={() => {
                  // Use the shared modal flow; no extra pages needed
                  onSaveGoal?.({
                    name: p.name,
                    title: `Explore ${p.name} and pick a course`,
                    // you could also pass p.search_url for later use if you like
                  });
                }}
                >
                  Add to bucket list
                </button>
                <a
                  className="rounded px-3 py-2 border border-gray-700 hover:bg-white/5 text-sm"
                  href={p.home}
                  target="_blank"
                  rel="noreferrer"
                >
                  Visit site
                </a>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
