import { useState } from "react";
import { useAppStore } from "../store/useAppStore";

export default function Profile() {
  const user = useAppStore((s) => s.user);

  // local form state (will wire to API later)
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmDelete, setConfirmDelete] = useState("");

  return (
    <div className="min-h-screen bg-background text-text px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <h1 className="font-heading text-2xl">Profile</h1>

        {/* Account info */}
        <section className="rounded border border-gray-700 bg-background/70 p-4">
          <h2 className="font-semibold mb-3">Update account</h2>
          <div className="grid gap-3">
            <label className="text-sm">
              <div className="opacity-80 mb-1">Username</div>
              <input
                className="w-full rounded p-2 bg-background/60 border border-gray-700"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </label>
            <label className="text-sm">
              <div className="opacity-80 mb-1">Email</div>
              <input
                className="w-full rounded p-2 bg-background/60 border border-gray-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <button
              type="button"
              className="rounded px-3 py-2 bg-primary hover:bg-primary/80"
              onClick={() => alert("TODO: wire to /api/me/ (PUT/PATCH)")}
            >
              Save changes
            </button>
          </div>
        </section>

        {/* Password */}
        <section className="rounded border border-gray-700 bg-background/70 p-4">
          <h2 className="font-semibold mb-3">Change password</h2>
          <div className="grid gap-3">
            <label className="text-sm">
              <div className="opacity-80 mb-1">Current password</div>
              <input
                type="password"
                className="w-full rounded p-2 bg-background/60 border border-gray-700"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </label>
            <label className="text-sm">
              <div className="opacity-80 mb-1">New password</div>
              <input
                type="password"
                className="w-full rounded p-2 bg-background/60 border border-gray-700"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </label>
            <button
              type="button"
              className="rounded px-3 py-2 bg-primary hover:bg-primary/80"
              onClick={() => alert("TODO: wire to /api/auth/change-password/")}
            >
              Update password
            </button>
          </div>
        </section>

        {/* Danger zone */}
        <section className="rounded border border-red-900 bg-red-950/20 p-4">
          <h2 className="font-semibold mb-3 text-red-300">Danger zone</h2>
          <p className="text-sm opacity-80 mb-3">
            Type <span className="font-mono">DELETE</span> to confirm.
          </p>
          <div className="flex items-center gap-2">
            <input
              className="w-44 rounded p-2 bg-background/60 border border-gray-700"
              value={confirmDelete}
              onChange={(e) => setConfirmDelete(e.target.value)}
            />
            <button
              type="button"
              className="rounded px-3 py-2 bg-accent text-black hover:bg-accent/80 disabled:opacity-60"
              disabled={confirmDelete !== "DELETE"}
              onClick={() => alert("TODO: wire to DELETE /api/me/ then logout")}
            >
              Delete account
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
