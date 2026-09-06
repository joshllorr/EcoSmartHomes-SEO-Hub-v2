# Rate Limits & Quotas

The FreeLLMAPI router manages rate limits and quotas automatically:

## Protections

- **Per-Key Limiting**: Prevents runaway loops or unintentional infinite recursions.
- **Provider Throttling Detection**: Automatically traps HTTP 429 errors from underlying models (e.g. Gemini, OpenAI, Anthropic).
- **Zero Downtime Fallback**: Instantly re-routes traffic to the secondary model in the fallback chain (`claude-3-opus` or `gpt-4-turbo`) when an upstream quota is reached.
- **Retry Backoff**: Configured for 500ms progressive delay before dispatching secondary candidates.
