import { useState } from "react";
import { useAppStore } from "../store/useAppStore";

export default function Projects() {
  const addProject = useAppStore((s) => s.addProject);
  const projects = useAppStore((s) => s.projects);
  const certificates = useAppStore((s) => s.certificates);
  const [form, setForm] = useState({ title: "", description: "", certificateId: "" });

  const onSubmit = (e) => {
    e.preventDefault();
    const cert = certificates.find(c => c.id === form.certificateId) || null;
    addProject({
      title: form.title,
      description: form.description,
      certificateId: cert?.id || null,
      certificateTitle: cert?.title || null,
      created_at: new Date().toISOString().slice(0,10),
    });
    setForm({ title: "", description: "", certificateId: "" });
  };

  return (
    <div className="min-h-screen bg-background text-text p-6">
      <h1 className="font-heading text-2xl mb-4">Projects</h1>

      <form onSubmit={onSubmit} className="bg-background/80 border border-gray-700 p-4 rounded mb-6 max-w-xl grid gap-4">
        <input className="rounded p-3 bg-background/60 border border-gray-700" placeholder="Project Title"
          value={form.title} onChange={(e)=>setForm({...form, title:e.target.value})} required />
        <textarea className="rounded p-3 bg-background/60 border border-gray-700" rows="4" placeholder="Description"
          value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})} required />
        <select className="rounded p-3 bg-background/60 border border-gray-700"
          value={form.certificateId} onChange={(e)=>setForm({...form, certificateId:e.target.value})}>
          <option value="">(Optional) Link to a Certificate</option>
          {certificates.map(c => <option value={c.id} key={c.id}>{c.title}</option>)}
        </select>
        <button className="bg-secondary rounded p-3 font-semibold hover:bg-secondary/80 transition">Add Project</button>
      </form>

      <ul className="space-y-2 max-w-xl">
        {projects.map((p) => (
          <li key={p.id} className="p-3 rounded border border-gray-700 bg-background/70">
            <div className="font-semibold">{p.title}</div>
            <div className="text-sm text-gray-300">{p.description}</div>
            <div className="text-xs mt-1">
              {p.certificateTitle ? `Linked to: ${p.certificateTitle}` : "Not linked"}
              {" • "}Created: {p.created_at}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
