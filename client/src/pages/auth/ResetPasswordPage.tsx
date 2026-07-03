import { useState } from "react";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { validateReset, type Errors } from "@/utils/authValidation";

export default function ResetPasswordPage() {
  const [values, setValues] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onChange = (name: string, value: string) =>
    setValues((v) => ({ ...v, [name]: value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateReset(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 800);
  };

  return (
    <AuthLayout>
      <AuthCard title="Set a new password" subtitle="Choose a strong password of at least 8 characters.">
        {done ? (
          <div className="space-y-6">
            <AuthMessage title="Password updated successfully." />
            <Link to="/login">
              <AuthButton type="button">Back to sign in</AuthButton>
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <AuthInput
              label="New password"
              name="password"
              placeholder="At least 8 characters"
              icon={<Lock className="h-4 w-4" />}
              togglePassword
              value={values.password}
              onChange={(e) => onChange("password", e.target.value)}
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
              onChange={(e) => onChange("confirm", e.target.value)}
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
