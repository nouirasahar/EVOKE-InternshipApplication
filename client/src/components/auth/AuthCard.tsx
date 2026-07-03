import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function AuthCard({ title, subtitle, children }: Props) {
  return (
    <div className="glass rounded-2xl p-8 shadow-brand animate-fade-up">
      <header className="mb-6">
        <h2 className="font-display text-2xl font-semibold">{title}</h2>
        {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
      </header>
      {children}
    </div>
  );
}
