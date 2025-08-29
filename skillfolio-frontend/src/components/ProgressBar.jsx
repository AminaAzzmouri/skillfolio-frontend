// Props: value (0..100), label? (string)
export default function ProgressBar({ value = 0, label = "" }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div className="w-full">
      {label ? <div className="text-xs mb-1 opacity-80">{label}</div> : null}
      <div
        className="h-3 w-full rounded bg-gray-800 overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <div
          className="h-full bg-primary"
          style={{ width: `${pct}%` }}
          aria-hidden="true"
        />
      </div>
      <div className="text-xs mt-1 opacity-80">{pct}%</div>
    </div>
  );
}
