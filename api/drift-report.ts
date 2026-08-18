import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const workerUrl = process.env.WORKER_URL;

    const response = await fetch(`${workerUrl}/drift-report`);
    const data = await response.json().catch(() => null);

    res.status(200).json({
      ok: true,
      source: 'drift-report',
      worker: workerUrl,
      data,
    });
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      error: err.message,
      route: 'drift-report',
    });
  }
}
