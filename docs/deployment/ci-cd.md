# CI/CD Pipeline

The continuous integration and deployment lifecycle consists of:

## Workflow Steps

1. **Pre-commit Quality Checks** (Husky + lint-staged):
   - ESLint validation and auto-fixes
   - Prettier code formatting
2. **Automated Vitest Runs**:
   - Executes 14 test files and 148 unit/integration tests
3. **Vite Production Bundler**:
   - Builds optimized static client chunks
   - Compiles TypeScript definitions
4. **Automated Git Push & Vercel Trigger**:
   - Pushes to `main` branch
   - Triggers serverless edge deployment on Vercel
