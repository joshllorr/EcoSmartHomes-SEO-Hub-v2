<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# EcoSmartHomes SEO Hub

AI-powered SEO automation platform for Irish home retrofit content. Built with React, Express, Vite, and Google Gemini. Includes autonomous decision engines, multi-agent reinforcement learning, real-time WebSocket dashboards, and integrated Sentry error monitoring.

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

App runs at `http://localhost:5173` (Vite dev server proxies API to Express on port 3000).

## Production Setup

### Prerequisites

- Node.js >= 22
- npm >= 10
- (Optional) Google Cloud account for Gemini API
- (Optional) Sentry account for error monitoring

### Environment Variables

Copy `.env.example` to `.env.local` and fill in required values:

```bash
cp .env.example .env.local
```

Set the following at minimum:

| Variable         | Required | Description                                     |
| ---------------- | -------- | ----------------------------------------------- |
| `GEMINI_API_KEY` | Yes      | Google Gemini API key for AI content generation |
| `APP_URL`        | Yes      | Public URL of the deployed application          |
| `NODE_ENV`       | Yes      | `development`, `production`, or `test`          |

### Build

```bash
npm run build
```

Outputs:

- `dist/server.cjs` — bundled Express server (via esbuild)
- `build/` — static client assets (via Vite)

### Deploy

```bash
# Start production server
npm run start
```

For Vercel deployment, configure the following environment variables in the Vercel dashboard under Settings > Environment Variables:

- `GEMINI_API_KEY`
- `APP_URL`
- `SENTRY_DSN` (optional)
- `VITE_SENTRY_DSN` (optional)

## Scripts Reference

| Script        | Command                 | Description                                   |
| ------------- | ----------------------- | --------------------------------------------- |
| Dev           | `npm run dev`           | Starts Vite + Express concurrently            |
| Crawler       | `npm run crawler`       | Starts Vite + Express without opening browser |
| Build         | `npm run build`         | Builds client + bundles server                |
| Start         | `npm run start`         | Runs production server from `dist/server.cjs` |
| Lint          | `npm run lint`          | Runs ESLint across the project                |
| Format        | `npm run format`        | Formats all files with Prettier               |
| Typecheck     | `npm run check`         | Type-checks with TypeScript                   |
| Test          | `npm run test`          | Runs Vitest test suite                        |
| Test:watch    | `npm run test:watch`    | Runs Vitest in watch mode                     |
| Test:coverage | `npm run test:coverage` | Runs Vitest with V8 coverage                  |
| Clean         | `npm run clean`         | Removes `dist/` and `server.js`               |

## Architecture

### Layer Stack

| Layer      | Technology                  | Purpose                                             |
| ---------- | --------------------------- | --------------------------------------------------- |
| Frontend   | React 19 + Vite             | Dashboard, article editor, analytics charts         |
| Styling    | Tailwind CSS v4             | Utility-first CSS via Vite plugin                   |
| State      | Zustand                     | Lightweight client state management                 |
| Backend    | Express 5                   | REST API server on port 3000                        |
| AI Engine  | Google Gemini 2.5 Flash     | Content generation, SERP analysis, keyword research |
| Real-time  | WebSocket (ws)              | Live dashboard updates, broadcast events            |
| Monitoring | Sentry (Node + React)       | Error tracking and performance monitoring           |
| Security   | Helmet + express-rate-limit | CSP, HSTS, rate limiting                            |

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Vite Dev Server                       │
│                     (localhost:5173)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌───────────────────┐   │
│  │   React App  │  │  Dashboard  │  │  Analytics Charts │   │
│  │   (Router)   │  │  (Zustand)  │  │   (Recharts)      │   │
│  └─────────────┘  └─────────────┘  └───────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          │
                   API Proxy (/api)
                          │
┌─────────────────────────────────────────────────────────────┐
│                      Express Server                          │
│                     (localhost:3000)                         │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  Middleware: Helmet, Rate Limit, JSON Body Parser       ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐│
│  │ SEO Engines  │ │ MARL Engine  │ │ Decision Engine      ││
│  │ (Draft,      │ │ (Multi-Agent │ │ (Autonomous Actions) ││
│  │  Rewrite,    │ │  RL, Genomes)│ │                      ││
│  │  Optimize)   │ │              │ │                      ││
│  └──────────────┘ └──────────────┘ └──────────────────────┘│
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐│
│  │ Harbor Sync  │ │ WebSocket    │ │ Command Router       ││
│  │ Receiver     │ │ Broadcast    │ │ (Harbor → Hub)       ││
│  └──────────────┘ └──────────────┘ └──────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                          │
                   WebSocket (/ws)
                   Broadcasts to all clients
