export type PanelId =
  | "explorer"
  | "search"
  | "git"
  | "chat"
  | "outline"
  | "diagnostics"
  | "terminal";

export interface EditorTab {
  path: string;
  dirty: boolean;
  pinned: boolean;
  preview: boolean;
}

export interface PaneState {
  id: string;
  tabs: EditorTab[];
  activeTab?: string;
}

export interface SearchState {
  query: string;
  caseSensitive: boolean;
  includeGlob?: string;
  excludeGlob?: string;
}

export interface DiffState {
  leftPath?: string;
  rightPath?: string;
  compareMode: "git" | "snapshot" | "manual";
}

export interface DiagnosticsPanelState {
  filter: "all" | "errors" | "warnings";
  selectedPath?: string;
}

export interface IdeShellState {
  commandPaletteOpen: boolean;
  leftSidebar: PanelId;
  bottomPanelOpen: boolean;
  panes: PaneState[];
  search: SearchState;
  diff: DiffState;
  diagnostics: DiagnosticsPanelState;
}

export function createIdeShellState(): IdeShellState {
  return {
    commandPaletteOpen: false,
    leftSidebar: "explorer",
    bottomPanelOpen: false,
    panes: [
      {
        id: "main",
        tabs: [],
      },
    ],
    search: {
      query: "",
      caseSensitive: false,
    },
    diff: {
      compareMode: "git",
    },
    diagnostics: {
      filter: "all",
    },
  };
}

export function canShowPanel(panelId: PanelId, platform: "web" | "desktop"): boolean {
  if (panelId === "terminal") {
    return platform === "desktop";
  }

  return true;
}
