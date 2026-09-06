# Antigravity Setup

## Environment Variables

Add these to `.env` or project settings:

```env
AI_PROVIDER=freellmapi
AI_BASE_URL=http://127.0.0.1:31415/v1
AI_KEY=freellmapi-fla_234WVYZ0HJ9NN59GZAE4XKNWZXR0DP2Z
AI_ROUTING=adaptive
```

## YAML Config

Configured in `antigravity.yaml` and `config/ai.yaml`.
See: [yaml-config.md](yaml-config.md)

## Python Client

Available in `scripts/antigravity_ai.py`.
See: [python-client.md](python-client.md)

## TypeScript / Node Client

Available in `src/utils/freeLlmApiClient.ts`.
See: [node-client.md](node-client.md)
