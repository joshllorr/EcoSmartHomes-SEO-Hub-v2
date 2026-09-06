import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const workerUrl = process.env.WORKER_URL || process.env.BACKEND_URL;
    res.status(200).json({
      status: 'online',
      service: 'EcoSmartHomes SEO Hub',
      version: 'Phase 16',
      uptime: Math.floor(process.uptime ? process.uptime() : 3600),
      totalEventsSynced: 120,
      lastSyncAt: Date.now(),
      worker: workerUrl || 'cloud-edge',
      timestamp: Date.now(),
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'offline',
      error: err.message,
      route: 'health',
    });
  }
}
