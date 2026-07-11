import {
  ExternalLink,
  Monitor,
  Play,
  RefreshCw,
  Smartphone,
  Tablet,
} from "lucide-react";
import { useState } from "react";

type PreviewDevice = "desktop" | "tablet" | "mobile";

type PreviewPanelProps = {
  previewUrl?: string | null;
  isStarting?: boolean;
  error?: string;
  onRun?: () => void;
  onRefresh?: () => void;
};

const deviceWidths: Record<PreviewDevice, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
};

export function PreviewPanel({
  previewUrl = null,
  isStarting = false,
  error = "",
  onRun,
  onRefresh,
}: PreviewPanelProps) {
  const [device, setDevice] = useState<PreviewDevice>("desktop");

  function openPreviewInNewTab() {
    if (!previewUrl) return;

    window.open(previewUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <section className="flex h-full min-h-0 flex-col border-l border-white/10 bg-[#080d17]">
      <header className="flex h-11 shrink-0 items-center justify-between border-b border-white/10 bg-[#0c111d] px-3">
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4 text-cyan-400" />

          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
            Preview
          </span>

          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
              previewUrl
                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                : isStarting
                  ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
                  : "border-slate-400/20 bg-slate-400/10 text-slate-400"
            }`}
          >
            {previewUrl
              ? "Running"
              : isStarting
                ? "Starting"
                : "Stopped"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <DeviceButton
            active={device === "desktop"}
            label="Desktop"
            onClick={() => setDevice("desktop")}
            icon={<Monitor className="h-3.5 w-3.5" />}
          />

          <DeviceButton
            active={device === "tablet"}
            label="Tablet"
            onClick={() => setDevice("tablet")}
            icon={<Tablet className="h-3.5 w-3.5" />}
          />

          <DeviceButton
            active={device === "mobile"}
            label="Mobile"
            onClick={() => setDevice("mobile")}
            icon={<Smartphone className="h-3.5 w-3.5" />}
          />

          <div className="mx-1 h-5 w-px bg-white/10" />

          <button
            type="button"
            onClick={onRefresh}
            disabled={!previewUrl}
            className="grid h-7 w-7 place-items-center rounded-md text-slate-400 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            title="Refresh preview"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={openPreviewInNewTab}
            disabled={!previewUrl}
            className="grid h-7 w-7 place-items-center rounded-md text-slate-400 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            title="Open preview in new tab"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-auto bg-[#050810] p-3">
        {error ? (
          <div className="grid h-full place-items-center">
            <div className="max-w-sm rounded-2xl border border-red-400/20 bg-red-400/5 p-6 text-center">
              <h3 className="font-semibold text-red-300">
                Preview failed
              </h3>

              <p className="mt-2 text-sm leading-6 text-red-200/70">
                {error}
              </p>

              <button
                type="button"
                onClick={onRun}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-400/20"
              >
                <Play className="h-4 w-4" />
                Try again
              </button>
            </div>
          </div>
        ) : previewUrl ? (
          <div className="flex h-full min-h-[500px] justify-center">
            <div
              className="h-full overflow-hidden rounded-lg border border-white/10 bg-white shadow-2xl transition-[width] duration-300"
              style={{
                width: deviceWidths[device],
                maxWidth: "100%",
              }}
            >
              <iframe
                title="Generated application preview"
                src={previewUrl}
                className="h-full w-full border-0"
                sandbox="allow-forms allow-modals allow-popups allow-same-origin allow-scripts"
              />
            </div>
          </div>
        ) : (
          <div className="grid h-full min-h-[500px] place-items-center">
            <div className="max-w-sm text-center">
              <div className="relative mx-auto grid h-20 w-20 place-items-center rounded-3xl border border-cyan-400/20 bg-cyan-400/10">
                <div className="absolute inset-0 animate-pulse rounded-3xl bg-cyan-400/10 blur-xl" />
                <Play className="relative h-8 w-8 text-cyan-300" />
              </div>

              <h3 className="mt-6 text-lg font-semibold text-white">
                Run your generated application
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                EVOKE will install the project dependencies, start the
                development server, and display the application here.
              </p>

              <button
                type="button"
                onClick={onRun}
                disabled={isStarting}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isStarting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Starting preview...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Run Project
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <footer className="flex h-7 shrink-0 items-center justify-between border-t border-white/10 bg-[#09101a] px-3 text-[10px] text-slate-500">
        <span>{device}</span>
        <span>{previewUrl || "No preview server"}</span>
      </footer>
    </section>
  );
}

function DeviceButton({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`grid h-7 w-7 place-items-center rounded-md transition ${
        active
          ? "bg-cyan-400/10 text-cyan-300"
          : "text-slate-500 hover:bg-white/10 hover:text-white"
      }`}
    >
      {icon}
    </button>
  );
}