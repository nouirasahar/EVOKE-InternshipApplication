import { useEffect, useState } from "react";
import { UserPageLayout } from "@/components/user/UserPageLayout";
import { CheckCircle, Mail, User } from "lucide-react";
import { getCurrentUser } from "@/services/user.service";

type CurrentUser = {
  _id: string;
  fullName: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await getCurrentUser();
        setUser(data.user);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return (
    <UserPageLayout
      title="Profile"
      subtitle="Manage your EVOKE account information."
    >
      {loading && (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-6">
          Loading profile...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-6 text-red-300">
          {error}
        </div>
      )}

      {!loading && user && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <User className="mb-4 h-5 w-5 text-cyan-400" />
              <p className="text-sm text-muted-foreground">Full name</p>
              <p className="mt-1 text-lg font-semibold">
                {user.fullName}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <Mail className="mb-4 h-5 w-5 text-violet-400" />
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="mt-1 truncate text-lg font-semibold">
                {user.email}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <CheckCircle className="mb-4 h-5 w-5 text-emerald-400" />
              <p className="text-sm text-muted-foreground">
                Email status
              </p>
              <p className="mt-1 text-lg font-semibold">
                {user.emailVerified ? "Verified" : "Not verified"}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
            <p className="text-sm text-muted-foreground">
              Member since
            </p>

            <p className="mt-2 text-lg font-semibold">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </>
      )}
    </UserPageLayout>
  );
}