```

### Key Modules

| Module           | Path                            | Description                                                                             |
| ---------------- | ------------------------------- | --------------------------------------------------------------------------------------- |
| SEO Engines      | `src/engines/`                  | Draft generation, rewrite, competitor diff, expansion, link bait, optimization pipeline |
| Decision Engine  | `src/server/decisionEngine.ts`  | Layer 7 autonomous AI-driven decision engine with per-domain autonomy modes             |
| MARL Engine      | `src/server/rlEngine.ts`        | Multi-agent reinforcement learning with agent-specific reward functions                 |
| MARL Coordinator | `src/server/marlCoordinator.ts` | Orchestra conductor for coordinating multi-agent actions                                |
| MARL Genome      | `src/server/marlGenome.ts`      | Agent personality shaping and genetic evolution                                         |
| Harbor Sync      | `src/services/hubCommands.ts`   | Bidirectional sync with Harbor Dashboard                                                |
| Command Router   | `src/server/commands.ts`        | Harbor → Hub command dispatcher                                                         |
| Parser/Crawler   | `crawler.mts`                   | Site scanning and content discovery                                                     |

## API Endpoints

### Health

| Method | Path      | Description                                  |
| ------ | --------- | -------------------------------------------- |
| GET    | `/health` | Enhanced health check with dependency status |
| GET    | `/ready`  | Readiness probe for container orchestration  |

### SEO Content Generation

| Method | Path                           | Description                                 |
| ------ | ------------------------------ | ------------------------------------------- |
| POST   | `/api/seo/generate-article`    | Generate SEO blog article draft via Gemini  |
| POST   | `/api/seo/rework-content`      | Transform and optimize existing content     |
| POST   | `/api/seo/optimize-content`    | Optimize draft (meta, density, readability) |
| POST   | `/api/seo/generate-title-meta` | Generate SEO title and meta description     |

### SEO Analysis

| Method | Path                              | Description                                          |
| ------ | --------------------------------- | ---------------------------------------------------- |
| POST   | `/api/seo/keyword-research`       | Keyword research with search volume and difficulty   |
| POST   | `/api/seo/discover-content-ideas` | AI-grounded content gap and trending topic discovery |
| POST   | `/api/seo/serp-analysis`          | Full SERP competitor analysis with ranking gaps      |
| POST   | `/api/seo/scout-site`             | Site SEO audit with issues and recommendations       |
| POST   | `/api/seo/sitemap-scan`           | Sitemap presence check                               |
| GET    | `/api/site-health`                | Site health quick check (GET)                        |
| POST   | `/api/site-health`                | Site health quick check (POST)                       |
| POST   | `/api/seo/pillar-page-ideas`      | Generate high-authority pillar page concepts         |
| POST   | `/api/seo/link-opportunities`     | Backlink outreach opportunity finder                 |
| POST   | `/api/seo/generate-link-bait`     | Link bait asset generator                            |
| POST   | `/api/seo/link-bait-scanner`      | Link bait idea scanner                               |
| POST   | `/api/seo/build-link-bait-page`   | Build link bait page                                 |

### Schema & CMS

| Method | Path                       | Description                               |
| ------ | -------------------------- | ----------------------------------------- |
| POST   | `/api/seo/push-schema-cms` | Push JSON-LD schema to WordPress CMS      |
| POST   | `/api/seo/schema-suggest`  | AI schema suggestions for structured data |
| POST   | `/api/cms/publish`         | Publish article to CMS via webhook        |

### Q&A & Knowledge

| Method | Path       | Description                        |
| ------ | ---------- | ---------------------------------- |
| POST   | `/api/qa`  | Conversational knowledge interface |
| POST   | `/api/ask` | Q&A endpoint returning HTML answer |

### Utilities

| Method | Path                         | Description                                          |
| ------ | ---------------------------- | ---------------------------------------------------- |
| POST   | `/api/energy/maps-grounding` | Facilities energy advisor with Google Maps grounding |
| POST   | `/telemetry`                 | Behavioural telemetry (dwell time, scroll depth)     |

### Command Router

| Method | Path           | Description                     |
| ------ | -------------- | ------------------------------- |
| POST   | `/api/command` | Harbor → Hub command dispatcher |

Supported actions: `generate_draft`, `rewrite_article`, `competitor_diff`, `queue_expansion`, `publish`, `link_bait`, `optimize_pipeline`, `optimize_all`

### Autonomous Decision Engine

| Method | Path                        | Description                                      |
| ------ | --------------------------- | ------------------------------------------------ |
| GET    | `/api/autonomous-decisions` | Get decision engine state                        |
| POST   | `/api/autonomous-decisions` | Toggle autopilot, trigger cycle, set domain mode |

Actions: `toggle_autopilot`, `trigger_cycle`, `set_domain_mode`

### Multi-Agent Reinforcement Learning

| Method | Path                        | Description                              |
| ------ | --------------------------- | ---------------------------------------- |
| GET    | `/api/rl/policy`            | Get all agent policies and performance   |
| POST   | `/api/rl/evaluate-reward`   | Evaluate action reward and update policy |
| POST   | `/api/rl/experience-replay` | Run multi-agent experience replay        |
| GET    | `/api/rl/experiences`       | Get MARL memory experiences              |

### MARL Coordinator

| Method | Path                                  | Description                        |
| ------ | ------------------------------------- | ---------------------------------- |
| GET    | `/api/marl/coordinator-state`         | Get coordinator state              |
| POST   | `/api/marl/agent-autonomy`            | Set agent autonomy mode            |
| POST   | `/api/marl/trigger-coordinated-cycle` | Trigger coordinated decision cycle |
| GET    | `/api/marl/negotiation-state`         | Get negotiation state              |
| POST   | `/api/marl/run-negotiation-cycle`     | Run negotiation cycle              |
| GET    | `/api/marl/genomes`                   | Get all agent genomes              |
| POST   | `/api/marl/mutate-genome`             | Mutate agent genome traits         |
| POST   | `/api/marl/personality-shaping-cycle` | Run personality shaping cycle      |

### Harbor Sync

| Method | Path              | Description                          |
| ------ | ----------------- | ------------------------------------ |
| POST   | `/api/hub-sync`   | Receive events from Harbor Dashboard |
| GET    | `/api/hub-state`  | Get current Harbor metric state      |
| GET    | `/api/hub-events` | Get recent Hub activity events       |

### Unified Analytics

| Method | Path                     | Description                               |
| ------ | ------------------------ | ----------------------------------------- |
| GET    | `/api/unified-analytics` | Aggregated Harbor, Hub, and Fleet metrics |

## WebSocket Events

Connect to `ws://localhost:3000/ws`. The server broadcasts the following event types:

