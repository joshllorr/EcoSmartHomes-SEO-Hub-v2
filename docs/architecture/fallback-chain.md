# Fallback Chain

The fallback chain ensures uninterrupted AI responses across all workloads.

## Order

1. `gemini-3.5-flash`
2. `claude-3-opus`
3. `gpt-4-turbo`

## Trigger Conditions

- Provider throttling (HTTP 429)
- Network connectivity errors
- Request timeout (>20s)
- Internal server error (HTTP 500 / 503)

## Behavior

The router retries the next candidate in the fallback chain with exponential backoff and transparent state recovery.
