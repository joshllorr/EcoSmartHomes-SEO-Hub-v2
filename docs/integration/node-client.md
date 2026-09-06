# Node.js / TypeScript Client

The TypeScript router client is available at `src/utils/freeLlmApiClient.ts`:

```typescript
import { globalFreeLlmApiClient } from '@/utils/freeLlmApiClient';

// Dispatch prompt using task type
const response = await globalFreeLlmApiClient.chat(
  'Analyze BER uplift from D to A0 under 2026 EPBD standards.',
  { taskType: 'analysis' },
);

console.log('AI Response:', response);
```

### Features

- Native router reachability health check (`client.isAvailable()`).
- Automatic model selection by task (`code`, `generation`, `reasoning`, `analysis`).
- Full fallback chain iteration (`gemini-3.5-flash` → `claude-3-opus` → `gpt-4-turbo` → `auto`).
- Graceful error recovery with configurable timeouts.
