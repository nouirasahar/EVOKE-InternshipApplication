import { ArrowRight, Network } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section id="vision" className="relative isolate min-h-[760px] overflow-hidden bg-[#fffaf6] pt-32 pb-24 sm:pt-40 lg:min-h-[820px]">
      <div className="pointer-events-none absolute inset-0 -z-30 bg-[#fffaf6]" />
      <div className="bg-grid pointer-events-none absolute inset-0 -z-20 opacity-[0.08] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_76%)]" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden -z-10">
        <div className="absolute -top-[420px] -right-[420px] h-[900px] w-[900px] rounded-full border border-[#d97c48]/10" />
        <div className="absolute -top-[340px] -right-[340px] h-[740px] w-[740px] rounded-full border border-[#d97c48]/10" />
        <div className="absolute -top-[270px] -right-[270px] h-[600px] w-[600px] rounded-full border border-[#d97c48]/10" />
        <div className="absolute -bottom-[420px] -left-[420px] h-[900px] w-[900px] rounded-full border border-[#d97c48]/10" />
        <div className="absolute -bottom-[340px] -left-[340px] h-[740px] w-[740px] rounded-full border border-[#d97c48]/10" />
        <div className="absolute -bottom-[270px] -left-[270px] h-[600px] w-[600px] rounded-full border border-[#d97c48]/10" />
      </div>
      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-5 text-center sm:px-8">
        <div className="mb-7 flex justify-center"><div className="animate-float-slow"><img src={logo} alt="EVOKE logo" className="h-36 w-auto object-contain sm:h-44 lg:h-48"/></div></div>
        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#d9966c]/40 bg-[#fff8f3] px-5 py-2"><span className="h-2 w-2 rounded-full bg-[#c96a3a]" /><span className="font-mono text-[10px] font-semibold tracking-[0.22em] text-[#ad572e] sm:text-xs">VOICE-DRIVEN MULTI-AGENT AI</span></div>
        <h1 className="max-w-5xl text-balance text-[2.8rem] font-semibold leading-[0.98] tracking-[-0.045em] text-[#2b1710] sm:text-6xl lg:text-[5rem]">Speak your ideas. <span className="bg-gradient-to-r from-[#a84c25] via-[#d27342] to-[#ed9b68] bg-clip-text text-transparent">Build software instantly.</span></h1>
        <p className="mx-auto mt-7 max-w-2xl text-balance text-base leading-7 text-[#745447] sm:text-lg sm:leading-8">EVOKE transforms natural language and voice into production-ready full-stack applications through an intelligent multi-agent architecture.</p>
        <div className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row"><a href="#studio"><Button>Start Building<ArrowRight className="h-4 w-4"/></Button></a><a href="#agents"><Button variant="secondary"><Network className="h-4 w-4"/>Explore Architecture</Button></a></div>
      </div>
    </section>
  );
}
