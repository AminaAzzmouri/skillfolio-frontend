/* Docs: see docs/components/Certificates.jsx.md */

import { useEffect } from "react";
import { useAppStore } from "../store/useAppStore";
import CertificateForm from "../components/forms/CertificateForm";

export default function Certificates() {
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

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  return (
    <div className="min-h-screen bg-background text-text p-6">
      <h1 className="font-heading text-2xl mb-4">Certificates</h1>

      <CertificateForm />

      {certificatesLoading && (
        <div className="opacity-80 mb-4">Loading certificates…</div>
      )}
      {certificatesError && (
        <div className="text-accent mb-4">Error: {certificatesError}</div>
      )}
      {!certificatesLoading && !certificatesError && certificates.length === 0 && (
        <div className="opacity-80">No certificates yet.</div>
      )}

      <ul className="space-y-2 max-w-xl">
        {certificates.map((c) => (
          <li key={c.id} className="p-3 rounded border border-gray-700 bg-background/70">
            <div className="font-semibold">{c.title}</div>
            <div className="text-sm text-gray-300">{c.issuer} • {c.date_earned}</div>
            {c.file_upload && (
              <a
                className="text-xs mt-1 inline-block underline"
                href={c.file_upload}
                target="_blank"
                rel="noreferrer"
              >
                View file
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
