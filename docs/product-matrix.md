# Product Matrix

MEGA CODER should ship as one product with two clearly separated execution profiles:

- `Web/PWA` is the safe, local-first, portable editor.
- `Desktop` is the full Cursor-like environment with stronger tooling and controlled native access.

## Design Rules

- Do not promise a capability in `Web/PWA` unless the browser can enforce it.
- Keep the core user experience consistent across both platforms.
- Put native power behind explicit approvals, not hidden automation.
- Default to local models and local storage when the user has not opted into cloud features.

## Capability Matrix

| Capability | Web/PWA | Desktop |
| --- | --- | --- |
| Installable app shell | Yes | Yes |
| Offline editor shell | Yes | Yes |
| IndexedDB workspace | Yes | Optional |
| Real folder access | Limited via File System Access API | Full |
| Project tree and tabs | Yes | Yes |
| Split panes and diff view | Yes | Yes |
| Global search | Yes | Yes |
| Semantic code index | Partial and bounded | Full background indexing |
| Local LLM via WebLLM | Yes | Optional |
| Local LLM via Ollama | Limited to allowed localhost bridge | Yes |
| Cloud LLM access | Yes with policy and audit | Yes with policy and audit |
| True shell/process execution | No | Yes |
| Git operations | Read-only or simulated only | Full with approvals |
| File watchers | Limited | Yes |
| Test runner/tasks | No | Yes |
| Multi-step agent actions | Limited, no native tools | Yes |
| Secret vault | Session/passphrase only | OS keychain |
| Team policy presets | Limited | Yes |
| Export/import workspace | Yes | Yes |
| Optional sync | Yes | Yes |

## Recommended UX Contract

### Web/PWA

- Position it as a `local-first AI editor`.
- Offer chat, inline edits, search, diff, preview, local snapshots, and approved cloud AI.
- Explicitly label every network-dependent action.

### Desktop

- Position it as a `sovereign agent IDE`.
- Offer repository-aware AI, shell, git, test execution, project indexing, and approval-driven automation.
- Keep all sensitive operations behind permissions and audit logging.
