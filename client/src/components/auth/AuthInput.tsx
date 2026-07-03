import { forwardRef, useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: ReactNode;
  error?: string;
  togglePassword?: boolean;
};

export const AuthInput = forwardRef<HTMLInputElement, Props>(function AuthInput(
  { label, icon, error, togglePassword, type = "text", className = "", id, ...rest },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const inputId = id || rest.name;
  const inputType = togglePassword ? (visible ? "text" : "password") : type;

  return (
    <div className="space-y-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-foreground/90">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          ref={ref}
          type={inputType}
          className={`w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-white/25 focus:bg-white/10 ${
            icon ? "pl-10" : "pl-4"
          } ${togglePassword ? "pr-10" : "pr-4"} ${className}`}
          {...rest}
        />
        {togglePassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
            aria-label={visible ? "Show password" : "Hide password" }
          >
            {visible ? <Eye className="h-4 w-4" />: <EyeOff className="h-4 w-4" /> }
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
});
