/* Docs: see docs/components/Modal.jsx.md */

import { useEffect } from "react";

export default function Modal({ open, onClose, title = "", children, maxWidth = "max-w-2xl" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Dialog */}
      <div className="absolute inset-0 p-4 grid place-items-center">
        <div
          className={`w-full ${maxWidth} rounded border border-gray-700 bg-background shadow-lg`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button
              className="px-3 py-1 rounded border border-gray-600 hover:bg-white/5"
              onClick={onClose}
              aria-label="Close"
              title="Close"
            >
              ×
            </button>
          </div>

          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
