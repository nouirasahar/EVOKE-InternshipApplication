import { Headphones, Layers, Boxes, Container, Repeat, ShieldCheck, type LucideIcon } from "lucide-react";

export type Feature = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

export const features: Feature[] = [
  { icon: Headphones, title: "Contextual Speech-to-Text", desc: "Domain-aware transcription that understands product and industry vocabulary." },
  { icon: Layers, title: "Full-Stack Generation", desc: "UI, logic, schema, and runtime produced together as one coherent application." },
  { icon: Boxes, title: "Multi-Agent Orchestration", desc: "Specialist agents collaborate through a typed DSL to compose the full stack." },
  { icon: Container, title: "Docker Sandbox", desc: "Every generated app boots into an isolated sandbox for instant live preview." },
  { icon: Repeat, title: "Incremental Voice Updates", desc: "Refine generated apps with follow-up commands without losing state." },
  { icon: ShieldCheck, title: "Self-Healing Build Correction", desc: "The runtime agent detects, diagnoses, and repairs build errors autonomously." },
];
