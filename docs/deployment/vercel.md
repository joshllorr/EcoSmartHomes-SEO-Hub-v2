# Vercel Deployment

Pushing changes to `origin/main` automatically triggers an end-to-end production build and deployment on Vercel.

## Vercel Environment Variables

Ensure the following variables are configured under **Project Settings → Environment Variables**:

- `AI_PROVIDER`: `freellmapi`
- `AI_BASE_URL`: Production gateway URL or local tunnel
- `AI_KEY`: `freellmapi-be532d4667d197dc9ac42d43152197d369dfad7cd0c97fdc`
- `GEMINI_API_KEY`: Fallback key
- `APP_URL`: Canonical public deployment URL
- `NODE_ENV`: `production`

## Deployment Verification

Verify the latest commit deployment status in the Vercel Dashboard or via:

```bash
vercel status
```
