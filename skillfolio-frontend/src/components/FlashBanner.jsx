import { useEffect, useRef, useState } from "react";
import { useAppStore } from "../store/useAppStore";

export default function FlashBanner() {
  const flash = useAppStore((s) => s.flash);
  const clearFlash = useAppStore((s) => s.clearFlash);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);
  const hoverRef = useRef(false);

  // choose a sensible duration; longer for success so it's noticeable
  const durationMs = (() => {
    if (!flash) return 0;
    // customize per message type if you like
    if (flash.type === "error") return 6000;
    return 3800; // success/info default
  })();

  // show when flash changes
  useEffect(() => {
    if (!flash) {
      setVisible(false);
      return;
    }
    setVisible(true);

    // auto-dismiss with pause-on-hover
    const startTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (!hoverRef.current) {
          setVisible(false);
          // delay clear to allow exit CSS animation if any
          setTimeout(() => clearFlash(), 150);
        } else {
          // if hovering at expiry, retry a bit later
          startTimer();
        }
      }, durationMs);
    };
    startTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [flash?.ts]); // re-run when new flash is set

  if (!flash || !visible) return null;

  // Light mode gets strong contrast; dark mode keeps your existing translucent look
  const color =
    flash.type === "error"
      ? "bg-red-50 border-red-300 text-red-800 dark:bg-red-500/15 dark:border-red-400 dark:text-red-200"
      : flash.type === "success"
      ? "bg-green-50 border-green-300 text-green-800 dark:bg-green-500/15 dark:border-green-400 dark:text-green-200"
      : "bg-blue-50 border-blue-300 text-blue-800 dark:bg-blue-500/15 dark:border-blue-400 dark:text-blue-200";

  return (
    <div
      role="status"
      className={`fixed top-3 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-lg border ${color} shadow-lg backdrop-blur-md`}
      onMouseEnter={() => { hoverRef.current = true; }}
      onMouseLeave={() => { hoverRef.current = false; }}
    >
      <div className="flex items-center gap-3">
        <span className="font-heading font-semibold capitalize">{flash.type}</span>
        <span className="opacity-90">{flash.message}</span>
        <button
          onClick={() => { setVisible(false); setTimeout(() => clearFlash(), 120); }}
          className="ml-2 px-2 py-0.5 rounded border text-xs border-black/10 hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
          aria-label="Dismiss"
        >
          Close
        </button>
      </div>
    </div>
  );
}
