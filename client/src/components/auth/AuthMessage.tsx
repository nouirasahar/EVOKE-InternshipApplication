import {
  CheckCircle,
  AlertCircle,
  Info,
  AlertTriangle,
} from "lucide-react";

type Props = {
  title: string;
  description?: string;
  variant?: "success" | "error" | "warning" | "info";
};

export function AuthMessage({
  title,
  description,
  variant = "success",
}: Props) {
  const styles = {
    success: {
      border: "border-emerald-400/20",
      bg: "bg-emerald-400/5",
      text: "text-emerald-400",
      icon: CheckCircle,
    },
    error: {
      border: "border-red-400/20",
      bg: "bg-red-400/5",
      text: "text-red-400",
      icon: AlertCircle,
    },
    warning: {
      border: "border-yellow-400/20",
      bg: "bg-yellow-400/5",
      text: "text-yellow-400",
      icon: AlertTriangle,
    },
    info: {
      border: "border-blue-400/20",
      bg: "bg-blue-400/5",
      text: "text-blue-400",
      icon: Info,
    },
  };

  const current = styles[variant];
  const Icon = current.icon;

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border ${current.border} ${current.bg} p-4`}
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${current.text}`} />

      <div>
        <p className="text-sm font-medium text-foreground">
          {title}
        </p>

        {description && (
          <p className="mt-1 text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}