export type PlatformKind = "web" | "desktop";

export type PermissionScope =
  | "read"
  | "edit"
  | "delete"
  | "git"
  | "shell"
  | "network"
  | "secrets";

export type ApprovalMode = "auto" | "approve" | "deny";

export interface PlatformProfile {
  kind: PlatformKind;
  label: string;
  canRunShell: boolean;
  canAccessRealFolders: boolean;
  canUseGit: boolean;
  canRunBackgroundIndexing: boolean;
  secretStorage: "session" | "encrypted-browser-store" | "os-keychain";
}

export interface PermissionRule {
  scope: PermissionScope;
  ask: ApprovalMode;
  edit: ApprovalMode;
  agent: ApprovalMode;
}

export interface PolicyPreset {
  id: "StrictLocal" | "Balanced" | "CloudEnhanced";
  allowCloudModels: boolean;
  allowExternalExecution: boolean;
  requireApprovalForCloud: boolean;
}

export const platformMatrix: Record<PlatformKind, PlatformProfile> = {
  web: {
    kind: "web",
    label: "Web/PWA",
    canRunShell: false,
    canAccessRealFolders: true,
    canUseGit: false,
    canRunBackgroundIndexing: false,
    secretStorage: "encrypted-browser-store",
  },
  desktop: {
    kind: "desktop",
    label: "Desktop",
    canRunShell: true,
    canAccessRealFolders: true,
    canUseGit: true,
    canRunBackgroundIndexing: true,
    secretStorage: "os-keychain",
  },
};

export const permissionRules: PermissionRule[] = [
  { scope: "read", ask: "auto", edit: "auto", agent: "auto" },
  { scope: "edit", ask: "deny", edit: "approve", agent: "approve" },
  { scope: "delete", ask: "deny", edit: "approve", agent: "approve" },
  { scope: "git", ask: "deny", edit: "approve", agent: "approve" },
  { scope: "shell", ask: "deny", edit: "deny", agent: "approve" },
  { scope: "network", ask: "deny", edit: "approve", agent: "approve" },
  { scope: "secrets", ask: "deny", edit: "deny", agent: "approve" },
];

export const policyPresets: Record<PolicyPreset["id"], PolicyPreset> = {
  StrictLocal: {
    id: "StrictLocal",
    allowCloudModels: false,
    allowExternalExecution: false,
    requireApprovalForCloud: true,
  },
  Balanced: {
    id: "Balanced",
    allowCloudModels: true,
    allowExternalExecution: false,
    requireApprovalForCloud: true,
  },
  CloudEnhanced: {
    id: "CloudEnhanced",
    allowCloudModels: true,
    allowExternalExecution: true,
    requireApprovalForCloud: false,
  },
};

export function getPlatformProfile(platform: PlatformKind): PlatformProfile {
  return platformMatrix[platform];
}

export function getRule(scope: PermissionScope): PermissionRule {
  const rule = permissionRules.find((entry) => entry.scope === scope);

  if (!rule) {
    throw new Error(`Missing permission rule for scope: ${scope}`);
  }

  return rule;
}
