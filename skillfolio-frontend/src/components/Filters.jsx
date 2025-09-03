/* Documentation: see docs/components/Filters.jsx.md */

/**
 * Filters
 * Renders filter controls per entity `type`.
 *
 * Props:
 * - type: 'certificates' | 'projects'
 * - value: object of current filters (e.g., { issuer:'', date_earned:'', status:'', certificate:'' })
 * - onChange: (newFiltersObj) => void
 */
export default function Filters({ type, value = {}, onChange }) {
  const set = (k, v) => onChange?.({ ...value, [k]: v || "" });

  if (type === "certificates") {
    return (
      <div className="grid gap-2 md:grid-cols-3">
        <input
          className="rounded p-3 bg-background/60 border border-gray-700"
          placeholder="Issuer"
          value={value.issuer || ""}
          onChange={(e) => set("issuer", e.target.value)}
        />
        <input
          type="date"
          className="rounded p-3 bg-background/60 border border-gray-700"
          value={value.date_earned || ""}
          onChange={(e) => set("date_earned", e.target.value)}
        />
        {/* spacer or future filter */}
        <div />
      </div>
    );
  }

  if (type === "projects") {
    return (
      <div className="grid gap-2 md:grid-cols-3">
        <input
          className="rounded p-3 bg-background/60 border border-gray-700"
          placeholder="Certificate ID"
          value={value.certificate || ""}
          onChange={(e) => set("certificate", e.target.value)}
        />
        <select
          className="rounded p-3 bg-background/60 border border-gray-700"
          value={value.status || ""}
          onChange={(e) => set("status", e.target.value)}
        >
          <option value="">Any status</option>
          <option value="planned">Planned</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        {/* spacer or future filter */}
        <div />
      </div>
    );
  }

  return null;
}