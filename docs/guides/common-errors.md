# Common Errors & Resolutions

### HTTP 429: Resource Exhausted / Rate Limit

**Cause**: The current upstream provider (e.g. Gemini Free Tier) exceeded per-minute quota.
**Resolution**: The FreeLLMAPI router automatically catches this and falls back to Claude or GPT. If all models are exhausted, add another API key in the router dashboard.

### `context_length_exceeded` / `All models exhausted: 594 routes checked (592 no usable key configured)`

**Cause**: Provider keys have not yet been added into the FreeLLMAPI local dashboard.
**Resolution**: Open `http://127.0.0.1:31415`, navigate to **Models → Add keys**, and save your Gemini/Claude/OpenAI API keys.

### Connection Refused (`ECONNREFUSED 127.0.0.1:31415`)

**Cause**: The local router process is closed or stopped.
**Resolution**: Launch `FreeLLMAPI` from the Windows Start Menu or system tray.
