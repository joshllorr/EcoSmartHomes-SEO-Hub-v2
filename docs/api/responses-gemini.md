# Responses (Gemini)

Google Gemini native format endpoint.

## Request

- **Endpoint**: `POST /v1/responses`
- **Headers**:
  - `Authorization: Bearer <AI_KEY>`
  - `Content-Type: application/json`

## Supported Fields

- `contents`: Array of prompt parts
- `model`: Target Gemini variant (e.g. `gemini-3.5-flash`)
- `generationConfig`: Temperature, topP, topK, maxOutputTokens
