# Contributing to EcoSmartHomes SEO Hub

## Development Setup

### Prerequisites

- Node.js >= 22
- npm >= 10
- Git

### Clone and Install

```bash
git clone https://github.com/joshllorr/EcoSmartHomes-SEO-Hub.git
cd EcoSmartHomes-SEO-Hub
npm install
cp .env.example .env.local
```

### Configure Environment

Edit `.env.local` with your local values. At minimum:

```env
GEMINI_API_KEY="your-gemini-api-key"
APP_URL="http://localhost:5173"
NODE_ENV="development"
```

### Run Development Server

```bash
npm run dev
```

This starts Vite on port 5173 and Express on port 3000 concurrently. The Vite proxy forwards `/api`, `/health`, and `/ws` to the Express backend.

## Project Structure

```
├── api/                  # Vercel serverless functions
│   ├── index.ts
│   └── site-health.js
├── src/
│   ├── api/              # Frontend API client utilities
│   ├── components/       # React components
│   ├── engines/          # AI engine adapters (call local Hub API)
│   ├── hooks/            # React custom hooks
│   ├── modules/          # Feature modules
│   ├── pages/            # Route-level page components
│   ├── server/           # Express backend modules
│   │   ├── commands.ts   # Harbor → Hub command router
│   │   ├── decisionEngine.ts  # Autonomous decision engine
│   │   ├── marlCoordinator.ts # MARL coordinator
│   │   ├── marlGenome.ts      # Agent genome evolution
│   │   └── rlEngine.ts        # Multi-agent RL engine
│   ├── services/         # Harbor sync, hub commands
│   ├── store/            # Zustand state stores
│   ├── test/             # Test utilities and setup
│   └── utils/            # Shared utilities
├── server.ts             # Main Express server entry point
├── publisher.ts          # GitHub publishing utility
├── crawler.mts           # Site crawler script
├── vite.config.ts        # Vite configuration
├── vitest.config.ts      # Vitest test configuration
├── tsconfig.json         # TypeScript configuration
├── eslint.config.js      # ESLint flat config
├── .prettierrc           # Prettier configuration
├── wrangler.toml         # Cloudflare Workers config
└── vercel.json           # Vercel routing config
```

## Linting and Formatting

### ESLint

```bash
npm run lint
```

Fixes automatically on staged files via lint-staged during pre-commit hooks.

### Prettier

```bash
npm run format
```

Formatting rules are defined in `.prettierrc`. Pre-commit hooks run Prettier on staged files via lint-staged.

### TypeScript

```bash
npm run check
```

Runs `tsc --noEmit` to verify type correctness without emitting files.

## Testing

### Run Tests

```bash
npm run test
```

Runs the full Vitest suite.

### Watch Mode

```bash
npm run test:watch
```

### Coverage

```bash
npm run test:coverage
```

Generates V8 coverage report in `coverage/`.

### Test Structure

Tests live alongside source files with `.test.ts` or `.test.tsx` extensions. Test utilities are in `src/test/`:

- `setup.ts` — global test setup (jsdom environment)
- `server-test-helper.ts` — test helper that sets `NODE_ENV=production` and `VERCEL=1`
- `utilities.test.ts` — tests for utility functions
- `server.test.ts` — server endpoint tests

## Pull Request Process

1. Create a feature branch from `main`:

```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and ensure all checks pass:

```bash
npm run lint
npm run check
npm run test
```

3. Commit using the [conventional commit](#commit-conventions) format.

4. Push your branch and open a pull request against `main`.

5. Fill in the PR description with:
   - What changed and why
   - Screenshots or logs for UI/behavior changes
   - Linked issues or beads

6. Address review feedback. Once approved, the PR will be merged.

## Commit Conventions

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Format:

```
<type>(<scope>): <description>
```

### Types

| Type       | Description                                 |
| ---------- | ------------------------------------------- |
| `feat`     | New feature                                 |
| `fix`      | Bug fix                                     |
| `docs`     | Documentation changes                       |
| `style`    | Code style changes (formatting, semicolons) |
| `refactor` | Code refactoring                            |
| `perf`     | Performance improvement                     |
| `test`     | Adding or updating tests                    |
| `chore`    | Build, CI, or tooling changes               |
| `revert`   | Reverting a previous commit                 |

### Scopes (Optional)

| Scope      | Description                        |
| ---------- | ---------------------------------- |
| `seo`      | SEO engine endpoints or logic      |
| `marl`     | Multi-agent reinforcement learning |
| `decision` | Autonomous decision engine         |
| `harbor`   | Harbor sync integration            |
| `ui`       | Frontend UI components             |
| `api`      | API routes or server logic         |
| `config`   | Configuration files                |
| `deps`     | Dependency updates                 |

### Examples

```
feat(seo): add keyword research endpoint
fix(marl): correct reward calculation for solar agent
docs: update README with production setup steps
chore(deps): upgrade vitest to v3.0.0
refactor(api): consolidate rate limit config
```

### Breaking Changes

Add `BREAKING CHANGE:` in the commit body for breaking changes, or append `!` after the type/scope:

```
feat(api)!: remove legacy /ask endpoint
```

## Pre-commit Hooks

Husky runs lint-staged on every commit:

```json
{
  "*.{js,jsx,ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"]
}
```

To skip hooks temporarily (not recommended):

```bash
git commit --no-verify -m "commit message"
```

## Code Style

- **TypeScript**: Strict mode enabled. Use explicit types, avoid `any`.
- **React**: Functional components with hooks. Use React 19 features.
- **Naming**: `camelCase` for variables/functions, `PascalCase` for types/interfaces/components, `kebab-case` for file names.
- **Imports**: Use `@/` alias for absolute imports from project root.
- **Server routes**: Express routers in `src/server/`, mounted in `server.ts`.
- **API responses**: Standard shape `{ ok: boolean, ... }` for commands, `{ success: boolean, ... }` for SEO endpoints.

## Environment Variables

Never commit `.env` files. All secrets go in `.env.local` (gitignored). Copy `.env.example` as a starting point.

## Security

See [SECURITY.md](./SECURITY.md) for vulnerability reporting guidelines.
