import { getModelDescriptor } from "../../model-adapters/src/index";
import { policyPresets, type PlatformKind } from "../../security-policy/src/index";

export type AiTaskType = "ask" | "edit" | "review" | "generate" | "agent";

export interface AiRequest {
  platform: PlatformKind;
  policyPreset: keyof typeof policyPresets;
  taskType: AiTaskType;
  modelId: string;
  includesSensitiveFiles: boolean;
  preferredLocalOnly?: boolean;
}

export interface ModelRouteDecision {
  modelId: string;
  route: "local" | "cloud" | "blocked";
  reason: string;
}

export function decideModelRoute(request: AiRequest): ModelRouteDecision {
  const preset = policyPresets[request.policyPreset];
  const model = getModelDescriptor(request.modelId);

  if (!model) {
    return {
      modelId: request.modelId,
      route: "blocked",
      reason: "Unknown model",
    };
  }

  if (request.includesSensitiveFiles && model.locality === "cloud") {
    return {
      modelId: request.modelId,
      route: "blocked",
      reason: "Sensitive context requires a local model",
    };
  }

  if (request.preferredLocalOnly && model.locality !== "local") {
    return {
      modelId: request.modelId,
      route: "blocked",
      reason: "The current request is constrained to local execution",
    };
  }

  if (model.locality === "cloud" && !preset.allowCloudModels) {
    return {
      modelId: request.modelId,
      route: "blocked",
      reason: "The active policy preset disables cloud models",
    };
  }

  return {
    modelId: request.modelId,
    route: model.locality,
    reason: model.locality === "local" ? "Local execution approved" : "Cloud execution approved",
  };
}

export function buildContextBudget(taskType: AiTaskType): number {
  switch (taskType) {
    case "ask":
      return 12_000;
    case "edit":
      return 24_000;
    case "review":
      return 40_000;
    case "generate":
      return 24_000;
    case "agent":
      return 48_000;
  }
}
