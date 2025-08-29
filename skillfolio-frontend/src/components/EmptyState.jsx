export default function EmptyState({ message = "Nothing here yet.", isError = false }) {
  return (
    <div className={isError ? "text-accent text-sm" : "opacity-70"}>
      {message}
    </div>
  );
}
