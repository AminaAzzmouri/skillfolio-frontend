import { useEffect, useMemo, useRef, useState } from "react";
import AnnouncementCard from "../components/AnnouncementCard";
import { fetchAnnouncements } from "../lib/announcements";


export default function AnnouncementsSection({ onSaveGoal }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");


  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("all");
  const [type, setType] = useState("enrollment"); // default to enrollments


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


  // Server filters are applied, so just display items
  const filtered = items;


  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-2">
        <h2 className="font-heading text-xl">Announcements: Enrollments & Deals</h2>
        <p className="text-sm opacity-80 mt-1">
          Explore the latest enrollments and discounts you might be interested in.
        </p>
      </div>


      {/* Filters */}
      <div className="grid gap-2 sm:grid-cols-3 mb-4">
        <input
          className="rounded p-3 bg-background/60 border border-gray-700"
          placeholder="Search by title, tag, platform…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded p-3 bg-background/60 border border-gray-700"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
        >
          {platforms.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select
          className="rounded p-3 bg-background/60 border border-gray-700"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="all">all</option>
          <option value="enrollment">enrollment</option>
          <option value="discount">discount</option>
        </select>
      </div>


      {/* States */}
      {loading && <div className="opacity-80">Loading announcements…</div>}
      {err && <div className="text-accent">Error: {err}</div>}
      {!loading && !err && filtered.length === 0 && (
        <div className="opacity-80">No announcements match your filters.</div>
      )}


      {/* Grid */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <AnnouncementCard key={item.id} item={item} onSaveGoal={onSaveGoal} />
        ))}
      </div>
    </section>
  );
}
