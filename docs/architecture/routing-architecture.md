# Routing Architecture

FreeLLMAPI uses adaptive routing based on:

- **Speed** (latency)
- **Reliability** (error rate)
- **Intelligence** (model quality)

## Routing Modes

### `fastest`

Selects lowest-latency model.

### `balanced`

Mix of speed, reliability, intelligence.

### `smartest`

Prioritizes reasoning models.

### `reliable`

Prioritizes uptime.

### `adaptive`

Uses live metrics to choose best model dynamically.

## Fallback Logic

If a model fails (429, 500, 503):

1. `gemini-3.5-flash`
2. `claude-3-opus`
3. `gpt-4-turbo`

Fallback is automatic and transparent to Antigravity.
