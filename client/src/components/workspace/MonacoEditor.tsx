import Editor, { type BeforeMount } from "@monaco-editor/react";
import { Code2 } from "lucide-react";

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

const configureTheme: BeforeMount = (monaco) => {
  monaco.editor.defineTheme("evoke-light", {
    base: "vs",
    inherit: true,
    rules: [
      {
        token: "comment",
        foreground: "9A8C84",
        fontStyle: "italic",
      },
      {
        token: "keyword",
        foreground: "8A4CBA",
      },
      {
        token: "string",
        foreground: "D85C4A",
      },
      {
        token: "number",
        foreground: "D97C48",
      },
      {
        token: "type.identifier",
        foreground: "3279B7",
      },
      {
        token: "identifier",
        foreground: "2F6F83",
      },
      {
        token: "delimiter",
        foreground: "75645B",
      },
    ],
    colors: {
      "editor.background": "#FFFFFF",
      "editor.foreground": "#2F231D",
      "editorLineNumber.foreground": "#B5AAA3",
      "editorLineNumber.activeForeground": "#D97C48",
      "editorCursor.foreground": "#D97C48",
      "editor.selectionBackground": "#F8DDD0",
      "editor.inactiveSelectionBackground": "#FCEBE2",
      "editor.lineHighlightBackground": "#FFF9F5",
      "editor.lineHighlightBorder": "#00000000",
      "editorIndentGuide.background1": "#F0EBE7",
      "editorIndentGuide.activeBackground1": "#E6B79B",
      "editorBracketMatch.background": "#FFF1E8",
      "editorBracketMatch.border": "#D97C48",
      "editorWhitespace.foreground": "#E9E3DF",
      "editorGutter.background": "#FFFFFF",
      "editorWidget.background": "#FFFFFF",
      "editorWidget.border": "#E9E3DF",
      "editorSuggestWidget.background": "#FFFFFF",
      "editorSuggestWidget.border": "#E9E3DF",
      "editorSuggestWidget.selectedBackground": "#FFF1E8",
      "editorHoverWidget.background": "#FFFFFF",
      "editorHoverWidget.border": "#E9E3DF",
      "editorOverviewRuler.border": "#00000000",
      "scrollbar.shadow": "#00000000",
      "scrollbarSlider.background": "#D8CEC855",
      "scrollbarSlider.hoverBackground": "#C9BBB377",
      "scrollbarSlider.activeBackground": "#BFAEA499",
      "minimap.background": "#FFFDFC",
    },
  });
};

export function MonacoEditor({
  activeTab,
  onChange,
}: MonacoEditorProps) {
  if (!activeTab) {
    return (
      <div className="grid h-full min-h-[560px] place-items-center bg-white">
        <div className="max-w-sm px-6 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-[#E9E3DF] bg-[#FFF8F3]">
            <Code2 className="h-7 w-7 text-[#D97C48]" />
          </div>

          <h3 className="mt-5 text-lg font-semibold text-[#2F231D]">
            No file selected
          </h3>

          <p className="mt-2 text-sm leading-6 text-[#75645B]">
            Open a file from the Explorer to review or edit the generated
            source code.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-[560px] overflow-hidden bg-white">
      <Editor
        path={activeTab.path}
        language={normalizeLanguage(activeTab.language)}
        value={activeTab.content}
        theme="evoke-light"
        beforeMount={configureTheme}
        onChange={(value) => onChange(value ?? "")}
        loading={
          <div className="grid h-full place-items-center bg-white text-sm text-[#75645B]">
            Loading editor...
          </div>
        }
        options={{
          automaticLayout: true,
          fontSize: 14,
          fontFamily:
            "'JetBrains Mono', 'Fira Code', Consolas, monospace",
          fontLigatures: true,
          lineHeight: 23,
          lineNumbers: "on",
          lineNumbersMinChars: 3,
          glyphMargin: false,
          minimap: {
            enabled: true,
            maxColumn: 80,
            renderCharacters: false,
            scale: 1,
            showSlider: "mouseover",
          },
          wordWrap: "on",
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorSmoothCaretAnimation: "on",
          cursorBlinking: "smooth",
          cursorWidth: 2,
          bracketPairColorization: {
            enabled: true,
          },
          guides: {
            bracketPairs: true,
            indentation: true,
            highlightActiveIndentation: true,
          },
          padding: {
            top: 18,
            bottom: 18,
          },
          renderWhitespace: "selection",
          renderLineHighlight: "all",
          renderLineHighlightOnlyWhenFocus: false,
          tabSize: 2,
          insertSpaces: true,
          formatOnPaste: true,
          formatOnType: true,
          quickSuggestions: true,
          suggestOnTriggerCharacters: true,
          folding: true,
          foldingHighlight: true,
          showFoldingControls: "mouseover",
          stickyScroll: {
            enabled: false,
          },
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
            useShadows: false,
          },
        }}
      />
    </div>
  );
}