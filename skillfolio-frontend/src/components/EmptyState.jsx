/* Docs: see components/EmptyState.jsx.md */

export default function EmptyState({ message = "Nothing here yet.", isError = false }) {
   return (
    <div className={isError ? "text-accent text-sm font-heading" : "opacity-70 font-heading"}>
      {message}
    </div>
  );
}