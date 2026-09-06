# Performance Tuning

Tips for maximizing speed and reliability with Antigravity × FreeLLMAPI:

## 1. Use Adaptive Routing Mode

Set `AI_ROUTING=adaptive` in `.env` and `routing.mode: adaptive` in `antigravity.yaml`. This dynamically measures token throughput and latency per model.

## 2. Leverage Fallback Chains

Ensure at least two distinct providers are active in the router dashboard. This eliminates cold-start waiting when one provider is throttled.

## 3. Tune Timeouts

Set `timeout_ms: 20000` for general generation tasks. For heavy multi-agent simulations or long code audits, extend up to `45000`.

## 4. Optimize Context Windows

Trim excessive historical chat turns in client payloads before dispatching to keep token usage within the fastest context bracket.
