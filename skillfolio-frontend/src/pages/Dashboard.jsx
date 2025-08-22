export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-background text-text">
      {/* Sidebar */}
      <aside className="w-64 bg-background/90 p-4 border-r border-gray-700 hidden md:block">
        <h2 className="font-heading text-xl mb-6">Dashboard</h2>
        <ul className="flex flex-col gap-3">
          <li>Certificates</li>
          <li>Projects</li>
          <li>Profile</li>
        </ul>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-heading mb-4">Welcome to Your Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-background/70 p-4 rounded">Total Certificates: 0</div>
          <div className="bg-background/70 p-4 rounded">Total Projects: 0</div>
          <div className="bg-background/70 p-4 rounded">Goal Progress: 0%</div>
        </div>

        <div className="bg-background/70 p-4 rounded">
          <h2 className="font-heading mb-2">Recent Certificates</h2>
          <ul>
            <li>Certificate 1</li>
            <li>Certificate 2</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
