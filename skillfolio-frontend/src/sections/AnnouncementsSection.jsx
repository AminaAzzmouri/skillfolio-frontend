import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AnnouncementCard from "../components/AnnouncementCard";
import { fetchAnnouncements } from "../lib/announcements";

/* ---- Small helper for horizontal scrolling + snap ---- */
function HorizontalScroller({ children }) {
  const scrollerRef = useRef(null);

  const nudge = (delta) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div className="-mx-4">
      <div className="flex items-center gap-2 px-4 mb-2">
        <button
          type="button"
          onClick={() => nudge(-400)}
          className="px-3 py-1 rounded border border-gray-700 text-sm hover:bg-white/5"
          aria-label="Scroll left"
        >
          ‹
        </button>
        <div className="text-xs opacity-70">Scroll</div>
        <button
          type="button"
          onClick={() => nudge(400)}
          className="px-3 py-1 rounded border border-gray-700 text-sm hover:bg-white/5"
          aria-label="Scroll right"
        >
          ›
        </button>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-3 overflow-x-auto pb-2 px-4 snap-x snap-mandatory"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {children}
      </div>
    </div>
  );
}

export default function AnnouncementsSection({ onSaveGoal }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // filters
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("all");
  const [type, setType] = useState("enrollment"); // default to enrollments
  const [showFilters, setShowFilters] = useState(false);

  // Debounced refetch when filters/search change
  const debounceRef = useRef(null);
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setErr("");
      try {
        const params = {
          search: search || undefined,
          platform: platform !== "all" ? platform : undefined,
          type: type !== "all" ? type : undefined,
          ordering: "-starts_at",
        };
        const data = await fetchAnnouncements(params);
        if (!cancelled) setItems(data);
      } catch (e) {
        if (!cancelled) setErr(e?.message || "Failed to load announcements");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(run, 300);

    return () => {
      cancelled = true;
      clearTimeout(debounceRef.current);
    };
  }, [search, platform, type]);

  const platforms = useMemo(
    () => ["all", ...Array.from(new Set(items.map((i) => i.platform)))],
    [items]
  );

  const filtered = items;

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 mt-16 md:mt-20">
      <div className="mb-2">
        <h2 className="font-heading text-xl">Enrollments & Deals</h2>
        <p className="text-sm opacity-80 mt-1">
          Explore the latest enrollments and discounts you might be interested in.
        </p>
      </div>

      {/* Search row + Filters toggle */}
      <div className="flex items-center gap-2 mb-2 mt-10">
        <input
          className="w-full max-w-2xl rounded p-3 bg-background/60 border border-gray-700"
          placeholder="Search by title, tag, platform…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="button"
          className="px-3 py-2 rounded border border-gray-700 hover:bg-white/5 text-sm"
          onClick={() => setShowFilters((v) => !v)}
        >
          Filters ▾
        </button>
      </div>

      {/* Filters panel (Platform + Type) */}
      <AnimatePresence initial={false}>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="mb-4 rounded border border-gray-700 bg-background/70 p-3 flex flex-col sm:flex-row gap-3"
          >
            <div className="flex items-center gap-2">
              <label className="text-sm opacity-80 w-24">Platform</label>
              <select
                className="rounded p-2 bg-background/60 border border-gray-700 text-sm w-44"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              >
                {platforms.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm opacity-80 w-24">Type</label>
              <select
                className="rounded p-2 bg-background/60 border border-gray-700 text-sm w-44"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="all">all</option>
                <option value="enrollment">enrollment</option>
                <option value="discount">discount</option>
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* States */}
      {loading && <div className="opacity-80">Loading announcements…</div>}
      {err && <div className="text-accent">Error: {err}</div>}
      {!loading && !err && filtered.length === 0 && (
        <div className="opacity-80">
          No announcements right now. Try the platform finder below to search live course platforms.
        </div>
      )}

      {/* Horizontal scroller of cards (only rendering mode) */}
      {!loading && !err && filtered.length > 0 && (
        <HorizontalScroller>
          {filtered.map((item) => (
            <div
              key={item.id}
              className="snap-start shrink-0 w-[280px] sm:w-[320px] md:w-[360px]"
            >
              <AnnouncementCard item={item} onSaveGoal={onSaveGoal} />
            </div>
          ))}
        </HorizontalScroller>
      )}
    </section>
  );
}
