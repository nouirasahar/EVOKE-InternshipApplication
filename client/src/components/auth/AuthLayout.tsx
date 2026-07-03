import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

type Props = { children: ReactNode };

export function AuthLayout({ children }: Props) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-grid">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-brand opacity-20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[380px] w-[380px] rounded-full bg-brand opacity-10 blur-3xl" />
      </div>

      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-10 px-6 py-10 lg:grid-cols-2 lg:gap-16 lg:py-16">
        <aside className="flex flex-col justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="EVOKE logo" className="h-10 w-10 object-contain" />
            <span className="font-display text-xl font-semibold tracking-[0.25em]">EVOKE</span>
          </Link>

          <div className="hidden lg:block">
            <h1 className="font-display text-5xl font-semibold leading-tight">
              <span className="text-gradient">Speak. Evoke. Build.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-muted-foreground">
              Turn natural language into production-ready applications through an
              intelligent multi-agent architecture.
            </p>
          </div>

          <p className="hidden text-sm text-muted-foreground lg:block">
            © {new Date().getFullYear()} EVOKE. All rights reserved.
          </p>
        </aside>

        <section className="flex items-center justify-center">
          <div className="w-full max-w-md">{children}</div>
        </section>
      </div>
    </div>
  );
}
