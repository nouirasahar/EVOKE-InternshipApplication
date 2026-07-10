import { X } from "lucide-react";
import type { EditorTab } from "@/types/workspace";

type EditorTabsProps = {
  tabs: EditorTab[];
  activeTabPath: string | null;
  onSelect: (path: string) => void;
  onClose: (path: string) => void;
};

function getFileAccent(language: string) {
  const accents: Record<string, string> = {
    typescript: "text-blue-300",
    javascript: "text-yellow-300",
    json: "text-amber-300",
    html: "text-orange-300",
    css: "text-cyan-300",
    markdown: "text-violet-300",
  };

  return accents[language] || "text-slate-300";
}

export function EditorTabs({
  tabs,
  activeTabPath,
  onSelect,
  onClose,
}: EditorTabsProps) {
  if (tabs.length === 0) {
    return (
      <div className="flex h-11 items-center border-b border-white/10 bg-[#0c111d] px-4 text-xs text-muted-foreground">
        No open files
      </div>
    );
  }

  return (
    <div className="flex h-11 overflow-x-auto border-b border-white/10 bg-[#0c111d]">
      {tabs.map((tab) => {
        const isActive = tab.path === activeTabPath;

        return (
          <button
            key={tab.path}
            type="button"
            onClick={() => onSelect(tab.path)}
            className={`group relative flex min-w-[150px] max-w-[240px] items-center gap-2 border-r border-white/10 px-3 text-sm transition ${
              isActive
                ? "bg-[#111827] text-white"
                : "bg-[#0c111d] text-muted-foreground hover:bg-white/5 hover:text-white"
            }`}
            title={tab.path}
          >
            {isActive && (
              <span className="absolute inset-x-0 top-0 h-0.5 bg-cyan-400" />
            )}

            <span
              className={`text-xs font-semibold ${getFileAccent(
                tab.language
              )}`}
            >
              {"</>"}
            </span>

            <span className="min-w-0 flex-1 truncate text-left">
              {tab.name}
            </span>

            {tab.isDirty && (
              <span
                className="h-2 w-2 shrink-0 rounded-full bg-cyan-300"
                title="Unsaved changes"
              />
            )}

            <span
              role="button"
              tabIndex={0}
              onClick={(event) => {
                event.stopPropagation();
                onClose(tab.path);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.stopPropagation();
                  onClose(tab.path);
                }
              }}
              className="grid h-6 w-6 shrink-0 place-items-center rounded-md opacity-0 transition hover:bg-white/10 group-hover:opacity-100"
              aria-label={`Close ${tab.name}`}
            >
              <X className="h-3.5 w-3.5" />
            </span>
          </button>
        );
      })}
    </div>
  );
}