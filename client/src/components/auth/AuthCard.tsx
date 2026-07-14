import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AuthCard({ title, subtitle, children }: Props) {
  return (
    <div className="animate-fade-up rounded-2xl border border-[#E9DED3] bg-[#FFFBF7] p-8">
      <header className="mb-6">
        <h2 className="font-display text-2xl font-semibold text-foreground">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-2 text-sm text-muted-foreground">
            {subtitle}
          </p>
        )}
      </header>

      {children}
    </div>
  );
}