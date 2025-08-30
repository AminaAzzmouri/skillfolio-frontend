// Docs: see docs/announcements.md

import { Link } from "react-router-dom";

function fmtDate(s) {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d) ? s : d.toLocaleDateString();
}

export default function AnnouncementCard({ item, onSaveGoal }) {
  const { title, platform, type, url, starts_at, ends_at, discount_pct, price_original, price_current, tags } = item;

  const period = [fmtDate(starts_at), fmtDate(ends_at)].filter(Boolean).join(" → ");
  const showDiscount = type === "discount" && (discount_pct || price_current);

  return (
    <div className="rounded border border-gray-700 bg-background/70 p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs inline-flex items-center gap-2">
            <span className="rounded-full px-2 py-0.5 border border-gray-700">{platform}</span>
            <span className="rounded-full px-2 py-0.5 border border-gray-700">{type}</span>
          </div>
          <div className="font-semibold mt-1 truncate" title={title}>{title}</div>
          {period && <div className="text-sm opacity-80">{period}</div>}
          {showDiscount && (
            <div className="text-sm mt-1">
              {discount_pct ? <span className="font-medium">{discount_pct}% OFF</span> : null}
              {price_current != null && (
                <>
                  {" "}• Now {price_current}
                  {price_original != null && <span className="opacity-70"> (was {price_original})</span>}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {tags?.length ? (
        <div className="flex flex-wrap gap-1">
          {tags.map((t) => (
            <span key={t} className="text-xs rounded px-2 py-0.5 border border-gray-800 opacity-80">{t}</span>
          ))}
        </div>
      ) : null}

      <div className="flex items-center gap-2 mt-auto">
        <a
          className="rounded px-3 py-2 bg-primary hover:bg-primary/80 transition text-sm"
          href={url}
          target="_blank"
          rel="noreferrer"
        >
          Visit
        </a>
        <button
          className="rounded px-3 py-2 bg-secondary hover:bg-secondary/80 transition text-black text-sm"
          onClick={() => onSaveGoal?.(item)}
        >
          Save as Goal
        </button>
        <Link to="/dashboard" className="text-xs underline opacity-80 hover:opacity-100 ml-auto">
          See my progress
        </Link>
      </div>
    </div>
  );
}


