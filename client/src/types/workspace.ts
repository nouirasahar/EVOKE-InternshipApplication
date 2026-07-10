export type WorkspaceFile = {
  path: string;
  content: string;
  language: string;
};

export type WorkspaceProject = {
  _id: string;
  title: string;
  prompt: string;
  framework: string;
  backend?: string;
  database?: string;
  status: string;
  files: WorkspaceFile[];
  createdAt: string;
  updatedAt?: string;
};

export type TreeNode = {
  name: string;
  path: string;
  type: "file" | "folder";
  file?: WorkspaceFile;
  children: TreeNode[];
};

export type EditorTab = {
  path: string;
  name: string;
  language: string;
  content: string;
  originalContent: string;
  isDirty: boolean;
};

export type BottomPanelTab =
  | "terminal"
  | "agents"
  | "problems"
  | "logs"
  | "output";

export type WorkspaceViewMode =
  | "editor"
  | "split"
  | "preview";

export type AgentExecution = {
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  logs: string[];
  executionTimeMs?: number;
  error?: string | null;
};

export type WorkspaceState = {
  project: WorkspaceProject | null;
  selectedFile: WorkspaceFile | null;
  openTabs: EditorTab[];
  activeTabPath: string | null;
  expandedFolders: Set<string>;
  activeBottomPanel: BottomPanelTab;
  viewMode: WorkspaceViewMode;
  isBottomPanelOpen: boolean;
  isSidebarOpen: boolean;
  isSaving: boolean;
  loading: boolean;
  error: string;
};