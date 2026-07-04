import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { validateEmailOnly, type Errors } from "@/utils/authValidation";
import { forgotPassword } from "@/services/auth.service";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const found = validateEmailOnly(email);
    setErrors(found);
    if (Object.keys(found).length) return;

    try {
      setLoading(true);
      setServerError("");

      await forgotPassword(email);

      setSent(true);
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Failed to send reset link."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Forgot your password?"
        subtitle="Enter your email and we'll send you a reset link."
      >
        {sent ? (
          <AuthMessage
            variant="success"
            title="Password reset link sent."
            description="Please check your inbox for further instructions."
          />
        ) : (
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            {serverError && (
              <AuthMessage
                variant="error"
                title="Request failed"
                description={serverError}
              />
            )}

            <AuthInput
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="h-4 w-4" />}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setServerError("");
              }}
              error={errors.email}
              autoComplete="email"
            />

            <AuthButton type="submit" loading={loading}>
              Send reset link
            </AuthButton>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link
            to="/login"
            className="text-foreground underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}