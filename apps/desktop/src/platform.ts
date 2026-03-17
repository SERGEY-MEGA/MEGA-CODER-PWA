import { createIdeShellState } from "../../../packages/editor-shell/src/index";
import { getPlatformProfile } from "../../../packages/security-policy/src/index";
import { createEmptyWorkspaceState } from "../../../packages/workspace-core/src/index";

export const desktopProfile = getPlatformProfile("desktop");

export const desktopBootstrapState = {
  platform: desktopProfile,
  shell: createIdeShellState(),
  workspace: createEmptyWorkspaceState("MEGA CODER Desktop Workspace", "desktop"),
};
