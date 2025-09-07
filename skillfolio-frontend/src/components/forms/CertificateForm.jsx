/* Docs: see docs/components/CertificateForm.jsx.md */

import { useEffect, useId, useRef, useState, useMemo } from "react";
import { useAppStore } from "../../store/useAppStore";
import FormShell from "./FormShell";
import Field from "./Field";
import { TextInput, NumberInput, DateInput } from "./Inputs";

const snapshot = (f) =>
  JSON.stringify({
    title: (f.title ?? "").trim(),
    issuer: (f.issuer ?? "").trim(),
    date_earned: f.date_earned ?? "",
    fileName: f.file?.name ?? "",
    clear_file: !!f.clear_file,
  });

export default function CertificateForm({
  initial = null,
  onSubmit = null,
  submitLabel = "Add Certificate",
  onCancel = null,
  onSuccess = null,
  previewUrl = "", // existing file URL when editing
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
    file: null,
    clear_file: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [baseline, setBaseline] = useState({
    title: "",
    issuer: "",
    date_earned: "",
    file: null,
    clear_file: false,
  });

  const isEdit = !!initial && !!onSubmit;
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    if (initial) {
      const next = {
        title: initial.title ?? "",
        issuer: initial.issuer ?? "",
        date_earned: initial.date_earned ?? "",
        file: null,
        clear_file: false,
      };
      setForm(next);
      setBaseline(next);
      if (fileRef.current) fileRef.current.value = "";
    } else {
      const empty = {
        title: "",
        issuer: "",
        date_earned: "",
        file: null,
        clear_file: false,
      };
      setForm(empty);
      setBaseline(empty);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [initial]);

  const baseSnap = snapshot(baseline);
  const curSnap = snapshot(form);
  const isDirty = !isEdit || baseSnap !== curSnap;

  const handleReset = () => {
    setForm(baseline);
    if (fileRef.current) fileRef.current.value = "";
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = { ...form, clear_file: !!form.clear_file };

      if (onSubmit) {
        await onSubmit(payload);
        setBaseline((prev) => ({
          ...(prev || {}),
          title: payload.title,
          issuer: payload.issuer,
          date_earned: payload.date_earned,
          file: null,
          clear_file: false,
        }));
        if (fileRef.current) fileRef.current.value = "";
      } else {
        await createCertificate(payload);
        const empty = {
          title: "",
          issuer: "",
          date_earned: "",
          file: null,
          clear_file: false,
        };
        setForm(empty);
        setBaseline(empty);
        if (fileRef.current) fileRef.current.value = "";
      }
      onSuccess?.();
    } catch (err) {
      const msg =
        err?.response?.data?.detail ??
        (typeof err?.response?.data === "object" ? JSON.stringify(err.response.data) : err?.response?.data) ??
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
    !form.date_earned ||
    (isEdit && !isDirty);

  const isImageUrl = (url) => /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(url || "");
  const isPdfUrl = (url) => /\.pdf(\?|$)/i.test(url || "");

  const hasExistingFile = isEdit && !!previewUrl && !form.clear_file && !form.file;

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      {error ? (
        <div className="rounded border p-3 text-sm border-red-900 bg-red-950/30 text-red-200">
          {error}
        </div>
      ) : null}

      <FormShell title={isEdit ? "Edit certificate" : "New certificate"}>
        {/* Title */}
        <Field label="Title" htmlFor={titleId}>
          <TextInput
            id={titleId}
            placeholder="e.g., Google Data Analytics"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </Field>

        {/* Issuer */}
        <Field label="Issuer" htmlFor={issuerId}>
          <TextInput
            id={issuerId}
            placeholder="e.g., Coursera"
            value={form.issuer}
            onChange={(e) => setForm({ ...form, issuer: e.target.value })}
            required
          />
        </Field>

        {/* Date earned */}
        <Field label="Date earned" htmlFor={dateId} note="Must be today or in the past.">
          <DateInput
            id={dateId}
            value={form.date_earned}
            onChange={(e) => setForm({ ...form, date_earned: e.target.value })}
            max={todayStr}
            required
          />
        </Field>

        {/* File section */}
        <input
          id={fileId}
          ref={fileRef}
          type="file"
          className="hidden"
          accept=".pdf,image/*"
          onChange={(e) => {
            const f = e.target.files?.[0] || null;
            setForm((prev) => ({
              ...prev,
              file: f,
              clear_file: false,
            }));
          }}
        />

        {isEdit ? (
          <>
            {hasExistingFile && (
              <Field label="Current file">
                <div className="rounded overflow-hidden min-h-[12rem] max-h-48 ring-1 ring-border/50 dark:ring-white/5 bg-background/40 flex items-center justify-center shadow-lg">
                  {isImageUrl(previewUrl) ? (
                    <img src={previewUrl} alt="Current file" className="w-full h-48 object-cover" />
                  ) : isPdfUrl(previewUrl) ? (
                    <object data={`${previewUrl}#page=1&zoom=100`} type="application/pdf" width="100%" height="192" />
                  ) : (
                    <div className="text-xs opacity-60 italic">File type not previewable</div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <a href={previewUrl} target="_blank" rel="noreferrer" className="text-xs underline">
                    View file
                  </a>
                  <button
                    type="button"
                    className="btn btn-outline text-sm"
                    onClick={() => fileRef.current?.click()}
                  >
                    Change file
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger text-sm"
                    onClick={() => {
                      setForm((f) => ({ ...f, clear_file: true, file: null }));
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                  >
                    Delete file
                  </button>
                </div>
              </Field>
            )}

            {!hasExistingFile && (
              <Field label="Upload file (PDF or image)" htmlFor={fileId}>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="btn btn-outline text-sm"
                    onClick={() => fileRef.current?.click()}
                  >
                    Choose file
                  </button>
                  {form.file ? (
                    <span className="text-sm">
                      Selected: <span className="font-medium">{form.file.name}</span>{" "}
                      <button
                        type="button"
                        className="underline text-xs ml-2"
                        onClick={() => {
                          setForm((f) => ({ ...f, file: null }));
                          if (fileRef.current) fileRef.current.value = "";
                        }}
                      >
                        remove
                      </button>
                    </span>
                  ) : (
                    <span className="text-xs opacity-70">No file chosen</span>
                  )}
                </div>

                {form.clear_file && !form.file && (
                  <div className="text-xs opacity-80 italic mt-1">
                    The existing file will be removed when you save.
                  </div>
                )}
              </Field>
            )}
          </>
        ) : (
          <Field label="Upload file (PDF or image)" htmlFor={fileId}>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="btn btn-outline text-sm"
                onClick={() => fileRef.current?.click()}
              >
                Choose file
              </button>
              {form.file ? (
                <span className="text-sm">
                  Selected: <span className="font-medium">{form.file.name}</span>{" "}
                  <button
                    type="button"
                    className="underline text-xs ml-2"
                    onClick={() => {
                      setForm((f) => ({ ...f, file: null }));
                      if (fileRef.current) fileRef.current.value = "";
                    }}
                  >
                    remove
                  </button>
                </span>
              ) : (
                <span className="text-xs opacity-70">No file chosen</span>
              )}
            </div>
          </Field>
        )}
      </FormShell>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          disabled={disabled}
          className="btn btn-primary disabled:cursor-not-allowed"
          title={isEdit && !isDirty ? "No changes to save" : undefined}
        >
          {submitting ? "Saving…" : submitLabel}
        </button>

        <button
          type="button"
          onClick={isDirty ? handleReset : undefined}
          disabled={!isDirty}
          className="btn btn-ghost disabled:cursor-not-allowed"
          title={!isDirty ? "Nothing to reset" : undefined}
        >
          Reset
        </button>

        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-outline">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
