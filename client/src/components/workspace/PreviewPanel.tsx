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

const COLORS = {
  copper: "#D97C48",
  copperDark: "#C96A39",
  border: "#E6B79B",
  panel: "#FFFFFF",
  panelSoft: "#FFFDFC",
  muted: "#F7F3F0",
  text: "#2F231D",
  textSoft: "#75645B",
  line: "#E9E3DF",
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
    <section
      className="flex h-full min-h-0 flex-col border-l"
      style={{
        borderColor: COLORS.line,
        backgroundColor: COLORS.panel,
      }}
    >
      <header
        className="flex h-12 shrink-0 items-center justify-between border-b px-4"
        style={{
          borderColor: COLORS.line,
          backgroundColor: COLORS.panelSoft,
        }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="text-xs font-semibold uppercase tracking-[0.16em]"
            style={{ color: COLORS.text }}
          >
            Preview
          </span>

          <span
            className="rounded-full px-2.5 py-1 text-[10px] font-semibold"
            style={{
              backgroundColor: previewUrl
                ? "#FFF1E8"
                : isStarting
                  ? "#FFF8F3"
                  : COLORS.muted,
              color: previewUrl
                ? COLORS.copperDark
                : isStarting
                  ? COLORS.copper
                  : COLORS.textSoft,
            }}
          >
            {previewUrl ? "Live" : isStarting ? "Starting" : "Stopped"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <DeviceButton
            active={device === "desktop"}
            label="Desktop"
            onClick={() => setDevice("desktop")}
            icon={<Monitor className="h-4 w-4" />}
          />

          <DeviceButton
            active={device === "tablet"}
            label="Tablet"
            onClick={() => setDevice("tablet")}
            icon={<Tablet className="h-4 w-4" />}
          />

          <DeviceButton
            active={device === "mobile"}
            label="Mobile"
            onClick={() => setDevice("mobile")}
            icon={<Smartphone className="h-4 w-4" />}
          />

          <div
            className="mx-2 h-5 w-px"
            style={{ backgroundColor: COLORS.line }}
          />

          <button
            type="button"
            onClick={onRefresh}
            disabled={!previewUrl}
            className="grid h-8 w-8 place-items-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-30"
            style={{ color: COLORS.textSoft }}
            title="Refresh preview"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={openPreviewInNewTab}
            disabled={!previewUrl}
            className="grid h-8 w-8 place-items-center rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-30"
            style={{ color: COLORS.textSoft }}
            title="Open preview in new tab"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div
        className="min-h-0 flex-1 overflow-auto p-4"
        style={{ backgroundColor: COLORS.panelSoft }}
      >
        {error ? (
          <div className="grid h-full min-h-[520px] place-items-center">
            <div
              className="max-w-sm rounded-[22px] border bg-white p-7 text-center"
              style={{ borderColor: COLORS.border }}
            >
              <div
                className="mx-auto grid h-14 w-14 place-items-center rounded-2xl"
                style={{
                  backgroundColor: "#FFF1E8",
                  color: COLORS.copper,
                }}
              >
                <Play className="h-6 w-6" />
              </div>

              <h3
                className="mt-5 text-lg font-semibold"
                style={{ color: COLORS.text }}
              >
                Preview failed
              </h3>

              <p
                className="mt-2 text-sm leading-6"
                style={{ color: COLORS.textSoft }}
              >
                {error}
              </p>

              <button
                type="button"
                onClick={onRun}
                className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl border px-5 text-sm font-semibold text-white transition-colors"
                style={{
                  borderColor: COLORS.copperDark,
                  backgroundColor: COLORS.copper,
                }}
              >
                <Play className="h-4 w-4" />
                Try again
              </button>
            </div>
          </div>
        ) : previewUrl ? (
          <div className="flex h-full min-h-[520px] justify-center">
            <div
              className="flex h-full flex-col overflow-hidden rounded-[18px] border bg-white transition-[width] duration-300"
              style={{
                width: deviceWidths[device],
                maxWidth: "100%",
                borderColor: COLORS.line,
              }}
            >
              <div
                className="flex h-10 shrink-0 items-center gap-3 border-b px-4"
                style={{
                  borderColor: COLORS.line,
                  backgroundColor: "#FAF8F6",
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#F06B5F]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#F4B942]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#66B96B]" />
                </div>

                <div
                  className="mx-auto flex h-7 min-w-0 max-w-md flex-1 items-center justify-center rounded-lg px-3 text-[11px]"
                  style={{
                    backgroundColor: COLORS.panel,
                    color: COLORS.textSoft,
                  }}
                >
                  <span className="truncate">{previewUrl}</span>
                </div>
              </div>

              <iframe
                title="Generated application preview"
                src={previewUrl}
                className="min-h-0 flex-1 border-0 bg-white"
                sandbox="allow-forms allow-modals allow-popups allow-same-origin allow-scripts"
              />
            </div>
          </div>
        ) : (
          <div className="grid h-full min-h-[520px] place-items-center">
            <div className="max-w-sm text-center">
              <div
                className="mx-auto grid h-20 w-20 place-items-center rounded-[24px] border bg-white"
                style={{
                  borderColor: COLORS.border,
                  color: COLORS.copper,
                }}
              >
                {isStarting ? (
                  <RefreshCw className="h-8 w-8 animate-spin" />
                ) : (
                  <Play className="h-8 w-8" />
                )}
              </div>

              <h3
                className="mt-6 text-lg font-semibold"
                style={{ color: COLORS.text }}
              >
                {isStarting
                  ? "Starting your application"
                  : "Run your generated application"}
              </h3>

              <p
                className="mt-2 text-sm leading-6"
                style={{ color: COLORS.textSoft }}
              >
                EVOKE will install the dependencies, start the development
                server, and display the application here.
              </p>

              <button
                type="button"
                onClick={onRun}
                disabled={isStarting}
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl border px-5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  borderColor: COLORS.copperDark,
                  backgroundColor: COLORS.copper,
                }}
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

      <footer
        className="flex h-8 shrink-0 items-center justify-between border-t px-4 text-[10px]"
        style={{
          borderColor: COLORS.line,
          backgroundColor: COLORS.panelSoft,
          color: COLORS.textSoft,
        }}
      >
        <span className="capitalize">{device}</span>

        <span className="max-w-[65%] truncate">
          {previewUrl || "No preview server"}
        </span>
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
      className="grid h-8 w-8 place-items-center rounded-lg border transition-colors"
      style={{
        borderColor: active ? COLORS.border : "transparent",
        backgroundColor: active ? "#FFF1E8" : "transparent",
        color: active ? COLORS.copper : COLORS.textSoft,
      }}
    >
      {icon}
    </button>
  );
}