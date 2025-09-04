import { useEffect, useId, useState } from "react";

/**
 * ProfileForm
 * - Edit user identity (username/email)
 * - Change password
 * - Delete account (guarded)
 *
 * Props:
 *  - initial: { username, email }
 *  - submitting?: boolean (for the main Save button)
 *  - error?: string
 *  - onUpdate: (payload, { full?: boolean }) => Promise  // PUT when full=true; else PATCH
 *  - onChangePassword: ({ current_password, new_password }) => Promise
 *  - onDelete: () => Promise
 */
export default function ProfileForm({
  initial = { username: "", email: "" },
  submitting = false,
  error = "",
  onUpdate,
  onChangePassword,
  onDelete,
}) {
  const uId = useId();
  const eId = useId();
  const cpId = useId();
  const npId = useId();

  const [form, setForm] = useState({ username: "", email: "" });
  const [pw, setPw] = useState({ current: "", next: "" });
  const [confirmDelete, setConfirmDelete] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [delBusy, setDelBusy] = useState(false);
  const [localErr, setLocalErr] = useState("");

  useEffect(() => {
    setForm({
      username: initial?.username ?? "",
      email: initial?.email ?? "",
    });
  }, [initial?.username, initial?.email]);

  const onChange = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSavePatch = async (e) => {
    e.preventDefault();
    setLocalErr("");
    try {
      await onUpdate(
        {
          username: (form.username ?? "").trim(),
          email: (form.email ?? "").trim(),
        },
        { full: false } // PATCH
      );
    } catch (err) {
      setLocalErr(
        err?.response?.data?.detail ||
          (typeof err?.response?.data === "object" ? JSON.stringify(err.response.data) : err?.response?.data) ||
          err?.message ||
          "Failed to update profile"
      );
    }
  };

  const handleSavePut = async () => {
    setLocalErr("");
    try {
      await onUpdate(
        {
          username: (form.username ?? "").trim(),
          email: (form.email ?? "").trim(),
        },
        { full: true } // PUT
      );
    } catch (err) {
      setLocalErr(
        err?.response?.data?.detail ||
          (typeof err?.response?.data === "object" ? JSON.stringify(err.response.data) : err?.response?.data) ||
          err?.message ||
          "Failed to replace profile"
      );
    }
  };

  const handleChangePassword = async () => {
    setPwBusy(true);
    setPwMsg("");
    try {
      await onChangePassword({ current_password: pw.current, new_password: pw.next });
      setPwMsg("Password updated.");
      setPw({ current: "", next: "" });
    } catch (err) {
      setPwMsg(
        err?.response?.data?.detail ||
          (typeof err?.response?.data === "object" ? JSON.stringify(err.response.data) : err?.response?.data) ||
          err?.message ||
          "Failed to change password"
      );
    } finally {
      setPwBusy(false);
    }
  };

  const handleDelete = async () => {
    if (confirmDelete !== "DELETE") return;
    setDelBusy(true);
    try {
      await onDelete(); // caller should redirect to /login
    } finally {
      setDelBusy(false);
    }
  };

  return (
    <form onSubmit={handleSavePatch} className="grid gap-8">
      {/* Account info */}
      <section className="rounded border border-gray-700 bg-background/70 p-4">
        <h2 className="font-semibold mb-3">Update account</h2>
        <div className="grid gap-3">
          <label className="text-sm" htmlFor={uId}>
            <div className="opacity-80 mb-1">Username</div>
            <input
              id={uId}
              className="w-full rounded p-2 bg-background/60 border border-gray-700"
              value={form.username}
              onChange={(e) => onChange({ username: e.target.value })}
              required
            />
          </label>

          <label className="text-sm" htmlFor={eId}>
            <div className="opacity-80 mb-1">Email</div>
            <input
              id={eId}
              className="w-full rounded p-2 bg-background/60 border border-gray-700"
              value={form.email}
              onChange={(e) => onChange({ email: e.target.value })}
              required
            />
          </label>

          {!!(error || localErr) && <p className="text-sm text-accent">{error || localErr}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded px-3 py-2 bg-primary hover:bg-primary/80 disabled:opacity-60"
              disabled={submitting}
              title="PATCH username/email"
            >
              {submitting ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              className="rounded px-3 py-2 border border-gray-600 hover:bg-white/5"
              onClick={handleSavePut}
              disabled={submitting}
              title="PUT username+email (full replace)"
            >
              Save (PUT)
            </button>
          </div>
        </div>
      </section>

      {/* Password */}
      <section className="rounded border border-gray-700 bg-background/70 p-4">
        <h2 className="font-semibold mb-3">Change password</h2>
        <div className="grid gap-3">
          <label className="text-sm" htmlFor={cpId}>
            <div className="opacity-80 mb-1">Current password</div>
            <input
              id={cpId}
              type="password"
              className="w-full rounded p-2 bg-background/60 border border-gray-700"
              value={pw.current}
              onChange={(e) => setPw((x) => ({ ...x, current: e.target.value }))}
            />
          </label>
          <label className="text-sm" htmlFor={npId}>
            <div className="opacity-80 mb-1">New password</div>
            <input
              id={npId}
              type="password"
              className="w-full rounded p-2 bg-background/60 border border-gray-700"
              value={pw.next}
              onChange={(e) => setPw((x) => ({ ...x, next: e.target.value }))}
            />
          </label>
          {pwMsg && <p className="text-sm opacity-80">{pwMsg}</p>}
          <button
            type="button"
            className="rounded px-3 py-2 bg-primary hover:bg-primary/80 disabled:opacity-60"
            onClick={handleChangePassword}
            disabled={pwBusy || !pw.current || !pw.next}
          >
            {pwBusy ? "Updating…" : "Update password"}
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
            disabled={confirmDelete !== "DELETE" || delBusy}
            onClick={handleDelete}
          >
            {delBusy ? "Deleting…" : "Delete account"}
          </button>
        </div>
      </section>
    </form>
  );
}
