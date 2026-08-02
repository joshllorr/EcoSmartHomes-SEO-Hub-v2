declare module '*.css' {
  const content: Record<string, string>;
  export default content;
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
