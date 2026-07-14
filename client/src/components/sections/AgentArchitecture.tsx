import { Network } from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { agents } from "@/data/agents";

const logoCopper = "#D97C48";
const logoCopperDark = "#C96A39";
const logoCopperLight = "#F2A06D";
const borderColor = "#E6B79B";
const background = "#FFF9F5";
const lightBeige = "#FDF3EB";

export function AgentArchitecture() {
  return (
    <section
      id="agents"
      className="py-24 sm:py-28"
      style={{ backgroundColor: background }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle
          eyebrow="MULTI-AGENT ARCHITECTURE"
          title="Seven specialists. One orchestrated build."
          subtitle="The EVOKE orchestrator coordinates every specialist through one shared application context."
        />

        <div
          className="mt-12 rounded-[30px] border px-5 py-10 sm:px-8 lg:px-12"
          style={{ borderColor, backgroundColor: background }}
        >
          <div className="mx-auto max-w-6xl">
            {/* Orchestrator */}
            <div className="flex justify-center">
              <div
                className="flex items-center gap-4 rounded-[24px] border px-7 py-6"
                style={{
                  backgroundColor: lightBeige,
                  borderColor,
                }}
              >
                <div
                  className="grid h-12 w-12 place-items-center rounded-full"
                  style={{ backgroundColor: logoCopper }}
                >
                  <Network className="h-6 w-6 text-white" />
                </div>

                <div>
                  <p
                    className="font-mono text-[9px] uppercase tracking-[0.22em]"
                    style={{ color: logoCopperDark }}
                  >
                    Central intelligence
                  </p>

                  <h3
                    className="mt-1 text-xl font-semibold"
                    style={{ color: logoCopperDark }}
                  >
                    EVOKE Orchestrator
                  </h3>
                </div>
              </div>
            </div>

            {/* Connectors */}
            <div
              className="mx-auto h-12 w-px"
              style={{ backgroundColor: logoCopper }}
            />

            <div className="hidden lg:block">
              <div
                className="mx-auto h-px w-[88%]"
                style={{ backgroundColor: logoCopper }}
              />

              <div className="mx-auto grid w-[88%] grid-cols-7">
                {agents.map((agent) => (
                  <div
                    key={`connector-${agent.name}`}
                    className="flex justify-center"
                  >
                    <div
                      className="h-6 w-px"
                      style={{ backgroundColor: logoCopper }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Agents */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-7 lg:gap-3">
              {agents.map((agent, index) => (
                <article
                  key={agent.name}
                  className="flex min-h-[165px] flex-col items-center justify-center rounded-[20px] border p-4 text-center transition-transform duration-300 hover:-translate-y-1"
                  style={{
                    borderColor,
                    backgroundColor: lightBeige,
                  }}
                >
                  <div
                    className="grid h-11 w-11 place-items-center rounded-full"
                    style={{ backgroundColor: logoCopper }}
                  >
                    <agent.icon className="h-5 w-5 text-white" />
                  </div>

                  <h4
                    className="mt-4 text-sm font-semibold"
                    style={{ color: logoCopperDark }}
                  >
                    {agent.name}
                  </h4>

                  <span
                    className="mt-3 font-mono text-[9px] font-semibold uppercase tracking-[0.18em]"
                    style={{ color: logoCopper }}
                  >
                    Agent {String(index + 1).padStart(2, "0")}
                  </span>
                </article>
              ))}
            </div>

            {/* Footer */}
            <div
              className="mt-9 border-t pt-6"
              style={{ borderColor }}
            >
              <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
                <Metric label="Coordination" value="Orchestrated execution" />
                <Divider />
                <Metric label="Communication" value="Shared context" />
                <Divider />
                <Metric label="Output" value="Unified full-stack project" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: logoCopper }}
      >
        {label}
      </span>

      <span
        className="text-sm font-medium"
        style={{ color: logoCopperDark }}
      >
        {value}
      </span>
    </div>
  );
}

function Divider() {
  return (
    <span
      className="hidden h-1.5 w-1.5 rounded-full sm:block"
      style={{ backgroundColor: logoCopperLight }}
    />
  );
}