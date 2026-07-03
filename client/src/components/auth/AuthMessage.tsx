import { CheckCircle } from "lucide-react";

type Props = { title: string; description?: string };

export function AuthMessage({ title, description }: Props) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4">
      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}
