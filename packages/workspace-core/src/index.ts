export type WorkspacePlatform = "web" | "desktop";

export type FileClassification =
  | "source"
  | "config"
  | "secret"
  | "generated"
  | "binary";

export interface WorkspaceFile {
  path: string;
  contentHash: string;
  size: number;
  language?: string;
  classification: FileClassification;
  dirty: boolean;
}

export interface SearchIndexState {
  textIndexReady: boolean;
  symbolIndexReady: boolean;
  semanticIndexReady: boolean;
}

export interface DiagnosticEntry {
  path: string;
  severity: "info" | "warning" | "error";
  message: string;
  source: "parser" | "linter" | "git" | "ai";
}

export interface WorkspaceSnapshot {
  id: string;
  createdAt: string;
  reason: "manual" | "checkpoint" | "before-agent-run" | "before-sync";
  fileCount: number;
}

export interface WorkspaceManifest {
  id: string;
  name: string;
  platform: WorkspacePlatform;
  rootUri: string;
  activeFile?: string;
  openTabs: string[];
  recentSearches: string[];
  policyPreset: "StrictLocal" | "Balanced" | "CloudEnhanced";
}

export interface WorkspaceState {
  manifest: WorkspaceManifest;
  files: WorkspaceFile[];
  snapshots: WorkspaceSnapshot[];
  search: SearchIndexState;
  diagnostics: DiagnosticEntry[];
}

export interface WorkspaceAdapter {
  platform: WorkspacePlatform;
  canWatchFiles: boolean;
  canAccessRealDirectories: boolean;
  loadState(): Promise<WorkspaceState>;
  saveSnapshot(reason: WorkspaceSnapshot["reason"]): Promise<WorkspaceSnapshot>;
}

export function createEmptyWorkspaceState(
  name: string,
  platform: WorkspacePlatform,
): WorkspaceState {
  return {
    manifest: {
      id: `${platform}:${name.toLowerCase().replace(/\s+/g, "-")}`,
      name,
      platform,
      rootUri: platform === "web" ? "indexeddb://workspace" : "file://workspace",
      openTabs: [],
      recentSearches: [],
      policyPreset: "Balanced",
    },
    files: [],
    snapshots: [],
    search: {
      textIndexReady: false,
      symbolIndexReady: false,
      semanticIndexReady: false,
    },
    diagnostics: [],
  };
}
