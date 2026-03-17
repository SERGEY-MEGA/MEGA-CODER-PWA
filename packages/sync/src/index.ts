export interface SyncStrategy {
  mode: "manual-export" | "backup" | "account-sync";
  supportsOfflineQueue: boolean;
  supportsConflictResolution: boolean;
}

export const syncStrategies: SyncStrategy[] = [
  {
    mode: "manual-export",
    supportsOfflineQueue: false,
    supportsConflictResolution: false,
  },
  {
    mode: "backup",
    supportsOfflineQueue: true,
    supportsConflictResolution: false,
  },
  {
    mode: "account-sync",
    supportsOfflineQueue: true,
    supportsConflictResolution: true,
  },
];

export function getDefaultSyncStrategy(platform: "web" | "desktop"): SyncStrategy {
  return platform === "web" ? syncStrategies[0] : syncStrategies[1];
}
