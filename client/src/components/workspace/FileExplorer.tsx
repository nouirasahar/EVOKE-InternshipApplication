import {
  ChevronDown,
  ChevronRight,
  FileCode2,
  Folder,
  FolderOpen,
  Plus,
} from "lucide-react";

import type { TreeNode, WorkspaceFile } from "@/types/workspace";

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
    <aside className="flex h-full min-h-0 flex-col border-r border-[#E9E3DF] bg-[#FFFDFC]">
      <div className="flex h-12 items-center justify-between border-b border-[#E9E3DF] px-4">
        <div className="flex items-center gap-2">
          <Folder className="h-4 w-4 text-[#D97C48]" />

          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2F231D]">
            Explorer
          </span>
        </div>

        <button
          type="button"
          aria-label="Create new file"
          className="grid h-7 w-7 place-items-center rounded-lg text-[#75645B] transition-colors hover:bg-[#FFF1E8] hover:text-[#D97C48]"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-2 py-3">
        {tree.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#E9E3DF] bg-white px-4 py-6 text-center">
            <Folder className="mx-auto h-5 w-5 text-[#D97C48]" />

            <p className="mt-3 text-sm font-medium text-[#2F231D]">
              No files found
            </p>

            <p className="mt-1 text-xs leading-5 text-[#8A7C74]">
              Generated project files will appear here.
            </p>
          </div>
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
          className="group flex w-full items-center gap-2 rounded-lg py-1.5 pr-2 text-left text-sm text-[#5F514A] transition-colors hover:bg-[#FFF8F3] hover:text-[#2F231D]"
          style={{
            paddingLeft: `${8 + depth * 14}px`,
          }}
        >
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#8A7C74]" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#8A7C74]" />
          )}

          {isExpanded ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-[#D97C48]" />
          ) : (
            <Folder className="h-4 w-4 shrink-0 text-[#D97C48]" />
          )}

          <span className="min-w-0 flex-1 truncate font-medium">
            {node.name}
          </span>
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
      title={node.path}
      className={`group flex w-full items-center gap-2 rounded-lg py-1.5 pr-2 text-left text-sm transition-colors ${
        isSelected
          ? "bg-[#FFF1E8] text-[#C96A39]"
          : "text-[#75645B] hover:bg-[#FFF8F3] hover:text-[#2F231D]"
      }`}
      style={{
        paddingLeft: `${28 + depth * 14}px`,
      }}
    >
      <FileCode2
        className={`h-4 w-4 shrink-0 ${
          isSelected
            ? "text-[#D97C48]"
            : "text-[#A79B94] group-hover:text-[#D97C48]"
        }`}
      />

      <span
        className={`min-w-0 flex-1 truncate ${
          isSelected ? "font-semibold" : "font-normal"
        }`}
      >
        {node.name}
      </span>
    </button>
  );
}