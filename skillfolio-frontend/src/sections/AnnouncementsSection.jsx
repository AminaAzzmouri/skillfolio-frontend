import { useEffect, useMemo, useState } from "react";
import { fetchAnnouncements } from "../lib/announcements";
import AnnouncementCard from "../components/AnnouncementCard";

export default function AnnouncementsSection({ onSaveGoal }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("all");
  const [type, setType] = useState("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const data = await fetchAnnouncements();
        if (!cancelled) setItems(data);
      } catch (e) {
        if (!cancelled) setErr(e?.message || "Failed to load announcements");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const platforms = useMemo(
    () => ["all", ...Array.from(new Set(items.map((i) => i.platform)))],
    [items]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      const okPlatform = platform === "all" || i.platform === platform;
      const okType = type === "all" || i.type === type;
      const okSearch =
        !q ||
        i.title?.toLowerCase().includes(q) ||
        i.platform?.toLowerCase().includes(q) ||
        i.tags?.some((t) => t.toLowerCase().includes(q));
      return okPlatform && okType && okSearch;
    });
  }, [items, platform, type, search]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="font-heading text-xl">Announcements: Enrollments & Deals</h2>
        <div className="text-xs opacity-70">Fetched from <code>public/announcements.json</code></div>
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
          {platforms.map((p) => <option key={p} value={p}>{p}</option>)}
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


