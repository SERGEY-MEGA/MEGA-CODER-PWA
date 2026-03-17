# Документация MEGA CODER

Добро пожаловать в официальную документацию MEGA CODER. Репозиторий описывает гибридный продукт из двух согласованных профилей:

- `Web/PWA` как безопасный local-first editor
- `Desktop` как полнофункциональная agent IDE

## Архитектура приложения

MEGA CODER развивается как монорепозиторий с общими пакетами для workspace, editor shell, AI runtime, agent runtime и security policy.

### Основные компоненты системы

1. **Workspace Core**: единая модель проекта, файлов, снимков, поиска и диагностик.
2. **Editor Shell**: панели, вкладки, split panes, diff и command palette.
3. **Security Policy**: permission matrix, policy presets, secret handling и audit requirements.
4. **AI Runtime**: маршрутизация локальных и облачных моделей, context budgets и runtime policies.
5. **Agent Runtime**: tool contracts и approval-first automation для Cursor-like workflow.

### Структура репозитория

- `apps/web` — безопасный PWA-профиль
- `apps/desktop` — desktop-профиль с нативными инструментами
- `packages/workspace-core` — shared workspace contracts
- `packages/editor-shell` — IDE shell state model
- `packages/security-policy` — platform capabilities и approval rules
- `packages/model-adapters` — каталог провайдеров моделей
- `packages/ai-runtime` — model routing logic
- `packages/agent-runtime` — инструменты и approvals агента
- `packages/sync` — export, backup и future sync contracts

### Реализованный web MVP

В `apps/web` теперь есть runnable клиент с тремя базовыми блоками:

1. редактор и дерево файлов
2. live preview для React/TypeScript через `Sandpack`
3. AI assistant panel с local и free-online моделями

## Платформенные профили

### Web/PWA

- local-first workspace
- безопасный редактор, search, diff, chat и inline edits
- runnable MVP в `apps/web`
- live preview через `Sandpack`
- нет настоящего shell
- нет полного git-доступа
- cloud actions должны быть явно обозначены и проходить policy checks

### Desktop

- real project folders
- terminal, git, watchers, indexing
- approval-driven agent actions
- OS keychain для секретов

## Безопасность и приватность

Мы придерживаемся концепции **Суверенной IDE**:

* **Local-first хранение**: рабочее пространство и снимки должны работать локально без обязательного облачного аккаунта.
* **Явный network egress**: любое обращение к облачной модели или внешнему сервису должно быть видимо пользователю и ограничено policy.
* **Разделение по платформам**: web и desktop не обещают одинаковые права, если платформа не может их безопасно обеспечить.
* **Секреты**: в web допускаются только session-only или passphrase-protected сценарии; в desktop секреты должны храниться в OS keychain.
* **Approvals и audit**: редактирование файлов, shell, git, network и secret access должны быть управляемыми и журналируемыми.

## Документы архитектуры

- [docs/product-matrix.md](./docs/product-matrix.md)
- [docs/security-model.md](./docs/security-model.md)
- [docs/agent-permissions.md](./docs/agent-permissions.md)
- [docs/workspace-architecture.md](./docs/workspace-architecture.md)
- [docs/model-routing.md](./docs/model-routing.md)

## Запуск web MVP

```bash
npm install
npm run dev:web
```

Откройте `http://localhost:4173`.

## Текущие AI-провайдеры в web MVP

- `Puter DeepSeek R1` — free online without personal API key
- `Puter Qwen3 Coder Next` — free online without personal API key
- `Ollama Qwen2.5 Coder 7B` — local on `localhost:11434`
- `Ollama DeepSeek R1 7B` — local on `localhost:11434`

Важно:

- free-online режим зависит от доступности внешнего сервиса
- локальный режим требует установленный и запущенный `Ollama`
- модельная маршрутизация проходит через `packages/model-adapters` и `packages/ai-runtime`

## Установка

### Требования для web-профиля

* Любой современный браузер (Chrome, Safari, Edge, Firefox).
* Поддержка Service Workers (стандарт для современных систем).

### Инструкция для установки PWA на ПК

1. Откройте [https://mega-coder.vercel.app](https://mega-coder.vercel.app).
2. Нажмите иконку установки в адресной строке.

### Инструкция для мобильных устройств

* **iOS**: Safari → Поделиться → На экран «Домой».
* **Android**: Chrome → Меню → Установить приложение.

---

## Авторство и контакты

Разработчик: **SERGEY MEGA**
Репозиторий проекта: [https://github.com/SERGEY-MEGA/MEGA-CODER-PWA](https://github.com/SERGEY-MEGA/MEGA-CODER-PWA)

Для вопросов и предложений: [GitHub Issues]
