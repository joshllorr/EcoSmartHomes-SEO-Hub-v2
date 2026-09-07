import type { NextApiRequest, NextApiResponse } from 'next';

const SERVER_START_TIME = Date.now();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const workerUrl = process.env.WORKER_URL;
    const uptime = Math.floor((Date.now() - SERVER_START_TIME) / 1000);
    res.status(200).json({
      ok: true,
      status: 'online',
      service: 'EcoSmartHomes Local Hub',
      version: 'Phase 16',
      uptime,
      totalEventsSynced: 0,
      lastSyncAt: null,
      worker: workerUrl || 'internal',
      timestamp: Date.now(),
      dependencies: {
        gemini: Boolean(
          process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY,
        ),
        sentry: Boolean(process.env.SENTRY_DSN),
        freellmapi: Boolean(process.env.AI_KEY || process.env.AI_BASE_URL),
      },
    });
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      error: err.message,
      route: 'health',
    });
  }
}
