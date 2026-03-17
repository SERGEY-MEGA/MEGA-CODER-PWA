export type ModelProviderClass =
  | "LocalBrowser"
  | "LocalHost"
  | "CloudManaged"
  | "EnterpriseGateway";

export interface ModelDescriptor {
  id: string;
  label: string;
  providerClass: ModelProviderClass;
  locality: "local" | "cloud";
  supportsStreaming: boolean;
  supportsTools: boolean;
}

export const defaultModelCatalog: ModelDescriptor[] = [
  {
    id: "webllm",
    label: "WebLLM",
    providerClass: "LocalBrowser",
    locality: "local",
    supportsStreaming: true,
    supportsTools: false,
  },
  {
    id: "ollama",
    label: "Ollama",
    providerClass: "LocalHost",
    locality: "local",
    supportsStreaming: true,
    supportsTools: true,
  },
  {
    id: "ollama:qwen2.5-coder:7b",
    label: "Ollama Qwen2.5 Coder 7B",
    providerClass: "LocalHost",
    locality: "local",
    supportsStreaming: true,
    supportsTools: true,
  },
  {
    id: "ollama:deepseek-r1:7b",
    label: "Ollama DeepSeek R1 7B",
    providerClass: "LocalHost",
    locality: "local",
    supportsStreaming: true,
    supportsTools: true,
  },
  {
    id: "gemini",
    label: "Gemini",
    providerClass: "CloudManaged",
    locality: "cloud",
    supportsStreaming: true,
    supportsTools: true,
  },
  {
    id: "deepseek",
    label: "DeepSeek",
    providerClass: "CloudManaged",
    locality: "cloud",
    supportsStreaming: true,
    supportsTools: false,
  },
  {
    id: "puter:deepseek/deepseek-r1",
    label: "Puter DeepSeek R1",
    providerClass: "CloudManaged",
    locality: "cloud",
    supportsStreaming: false,
    supportsTools: false,
  },
  {
    id: "puter:qwen/qwen3-coder-next",
    label: "Puter Qwen3 Coder Next",
    providerClass: "CloudManaged",
    locality: "cloud",
    supportsStreaming: false,
    supportsTools: false,
  },
  {
    id: "yandexgpt",
    label: "YandexGPT",
    providerClass: "CloudManaged",
    locality: "cloud",
    supportsStreaming: true,
    supportsTools: false,
  },
];

export function getModelDescriptor(modelId: string): ModelDescriptor | undefined {
  return defaultModelCatalog.find((model) => model.id === modelId);
}
