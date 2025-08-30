/* documentation: see docs/components/ThemeToggle.jsx.md */

import { useEffect, useState } from "react";

export default function ThemeToggle({ className = "" }) {
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    try {
      localStorage.setItem("sf-theme", isDark ? "dark" : "light");
    } catch (e) {}
  }, [isDark]);

  return (
    <button
      type="button"
      className={`rounded border border-border px-3 py-1 hover:bg-surface/60 ${className}`}
      onClick={() => setIsDark((v) => !v)}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
    >
      {isDark ? "🌙" : "☀️"}
    </button>
  );
}


