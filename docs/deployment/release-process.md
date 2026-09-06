# Release Process

1. **Update `docs/CHANGELOG.md`**:
   - Document new features, bug fixes, and configuration adjustments.
2. **Verify Tests & Build**:
   - Run `npx vitest run` (100% pass required).
   - Run `npm run build:frontend` (0 errors required).
3. **Commit with Conventional Commit Format**:
   - `git commit -m "chore(release): v0.9.7"`
4. **Push to `main`**:
   - `git push origin main`
5. **Vercel Deployment**:
   - Monitors deployment health on Vercel dashboard.
