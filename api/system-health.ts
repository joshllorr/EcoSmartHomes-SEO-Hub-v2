import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const workerUrl = process.env.WORKER_URL;
    res.status(200).json({
      ok: true,
      status: 'operational',
      system: 'SEO Intelligence Hub',
      version: '1.0.0',
      uptime: process.uptime ? process.uptime() : 1000,
      worker: workerUrl || 'internal',
      timestamp: Date.now(),
    });
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      error: err.message,
      route: 'system-health',
    });
  }
}
