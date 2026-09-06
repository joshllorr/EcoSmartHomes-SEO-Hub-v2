# Contributing to EcoSmartHomes SEO Hub & Antigravity × FreeLLMAPI

## 🧭 Overview

Thank you for contributing to the **EcoSmartHomes SEO Hub** and the **Antigravity × FreeLLMAPI Integration Project**.
This document outlines the standards, workflows, and expectations for contributors working on:

- **Antigravity AI logic & Retrofit Engines**
- **FreeLLMAPI unified router integration**
- **Frontend + Backend code**
- **Testing (Vitest)**
- **CI/CD (GitHub + Vercel)**
- **Documentation**

Following these guidelines ensures consistency, reliability, and high‑quality contributions.

---

## 🛠 Development Environment

### Requirements

- **Node.js**: 18+ (22 recommended)
- **npm**: 9+
- **FreeLLMAPI**: v0.9.7+ installed locally
- **Unified API Key**: (Premium Annual)
- **Antigravity IDE / CLI** or modern terminal environment
- **GitHub account**
- **Vercel project access**

### Environment Variables

Create or update `.env` or `.env.local`:

```env
# FreeLLMAPI Unified Router Configuration
AI_PROVIDER=freellmapi
AI_BASE_URL=http://127.0.0.1:31415/v1
AI_KEY=freellmapi-be532d4667d197dc9ac42d43152197d369dfad7cd0c97fdc
AI_ROUTING=adaptive

# App & Fallback Credentials
APP_URL=http://localhost:5173
NODE_ENV=development
GEMINI_API_KEY=your-gemini-api-key # Optional fallback
```

---

## 🧩 Project Structure

```
EcoSmartHomes-SEO-Hub/
├── antigravity.yaml          # Antigravity router config
├── config/
│   └── ai.yaml               # Model routing, timeout, and fallback chain config
├── docs/
│   └── FREELLMAPI_INTEGRATION.md # Handover specification & router documentation
├── logic/
│   └── coach/
│       └── retrofitCoachEngine.ts # Proactive NZEB Coach with FreeLLMAPI fallback
├── scripts/
│   └── antigravity_ai.py     # Standalone Python client for FreeLLMAPI router
├── src/
│   ├── components/           # React 19 UI components & tabs
│   ├── dashboard/            # Specialized analytics & intelligence dashboards
│   ├── engines/              # Multi-agent MARL & SERP coordination engines
│   ├── logic/                # Core SEO, grant, predictive, and crawl engines
│   ├── portal/               # Homeowner portal & coach interfaces
│   ├── services/             # Background sync & command router
│   └── utils/
│       ├── freeLlmApiClient.ts # FreeLLMAPI TypeScript client & model selector
│       └── __tests__/
│           └── freeLlmApiClient.test.ts # Vitest suite for FreeLLMAPI
├── server.ts                 # Main Express backend server (port 3000)
├── vite.config.ts            # Vite client config (port 5173)
└── vitest.config.ts          # Vitest testing configuration
```

---

## 🔧 Coding Standards

### General

- Use **TypeScript** for all logic, client, and server files.
- Prefer **pure functions** where possible.
- Avoid side effects in routing logic.
- Use descriptive variable and function names.
- Keep functions under 40 lines when possible.
- Adhere to strict TypeScript with `noEmit: true`.

### AI Client & Router

- **Always use the unified API key** (`AI_KEY`).
- **Always call the FreeLLMAPI router** (`http://127.0.0.1:31415/v1`), not provider APIs directly.
- **Implement fallback chains**: `gemini-3.5-flash` → `claude-3-opus` → `gpt-4-turbo` → `auto`.
- **Implement adaptive routing**: select models based on task type (`code`, `generation`, `reasoning`, `analysis`).
- Ensure robust error handling with automatic retry backoff and deterministic fallbacks.

### Frontend

- Use **React functional components** with hooks.
- Use **Zustand** for lightweight client state management.
- Avoid inline styles; use **Tailwind CSS v4**.
- Keep components modular, accessible, and composable.

---

## 🧪 Testing Guidelines

### Vitest Suite

All new logic, engines, and features must include automated Vitest coverage.

#### Minimum Requirements

- **100% pass rate** on all active test suites.
- **Zero skipped tests** without explicit issue tracking.
- Test coverage for:
  - Routing logic & model selection
  - Fallback chains & error resilience
  - Unified API key handling
  - Response parsing (JSON & Markdown)
  - SEAI grant calculations & EPBD scales

