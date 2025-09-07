/* Docs: see components/Pagination.jsx.md */

export default function Pagination({
  page = 1,
  pageSize = 10,
  total = 0,
  onPageChange,
  loading = false,
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const p = Math.min(Math.max(1, Number(page) || 1), pageCount);

  const disabled = loading;

  const go = (n) => {
    if (!disabled && n >= 1 && n <= pageCount && n !== p) onPageChange(n);
  };

  // small functionality: Prev / current / Next
  return (
    <div className="flex items-center gap-2 text-sm">
      <button
        className="px-3 py-1 rounded border border-gray-600 hover:bg-white/5 disabled:opacity-50"
        disabled={disabled || p <= 1}
        onClick={() => go(p - 1)}
      >
        Prev
      </button>

      <span className="font-heading opacity-80">
        Page <b>{p}</b> of <b>{pageCount}</b>
      </span>

      <button
        className="px-3 py-1 rounded border border-gray-600 hover:bg-white/5 disabled:opacity-50"
        disabled={disabled || p >= pageCount}
        onClick={() => go(p + 1)}
      >
        Next
      </button>
    </div>
  );
}