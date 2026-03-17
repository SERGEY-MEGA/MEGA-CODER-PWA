import {
  SandpackCodeEditor,
  SandpackPreview,
  SandpackProvider,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { decideModelRoute } from "../../../packages/ai-runtime/src/index";

/* ─────────────────────────── Types ─────────────────────────── */
type ChatRole = "system" | "user" | "assistant";
interface ChatMessage {
  role: ChatRole;
  content: string;
}

interface Provider {
  id: string;
  label: string;
  modelId: string;
  kind: "puter" | "ollama" | "gemini";
  isLocal: boolean;
  description: string;
}

interface ApiKeys {
  gemini: string;
  deepseek: string;
  yandexApiKey: string;
  yandexFolderId: string;
}

declare global {
  interface Window {
    puter?: {
      ai: { chat: (msgs: ChatMessage[], opts?: { model?: string; stream?: boolean; temperature?: number }) => Promise<unknown> };
    };
  }
}

/* ─────────────────────────── Providers ─────────────────────── */
const PROVIDERS: Provider[] = [
  {
    id: "ollama-qwen",
    label: "🦙 Ollama · Qwen2.5 Coder 7B",
    modelId: "ollama:qwen2.5-coder:7b",
    kind: "ollama",
    isLocal: true,
    description:
      "Полностью локально через Ollama на localhost:11434. Код не покидает устройство.",
  },
  {
    id: "ollama-qwen-small",
    label: "🦙 Ollama · Qwen2.5 Coder 1.5B",
    modelId: "ollama:qwen2.5-coder:1.5b",
    kind: "ollama",
    isLocal: true,
    description:
      "Облегчённая локальная модель через Ollama — быстрее на слабых машинах.",
  },
  {
    id: "ollama-llama3",
    label: "🦙 Ollama · Llama 3.1 8B",
    modelId: "ollama:llama3.1:8b",
    kind: "ollama",
    isLocal: true,
    description:
      "Llama 3.1 8B через Ollama. Подходит и для кода, и для общего ИИ.",
  },
  {
    id: "ollama-ds",
    label: "🦙 Ollama · DeepSeek R1 7B",
    modelId: "ollama:deepseek-r1:7b",
    kind: "ollama",
    isLocal: true,
    description:
      "Полностью локально через Ollama на localhost:11434. Код не покидает устройство.",
  },
  {
    id: "puter-ds",
    label: "🌐 Online · DeepSeek R1 (Puter)",
    modelId: "puter:deepseek/deepseek-r1",
    kind: "puter",
    isLocal: false,
    description:
      "Бесплатный онлайн-доступ через Puter.js. Требует бесплатный аккаунт Puter.",
  },
  {
    id: "puter-qwen",
    label: "🌐 Online · Qwen3 Coder (Puter)",
    modelId: "puter:qwen/qwen3-coder-next",
    kind: "puter",
    isLocal: false,
    description:
      "Бесплатный онлайн-доступ через Puter.js. Требует бесплатный аккаунт Puter.",
  },
  {
    id: "gemini-flash",
    label: "☁️ Gemini 2.0 Flash",
    modelId: "gemini-2.0-flash",
    kind: "gemini",
    isLocal: false,
    description:
      "Облачная модель от Google. Требуется личный API-ключ Gemini, хранится локально в браузере.",
  },
];

/* ─────────────────────────── Default files ─────────────────── */
const DEFAULT_FILES: Record<string, { code: string }> = {
  "/App.tsx": { code: `import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>🚀 Привет, MEGA CODER!</h1>
      <p>Счётчик: {count}</p>
      <button
        onClick={() => setCount(c => c + 1)}
        style={{
          padding: '8px 16px',
          background: '#6366f1',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Нажми меня
      </button>
    </div>
  );
}

export default App;
` },
  "/utils.ts": { code: `// Утилиты проекта
export function formatCount(n: number): string {
  return n.toString().padStart(3, '0');
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
` },
  "/styles.css": { code: `* { box-sizing: border-box; }
body { margin: 0; font-family: Inter, system-ui, sans-serif; }
button:hover { opacity: 0.85; }
` },
};

const TERM_INIT = [
  "MEGA CODER Terminal v1.0",
  "Введите 'help' для списка команд.",
  "",
  "~/project run App.tsx",
  "🔄 Замечен React-компонент. Запускаю...",
  "Предпросмотр React компонента открыт ниже.",
  "",
];

/* ─────────────────────────── AI helpers ─────────────────────── */
function normalizePuter(r: unknown): string {
  if (typeof r === "string") return r;
  const msg = (r as { message?: { content?: unknown } })?.message?.content;
  if (typeof msg === "string") return msg;
  if (Array.isArray(msg)) return msg.map((p) => (typeof p === "string" ? p : (p as { text?: string }).text ?? "")).join("");
  return "Модель вернула неожиданный формат ответа.";
}

async function loadPuter(): Promise<void> {
  if (window.puter?.ai?.chat) return;
  await new Promise<void>((resolve, reject) => {
    if (document.querySelector('script[data-puter]')) {
      const poll = setInterval(() => { if (window.puter?.ai?.chat) { clearInterval(poll); resolve(); } }, 200);
      setTimeout(() => { clearInterval(poll); reject(new Error("Puter SDK timeout")); }, 10000);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://js.puter.com/v2/";
    s.async = true; s.dataset.puter = "1";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Не удалось загрузить Puter SDK."));
    document.head.appendChild(s);
  });
}

async function callAI(p: Provider, msgs: ChatMessage[]): Promise<string> {
  if (p.kind === "puter") {
    await loadPuter();
    if (!window.puter?.ai?.chat) throw new Error("puter.ai.chat недоступен. Разрешите всплывающие окна и войдите в Puter.");
    const r = await window.puter.ai.chat(msgs, { model: p.modelId.replace("puter:", ""), stream: false, temperature: 0.2 });
    return normalizePuter(r);
  }
  const model = p.modelId.replace("ollama:", "");
  const r = await fetch("http://127.0.0.1:11434/api/chat", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, stream: false, messages: msgs }),
  });
  if (!r.ok) throw new Error("Ollama не отвечает. Убедитесь, что Ollama запущен и модель загружена командой: ollama pull " + model);
  const d = (await r.json()) as { message?: { content?: string } };
  return d.message?.content ?? "Ollama вернул пустой ответ.";
}

