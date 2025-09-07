// Simple, clean stat card: hover/scale only
import { motion } from "framer-motion";

export default function StatCard({
  title,
  value,
  note,
  icon: Icon,
  children,
  className = "",
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.995 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className={`
        rounded-lg bg-background/70 p-4
        shadow-md hover:shadow-lg
        dark:shadow-none dark:border dark:border-border/50
        flex flex-col h-full
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="font-heading text-sm opacity-80">{title}</div>
        {Icon ? <Icon className="w-5 h-5 opacity-80" /> : null}
      </div>

      {/* Main content */}
      <div className="mt-2">
        {value !== "" ? (
          <div className="text-2xl font-semibold">{value}</div>
        ) : children ? (
          <div>{children}</div>
        ) : null}
      </div>

      {/* Footer note pinned to bottom */}
      {note ? <div className="mt-auto pt-2 text-xs opacity-70">{note}</div> : null}
    </motion.div>
  );
}