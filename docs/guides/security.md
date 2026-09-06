# Security Guidelines

Best practices for credential management and data safety:

## Core Principles

1. **Never Commit Secrets**:
   - Verify `.env` and `.env.local` are listed in `.gitignore`.
   - Never commit raw API keys or tokens to Git.
2. **Local Loopback Isolation**:
   - The FreeLLMAPI router binds to `127.0.0.1` by default, preventing unauthorized external network access.
3. **Production Cloud Deployments**:
   - In cloud hosting environments like Vercel, define `AI_KEY` through encrypted project environment secrets.
4. **Input Sanitization**:
   - Strip malicious prompt injections and sensitive personal identifiable information (PII) before routing to external LLM providers.
