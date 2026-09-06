import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FreeLlmApiClient, globalFreeLlmApiClient } from '../freeLlmApiClient';

describe('FreeLlmApiClient — Antigravity × FreeLLMAPI Integration', () => {
  let client: FreeLlmApiClient;

  beforeEach(() => {
    client = new FreeLlmApiClient();
  });

  it('initializes with default router url and unified API key', () => {
    expect(client.getBaseUrl()).toBe('http://127.0.0.1:31415/v1');
    expect(client.getApiKey()).toBe(
      'freellmapi-be532d4667d197dc9ac42d43152197d369dfad7cd0c97fdc',
    );
  });

  it('selects appropriate models for task types according to handover specification', () => {
    expect(client.selectModel('code')).toBe('gemini-3.5-flash');
    expect(client.selectModel('generation')).toBe('gemini-3.5-flash');
    expect(client.selectModel('reasoning')).toBe('claude-3-opus');
    expect(client.selectModel('analysis')).toBe('claude-3-opus');
    expect(client.selectModel('fallback')).toBe('gpt-4-turbo');
    expect(client.selectModel()).toBe('auto');
  });

  it('detects router reachability when endpoint responds', async () => {
    // Mock global fetch to test isAvailable
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: async () => ({ data: [] }),
    } as any);

    const available = await client.isAvailable();
    expect(available).toBe(true);
    expect(fetchSpy).toHaveBeenCalledWith(
      'http://127.0.0.1:31415/v1/models',
      expect.objectContaining({
        headers: {
          Authorization:
            'Bearer freellmapi-be532d4667d197dc9ac42d43152197d369dfad7cd0c97fdc',
        },
      }),
    );
    fetchSpy.mockRestore();
  });

  it('dispatches prompt and parses chat completion choice content', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'BER A0 retrofit plan approved.' } }],
      }),
    } as any);

    const result = await client.chat('Analyze retrofit viability', {
      taskType: 'analysis',
    });
    expect(result).toBe('BER A0 retrofit plan approved.');
    fetchSpy.mockRestore();
  });

  it('tries fallback chain if initial model returns an error', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        status: 500,
        ok: false,
      } as any)
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Fallback response from Claude.' } }],
        }),
      } as any);

    const result = await client.chat('Explain heat pump coefficient', {
      taskType: 'reasoning',
    });
    expect(result).toBe('Fallback response from Claude.');
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    fetchSpy.mockRestore();
  });

  it('exposes global singleton instance', () => {
    expect(globalFreeLlmApiClient).toBeInstanceOf(FreeLlmApiClient);
  });
});
