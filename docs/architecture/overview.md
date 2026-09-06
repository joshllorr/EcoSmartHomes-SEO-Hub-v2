# Architecture Overview

This system integrates Antigravity with the FreeLLMAPI unified router to provide a fast, reliable, adaptive AI backend.

## Components

### Antigravity

- Frontend + backend logic
- AI client
- Routing strategy
- Model selector

### FreeLLMAPI Router

- Unified API key
- Local endpoint: `http://127.0.0.1:31415/v1`
- Provider routing (Gemini, Claude, GPT)
- Adaptive fallback logic

### Provider APIs

- Gemini 3.5 Flash
- Claude 3 Opus
- GPT‑4 Turbo

## High-Level Flow

1. Antigravity sends a request → unified router.
2. Router selects fastest model using live metrics.
3. If throttled, router falls back to next model.
4. Response returned to Antigravity.

This architecture ensures high uptime, low latency, and predictable behavior.
