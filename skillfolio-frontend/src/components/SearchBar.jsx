/* Documentation: see docs/components/SearchBar.jsx.md */

import { useEffect, useMemo, useState } from "react";

/**
 * SearchBar
 * - Debounces input and calls onChange(term)
 * - Optional: controlled by `value` prop
 */
export default function SearchBar({ value = "", onChange, placeholder = "Search…" , delay = 400 }) {
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
      className="w-full rounded p-3 bg-background/60 border border-gray-700"
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
