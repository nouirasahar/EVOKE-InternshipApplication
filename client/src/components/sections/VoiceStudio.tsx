import { useState } from "react";
import { Mic, Send, Type, Play, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { pipelineStages } from "@/data/workflow";

const suggestions = [
  "Hospital Management",
  "CRM Platform",
  "Inventory System",
  "Learning Platform",
  "Portfolio Website",
  "Chat Application",
];

type Mode = "voice" | "text";

export function VoiceStudio() {
  const [mode, setMode] = useState<Mode>("text");
  const [prompt, setPrompt] = useState(
    "Build a hospital management platform with authentication, dashboard, appointment scheduling and analytics.",
  );
  const [stage, setStage] = useState(-1);

  function runPipeline() {
    setStage(0);
    pipelineStages.forEach((_, i) => {
      setTimeout(() => setStage(i + 1), (i + 1) * 550);
    });
  }

  return (
    <section id="studio" className="relative py-24">
      <div className="mx-auto max-w-5xl px-4">
        <SectionTitle
          eyebrow="VOICE STUDIO"
          title="Speak your next product into existence"
          subtitle="Switch between voice and text. EVOKE turns either into a running application."
        />

        <div className="glass rounded-3xl p-6 sm:p-10 shadow-brand">
          {/* Mode switch */}
          <div className="mx-auto mb-8 inline-flex rounded-xl border border-border bg-black/30 p-1">
            <ModeTab active={mode === "voice"} onClick={() => setMode("voice")} icon={<Mic className="h-4 w-4" />} label="Voice" />
            <ModeTab active={mode === "text"} onClick={() => setMode("text")} icon={<Type className="h-4 w-4" />} label="Text" />
          </div>

          {mode === "voice" ? <VoicePanel /> : (
            <TextPanel prompt={prompt} setPrompt={setPrompt} />
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setMode("text");
                  setPrompt(`Build a ${s.toLowerCase()} with authentication, dashboard and analytics.`);
                }}
                className="rounded-full border border-border bg-white/5 px-3 py-1.5 text-xs text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <Button onClick={runPipeline}>
              Generate Application
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {stage >= 0 && <Pipeline currentStage={stage} />}
        </div>
      </div>
    </section>
  );
}

function ModeTab({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
        active ? "bg-brand text-white shadow-brand" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function VoicePanel() {
  return (
    <div className="flex flex-col items-center py-6">
      <div className="relative">
        <div className="absolute inset-0 animate-pulse-ring rounded-full bg-brand blur-2xl" />
        <button
          className="relative grid h-28 w-28 place-items-center rounded-full bg-brand text-white shadow-brand transition hover:scale-105 sm:h-32 sm:w-32"
          aria-label="Activate voice"
        >
          <Mic className="h-12 w-12" />
        </button>
      </div>
      <p className="mt-6 font-mono text-sm tracking-wider text-muted-foreground">
        <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-cyan-glow" />
        Ready to listen
      </p>

      <div className="mt-6 flex h-14 items-end gap-1">
        {Array.from({ length: 32 }).map((_, i) => (
          <span
            key={i}
            className="w-1 animate-wave rounded-full bg-brand"
            style={{ height: `${20 + (i % 7) * 8}%`, animationDelay: `${i * 60}ms` }}
          />
        ))}
      </div>

      <div className="mt-8">
        <Button>
          <Play className="h-4 w-4" />
          Start Recording
        </Button>
      </div>
    </div>
  );
}

function TextPanel({ prompt, setPrompt }: { prompt: string; setPrompt: (v: string) => void }) {
  return (
    <div>
      <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Describe your application
      </label>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the application you want to build..."
        className="min-h-[160px] w-full resize-y rounded-xl border border-border bg-black/30 p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-electric focus:outline-none"
      />
    </div>
  );
}

function Pipeline({ currentStage }: { currentStage: number }) {
  return (
    <div className="mt-8 rounded-2xl border border-border bg-black/30 p-5">
      <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Generation Pipeline
      </p>
      <ul className="space-y-2">
        {pipelineStages.map((stage, i) => {
          const done = i < currentStage;
          const active = i === currentStage;
          return (
            <li key={stage} className="flex items-center gap-3 text-sm">
              {done ? (
                <CheckCircle2 className="h-4 w-4 text-cyan-glow" />
              ) : active ? (
                <Loader2 className="h-4 w-4 animate-spin text-electric" />
              ) : (
                <span className="h-4 w-4 rounded-full border border-border" />
              )}
              <span className={done ? "text-foreground" : active ? "text-foreground" : "text-muted-foreground"}>
                {stage}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
