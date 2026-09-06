# Vitest Overview

Vitest is the primary testing framework for the project, providing fast, TypeScript-native test execution with V8 coverage.

## Scope of Vitest Tests

- **AI client logic**: Unified router connection, bearer authorization, model mapping, and fallback iteration.
- **Routing strategy**: Adaptive, fastest, and reasoning mode resolution.
- **Fallback behavior**: Multi-provider resilience when primary models fail.
- **Error handling**: HTTP 429 quota exhaustion, network timeouts, and JSON error parsing.
- **Utility functions**: URL slugification, XML sanitization, and EPBD energy scale conversion.

## Commands

```bash
# Run all tests
npx vitest run

# Run with watch mode
npm run test:watch

# Generate coverage
npm run test:coverage
```
