import Editor from "@monaco-editor/react";
import type { EditorTab } from "@/types/workspace";

type MonacoEditorProps = {
  activeTab: EditorTab | null;
  onChange: (content: string) => void;
};

const normalizeLanguage = (language?: string) => {
  const map: Record<string, string> = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    md: "markdown",
    env: "plaintext",
    text: "plaintext",
    properties: "plaintext",
  };

  if (!language) return "plaintext";

  return map[language] || language;
};

export function MonacoEditor({
  activeTab,
  onChange,
}: MonacoEditorProps) {
  if (!activeTab) {
    return (
      <div className="grid h-full min-h-[520px] place-items-center bg-[#0b0f1a]">
        <div className="max-w-sm text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/5 text-2xl">
            {"</>"}
          </div>

          <h3 className="mt-5 text-lg font-semibold text-white">
            No file selected
          </h3>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Open a file from the Explorer to start reviewing or editing the
            generated source code.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-[520px] overflow-hidden bg-[#0b0f1a]">
      <Editor
        path={activeTab.path}
        language={normalizeLanguage(activeTab.language)}
        value={activeTab.content}
        theme="vs-dark"
        onChange={(value) => onChange(value ?? "")}
        loading={
          <div className="grid h-full place-items-center text-sm text-muted-foreground">
            Loading editor...
          </div>
        }
        options={{
          automaticLayout: true,
          fontSize: 14,
          fontFamily:
            "'JetBrains Mono', 'Fira Code', Consolas, monospace",
          fontLigatures: true,
          lineHeight: 22,
          lineNumbers: "on",
          minimap: {
            enabled: true,
          },
          wordWrap: "on",
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorSmoothCaretAnimation: "on",
          cursorBlinking: "smooth",
          bracketPairColorization: {
            enabled: true,
          },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          padding: {
            top: 16,
            bottom: 16,
          },
          renderWhitespace: "selection",
          renderLineHighlight: "all",
          tabSize: 2,
          insertSpaces: true,
          formatOnPaste: true,
          formatOnType: true,
          quickSuggestions: true,
          suggestOnTriggerCharacters: true,
          folding: true,
          stickyScroll: {
            enabled: true,
          },
        }}
      />
    </div>
  );
}