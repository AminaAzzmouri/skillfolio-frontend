/* Docs: see docs/pages doc/Projects.jsx.md */

import { useEffect, useState } from "react";
import { useAppStore } from "../store/useAppStore";
import ProfileForm from "../components/forms/ProfileForm";

export default function Profile() {
  const user = useAppStore((s) => s.user);
  const fetchProfile = useAppStore((s) => s.fetchProfile);
  const updateProfile = useAppStore((s) => s.updateProfile);
  const updatePassword = useAppStore((s) => s.updatePassword);
  const deleteMyAccount = useAppStore((s) => s.deleteMyAccount);
  const logout = useAppStore((s) => s.logout);

  const loading = useAppStore((s) => s.profileLoading);
  const error = useAppStore((s) => s.profileError);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Ensure freshest server values (username/email might have changed elsewhere)
    fetchProfile().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdate = async (payload, { full }) => {
    setSubmitting(true);
    try {
      await updateProfile(payload, { full });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = ({ current_password, new_password }) =>
    updatePassword({ current_password, new_password });

  const handleDelete = async () => {
    await deleteMyAccount();
    // After deletion, go to /login
    window.location.replace("/login");
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-background text-text px-4 py-8">
        <div className="mx-auto max-w-2xl">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-8">
        <h1 className="font-heading text-2xl">Profile</h1>

        <ProfileForm
          initial={{ username: user?.username || "", email: user?.email || "" }}
          submitting={submitting}
          error={error || ""}
          onUpdate={handleUpdate}
          onChangePassword={handleChangePassword}
          onDelete={handleDelete}
        />

        <div className="opacity-70 text-xs">
          {/* optional debug/logout shortcut */}
          <button className="underline" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
