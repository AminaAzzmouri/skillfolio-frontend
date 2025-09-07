// Documentation: see docs/components/Filters.jsx.md

/**
 * Filters Drawer (themed)
 * Renders a drawer containing:
 *  - Page-specific filters
 *  - Sort select
 *  - "Clear filters" action
 *
 * Props:
 * - type: 'certificates' | 'projects'
 * - value: object with current values (e.g. { issuer, date_earned, ordering } or { linked, status, ordering })
 * - onChange: (patchObj) => void   // called with only changed keys
 * - onClear: () => void            // clear all relevant keys for the page
 * - layout?: 'grid' | 'row'        // default 'grid'
 * - dateMax?: string               // e.g. YYYY-MM-DD (for certificates date cap)
 * - sortOptions?: Array<{value,label}>
 */
export default function Filters({
  type,
  value = {},
  onChange,
  onClear,
  layout = "grid",
  dateMax,
  sortOptions,
}) {
  const set = (patch) => onChange?.(patch);

  const containerClass =
    "mt-2 rounded-lg p-3 max-w-lg " +
    "bg-[#fdf6e3] ring-1 ring-border/50 shadow-md " + // light beige
    "dark:bg-background/70 dark:ring-white/10 dark:shadow-none";

  const inputCls =
    "rounded h-10 px-3 text-sm " +
    "bg-[#fbf1d8] ring-1 ring-border/50 shadow-sm " +
    "dark:bg-background/60 dark:ring-white/10 " +
    "focus:outline-none focus:ring-2 focus:ring-primary/50";

  // responsive grid; tweak per page’s fields
  const gridClassCerts =
    layout === "row"
      ? "flex flex-wrap items-end gap-3"
      : "grid gap-3 md:grid-cols-[14rem,11rem,1fr]";

  const gridClassProjects =
    layout === "row"
      ? "flex flex-wrap items-end gap-3"
      : "grid gap-3 md:grid-cols-[12rem,12rem,1fr]";

  const gridClassRow = "flex flex-wrap items-end gap-3";

  // default sort options if none provided
  const defaultSorts =
    type === "certificates"
      ? [
          { value: "", label: "Sort…" },
          { value: "date_earned", label: "Date (oldest)" },
          { value: "-date_earned", label: "Date (newest)" },
          { value: "title", label: "Title (A→Z)" },
          { value: "-title", label: "Title (Z→A)" },
        ]
      : type === "projects"
      ? [
          { value: "", label: "Sort…" },
          { value: "date_created", label: "Created (oldest)" },
          { value: "-date_created", label: "Created (newest)" },
          { value: "title", label: "Title (A→Z)" },
          { value: "-title", label: "Title (Z→A)" },
        ]
      : type === "goals"
      ? [
          { value: "", label: "Sort…" },
          { value: "deadline", label: "Deadline (oldest)" },
          { value: "-deadline", label: "Deadline (newest)" },
          { value: "created_at", label: "Created (oldest)" },
          { value: "-created_at", label: "Created (newest)" },
          { value: "title", label: "Title (A→Z)" },
          { value: "-title", label: "Title (Z→A)" },
          { value: "total_steps", label: "Total steps (low→high)" },
          { value: "-total_steps", label: "Total steps (high→low)" },
          { value: "completed_steps", label: "Done steps (low→high)" },
          { value: "-completed_steps", label: "Done steps (high→low)" },
        ]
      : type === "announcements"
      ? [
          { value: "", label: "Sort…" },
          { value: "title", label: "Title (A→Z)" },
          { value: "-title", label: "Title (Z→A)" },
          // “Available discount” sort. Adjust field name to what your API returns.
          { value: "starts_atr", label: "Start date(oldest)" },
          { value: "-starts_at", label: "End date (newest)" },
        ]
      : type === "platforms"
      ? [
          { value: "", label: "Sort…" },
          { value: "name", label: "Title (A→Z)" },
          { value: "-name", label: "Title (Z→A)" },
        ]
      : [{ value: "", label: "Sort..." }];

  const sorts = sortOptions?.length ? sortOptions : defaultSorts;

  return (
    <div className={containerClass}>
      {/* Page-specific fields */}
      {type === "certificates" && (
        <div className={gridClassCerts}>
          {/* Issuer */}
          <div className="grid gap-1">
            <label className="font-heading text-xs uppercase tracking-wide opacity-70">
              Issuer
            </label>
            <input
              className={`${inputCls} w-[14rem]`}
              placeholder="e.g., Coursera"
              value={value.issuer || ""}
              onChange={(e) => set({ issuer: e.target.value })}
              aria-label="Filter by issuer"
            />
          </div>

          {/* Date earned */}
          <div className="grid gap-1">
            <label className="font-heading text-xs uppercase tracking-wide opacity-70">
              Date earned
            </label>
            <input
              type="date"
              max={dateMax || undefined}
              className={`${inputCls} w-[11rem]`}
              value={value.date_earned || ""}
              onChange={(e) => set({ date_earned: e.target.value })}
              aria-label="Filter by date earned"
            />
          </div>

          <div />
        </div>
      )}

      {type === "projects" && (
        <div className={gridClassProjects}>
          {/* Linked (any/yes/no) */}
          <div className="grid gap-1">
            <label className="text-xs uppercase tracking-wide opacity-70">
              Certified
            </label>
            <select
              className={`${inputCls} w-[12rem]`}
              value={value.linked || "any"}
              onChange={(e) => set({ linked: e.target.value })}
              aria-label="Filter by certified"
            >
              <option value="any">Any</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          {/* Status */}
          <div className="grid gap-1">
            <label className="text-xs uppercase tracking-wide opacity-70">
              Status
            </label>
            <select
              className={`${inputCls} w-[12rem]`}
              value={value.status || ""}
              onChange={(e) => set({ status: e.target.value })}
              aria-label="Filter by status"
            >
              <option value="">Any</option>
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div />
        </div>
      )}

      {type === "goals" && (
        <div
          className={
            layout === "row"
              ? "flex flex-wrap items-end gap-3"
              : "grid gap-3 md:grid-cols-[12rem,12rem,1fr]"
          }
        >
          {/* Status */}
          <div className="grid gap-1">
            <label className="text-xs uppercase tracking-wide opacity-70">
              Status
            </label>
            <select
              className={`${inputCls} w-[12rem]`}
              value={value.status || ""}
              onChange={(e) => set({ status: e.target.value })}
              aria-label="Filter by status"
            >
              <option value="">Any</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="not_started">Not started</option>
            </select>
          </div>

          {/* Deadline */}
          <div className="grid gap-1">
            <label className="text-xs uppercase tracking-wide opacity-70">
              Deadline
            </label>
            <input
              type="date"
              className={`${inputCls} w-[12rem]`}
              value={value.deadline || ""}
              onChange={(e) => set({ deadline: e.target.value })}
              aria-label="Filter by deadline"
            />
          </div>
          <div />
        </div>
      )}

      {/* Announcements */}
      {type === "announcements" && (
        <div className={gridClassRow}>
          <div className="grid gap-1">
            <label className="text-xs uppercase tracking-wide opacity-70">
              Platform
            </label>
            <select
              className={`${inputCls} w-[14rem]`}
              value={value.platform || "all"}
              onChange={(e) => set({ platform: e.target.value })}
              aria-label="Filter by platform"
            >
              <option value="all">All</option>
              {/* Caller can limit the set externally; UI keeps fallback */}
              <option value="coursera">Coursera</option>
              <option value="udemy">Udemy</option>
              <option value="edx">edX</option>
              <option value="udacity">Udacity</option>
            </select>
          </div>

          <div className="grid gap-1">
            <label className="text-xs uppercase tracking-wide opacity-70">
              Type
            </label>
            <select
              className={`${inputCls} w-[12rem]`}
              value={value.type || "all"}
              onChange={(e) => set({ type: e.target.value })}
              aria-label="Filter by type"
            >
              <option value="all">All</option>
              <option value="enrollment">Enrollment</option>
              <option value="discount">Discount</option>
            </select>
          </div>

          <div className="grid gap-1">
            <label className="text-xs uppercase tracking-wide opacity-70">
              Starts after
            </label>
            <input
              type="date"
              className={`${inputCls} w-[12rem]`}
              value={value.starts_at_after || ""}
              onChange={(e) => set({ starts_at_after: e.target.value })}
              aria-label="Filter by start date (after)"
            />
          </div>

          <div className="grid gap-1">
            <label className="text-xs uppercase tracking-wide opacity-70">
              Ends before
            </label>
            <input
              type="date"
              className={`${inputCls} w-[12rem]`}
              value={value.ends_at_before || ""}
              onChange={(e) => set({ ends_at_before: e.target.value })}
              aria-label="Filter by end date (before)"
            />
          </div>

          <div className="grow" />
          <div />
        </div>
      )}

      {/* Platforms (finder) */}
      {type === "platforms" && (
        <div className={gridClassRow}>
          <div className="grid gap-1">
            <label className="text-xs uppercase tracking-wide opacity-70">
              Cost
            </label>
            <select
              className={`${inputCls} w-[12rem]`}
              value={value.cost || "any"}
              onChange={(e) => set({ cost: e.target.value })}
              aria-label="Filter by cost"
            >
              <option value="any">Any</option>
              <option value="free">Free</option>
              <option value="freemium">Freemium</option>
              <option value="subscription">Subscription</option>
              <option value="paid">Paid</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          <div className="grid gap-1">
            <label className="text-xs uppercase tracking-wide opacity-70">
              Certificates
            </label>
            <select
              className={`${inputCls} w-[12rem]`}
              value={value.certs || "any"}
              onChange={(e) => set({ certs: e.target.value })}
              aria-label="Filter by certificates"
            >
              <option value="any">Any</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>

          <div className="grow" />
          <div />
        </div>
      )}

      {/* Sort row */}
      <div className="mt-3">
        <label className="font-heading block text-xs uppercase tracking-wide opacity-70 mb-1">
          Sort
        </label>
        <select
          className={`${inputCls} w-56`}
          value={value.ordering || ""}
          onChange={(e) => set({ ordering: e.target.value })}
          aria-label="Sort"
        >
          {sorts.map((o) => (
            <option key={o.value || "none"} value={o.value || ""}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Clear filters */}
      <div className="mt-3 flex items-center justify-end">
        <button
          type="button"
          onClick={onClear}
          className="text-xs underline opacity-90 hover:opacity-100"
        >
          Clear filters
        </button>
      </div>
    </div>
  );
}
