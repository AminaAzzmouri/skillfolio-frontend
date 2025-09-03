// Live Announcements API (DRF)
import { api } from "./api";

/**
 * fetchAnnouncements
 * Accepts optional params like { limit, platform, type, search }
 * Returns an array; supports both list and paginated DRF response shapes.
 */

export async function fetchAnnouncements(params = {}) {
  const { data } = await api.get("/api/announcements/", { params });
  const items = Array.isArray(data) ? data : data?.results || [];
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
