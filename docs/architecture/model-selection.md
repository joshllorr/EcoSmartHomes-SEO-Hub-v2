# Model Selection

Antigravity uses task-based model selection.

## Rules

| Task Type    | Model              | Description                                  |
| ------------ | ------------------ | -------------------------------------------- |
| `code`       | `gemini-3.5-flash` | High-speed code analysis & syntax generation |
| `generation` | `gemini-3.5-flash` | Long-form SEO drafting and structured copy   |
| `reasoning`  | `claude-3-opus`    | Deep analytical planning and complex logic   |
| `analysis`   | `claude-3-opus`    | Strategic BER and compliance evaluations     |
| `fallback`   | `gpt-4-turbo`      | Universal safety fallback candidate          |

Default model: `auto_fastest`
