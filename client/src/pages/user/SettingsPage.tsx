import { UserPageLayout } from "@/components/user/UserPageLayout";
import { Shield, Mail, KeyRound } from "lucide-react";

export default function SettingsPage() {
  return (
    <UserPageLayout
      title="Settings"
      subtitle="Manage your account preferences and security."
    >
      <div className="grid gap-4">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <Mail className="mb-4 h-5 w-5 text-cyan-400" />
          <h2 className="text-lg font-semibold">Email notifications</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Receive updates about verification, password reset, and generated projects.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <KeyRound className="mb-4 h-5 w-5 text-violet-400" />
          <h2 className="text-lg font-semibold">Password</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Use the forgot password flow to securely reset your password.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <Shield className="mb-4 h-5 w-5 text-emerald-400" />
          <h2 className="text-lg font-semibold">Account security</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your account is protected with JWT authentication and verified email access.
          </p>
        </div>
      </div>
    </UserPageLayout>
  );
}