import { Link } from "react-router-dom";

export default function SectionHeader({
  icon: Icon,
  title,
  to,                // optional "View all" link
  count,             // optional number pill
  align = "left",    // "left" | "center"  (DEFAULT: left)
  className = "",
}) {
  const isCenter = align === "center";

  if (isCenter) {
    return (
      <div className={`mb-3 ${className}`}>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 min-w-0">
            {Icon ? <Icon className="w-5 h-5 opacity-80 shrink-0" /> : null}
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-center truncate">
              {title}
            </h2>
            {typeof count === "number" && (
              <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] sm:text-xs border border-border/60 bg-background/60 shadow-lg dark:shadow-none">
                {count}
              </span>
            )}
          </div>

          {to ? (
            <Link
              to={to}
              className="mt-1 text-xs opacity-80 hover:opacity-100 underline underline-offset-2"
            >
              View all
            </Link>
          ) : null}
        </div>

        <div className="mt-2 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
      </div>
    );
  }

  // LEFT (default) — Dashboard and other pages keep this look
  return (
    <div className={`mb-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {Icon ? <Icon className="w-5 h-5 opacity-80 shrink-0" /> : null}
          <h2 className="font-heading text-xl sm:text-2xl truncate">
            {title}
          </h2>
          {typeof count === "number" && (
            <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] sm:text-xs border border-border/60 bg-background/60 shadow-lg dark:shadow-none">
              {count}
            </span>
          )}
        </div>

        {to ? (
          <Link
            to={to}
            className="text-xs opacity-80 hover:opacity-100 underline underline-offset-2"
          >
            View all
          </Link>
        ) : null}
      </div>

      <div className="mt-2 h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
    </div>
  );
}
