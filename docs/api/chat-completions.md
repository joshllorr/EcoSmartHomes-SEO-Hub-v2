# Chat Completions

OpenAI-style chat completions endpoint for interactive or autonomous text generation.

## Request

- **Endpoint**: `POST /v1/chat/completions`
- **Headers**:
  - `Authorization: Bearer <AI_KEY>`
  - `Content-Type: application/json`

## Payload Example

```json
{
  "model": "auto",
  "messages": [
    {
      "role": "system",
      "content": "You are an Irish Building Energy Rating consultant."
    },
    {
      "role": "user",
      "content": "Explain SEAI Heat Pump grant rules for 2026."
    }
  ],
  "temperature": 0.3,
  "stream": false
}
```

## Response Example

```json
{
  "id": "chatcmpl-123456",
  "object": "chat.completion",
  "created": 1772912400,
  "model": "gemini-3.5-flash",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Under the 2026 SEAI Domestic Technical Standards, the maximum heat pump package grant is €12,500..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 42,
    "completion_tokens": 128,
    "total_tokens": 170
  }
}
```
