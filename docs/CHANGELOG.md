# Changelog

All notable changes to this project are documented here.

## [0.9.7] – 2026-09-06
### Added
- Full integration of Antigravity with FreeLLMAPI unified router.
- Adaptive routing strategy (speed, reliability, intelligence).
- Fallback chain: `gemini-3.5-flash` → `claude-3-opus` → `gpt-4-turbo`.
- Unified API key support (`freellmapi-fla_234WVYZ0HJ9NN59GZAE4XKNWZXR0DP2Z`).
- Complete `/docs` folder structure and technical guides.
- Vitest coverage for AI client, routing, and utilities.
- Production-ready frontend build.
- Automated Vercel deployment pipeline.

### Changed
- Updated AI client to use unified router endpoint (`http://127.0.0.1:31415/v1`).
- Improved error handling and retry logic.

### Fixed
- Routing edge cases where provider throttling caused failures.
