# Build Instructions

## Local Production Build

To build the client application for production:

```bash
npm run build:frontend
```

### Expected Output

- Generates optimized assets in `dist/`
- Zero errors and zero unresolved TypeScript warnings
- Typical build duration: 1.5s – 1.9s

## Full Build (Client + Server)

```bash
npm run build
```

Generates:

- `dist/server.cjs` — bundled Express server (via esbuild)
- `dist/` — static client assets (via Vite)
