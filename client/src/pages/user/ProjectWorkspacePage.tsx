import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Bot,
  Boxes,
  CheckCircle2,
  Database,
  Eye,
  EyeOff,
  FileText,
  Loader2,
  Play,
  Square,
  Terminal,
} from "lucide-react";

import { UserPageLayout } from "@/components/user/UserPageLayout";
import { EditorTabs } from "@/components/workspace/EditorTabs";
import { FileExplorer } from "@/components/workspace/FileExplorer";
import { MonacoEditor } from "@/components/workspace/MonacoEditor";
import { PreviewPanel } from "@/components/workspace/PreviewPanel";

import { useEditor } from "@/hooks/useEditor";
import { getProjectById } from "@/services/project.service";

import type {
  TreeNode,
  WorkspaceFile,
  WorkspaceProject,
} from "@/types/workspace";

const COLORS = {
  copper: "#D97C48",
  copperDark: "#C96A39",
  border: "#E6B79B",
  panel: "#FFFFFF",
  panelSoft: "#FFFDFC",
  text: "#2F231D",
  textSoft: "#75645B",
  line: "#E9E3DF",
  success: "#31A66A",
};

function buildFileTree(files: WorkspaceFile[]): TreeNode[] {
  const root: TreeNode[] = [];

  for (const file of files) {
    const normalizedPath = file.path.replaceAll("\\", "/");
    const parts = normalizedPath.split("/").filter(Boolean);

    let currentLevel = root;
    let currentPath = "";

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      const isFile = index === parts.length - 1;

      let node = currentLevel.find(
        (currentNode) => currentNode.name === part,
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

    nodes.forEach((node) => sortNodes(node.children));
  }

  sortNodes(root);

  return root;
}

function collectFolderPaths(
  nodes: TreeNode[],
  paths = new Set<string>(),
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

  const [project, setProject] = useState<WorkspaceProject | null>(
    null,
  );

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isPreviewOpen, setIsPreviewOpen] = useState(true);
  const [isPreviewStarting, setIsPreviewStarting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState("");
  const [previewKey, setPreviewKey] = useState(0);
  const [isBuilding, setIsBuilding] = useState(false);

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
        const loadedProject = data.project as WorkspaceProject;

        setProject(loadedProject);

        const tree = buildFileTree(loadedProject.files || []);

        setExpandedFolders(collectFolderPaths(tree));

        const preferredFile =
          loadedProject.files?.find(
            (file) => file.path === "client/src/App.tsx",
          ) ||
          loadedProject.files?.find(
            (file) => file.path === "client/src/App.jsx",
          ) ||
          loadedProject.files?.find((file) =>
            file.path.startsWith("client/src/"),
          ) ||
          loadedProject.files?.[0];

        if (preferredFile) {
          openFile(preferredFile);
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load project.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadProject();
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

  function runPreview() {
    if (isPreviewStarting) return;

    setIsPreviewOpen(true);
    setIsPreviewStarting(true);
    setPreviewError("");

    window.setTimeout(() => {
      setIsPreviewStarting(false);

      setPreviewError(
        "The workspace interface is ready, but the backend preview runner has not been connected yet.",
      );
    }, 1200);
  }

  function stopPreview() {
    setPreviewUrl(null);
    setPreviewError("");
    setIsPreviewStarting(false);
  }

  function refreshPreview() {
    if (!previewUrl) return;

    setPreviewKey((currentKey) => currentKey + 1);
  }

  function runBuild() {
    if (isBuilding) return;

    setIsBuilding(true);

    window.setTimeout(() => {
      setIsBuilding(false);
    }, 1200);
  }

  return (
    <UserPageLayout title="" subtitle="">
      {loading && (
        <div
          className="flex items-center gap-3 rounded-2xl border bg-white p-6"
          style={{
            borderColor: COLORS.line,
            color: COLORS.textSoft,
          }}
        >
          <Loader2
            className="h-5 w-5 animate-spin"
            style={{ color: COLORS.copper }}
          />

          Loading workspace...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-[#F2DDD3] bg-[#FFF8F5] p-6 text-[#B56557]">
          {error}
        </div>
      )}

      {!loading && !error && project && (
        <div className="space-y-3">
          <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1
                  className="text-xl font-semibold sm:text-2xl"
                  style={{ color: COLORS.text }}
                >
                  {project.title || "Project Management"}
                </h1>

                <span
                  className="rounded-lg px-3 py-1 text-xs font-semibold"
                  style={{
                    backgroundColor: "#FFF1E8",
                    color: COLORS.copperDark,
                  }}
                >
                  EVOKE Workspace
                </span>
              </div>

              <p
                className="mt-1 text-sm"
                style={{ color: COLORS.textSoft }}
              >
                Review, edit, and preview your generated application.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:flex lg:items-stretch">
              <TopInfoCard
                label="Framework"
                content={
                  <div className="flex items-center gap-3">
                    <Boxes
                      className="h-4 w-4"
                      style={{ color: COLORS.copper }}
                    />

                    <span className="text-[#5B8DEF]">⚛</span>
                    <span>EX</span>

                    <Database className="h-4 w-4 text-[#31A66A]" />
                  </div>
                }
              />

              <TopInfoCard
                label="Git status"
                content={
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded-lg px-2 py-1 text-xs font-semibold"
                      style={{
                        backgroundColor: "#F7F3F0",
                        color: COLORS.text,
                      }}
                    >
                      main ›
                    </span>

                    <CheckCircle2
                      className="h-4 w-4"
                      style={{ color: COLORS.success }}
                    />

                    <span className="text-xs">All changes saved</span>
                  </div>
                }
              />

              <div
                className="flex min-h-[72px] min-w-[150px] items-center justify-between gap-5 rounded-xl border bg-white px-5"
                style={{ borderColor: COLORS.line }}
              >
                <p
                  className="text-xs font-semibold"
                  style={{ color: COLORS.text }}
                >
                  Preview
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setIsPreviewOpen((currentValue) => !currentValue)
                  }
                  className="relative h-7 w-12 rounded-full transition-colors"
                  style={{
                    backgroundColor: isPreviewOpen
                      ? COLORS.copper
                      : "#DDD7D3",
                  }}
                  aria-label={
                    isPreviewOpen ? "Hide preview" : "Show preview"
                  }
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
                      isPreviewOpen ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <button
                type="button"
                onClick={() =>
                  setIsPreviewOpen((currentValue) => !currentValue)
                }
                className="inline-flex min-h-[72px] items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold text-white"
                style={{
                  borderColor: COLORS.copperDark,
                  backgroundColor: COLORS.copper,
                }}
              >
                {isPreviewOpen ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    Hide Preview
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Show Preview
                  </>
                )}
              </button>
            </div>
          </section>

          <section
            className="overflow-hidden rounded-[22px] border bg-white"
            style={{ borderColor: COLORS.border }}
          >
            <div
              className={`grid h-[610px] min-h-[520px] max-h-[calc(100vh-240px)] overflow-hidden ${
                isPreviewOpen
                  ? "grid-cols-[250px_minmax(420px,1.05fr)_minmax(390px,0.95fr)]"
                  : "grid-cols-[260px_minmax(0,1fr)]"
              }`}
            >
              <FileExplorer
                tree={fileTree}
                selectedPath={activeTabPath}
                expandedFolders={expandedFolders}
                onToggleFolder={toggleFolder}
                onOpenFile={openFile}
              />

              <main className="flex min-h-0 min-w-0 flex-col bg-white">
                <EditorTabs
                  tabs={openTabs}
                  activeTabPath={activeTabPath}
                  onSelect={selectTab}
                  onClose={closeTab}
                />

                <div className="min-h-0 flex-1 overflow-hidden">
                  <MonacoEditor
                    activeTab={activeTab}
                    onChange={updateActiveFile}
                  />
                </div>

                <div
                  className="flex h-8 shrink-0 items-center justify-between border-t px-3 text-[10px]"
                  style={{
                    borderColor: COLORS.line,
                    backgroundColor: COLORS.panelSoft,
                    color: COLORS.textSoft,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <span>{activeTab?.language || "plaintext"}</span>

                    {activeTab?.isDirty && (
                      <span style={{ color: COLORS.copper }}>
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

              {isPreviewOpen && (
                <div
                  key={previewKey}
                  className="min-h-0 min-w-0 overflow-hidden"
                >
                  <PreviewPanel
                    previewUrl={previewUrl}
                    isStarting={isPreviewStarting}
                    error={previewError}
                    onRun={runPreview}
                    onRefresh={refreshPreview}
                  />
                </div>
              )}
            </div>

            <div
              className="flex h-16 items-center justify-between border-t px-4"
              style={{
                borderColor: COLORS.line,
                backgroundColor: COLORS.panelSoft,
              }}
            >
              <div className="flex items-center gap-3 overflow-x-auto">
                <BottomAction
                  label={
                    isPreviewStarting
                      ? "Starting..."
                      : "Run Application"
                  }
                  icon={
                    isPreviewStarting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4 fill-current" />
                    )
                  }
                  active
                  disabled={isPreviewStarting}
                  onClick={runPreview}
                />

                <BottomAction
                  label="Stop"
                  icon={<Square className="h-4 w-4" />}
                  onClick={stopPreview}
                />

                <BottomAction
                  label={isBuilding ? "Building..." : "Build"}
                  icon={
                    isBuilding ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Boxes className="h-4 w-4" />
                    )
                  }
                  disabled={isBuilding}
                  onClick={runBuild}
                />

                <BottomAction
                  label="Logs"
                  icon={<FileText className="h-4 w-4" />}
                />

                <BottomAction
                  label="Terminal"
                  icon={<Terminal className="h-4 w-4" />}
                />

                <BottomAction
                  label="AI Chat"
                  icon={<Bot className="h-4 w-4" />}
                />
              </div>

              <div
                className="hidden items-center gap-2 rounded-xl border bg-white px-4 py-2 text-xs xl:flex"
                style={{
                  borderColor: COLORS.line,
                  color: COLORS.textSoft,
                }}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: COLORS.success }}
                />

                All systems operational
              </div>
            </div>
          </section>
        </div>
      )}
    </UserPageLayout>
  );
}

function TopInfoCard({
  label,
  content,
}: {
  label: string;
  content: React.ReactNode;
}) {
  return (
    <div
      className="min-h-[72px] rounded-xl border bg-white px-5 py-3"
      style={{ borderColor: COLORS.line }}
    >
      <p
        className="text-[10px] font-semibold uppercase tracking-[0.12em]"
        style={{ color: COLORS.textSoft }}
      >
        {label}
      </p>

      <div
        className="mt-2 text-sm font-medium"
        style={{ color: COLORS.text }}
      >
        {content}
      </div>
    </div>
  );
}

function BottomAction({
  label,
  icon,
  active = false,
  disabled = false,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-11 min-w-[112px] shrink-0 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
      style={{
        borderColor: active ? COLORS.copperDark : COLORS.line,
        backgroundColor: active ? COLORS.copper : "#FFFFFF",
        color: active ? "#FFFFFF" : COLORS.text,
      }}
    >
      {icon}
      {label}
    </button>
  );
}