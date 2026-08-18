import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    // Proxy to Worker or internal logic
    const workerUrl = process.env.WORKER_URL;
    const keyword = req.query.keyword || req.body?.keyword || 'default';

    const response = await fetch(
      `${workerUrl}/serp-intelligence?keyword=${keyword}`,
    );
    const data = await response.json().catch(() => null);

    res.status(200).json({
      ok: true,
      source: 'serp-intelligence',
      keyword,
      worker: workerUrl,
      data,
    });
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      error: err.message,
      route: 'serp-intelligence',
    });
  }
}
