/* Docs: see docs/pages/Certificates.jsx.md */

import { useEffect, useRef, useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { api } from "../lib/api";
import SearchBar from "../components/SearchBar";
import Filters from "../components/Filters";
import SortSelect from "../components/SortSelect";
import Pagination from "../components/Pagination";
import CertificateForm from "../components/forms/CertificateForm";
import ConfirmDialog from "../components/ConfirmDialog";

// Helpers to detect previewable file types
const isImageUrl = (url) => /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(url || "");
const isPdfUrl = (url) => /\.pdf$/i.test(url || "");

// Sorting options
const certSortOptions = [
  { value: "", label: "Sort…" },
  { value: "date_earned", label: "Date (oldest)" },
  { value: "-date_earned", label: "Date (newest)" },
  { value: "title", label: "Title (A→Z)" },
  { value: "-title", label: "Title (Z→A)" },
];

// Build absolute URL if DRF returns a relative path
const makeFileUrl = (maybeUrl) => {
  if (!maybeUrl || typeof maybeUrl !== "string") return null;
  if (maybeUrl.startsWith("http")) return maybeUrl;
  const base = api?.defaults?.baseURL || "";
  return `${base.replace(/\/$/, "")}/${maybeUrl.replace(/^\//, "")}`;
};

export default function CertificatesPage() {
  // URL params
  const [sp, setSp] = useSearchParams();
  const search = sp.get("search") || "";
  const ordering = sp.get("ordering") || "";
  const page = sp.get("page") || 1;
  const filters = {
    issuer: sp.get("issuer") || "",
    date_earned: sp.get("date_earned") || "",
  };

  // Store state + actions
  const {
    certificates,
    certificatesLoading,
    certificatesError,
    certificatesMeta,
    fetchCertificates,
    updateCertificate,
    deleteCertificate,
  } = useAppStore((s) => ({
    certificates: s.certificates,
    certificatesLoading: s.certificatesLoading,
    certificatesError: s.certificatesError,
    certificatesMeta: s.certificatesMeta,
    fetchCertificates: s.fetchCertificates,
    updateCertificate: s.updateCertificate,
    deleteCertificate: s.deleteCertificate,
  }));

  // add/edit UI states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const formRef = useRef(null);

  // Fetch certificates whenever query params change
  useEffect(() => {
    fetchCertificates({ search, ordering, filters, page });
  }, [fetchCertificates, search, ordering, page, filters.issuer, filters.date_earned]);

  // Scroll when opening the form
  useEffect(() => {
    if (showForm && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showForm]);

  // Helper to write params (and reset page)
  const writeParams = (patch) => {
    const next = new URLSearchParams(sp);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === "" || v == null) next.delete(k);
      else next.set(k, v);
    });
    next.delete("page");
    setSp(next);
  };

  // ---- NEW: per-certificate projects count (cached) ----
  const [countsByCertId, setCountsByCertId] = useState({}); // { [certId]: number }
  const [countErrors, setCountErrors] = useState({}); // optional, to avoid spamming

  // Visible cert IDs (current page slice only)
  const visibleCertIds = useMemo(() => certificates.map((c) => c.id), [certificates]);

  useEffect(() => {
    let cancelled = false;

    const fetchCount = async (certId) => {
      try {
        const { data } = await api.get(`/api/projects/?certificate=${certId}`);
        let count = 0;
        if (Array.isArray(data)) {
          count = data.length;
        } else if (typeof data === "object" && data && typeof data.count === "number") {
          count = data.count;
        } else if (Array.isArray(data?.results)) {
          // some paginations nest results
          count = data.results.length;
        }
        if (!cancelled) {
          setCountsByCertId((prev) => ({ ...prev, [certId]: count }));
        }
      } catch (err) {
        if (!cancelled) {
          setCountErrors((prev) => ({ ...prev, [certId]: true }));
          // Don't throw—silent fail; just show "–"
        }
      }
    };

    for (const id of visibleCertIds) {
      if (countsByCertId[id] == null && !countErrors[id]) {
        fetchCount(id);
      }
    }

    return () => {
      cancelled = true;
    };
  }, [visibleCertIds, countsByCertId, countErrors]);

  const handleEditSubmit = async (id, form) => {
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

      {/* Controls: Search / Filters / Sort */}
      <div className="grid gap-3 mb-6 max-w-xl">
        <SearchBar
          value={search}
          onChange={(v) => writeParams({ search: v })}
          placeholder="Search certificates (title/issuer)…"
        />
        <Filters
          type="certificates"
          value={filters}
          onChange={(f) =>
            writeParams({
              issuer: f.issuer || "",
              date_earned: f.date_earned || "",
            })
          }
        />
        <SortSelect
          value={ordering}
          options={certSortOptions}
          onChange={(v) => writeParams({ ordering: v || "" })}
        />
      </div>

      {/* States */}
      {certificatesLoading && <div className="opacity-80 mb-4">Loading certificates…</div>}
      {certificatesError && <div className="text-accent mb-4">Error: {certificatesError}</div>}
      {!certificatesLoading && !certificatesError && certificates.length === 0 && (
        <div className="opacity-80 mb-4">No certificates yet.</div>
      )}

      {/* Grid cards */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {certificates.map((c) => {
          const url = makeFileUrl(c.file_upload);
          const showImg = url && isImageUrl(url);
          const showPdf = url && isPdfUrl(url);
          const isEditing = editingId === c.id;
          const projCount = countsByCertId[c.id];

          return (
            <div key={c.id} className="p-3 rounded border border-gray-700 bg-background/70 flex flex-col">
              {/* VIEW MODE */}
              {!isEditing && (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold truncate" title={c.title}>{c.title}</div>
                      <div className="text-sm text-gray-300 truncate">
                        {c.issuer} • {c.date_earned}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
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

                  {/* Preview */}
                  {url && (
                    <>
                      {showImg ? (
                        <img
                          src={url}
                          alt={`${c.title} file`}
                          className="mt-2 max-h-40 w-full object-cover rounded border border-gray-700"
                          loading="lazy"
                        />
                      ) : showPdf ? (
                        <div className="mt-2">
                          <object
                            data={`${url}#page=1&zoom=100`}
                            type="application/pdf"
                            width="100%"
                            height="220"
                            className="rounded border border-gray-700"
                          >
                            <a className="text-xs underline" href={url} target="_blank" rel="noreferrer">
                              Open PDF
                            </a>
                          </object>
                        </div>
                      ) : null}

                      <a className="text-xs mt-2 inline-block underline" href={url} target="_blank" rel="noreferrer">
                        View file
                      </a>
                    </>
                  )}

                  {/* Footer: projects count + link */}
                  <div className="mt-3 pt-3 border-t border-gray-700 flex items-center justify-between">
                    <div className="text-sm opacity-80">
                      Projects:{" "}
                      <span className="opacity-100 font-medium">
                        {projCount == null ? "…" : projCount}
                      </span>
                    </div>
                    <Link
                      to={`/projects?certificate=${c.id}`}
                      className="text-xs underline opacity-90 hover:opacity-100"
                    >
                      View projects
                    </Link>
                  </div>
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
            </div>
          );
        })}
      </div>

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

      {/* Pagination */}
      <div className="max-w-xl mt-4">
        <Pagination
          page={Number(sp.get("page") || 1)}
          pageSize={10}
          total={certificatesMeta?.count || 0}
          loading={certificatesLoading}
          onPageChange={(n) => {
            const next = new URLSearchParams(sp);
            next.set("page", String(n));
            setSp(next);
          }}
        />
      </div>

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
