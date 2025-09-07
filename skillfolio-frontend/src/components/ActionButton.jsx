// Reusable small icon-only button for actions like Edit/Delete
// Uses lucide-react icons and Tailwind. Minimal, theme-friendly, accessible.
//
// Usage:
//  <ActionIconButton icon="edit"    title="Edit"    onClick={...} />
//  <ActionIconButton icon="delete"  title="Delete"  variant="danger" onClick={...} />
//
// Props:
//  - icon: "edit" | "delete" | "pencil" | "trash" (alias support)
//  - onClick: () => void
//  - title?: string                // tooltip + accessible label
//  - disabled?: boolean
//  - variant?: "default" | "ghost" | "danger"
//  - size?: "sm" | "md"            // visual size
//  - shape?: "rounded" | "circle"  // border radius style
//
// Note: We keep the styles subtle to match your existing cards
// (rings, soft hover, and dark-mode friendly).

import { forwardRef, memo } from "react";
import { Pencil, Trash2, ExternalLink, Plus } from "lucide-react";

const ICONS = {
  edit: Pencil,
  pencil: Pencil,
  delete: Trash2,
  trash: Trash2,
  external: ExternalLink,
  plus: Plus,
};

const sizeClasses = {
  sm: "w-8 h-8 text-[15px]",
  md: "w-9 h-9 text-[16px]",
};

const radiusClasses = {
  rounded: "rounded-md",
  circle: "rounded-full",
};

const baseClasses =
  "inline-flex items-center justify-center " +
  "ring-1 ring-border/50 dark:ring-white/10 " +
  "bg-background/60 hover:bg-white/5 transition " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 " +
  "disabled:opacity-60 disabled:cursor-not-allowed";

const variantClasses = {
  default: "",
  ghost: "bg-transparent hover:bg-white/5",
  // tonal red outline (subtle in light, calm in dark)
  danger:
    "ring-1 ring-rose-300 text-rose-700 bg-white hover:bg-rose-50 " + // light
    "dark:ring-rose-400/40 dark:text-rose-300 dark:bg-transparent dark:hover:bg-rose-500/10",
};

function IconByName(name) {
  const key = String(name || "").toLowerCase();
  return ICONS[key] || Pencil;
}

const VisuallyHidden = ({ children }) => (
  <span className="sr-only">{children}</span>
);

const ActionButton = memo(
  forwardRef(function ActionButton(
    {
      as,
      icon = "edit",
      onClick,
      href,
      target,
      rel,
      title = "",
      disabled = false,
      variant = "default",
      size = "sm",
      shape = "rounded",
      className = "",
      "aria-label": ariaLabel,
    },
    ref
  ) {
    const Icon = IconByName(icon);
    const Comp = as === "a" ? "a" : "button";
    const extraProps =
      Comp === "a" ? { href, target, rel } : { type: "button", onClick };

    return (
      <Comp
        ref={ref}
        title={title || ariaLabel || undefined}
        aria-label={ariaLabel || title || icon}
        disabled={Comp !== "a" ? disabled : undefined}
        className={[
          baseClasses,
          variantClasses[variant] || "",
          sizeClasses[size] || sizeClasses.sm,
          radiusClasses[shape] || radiusClasses.rounded,
          className,
        ].join(" ")}
        {...extraProps}
      >
        <Icon className="w-4 h-4 opacity-90" aria-hidden="true" />
        {!title && !ariaLabel ? <VisuallyHidden>{icon}</VisuallyHidden> : null}
      </Comp>
    );
  })
);

export default ActionButton;
