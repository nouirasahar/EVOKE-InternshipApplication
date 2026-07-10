import {
  ChevronDown,
  ChevronRight,
  FileCode2,
  Folder,
  FolderOpen,
} from "lucide-react";
import type {
  TreeNode,
  WorkspaceFile,
} from "@/types/workspace";

type FileExplorerProps = {
  tree: TreeNode[];
  selectedPath: string | null;
  expandedFolders: Set<string>;
  onToggleFolder: (path: string) => void;
  onOpenFile: (file: WorkspaceFile) => void;
};

export function FileExplorer({
  tree,
  selectedPath,
  expandedFolders,
  onToggleFolder,
  onOpenFile,
}: FileExplorerProps) {
  return (
    <aside className="flex h-full min-h-0 flex-col border-r border-white/10 bg-[#0a0f19]">
      <div className="flex h-11 items-center gap-2 border-b border-white/10 px-4">
        <Folder className="h-4 w-4 text-cyan-400" />
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
          Explorer
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-2 py-3">
        {tree.length === 0 ? (
          <p className="px-3 py-4 text-sm text-muted-foreground">
            No generated files found.
          </p>
        ) : (
          tree.map((node) => (
            <ExplorerNode
              key={node.path}
              node={node}
              depth={0}
              selectedPath={selectedPath}
              expandedFolders={expandedFolders}
              onToggleFolder={onToggleFolder}
              onOpenFile={onOpenFile}
            />
          ))
        )}
      </div>
    </aside>
  );
}

type ExplorerNodeProps = {
  node: TreeNode;
  depth: number;
  selectedPath: string | null;
  expandedFolders: Set<string>;
  onToggleFolder: (path: string) => void;
  onOpenFile: (file: WorkspaceFile) => void;
};

function ExplorerNode({
  node,
  depth,
  selectedPath,
  expandedFolders,
  onToggleFolder,
  onOpenFile,
}: ExplorerNodeProps) {
  const isFolder = node.type === "folder";
  const isExpanded = expandedFolders.has(node.path);
  const isSelected = selectedPath === node.path;

  if (isFolder) {
    return (
      <div>
        <button
          type="button"
          onClick={() => onToggleFolder(node.path)}
          className="flex w-full items-center gap-2 rounded-md py-1.5 pr-2 text-left text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
          style={{
            paddingLeft: `${8 + depth * 16}px`,
          }}
        >
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          )}

          {isExpanded ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-cyan-400" />
          ) : (
            <Folder className="h-4 w-4 shrink-0 text-cyan-400" />
          )}

          <span className="truncate">{node.name}</span>
        </button>

        {isExpanded &&
          node.children.map((child) => (
            <ExplorerNode
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              expandedFolders={expandedFolders}
              onToggleFolder={onToggleFolder}
              onOpenFile={onOpenFile}
            />
          ))}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => node.file && onOpenFile(node.file)}
      className={`flex w-full items-center gap-2 rounded-md py-1.5 pr-2 text-left text-sm transition ${
        isSelected
          ? "bg-cyan-400/10 text-cyan-300"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
      style={{
        paddingLeft: `${28 + depth * 16}px`,
      }}
    >
      <FileCode2 className="h-4 w-4 shrink-0" />
      <span className="truncate">{node.name}</span>
    </button>
  );
}