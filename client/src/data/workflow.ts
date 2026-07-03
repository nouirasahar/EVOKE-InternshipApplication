import { Mic2, Brain, FileCode, Boxes, Cpu, Container, MonitorPlay, type LucideIcon } from "lucide-react";

export type Step = { icon: LucideIcon; title: string };

export const workflowSteps: Step[] = [
  { icon: Mic2, title: "Voice" },
  { icon: Brain, title: "Intent" },
  { icon: FileCode, title: "DSL" },
  { icon: Boxes, title: "Agents" },
  { icon: Cpu, title: "Generation" },
  { icon: Container, title: "Sandbox" },
  { icon: MonitorPlay, title: "Preview" },
];

export const pipelineStages: string[] = [
  "Speech Recognition",
  "Intent Analysis",
  "DSL Generation",
  "Multi-Agent Orchestration",
  "Frontend Generation",
  "Backend Generation",
  "Database Schema",
  "Docker Build",
  "Sandbox Deployment",
];
