import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Lock } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { validateReset, type Errors } from "@/utils/authValidation";
import { resetPassword } from "@/services/auth.service";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const [values, setValues] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onChange = (name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setServerError("");
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!token) {
      setServerError("Reset token is missing.");
      return;
    }

    const found = validateReset(values);
    setErrors(found);

    if (Object.keys(found).length) return;

    try {
      setLoading(true);
      await resetPassword(token, values.password);
      setDone(true);
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Password reset failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Set a new password"
        subtitle="Choose a strong password of at least 8 characters."
      >
        {done ? (
          <div className="space-y-6">
            <AuthMessage
              variant="success"
              title="Password updated successfully."
              description="You can now sign in with your new password."
            />

            <Link to="/login" className="block">
              <AuthButton type="button">
                Back to sign in
              </AuthButton>
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            {serverError && (
              <AuthMessage
                variant="error"
                title="Reset failed"
                description={serverError}
              />
            )}

            <AuthInput
              label="New password"
              name="password"
              placeholder="At least 8 characters"
              icon={<Lock className="h-4 w-4" />}
              togglePassword
              value={values.password}
              onChange={(event) =>
                onChange("password", event.target.value)
              }
              error={errors.password}
              autoComplete="new-password"
            />

            <AuthInput
              label="Confirm new password"
              name="confirm"
              placeholder="Repeat your password"
              icon={<Lock className="h-4 w-4" />}
              togglePassword
              value={values.confirm}
              onChange={(event) =>
                onChange("confirm", event.target.value)
              }
              error={errors.confirm}
              autoComplete="new-password"
            />

            <AuthButton type="submit" loading={loading}>
              Update password
            </AuthButton>
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  );
}