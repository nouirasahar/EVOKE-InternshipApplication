import { SectionTitle } from "@/components/ui/SectionTitle";
import { features } from "@/data/features";

export function Features() {
  return (
    <section
      id="features"
      className="relative overflow-hidden bg-[#fffaf6] py-24 sm:py-28"
    >
      {/* Decorative background circles */}
      <div className="pointer-events-none absolute -right-48 top-12 h-[480px] w-[480px] rounded-full border border-[#d97c48]/10" />
      <div className="pointer-events-none absolute -right-24 top-32 h-[340px] w-[340px] rounded-full border border-[#d97c48]/10" />

      <div className="pointer-events-none absolute -left-52 bottom-[-250px] h-[540px] w-[540px] rounded-full border border-[#d97c48]/10" />
      <div className="pointer-events-none absolute -left-28 bottom-[-150px] h-[360px] w-[360px] rounded-full border border-[#d97c48]/10" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle
          eyebrow="FEATURES"
          title="Engineered for serious AI software delivery"
          subtitle="A complete generation environment designed to transform product requirements into structured, maintainable, and deployable applications."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className="group relative flex min-h-[260px] flex-col overflow-hidden rounded-[24px] border border-[#e5c6b2] bg-[#fffdfb] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#c97849] hover:bg-[#fff7f1]"
            >
              {/* Card number */}
              <span className="absolute right-5 top-5 font-mono text-[10px] font-semibold tracking-[0.18em] text-[#b57a5d]">
                {String(index + 1).padStart(2, "0")}
              </span>

              {/* Feature icon */}
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[#dba17f] bg-[#fff0e5]">
                <feature.icon className="h-5 w-5 text-[#b95d2f]" />
              </div>

              <div className="mt-8">
                <h3 className="max-w-[85%] text-lg font-semibold leading-6 text-[#342018]">
                  {feature.title}
                </h3>

                <div className="mt-4 h-px w-12 bg-[#c97849] transition-all duration-300 group-hover:w-20" />

                <p className="mt-4 text-sm leading-6 text-[#806052]">
                  {feature.desc}
                </p>
              </div>

              {/* Bottom decorative element */}
              <div className="mt-auto pt-7">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#c97849]" />
                  <span className="h-px flex-1 bg-[#ead6c8]" />
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom capability strip */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 rounded-[22px] border border-[#e5c6b2] bg-[#fffdfb] px-6 py-5">
          <Capability label="Architecture" value="Modular" />
          <Divider />
          <Capability label="Generation" value="Agent-driven" />
          <Divider />
          <Capability label="Output" value="Production-oriented" />
          <Divider />
          <Capability label="Workflow" value="Voice-first" />
        </div>
      </div>
    </section>
  );
}

function Capability({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-[#a27660]">
        {label}
      </span>

      <span className="text-xs font-medium text-[#4b3024]">{value}</span>
    </div>
  );
}

function Divider() {
  return (
    <span className="hidden h-1 w-1 rounded-full bg-[#c97849] sm:block" />
  );
}