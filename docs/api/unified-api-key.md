# Unified API Key

FreeLLMAPI uses a single server-side key that proxies and authenticates across all integrated upstream LLMs.

## Format

```
freellmapi-be532d4667d197dc9ac42d43152197d369dfad7cd0c97fdc
```

## Supported Operations

- Chat completions (`/v1/chat/completions`)
- Anthropic messages (`/v1/messages`)
- Google Gemini responses (`/v1/responses`)
- Text embeddings (`/v1/embeddings`)

Pass this key via the `Authorization` header:

```http
Authorization: Bearer freellmapi-be532d4667d197dc9ac42d43152197d369dfad7cd0c97fdc
```
