import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPageLayout } from "@/components/user/UserPageLayout";
import { CheckCircle, Mail, User, Trash2, Save } from "lucide-react";
import {
  getCurrentUser,
  updateCurrentUser,
  deleteCurrentUser,
} from "@/services/user.service";
import { logout, saveUser } from "@/utils/token";

type CurrentUser = {
  _id: string;
  fullName: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
};

export default function ProfilePage() {
  const navigate = useNavigate();

  const [user, setUser] = useState<CurrentUser | null>(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await getCurrentUser();
        setUser(data.user);
        setFullName(data.user.fullName);
        saveUser(data.user);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const data = await updateCurrentUser(fullName);

      setUser(data.user);
      saveUser(data.user);
      setSuccess("Full name updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      await deleteCurrentUser();
      logout();
      navigate("/signup");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete account.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <UserPageLayout title="Profile" subtitle="Manage your EVOKE account information.">
      {loading && (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
          Loading profile...
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-6 text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-6 text-emerald-300">
          {success}
        </div>
      )}

      {!loading && user && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <User className="mb-4 h-5 w-5 text-cyan-400" />
              <p className="text-sm text-muted-foreground">Full name</p>
              <p className="mt-1 text-lg font-semibold">{user.fullName}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <Mail className="mb-4 h-5 w-5 text-violet-400" />
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="mt-1 truncate text-lg font-semibold">{user.email}</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <CheckCircle className="mb-4 h-5 w-5 text-emerald-400" />
              <p className="text-sm text-muted-foreground">Email status</p>
              <p className="mt-1 text-lg font-semibold">
                {user.emailVerified ? "Verified" : "Not verified"}
              </p>
            </div>
          </div>

          <form
            onSubmit={handleUpdateName}
            className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5"
          >
            <h2 className="text-lg font-semibold">Edit full name</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              This name is displayed in your profile and account menu.
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-cyan-400/40"
                placeholder="Full name"
              />

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
            <p className="text-sm text-muted-foreground">Member since</p>
            <p className="mt-2 text-lg font-semibold">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-5">
            <h2 className="text-lg font-semibold text-red-200">Delete account</h2>
            <p className="mt-1 text-sm text-red-200/70">
              Permanently delete your EVOKE account. This action cannot be undone.
            </p>

            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/30 px-5 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-400/10 disabled:opacity-60"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? "Deleting..." : "Delete account"}
            </button>
          </div>
        </>
      )}
    </UserPageLayout>
  );
}