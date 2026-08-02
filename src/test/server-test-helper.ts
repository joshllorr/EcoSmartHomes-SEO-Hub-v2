process.env.NODE_ENV = 'production';
process.env.VERCEL = '1';

const serverModule = await import('@/server.ts');
export const app = serverModule.default;
export const { getGeminiClient, callGeminiRESTApi } = serverModule;
