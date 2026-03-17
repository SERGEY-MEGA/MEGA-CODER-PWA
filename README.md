# MEGA CODER

**Local-first AI editor and sovereign agent IDE for `Web/PWA` and `Desktop`.**

![MEGA CODER Banner](https://mega-coder.vercel.app/apple-touch-icon.png)

MEGA CODER evolves as a hybrid product:

- `Web/PWA` is the safe, portable, local-first editor.
- `Desktop` is the full Cursor-like environment with native tools, approvals, and deeper project access.

The repository now contains the architectural scaffold for that direction: platform matrix, security model, workspace contracts, AI runtime, and agent runtime packages.

---

## ⚡️ Быстрый старт

Откройте IDE в один клик и установите её на свое устройство:

[![Open in MEGA CODER](https://img.shields.io/badge/Открыть-MEGA--CODER-blue?style=for-the-badge&logo=vercel)](https://mega-coder.vercel.app)

Локальный web MVP в этом репозитории можно запустить так:

```bash
npm install
npm run dev:web
```

После запуска откройте `http://localhost:4173`.

---

## Current Direction

* **Hybrid Product**: One product with two capability profiles, `Web/PWA` and `Desktop`.
* **Offline First**: Workspace architecture is built around local-first persistence and snapshots.
* **AI Runtime**: Shared contracts for local and cloud model routing.
* **Agent Permissions**: Approval-first design for edits, shell, git, network, and secrets.
* **Cross-Platform Core**: Shared `workspace-core`, `editor-shell`, `security-policy`, `ai-runtime`, and `agent-runtime`.

## Working Web MVP

The repository now includes a runnable `apps/web` client with:

* **React + TypeScript editor workspace**
* **Live preview** powered by `Sandpack`
* **Free online coding models** through `Puter.js`
* **Local coding models** through `Ollama` on `localhost:11434`

### Built-in AI Modes

* `Free Online: DeepSeek R1` via Puter.js, no personal API key required
* `Free Online: Qwen3 Coder` via Puter.js, no personal API key required
* `Local: Ollama Qwen2.5 Coder 7B`
* `Local: Ollama DeepSeek R1 7B`

### Notes

* `Free online` models depend on internet access and third-party availability.
* `Local` models require a running Ollama daemon and a pulled model.
* The desktop binary published in the separate release repository is still a different artifact from this source tree.

---

## Platform Promise

### Web/PWA

Portable editor with local-first storage, search, diff, AI chat, inline edits, and explicitly approved cloud actions.

### Desktop

Full IDE profile with real project folders, git, terminal, background indexing, and approval-driven agent workflows.

## Repository Structure

```text
apps/
  web/
  desktop/
packages/
  workspace-core/
  editor-shell/
  security-policy/
  model-adapters/
  ai-runtime/
  agent-runtime/
  sync/
docs/
  product-matrix.md
  security-model.md
  agent-permissions.md
  workspace-architecture.md
  model-routing.md
```

## 📱 Как использовать на смартфоне

1. Перейдите по ссылке [mega-coder.vercel.app](https://mega-coder.vercel.app).
2. Нажмите **«Поделиться»** (iOS) или **«Три точки»** (Android).
3. Выберите **«Добавить на главный экран»**.
4. Запускайте MEGA CODER как обычное приложение из меню телефона!

---

## 📄 Лицензия и Авторские права

Copyright © 2026 **SERGEY MEGA**. Все права защищены.

Проект распространяется по лицензии **MIT**. Подробности в файле [LICENSE](./LICENSE).

---

## 📢 Документация

Ключевые документы проекта:

* [DOCUMENTATION.md](./DOCUMENTATION.md)
* [docs/product-matrix.md](./docs/product-matrix.md)
* [docs/security-model.md](./docs/security-model.md)
* [docs/agent-permissions.md](./docs/agent-permissions.md)
* [docs/workspace-architecture.md](./docs/workspace-architecture.md)
* [docs/model-routing.md](./docs/model-routing.md)

---

<p align="center">
  Built for a local-first sovereign future.
</p>
