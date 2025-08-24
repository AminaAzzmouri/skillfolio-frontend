/* Docs: see docs/components/Dashboard.jsx.md */

import { useEffect } from "react";
import { useAppStore } from "../store/useAppStore.js";
import { Link } from "react-router-dom";


export default function Dashboard() {
  const certificates = useAppStore((s) => s.certificates);
  const projects = useAppStore((s) => s.projects);
  const fetchCertificates = useAppStore((s) => s.fetchCertificates);

  useEffect(() => {

    // Load certificates so counts are real
    fetchCertificates();
  }, [fetchCertificates]);

  const goalProgress = 0;

  return (
    <div className="flex min-h-screen bg-background text-text">
      <aside className="w-64 bg-background/90 p-4 border-r border-gray-700 hidden md:block">
        <h2 className="font-heading text-xl mb-6">Dashboard</h2>
        <ul className="flex flex-col gap-3">
          <li><Link to="/certificates">Certificates</Link></li>
          <li><Link to="/projects">Projects</Link></li>
          <li>Profile</li>
        </ul>
      </aside>
      
      {/* Main content */}
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-heading mb-4">Welcome to Your Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-background/70 p-4 rounded">Total Certificates: {certificates.length}</div>
          <div className="bg-background/70 p-4 rounded">Total Projects: {projects.length}</div>
          <div className="bg-background/70 p-4 rounded">Goal Progress: {goalProgress}%</div>
        </div>

        <div className="bg-background/70 p-4 rounded">
          <h2 className="font-heading mb-2">Recent Certificates</h2>
          <ul>
            {certificates.map((c) => (
              <li key={c.id}>{c.title}</li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
