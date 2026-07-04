import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Mail } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { verifyEmail } from "@/services/auth.service";

export default function VerifyEmailPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(Boolean(token));
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const verify = async () => {
      if (!token) return;

      try {
        await verifyEmail(token);
        setSuccess(true);

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Email verification failed.");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <AuthLayout>
      <AuthCard
        title="Verify your email address"
        subtitle={
          token
            ? "We are verifying your EVOKE account."
            : "We sent a verification link to your email. Please check your inbox."
        }
      >
        <div className="flex justify-center py-8">
          <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/10 bg-white/5">
            <Mail className="h-10 w-10 text-muted-foreground" />
          </div>
        </div>

        {loading && (
          <AuthMessage
            variant="info"
            title="Verifying email..."
            description="Please wait while we activate your account."
          />
        )}

        {success && (
          <AuthMessage
            variant="success"
            title="Email verified successfully."
            description="Redirecting you to sign in..."
          />
        )}

        {error && (
          <AuthMessage
            variant="error"
            title="Verification failed"
            description={error}
          />
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/login" className="text-foreground hover:underline">
            Go to sign in
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}