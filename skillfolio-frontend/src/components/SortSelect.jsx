/* Documentation: see docs/components/SortSelect.jsx.md */

/**
 * SortSelect
 * Props:
 * - value: current ordering string (e.g., 'date_earned' or '-date_earned')
 * - options: [{ value:'date_earned', label:'Date (oldest)' }, ...]
 * - onChange: (ordering) => void
 */
export default function SortSelect({ value = "", options = [], onChange }) {
  return (
    <select
      className="rounded p-3 bg-background/60 border border-gray-700"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      aria-label="Sort"
    >
      {options.map((opt) => (
        <option key={opt.value || "none"} value={opt.value || ""}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}