import { ChevronRight } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { workflowSteps } from "@/data/workflow";

export function Workflow() {
  return (
    <section id="workflow" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4">
        <SectionTitle
          eyebrow="WORKFLOW"
          title="From utterance to running app"
          subtitle="A clean horizontal pipeline that takes voice input all the way to a deployed sandbox preview."
        />

        <div className="glass flex flex-wrap items-center justify-center gap-3 rounded-2xl p-6 sm:gap-2 sm:p-8">
          {workflowSteps.map((s, i) => (
            <div key={s.title} className="flex items-center gap-3 sm:gap-2">
              <div className="flex flex-col items-center gap-2">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand shadow-brand">
                  <s.icon className="h-5 w-5 text-white" />
                </div>
                <span className="font-mono text-xs tracking-wider text-muted-foreground">
                  {s.title}
                </span>
              </div>
              {i < workflowSteps.length - 1 && (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
