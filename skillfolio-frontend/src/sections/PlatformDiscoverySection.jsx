import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../lib/api";

const COST_OPTIONS = ["any", "free", "freemium", "subscription", "paid", "mixed"];
const PAGE_SIZE = 5;

export default function PlatformDiscoverySection({ onSaveGoal }) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // filters
  const [showFilters, setShowFilters] = useState(false);
  const [cost, setCost] = useState("any");
  const [certs, setCerts] = useState("any"); // any | yes | no

  // pagination
  const [page, setPage] = useState(1);

  // fetch platforms (debounced)
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      setLoading(true);
      setErr("");
      try {
        const params = { q };
        if (cost !== "any") params.cost = cost;
        if (certs !== "any") params.certs = certs;
        const { data } = await api.get("/api/platforms/", { params });
        if (!cancelled) setItems(data?.platforms || []);
      } catch (e) {
        if (!cancelled) setErr(e?.message || "Failed to load platforms");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [q, cost, certs]);

  // client-side filtering (name/category contains); cost/certs handled server-side above
  const filtered = useMemo(() => {
    const needle = (q || "").trim().toLowerCase();
    let list = items;
    if (needle) {
      list = list.filter(p =>
        (p.name || "").toLowerCase().includes(needle) ||
        (p.category || "").toLowerCase().includes(needle)
      );
    }
    return list;
  }, [items, q]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(Math.max(1, page), pageCount);
  const pageSlice = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  // reset to page 1 when filters/search change
  useEffect(() => { setPage(1); }, [q, cost, certs, items.length]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 mt-5 md:mt-20">
      <div className="mb-3">
        <h2 className="font-heading text-xl">Find where to learn it</h2>
        <p className="text-sm opacity-80 mt-1">
          Type what you want to learn — we’ll link you to platform search pages.
        </p>
        <p className="text-xs opacity-70 mt-10">
          Tip: the box also filters platform names/categories (e.g., “data”, “coursera”).
        </p>
      </div>

      {/* Search + Filters toggle */}
      <div className="flex items-center gap-2">
        <input
          className="w-full max-w-2xl rounded p-3 bg-background/60 border border-gray-700"
          placeholder="e.g., machine learning, react, Excel"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          type="button"
          className="px-3 py-2 rounded border border-gray-700 hover:bg-white/5 text-sm"
          onClick={() => setShowFilters((v) => !v)}
        >
          Filters ▾
        </button>
      </div>

      {/* Filter panel (compact) */}
      <AnimatePresence initial={false}>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mt-2 rounded border border-gray-700 bg-background/70 p-3 flex flex-col sm:flex-row gap-3"
          >
            <div className="flex items-center gap-2">
              <label className="text-sm opacity-80 w-24">Cost</label>
              <select
                className="rounded p-2 bg-background/60 border border-gray-700 text-sm"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              >
                {COST_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm opacity-80 w-24">Certificates</label>
              <select
                className="rounded p-2 bg-background/60 border border-gray-700 text-sm"
                value={certs}
                onChange={(e) => setCerts(e.target.value)}
              >
                <option value="any">any</option>
                <option value="yes">yes</option>
                <option value="no">no</option>
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && <div className="mt-3 opacity-80">Loading…</div>}
      {err && <div className="mt-3 text-accent">{err}</div>}

      {/* Cards */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-4">
        {pageSlice.map((p) => (
          <motion.div
            key={p.name}
            className="rounded border border-gray-700 bg-background/70 p-4 flex flex-col"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="font-semibold">{p.name}</div>
            {p.category && <div className="text-xs opacity-70">{p.category}</div>}
            {p.description && <div className="text-sm opacity-80 mt-1">{p.description}</div>}

            {/* Badges */}
            <div className="mt-2 flex flex-wrap gap-1">
              {p.cost_model && (
                <span className="text-xs rounded px-2 py-0.5 border border-gray-700/80">
                  {p.cost_model}
                </span>
              )}
              <span className="text-xs rounded px-2 py-0.5 border border-gray-700/80">
                {p.offers_certificates ? "Certificates" : "No certificates"}
              </span>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                className="rounded px-3 py-2 bg-secondary hover:bg-secondary/80 text-black text-sm"
                onClick={() => onSaveGoal?.({
                  name: p.name,
                  title: `Explore ${p.name} and pick a course`,
                })}
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

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            className="px-3 py-1 rounded border border-gray-700 hover:bg-white/5 text-sm disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={pageSafe === 1}
          >
            Prev
          </button>
          <div className="text-sm opacity-80">
            Page {pageSafe} / {pageCount}
          </div>
          <button
            className="px-3 py-1 rounded border border-gray-700 hover:bg-white/5 text-sm disabled:opacity-50"
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={pageSafe === pageCount}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}



