/* Docs: see docs/components/Home.jsx.md */

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-text p-6">
      <h1 className="font-heading text-2xl mb-4">Home</h1>
      <p className="opacity-80 mb-4">
        Welcome back! Quick links to manage your learning journey:
      </p>
      <ul className="list-disc pl-6 space-y-2">
        <li>View your <a className="underline" href="/dashboard">Dashboard</a></li>
        <li>Manage <a className="underline" href="/certificates">Certificates</a></li>
        <li>Manage <a className="underline" href="/projects">Projects</a></li>
      </ul>
    </div>
  );
}
