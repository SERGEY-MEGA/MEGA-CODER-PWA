# Agent Permissions

MEGA CODER should expose three user-facing AI modes:

- `Ask`: explain and inspect without side effects
- `Edit`: propose or apply file changes
- `Agent`: run multi-step workflows with approvals

## Tool Classes

| Tool Class | Ask | Edit | Agent |
| --- | --- | --- | --- |
| Read file | Auto | Auto | Auto |
| Search text/symbols | Auto | Auto | Auto |
| Edit file | No | Approve | Approve |
| Create file | No | Approve | Approve |
| Delete file | No | Approve | Approve |
| Inspect git diff/status | No | Approve | Approve |
| Stage/commit | No | No | Approve |
| Run tests | No | Optional | Approve |
| Shell command | No | No | Approve |
| External network request | No | Optional | Approve |
| Secret access | No | No | Approve |

## Approval Rules

- Approvals should be tied to a concrete action, not a vague agent intention.
- A single approval can cover a bounded batch, such as `edit 3 files in this workspace`.
- Long-running agents must pause before privilege escalation.
- Destructive actions should show a diff or command preview whenever possible.

## Safe Defaults

- Start new chats in `Ask`.
- Escalate to `Edit` only when the user wants a patch.
- Escalate to `Agent` only when the task requires multiple steps or native tools.

## Visibility Requirements

- Show current AI mode near the composer.
- Show pending approvals in a dedicated panel.
- Show whether the current action is `local`, `desktop-native`, or `cloud`.
