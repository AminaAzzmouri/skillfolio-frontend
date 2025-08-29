import { useEffect, useRef, useState } from "react";
import { useAppStore } from "../../store/useAppStore";

/**
 * CertificateForm
 * - Create mode (default): uses store.createCertificate(form)
 * - Edit mode (optional): pass `initial` + `onSubmit` + `submitLabel`
 *   initial: { title, issuer, date_earned, file_upload? }
 *   onSubmit: async (form) => void   // parent handles updateCertificate(...)
 *   submitLabel: string              // e.g., "Save changes"
 */
export default function CertificateForm({
  initial = null,
  onSubmit = null,
  submitLabel = "Add Certificate",
}) {
  const createCertificate = useAppStore((s) => s.createCertificate);

  const fileRef = useRef(null);
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
        setForm({ title: "", issuer: "", date_earned: "", file: null });
        if (fileRef.current) fileRef.current.value = "";
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
    submitting ||
    !form.title.trim() ||
    !form.issuer.trim() ||
    !form.date_earned;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-background/80 border border-gray-700 p-4 rounded mb-6 max-w-xl grid gap-4"
    >
      <input
        className="rounded p-3 bg-background/60 border border-gray-700"
        placeholder="Title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        required
      />
      <input
        className="rounded p-3 bg-background/60 border border-gray-700"
        placeholder="Issuer (e.g., Coursera)"
        value={form.issuer}
        onChange={(e) => setForm({ ...form, issuer: e.target.value })}
        required
      />
      <input
        type="date"
        className="rounded p-3 bg-background/60 border border-gray-700"
        value={form.date_earned}
        onChange={(e) => setForm({ ...form, date_earned: e.target.value })}
        required
      />
      <input
        ref={fileRef}
        type="file"
        className="rounded p-3 bg-background/60 border border-gray-700"
        onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })}
        accept=".pdf,image/*"
      />

      {error && <p className="text-sm text-accent">{error}</p>}

      <button
        disabled={disabled}
        className="bg-primary rounded p-3 font-semibold hover:bg-primary/80 transition disabled:opacity-60"
      >
        {submitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
