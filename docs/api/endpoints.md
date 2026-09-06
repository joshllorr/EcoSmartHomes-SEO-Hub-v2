# Endpoints

Base URL:
`http://127.0.0.1:31415/v1`

## Available Endpoints

### Chat Completions

- **Path**: `/v1/chat/completions`
- **Method**: `POST`
- **Format**: OpenAI-compatible

### Messages (Claude)

- **Path**: `/v1/messages`
- **Method**: `POST`
- **Format**: Anthropic-compatible

### Responses (Gemini)

- **Path**: `/v1/responses`
- **Method**: `POST`
- **Format**: Google Gemini-compatible

### Embeddings

- **Path**: `/v1/embeddings`
- **Method**: `POST`
- **Format**: Text vector representation

### Model Catalog

- **Path**: `/v1/models`
- **Method**: `GET`
- **Format**: List available router models and provider statuses
