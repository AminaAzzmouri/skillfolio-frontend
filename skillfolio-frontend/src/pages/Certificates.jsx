import { useState } from "react";
import { useAppStore } from "../store/useAppStore";

export default function Certificates() {
  const addCertificate = useAppStore((s) => s.addCertificate);
  const certificates = useAppStore((s) => s.certificates);
  const [form, setForm] = useState({ title: "", issuer: "", date_earned: "", file: null });

  const onSubmit = (e) => {
    e.preventDefault();
    // Week 4: POST to /api/certificates with FormData
    addCertificate({ title: form.title, issuer: form.issuer, date_earned: form.date_earned, file_name: form.file?.name || null });
    setForm({ title: "", issuer: "", date_earned: "", file: null });
  };

  return (
    <div className="min-h-screen bg-background text-text p-6">
      <h1 className="font-heading text-2xl mb-4">Certificates</h1>

      <form onSubmit={onSubmit} className="bg-background/80 border border-gray-700 p-4 rounded mb-6 max-w-xl">
        <div className="grid gap-4">
          <input className="rounded p-3 bg-background/60 border border-gray-700" placeholder="Title"
            value={form.title} onChange={(e)=>setForm({...form, title:e.target.value})} required />
          <input className="rounded p-3 bg-background/60 border border-gray-700" placeholder="Issuer (e.g., Coursera)"
            value={form.issuer} onChange={(e)=>setForm({...form, issuer:e.target.value})} required />
          <input type="date" className="rounded p-3 bg-background/60 border border-gray-700"
            value={form.date_earned} onChange={(e)=>setForm({...form, date_earned:e.target.value})} required />
          <input type="file" className="rounded p-3 bg-background/60 border border-gray-700"
            onChange={(e)=>setForm({...form, file:e.target.files?.[0] || null})} />
          <button className="bg-primary rounded p-3 font-semibold hover:bg-primary/80 transition">Add Certificate</button>
        </div>
      </form>

      <ul className="space-y-2 max-w-xl">
        {certificates.map((c) => (
          <li key={c.id} className="p-3 rounded border border-gray-700 bg-background/70">
            <div className="font-semibold">{c.title}</div>
            <div className="text-sm text-gray-300">{c.issuer} • {c.date_earned}</div>
            {c.file_name && <div className="text-xs mt-1">File: {c.file_name}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}
