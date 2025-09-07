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

  useEffect(() => {
    fetchProfile().catch(() => {});
  }, []);
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

  const scrollBannerIntoView = () => {
    if (!bannerRef.current) return;
    const offset = 80;
    const y =
      bannerRef.current.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: y, behavior: "smooth" });
    bannerRef.current.focus({ preventScroll: true });
  };

  useEffect(() => {
    if (successMsg || errorMsg || profileError) scrollBannerIntoView();
  }, [successMsg, errorMsg, profileError]);

  const clearSuccessSoon = () => setTimeout(() => setSuccessMsg(""), 3500);

  const onSave = async () => {
    setFieldErrs({ username: "", email: "" });
    setErrorMsg("");
    setSuccessMsg("");

    const patch = {};
    if ((username ?? "") !== (user?.username ?? ""))
      patch.username = (username ?? "").trim();
    if ((email ?? "") !== (user?.email ?? ""))
      patch.email = (email ?? "").trim();
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
      const data = e?.response?.data;
      if (data && typeof data === "object") {
        const next = { username: "", email: "" };
        let focused = false;

        if (data.username) {
          next.username = Array.isArray(data.username)
            ? data.username[0]
            : String(data.username);
          if (usernameRef.current && !focused) {
            usernameRef.current.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
            usernameRef.current.focus();
            focused = true;
          }
        }
        if (data.email) {
          next.email = Array.isArray(data.email)
            ? data.email[0]
            : String(data.email);
          if (emailRef.current && !focused) {
            emailRef.current.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
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

      setSuccessMsg("Password updated");
      setCurrentPassword(newPassword);
      setNewPassword("");
      clearSuccessSoon();
    } catch (e) {
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

      const detail = typeof data?.detail === "string" ? data.detail : null;

      let msg =
        fieldErrCurrent ||
        nonField ||
        detail ||
        (status === 400
          ? "Incorrect current password"
          : apiErr(e, "Failed to change password"));

      setErrorMsg(msg);
    } finally {
      setSavingPassword(false);
    }
  };

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
            {successMsg ||
              errorMsg ||
              `Failed to load profile: ${String(profileError)}`}
          </div>
        )}

        {/* Account info */}
        <section className="rounded ring-1 ring-border/60 bg-surface p-4 dark:bg-background/70 dark:ring-white/10">
          <h2 className="font-semibold mb-3">Update account</h2>
          <div className="grid gap-3">
            <label className="text-sm">
              <div className="opacity-80 mb-1">Username</div>
              <input
                ref={usernameRef}
                autoComplete="username"
                className={`w-full rounded p-2 bg-background/60 ring-1 ${
                  fieldErrs.username ? "ring-accent" : "ring-border/60"
                } focus:outline-none focus:ring-2 focus:ring-primary/50`}
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (fieldErrs.username)
                    setFieldErrs((x) => ({ ...x, username: "" }));
                }}
              />
              {fieldErrs.username && (
                <div className="mt-1 text-xs text-accent">
                  {fieldErrs.username}
                </div>
              )}
            </label>

            <label className="text-sm">
              <div className="opacity-80 mb-1">Email</div>
              <input
                ref={emailRef}
                autoComplete="email"
                className={`w-full rounded p-2 bg-background/60 ring-1 ${
                  fieldErrs.email ? "ring-accent" : "ring-border/60"
                } focus:outline-none focus:ring-2 focus:ring-primary/50`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrs.email)
                    setFieldErrs((x) => ({ ...x, email: "" }));
                }}
              />
              {fieldErrs.email && (
                <div className="mt-1 text-xs text-accent">
                  {fieldErrs.email}
                </div>
              )}
            </label>

            <div className="mt-1 flex flex-row items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setUsername(user?.username || "");
                  setEmail(user?.email || "");
                }}
                disabled={savingProfile || profileLoading || !dirty}
                className="btn btn-ghost w-auto px-3 py-1.5 text-sm"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={onSave}
                disabled={!dirty || savingProfile || profileLoading}
                className="btn btn-primary w-auto px-3 py-1.5 text-sm  dirty && !savingProfile && !profileLoading disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingProfile ? "Saving…" : "Save changes"}
              </button>
            </div>
          </div>
        </section>

        {/* Password */}
        <section className="rounded ring-1 ring-border/60 bg-surface p-4 dark:bg-background/70 dark:ring-white/10">
          <h2 className="font-semibold mb-3">Change password</h2>
          <div className="grid gap-3">
            <label className="text-sm">
              <div className="opacity-80 mb-1">Current password</div>
              <input
                type="password"
                className="w-full rounded p-2 bg-background/60 ring-1 ring-border/60 focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </label>
            <label className="text-sm">
              <div className="opacity-80 mb-1">New password</div>
              <input
                type="password"
                className="w-full rounded p-2 bg-background/60 ring-1 ring-border/60 focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </label>
            <div className="mt-1 flex flex-row items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setCurrentPassword("");
                  setNewPassword("");
                }}
                disabled={savingPassword || (!currentPassword && !newPassword)}
                className="btn btn-ghost w-auto px-3 py-1.5 text-sm"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={onChangePassword}
                disabled={!currentPassword || !newPassword || savingPassword}
                className="btn btn-primary w-auto px-3 py-1.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingPassword ? "Updating…" : "Update password"}
              </button>
            </div>
          </div>
        </section>

        {/* Danger zone */}
        <section className="rounded ring-1 ring-red-300/60 bg-red-50/60 p-4 dark:bg-red-950/20 dark:ring-red-900/60">
          <h2 className="font-semibold mb-3 text-red-700 dark:text-red-300">
            Danger zone
          </h2>
          <p className="text-sm opacity-80 mb-3">
            Type <span className="font-mono">DELETE</span> to confirm.
          </p>
          <div className="flex items-center gap-2">
            <input
              className="w-44 rounded p-2 bg-red-50/70 ring-1 ring-red-300/70 focus:outline-none focus:ring-2 focus:ring-red-400/70 dark:bg-background/60 dark:ring-red-900/60"
              value={confirmDelete}
              onChange={(e) => setConfirmDelete(e.target.value)}
            />
            <button
              type="button"
              className={`btn ${
                confirmDelete === "DELETE" && !deleting
                  ? "btn-danger"
                  : "btn-ghost cursor-not-allowed"
              } ring-1 ring-red-300/70 dark:ring-red-900/60`}
              disabled={confirmDelete !== "DELETE" || deleting}
              onClick={startDelete}
            >
              {deleting ? "Deleting…" : "Delete account"}
            </button>
          </div>
        </section>
      </div>

      {/* Confirm delete modal */}
      <Modal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete account?"
      >
        <div className="space-y-3">
          <p className="text-sm opacity-80">
            This action is permanent. Your account and all personal data will be
            removed.
          </p>
          <div className="flex gap-2 justify-end">
            <button
              className="btn btn-outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              className={`btn ${
                deleting ? "btn-ghost cursor-not-allowed" : "btn-danger"
              }`}
              onClick={actuallyDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting…" : "Yes, delete"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Deleted notice modal */}
      <Modal
        open={showDeletedNotice}
        onClose={() => {}}
        title="Account deleted"
      >
        <div className="space-y-3">
          <p className="text-sm opacity-90">
            Your account was successfully deleted. We’re sorry to see you go.
          </p>
          <div className="flex gap-2 justify-end">
            <button
              className="btn btn-primary"
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
