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
      border: "border-[#E9DED3]",
      bg: "bg-[#FFFBF7]",
      text: "text-[#B97A56]",
      icon: CheckCircle,
    },
    error: {
      border: "border-[#E9DED3]",
      bg: "bg-[#FFF8F5]",
      text: "text-[#C76B5D]",
      icon: AlertCircle,
    },
    warning: {
      border: "border-[#E9DED3]",
      bg: "bg-[#FFF9F3]",
      text: "text-[#C48B5C]",
      icon: AlertTriangle,
    },
    info: {
      border: "border-[#E9DED3]",
      bg: "bg-[#FFFBF7]",
      text: "text-[#B97A56]",
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