function extractCode(text: string): string | null {
  const m = text.match(/```[a-zA-Z0-9_-]*\n([\s\S]*?)```/);
  return m?.[1]?.trim() ?? null;
}

function stripFencedCodeBlocks(text: string): string {
  return text.replace(/```[\s\S]*?```/g, "").replace(/\n{3,}/g, "\n\n").trim();
}

function extractStreamingCode(text: string): string | null {
  const codeBlockStart = text.indexOf("```");
  if (codeBlockStart < 0) return null;

  const afterMarker = text.slice(codeBlockStart + 3);
  const newlineIdx = afterMarker.indexOf("\n");
  if (newlineIdx < 0) return null;

  const contentStart = codeBlockStart + 3 + newlineIdx + 1;
  const contentText = text.slice(contentStart);

  const closeMarkerIdx = contentText.indexOf("```");
  if (closeMarkerIdx >= 0) {
    return contentText.slice(0, closeMarkerIdx).trimEnd();
  }

  return contentText;
}

function isAsyncIterableValue(value: unknown): value is AsyncIterable<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    Symbol.asyncIterator in (value as Record<string | symbol, unknown>)
  );
}

function extractChunkText(chunk: unknown): string {
  if (typeof chunk === "string") return chunk;
  const c = chunk as {
    text?: unknown;
    delta?: unknown;
    message?: { content?: unknown };
    choices?: { delta?: { content?: string }; message?: { content?: string } }[];
    content?: unknown;
  };
  if (typeof c.text === "string") return c.text;
  if (typeof c.delta === "string") return c.delta;
  if (typeof c.message?.content === "string") return c.message.content;
  if (typeof c.content === "string") return c.content;
  const choice = c.choices?.[0];
  if (typeof choice?.delta?.content === "string") return choice.delta.content;
  if (typeof choice?.message?.content === "string") return choice.message.content;
  return "";
}

