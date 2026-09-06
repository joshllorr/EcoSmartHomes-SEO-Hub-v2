# Frequently Asked Questions (FAQ)

## Why use FreeLLMAPI instead of calling providers directly?

FreeLLMAPI provides unified rate-limiting, instant zero-downtime failover across providers, single-point monitoring, and adaptive latency-optimized model routing.

## Does Antigravity need individual provider keys?

No. Antigravity only requires the single unified key (`AI_KEY`). The router securely manages underlying provider keys locally.

## Can I run without Premium?

Yes, FreeLLMAPI functions in free mode with lower throughput thresholds.

## How does it handle Irish retrofit compliance data?

Prompts sent through the router utilize system prompts grounded in SEAI guidelines, SR 54:2014, and 2026 EPBD 8-step standards.
