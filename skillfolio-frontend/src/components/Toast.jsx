/* Docs: see components/Toast.jsx.md */

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * ToastContainer
 * props:
 *  - toasts: [{ id, type: 'error'|'info'|'success', message }]
 *  - onDismiss: (id) => void
 *  - autoHideMs?: number (default 3500)
 */
export default function ToastContainer({ toasts = [], onDismiss, autoHideMs = 3500 }) {
  useEffect(() => {
    // simple auto-hide
    const timers = toasts.map((t) =>
      setTimeout(() => onDismiss?.(t.id), autoHideMs)
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, onDismiss, autoHideMs]);

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className={[
              "rounded border px-3 py-2 shadow",
              t.type === "error"
                ? "bg-accent/15 border-accent/50 text-accent"
                : t.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                : "bg-background/90 border-gray-700 text-text",
            ].join(" ")}
          >
            <div className="flex items-start gap-2">
              <span className="mt-0.5">
                {t.type === "error" ? "⚠️" : t.type === "success" ? "✅" : "ℹ️"}
              </span>
              <div className="text-sm leading-snug">{t.message}</div>
              <button
                className="ml-2 text-xs opacity-80 hover:opacity-100"
                onClick={() => onDismiss?.(t.id)}
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}