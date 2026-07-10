import { useEffect, useRef, useState } from "react";
import {
  Mic,
  Send,
  Type,
  Play,
  Square,
  CheckCircle2,
  Loader2,
  Layers3,
  Database,
  Server,
  MonitorSmartphone,
  Sparkles,
  FolderCode,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { pipelineStages } from "@/data/workflow";
import { generateApplication } from "@/services/generate.service";
import { transcribeAudio } from "@/services/transcription.service";

type Mode = "voice" | "text";

export function VoiceStudio() {
  const [mode, setMode] = useState<Mode>("voice");
  const [prompt, setPrompt] = useState("");
  const [projectName, setProjectName] = useState("");
  const [frontend, setFrontend] = useState("react-vite");
  const [backend, setBackend] = useState("express");
  const [database, setDatabase] = useState("mongodb");
  const [speechLanguage, setSpeechLanguage] = useState("en");
  const [stage, setStage] = useState(-1);
  const [generatedProjectId, setGeneratedProjectId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  async function runPipeline() {
    if (!prompt.trim()) return;

    try {
      setIsGenerating(true);
      setGeneratedProjectId(null);
      setStage(0);

      const data = await generateApplication({
        projectName,
        prompt,
        transcript: mode === "voice" ? prompt : undefined,
        source: mode,
        language: speechLanguage,
        frontend,
        backend,
        database,
      });

      console.log("Generated application:", data);

      if (data?.project?._id) {
        setGeneratedProjectId(data.project._id);
      }

      pipelineStages.forEach((_, i) => {
        setTimeout(() => setStage(i + 1), (i + 1) * 550);
      });
    } catch (error) {
      console.error("Generation failed:", error);
      alert(error instanceof Error ? error.message : "Generation failed.");
      setStage(-1);
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <section id="studio" className="relative py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionTitle
          eyebrow="EVOKE STUDIO"
          title="Configure, describe, and generate your full-stack application"
          subtitle="Choose your stack, describe your product by voice or text, then let EVOKE generate your project workspace."
        />

        <div className="glass rounded-3xl p-6 shadow-brand sm:p-10">
          <div className="mb-8 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="mb-4 flex items-center gap-2">
                <FolderCode className="h-5 w-5 text-cyan-400" />
                <h3 className="font-semibold">Project identity</h3>
              </div>

              <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Project name
              </label>

              <input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Example: e-commerce-platform"
                className="w-full rounded-xl border border-border bg-black/30 p-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-electric focus:outline-none"
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="mb-4 flex items-center gap-2">
                <Layers3 className="h-5 w-5 text-violet-400" />
                <h3 className="font-semibold">Technology stack</h3>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <StackSelect
                  icon={<MonitorSmartphone className="h-4 w-4" />}
                  label="Frontend"
                  value={frontend}
                  onChange={setFrontend}
                  options={[
                    { value: "react-vite", label: "React + Vite" },
                    { value: "nextjs", label: "Next.js" },
                    { value: "angular", label: "Angular" },
                  ]}
                />

                <StackSelect
                  icon={<Server className="h-4 w-4" />}
                  label="Backend"
                  value={backend}
                  onChange={setBackend}
                  options={[
                    { value: "express", label: "Express" },
                    { value: "nestjs", label: "NestJS" },
                    { value: "spring-boot", label: "Spring Boot" },
                  ]}
                />

                <StackSelect
                  icon={<Database className="h-4 w-4" />}
                  label="Database"
                  value={database}
                  onChange={setDatabase}
                  options={[
                    { value: "mongodb", label: "MongoDB" },
                    { value: "postgresql", label: "PostgreSQL" },
                    { value: "mysql", label: "MySQL" },
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="mx-auto mb-8 inline-flex rounded-xl border border-border bg-black/30 p-1">
            <ModeTab
              active={mode === "voice"}
              onClick={() => setMode("voice")}
              icon={<Mic className="h-4 w-4" />}
              label="Voice"
            />
            <ModeTab
              active={mode === "text"}
              onClick={() => setMode("text")}
              icon={<Type className="h-4 w-4" />}
              label="Text"
            />
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

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            {generatedProjectId && (
              <a
                href={`/projects/${generatedProjectId}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-400/20"
              >
                View generated project
                <ArrowRight className="h-4 w-4" />
              </a>
            )}

            <Button onClick={runPipeline}>
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Application
                  <Send className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {stage >= 0 && <Pipeline currentStage={stage} />}
        </div>
      </div>
    </section>
  );
}

function StackSelect({
  icon,
  label,
  value,
  onChange,
  options,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {icon}
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-black/30 p-3 font-mono text-sm text-foreground focus:border-electric focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState("");

  const isSupported =
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices &&
    typeof MediaRecorder !== "undefined";

  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(() => {
      setSeconds((value) => value + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording]);

  async function startRecording() {
    if (!isSupported) return;

    try {
      setError("");
      setSeconds(0);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        try {
          setIsTranscribing(true);

          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });

          const data = await transcribeAudio(audioBlob);
          setTranscript(data.text || "");
        } catch (err) {
          console.error("Transcription failed:", err);
          setError(err instanceof Error ? err.message : "Transcription failed.");
        } finally {
          setIsTranscribing(false);
          streamRef.current?.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone error:", err);
      setError("Microphone access denied or unavailable.");
    }
  }

  function stopRecording() {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.stop();
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
        Audio recording is not supported in this browser. Please use a modern browser.
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
          disabled={isRecording || isTranscribing}
          className="w-full rounded-xl border border-border bg-black/30 p-3 font-mono text-sm text-foreground focus:border-electric focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="en">English</option>
          <option value="fr">French</option>
        </select>
      </div>

      <div className="relative">
        {(isRecording || isTranscribing) && (
          <div className="absolute inset-0 animate-pulse-ring rounded-full bg-brand blur-2xl" />
        )}

        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isTranscribing}
          className={`relative grid h-28 w-28 place-items-center rounded-full text-white shadow-brand transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60 sm:h-32 sm:w-32 ${
            isRecording ? "bg-red-500" : "bg-brand"
          }`}
          aria-label="Activate voice"
        >
          {isTranscribing ? (
            <Loader2 className="h-12 w-12 animate-spin" />
          ) : (
            <Mic className="h-12 w-12" />
          )}
        </button>
      </div>

      <p className="mt-6 font-mono text-sm tracking-wider text-muted-foreground">
        <span
          className={`mr-2 inline-block h-2 w-2 rounded-full ${
            isRecording ? "animate-pulse bg-red-400" : "bg-cyan-glow"
          }`}
        />
        {isRecording
          ? `Recording ${formatTime(seconds)}`
          : isTranscribing
          ? "Transcribing with Groq Whisper..."
          : "Ready to record"}
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

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="mt-8 w-full">
        <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Voice transcription
        </label>

        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Your spoken application description will appear here after transcription..."
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
        className="min-h-[180px] w-full resize-y rounded-xl border border-border bg-black/30 p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-electric focus:outline-none"
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