# FreeLLMAPI Setup

## Install

Run the local installer:

```bash
FreeLLMAPI.Setup.0.9.7.exe
```

## Activate Premium

Paste your unified key into the setup wizard:

```
freellmapi-be532d4667d197dc9ac42d43152197d369dfad7cd0c97fdc
```

## Add Provider Keys

Open the dashboard at `http://127.0.0.1:31415`:

Go to:
**Models → Add keys**

Add your provider keys:

- Gemini key
- Claude key
- OpenAI key (optional)

## Verify Router

Verify the router endpoint is live:

```bash
curl -H "Authorization: Bearer freellmapi-be532d4667d197dc9ac42d43152197d369dfad7cd0c97fdc" http://127.0.0.1:31415/v1/models
```
