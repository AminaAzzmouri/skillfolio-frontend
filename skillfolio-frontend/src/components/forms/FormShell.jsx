// Card wrapper with title/description/body/actions — matches Profile styling
export default function FormShell({
  title,
  description = "",
  children,
  actions = null,
  className = "",
}) {
  return (
    <section
      className={[
        "rounded ring-1 ring-border/60 bg-surface p-4",
        "dark:bg-background/70 dark:ring-white/10",
        className,
      ].join(" ")}
    >
      {title ? (
        <h2 className="font-heading font-semibold tracking-tight mb-2">
          {title}
        </h2>
      ) : null}

      {description ? (
        <p className="font-heading text-sm opacity-80 mb-3">
          {description}
        </p>
      ) : null}

      <div className="grid gap-3">{children}</div>

      {actions ? <div className="mt-3 flex gap-2">{actions}</div> : null}
    </section>
  );
}
