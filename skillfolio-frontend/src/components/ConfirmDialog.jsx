// /* Doc: see docs/components/ConfirmDialog.jsx.md

/**
 * Minimal generic confirm dialog.
 * Usage:
 *  <ConfirmDialog
 *    open={open}
 *    title="Delete certificate?"
 *    message="This action cannot be undone."
 *    onCancel={() => setOpen(false)}
 *    onConfirm={handleDelete}
 *  />
 */
export default function ConfirmDialog({ open, title, message, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded border border-gray-700 bg-background p-5">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        {message && <p className="text-sm opacity-80 mb-4">{message}</p>}
        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded border border-gray-600 hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-accent hover:bg-accent/80 text-black font-semibold"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
