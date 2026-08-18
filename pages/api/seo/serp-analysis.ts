import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const workerUrl = process.env.WORKER_URL;
    if (!workerUrl) throw new Error('WORKER_URL not set');

    const response = await fetch(`${workerUrl}/serp-intelligence?keyword=test`);
    const text = await response.text();

    res.status(200).json({
      ok: true,
      message: 'SERP analysis endpoint online',
      workerUrl,
      rawResponse: text.slice(0, 200), // preview first 200 chars
    });
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      error: err.message,
      route: 'seo/serp-analysis',
    });
  }
}
