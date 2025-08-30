/* Docs: see docs/components/CertificateForm.jsx.md */

import { useEffect, useId, useRef, useState } from "react";
import { useAppStore } from "../../store/useAppStore";

/**
 * CertificateForm
 * - Create mode (default): uses store.createCertificate(form)
 * - Edit mode (optional): pass `initial` + `onSubmit` + `submitLabel`
 *   initial: { title, issuer, date_earned, file_upload? }
 *   onSubmit: async (form) => void   // parent handles updateCertificate(...)
 *   submitLabel: string              // e.g., "Save changes"
 * - Optional onCancel for modal usage
 */
export default function CertificateForm({
  initial = null,
  onSubmit = null,
  submitLabel = "Add Certificate",
  onCancel = null,
}) {
  const createCertificate = useAppStore((s) => s.createCertificate);

  const fileRef = useRef(null);
  const titleId = useId();
  const issuerId = useId();
  const dateId = useId();
  const fileId = useId();

  const [form, setForm] = useState({
    title: "",
    issuer: "",
    date_earned: "",
    file: null, // File for new upload (optional)
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Prefill when editing
  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title ?? "",
        issuer: initial.issuer ?? "",
        date_earned: initial.date_earned ?? "",
        file: null, // never prefill as File object
      });
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [initial]);

  const handleReset = () => {
    if (initial) {
      setForm({
        title: initial.title ?? "",
        issuer: initial.issuer ?? "",
        date_earned: initial.date_earned ?? "",
        file: null,
      });
    } else {
      setForm({ title: "", issuer: "", date_earned: "", file: null });
    }
    if (fileRef.current) fileRef.current.value = "";
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(form); // edit mode
      } else {
        await createCertificate(form); // create mode
        // Reset after creating
        handleReset();
      }
    } catch (err) {
      const msg =
        err?.response?.data?.detail ??
        (typeof err?.response?.data === "object"
          ? JSON.stringify(err.response.data)
          : err?.response?.data) ??
        err?.message ??
        "Request failed";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const disabled =
    submitting || !form.title.trim() || !form.issuer.trim() || !form.date_earned;

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-1">
        <label htmlFor={titleId} className="text-sm opacity-80">Title</label>
        <input
          id={titleId}
          className="rounded p-3 bg-background/60 border border-gray-700"
          placeholder="e.g., Google Data Analytics"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
      </div>

      <div className="grid gap-1">
        <label htmlFor={issuerId} className="text-sm opacity-80">Issuer</label>
        <input
          id={issuerId}
          className="rounded p-3 bg-background/60 border border-gray-700"
          placeholder="e.g., Coursera"
          value={form.issuer}
          onChange={(e) => setForm({ ...form, issuer: e.target.value })}
          required
        />
      </div>

      <div className="grid gap-1">
        <label htmlFor={dateId} className="text-sm opacity-80">Date earned</label>
        <input
          id={dateId}
          type="date"
          className="rounded p-3 bg-background/60 border border-gray-700"
          value={form.date_earned}
          onChange={(e) => setForm({ ...form, date_earned: e.target.value })}
          required
        />
      </div>

      <div className="grid gap-1">
        <label htmlFor={fileId} className="text-sm opacity-80">Upload file (PDF or image)</label>
        <input
          id={fileId}
          ref={fileRef}
          type="file"
          className="rounded p-3 bg-background/60 border border-gray-700"
          onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })}
          accept=".pdf,image/*"
        />
      </div>

      {error && <p className="text-sm text-accent">{error}</p>}

      <div className="flex items-center gap-2">
        <button
          disabled={disabled}
          className="bg-primary rounded p-3 font-semibold hover:bg-primary/80 transition disabled:opacity-60"
        >
          {submitting ? "Saving…" : submitLabel}
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="px-3 py-2 rounded border border-gray-600 hover:bg-white/5"
        >
          Reset
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 rounded border border-gray-600 hover:bg-white/5"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
