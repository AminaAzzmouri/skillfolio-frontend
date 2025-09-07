import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../lib/api";
import SectionHeader from "../components/SectionHeader";
import SearchBar from "../components/SearchBar";
import Filters from "../components/Filters";
import ActionButton from "../components/ActionButton";
import { Search } from "lucide-react";
import Pagination from "../components/Pagination";

const COST_OPTIONS = [
  "any",
  "free",
  "freemium",
  "subscription",
  "paid",
  "mixed",
];
const PAGE_SIZE = 6;

export default function PlatformDiscoverySection({ onSaveGoal }) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // filters
  const [showFilters, setShowFilters] = useState(false);
  const [cost, setCost] = useState("any");
  const [certs, setCerts] = useState("any");
  const [ordering, setOrdering] = useState(""); // "", "name", "-name"

  // pagination
  const [page, setPage] = useState(1);
  const appliedCount =
    (cost !== "any" ? 1 : 0) + (certs !== "any" ? 1 : 0) + (ordering ? 1 : 0);

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
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q, cost, certs]);

  const filtered = useMemo(() => {
    const needle = (q || "").trim().toLowerCase();
    let list = [...items];
    if (needle) {
      list = list.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(needle) ||
          (p.category || "").toLowerCase().includes(needle)
      );
    }
    if (ordering === "name") {
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (ordering === "-name") {
      list.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    }
    return list;
  }, [items, q, ordering]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(Math.max(1, page), pageCount);
  const pageSlice = filtered.slice(
    (pageSafe - 1) * PAGE_SIZE,
    pageSafe * PAGE_SIZE
  );

  useEffect(() => {
    setPage(1);
  }, [q, cost, certs, ordering, items.length]);

  return (
    <section className="relative z-0 mx-auto max-w-7xl px-4 py-10 mt-20">
      <SectionHeader
        icon={Search}
        title="Find where to learn it"
        align="center"
        className="text-center"
      />
      <p className="text-sm opacity-80 text-center max-w-2xl mx-auto font-heading">
        Type what you want to learn — we’ll link you to platform search pages.
      </p>

      {/* Search + Filters toggle */}
      <div className="flex items-center gap-2 mt-6">
        <div className="w-full max-w-md">
          <SearchBar
            value={q}
            onChange={setQ}
            placeholder="e.g., machine learning, react, Excel"
          />
        </div>
        <button
          type="button"
          className="px-3 py-2 rounded ring-1 ring-border/70 hover:bg-background/40 text-sm"
          onClick={() => setShowFilters((v) => !v)}
        >
          Filters ▾
          {appliedCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full text-xs font-semibold bg-primary/20 text-primary ring-1 ring-primary/30">
              {appliedCount}
            </span>
          )}
        </button>
      </div>

      {/* Filters drawer */}
      <AnimatePresence initial={false}>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mt-2"
          >
            <Filters
              type="platforms"
              value={{ cost, certs, ordering }}
              onChange={(patch) => {
                if (patch.cost !== undefined) setCost(patch.cost);
                if (patch.certs !== undefined) setCerts(patch.certs);
                if (patch.ordering !== undefined) setOrdering(patch.ordering);
              }}
              onClear={() => {
                setCost("any");
                setCerts("any");
                setOrdering("");
              }}
              layout="row"
            />
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
            className="
              relative rounded-xl bg-surface p-4
              ring-1 ring-border/60 shadow-soft hover:shadow-brand
              dark:bg-background/70 dark:ring-white/10
              flex flex-col
            "
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header row: title + subtitle (left) and tags (right) */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-heading font-semibold text-base leading-tight truncate">
                  {p.name}
                </div>
                {p.category && (
                  <div className="font-heading text-xs inline-block opacity-70 truncate">
                    {p.category}
                  </div>
                )}
              </div>

              {/* Tags inline on the right */}
              <div className="flex flex-wrap items-start gap-1 mt-1 shrink-0">
                {p.cost_model && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full ring-1 ring-border/70 bg-background/60">
                    {p.cost_model}
                  </span>
                )}
                <span className="text-[10px] px-2 py-0.5 rounded-full ring-1 ring-border/70 bg-background/60">
                  {p.offers_certificates ? "Certificates" : "No certs"}
                </span>
              </div>
            </div>

            {/* Description: lower down, left-aligned */}
            {p.description && (
              <div className="mt-6 mb-4 text-sm opacity-80 text-left">
                {p.description}
              </div>
            )}

            {/* Footer actions pinned to bottom */}
            <div className="mt-auto flex items-center gap-6 pt-3">
              {p.home ? (
                <div className="flex flex-col items-center">
                  <ActionButton
                    as="a"
                    href={p.home}
                    target="_blank"
                    rel="noreferrer"
                    icon="external"
                    title="Visit site"
                    shape="circle"
                  />
                  <span className="font-heading text-xs inline-block mt-1 opacity-70">
                    Visit
                  </span>
                </div>
              ) : null}

              <div className="flex flex-col items-center">
                <ActionButton
                  icon="plus"
                  title="Add to bucket list"
                  shape="circle"
                  onClick={() =>
                    onSaveGoal?.({
                      name: p.name,
                      title: `Explore ${p.name} and pick a course`,
                    })
                  }
                />
                <span className="font-heading text-xs inline-block mt-1 opacity-70">
                  Bucket
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination (shared component) */}
      {pageCount > 1 && (
        <div className="mt-4 flex items-center justify-center">
          <Pagination
            page={pageSafe}
            pageSize={PAGE_SIZE}
            total={filtered.length}
            loading={loading}
            onPageChange={(n) => setPage(n)}
          />
        </div>
      )}
    </section>
  );
}
