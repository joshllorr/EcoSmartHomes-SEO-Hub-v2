# Unified API Key

FreeLLMAPI uses a single server-side key that proxies and authenticates across all integrated upstream LLMs.

## Format

```
freellmapi-fla_234WVYZ0HJ9NN59GZAE4XKNWZXR0DP2Z
```

## Supported Operations

- Chat completions (`/v1/chat/completions`)
- Anthropic messages (`/v1/messages`)
- Google Gemini responses (`/v1/responses`)
- Text embeddings (`/v1/embeddings`)

Pass this key via the `Authorization` header:

```http
Authorization: Bearer freellmapi-fla_234WVYZ0HJ9NN59GZAE4XKNWZXR0DP2Z
```
