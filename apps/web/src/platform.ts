import { createIdeShellState } from "../../../packages/editor-shell/src/index";
import { getPlatformProfile } from "../../../packages/security-policy/src/index";
import { createEmptyWorkspaceState } from "../../../packages/workspace-core/src/index";

export const webProfile = getPlatformProfile("web");

export const webBootstrapState = {
  platform: webProfile,
  shell: createIdeShellState(),
  workspace: createEmptyWorkspaceState("MEGA CODER Web Workspace", "web"),
};
