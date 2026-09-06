/**
 * src/utils/freeLlmApiClient.ts
 *
 * Antigravity × FreeLLMAPI Unified Router Client
 * Provides adaptive model selection, local unified routing, and fallback chains.
 */

export interface FreeLlmApiOptions {
  taskType?: 'code' | 'generation' | 'reasoning' | 'analysis' | 'fallback';
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
}

export class FreeLlmApiClient {
  private baseUrl: string;
  private apiKey: string;
  private modelMap: Record<string, string>;
  private fallbackChain: string[];

  constructor() {
    this.baseUrl = process.env.AI_BASE_URL || 'http://127.0.0.1:31415/v1';
    this.apiKey =
      process.env.AI_KEY ||
      'freellmapi-be532d4667d197dc9ac42d43152197d369dfad7cd0c97fdc';

    this.modelMap = {
      code: 'gemini-3.5-flash',
      generation: 'gemini-3.5-flash',
      reasoning: 'claude-3-opus',
      analysis: 'claude-3-opus',
      fallback: 'gpt-4-turbo',
    };

    this.fallbackChain = [
      'gemini-3.5-flash',
      'claude-3-opus',
      'gpt-4-turbo',
      'auto',
    ];
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public getApiKey(): string {
    return this.apiKey;
  }

  public selectModel(taskType?: string): string {
    if (!taskType) return 'auto';
    return this.modelMap[taskType] || 'auto';
  }

  /**
   * Health check to detect if the local FreeLLMAPI router is up and reachable.
   */
  public async isAvailable(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${this.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        signal: controller.signal,
      });
      clearTimeout(timer);
      return res.status === 200;
    } catch {
      return false;
    }
  }

  /**
   * Dispatches a chat completion prompt through the FreeLLMAPI router.
   */
  public async chat(
    prompt: string,
    options: FreeLlmApiOptions = {},
  ): Promise<string | null> {
    const designated = options.model || this.selectModel(options.taskType);
    const candidates = [designated, ...this.fallbackChain];
    const uniqueCandidates = Array.from(new Set(candidates));

    for (const model of uniqueCandidates) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(
          () => controller.abort(),
          options.timeoutMs || 20000,
        );

        const res = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens,
            stream: false,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (res.ok) {
          const data = (await res.json()) as any;
          const content =
            data?.choices?.[0]?.message?.content ||
            data?.output_text ||
            data?.content;
          if (content) return content;
        }
      } catch {
        // Try next candidate in fallback chain
        continue;
      }
    }

    return null;
  }
}

export const globalFreeLlmApiClient = new FreeLlmApiClient();
