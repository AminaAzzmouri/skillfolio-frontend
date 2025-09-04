// Simple, clean stat card: hover/scale only, NO animated borders/glows.
import { motion } from "framer-motion";

export default function StatCard({
  title,
  value,
  note,
  icon: Icon,
  children,
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.995 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className="
        rounded-lg bg-background/70 
        shadow-sm hover:shadow-md 
        border border-border/50
        p-4
      "
    >
      <div className="flex items-center justify-between">
        <div className="text-sm opacity-80">{title}</div>
        {Icon ? <Icon className="w-5 h-5 opacity-80" /> : null}
      </div>

      {/* Main stat value (if provided) */}
      {value !== "" && (
        <div className="mt-1 text-2xl font-semibold">{value}</div>
      )}

      {/* Custom content (e.g., progress bar + %) */}
      {children ? <div className="mt-2">{children}</div> : null}

      {/* Footer note */}
      {note ? <div className="mt-2 text-xs opacity-70">{note}</div> : null}
    </motion.div>
  );
}

