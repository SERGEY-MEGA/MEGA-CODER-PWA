# Model Routing

MEGA CODER needs explicit rules for deciding when to use local models and when cloud models are allowed.

## Routing Priorities

1. Prefer local models for sensitive or classified code.
2. Use cloud models only when the task requires more capability and policy allows egress.
3. Always fall back gracefully when a requested model is unavailable.

## Decision Inputs

- selected platform: `web` or `desktop`
- active policy preset: `StrictLocal`, `Balanced`, `CloudEnhanced`
- file classification
- user-selected provider preference
- task type: ask, edit, review, generate, agent
- context size and performance limits

## Default Routing Policy

| Task | Preferred Route | Fallback |
| --- | --- | --- |
| Explain code | Local model | Approved cloud |
| Small file edit | Local model | Approved cloud |
| Large refactor plan | Approved cloud | Local model with reduced context |
| Secret-bearing file | Local only | Block |
| Multi-file agent task | Desktop local or approved cloud | Ask user to narrow scope |

## Provider Classes

- `LocalBrowser`: WebLLM or other in-browser models
- `LocalHost`: Ollama or another local model server
- `CloudManaged`: Gemini, DeepSeek, OpenAI-compatible, YandexGPT
- `EnterpriseGateway`: on-prem routing layer controlled by the team

## UX Requirements

- Show the selected route before sending the request.
- Explain why a request was blocked or downgraded.
- Let users override defaults only when policy allows it.
