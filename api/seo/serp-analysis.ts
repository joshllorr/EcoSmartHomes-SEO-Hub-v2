import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const workerUrl = process.env.WORKER_URL;
    if (!workerUrl) {
      throw new Error('WORKER_URL not set in environment variables');
    }

    // Basic test call to Worker SERP endpoint
    const response = await fetch(`${workerUrl}/serp-intelligence?keyword=test`);

    // Read raw text so we avoid JSON parse crashes
    const raw = await response.text();

    res.status(200).json({
      ok: true,
      message: 'SERP analysis endpoint online',
      workerUrl,
      status: response.status,
      rawResponsePreview: raw.slice(0, 300),
    });
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      error: err.message,
      route: 'seo/serp-analysis',
    });
  }
}
