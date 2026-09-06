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

            except Exception as e:
                time.sleep(0.5)
                continue

        return "All models failed — check router or provider keys in FreeLLMAPI dashboard."


if __name__ == "__main__":
    ai = AntigravityAI()
    print("Testing FreeLLMAPI router at", ai.base_url)
    res = ai.run("Explain Antigravity routing.", task_type="analysis")
    print("Response:", res)
