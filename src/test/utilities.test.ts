import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getGeminiClient, callGeminiRESTApi } from './server-test-helper';

const savedEnv = { ...process.env };

beforeEach(() => {
  delete (process.env as any).GEMINI_ACCESS_TOKEN;
  delete (process.env as any).GEMINI_API_KEY;
  delete (process.env as any).VITE_GEMINI_API_KEY;
  delete (process.env as any).GOOGLE_CLOUD_PROJECT;
  delete (process.env as any).GOOGLE_GENAI_USE_VERTEXAI;
  delete (process.env as any).GOOGLE_GENAI_USE_ENTERPRISE;
});

describe('getGeminiClient', () => {
  it('returns null when GEMINI_API_KEY is missing and no Vertex project configured', () => {
    delete (process.env as any).GEMINI_API_KEY;
    delete (process.env as any).VITE_GEMINI_API_KEY;
    delete (process.env as any).GEMINI_ACCESS_TOKEN;
    delete (process.env as any).GOOGLE_CLOUD_PROJECT;
    delete (process.env as any).GOOGLE_GENAI_USE_VERTEXAI;

    const client = getGeminiClient();
    expect(client).toBeNull();
  });

  it('returns null when GEMINI_API_KEY is placeholder value and no Vertex project configured', () => {
    delete (process.env as any).GEMINI_ACCESS_TOKEN;
    delete (process.env as any).GOOGLE_CLOUD_PROJECT;
    delete (process.env as any).GOOGLE_GENAI_USE_VERTEXAI;
    process.env.GEMINI_API_KEY = 'MY_GEMINI_API_KEY';

    const client = getGeminiClient();
    expect(client).toBeNull();
  });

  it('returns null when GEMINI_API_KEY is YOUR_ prefix and no Vertex project configured', () => {
    delete (process.env as any).GEMINI_ACCESS_TOKEN;
    delete (process.env as any).GOOGLE_CLOUD_PROJECT;
    delete (process.env as any).GOOGLE_GENAI_USE_VERTEXAI;
    process.env.GEMINI_API_KEY = 'YOUR_API_KEY_HERE';

    const client = getGeminiClient();
    expect(client).toBeNull();
  });

  it('returns null when GEMINI_API_KEY is empty string and no Vertex project configured', () => {
    delete (process.env as any).GEMINI_ACCESS_TOKEN;
    delete (process.env as any).GOOGLE_CLOUD_PROJECT;
    delete (process.env as any).GOOGLE_GENAI_USE_VERTEXAI;
    process.env.GEMINI_API_KEY = '';

    const client = getGeminiClient();
    expect(client).toBeNull();
  });

  it('initializes Vertex AI client when GOOGLE_CLOUD_PROJECT is set', () => {
    process.env.GOOGLE_CLOUD_PROJECT = 'gen-lang-client-0607449072';
    process.env.GOOGLE_CLOUD_LOCATION = 'us-central1';
    process.env.GOOGLE_GENAI_USE_VERTEXAI = 'true';

    const client = getGeminiClient();
    expect(client).not.toBeNull();
  });
});

describe('callGeminiRESTApi', () => {
  it('returns null when credentials are missing', async () => {
    delete (process.env as any).GEMINI_API_KEY;
    delete (process.env as any).VITE_GEMINI_API_KEY;
    delete (process.env as any).GEMINI_ACCESS_TOKEN;
    delete (process.env as any).GOOGLE_CLOUD_PROJECT;
    delete (process.env as any).GOOGLE_GENAI_USE_VERTEXAI;

    const result = await callGeminiRESTApi('test prompt');
    expect(result).toBeNull();
  });

  it('returns null when GEMINI_API_KEY is placeholder', async () => {
    delete (process.env as any).GOOGLE_CLOUD_PROJECT;
    delete (process.env as any).GOOGLE_GENAI_USE_VERTEXAI;
    process.env.GEMINI_API_KEY = 'placeholder';

    const result = await callGeminiRESTApi('test prompt', 'gemini-3.7-flash');
    expect(result).toBeNull();
  });

  it('accepts custom model parameter', async () => {
    delete (process.env as any).GEMINI_API_KEY;
    delete (process.env as any).VITE_GEMINI_API_KEY;
    delete (process.env as any).GOOGLE_CLOUD_PROJECT;
    delete (process.env as any).GOOGLE_GENAI_USE_VERTEXAI;

    const result = await callGeminiRESTApi('test', 'gemini-1.5-pro');
    expect(result).toBeNull();
  });
});
