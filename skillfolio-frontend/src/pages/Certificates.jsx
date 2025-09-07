/* Docs: see docs/pages/Certificates.jsx.md */
import { useEffect, useRef, useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import { api } from "../lib/api";
import SearchBar from "../components/SearchBar";
import Filters from "../components/Filters";
import Pagination from "../components/Pagination";
import CertificateForm from "../components/forms/CertificateForm";
import ConfirmDialog from "../components/ConfirmDialog";
import Modal from "../components/Modal";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap } from "lucide-react";
import ActionButton from "../components/ActionButton";

// Helpers to detect previewable file types
const isImageUrl = (url) =>
  /\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/i.test(url || "");
const isPdfUrl = (url) => /\.pdf(\?|$)/i.test(url || "");

// Build absolute URL if DRF returns a relative path
const makeFileUrl = (maybeUrl) => {
  if (!maybeUrl || typeof maybeUrl !== "string") return null;
  if (maybeUrl.startsWith("http")) return maybeUrl;
  const base = api?.defaults?.baseURL || "";
  return `${base.replace(/\/$/, "")}/${maybeUrl.replace(/^\//, "")}`;
};

// Sorting options
const certSortOptions = [
  { value: "", label: "Sort…" },
  { value: "date_earned", label: "Date (oldest)" },
  { value: "-date_earned", label: "Date (newest)" },
  { value: "title", label: "Title (A→Z)" },
  { value: "-title", label: "Title (Z→A)" },
];

