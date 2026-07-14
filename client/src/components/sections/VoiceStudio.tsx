import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Cloud,
  Code2,
  Database,
  FolderCode,
  Layers3,
  Lightbulb,
  Loader2,
  Mic,
  MonitorSmartphone,
  Network,
  Play,
  Send,
  Server,
  Square,
  Type,
  Volume2,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { pipelineStages } from "@/data/workflow";
import { generateApplication } from "@/services/generate.service";
import { transcribeAudio } from "@/services/transcription.service";

type Mode = "voice" | "text";

const COLORS = {
  copper: "#D97C48",
  copperDark: "#C96A39",
  copperLight: "#F2A06D",
  border: "#E6B79B",
  page: "#FFF9F5",
  panel: "#FFFFFF",
  panelSoft: "#FFFDFC",
  muted: "#F7F3F0",
  text: "#2F231D",
  textSoft: "#75645B",
  line: "#E9E3DF",
};

const labelClass =
  "mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.18em]";

const controlClass =
  "w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition-colors placeholder:text-[#9B8F88] focus:border-[#D97C48] disabled:cursor-not-allowed disabled:opacity-60";

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
    if (!prompt.trim() || isGenerating) return;

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

      if (data?.project?._id) {
        setGeneratedProjectId(data.project._id);
      }

      pipelineStages.forEach((_, index) => {
        window.setTimeout(() => {
          setStage(index + 1);
        }, (index + 1) * 550);
      });
    } catch (error) {
      console.error("Generation failed:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Application generation failed.",
      );
      setStage(-1);
    } finally {
      setIsGenerating(false);
    }
  }

  const canGenerate = Boolean(prompt.trim()) && !isGenerating;

  return (
    <section
      id="studio"
      className="relative overflow-hidden py-24 sm:py-28"
      style={{ backgroundColor: COLORS.page }}
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle
          eyebrow="EVOKE STUDIO"
          title="Configure, describe, and generate your full-stack application"
          subtitle="Choose your stack, describe your product by voice or text, then let EVOKE generate your project workspace."
        />

        <div
          className="mt-12 overflow-hidden rounded-[30px] border"
          style={{
            borderColor: COLORS.border,
            backgroundColor: COLORS.panel,
          }}
        >
          <div
            className="border-b p-5 sm:p-8"
            style={{ borderColor: COLORS.line }}
          >
            <div className="grid gap-5 lg:grid-cols-[0.95fr_1.15fr]">
              <ConfigCard
                icon={<FolderCode className="h-4 w-4" />}
                title="Project identity"
                subtitle="Name your generated workspace."
              >
                <label
                  htmlFor="project-name"
                  className={labelClass}
                  style={{ color: COLORS.textSoft }}
                >
                  Project name
                </label>

                <input
                  id="project-name"
                  value={projectName}
                  onChange={(event) => setProjectName(event.target.value)}
                  placeholder="Example: e-commerce-platform"
                  className={controlClass}
                  style={{
                    borderColor: COLORS.line,
                    color: COLORS.text,
                  }}
                />
              </ConfigCard>

              <ConfigCard
                icon={<Layers3 className="h-4 w-4" />}
                title="Technology stack"
                subtitle="Select the application architecture."
              >
                <div className="grid gap-4 sm:grid-cols-3">
                  <StackSelect
                    icon={<MonitorSmartphone className="h-3.5 w-3.5" />}
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
                    icon={<Server className="h-3.5 w-3.5" />}
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
                    icon={<Database className="h-3.5 w-3.5" />}
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
              </ConfigCard>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            <div className="mb-8 flex justify-center">
              <div
                className="inline-flex rounded-xl border bg-white p-1"
                style={{ borderColor: COLORS.line }}
              >
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
            </div>

            <div className="grid gap-6">
              <div
                className="rounded-[24px] border p-5 sm:p-6"
                style={{
                  borderColor: COLORS.line,
                  backgroundColor: COLORS.panelSoft,
                }}
              >
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

                <div
                  className="mt-5 flex items-start gap-3 rounded-xl border px-4 py-3"
                  style={{
                    borderColor: "#F0D2BF",
                    backgroundColor: "#FFF8F3",
                  }}
                >
                  <Lightbulb
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ color: COLORS.copper }}
                  />
                  <p className="text-xs leading-5" style={{ color: COLORS.textSoft }}>
                    Be specific about features, users, workflows, and goals for
                    the best generation results.
                  </p>
                </div>
              </div>
