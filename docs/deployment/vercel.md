# Vercel Deployment

Pushing changes to `origin/main` automatically triggers an end-to-end production build and deployment on Vercel.

## Vercel Environment Variables

Ensure the following variables are configured under **Project Settings → Environment Variables**:

- `AI_PROVIDER`: `freellmapi`
- `AI_BASE_URL`: Production gateway URL or local tunnel
- `AI_KEY`: `freellmapi-fla_234WVYZ0HJ9NN59GZAE4XKNWZXR0DP2Z`
- `GEMINI_API_KEY`: Fallback key
- `APP_URL`: Canonical public deployment URL
- `NODE_ENV`: `production`

## Deployment Verification

Verify the latest commit deployment status in the Vercel Dashboard or via:

```bash
vercel status
```
