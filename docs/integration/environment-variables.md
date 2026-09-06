# Environment Variables

## Required Variables

- `AI_PROVIDER`: `freellmapi` (instructs AI clients to route via unified gateway)
- `AI_BASE_URL`: `http://127.0.0.1:31415/v1` (local router URL)
- `AI_KEY`: `freellmapi-fla_234WVYZ0HJ9NN59GZAE4XKNWZXR0DP2Z` (unified server-side key)
- `AI_ROUTING`: `adaptive` (fastest/adaptive model selection)

## Optional Variables

- `LOG_LEVEL`: `info` | `debug` | `warn`
- `ROUTING_STRATEGY`: `fastest` | `balanced` | `smartest` | `reliable`
- `FALLBACK_CHAIN`: Comma-separated list of candidate models
