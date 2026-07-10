import { useMemo, useState } from "react";
import type {
  EditorTab,
  WorkspaceFile,
} from "@/types/workspace";

export function useEditor() {
  const [openTabs, setOpenTabs] = useState<EditorTab[]>([]);
  const [activeTabPath, setActiveTabPath] = useState<string | null>(
    null
  );

  const activeTab = useMemo(
    () =>
      openTabs.find((tab) => tab.path === activeTabPath) || null,
    [openTabs, activeTabPath]
  );

  function openFile(file: WorkspaceFile) {
    setOpenTabs((currentTabs) => {
      const existingTab = currentTabs.find(
        (tab) => tab.path === file.path
      );

      if (existingTab) {
        return currentTabs;
      }

      const newTab: EditorTab = {
        path: file.path,
        name: file.path.split("/").pop() || file.path,
        language: file.language || "plaintext",
        content: file.content || "",
        originalContent: file.content || "",
        isDirty: false,
      };

      return [...currentTabs, newTab];
    });

    setActiveTabPath(file.path);
  }

  function closeTab(path: string) {
    setOpenTabs((currentTabs) => {
      const tabIndex = currentTabs.findIndex(
        (tab) => tab.path === path
      );

      const nextTabs = currentTabs.filter(
        (tab) => tab.path !== path
      );

      if (activeTabPath === path) {
        const replacementTab =
          nextTabs[tabIndex] ||
          nextTabs[tabIndex - 1] ||
          nextTabs[0] ||
          null;

        setActiveTabPath(replacementTab?.path || null);
      }

      return nextTabs;
    });
  }

  function updateActiveFile(content: string) {
    if (!activeTabPath) return;

    setOpenTabs((currentTabs) =>
      currentTabs.map((tab) => {
        if (tab.path !== activeTabPath) {
          return tab;
        }

        return {
          ...tab,
          content,
          isDirty: content !== tab.originalContent,
        };
      })
    );
  }

  function markTabAsSaved(path: string) {
    setOpenTabs((currentTabs) =>
      currentTabs.map((tab) =>
        tab.path === path
          ? {
              ...tab,
              originalContent: tab.content,
              isDirty: false,
            }
          : tab
      )
    );
  }

  function selectTab(path: string) {
    setActiveTabPath(path);
  }

  function closeAllTabs() {
    setOpenTabs([]);
    setActiveTabPath(null);
  }

  return {
    openTabs,
    activeTab,
    activeTabPath,
    openFile,
    closeTab,
    selectTab,
    updateActiveFile,
    markTabAsSaved,
    closeAllTabs,
  };
}