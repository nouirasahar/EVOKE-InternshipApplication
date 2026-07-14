import { Code2, MoreVertical, Plus, X } from "lucide-react";

import type { EditorTab } from "@/types/workspace";

type EditorTabsProps = {
  tabs: EditorTab[];
  activeTabPath: string | null;
  onSelect: (path: string) => void;
  onClose: (path: string) => void;
};

function getFileIcon(language: string) {
  const iconClasses: Record<string, string> = {
    typescript: "text-[#5B8DEF]",
    javascript: "text-[#D7A93B]",
    json: "text-[#D97C48]",
    html: "text-[#E76545]",
    css: "text-[#6589D9]",
    markdown: "text-[#7A706A]",
  };

  return iconClasses[language] ?? "text-[#D97C48]";
}

export function EditorTabs({
  tabs,
  activeTabPath,
  onSelect,
  onClose,
}: EditorTabsProps) {
  return (
    <div className="flex h-12 items-stretch border-b border-[#E9E3DF] bg-[#FFFDFC]">
      <div className="flex min-w-0 flex-1 overflow-x-auto">
        {tabs.length === 0 ? (
          <div className="flex items-center px-5 text-xs text-[#8A7C74]">
            No open files
          </div>
        ) : (
          tabs.map((tab) => {
            const isActive = tab.path === activeTabPath;

            return (
              <div
                key={tab.path}
                className={`group relative flex min-w-[170px] max-w-[240px] items-center border-r border-[#E9E3DF] transition-colors ${
                  isActive
                    ? "bg-white text-[#2F231D]"
                    : "bg-[#FFFDFC] text-[#75645B] hover:bg-[#FFF8F3]"
                }`}
              >
                {isActive && (
                  <span className="absolute inset-x-0 top-0 h-0.5 bg-[#D97C48]" />
                )}

                <button
                  type="button"
                  onClick={() => onSelect(tab.path)}
                  title={tab.path}
                  className="flex min-w-0 flex-1 items-center gap-2.5 px-4 py-3 text-left"
                >
                  <Code2
                    className={`h-4 w-4 shrink-0 ${getFileIcon(
                      tab.language,
                    )}`}
                  />

                  <span
                    className={`min-w-0 flex-1 truncate text-sm ${
                      isActive ? "font-semibold" : "font-medium"
                    }`}
                  >
                    {tab.name}
                  </span>

                  {tab.isDirty && (
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#D97C48]"
                      title="Unsaved changes"
                    />
                  )}
                </button>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onClose(tab.path);
                  }}
                  aria-label={`Close ${tab.name}`}
                  className={`mr-2 grid h-7 w-7 shrink-0 place-items-center rounded-lg transition ${
                    isActive
                      ? "text-[#75645B] hover:bg-[#FFF1E8] hover:text-[#C96A39]"
                      : "text-[#A69A93] opacity-0 hover:bg-[#FFF1E8] hover:text-[#C96A39] group-hover:opacity-100"
                  }`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })
        )}

        <button
          type="button"
          aria-label="Open new file"
          className="grid w-12 shrink-0 place-items-center border-r border-[#E9E3DF] text-[#75645B] transition-colors hover:bg-[#FFF8F3] hover:text-[#D97C48]"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex shrink-0 items-center border-l border-[#E9E3DF] px-2">
        <button
          type="button"
          aria-label="Editor options"
          className="grid h-8 w-8 place-items-center rounded-lg text-[#75645B] transition-colors hover:bg-[#FFF8F3] hover:text-[#D97C48]"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}