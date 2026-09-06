# Quickstart Guide

Get up and running with Antigravity × FreeLLMAPI in 5 minutes:

## Step 1: Install & Run FreeLLMAPI

Run the installer `FreeLLMAPI.Setup.0.9.7.exe`. Verify the server is running on `http://127.0.0.1:31415`.

## Step 2: Activate Unified Key

Open `http://127.0.0.1:31415` and paste your key:

```
freellmapi-fla_234WVYZ0HJ9NN59GZAE4XKNWZXR0DP2Z
```

## Step 3: Add Provider Keys

Under **Models → Add keys**, enter your Gemini, Claude, or OpenAI keys.

## Step 4: Configure Antigravity `.env`

```env
AI_PROVIDER=freellmapi
AI_BASE_URL=http://127.0.0.1:31415/v1
AI_KEY=freellmapi-fla_234WVYZ0HJ9NN59GZAE4XKNWZXR0DP2Z
AI_ROUTING=adaptive
```

## Step 5: Test the Integration

```bash
npx vitest run src/utils/__tests__/freeLlmApiClient.test.ts
```

## Step 6: Deploy to Vercel

Push your branch to `main`:

```bash
git push origin main
```
