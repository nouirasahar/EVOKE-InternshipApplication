import { Mic, Brain, FileCode, LayoutDashboard, Cog, Database, Server, type LucideIcon } from "lucide-react";

export type Agent = {
  icon: LucideIcon;
  name: string;
  role: string;
};

export const agents: Agent[] = [
  { icon: Mic, name: "Speech Agent", role: "Streams audio and produces high-accuracy transcripts in real time." },
  { icon: Brain, name: "Intent Agent", role: "Resolves ambiguity and turns user requests into structured intent." },
  { icon: FileCode, name: "DSL Agent", role: "Compiles intent into a typed domain-specific specification." },
  { icon: LayoutDashboard, name: "UI Agent", role: "Designs layouts, components, and theming for the target domain." },
  { icon: Cog, name: "Logic Agent", role: "Generates business logic, state machines, and validation rules." },
  { icon: Database, name: "Schema Agent", role: "Models entities, relations, and migrations from inferred data needs." },
  { icon: Server, name: "Runtime Agent", role: "Builds, sandboxes, and self-heals the app until it runs clean." },
];
