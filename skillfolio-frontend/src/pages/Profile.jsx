import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import Modal from "../components/Modal";

export default function Profile() {
  const navigate = useNavigate();

  // store
  const user = useAppStore((s) => s.user);
  const profileLoading = useAppStore((s) => s.profileLoading);
  const profileError = useAppStore((s) => s.profileError);
  const fetchProfile = useAppStore((s) => s.fetchProfile);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const updatePassword = useAppStore((s) => s.updatePassword);
  const deleteMyAccount = useAppStore((s) => s.deleteMyAccount);

  // local state
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmDelete, setConfirmDelete] = useState("");

  // per-action flags
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // inline field errors (from BE)
  const [fieldErrs, setFieldErrs] = useState({ username: "", email: "" });

  // banners
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const bannerRef = useRef(null);

  // field refs to focus on errors
  const usernameRef = useRef(null);
  const emailRef = useRef(null);

  // modals
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeletedNotice, setShowDeletedNotice] = useState(false);

  useEffect(() => { fetchProfile().catch(() => {}); }, []);
  useEffect(() => {
    setUsername(user?.username || "");
    setEmail(user?.email || "");
  }, [user?.username, user?.email]);

  const dirty = useMemo(
    () =>
      (username ?? "") !== (user?.username ?? "") ||
      (email ?? "") !== (user?.email ?? ""),
    [username, email, user?.username, user?.email]
  );

  const apiErr = (e, fallback) =>
    e?.response?.data?.detail ||
    (typeof e?.response?.data === "object"
      ? JSON.stringify(e.response.data)
      : e?.response?.data) ||
    e?.message ||
    fallback;

  // precise scroll to banner (accounts for sticky navbar ~64–80px)
  const scrollBannerIntoView = () => {
    if (!bannerRef.current) return;
    const offset = 80;
    const y = bannerRef.current.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: "smooth" });
    bannerRef.current.focus({ preventScroll: true });
  };

  // whenever a banner message appears, scroll & focus
  useEffect(() => {
    if (successMsg || errorMsg || profileError) scrollBannerIntoView();
  }, [successMsg, errorMsg, profileError]);

  const clearSuccessSoon = () => setTimeout(() => setSuccessMsg(""), 3500);

  // ---- Profile save (PATCH) ----
  const onSave = async () => {
    setFieldErrs({ username: "", email: "" });
    setErrorMsg("");
    setSuccessMsg("");

    const patch = {};
    if ((username ?? "") !== (user?.username ?? "")) patch.username = (username ?? "").trim();
    if ((email ?? "") !== (user?.email ?? "")) patch.email = (email ?? "").trim();
    if (Object.keys(patch).length === 0) return;

    try {
      setSavingProfile(true);
      const changed = [];
      if ("username" in patch) changed.push("Username");
      if ("email" in patch) changed.push("Email");

      await updateProfile(patch, { full: false });

      setSuccessMsg(
        changed.length === 2
          ? "Credentials updated"
          : changed[0] === "Username"
          ? "Username updated"
          : "Email updated"
      );
      clearSuccessSoon();
    } catch (e) {
      // Handle field-level errors first
      const data = e?.response?.data;
      if (data && typeof data === "object") {
        const next = { username: "", email: "" };
        let focused = false;

        if (data.username) {
          next.username = Array.isArray(data.username) ? data.username[0] : String(data.username);
          if (usernameRef.current && !focused) {
            usernameRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
            usernameRef.current.focus();
            focused = true;
          }
        }
        if (data.email) {
          next.email = Array.isArray(data.email) ? data.email[0] : String(data.email);
          if (emailRef.current && !focused) {
            emailRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
            emailRef.current.focus();
            focused = true;
          }
        }
        setFieldErrs(next);

        if (!next.username && !next.email) {
          setErrorMsg(apiErr(e, "Failed to update profile"));
        }
      } else {
        setErrorMsg(apiErr(e, "Failed to update profile"));
      }
    } finally {
      setSavingProfile(false);
    }
  };

  // ---- Password update (fixed) ----
  const onChangePassword = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    if (!currentPassword || !newPassword) return;

    try {
      setSavingPassword(true);
      await updatePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });

      // Success: make new password become the current one for any subsequent change
      setSuccessMsg("Password updated");
      setCurrentPassword(newPassword); // <-- new becomes current
      setNewPassword("");             // <-- clear new field
      clearSuccessSoon();
    } catch (e) {
      // Extract the most helpful message for "incorrect current password"
      const data = e?.response?.data;
      const status = e?.response?.status;

      const fieldErrCurrent = Array.isArray(data?.current_password)
        ? data.current_password[0]
        : typeof data?.current_password === "string"
        ? data.current_password
        : null;

      const nonField = Array.isArray(data?.non_field_errors)
        ? data.non_field_errors[0]
        : typeof data?.non_field_errors === "string"
        ? data.non_field_errors
        : null;

      // Common server messages we normalize:
      const detail = typeof data?.detail === "string" ? data.detail : null;

      let msg =
        fieldErrCurrent ||
        nonField ||
        detail ||
        (status === 400 ? "Incorrect current password" : apiErr(e, "Failed to change password"));

      setErrorMsg(msg); // Banner shows + scrolls/focuses automatically
    } finally {
      setSavingPassword(false);
    }
  };

  // ---- Delete flow ----
  const startDelete = () => {
    if (confirmDelete !== "DELETE") return;
    setShowDeleteConfirm(true);
  };

  const actuallyDelete = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      setDeleting(true);
      await deleteMyAccount();
      setShowDeleteConfirm(false);
      setShowDeletedNotice(true);
      setTimeout(() => navigate("/login", { replace: true }), 1400);
    } catch (e) {
      setErrorMsg(apiErr(e, "Failed to delete account"));
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="font-heading text-2xl">Profile</h1>

        {(successMsg || errorMsg || profileError) && (
          <div
            ref={bannerRef}
            tabIndex={-1}
            role={successMsg ? "status" : "alert"}
            className={`rounded border p-3 text-sm outline-none ${
              successMsg
                ? "border-green-800 bg-green-900/20 text-green-200"
                : "border-red-900 bg-red-950/30 text-red-200"
            }`}
          >
            {successMsg || errorMsg || `Failed to load profile: ${String(profileError)}`}
          </div>
        )}

        {/* Account info */}
        <section className="rounded border border-gray-700 bg-background/70 p-4">
          <h2 className="font-semibold mb-3">Update account</h2>
          <div className="grid gap-3">
            <label className="text-sm">
              <div className="opacity-80 mb-1">Username</div>
              <input
                ref={usernameRef}
                className={`w-full rounded p-2 bg-background/60 border ${
                  fieldErrs.username ? "border-accent" : "border-gray-700"
                }`}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (fieldErrs.username) setFieldErrs((x) => ({ ...x, username: "" }));
                }}
              />
              {fieldErrs.username && (
                <div className="mt-1 text-xs text-accent">{fieldErrs.username}</div>
              )}
            </label>

            <label className="text-sm">
              <div className="opacity-80 mb-1">Email</div>
              <input
                ref={emailRef}
                className={`w-full rounded p-2 bg-background/60 border ${
                  fieldErrs.email ? "border-accent" : "border-gray-700"
                }`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrs.email) setFieldErrs((x) => ({ ...x, email: "" }));
                }}
              />
              {fieldErrs.email && (
                <div className="mt-1 text-xs text-accent">{fieldErrs.email}</div>
              )}
            </label>

            <button
              type="button"
              className={`rounded px-3 py-2 transition ${
                dirty && !savingProfile && !profileLoading
                  ? "bg-primary hover:bg-primary/80"
                  : "bg-gray-700 text-gray-300 cursor-not-allowed"
              }`}
              onClick={onSave}
              disabled={!dirty || savingProfile || profileLoading}
            >
              {savingProfile ? "Saving…" : "Save changes"}
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
              className={`rounded px-3 py-2 transition ${
                currentPassword && newPassword && !savingPassword
                  ? "bg-primary hover:bg-primary/80"
                  : "bg-gray-700 text-gray-300 cursor-not-allowed"
              }`}
              onClick={onChangePassword}
              disabled={!currentPassword || !newPassword || savingPassword}
            >
              {savingPassword ? "Updating…" : "Update password"}
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
              className={`rounded px-3 py-2 transition ${
                confirmDelete === "DELETE" && !deleting
                  ? "bg-accent text-black hover:bg-accent/80"
                  : "bg-gray-700 text-gray-300 cursor-not-allowed"
              }`}
              disabled={confirmDelete !== "DELETE" || deleting}
              onClick={startDelete}
            >
              Delete account
            </button>
          </div>
        </section>
      </div>

      {/* Confirm delete modal */}
      <Modal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete account?">
        <div className="space-y-3">
          <p className="text-sm opacity-80">
            This action is permanent. Your account and all personal data will be removed.
          </p>
          <div className="flex gap-2 justify-end">
            <button
              className="px-3 py-2 rounded border border-gray-700 hover:bg-white/5"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              className={`px-3 py-2 rounded ${deleting ? "bg-gray-700 text-gray-300" : "bg-accent text-black hover:bg-accent/80"}`}
              onClick={actuallyDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Yes, delete"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Deleted notice modal */}
      <Modal open={showDeletedNotice} onClose={() => {}} title="Account deleted">
        <div className="space-y-3">
          <p className="text-sm opacity-90">
            Your account was successfully deleted. We’re sorry to see you go.
          </p>
          <div className="flex gap-2 justify-end">
            <button
              className="px-3 py-2 rounded bg-primary hover:bg-primary/80"
              onClick={() => navigate("/login", { replace: true })}
            >
              Go to Login
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
