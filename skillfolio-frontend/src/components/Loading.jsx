export default function Loading({ compact = false }) {
  return (
    <div className={compact ? "opacity-70 text-sm" : "opacity-70"}>
      Loading…
    </div>
  );
}
