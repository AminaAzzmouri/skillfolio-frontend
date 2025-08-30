/* Documentation: see docs/store doc/utils/date.js.md */

// daysUntil("YYYY-MM-DD") -> integer (can be negative if past)

export function daysUntil(dateString) {
  if (!dateString) return 0;
  const target = new Date(dateString + "T00:00:00");
  if (isNaN(target.getTime())) return 0;

  const now = new Date();
  // Zero out time for clean day diff
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tgt = new Date(target.getFullYear(), target.getMonth(), target.getDate());

  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((tgt.getTime() - today.getTime()) / msPerDay);
}
