import { useState } from "react";
import { useAppStore } from "../../store/useAppStore";

export default function CertificateForm() {
  const createCertificate = useAppStore((s) => s.createCertificate);
  const [form, setForm] = useState({
    title: "",
    issuer: "",
    date_earned: "",
    file: null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await createCertificate(form);
      setForm({ title: "", issuer: "", date_earned: "", file: null });
    } catch (err) {
      const msg =
        err?.response?.data?.detail ??
        (typeof err?.response?.data === "object"
          ? JSON.stringify(err.response.data)
          : err?.response?.data) ??
        err?.message ??
        "Failed to create certificate";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
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
        type="file"
        className="rounded p-3 bg-background/60 border border-gray-700"
        onChange={(e) =>
          setForm({ ...form, file: e.target.files?.[0] || null })
        }
        accept=".pdf,image/*"
      />

      {error && <p className="text-sm text-accent">{error}</p>}

      <button
        disabled={submitting}
        className="bg-primary rounded p-3 font-semibold hover:bg-primary/80 transition disabled:opacity-60"
      >
        {submitting ? "Adding…" : "Add Certificate"}
      </button>
    </form>
  );
}