#### Example Commands

```bash
# Test FreeLLMAPI client
npx vitest run src/utils/__tests__/freeLlmApiClient.test.ts

# Test Phases 15–28 Strategy & Retrofit integrity
npx vitest run src/logic/__tests__/phase15to28Integrity.test.ts

# Run all logic and utility test suites
npx vitest run src/logic/__tests__/ src/utils/__tests__/
```

---

## 🚀 Build & Deployment Workflow

### Local Build

Before committing or pushing, verify the frontend build:

```bash
npm run build:frontend
```

Must complete with:

- **0 errors**
- Clean asset generation in `dist/`

### Commit Standards

This project strictly enforces [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>
```

#### Allowed Types

- `feat`: New feature or capability
- `fix`: Bug fix
- `docs`: Documentation updates
- `test`: Test suite additions or repairs
- `refactor`: Code reorganization without functional change
- `perf`: Performance improvements
- `chore`: Tooling, build, or dependency updates

#### Examples

```bash
git commit -m "feat(ai): integrate Antigravity with FreeLLMAPI local router and adaptive fallback"
git commit -m "fix(router): correct fallback chain ordering"
git commit -m "docs: update README and CONTRIBUTING with FreeLLMAPI guidelines"
```

### Push Workflow

Pushing to the `main` branch automatically triggers:

1. Automated Pre-commit hooks (`husky` + `lint-staged`: ESLint & Prettier).
2. GitHub repository push to `origin/main`.
3. Live production deployment on **Vercel**.

Always ensure your branch is up-to-date and all tests pass before pushing.

---

## 🔄 Pull Request Process

1. **Create a Feature Branch**:

   ```bash
   git checkout -b feat/my-feature
   ```

2. **Write Code + Tests**:
   All new logic must include corresponding Vitest files in `src/**/__tests__/`.

3. **Run Full Test Suite**:

   ```bash
   npx vitest run src/logic/__tests__/ src/utils/__tests__/
   ```

4. **Build Frontend**:

   ```bash
   npm run build:frontend
   ```

5. **Commit Using Conventional Format**:

   ```bash
   git commit -m "feat(ai): add new routing strategy"
   ```

6. **Push Branch**:

   ```bash
   git push origin feat/my-feature
   ```

7. **Open Pull Request**:
   Include:
   - Concise summary of changes
   - Motivation & problem solved
   - Verification commands & test output
   - Screenshots (for UI changes)
   - Deployment impact

8. **PR Review Checklist**:
   - [ ] Code follows TypeScript & project style guidelines
   - [ ] Unit & integration tests included
   - [ ] All Vitest tests pass (100%)
   - [ ] Production build passes (`npm run build:frontend`)
   - [ ] No breaking changes to existing endpoints or schemas
   - [ ] Documentation updated (`README.md`, `CONTRIBUTING.md`, etc.)

---

## 🧠 FreeLLMAPI Integration Rules

### Do

- ✔ Use the unified API key (`AI_KEY`).
- ✔ Use the local router endpoint (`http://127.0.0.1:31415/v1`).
- ✔ Use adaptive routing based on task type.
- ✔ Rely on fallback chains (`gemini` → `claude` → `gpt` → `auto`).
- ✔ Keep model selection logic in `src/utils/freeLlmApiClient.ts`.
- ✔ Maintain router configuration in `antigravity.yaml` and `config/ai.yaml`.

### Do Not

- ❌ Call external provider APIs directly when router is active.
- ❌ Hardcode model names outside the configuration / selector mapping.
- ❌ Store raw API keys or secrets in source code or git history.
- ❌ Bypass router fallback chains when exceptions occur.

---

## 🛡 Security Guidelines

- **Never commit `.env` or `.env.local` files** (verified by `.gitignore`).
- **Never commit raw API keys** or secrets into source code.
- **Use environment variables in Vercel** for all production keys.
- **Validate all external inputs** with strict typing.
- **Handle router errors gracefully** without leaking internal stack traces to clients.

---

## 📄 Documentation Standards

All new features and upgrades must update:

- `README.md`
- `CONTRIBUTING.md`
- `docs/FREELLMAPI_INTEGRATION.md` (for router updates)
- Inline TypeScript JSDoc comments

---

## 🎉 Thank You

Your contributions help keep Antigravity and EcoSmartHomes fast, reliable, and developer‑friendly!
If you have questions, open an issue or reach out to the maintainers.
