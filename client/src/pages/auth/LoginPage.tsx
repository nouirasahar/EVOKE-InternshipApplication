import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthCard } from "@/components/auth/AuthCard";
import { AuthInput } from "@/components/auth/AuthInput";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthMessage } from "@/components/auth/AuthMessage";
import { validateLogin, type Errors } from "@/utils/authValidation";
import { login } from "@/services/auth.service";

export default function LoginPage() {
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const onChange = (name: string, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setServerError("");
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const found = validateLogin(values);
    setErrors(found);

    if (Object.keys(found).length) return;

    try {
      setLoading(true);

      await login({
        email: values.email,
        password: values.password,
      });

      navigate("/");
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : "Login failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Welcome back"
        subtitle="Sign in to continue building with EVOKE."
      >
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {serverError && (
            <AuthMessage
              variant="error"
              title="Login failed"
              description={serverError}
            />
          )}

          <AuthInput
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            icon={<Mail className="h-4 w-4" />}
            value={values.email}
            onChange={(event) => onChange("email", event.target.value)}
            error={errors.email}
            autoComplete="email"
          />

          <AuthInput
            label="Password"
            name="password"
            placeholder="••••••••"
            icon={<Lock className="h-4 w-4" />}
            togglePassword
            value={values.password}
            onChange={(event) => onChange("password", event.target.value)}
            error={errors.password}
            autoComplete="current-password"
          />

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-primary transition hover:text-[#C7835B]"
            >
              Forgot password?
            </Link>
          </div>

          <AuthButton type="submit" loading={loading}>
            Sign in
          </AuthButton>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to EVOKE?{" "}
          <Link
            to="/signup"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}