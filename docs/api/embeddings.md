# Embeddings

Vector representation endpoint for semantic search, entity boosting, and clustering.

## Request

- **Endpoint**: `POST /v1/embeddings`
- **Headers**:
  - `Authorization: Bearer <AI_KEY>`
  - `Content-Type: application/json`

## Payload Example

```json
{
  "model": "auto",
  "input": "Sustainable Energy Authority of Ireland grants"
}
```
