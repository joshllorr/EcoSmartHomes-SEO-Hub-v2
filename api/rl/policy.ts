import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const workerUrl = process.env.WORKER_URL;
    res.status(200).json({
      ok: true,
      route: 'rl/policy',
      worker: workerUrl || 'internal',
    });
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      error: err.message,
      route: 'rl/policy',
    });
  }
}
