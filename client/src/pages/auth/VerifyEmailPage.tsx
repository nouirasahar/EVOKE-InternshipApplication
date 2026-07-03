import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthMessage } from "@/components/auth/AuthMessage";

export default function VerifyEmailPage() {
  const [resent, setResent] = useState(false);
  const [loading, setLoading] = useState(false);

  const resend = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setResent(true);
    }, 700);
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Verify your email address"
        subtitle="We sent a verification link to your email. Please check your inbox to activate your EVOKE account."
      >
        <div className="mb-6 flex items-center justify-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full glass">
            <Mail className="h-8 w-8 text-foreground" />
            <span className="absolute inset-0 rounded-full bg-brand opacity-30 blur-2xl" />
          </div>
        </div>

        {resent && (
          <div className="mb-4">
            <AuthMessage title="Verification email resent." />
          </div>
        )}

        <Link to="/login">
          <AuthButton type="button">I have verified my email</AuthButton>
        </Link>

        <button
          type="button"
          onClick={resend}
          disabled={loading}
          className="mt-4 w-full text-center text-sm text-muted-foreground transition hover:text-foreground disabled:opacity-60"
        >
          {loading ? "Sending…" : "Resend verification email"}
        </button>
      </AuthCard>
    </AuthLayout>
  );
}
