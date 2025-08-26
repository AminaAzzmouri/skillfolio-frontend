/* Docs: see docs/components/Certificates.jsx.md */

import { useEffect, useMemo } from "react";
import { useAppStore } from "../store/useAppStore";
import { api } from "../lib/api";
import CertificateForm from "../components/forms/CertificateForm";

export default function Certificates() {
  // store state + actions
  const {
    certificates,
    certificatesLoading,
    certificatesError,
    fetchCertificates,
  } = useAppStore((s) => ({
    certificates: s.certificates,
    certificatesLoading: s.certificatesLoading,
    certificatesError: s.certificatesError,
    fetchCertificates: s.fetchCertificates,
  }));

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

  return (
    <div className="min-h-screen bg-background text-text p-6">
      <h1 className="font-heading text-2xl mb-4">Certificates</h1>

      <CertificateForm />

      {/* List states */}
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

      <ul className="space-y-2 max-w-xl">
        {orderedCertificates.map((c) => {
          const url = makeFileUrl(c.file_upload);
          return (
            <li
              key={c.id}
              className="p-3 rounded border border-gray-700 bg-background/70"
            >
              <div className="font-semibold">{c.title}</div>
              <div className="text-sm text-gray-300">
                {c.issuer} • {c.date_earned}
              </div>
              {url && (
                <a
                  className="text-xs mt-1 inline-block underline"
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                >
                  View file
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
