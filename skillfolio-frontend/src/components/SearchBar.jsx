/* Documentation: see docs/components/SearchBar.jsx.md */

import { useEffect, useMemo, useState } from "react";

/**
 * SearchBar
 * - Debounces input and calls onChange(term)
 * - Optional: controlled by `value` prop
 * - Accepts optional `className` for extra layout classes
 */
export default function SearchBar({
  value = "",
  onChange,
  placeholder = "Search…",
  delay = 400,
  className = "",
}) {
  const [local, setLocal] = useState(value);

  // keep in sync if parent changes value externally
  useEffect(() => setLocal(value), [value]);

  // debounce
  const debounced = useMemo(() => {
    let t;
    return (v) => {
      clearTimeout(t);
      t = setTimeout(() => onChange?.(v), delay);
    };
  }, [onChange, delay]);

  return (
    <input
      className={
        [
          // unified input look (light beige, dark translucent)
          "w-full rounded h-10 px-3 text-sm",
          "bg-background/60 shadow-lg ring-1 ring-border/100",   // light theme
          "dark:bg-background/60 dark:ring-white/10",       // dark theme
          "focus:outline-none focus:ring-2 focus:ring-primary/50",
          "placeholder:opacity-70",
          className,
        ].join(" ")
      }
      placeholder={placeholder}
      value={local}
      onChange={(e) => {
        const v = e.target.value;
        setLocal(v);
        debounced(v);
      }}
      aria-label="Search"
    />
  );
}
