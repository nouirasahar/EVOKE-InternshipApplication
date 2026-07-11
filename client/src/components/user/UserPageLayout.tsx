import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function UserPageLayout({ title, subtitle, children }: Props) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <section className="px-6 pt-32 pb-16">
        <div className="mx-auto w-full max-w-[1650px] px-4">
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-violet-500/10 backdrop-blur-xl">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">{title}</h1>
              {subtitle && (
                <p className="mt-2 text-muted-foreground">{subtitle}</p>
              )}
            </div>

            {children}
          </div>
        </div>
      </section>
    </main>
  );
}