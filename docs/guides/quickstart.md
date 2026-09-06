# Quickstart Guide

Get up and running with Antigravity × FreeLLMAPI in 5 minutes:

## Step 1: Install & Run FreeLLMAPI

Run the installer `FreeLLMAPI.Setup.0.9.7.exe`. Verify the server is running on `http://127.0.0.1:31415`.

## Step 2: Activate Unified Key

Open `http://127.0.0.1:31415` and paste your key:

```
freellmapi-be532d4667d197dc9ac42d43152197d369dfad7cd0c97fdc
```

## Step 3: Add Provider Keys

Under **Models → Add keys**, enter your Gemini, Claude, or OpenAI keys.

## Step 4: Configure Antigravity `.env`

```env
AI_PROVIDER=freellmapi
AI_BASE_URL=http://127.0.0.1:31415/v1
AI_KEY=freellmapi-be532d4667d197dc9ac42d43152197d369dfad7cd0c97fdc
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
