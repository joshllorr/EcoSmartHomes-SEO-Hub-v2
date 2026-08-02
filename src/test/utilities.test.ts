import { describe, it, expect, vi } from 'vitest';
import { getGeminiClient, callGeminiRESTApi } from './server-test-helper';

describe('getGeminiClient', () => {
  it('returns null when GEMINI_API_KEY is missing', () => {
    const originalKey = process.env.GEMINI_API_KEY;
    const originalViteKey = process.env.VITE_GEMINI_API_KEY;
    delete (process.env as any).GEMINI_API_KEY;
    delete (process.env as any).VITE_GEMINI_API_KEY;

    const client = getGeminiClient();
    expect(client).toBeNull();

    if (originalKey !== undefined) process.env.GEMINI_API_KEY = originalKey;
    if (originalViteKey !== undefined)
      process.env.VITE_GEMINI_API_KEY = originalViteKey;
  });

  it('returns null when GEMINI_API_KEY is placeholder value', () => {
    const originalKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = 'MY_GEMINI_API_KEY';

    const client = getGeminiClient();
    expect(client).toBeNull();

    if (originalKey !== undefined) process.env.GEMINI_API_KEY = originalKey;
    else delete (process.env as any).GEMINI_API_KEY;
  });

  it('returns null when GEMINI_API_KEY is YOUR_ prefix', () => {
    const originalKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = 'YOUR_API_KEY_HERE';

    const client = getGeminiClient();
    expect(client).toBeNull();

    if (originalKey !== undefined) process.env.GEMINI_API_KEY = originalKey;
    else delete (process.env as any).GEMINI_API_KEY;
  });

  it('returns null when GEMINI_API_KEY is empty string', () => {
    const originalKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = '';

    const client = getGeminiClient();
    expect(client).toBeNull();

    if (originalKey !== undefined) process.env.GEMINI_API_KEY = originalKey;
    else delete (process.env as any).GEMINI_API_KEY;
  });
});

describe('callGeminiRESTApi', () => {
  it('returns null when GEMINI_API_KEY is missing', async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    const originalViteKey = process.env.VITE_GEMINI_API_KEY;
    delete (process.env as any).GEMINI_API_KEY;
    delete (process.env as any).VITE_GEMINI_API_KEY;

    const result = await callGeminiRESTApi('test prompt');
    expect(result).toBeNull();

    if (originalKey !== undefined) process.env.GEMINI_API_KEY = originalKey;
    if (originalViteKey !== undefined)
      process.env.VITE_GEMINI_API_KEY = originalViteKey;
  });

  it('returns null when GEMINI_API_KEY is placeholder', async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = 'placeholder';

    const result = await callGeminiRESTApi('test prompt', 'gemini-2.5-flash');
    expect(result).toBeNull();

    if (originalKey !== undefined) process.env.GEMINI_API_KEY = originalKey;
    else delete (process.env as any).GEMINI_API_KEY;
  });

  it('accepts custom model parameter', async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    delete (process.env as any).GEMINI_API_KEY;
    delete (process.env as any).VITE_GEMINI_API_KEY;

    const result = await callGeminiRESTApi('test', 'gemini-1.5-pro');
    expect(result).toBeNull();

    if (originalKey !== undefined) process.env.GEMINI_API_KEY = originalKey;
  });

  it('calls Gemini API with correct endpoint and body when key is present', async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = 'test-api-key';

    const mockJson = {
      candidates: [{ content: { parts: [{ text: 'mocked response' }] } }],
    };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockJson),
    });
    global.fetch = mockFetch;

    const result = await callGeminiRESTApi('test prompt', 'gemini-2.5-flash');
    expect(result).toBe('mocked response');
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const calledUrl = mockFetch.mock.calls[0][0];
    expect(calledUrl).toBe(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=test-api-key',
    );
    const calledOptions = mockFetch.mock.calls[0][1];
    expect(calledOptions.method).toBe('POST');
    expect(calledOptions.headers['Content-Type']).toBe('application/json');
    const body = JSON.parse(calledOptions.body);
    expect(body.contents).toEqual([{ parts: [{ text: 'test prompt' }] }]);

    if (originalKey !== undefined) process.env.GEMINI_API_KEY = originalKey;
    else delete (process.env as any).GEMINI_API_KEY;
    delete (global as any).fetch;
  });

  it('sends jsonSchema in generationConfig when provided', async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = 'test-api-key';

    const mockJson = {
      candidates: [{ content: { parts: [{ text: 'mocked response' }] } }],
    };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockJson),
    });
    global.fetch = mockFetch;

    const schema = {
      type: 'object',
      properties: { keyword: { type: 'string' } },
    };
    const result = await callGeminiRESTApi(
      'test prompt',
      'gemini-2.5-flash',
      schema,
    );
    expect(result).toBe('mocked response');
    const calledOptions = mockFetch.mock.calls[0][1];
    const body = JSON.parse(calledOptions.body);
    expect(body.generationConfig).toEqual({
      responseMimeType: 'application/json',
      responseSchema: schema,
    });

    if (originalKey !== undefined) process.env.GEMINI_API_KEY = originalKey;
    else delete (process.env as any).GEMINI_API_KEY;
    delete (global as any).fetch;
  });
});