function fileExt(path: string) { return path.split(".").pop() ?? ""; }
function fileIcon(ext: string) {
  return ({ tsx: "⚛", ts: "TS", css: "🎨", html: "🌐", json: "{}", md: "📝" } as Record<string, string>)[ext] ?? "📄";
}

/* ─────────────────────────── Main workspace ─────────────────── */
function IdeWorkspace() {
  const { sandpack } = useSandpack();

  // Layout
  const [previewOpen, setPreviewOpen] = useState(true);
  const [sidebarMode, setSidebarMode] = useState<"project" | "guide" | "settings">("project");
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");

  // Terminal
  const [termLines, setTermLines] = useState<string[]>(TERM_INIT);
  const [termInput, setTermInput] = useState("");
  const termRef = useRef<HTMLDivElement>(null);

  // AI
  const [providerId, setProviderId] = useState(PROVIDERS[0].id);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [cloudEnabled, setCloudEnabled] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: "assistant",
    content: "Готов к работе. Опишите задачу — помогу с анализом, рефакторингом или написанием кода для активного файла.",
  }]);
  const [chatInput, setChatInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const [isApplyingCode, setIsApplyingCode] = useState(false);
  const [lastGeneratedCode, setLastGeneratedCode] = useState<string | null>(null);

  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    gemini: "",
    deepseek: "",
    yandexApiKey: "",
    yandexFolderId: "",
  });
  const [customOllamaModel, setCustomOllamaModel] = useState("");

  const effectiveProviders: Provider[] = [
    ...PROVIDERS,
    ...(customOllamaModel.trim()
      ? [
          {
            id: "ollama-custom",
            label: `🦙 Ollama · ${customOllamaModel.trim()}`,
            modelId: `ollama:${customOllamaModel.trim()}`,
            kind: "ollama" as const,
            isLocal: true,
            description:
              "Пользовательская модель Ollama. Имя должно совпадать с именем модели в команде `ollama run`.",
          },
        ]
      : []),
  ];

  const provider =
    effectiveProviders.find((p) => p.id === providerId) ?? effectiveProviders[0];
  const isSecure = provider.isLocal;

  const route = useMemo(() => decideModelRoute({
    platform: "web",
    policyPreset: provider.isLocal ? "StrictLocal" : "Balanced",
    taskType: "edit",
    modelId: provider.modelId,
    includesSensitiveFiles: false,
  }), [provider]);

  // Тема: применяем к documentElement через data-theme
  useEffect(() => {
    const root = document.documentElement;
    const systemPrefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolved =
      theme === "system" ? (systemPrefersDark ? "dark" : "light") : theme;
    root.dataset.theme = resolved;
  }, [theme]);

  // Загрузка ключей из localStorage
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("mega-coder:api-keys");
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ApiKeys>;
        setApiKeys((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // игнорируем
    }
  }, []);

  function updateApiKey<K extends keyof ApiKeys>(key: K, value: string) {
    setApiKeys((prev) => {
      const next = { ...prev, [key]: value };
      try {
        window.localStorage.setItem("mega-coder:api-keys", JSON.stringify(next));
      } catch {
        // игнорируем
      }
      return next;
    });
  }

  useEffect(() => { termRef.current?.scrollIntoView({ behavior: "smooth" }); }, [termLines]);
  useEffect(() => { chatRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, thinking]);

  const fileList = Object.keys(sandpack.files)
    .filter((p) => !p.startsWith("/.") && p !== "/package.json" && p !== "/tsconfig.json")
    .sort();

  /* Provider change → cloud warning */
  function changeProvider(id: string) {
    const next = effectiveProviders.find((p) => p.id === id);
    if (!next) return;
    if (!next.isLocal && !cloudEnabled) { setPendingId(id); setShowWarning(true); }
    else setProviderId(id);
  }

  function confirmCloud() {
    setCloudEnabled(true);
    if (pendingId) setProviderId(pendingId);
    setShowWarning(false); setPendingId(null);
  }

  /* Terminal */
  function termCmd(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter") return;
    const cmd = termInput.trim();
    const out: string[] = [`~/project ${cmd}`];
    if (cmd === "help")        out.push("Команды: help, clear, ls, run <file>, preview on/off");
    else if (cmd === "clear")  { setTermLines([]); setTermInput(""); return; }
    else if (cmd === "ls")     out.push(fileList.map((f) => f.replace("/", "")).join("  "));
    else if (cmd === "preview on")  { setPreviewOpen(true); out.push("Предпросмотр включён."); }
    else if (cmd === "preview off") { setPreviewOpen(false); out.push("Предпросмотр скрыт."); }
    else if (cmd.startsWith("run ")) { sandpack.runSandpack(); out.push(`🔄 Запускаю ${cmd.slice(4)}...`, "Предпросмотр обновлён."); }
    else if (cmd) out.push(`Команда не найдена: ${cmd}`);
    setTermLines((p) => [...p, ...out, ""]);
    setTermInput("");
  }

  /* Download */
  function downloadFile() {
    const code = sandpack.files[sandpack.activeFile]?.code ?? "";
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([code], { type: "text/plain" }));
    a.download = sandpack.activeFile.replace("/", "") || "file.txt";
    a.click();
  }

  /* AI send */
  async function callAIForCurrentProvider(msgs: ChatMessage[]): Promise<string> {
    if (provider.kind === "puter") {
      await loadPuter();
      if (!window.puter?.ai?.chat) {
        throw new Error(
          "puter.ai.chat недоступен. Разрешите всплывающие окна и войдите в аккаунт Puter."
        );
      }
      const r = await window.puter.ai.chat(msgs, {
        model: provider.modelId.replace("puter:", ""),
        stream: false,
        temperature: 0.2,
      });
      return normalizePuter(r);
    }

    if (provider.kind === "ollama") {
      const model = provider.modelId.replace("ollama:", "");
      const r = await fetch("http://127.0.0.1:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, stream: false, messages: msgs }),
      });
      if (!r.ok) {
        throw new Error(
          "Ollama не отвечает. Убедитесь, что Ollama запущен и модель загружена командой: ollama pull " +
            model
        );
      }
      const d = (await r.json()) as { message?: { content?: string } };
      return d.message?.content ?? "Ollama вернул пустой ответ.";
    }

    // Gemini (облачный, по ключу)
    if (!apiKeys.gemini) {
      throw new Error(
        "Укажите API-ключ Gemini в настройках (раздел «API Ключи»), чтобы использовать эту модель."
      );
    }
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${provider.modelId}:generateContent?key=${encodeURIComponent(
      apiKeys.gemini
    )}`;
    const contents = msgs.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
    const resp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
    });
    if (!resp.ok) {
      throw new Error(
        `Gemini вернул ошибку ${resp.status}. Проверьте ключ и ограничения CORS.`
      );
    }
    const data = (await resp.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text =
      data.candidates?.[0]?.content?.parts
        ?.map((p) => p.text ?? "")
        .join("") ?? "";
    return text || "Gemini вернул пустой ответ.";
  }

  async function sendAI() {
    if (!chatInput.trim() || thinking) return;
    const userMsg: ChatMessage = { role: "user", content: chatInput.trim() };
    const sys: ChatMessage = {
      role: "system",
      content: [
        "Ты MEGA CODER — AI coding engine в стиле Cursor/Antigravity.",
        `Активный файл: ${sandpack.activeFile}.`,
        "Верни ответ строго в формате:",
        "COMMENTARY:",
        "кратко опиши, что и почему изменено (без длинных блоков кода).",
        "CODE:",
        "```tsx",
        "полный новый код активного файла",
        "```",
        "Никакого лишнего текста после CODE блока.",
        "Текущий код активного файла:",
        sandpack.files[sandpack.activeFile]?.code ?? "",
      ].join("\n\n"),
    };
    const history = [...messages, userMsg];
    setMessages(history);
    setChatInput("");
    setThinking(true);
    try {
      const filePath = sandpack.activeFile;
      const originalCode = sandpack.files[filePath]?.code ?? "";
      let fullReply = "";

      if (provider.kind === "ollama") {
        const model = provider.modelId.replace("ollama:", "");
        const r = await fetch("http://127.0.0.1:11434/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model, stream: true, messages: [sys, ...history] }),
        });
        if (!r.ok || !r.body) {
          throw new Error(
            "Ollama не отвечает. Убедитесь, что Ollama запущен и модель загружена командой: ollama pull " +
              model
          );
        }

        setIsApplyingCode(true);
        const reader = r.body.getReader();
        const decoder = new TextDecoder();
        let pending = "";
        let hasStartedCode = false;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          pending += decoder.decode(value, { stream: true });
          const lines = pending.split("\n");
          pending = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const part = JSON.parse(line) as { message?: { content?: string } };
              const chunk = part.message?.content ?? "";
              if (chunk) {
                fullReply += chunk;
                const code = extractStreamingCode(fullReply);
                if (code !== null && code !== undefined) {
                  if (!hasStartedCode) {
                    hasStartedCode = true;
                  }
                  sandpack.updateFile(filePath, code);
                }
              }
            } catch {
              // ignore malformed stream frames
            }
          }
        }
      } else if (provider.kind === "puter") {
        setIsApplyingCode(true);
        await loadPuter();
        if (!window.puter?.ai?.chat) {
          throw new Error(
            "puter.ai.chat недоступен. Разрешите всплывающие окна и войдите в аккаунт Puter."
          );
        }
        const streamResult = await window.puter.ai.chat([sys, ...history], {
          model: provider.modelId.replace("puter:", ""),
          stream: true,
          temperature: 0.2,
        });
        if (isAsyncIterableValue(streamResult)) {
          let hasStartedCode = false;
          for await (const chunk of streamResult) {
            const piece = extractChunkText(chunk);
            if (!piece) continue;
            fullReply += piece;
            const code = extractStreamingCode(fullReply);
            if (code !== null && code !== undefined) {
              if (!hasStartedCode) {
                hasStartedCode = true;
              }
              sandpack.updateFile(filePath, code);
            }
          }
        } else {
          fullReply = normalizePuter(streamResult);
          const code = extractStreamingCode(fullReply);
          if (code) sandpack.updateFile(filePath, code);
        }
      } else {
        setIsApplyingCode(true);
        fullReply = await callAIForCurrentProvider([sys, ...history]);
      }

      const reply = fullReply;
      const code = extractCode(reply);
      const commentary = stripFencedCodeBlocks(reply);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            commentary ||
            "Готово. Код уже печатается в редактор.",
        },
      ]);

      if (code) {
        setLastGeneratedCode(code);
        sandpack.updateFile(filePath, code);
      } else if (!fullReply.includes("```")) {
        sandpack.updateFile(filePath, originalCode);
      }

      setIsApplyingCode(false);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Ошибка: ${
            err instanceof Error ? err.message : "Неизвестная ошибка"
          }`,
        },
      ]);
      setIsApplyingCode(false);
    } finally {
      setThinking(false);
    }
  }

  function applyCode() {
    if (lastGeneratedCode) sandpack.updateFile(sandpack.activeFile, lastGeneratedCode);
  }

  /* ─── Render ─── */
  return (
    <div className="ide">

      {/* ═══ TOPBAR ═══ */}
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon">⌨️</span>
          <span className="brand-name">MEGA CODER</span>
          <span className="brand-sep">|</span>
        </div>

        <div className="tab-bar">
          {fileList.slice(0, 6).map((path) => (
            <button key={path} type="button"
              className={`tab ${path === sandpack.activeFile ? "tab-active" : ""}`}
              onClick={() => sandpack.openFile(path)}>
              {path.replace("/", "")}
            </button>
          ))}
        </div>

        <div className="topbar-actions">
          <button type="button" className="btn-run"
            onClick={() => { setPreviewOpen(true); sandpack.runSandpack(); }}>
            ▶ Запустить
          </button>
          <button type="button" className="btn-dl" onClick={downloadFile}>
            💾 Скачать
          </button>
        </div>

        <div className="flex-1" />

        <div className={`secure-badge ${isSecure ? "secure" : "cloud"}`}>
          <span className="dot" />
          {isSecure ? "SECURE MODE" : "CLOUD SYNC"}
        </div>
      </header>

      {/* ═══ BODY ═══ */}
      <div className="body">

        {/* Activity bar */}
        <nav className="act-bar">
          <button
            className={`act-btn ${sidebarMode === "project" ? "act-active" : ""}`}
            type="button"
            title="Проводник"
            onClick={() => setSidebarMode("project")}
          >
            📁
          </button>
          <button
            className={`act-btn ${sidebarMode === "guide" ? "act-active" : ""}`}
            type="button"
            title="Инструкция"
            onClick={() => setSidebarMode("guide")}
          >
            📖
          </button>
          <button className="act-btn" type="button" title="ИИ">
            🤖
          </button>
          <button className="act-btn" type="button" title="Git">
            ⑃
          </button>
          <div className="flex-1" />
          <button
            className={`act-btn ${sidebarMode === "settings" ? "act-active" : ""}`}
            type="button"
            title="Настройки"
            onClick={() => setSidebarMode("settings")}
          >
            ⚙️
          </button>
        </nav>

        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-title">
            <span>
              {sidebarMode === "project"
                ? "ПРОЕКТ"
                : sidebarMode === "guide"
                ? "ИНСТРУКЦИЯ"
                : "НАСТРОЙКИ"}
            </span>
            {sidebarMode === "project" && (
              <>
                <span className="sidebar-count">{fileList.length} файлов</span>
                <button type="button" className="btn-plus">
                  +
                </button>
              </>
            )}
          </div>

          {sidebarMode === "project" && (
            <div className="file-tree">
              <div className="tree-group">▾ src</div>
              {fileList.map((path) => {
                const name = path.replace("/", "");
                const ext = fileExt(name);
                return (
                  <button
                    key={path}
                    type="button"
                    className={`tree-item ${
                      path === sandpack.activeFile ? "tree-active" : ""
                    }`}
                    onClick={() => sandpack.openFile(path)}
                  >
                    <span className="fi">{fileIcon(ext)}</span>
                    {name}
                  </button>
                );
              })}
            </div>
          )}

          {sidebarMode === "guide" && (
            <div className="sidebar-section">
              <div className="guide-block">
                <h4>1. Локальный ИИ (Ollama)</h4>
                <ol>
                  <li>
                    Установите Ollama с сайта <code>ollama.com</code>.
                  </li>
                  <li>Откройте системный терминал и выполните, например:</li>
                </ol>
                <pre className="code-snippet">ollama run qwen2.5-coder:7b</pre>
                <p>
                  После загрузки модели выберите её в выпадающем списке
                  ассистента.
                </p>

                <h4>2. Облачный ИИ (Puter / Gemini)</h4>
                <ol>
                  <li>
                    Для Puter выберите модель с пометкой{" "}
                    <strong>Online · ... (Puter)</strong> и войдите в аккаунт
                    Puter в браузере.
                  </li>
                  <li>
                    Для Gemini получите API‑ключ в Google AI Studio и укажите его
                    в разделе <strong>API Ключи</strong>.
                  </li>
                </ol>

                <h4>3. Безопасность</h4>
                <p>
                  В <strong>SECURE MODE</strong> используйте только локальные
                  модели Ollama. Для включения облака выберите онлайн‑модель и
                  подтвердите диалог <strong>CLOUD SYNC</strong>.
                </p>
              </div>
            </div>
          )}

          {sidebarMode === "settings" && (
            <div className="sidebar-section settings">
              <div className="settings-block">
                <div className="field">
                  <div className="field-label">Тема интерфейса</div>
                  <div className="pill-group">
                    <button
                      type="button"
                      className={`pill ${theme === "dark" ? "pill-active" : ""}`}
                      onClick={() => setTheme("dark")}
                    >
                      Тёмная
                    </button>
                    <button
                      type="button"
                      className={`pill ${theme === "light" ? "pill-active" : ""}`}
                      onClick={() => setTheme("light")}
                    >
                      Светлая
                    </button>
                    <button
                      type="button"
                      className={`pill ${theme === "system" ? "pill-active" : ""}`}
                      onClick={() => setTheme("system")}
                    >
                      Авто
                    </button>
                  </div>
                </div>

                <div className="field">
                  <div className="field-label">Своя модель Ollama</div>
                  <input
                    className="field-input"
                    placeholder="Например: qwen2.5-coder:14b"
                    value={customOllamaModel}
                    onChange={(e) => setCustomOllamaModel(e.target.value)}
                  />
                  <div className="field-hint">
                    Модель должна быть загружена через{" "}
                    <code>ollama run ИМЯ</code>. После ввода она появится в
                    списке моделей.
                  </div>
                </div>

                <div className="field">
                  <div className="field-label">API Ключи</div>
                  <div className="field-subtitle">Gemini</div>
                  <input
                    className="field-input"
                    placeholder="Gemini API Key"
                    value={apiKeys.gemini}
                    onChange={(e) => updateApiKey("gemini", e.target.value)}
                  />
                  <div className="field-hint">
                    Ключ хранится только в вашем браузере (localStorage) и
                    отправляется напрямую в Google.
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Editor + preview + terminal */}
        <section className="editor-col">
          <div className="editor-panes">
            <div className="code-pane">
              <SandpackCodeEditor
                showTabs={false}
                showLineNumbers
                showInlineErrors
                style={{ height: "100%", minHeight: 0 }}
              />
            </div>
          </div>

          {/* Preview — внизу, над терминалом */}
          {previewOpen && (
            <div className="preview-pane">
              <div className="pane-hdr">
                <span>Предпросмотр</span>
                <span className="pane-badge">Автообновление</span>
                <button
                  type="button"
                  className="close-x"
                  onClick={() => setPreviewOpen(false)}
                >
                  ✕
                </button>
              </div>
              <div className="preview-body">
                <SandpackPreview
                  showOpenInCodeSandbox={false}
                  style={{ height: "100%" }}
                />
              </div>
            </div>
          )}

          {/* Terminal — самая нижняя панель */}
          <div className="terminal">
            <div className="pane-hdr term-hdr">
              <span>▸ ТЕРМИНАЛ</span>
              <button type="button" className="close-x" title="Очистить"
                onClick={() => setTermLines([])}>🗑</button>
            </div>
            <div className="term-out">
              {termLines.map((l, i) => <div key={i} className="tl">{l || "\u00a0"}</div>)}
              <div ref={termRef} />
            </div>
            <div className="term-row">
              <span className="term-ps">~/project</span>
              <input className="term-in" value={termInput}
                onChange={(e) => setTermInput(e.target.value)}
                onKeyDown={termCmd}
                placeholder="Введите команду..." />
            </div>
          </div>
        </section>

        {/* Assistant */}
        <aside className="assistant">
          <div className="pane-hdr">
            <span>🤖 Ассистент</span>
            <span className={`mode-badge ${provider.isLocal ? "local" : "cloud"}`}>
              {provider.isLocal ? "Локально" : "Online"}
            </span>
          </div>

          <div className="model-pick">
            <select value={providerId} onChange={(e) => changeProvider(e.target.value)}>
              {effectiveProviders.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            <p className="model-desc">{provider.description}</p>
            {route.route === "blocked" && <p className="route-err">⚠ {route.reason}</p>}
          </div>

          <div className="chat-log">
            {messages.map((m, i) => (
              <div key={i} className={`bubble ${m.role}`}>
                <div className="bubble-from">{m.role === "assistant" ? "MEGA AI" : "Вы"}</div>
                <pre className="bubble-txt">{m.content}</pre>
              </div>
            ))}
            {thinking && (
              <div className="bubble assistant thinking">
                <div className="bubble-from">MEGA AI</div>
                <pre className="bubble-txt">Думаю...</pre>
              </div>
            )}
            <div ref={chatRef} />
          </div>

          <div className="chat-actions">
            <button type="button" className="chat-btn" onClick={applyCode}>Применить код</button>
            <button type="button" className="chat-btn sec" onClick={() => sandpack.runSandpack()}>Обновить</button>
          </div>

          {isApplyingCode && (
            <div className="model-pick" style={{ borderTop: "1px solid #21262d" }}>
              <p className="model-desc">⚡ Антигравити: код печатается в редактор в реальном времени...</p>
            </div>
          )}

          <div className="composer">
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Опишите задачу для ИИ-разработчика..."
              rows={4}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) sendAI(); }}
            />
            <div className="composer-hint">Shift+Enter — новая строка · ⌘Enter — отправить</div>
            <button type="button" className={`send-btn ${thinking ? "busy" : ""}`}
              onClick={sendAI} disabled={thinking}>
              {thinking ? "Выполняется..." : "Отправить"}
            </button>
          </div>
        </aside>
      </div>

      {/* ═══ STATUS BAR ═══ */}
      <footer className={`statusbar ${isSecure ? "sb-secure" : "sb-cloud"}`}>
        <span className="sb-left">
          <span className="sb-dot" />
          MEGA CODER v1.3.2 &nbsp;•&nbsp; {isSecure ? "Суверенный режим" : "Подключено"}
        </span>
        <span className="sb-right">
          <span>UTF-8</span><span>TypeScript</span><span>GОСТ 34.12</span>
        </span>
      </footer>

      {/* ═══ CLOUD WARNING MODAL ═══ */}
      {showWarning && (
        <div className="overlay" onClick={() => setShowWarning(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-hdr">
              <span className="modal-ico">⚠️</span>
              <h3>Внимание</h3>
            </div>
            <p>Вы собираетесь включить <strong>CLOUD SYNC</strong> (Режим с доступом в Интернет).</p>
            <p>В этом режиме MEGA CODER сможет:</p>
            <ul>
              <li>Получать доступ к облачным ИИ (Gemini, DeepSeek и др.)</li>
              <li>Загружать стартовые веса (до 2ГБ) для локальных моделей вроде WebLLM</li>
            </ul>
            <div className="modal-warn-box">
              Для максимальной безопасности и работы с гос. тайной рекомендуется
              переключиться в суверенный режим (SECURE MODE) после загрузки необходимых моделей.
            </div>
            <div className="modal-btns">
              <button type="button" className="modal-cancel" onClick={() => setShowWarning(false)}>Отмена</button>
              <button type="button" className="modal-ok" onClick={confirmCloud}>Я понимаю риски, включить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────── Root ─────────────────────────── */
export default function App() {
  return (
    <SandpackProvider
      template="react-ts"
      files={DEFAULT_FILES}
      options={{
        activeFile: "/App.tsx",
        visibleFiles: Object.keys(DEFAULT_FILES),
        recompileMode: "immediate",
        recompileDelay: 300,
      }}
      customSetup={{ dependencies: { react: "^18.0.0", "react-dom": "^18.0.0" } }}
    >
      <IdeWorkspace />
    </SandpackProvider>
  );
}
