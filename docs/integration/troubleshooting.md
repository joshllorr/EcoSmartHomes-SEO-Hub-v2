# Troubleshooting

## Router Offline

Restart the FreeLLMAPI local server from the Windows system tray or relaunch `FreeLLMAPI.Setup.0.9.7.exe`. Verify the endpoint responds on `http://127.0.0.1:31415/v1/models`.

## Fallback Not Triggering

Check the FreeLLMAPI dashboard at `http://127.0.0.1:31415`:

1. Go to **Models → Add keys**.
2. Verify you have supplied at least 2 provider keys (e.g. Gemini and Claude).

## Antigravity Cannot Reach Router

Confirm that `AI_BASE_URL=http://127.0.0.1:31415/v1` is configured in `.env` and `.env.local`. Ensure no local proxy or firewall blocks port 31415 on `127.0.0.1`.

## 429 Errors

If a single provider returns HTTP 429, the router automatically fails over to the next configured model in the fallback chain.
