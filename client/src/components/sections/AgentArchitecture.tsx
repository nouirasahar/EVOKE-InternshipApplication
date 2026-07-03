import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card } from "@/components/ui/Card";
import { agents } from "@/data/agents";

export function AgentArchitecture() {
  return (
    <section id="agents" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4">
        <SectionTitle
          eyebrow="MULTI-AGENT ARCHITECTURE"
          title="Seven specialists. One orchestrated build."
          subtitle="Each agent owns a single concern. Together they compose a coherent full-stack application."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((a) => (
            <Card key={a.name} className="h-full">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-muted">
                  <a.icon className="h-5 w-5 text-cyan-glow" />
                </div>
                <h3 className="font-display text-lg font-semibold">{a.name}</h3>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{a.role}</p>
              <div className="mt-5 flex items-center gap-2 font-mono text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-glow" />
                agent.online
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