export default function CertificatesPage() {
  const [sp, setSp] = useSearchParams();
  const search = sp.get("search") || "";
  const ordering = sp.get("ordering") || "";
  const page = sp.get("page") || 1;
  const idParam = sp.get("id") || ""; // support /certificates?id=<pk>

  const filters = {
    issuer: sp.get("issuer") || "",
    date_earned: sp.get("date_earned") || "",
    id: idParam,
  };

  // Store state + action
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

  // 🔔 flash → focus & highlight (like Projects)
  const flash = useAppStore((s) => s.flash);
  const [highlightId, setHighlightId] = useState(null);

  // add/edit UI states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const formRef = useRef(null);

  // Compact panel "Clear all" (mirror Projects)
  const clearAllCompactFilters = () => {
    const next = new URLSearchParams(sp);
    next.delete("issuer");
    next.delete("date_earned");
    next.delete("ordering");
    next.delete("page");
    setSp(next);
  };

  // Compact filter drawer state
  const [showFilters, setShowFilters] = useState(false);

  // Count applied (issuer/date/sort)
  const appliedCount = useMemo(() => {
    let n = 0;
    if (filters.issuer) n += 1;
    if (filters.date_earned) n += 1;
    if (ordering) n += 1;
    return n;
  }, [filters.issuer, filters.date_earned, ordering]);

  // Today (YYYY-MM-DD) to limit date picker (no future dates; today allowed)
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  // Fetch certificates whenever query params change
  useEffect(() => {
    fetchCertificates({ search, ordering, filters, page });
  }, [
    fetchCertificates,
    search,
    ordering,
    page,
    filters.issuer,
    filters.date_earned,
    filters.id,
  ]);

  // flash → focus
  useEffect(() => {
    if (!flash?.certificateId) return;
    const id = String(flash.certificateId);
    const t = setTimeout(() => {
      const el = document.getElementById(`certificate-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightId(id);
        setTimeout(() => setHighlightId(null), 1600);
      }
    }, 50);
    return () => clearTimeout(t);
  }, [flash, certificates]);

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

  // per-certificate projects count (cached)
  const [countsByCertId, setCountsByCertId] = useState({});
  const [countErrors, setCountErrors] = useState({});
  const visibleCertIds = useMemo(
    () => certificates.map((c) => c.id),
    [certificates]
  );

  useEffect(() => {
    let cancelled = false;

    const fetchCount = async (certId) => {
      try {
        const { data } = await api.get(`/api/projects/?certificate=${certId}`);
        let count = 0;
        if (Array.isArray(data)) count = data.length;
        else if (
          typeof data === "object" &&
          data &&
          typeof data.count === "number"
        )
          count = data.count;
        else if (Array.isArray(data?.results)) count = data.results.length;
        if (!cancelled)
          setCountsByCertId((prev) => ({ ...prev, [certId]: count }));
      } catch {
        if (!cancelled) setCountErrors((prev) => ({ ...prev, [certId]: true }));
      }
    };
    for (const id of visibleCertIds) {
      if (countsByCertId[id] == null && !countErrors[id]) fetchCount(id);
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
      clear_file: form.clear_file ? true : undefined,
    });

    // refresh so the card shows the new/cleared file
    await fetchCertificates({ search, ordering, filters, page });

    setEditingId(null);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    await deleteCertificate(confirmDeleteId);
    setConfirmDeleteId(null);
  };

  return (
    <div className="min-h-screen bg-background text-text p-6">
      {/* Header */}
      <div className="relative mt-8 mb-20">
        <Link
          to="/dashboard"
          className="absolute left-0 top-1/2 -translate-y-1/2 text-sm underline opacity-90 hover:opacity-100"
        >
          ← Back to dashboard
        </Link>
        <div className="flex items-center justify-center gap-3">
          <Link
            to="/goals"
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border hover:bg-gradient-to-r hover:from-primary/20 hover:via-secondary/20 hover:to-accent/20 transition"
            aria-label="Go to Goals"
            title="Goals"
          >
            ‹
          </Link>
          <h1 className="font-heading text-2xl flex items-center gap-2">
            <GraduationCap
              className="w-6 h-6 text-primary"
              aria-hidden="true"
            />
            Certificates
          </h1>

          <Link
            to="/projects"
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border hover:bg-gradient-to-r hover:from-primary/20 hover:via-secondary/20 hover:to-accent/20 transition"
            aria-label="Go to Projects"
            title="Projects"
          >
            ›
          </Link>
        </div>
      </div>

      {/* Active id filter chip */}
      {idParam && (
        <div className="mb-3 text-sm">
          <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full border border-gray-600">
            <span className="opacity-90">
              Filtered by certificate id: <strong>#{idParam}</strong>
            </span>
            <button
              className="underline hover:opacity-80"
              onClick={() => {
                const next = new URLSearchParams(sp);
                next.delete("id");
                next.delete("page");
                setSp(next);
              }}
            >
              Clear filter
            </button>
          </span>
        </div>
      )}

      {/* Search + Filters toggle */}
      <div className="flex items-center gap-2 mb-2 max-w-lg">
        <div className="w-full max-w-sm">
          <SearchBar
            value={search}
            onChange={(v) => writeParams({ search: v })}
            placeholder="Search certificates…"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className="px-3 py-2 rounded-md text-sm font-medium bg-[#fdf6e3] text-gray-800 shadow-sm ring-1 ring-border/40 hover:bg-[#f6edda] hover:shadow-md dark:bg-background/60 dark:text-gray-200 dark:ring-white/10"
        >
          Filters ▾
          {appliedCount > 0 && (
            <span className="ml-2 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full text-xs font-semibold bg-primary/20 text-primary ring-1 ring-primary/30 dark:bg-secondary/20 dark:text-secondary dark:ring-secondary/30">
              {appliedCount}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            <Filters
              type="certificates"
              value={{
                issuer: filters.issuer,
                date_earned: filters.date_earned,
                ordering,
              }}
              onChange={(patch) => writeParams(patch)}
              onClear={clearAllCompactFilters}
              layout="grid"
              dateMax={todayStr}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* States */}
      {certificatesLoading && (
        <div className="opacity-80 mb-4">Loading certificates…</div>
      )}
      {certificatesError && (
        <div className="text-accent mb-4">Error: {certificatesError}</div>
      )}
      {!certificatesLoading &&
        !certificatesError &&
        certificates.length === 0 && (
          <div className="opacity-80 mb-4">No certificates yet.</div>
        )}

      {/* Grid */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-8 mt-8">
        {certificates.map((c) => {
          const url = makeFileUrl(c.file_upload);
          const showImg = url && isImageUrl(url);
          const showPdf = url && isPdfUrl(url);
          const isEditing = editingId === c.id;
          const projCount =
            typeof c.project_count === "number"
              ? c.project_count
              : countsByCertId[c.id];
          const cardId = `certificate-${c.id}`;
          const highlight = String(highlightId) === String(c.id);

          return (
            <motion.div
              key={c.id}
              id={cardId}
              whileHover={{ scale: 1.02, rotateX: 1, rotateY: -1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={
                "group relative rounded-xl bg-background/70 overflow-hidden transition-shadow h-full " +
                "shadow-xl hover:shadow-lg dark:shadow-none dark:border dark:border-border/50 " +
                (highlight ? "ring-2 ring-accent shadow-lg" : "")
              }
            >
              {/* subtle glow on hover */}
              <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />

              {/* VIEW MODE */}
              {!isEditing ? (
                <div className="flex h-full flex-col">
                  {/* Header */}
                  <div className="p-3 flex items-start justify-between gap-3 mt-2">
                    <div className="min-w-0">
                      <div
                        className="font-semibold line-clamp-1"
                        title={c.title}
                      >
                        {c.title}
                      </div>
                      <div className="text-xs opacity-80 flex items-center gap-1.5 truncate mt-1">
                        <span className="truncate">{c.issuer}</span>
                        <span aria-hidden className="opacity-60">
                          •
                        </span>
                        <time className="shrink-0">{c.date_earned}</time>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <ActionButton
                        icon="edit"
                        title="Edit"
                        shape="circle"
                        onClick={() => setEditingId(c.id)}
                      />
                      <ActionButton
                        icon="delete"
                        title="Delete"
                        shape="circle"
                        variant="danger"
                        onClick={() => setConfirmDeleteId(c.id)}
                      />
                    </div>
                  </div>
                  {/* Preview area — fixed height (always present); shows file or a placeholder */}
                  <div className="px-3 pb-2 mt-4">
                    <div className="rounded overflow-hidden min-h-[12rem] max-h-48 ring-1 ring-border/50 dark:ring-white/5 bg-background/40 flex items-center justify-center shadow-lg">
                      {url ? (
                        showImg ? (
                          <img
                            src={url}
                            alt={`${c.title} file`}
                            className="w-full h-48 object-cover block"
                            loading="lazy"
                          />
                        ) : showPdf ? (
                          // Try native PDF viewer; show fallback link if it can't render
                          <div className="w-full h-48 bg-white flex items-center justify-center">
                            <embed
                              src={
                                encodeURI(url) +
                                "#toolbar=0&navpanes=0&scrollbar=0"
                              }
                              type="application/pdf"
                              className="w-full h-full"
                            />
                            {/* Fallback (shown if browser can't embed or server blocks framing) */}
                            <noscript>
                              <a
                                className="text-xs underline"
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Open PDF
                              </a>
                            </noscript>
                          </div>
                        ) : (
                          <div className="text-xs opacity-60 italic px-2 text-center">
                            File type not previewable
                          </div>
                        )
                      ) : (
                        <div className="text-xs opacity-60 italic px-2 text-center">
                          No file uploaded
                        </div>
                      )}
                    </div>

                    {url && (
                      <a
                        className="text-xs mt-2 inline-block underline"
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`View file for ${c.title}`}
                      >
                        View file
                      </a>
                    )}
                  </div>

                  {/* Footer — pinned */}
                  <div className="mt-auto px-3 py-2 flex items-center justify-between">
                    <div className="text-xs opacity-80">
                      Projects:{" "}
                      <span className="opacity-100 font-medium">
                        {projCount == null ? "…" : projCount}
                      </span>
                    </div>

                    {typeof projCount === "number" && projCount > 0 && (
                      <Link
                        to={`/projects?certificate=${c.id}`}
                        className="text-xs underline opacity-90 hover:opacity-100 whitespace-nowrap"
                      >
                        View projects
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                // EDIT MODE
                <div className="p-3">
                  <CertificateForm
                    initial={c}
                    submitLabel="Save changes"
                    onSubmit={(form) => handleEditSubmit(c.id, form)}
                    onCancel={() => setEditingId(null)}
                    previewUrl={makeFileUrl(c.file_upload)}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

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

      {/* Floating + (Add Certificate) */}
      <div className="fixed right-6 bottom-6 z-50 group">
        <motion.button
          type="button"
          onClick={() => setShowForm(true)}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="h-12 w-12 rounded-full bg-primary text-white text-2xl leading-none shadow-lg hover:bg-gradient-to-r hover:from-primary hover:via-secondary hover:to-accent transition flex items-center justify-center"
          aria-label="New certificate"
          title="New certificate"
        >
          +
        </motion.button>
      </div>

      {/* Modals */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Add Certificate"
      >
        <div ref={formRef} className="max-w-2xl">
          <CertificateForm
            onCancel={() => setShowForm(false)}
            onSuccess={() => setShowForm(false)}
          />
        </div>
      </Modal>

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
