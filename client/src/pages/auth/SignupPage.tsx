import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { validateSignup, type Errors } from "@/utils/authValidation";

export default function SignupPage() {
  const [values, setValues] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const onChange = (name: string, value: string) =>
    setValues((v) => ({ ...v, [name]: value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateSignup(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate("/verify-email"), 1500);
    }, 900);
  };

  return (
    <AuthLayout>
      <AuthCard title="Create your account" subtitle="Start turning ideas into working software.">
        {success ? (
          <AuthMessage
            title="Verification email sent."
            description="Please check your inbox to activate your EVOKE account."
          />
        ) : (
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <AuthInput
              label="Full name"
              name="name"
              placeholder="Ada Lovelace"
              icon={<User className="h-4 w-4" />}
              value={values.name}
              onChange={(e) => onChange("name", e.target.value)}
              error={errors.name}
              autoComplete="name"
            />
            <AuthInput
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="h-4 w-4" />}
              value={values.email}
              onChange={(e) => onChange("email", e.target.value)}
              error={errors.email}
              autoComplete="email"
            />
            <AuthInput
              label="Password"
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
              label="Confirm password"
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
              Create account
            </AuthButton>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-foreground underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
