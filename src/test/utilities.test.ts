import { describe, it, expect } from 'vitest';
import { getGeminiClient, callGeminiRESTApi } from './server-test-helper';

describe('getGeminiClient', () => {
  it('returns null when GEMINI_API_KEY is missing', () => {
    const originalKey = process.env.GEMINI_API_KEY;
    const originalViteKey = process.env.VITE_GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.VITE_GEMINI_API_KEY;

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
    else delete process.env.GEMINI_API_KEY;
  });

  it('returns null when GEMINI_API_KEY is YOUR_ prefix', () => {
    const originalKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = 'YOUR_API_KEY_HERE';

    const client = getGeminiClient();
    expect(client).toBeNull();

    if (originalKey !== undefined) process.env.GEMINI_API_KEY = originalKey;
    else delete process.env.GEMINI_API_KEY;
  });

  it('returns null when GEMINI_API_KEY is empty string', () => {
    const originalKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = '';

    const client = getGeminiClient();
    expect(client).toBeNull();

    if (originalKey !== undefined) process.env.GEMINI_API_KEY = originalKey;
    else delete process.env.GEMINI_API_KEY;
  });
});

describe('callGeminiRESTApi', () => {
  it('returns null when GEMINI_API_KEY is missing', async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    const originalViteKey = process.env.VITE_GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.VITE_GEMINI_API_KEY;

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
    else delete process.env.GEMINI_API_KEY;
  });

  it('accepts custom model parameter', async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.VITE_GEMINI_API_KEY;

    const result = await callGeminiRESTApi('test', 'gemini-1.5-pro');
    expect(result).toBeNull();

    if (originalKey !== undefined) process.env.GEMINI_API_KEY = originalKey;
  });
});
