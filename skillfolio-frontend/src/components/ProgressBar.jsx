// Docs: see docs/components/ProgressBar.jsx.md

/**
 * ProgressBar
 * Props:
 *  - value: number (0..100)
 *  - label?: string
 *  - showNumber?: boolean (default true)
 *  - height?: number (px height of the bar, default 12)
 *  - trackClassName?: string (tailwind classes for the track)
 *  - barClassName?: string (tailwind classes for the filled part)
 */
export default function ProgressBar({
  value = 0,
  label = "",
  showNumber = true,
  height = 12,
  trackClassName = "bg-gray-800",
  barClassName = "bg-primary",
}) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div className="w-full max-w-[220px]">
      {(label || showNumber) && (
        <div className="flex items-center justify-between text-xs mb-1 opacity-80">
          {label ? <span className="font-heading">{label}</span> : <span />}
          {showNumber && <span className="font-medium opacity-90">{pct}%</span>}
        </div>
      )}
      <div
        className={`w-full rounded overflow-hidden ${trackClassName}`}
        style={{ height }}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <div
          className={`h-full ${barClassName} bg-stripes`}
          style={{ width: `${pct}%` }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
