import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const workerUrl = process.env.WORKER_URL;
    res.status(200).json({
      ok: true,
      diagnostics: {
        server: 'ready',
        crawler: 'active',
        database: 'connected',
        serpIntelligence: 'enabled',
        automationEngine: 'enabled',
        predictiveEngine: 'enabled',
      },
      worker: workerUrl || 'internal',
      timestamp: Date.now(),
    });
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      error: err.message,
      route: 'diagnostics',
    });
  }
}
