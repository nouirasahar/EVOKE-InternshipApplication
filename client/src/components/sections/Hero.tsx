import { ArrowRight, Network } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section id="vision" className="relative overflow-hidden pt-36 pb-24 sm:pt-44">
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-violet/20 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 text-center">
        <div className="mx-auto mb-10 flex justify-center">
          <div className="relative animate-float-slow">
            <div className="absolute inset-0 -m-6 rounded-full bg-brand opacity-30 blur-2xl" />
            <img
              src={logo}
              alt="EVOKE logo"
              className="relative h-32 w-32 object-contain sm:h-40 sm:w-40"
            />
          </div>
        </div>

        <div className="glass mx-auto mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-mono tracking-widest text-cyan-glow">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-glow" />
          VOICE-DRIVEN MULTI-AGENT AI
        </div>

        <h1 className="text-balance text-4xl font-semibold leading-tight sm:text-6xl">
          Speak your ideas.{" "}
          <span className="text-gradient">Build software instantly.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
          EVOKE transforms natural language and voice into full-stack applications
          through an intelligent multi-agent architecture.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href="#studio">
            <Button>
              Start Building
              <ArrowRight className="h-4 w-4" />
            </Button>
          </a>
          <a href="#agents">
            <Button variant="secondary">
              <Network className="h-4 w-4" />
              Explore Architecture
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
