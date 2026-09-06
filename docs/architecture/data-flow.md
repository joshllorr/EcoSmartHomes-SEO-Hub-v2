# Data Flow

## Request Lifecycle

1. Antigravity → AI client (`src/utils/freeLlmApiClient.ts`)
2. AI client → FreeLLMAPI router (`http://127.0.0.1:31415/v1`)
3. Router → selected provider (Gemini / Claude / GPT)
4. Provider → router
5. Router → Antigravity
6. Antigravity → frontend / calling engine

## Error Handling

- **Retry logic**: 2 attempts per candidate
- **Backoff**: 500ms progressive delay
- **Fallback chain**: Seamless handover to secondary and tertiary providers
