import { useEffect, useRef, useState } from "react";
import { Mic, Send, Type, Play, Square, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { pipelineStages } from "@/data/workflow";

type Mode = "voice" | "text";

type SpeechRecognitionWindow = Window & {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
};

export function VoiceStudio() {
  const [mode, setMode] = useState<Mode>("voice");
  const [prompt, setPrompt] = useState("");
  const [speechLanguage, setSpeechLanguage] = useState("en-US");
  const [stage, setStage] = useState(-1);

  function runPipeline() {
    if (!prompt.trim()) return;

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
          subtitle="Describe your application by voice or text. EVOKE will transform it into a full-stack product."
        />

        <div className="glass rounded-3xl p-6 sm:p-10 shadow-brand">
          <div className="mx-auto mb-8 inline-flex rounded-xl border border-border bg-black/30 p-1">
            <ModeTab active={mode === "voice"} onClick={() => setMode("voice")} icon={<Mic className="h-4 w-4" />} label="Voice" />
            <ModeTab active={mode === "text"} onClick={() => setMode("text")} icon={<Type className="h-4 w-4" />} label="Text" />
          </div>

          {mode === "voice" ? (
            <VoicePanel
              transcript={prompt}
              setTranscript={setPrompt}
              language={speechLanguage}
              setLanguage={setSpeechLanguage}
            />
          ) : (
            <TextPanel prompt={prompt} setPrompt={setPrompt} />
          )}

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

function ModeTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
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

function VoicePanel({
  transcript,
  setTranscript,
  language,
  setLanguage,
}: {
  transcript: string;
  setTranscript: (value: string) => void;
  language: string;
  setLanguage: (value: string) => void;
}) {
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const SpeechRecognition =
      (window as SpeechRecognitionWindow).SpeechRecognition ||
      (window as SpeechRecognitionWindow).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = language;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscriptRef.current += text + " ";
        } else {
          interimTranscript += text;
        }
      }

      setTranscript((finalTranscriptRef.current + interimTranscript).trim());
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [setTranscript, language]);

  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(() => {
      setSeconds((value) => value + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording]);

  function startRecording() {
    if (!recognitionRef.current) return;

    finalTranscriptRef.current = transcript ? transcript + " " : "";
    setSeconds(0);
    setIsRecording(true);
    recognitionRef.current.start();
  }

  function stopRecording() {
    if (!recognitionRef.current) return;

    recognitionRef.current.stop();
    setIsRecording(false);
  }

  function formatTime(value: number) {
    const minutes = String(Math.floor(value / 60)).padStart(2, "0");
    const remainingSeconds = String(value % 60).padStart(2, "0");

    return `${minutes}:${remainingSeconds}`;
  }

  if (!isSupported) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
        Speech recognition is not supported in this browser. Use Google Chrome or Microsoft Edge.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-6">
      <div className="mb-8 w-full max-w-sm">
        <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Speech language
        </label>

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          disabled={isRecording}
          className="w-full rounded-xl border border-border bg-black/30 p-3 font-mono text-sm text-foreground focus:border-electric focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="en-US">English</option>
          <option value="fr-FR">French</option>
          <option value="ar-SA">Arabic</option>
        </select>
      </div>

      <div className="relative">
        {isRecording && (
          <div className="absolute inset-0 animate-pulse-ring rounded-full bg-brand blur-2xl" />
        )}

        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`relative grid h-28 w-28 place-items-center rounded-full text-white shadow-brand transition hover:scale-105 sm:h-32 sm:w-32 ${
            isRecording ? "bg-red-500" : "bg-brand"
          }`}
          aria-label="Activate voice"
        >
          <Mic className="h-12 w-12" />
        </button>
      </div>

      <p className="mt-6 font-mono text-sm tracking-wider text-muted-foreground">
        <span
          className={`mr-2 inline-block h-2 w-2 rounded-full ${
            isRecording ? "animate-pulse bg-red-400" : "bg-cyan-glow"
          }`}
        />
        {isRecording ? `Recording ${formatTime(seconds)}` : "Ready to listen"}
      </p>

      <div className="mt-6 flex h-14 items-end gap-1">
        {Array.from({ length: 32 }).map((_, i) => (
          <span
            key={i}
            className={`w-1 rounded-full bg-brand ${isRecording ? "animate-wave" : ""}`}
            style={{
              height: `${20 + (i % 7) * 8}%`,
              animationDelay: `${i * 60}ms`,
            }}
          />
        ))}
      </div>

      <div className="mt-8 flex gap-3">
        {!isRecording ? (
          <Button onClick={startRecording}>
            <Play className="h-4 w-4" />
            Start Recording
          </Button>
        ) : (
          <Button onClick={stopRecording}>
            <Square className="h-4 w-4" />
            Stop Recording
          </Button>
        )}
      </div>

      <div className="mt-8 w-full">
        <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Voice transcription
        </label>

        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Your spoken application description will appear here..."
          className="min-h-[140px] w-full resize-y rounded-xl border border-border bg-black/30 p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-electric focus:outline-none"
        />
      </div>
    </div>
  );
}

function TextPanel({
  prompt,
  setPrompt,
}: {
  prompt: string;
  setPrompt: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Application description
      </label>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the application you want EVOKE to generate..."
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

              <span className={done || active ? "text-foreground" : "text-muted-foreground"}>
                {stage}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}