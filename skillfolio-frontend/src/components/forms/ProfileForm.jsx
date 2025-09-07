import { useEffect, useId, useState } from "react";
import FormShell from "./FormShell";
import Field from "./Field";
import { TextInput } from "./Inputs";

/**
 * Props:
 *  - initial: { username, email }
 *  - submitting?: boolean
 *  - error?: string
 *  - onUpdate: (payload, { full?: boolean }) => Promise
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
        { full: false }
      );
    } catch (err) {
      setLocalErr(
        err?.response?.data?.detail ||
          (typeof err?.response?.data === "object"
            ? JSON.stringify(err.response.data)
            : err?.response?.data) ||
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
        { full: true }
      );
    } catch (err) {
      setLocalErr(
        err?.response?.data?.detail ||
          (typeof err?.response?.data === "object"
            ? JSON.stringify(err.response.data)
            : err?.response?.data) ||
          err?.message ||
          "Failed to replace profile"
      );
    }
  };

  const handleChangePassword = async () => {
    setPwBusy(true);
    setPwMsg("");
    try {
      await onChangePassword({
        current_password: pw.current,
        new_password: pw.next,
      });
      setPwMsg("Password updated.");
      setPw({ current: "", next: "" });
    } catch (err) {
      setPwMsg(
        err?.response?.data?.detail ||
          (typeof err?.response?.data === "object"
            ? JSON.stringify(err.response.data)
            : err?.response?.data) ||
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
      await onDelete();
    } finally {
      setDelBusy(false);
    }
  };

  return (
    <form onSubmit={handleSavePatch} className="grid gap-6">
      {/* Inline error (from parent) */}
      {!!(error || localErr) && (
        <div className="rounded border p-3 text-sm border-red-900 bg-red-950/30 text-red-200">
          {error || localErr}
        </div>
      )}

      {/* Account info */}
      <FormShell title="Update account">
        <Field label="Username" htmlFor={uId}>
          <TextInput
            id={uId}
            value={form.username}
            onChange={(e) => onChange({ username: e.target.value })}
            required
          />
        </Field>

        <Field label="Email" htmlFor={eId}>
          <TextInput
            id={eId}
            type="email"
            value={form.email}
            onChange={(e) => onChange({ email: e.target.value })}
            required
          />
        </Field>

        <div className="flex gap-2">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            title="PATCH username/email"
          >
            {submitting ? "Saving…" : "Save changes"}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleSavePut}
            disabled={submitting}
            title="PUT username+email (full replace)"
          >
            Save (PUT)
          </button>
        </div>
      </FormShell>

      {/* Password */}
      <FormShell title="Change password">
        <Field label="Current password" htmlFor={cpId}>
          <TextInput
            id={cpId}
            type="password"
            value={pw.current}
            onChange={(e) => setPw((x) => ({ ...x, current: e.target.value }))}
          />
        </Field>

        <Field label="New password" htmlFor={npId}>
          <TextInput
            id={npId}
            type="password"
            value={pw.next}
            onChange={(e) => setPw((x) => ({ ...x, next: e.target.value }))}
          />
        </Field>

        {pwMsg && <p className="text-sm opacity-80">{pwMsg}</p>}

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleChangePassword}
          disabled={pwBusy || !pw.current || !pw.next}
        >
          {pwBusy ? "Updating…" : "Update password"}
        </button>
      </FormShell>

      {/* Danger zone */}
      <FormShell
        title="Danger zone"
        className="ring-red-300/60 bg-red-50/60 dark:bg-red-950/20 dark:ring-red-900/60"
      >
        <p className="text-sm opacity-80">
          Type <span className="font-mono">DELETE</span> to confirm.
        </p>

        <div className="flex items-center gap-2">
          <TextInput
            className="w-44"
            value={confirmDelete}
            onChange={(e) => setConfirmDelete(e.target.value)}
          />
          <button
            type="button"
            className={`btn ${
              confirmDelete === "DELETE" && !delBusy
                ? "btn-danger"
                : "btn-ghost cursor-not-allowed"
            }`}
            disabled={confirmDelete !== "DELETE" || delBusy}
            onClick={handleDelete}
          >
            {delBusy ? "Deleting…" : "Delete account"}
          </button>
        </div>
      </FormShell>
    </form>
  );
}
