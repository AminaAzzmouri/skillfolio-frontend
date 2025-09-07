import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import AnnouncementCard from "../components/AnnouncementCard";
import { fetchAnnouncements } from "../lib/announcements";
import SectionHeader from "../components/SectionHeader";
import SearchBar from "../components/SearchBar";
import Filters from "../components/Filters";
import { Megaphone } from "lucide-react";

/* Horizontal scroller: centered track + left/right padding so arrows never overlap cards */
function HorizontalScroller({ children }) {
  const scrollerRef = useRef(null);

  // Arrow size + breathing room so cards never sit under buttons
  const GUTTER = 56; // px

  const nudge = useCallback((dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const page = Math.round(el.clientWidth * 0.9);
    const atStart = el.scrollLeft <= 1;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;

    if (dir > 0) {
      // right
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: "smooth" }); // loop to start
      } else {
        el.scrollBy({ left: page, behavior: "smooth" });
      }
    } else {
      // left
      if (atStart) {
        el.scrollTo({ left: el.scrollWidth, behavior: "smooth" }); // loop to end
      } else {
        el.scrollBy({ left: -page, behavior: "smooth" });
      }
    }
  }, []);

  return (
    <div className="relative">
      {/* Left arrow */}
      <button
        type="button"
        onClick={() => nudge(-1)}
        aria-label="Scroll left"
        className="
          hidden md:grid place-items-center
          absolute left-2 top-1/2 -translate-y-1/2 z-20
          w-9 h-9 rounded-full bg-surface/90 ring-1 ring-border/70
          hover:bg-background/60
        "
      >
        ‹
      </button>

      {/* Track — side padding equals arrow gutter so arrows never overlap cards */}
      <div
        ref={scrollerRef}
        className="
          flex gap-3 overflow-x-auto pb-2
          snap-x snap-mandatory justify-center
          scrollbar-none no-scrollbar
        "
        style={{
          paddingInline: `${GUTTER}px`,
          scrollSnapType: "x mandatory",
          // hide scrollbar on Firefox/IE
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        // hide scrollbar on WebKit
        onScroll={(e) => {
          const el = e.currentTarget;
          el.style.setProperty("--hide-scrollbar", "1");
        }}
      >
        {children}
      </div>

      {/* Right arrow */}
      <button
        type="button"
        onClick={() => nudge(1)}
        aria-label="Scroll right"
        className="
          hidden md:grid place-items-center
          absolute right-2 top-1/2 -translate-y-1/2 z-20
          w-9 h-9 rounded-full bg-surface/90 ring-1 ring-border/70
          hover:bg-background/60
        "
      >
        ›
      </button>
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
  const [type, setType] = useState("all"); // matches Filters default
  const [ordering, setOrdering] = useState(""); // "", "title", "-title", "discount", "-discount"
  const [startsAfter, setStartsAfter] = useState(""); // YYYY-MM-DD
  const [endsBefore, setEndsBefore] = useState(""); // YYYY-MM-DD

  const [showFilters, setShowFilters] = useState(false);
  const appliedCount =
    (platform !== "all" ? 1 : 0) +
    (type !== "all" ? 1 : 0) +
    (ordering ? 1 : 0) +
    (startsAfter ? 1 : 0) +
    (endsBefore ? 1 : 0);

  // Debounced fetch
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
          ordering: ordering || "-starts_at",
          starts_at_after: startsAfter || undefined,
          ends_at_before: endsBefore || undefined,
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
  }, [search, platform, type, ordering, startsAfter, endsBefore]);

  const platforms = useMemo(
    () => ["all", ...Array.from(new Set(items.map((i) => i.platform)))],
    [items]
  );

  return (
    <section className="relative z-0  mx-auto max-w-7xl px-4 py-6 mt-20 pt-12">
      <SectionHeader
        icon={Megaphone}
        title="Enrollments & Deals"
        align="center"
        className="text-center"
      />
      <p className="font-heading text-sm opacity-80 text-center max-w-2xl mx-auto">
        Explore the latest enrollments and discounts you might be interested in.
      </p>

      {/* Search + Filters toggle */}
      <div className="flex items-center gap-2 mt-6">
        <div className="w-full max-w-md mx-auto md:mx-0">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by title, tag, platform…"
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

      {/* Filters panel */}
      <AnimatePresence initial={false}>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            <Filters
              type="announcements"
              value={{
                platform,
                type,
                ordering,
                starts_at_after: startsAfter,
                ends_at_before: endsBefore,
              }}
              onChange={(patch) => {
                if (patch.platform !== undefined) setPlatform(patch.platform);
                if (patch.type !== undefined) setType(patch.type);
                if (patch.ordering !== undefined) setOrdering(patch.ordering);
                if (patch.starts_at_after !== undefined)
                  setStartsAfter(patch.starts_at_after);
                if (patch.ends_at_before !== undefined)
                  setEndsBefore(patch.ends_at_before);
              }}
              onClear={() => {
                setPlatform("all");
                setType("all");
                setOrdering("");
                setStartsAfter("");
                setEndsBefore("");
              }}
              layout="row"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Breathing room before cards */}
      <div className="mt-4" />

      {loading && <div className="opacity-80">Loading announcements…</div>}
      {err && <div className="text-accent">Error: {err}</div>}

      {!loading && !err && items.length === 0 && (
        <div className="opacity-80">
          No announcements right now. Try the platform finder below to search
          live course platforms.
        </div>
      )}

      {!loading && !err && items.length > 0 && (
        <HorizontalScroller>
          {items.map((item) => (
            <div
              key={item.id}
              className="snap-start shrink-0 w-[280px] sm:w-[320px] md:w-[360px]"
              style={{ scrollSnapAlign: "start", scrollMarginInline: "16px" }}
            >
              <AnnouncementCard item={item} onSaveGoal={onSaveGoal} />
            </div>
          ))}
        </HorizontalScroller>
      )}
    </section>
  );
}
