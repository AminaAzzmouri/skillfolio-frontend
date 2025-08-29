/* Docs: see docs/pages/Certificates.jsx.md */

import { useEffect, useMemo, useState, useRef } from "react";
import { useAppStore } from "../store/useAppStore";
import { api } from "../lib/api";
import CertificateForm from "../components/forms/CertificateForm";
import ConfirmDialog from "../components/ConfirmDialog";

// Best-effort helpers to detect previewable file types by extension
const isImageUrl = (url) => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(url || "");
const isPdfUrl   = (url) => /\.pdf$/i.test(url || "");

export default function Certificates() {
  // store state + actions
  const {
    certificates,
    certificatesLoading,
    certificatesError,
    fetchCertificates,
    updateCertificate,
    deleteCertificate,
  } = useAppStore((s) => ({
    certificates: s.certificates,
    certificatesLoading: s.certificatesLoading,
    certificatesError: s.certificatesError,
    fetchCertificates: s.fetchCertificates,
    updateCertificate: s.updateCertificate,
    deleteCertificate: s.deleteCertificate,
  }));

  // add/edit UI states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const formRef = useRef(null);

  // Build absolute URL if DRF returns a relative path (e.g., /media/...)
  const makeFileUrl = (maybeUrl) => {
    if (!maybeUrl || typeof maybeUrl !== "string") return null;
    if (maybeUrl.startsWith("http")) return maybeUrl;
    const base = api?.defaults?.baseURL || "";
    return `${base.replace(/\/$/, "")}/${maybeUrl.replace(/^\//, "")}`;
  };

  // Newest first by date_earned (fallback to original order if missing)
  const orderedCertificates = useMemo(() => {
    return [...certificates].sort((a, b) => {
      const da = a?.date_earned ?? "";
      const db = b?.date_earned ?? "";
      return db.localeCompare(da);
    });
  }, [certificates]);

  // load from API on mount
  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  // scroll when opening the form
  useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showForm]);

  const handleEditSubmit = async (id, form) => {
    // form has: { title, issuer, date_earned, file? }
    await updateCertificate(id, {
      title: form.title,
      issuer: form.issuer,
      date_earned: form.date_earned,
      file: form.file || undefined,
    });
    setEditingId(null);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    await deleteCertificate(confirmDeleteId);
    setConfirmDeleteId(null);
  };

  return (
    <div className="min-h-screen bg-background text-text p-6">
      <h1 className="font-heading text-2xl mb-4">Certificates</h1>

      {/* List states FIRST */}
      {certificatesLoading && (
        <div className="opacity-80 mb-4">Loading certificates…</div>
      )}

      {certificatesError && (
        <div className="text-accent mb-4">Error: {certificatesError}</div>
      )}

      {!certificatesLoading &&
        !certificatesError &&
        orderedCertificates.length === 0 && (
          <div className="opacity-80 mb-2">No certificates yet.</div>
        )}

      <ul className="space-y-2 max-w-xl mb-6">
        {orderedCertificates.map((c) => {
          const url = makeFileUrl(c.file_upload);
          const showImg = url && isImageUrl(url);
          const showPdf = url && isPdfUrl(url);

          const isEditing = editingId === c.id;

          return (
            <li
              key={c.id}
              className="p-3 rounded border border-gray-700 bg-background/70"
            >
              {/* VIEW MODE */}
              {!isEditing && (
                <>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">{c.title}</div>
                      <div className="text-sm text-gray-300">
                        {c.issuer} • {c.date_earned}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingId(c.id)}
                        className="px-3 py-1 rounded border border-gray-600 hover:bg-white/5"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(c.id)}
                        className="px-3 py-1 rounded bg-accent text-black font-semibold hover:bg-accent/80"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Inline preview (image or PDF) */}
                  {url && (
                    <>
                      {showImg ? (
                        <img
                          src={url}
                          alt={`${c.title} file`}
                          className="mt-2 max-h-48 w-auto rounded border border-gray-700"
                          loading="lazy"
                        />
                      ) : showPdf ? (
                        <div className="mt-2">
                          <object
                            data={`${url}#page=1&zoom=100`}
                            type="application/pdf"
                            width="100%"
                            height="300"
                            className="rounded border border-gray-700"
                          >
                            <a
                              className="text-xs underline"
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Open PDF
                            </a>
                          </object>
                        </div>
                      ) : null}

                      {/* Always offer a link */}
                      <a
                        className="text-xs mt-2 inline-block underline"
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View file
                      </a>
                    </>
                  )}
                </>
              )}

              {/* EDIT MODE */}
              {isEditing && (
                <div className="mt-2">
                  <CertificateForm
                    initial={c}
                    submitLabel="Save changes"
                    onSubmit={(form) => handleEditSubmit(c.id, form)}
                  />
                  <div className="flex items-center gap-2 -mt-2 mb-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 rounded border border-gray-600 hover:bg-white/5"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Toggle button */}
      <div className="max-w-xl">
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-primary rounded p-3 font-semibold hover:bg-primary/80 transition"
        >
          {showForm ? "Hide Add Certificate" : "Add Certificate"}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div ref={formRef} className="max-w-xl mt-4">
          <CertificateForm submitLabel="Add Certificate" />
        </div>
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Delete certificate?"
        message="This action cannot be undone."
        onCancel={() => setConfirmDeleteId(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
