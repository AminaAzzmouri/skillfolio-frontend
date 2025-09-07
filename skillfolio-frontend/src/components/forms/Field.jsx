// Label + input wrapper with consistent spacing + ring/focus behavior
export default function Field({
  label,
  htmlFor,
  error = "",
  children, // put your <input .../> here
  note = "", // optional helper text under the input
}) {
  return (
    <label className="text-sm" htmlFor={htmlFor}>
      {label ? (
        <div className="font-heading font-medium tracking-tight mb-1">
          {label}
        </div>
      ) : null}

      {children}

      {error ? (
        <div className="mt-1 text-xs text-accent">{error}</div>
      ) : note ? (
        <div className="mt-1 text-xs opacity-70">{note}</div>
      ) : null}
    </label>
  );
}
