/**
 * src/utils/freeLlmApiClient.ts
 *
 * FreeLLMAPI Unified Router Client for EcoSmartHomes SEO Hub
 *
 * Connects to the local/remote FreeLLMAPI proxy (default: http://127.0.0.1:31415/v1)
 * providing resilient multi-provider LLM routing (Groq, Mistral, OpenRouter, etc.)
 * with automatic fallback chains and JSON extraction.
 */

export interface FreeLlmApiOptions {
  taskType?:
    | 'seo-keyword'
    | 'seo-serp'
    | 'seo-article'
    | 'title-meta'
    | 'code'
    | 'reasoning'
    | 'general';
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
    this.baseUrl =
      process.env.AI_BASE_URL ||
      process.env.VITE_AI_BASE_URL ||
      'http://127.0.0.1:31415/v1';
    this.apiKey =
      process.env.AI_KEY ||
      process.env.VITE_AI_KEY ||
      'freellmapi-be532d4667d197dc9ac42d43152197d369dfad7cd0c97fdc';

    // Tailored defaults mapping to validated high-availability models
    this.modelMap = {
      'seo-keyword': 'free-router',
      'seo-serp': 'free-router',
      'seo-article': 'free-router',
      'title-meta': 'free-router',
      code: 'codestral',
      reasoning: 'free-router',
      general: 'auto',
    };

    // Resilient fallback order across healthy proxy providers
    this.fallbackChain = ['free-router', 'codestral', 'auto'];
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public getApiKey(): string {
    return this.apiKey;
  }

  public selectModel(taskType?: string): string {
    if (!taskType) return 'free-router';
    return this.modelMap[taskType] || 'free-router';
  }

  /**
   * Health check to quickly detect if the FreeLLMAPI proxy is reachable.
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
   * Dispatches a chat completion prompt through FreeLLMAPI with model failover.
   */
  public async chat(
    prompt: string,
    options: FreeLlmApiOptions = {},
  ): Promise<{ content: string | null; modelUsed?: string }> {
    const designated = options.model || this.selectModel(options.taskType);
    const candidateModels = Array.from(
      new Set([designated, ...this.fallbackChain]),
    );

    for (const model of candidateModels) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(
          () => controller.abort(),
          options.timeoutMs || 12000,
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
            max_tokens: options.maxTokens ?? 2500,
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
          if (content && typeof content === 'string' && content.trim()) {
            return { content: content.trim(), modelUsed: model };
          }
        }
      } catch {
        // Fail over to next model in chain
        continue;
      }
    }

    return { content: null };
  }
}

export const globalFreeLlmApiClient = new FreeLlmApiClient();
