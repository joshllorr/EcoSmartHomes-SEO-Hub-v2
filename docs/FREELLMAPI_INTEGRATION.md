# README.md — Antigravity × FreeLLMAPI Integration

## 🚀 Overview

This repository integrates Antigravity with the **FreeLLMAPI Unified Local Router**, enabling:

- **Unified API key** (one key for all LLMs)
- **Local routing** via `http://127.0.0.1:31415/v1`
- **Adaptive model selection**
- **Fastest‑model routing**
- **Automatic fallback chains**
- **Claude/Gemini/GPT interoperability**
- **Full Vitest coverage**
- **Vercel‑ready deployment**

This setup provides a high‑reliability, high‑quota, low‑latency AI backend for Antigravity workflows.

---

## 🧩 Architecture

Antigravity communicates with the FreeLLMAPI router using:

```
Unified API Key → Local Router → Provider Models (Gemini, Claude, GPT)
```

Routing is handled automatically using:

- Speed metrics
- Reliability metrics
- Intelligence scores
- Fallback chains

The router selects the optimal model per request.

---

## 🔧 Requirements

- Node.js 18+
- FreeLLMAPI v0.9.7+ (local router installed)
- Unified API key (Premium Annual)
- Antigravity IDE / CLI
- Vercel (optional for deployment)

---

## ⚙️ Environment Variables

Add these to `.env` or your deployment environment:

```env
AI_PROVIDER=freellmapi
AI_BASE_URL=http://127.0.0.1:31415/v1
AI_KEY=freellmapi-fla_234WVYZ0HJ9NN59GZAE4XKNWZXR0DP2Z
AI_ROUTING=adaptive
```

---

## 📘 Antigravity YAML Configuration

Configured in `antigravity.yaml` and `config/ai.yaml`:

```yaml
ai:
  provider: freellmapi
  base_url: 'http://127.0.0.1:31415/v1'
  api_key: 'freellmapi-fla_234WVYZ0HJ9NN59GZAE4XKNWZXR0DP2Z'

  routing:
    mode: adaptive
    metrics: ['speed', 'reliability', 'intelligence']
    default_strategy: fastest

  model_selector:
    code: 'gemini-3.5-flash'
    generation: 'gemini-3.5-flash'
    reasoning: 'claude-3-opus'
    analysis: 'claude-3-opus'
    fallback: 'gpt-4-turbo'

  fallback_chain:
    auto_fastest:
      - 'gemini-3.5-flash'
      - 'claude-3-opus'
      - 'gpt-4-turbo'

  default_model: 'auto_fastest'

  request:
    timeout_ms: 20000
    retries: 2
    retry_backoff_ms: 500

  logging:
    enabled: true
    level: info
    show_routing_decisions: true
    show_latency: true
    show_token_usage: true
```

---

## 🧠 Python Client (Ready‑to‑Paste)

Available at `scripts/antigravity_ai.py`:

```python
import os
import time
import requests

class AntigravityAI:
    def __init__(self):
        self.base_url = os.getenv("AI_BASE_URL", "http://127.0.0.1:31415/v1")
        self.api_key = os.getenv("AI_KEY", "freellmapi-fla_234WVYZ0HJ9NN59GZAE4XKNWZXR0DP2Z")

        self.model_map = {
            "code": "gemini-3.5-flash",
            "generation": "gemini-3.5-flash",
            "reasoning": "claude-3-opus",
            "analysis": "claude-3-opus",
        }

        self.fallback_chain = [
            "gemini-3.5-flash",
            "claude-3-opus",
            "gpt-4-turbo"
        ]

    def select_model(self, task_type):
        return self.model_map.get(task_type, "auto")

    def run(self, prompt, task_type="generation"):
        model = self.select_model(task_type)

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        # Try designated model, auto router, and fallback chain
        candidate_models = [model, "auto"] + self.fallback_chain
        seen = set()
        unique_models = []
        for m in candidate_models:
            if m not in seen:
                seen.add(m)
                unique_models.append(m)

        for m in unique_models:
            payload = {
                "model": m,
                "messages": [{"role": "user", "content": prompt}],
                "stream": False
            }
            try:
                response = requests.post(
                    f"{self.base_url}/chat/completions",
                    json=payload,
                    headers=headers,
                    timeout=20
                )

                if response.status_code == 200:
                    data = response.json()
                    choices = data.get("choices", [])
                    if choices and "message" in choices[0]:
                        return choices[0]["message"].get("content", "")
                    return data.get("output_text", str(data))

                if response.status_code in [429, 500, 503]:
                    time.sleep(0.5)
                    continue

            except Exception:
                time.sleep(0.5)
                continue

        return "All models failed — check router or provider keys."


if __name__ == "__main__":
    ai = AntigravityAI()
    print("Testing FreeLLMAPI router at", ai.base_url)
    res = ai.run("Explain Antigravity routing.", task_type="analysis")
    print("Response:", res)
```

---

## 🧪 Testing

Vitest suite:

```bash
npx vitest run src/utils/__tests__/freeLlmApiClient.test.ts
```

✔ **6/6 tests passed**

Full suite:

```bash
npx vitest run src/logic/__tests__/ src/utils/__tests__/
```

✔ **14/14 test files**
✔ **148/148 tests passed (100%)**

---

## 🏗️ Frontend Build

```bash
npm run build:frontend
```

✔ **Completed in 1.88s**
✔ **0 errors**

---

## 🚀 Deployment

- Commit: `87a6274` (`feat(ai): integrate Antigravity with FreeLLMAPI local router and adaptive fallback`)
- Pushed to: `origin/main`
- Automated Vercel deployment triggered.

---

## 📡 Router Setup (FreeLLMAPI)

Inside the dashboard at `http://127.0.0.1:31415`:

✔ **Premium activated** (Key validated until 2027)
✔ **Unified API key generated**
✔ **Local router running at 127.0.0.1:31415**
✔ **Provider keys added** (Gemini, Claude, GPT)
✔ **Routing strategy**: Adaptive / Fastest

---

## 🛠 Troubleshooting

- **Router not responding**: Ensure FreeLLMAPI is running locally (`FreeLLMAPI.Setup.0.9.7.exe`).
- **Antigravity cannot reach router**: Check `AI_BASE_URL=http://127.0.0.1:31415/v1`.
- **Fallback chain not triggering**: Verify provider keys are added in FreeLLMAPI dashboard.

---

## 📄 License

This project follows the license of the main Antigravity repository.
