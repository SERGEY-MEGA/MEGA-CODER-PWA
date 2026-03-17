# Security Model

This document defines the minimum security posture for MEGA CODER as a hybrid `Web/PWA + Desktop` product.

## Threat Model

Primary risks:

- accidental code exfiltration to cloud models or third-party services
- secret leakage from browser storage
- agent overreach through file edits, terminal commands, or network access
- unsafe preview or code execution in weak browser sandboxes
- unclear differences between local-only and cloud-assisted modes

## Security Principles

- `Local first`: if a workflow can complete locally, it should not require the network.
- `Least privilege`: tools receive only the permissions they need.
- `Explicit egress`: the user can see when code or prompts leave the device.
- `Auditable automation`: every privileged AI action must leave a trace.
- `Platform honesty`: browser and desktop capabilities are documented separately.

## Secret Storage

### Web/PWA

- Never store raw provider keys in plain `localStorage`.
- Support two safe modes:
  - `session-only`: keep decrypted secrets only in memory
  - `passphrase-protected`: store encrypted payloads and require user unlock
- Do not bundle private provider keys into public frontend assets.

### Desktop

- Store provider credentials in the OS keychain.
- Cache only non-sensitive metadata in app storage.
- Keep project-level policy files separate from actual secret material.

## Data Egress Control

Every AI or external execution request must be classified before sending:

- `local-only`: no network allowed
- `allowed-cloud`: approved provider can receive prompt and selected context
- `blocked`: request denied because selected files match protected patterns

Protected defaults:

- `.env`
- `*.pem`
- `*.key`
- `secrets/**`
- `private/**`
- files marked by workspace policy

## Approval Model

- `Read`: may auto-approve within the active workspace
- `Edit`: requires explicit approval by default
- `Shell`, `Git`, `Network`, `Secrets`: always require explicit approval
- Approval presets may relax rules, but the active preset must be visible in the UI

## Audit Log

The product should log:

- timestamp
- platform
- user-selected mode
- model/provider
- tool invoked
- files touched
- approval decision
- network destination for egress events

## Execution Boundaries

### Web/PWA

- Use workers or isolated iframes for previews and bounded execution.
- Do not simulate `secure mode` if the browser cannot enforce the restriction.
- Clearly tag any external code runner as `cloud execution`.

### Desktop

- Run commands through a native command service with permission checks.
- Restrict filesystem access to user-approved workspace roots.
- Bind agent tools to scoped capabilities instead of unrestricted native APIs.