| Event Type                     | Trigger                         |
| ------------------------------ | ------------------------------- |
| `autopilot_toggled`            | Auto-pilot mode changed         |
| `decision_cycle_run`           | Decision engine cycle completed |
| `autonomy_mode_updated`        | Domain autonomy mode updated    |
| `rl_reward_evaluated`          | MARL reward evaluated           |
| `rl_experience_replay`         | Experience replay completed     |
| `marl_agent_autonomy_toggled`  | Agent autonomy changed          |
| `marl_coordinated_cycle_run`   | Coordinated cycle completed     |
| `marl_genome_mutated`          | Agent genome mutated            |
| `marl_personality_shaping_run` | Personality shaping completed   |
| `article_generated`            | Article draft created           |
| `rewrite_success`              | Content rewrite completed       |
| `metric_update`                | General metric update           |
| `crawler_heartbeat`            | Crawler active scanning         |
| `qa_query`                     | Q&A query processed             |
| `conversational_knowledge`     | Knowledge interface event       |
| `draft_created`                | Draft saved to Harbor           |

## Troubleshooting

### Port Already in Use

Express defaults to port 3000. If it is occupied:

```bash
# Find process on port 3000
lsof -i :3000
kill -9 <PID>
```

### Gemini API Not Responding

The app operates in offline safe-mode when the API key is missing or the quota is exceeded. You will see `isMock: true` in responses with a warning. Check:

1. `GEMINI_API_KEY` is set correctly in `.env.local`
2. The key is valid and has quota remaining
3. Network egress to `generativelanguage.googleapis.com` is allowed

### WebSocket Connection Failing

Ensure the Express server is running on port 3000. The Vite dev server proxies WebSocket connections automatically. If running the Express server standalone, connect to `ws://localhost:3000/ws`.

### Sentry Not Capturing Errors

1. Verify `SENTRY_DSN` (server) and `VITE_SENTRY_DSN` (client) are set
2. Ensure `NODE_ENV` matches the Sentry project environment
3. Check that the Sentry release tag matches: `ecosmarthomes-seo-hub@0.0.0`

### Rate Limiting Issues

In production, all `/api/` routes are rate-limited. Adjust via:

```
RATE_LIMIT_MAX=200
RATE_LIMIT_WINDOW_MS=900000
```

### Build Fails

Ensure you have run `npm install` with a compatible Node version. The build uses esbuild to bundle the server. If the CJS output is corrupted, run `npm run clean` then rebuild.

### TypeScript Errors

Run `npm run check` to identify type issues. The project uses strict TypeScript with `noEmit: true`.

## License

Private — EcoSmartHomes Internal Tool