</div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
              {generatedProjectId && (
                <a
                  href={`/projects/${generatedProjectId}`}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border bg-white px-6 text-sm font-semibold transition-colors hover:bg-[#FFF8F3]"
                  style={{
                    borderColor: COLORS.line,
                    color: COLORS.copperDark,
                  }}
                >
                  View generated project
                  <ArrowRight className="h-4 w-4" />
                </a>
              )}

              <Button
                onClick={runPipeline}
                disabled={!canGenerate}
                className="h-12 rounded-xl border px-7 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  borderColor: COLORS.copperDark,
                  backgroundColor: COLORS.copper,
                }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Generate Application
                    <Send className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ConfigCard({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-[22px] border p-5"
      style={{
        borderColor: COLORS.line,
        backgroundColor: COLORS.panelSoft,
      }}
    >
      <div className="mb-5 flex items-center gap-3">
        <div
          className="grid h-9 w-9 place-items-center rounded-xl border"
          style={{
            borderColor: COLORS.border,
            backgroundColor: "#FFF8F3",
            color: COLORS.copper,
          }}
        >
          {icon}
        </div>

        <div>
          <h3 className="text-sm font-semibold" style={{ color: COLORS.text }}>
            {title}
          </h3>
          <p className="mt-0.5 text-xs" style={{ color: COLORS.textSoft }}>
            {subtitle}
          </p>
        </div>
      </div>

      {children}
    </div>
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
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div>
      <label
        className="mb-2 flex items-center gap-2 font-mono text-[9px] font-semibold uppercase tracking-[0.16em]"
        style={{ color: COLORS.textSoft }}
      >
        <span style={{ color: COLORS.copper }}>{icon}</span>
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${controlClass} cursor-pointer`}
        style={{
          borderColor: COLORS.line,
          color: COLORS.text,
        }}
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
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="inline-flex min-w-[118px] items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors"
      style={{
        backgroundColor: active ? COLORS.copper : "transparent",
        color: active ? "#FFFFFF" : COLORS.text,
      }}
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
    Boolean(navigator.mediaDevices) &&
    typeof MediaRecorder !== "undefined";

  useEffect(() => {
    if (!isRecording) return undefined;

    const interval = window.setInterval(() => {
      setSeconds((value) => value + 1);
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [isRecording]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  async function startRecording() {
    if (!isSupported || isRecording || isTranscribing) return;

    try {
      setError("");
      setSeconds(0);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const preferredMimeType = "audio/webm";
      const recorder = MediaRecorder.isTypeSupported(preferredMimeType)
        ? new MediaRecorder(stream, { mimeType: preferredMimeType })
        : new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        try {
          setIsTranscribing(true);

          const audioBlob = new Blob(audioChunksRef.current, {
            type: recorder.mimeType || preferredMimeType,
          });

          const data = await transcribeAudio(audioBlob);
          setTranscript(data.text || "");
        } catch (transcriptionError) {
          setError(
            transcriptionError instanceof Error
              ? transcriptionError.message
              : "Audio transcription failed.",
          );
        } finally {
          setIsTranscribing(false);
          streamRef.current?.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
          mediaRecorderRef.current = null;
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      setError("Microphone access was denied or the microphone is unavailable.");
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;

    if (!recorder || recorder.state === "inactive") return;

    recorder.stop();
    setIsRecording(false);
  }

  function formatTime(value: number) {
    const minutes = String(Math.floor(value / 60)).padStart(2, "0");
    const remainingSeconds = String(value % 60).padStart(2, "0");

    return `${minutes}:${remainingSeconds}`;
  }

  if (!isSupported) {
    return (
      <div
        className="rounded-xl border p-4 text-sm"
        style={{
          borderColor: COLORS.border,
          backgroundColor: "#FFF8F3",
          color: COLORS.copperDark,
        }}
      >
        Audio recording is not supported by this browser.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <label
          htmlFor="speech-language"
          className={labelClass}
          style={{ color: COLORS.textSoft }}
        >
          Speech language
        </label>

        <select
          id="speech-language"
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
          disabled={isRecording || isTranscribing}
          className={`${controlClass} cursor-pointer`}
          style={{
            borderColor: COLORS.line,
            color: COLORS.text,
          }}
        >
          <option value="en">English</option>
          <option value="fr">French</option>
        </select>
      </div>

      <div
        className="relative overflow-hidden rounded-[22px] border px-6 py-10 text-center"
        style={{
          borderColor: COLORS.line,
          backgroundColor: COLORS.panel,
        }}
      >
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {[280, 230, 180, 130].map((size) => (
            <div
              key={size}
              className="absolute rounded-full border"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                borderColor: "#F3EEE9",
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isTranscribing}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
          className="relative mx-auto grid h-32 w-32 place-items-center rounded-full border-[10px] text-white transition-transform hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            borderColor: COLORS.panel,
            backgroundColor: isRecording
              ? COLORS.copperDark
              : COLORS.copper,
          }}
        >
          {isTranscribing ? (
            <Loader2 className="h-11 w-11 animate-spin" />
          ) : isRecording ? (
            <Square className="h-10 w-10 fill-current" />
          ) : (
            <Mic className="h-11 w-11" />
          )}
        </button>

        <div
          className="relative mt-5 flex items-center justify-center gap-2 text-sm"
          style={{ color: COLORS.textSoft }}
        >
          <span
            className={isRecording ? "h-2 w-2 animate-pulse rounded-full" : "h-2 w-2 rounded-full"}
            style={{
              backgroundColor: isRecording
                ? COLORS.copperDark
                : COLORS.copper,
            }}
          />

          {isRecording
            ? `Recording ${formatTime(seconds)}`
            : isTranscribing
              ? "Transcribing audio..."
              : "Ready to record"}
        </div>

        <div
          className="relative mt-7 flex h-14 items-end justify-center gap-1"
          aria-hidden="true"
        >
          {Array.from({ length: 34 }).map((_, index) => (
            <span
              key={index}
              className={isRecording ? "w-1 animate-wave rounded-full" : "w-1 rounded-full"}
              style={{
                height: `${18 + (index % 7) * 8}%`,
                animationDelay: `${index * 55}ms`,
                opacity: isRecording ? 1 : 0.75,
                backgroundColor: COLORS.copper,
              }}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isTranscribing}
          className="relative mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-full border bg-white px-6 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          style={{
            borderColor: COLORS.copper,
            color: COLORS.copperDark,
          }}
        >
          {isRecording ? (
            <>
              <Square className="h-4 w-4 fill-current" />
              Stop Recording
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-current" />
              Start Recording
            </>
          )}
        </button>
      </div>

      {error && (
        <div
          className="mt-4 rounded-xl border p-4 text-sm"
          style={{
            borderColor: COLORS.border,
            backgroundColor: "#FFF8F3",
            color: COLORS.copperDark,
          }}
        >
          {error}
        </div>
      )}

      <TranscriptBox
        label="Voice transcription"
        value={transcript}
        onChange={setTranscript}
        placeholder="Your spoken application description will appear here after transcription..."
      />
    </div>
  );
}

function TranscriptBox({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div
      className="mt-6 overflow-hidden rounded-[18px] border bg-white"
      style={{ borderColor: COLORS.line }}
    >
      <div
        className="flex items-center justify-between border-b px-4 py-3"
        style={{ borderColor: COLORS.line }}
      >
        <span
          className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: COLORS.textSoft }}
        >
          {label}
        </span>

        <span className="text-xs" style={{ color: COLORS.textSoft }}>
          {value.length} characters
        </span>
      </div>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-h-[170px] w-full resize-y bg-white p-4 text-sm leading-6 outline-none placeholder:text-[#9B8F88]"
        style={{ color: COLORS.text }}
      />
    </div>
  );
}

function TextPanel({
  prompt,
  setPrompt,
}: {
  prompt: string;
  setPrompt: (value: string) => void;
}) {
  return (
    <TranscriptBox
      label="Application description"
      value={prompt}
      onChange={setPrompt}
      placeholder="Describe the application you want EVOKE to generate. Include pages, roles, features, authentication, database entities, and design preferences..."
    />
  );
}


function Pipeline({ currentStage }: { currentStage: number }) {
  const icons = [
    Volume2,
    Network,
    Code2,
    Layers3,
    MonitorSmartphone,
    Server,
    Database,
    Server,
    Cloud,
  ];

  return (
    <div className="mt-6">
      <ul className="space-y-3">
        {pipelineStages.map((pipelineStage, index) => {
          const done = index < currentStage;
          const active = index === currentStage;
          const Icon = icons[index] ?? Network;

          return (
            <li key={pipelineStage}>
              <div
                className="flex min-h-[58px] items-center gap-3 rounded-xl border bg-white px-4 py-3"
                style={{
                  borderColor: done || active ? COLORS.border : COLORS.line,
                }}
              >
                <div
                  className="grid h-9 w-9 place-items-center rounded-full"
                  style={{
                    backgroundColor: active ? "#FFF1E8" : COLORS.muted,
                    color: active ? COLORS.copper : "#716A65",
                  }}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <span
                  className="text-sm font-medium"
                  style={{
                    color: done || active ? COLORS.text : COLORS.textSoft,
                  }}
                >
                  {pipelineStage}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

