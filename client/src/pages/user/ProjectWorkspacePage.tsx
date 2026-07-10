import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { UserPageLayout } from "@/components/user/UserPageLayout";
import { FileExplorer } from "@/components/workspace/FileExplorer";
import { EditorTabs } from "@/components/workspace/EditorTabs";
import { MonacoEditor } from "@/components/workspace/MonacoEditor";

import { useEditor } from "@/hooks/useEditor";
import { getProjectById } from "@/services/project.service";

import type {
  TreeNode,
  WorkspaceFile,
  WorkspaceProject,
} from "@/types/workspace";

function buildFileTree(files: WorkspaceFile[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const file of files) {
    const normalizedPath = file.path.replaceAll("\\", "/");
    const parts = normalizedPath.split("/").filter(Boolean);

    let currentLevel = root;
    let currentPath = "";

    parts.forEach((part, index) => {
      currentPath = currentPath
        ? `${currentPath}/${part}`
        : part;

      const isFile = index === parts.length - 1;

      let node = currentLevel.find(
        (currentNode) => currentNode.name === part
      );

      if (!node) {
        node = {
          name: part,
          path: currentPath,
          type: isFile ? "file" : "folder",
          file: isFile ? file : undefined,
          children: [],
        };

        currentLevel.push(node);
      }

      if (!isFile) {
        currentLevel = node.children;
      }
    });
  }

  function sortNodes(nodes: TreeNode[]) {
    nodes.sort((firstNode, secondNode) => {
      if (firstNode.type !== secondNode.type) {
        return firstNode.type === "folder" ? -1 : 1;
      }

      return firstNode.name.localeCompare(secondNode.name);
    });

    nodes.forEach((node) => {
      sortNodes(node.children);
    });
  }

  sortNodes(root);

  return root;
}

function collectFolderPaths(
  nodes: TreeNode[],
  paths = new Set<string>()
) {
  for (const node of nodes) {
    if (node.type === "folder") {
      paths.add(node.path);
      collectFolderPaths(node.children, paths);
    }
  }

  return paths;
}

export default function ProjectWorkspacePage() {
  const { id } = useParams();

  const [project, setProject] =
    useState<WorkspaceProject | null>(null);

  const [expandedFolders, setExpandedFolders] =
    useState<Set<string>>(new Set());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const {
    openTabs,
    activeTab,
    activeTabPath,
    openFile,
    closeTab,
    selectTab,
    updateActiveFile,
  } = useEditor();

  useEffect(() => {
    async function loadProject() {
      try {
        if (!id) {
          setError("Project ID is missing.");
          return;
        }

        const data = await getProjectById(id);
        const loadedProject =
          data.project as WorkspaceProject;

        setProject(loadedProject);

        const tree = buildFileTree(
          loadedProject.files || []
        );

        setExpandedFolders(
          collectFolderPaths(tree)
        );

        const preferredFile =
          loadedProject.files?.find(
            (file) =>
              file.path === "client/src/App.tsx"
          ) ||
          loadedProject.files?.find(
            (file) =>
              file.path.startsWith("client/src/")
          ) ||
          loadedProject.files?.[0];

        if (preferredFile) {
          openFile(preferredFile);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load project."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [id]);

  const fileTree = useMemo(() => {
    return buildFileTree(project?.files || []);
  }, [project]);

  function toggleFolder(path: string) {
    setExpandedFolders((currentFolders) => {
      const nextFolders = new Set(currentFolders);

      if (nextFolders.has(path)) {
        nextFolders.delete(path);
      } else {
        nextFolders.add(path);
      }

      return nextFolders;
    });
  }

  return (
    <UserPageLayout
      title={project?.title || "EVOKE Workspace"}
      subtitle="Review and edit the generated application."
    >
      {loading && (
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-6 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading workspace...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-6 text-red-300">
          {error}
        </div>
      )}

      {!loading && !error && project && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#080c14] shadow-2xl">
          <div className="flex h-12 items-center justify-between border-b border-white/10 bg-[#0c111d] px-4">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm font-semibold text-white">
                  {project.title}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  EVOKE IDE
                </p>
              </div>

              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
                {project.status}
              </span>
            </div>

            <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
              <span>{project.framework}</span>
              <span>•</span>
              <span>{project.backend}</span>
              <span>•</span>
              <span>{project.database}</span>
            </div>
          </div>

          <div className="grid h-[720px] grid-cols-[280px_minmax(0,1fr)]">
            <FileExplorer
              tree={fileTree}
              selectedPath={activeTabPath}
              expandedFolders={expandedFolders}
              onToggleFolder={toggleFolder}
              onOpenFile={openFile}
            />

            <main className="flex min-w-0 flex-col bg-[#0b0f1a]">
              <EditorTabs
                tabs={openTabs}
                activeTabPath={activeTabPath}
                onSelect={selectTab}
                onClose={closeTab}
              />

              <div className="min-h-0 flex-1">
                <MonacoEditor
                  activeTab={activeTab}
                  onChange={updateActiveFile}
                />
              </div>

              <div className="flex h-7 items-center justify-between border-t border-white/10 bg-[#09101a] px-3 text-[11px] text-slate-400">
                <div className="flex items-center gap-4">
                  <span>
                    {activeTab?.language || "plaintext"}
                  </span>

                  {activeTab?.isDirty && (
                    <span className="text-amber-300">
                      Unsaved changes
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <span>UTF-8</span>
                  <span>Spaces: 2</span>
                  <span>Ln 1, Col 1</span>
                </div>
              </div>
            </main>
          </div>
        </div>
      )}
    </UserPageLayout>
  );
}