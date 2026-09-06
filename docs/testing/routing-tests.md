# Routing Tests

Tests verifying adaptive routing dynamics:

## Covered Scenarios

1. **Speed Metric Verification**:
   - Ensures lightweight models (`gemini-3.5-flash`) are picked for simple copy and code.

2. **Reasoning Complexity**:
   - Asserts complex architectural or compliance prompts route to `claude-3-opus`.

3. **Fallback Ordering**:
   - Validates that errors cascade sequentially without prematurely throwing unhandled exceptions.
