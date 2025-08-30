// Docs: see docs/announcements.md

// Tiny fetch helper for /public/announcements.json


export async function fetchAnnouncements() {
  const res = await fetch(`/announcements.json?ts=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load announcements (${res.status})`);
  const raw = await res.json();
  const items = Array.isArray(raw) ? raw : raw?.results || [];

  // Normalize a bit
  return items.map((x) => ({
    ...x,
    starts_at: x.starts_at || null,
    ends_at: x.ends_at || null,
    discount_pct: x.discount_pct ?? null,
    price_original: x.price_original ?? null,
    price_current: x.price_current ?? null,
    tags: Array.isArray(x.tags) ? x.tags : [],
  }));
}


