# AI Client Tests

Located in `src/utils/__tests__/freeLlmApiClient.test.ts`:

## Test Suites

1. **Initialization**:
   - Confirms `client.getBaseUrl()` defaults to `http://127.0.0.1:31415/v1`.
   - Confirms `client.getApiKey()` picks up the server-side unified key.

2. **Model Selection**:
   - Verifies mapping for `code`, `generation`, `reasoning`, and `analysis`.
   - Defaults to `auto` when no task type is provided.

3. **Router Reachability**:
   - Tests `isAvailable()` health check against `/v1/models` endpoint.

4. **Chat Completion Dispatch**:
   - Verifies standard OpenAI payload serialization and choice parsing.

5. **Fallback Chain Resiliency**:
   - Mocks primary model failure (HTTP 500) and asserts secondary model activation.

6. **Singleton Export**:
   - Verifies `globalFreeLlmApiClient` instance availability.
