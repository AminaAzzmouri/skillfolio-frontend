/* Documentation: see docs/store/certificates.js.md */

import { api } from "../lib/api";

const qs = (obj = {}) =>
  Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

// GET /api/certificates/?page=&search=&ordering=&issuer=&date_earned=&id=
export async function listCertificates({ page, search, filters = {}, ordering, id } = {}) {
  // Accept both filters.id and a top-level id (belt & suspenders)
  const mergedFilters = { ...filters };
  if (id !== undefined && id !== null && id !== "") mergedFilters.id = id;

  const params = {
    page,
    search,
    ordering, // 'date_earned', '-date_earned', 'title', '-title'
    ...mergedFilters, // issuer, date_earned, id
  };

  const q = qs(params);
  const url = `/api/certificates/${q ? `?${q}` : ""}`;
  const { data } = await api.get(url);
  return data; // array or { results: [...] }
}

// POST /api/certificates/ (multipart)
export async function createCertificateMultipart({ title, issuer, date_earned, file }) {
  const fd = new FormData();
  fd.append("title", title);
  fd.append("issuer", issuer);
  fd.append("date_earned", date_earned);
  if (file) fd.append("file_upload", file);
  const { data } = await api.post("/api/certificates/", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

// PATCH /api/certificates/:id/ (smart: JSON or multipart if file present)
export async function updateCertificate(id, payload) {
  if (payload?.file instanceof File) {
    const fd = new FormData();
    for (const [k, v] of Object.entries(payload)) {
      if (k === "file") {
        if (v) fd.append("file_upload", v);
      } else if (v !== undefined && v !== null) {
        fd.append(k, v);
      }
    }
    const { data } = await api.patch(`/api/certificates/${id}/`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } else {
    const { data } = await api.patch(`/api/certificates/${id}/`, payload);
    return data;
  }
}

// DELETE /api/certificates/:id/
export async function deleteCertificate(id) {
  await api.delete(`/api/certificates/${id}/`);
}
