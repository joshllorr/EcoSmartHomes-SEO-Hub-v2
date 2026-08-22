/// <reference types="vite/client" />

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

interface ImportMetaEnv {
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_COMMIT_SHA?: string;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  glob<T = Record<string, unknown>>(
    pattern: string,
    options?: {
      eager?: boolean;
      import?: string;
      query?: string | Record<string, string | number | boolean>;
    },
  ): Record<string, T>;
}

declare module '../server.ts' {
  import { Express } from 'express';
  const app: Express;
  export default app;
  export function getGeminiClient(): import('@google/genai').GoogleGenAI | null;
  export function callGeminiRESTApi(
    prompt: string,
    model?: string,
    jsonSchema?: Record<string, unknown>,
  ): Promise<string | null>;
}
