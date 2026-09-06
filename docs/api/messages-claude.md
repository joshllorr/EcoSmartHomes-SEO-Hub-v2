# Messages (Claude)

Anthropic-style messages endpoint.

## Request

- **Endpoint**: `POST /v1/messages`
- **Headers**:
  - `Authorization: Bearer <AI_KEY>`
  - `Content-Type: application/json`

## Payload Example

```json
{
  "model": "claude-3-opus",
  "max_tokens": 1024,
  "system": "You are an energy efficiency auditor.",
  "messages": [
    {
      "role": "user",
      "content": "Evaluate Part L compliance for a 1988 semi-detached house."
    }
  ]
}
```
