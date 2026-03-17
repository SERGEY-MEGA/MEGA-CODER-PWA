import { getRule, type ApprovalMode, type PermissionScope } from "../../security-policy/src/index";

export type AgentMode = "ask" | "edit" | "agent";

export interface AgentTool {
  id:
    | "read-file"
    | "search"
    | "edit-file"
    | "delete-file"
    | "git-status"
    | "git-commit"
    | "run-shell"
    | "run-tests"
    | "network-request";
  scope: PermissionScope;
  description: string;
}

export interface ApprovalDecision {
  toolId: AgentTool["id"];
  mode: AgentMode;
  approval: ApprovalMode;
}

export const defaultTools: AgentTool[] = [
  { id: "read-file", scope: "read", description: "Inspect a file" },
  { id: "search", scope: "read", description: "Search across the workspace" },
  { id: "edit-file", scope: "edit", description: "Apply an edit to a file" },
  { id: "delete-file", scope: "delete", description: "Delete a file" },
  { id: "git-status", scope: "git", description: "Read repository status" },
  { id: "git-commit", scope: "git", description: "Create a commit" },
  { id: "run-shell", scope: "shell", description: "Run a shell command" },
  { id: "run-tests", scope: "shell", description: "Run a test command" },
  {
    id: "network-request",
    scope: "network",
    description: "Call a remote API or model provider",
  },
];

export function getApprovalDecision(tool: AgentTool, mode: AgentMode): ApprovalDecision {
  const rule = getRule(tool.scope);

  return {
    toolId: tool.id,
    mode,
    approval: rule[mode],
  };
}

export function canAutoRun(tool: AgentTool, mode: AgentMode): boolean {
  return getApprovalDecision(tool, mode).approval === "auto";
}
