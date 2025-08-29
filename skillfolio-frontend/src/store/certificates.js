/* Docs: see docs/store doc/certificates.js.md */

import { api } from "../lib/api";

// GET /api/certificates/?... (supports filters later)
export async function listCertificates(params = {}) {
  const res = await api.get("/api/certificates/", { params });
  return res.data;
}

// POST /api/certificates/ (multipart)
export async function createCertificateMultipart({ title, issuer, date_earned, file }) {
  const fd = new FormData();
  fd.append("title", title);
  fd.append("issuer", issuer);
  fd.append("date_earned", date_earned);
  if (file) fd.append("file_upload", file);
  const res = await api.post("/api/certificates/", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// PATCH /api/certificates/:id/ (JSON or multipart)
export async function updateCertificate(id, payload) {
  // If payload includes a File, use multipart; otherwise JSON is fine
  if (payload.file instanceof File) {
    const fd = new FormData();
    for (const [k, v] of Object.entries(payload)) {
      if (k === "file") {
        if (v) fd.append("file_upload", v);
      } else if (v !== undefined && v !== null) {
        fd.append(k, v);
      }
    }
    const res = await api.patch(`/api/certificates/${id}/`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } else {
    const res = await api.patch(`/api/certificates/${id}/`, payload);
    return res.data;
  }
}

// DELETE /api/certificates/:id/
export async function deleteCertificate(id) {
  await api.delete(`/api/certificates/${id}/`);
}
