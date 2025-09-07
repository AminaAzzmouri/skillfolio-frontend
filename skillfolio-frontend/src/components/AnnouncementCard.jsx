import ActionButton from "./ActionButton";

/**
 * Expected item fields:
 * id, title, platform, type, starts_at, ends_at,
 * discount_pct, price_original, price_current, tags: string[], url?
 */
export default function AnnouncementCard({ item, onSaveGoal }) {
  const {
    title,
    platform,
    type,
    starts_at,
    ends_at,
    discount_pct,
    price_original,
    price_current,
    tags = [],
    url,
  } = item || {};

  const footerBadge =
    typeof discount_pct === "number"
      ? `${discount_pct}% OFF`
      : price_current
      ? price_original
        ? `${price_current} (was ${price_original})`
        : `${price_current}`
      : type === "enrollment"
      ? "Enrollment open"
      : "";

  const dateLine =
    starts_at || ends_at
      ? `From ${starts_at ? new Date(starts_at).toLocaleDateString() : "—"} until ${
          ends_at ? new Date(ends_at).toLocaleDateString() : "—"
        }`
      : "";

  return (
    <div
      className="
        flex flex-col h-[220px]
        rounded-xl bg-surface p-4
        ring-1 ring-border/60 shadow-soft hover:shadow-brand
        dark:bg-background/70 dark:ring-white/10
      "
    >
      {/* HEADER: title (left) + tags (right) */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {/* Title -> Outfit */}
          <div className="font-heading font-semibold text-base leading-tight line-clamp-2">
            {title}
          </div>
          {/* Platform subtitle -> Outfit */}
          {platform && (
            <div className="font-heading text-xs opacity-70">{platform}</div>
          )}
        </div>

        <div className="shrink-0 max-w-[48%] flex flex-wrap gap-1 justify-end">
          {type ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full ring-1 ring-border/70 bg-background/60">
              {type}
            </span>
          ) : null}
          {Array.isArray(tags) &&
            tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="text-[10px] px-2 py-0.5 rounded-full ring-1 ring-border/70 bg-background/60"
                title={t}
              >
                {t}
              </span>
            ))}
        </div>
      </div>

      {/* middle content spacer (optional copy spot) */}
      <div className="mt-2 mb-2 text-sm opacity-80 line-clamp-2" />

      {/* DATE line -> Outfit */}
      {dateLine && (
        <div className="font-heading text-xs inline-block opacity-70 mt-auto mb-2">
          {dateLine}
        </div>
      )}

      {/* FOOTER: actions left, status badge right */}
      <div className="flex items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-4">
          {url ? (
            <div className="flex flex-col items-center">
              <ActionButton
                as="a"
                href={url}
                target="_blank"
                rel="noreferrer"
                icon="external"
                title="Open details"
                shape="circle"
              />
              {/* Caption -> Outfit */}
              <span className="font-heading text-[11px] mt-1 opacity-70">
                Open
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
                  title: title ? `Enroll in: ${title}` : "Explore opportunity",
                  deadline: ends_at || "",
                })
              }
            />
            {/* Caption -> Outfit */}
            <span className="font-heading text-[11px] mt-1 opacity-70">
              Bucket
            </span>
          </div>
        </div>

        {footerBadge && (
          <span className="ml-auto text-[11px] px-2 py-1 rounded-full ring-1 ring-border/70 bg-background/60 whitespace-nowrap">
            {footerBadge}
          </span>
        )}
      </div>
    </div>
  );
}
