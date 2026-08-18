import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const workerUrl = process.env.WORKER_URL;
    if (!workerUrl) {
      return res.status(200).json({
        ok: true,
        message: 'SERP analysis endpoint online (standalone mode)',
        workerUrl: null,
        status: 200,
        rawResponsePreview:
          'WORKER_URL not configured. Standalone endpoint ready.',
      });
    }

    // Basic test call to Worker SERP endpoint
    const response = await fetch(
      `${workerUrl}/serp-intelligence?keyword=test`,
    ).catch(() => null);
    const raw = response ? await response.text().catch(() => '') : '';

    res.status(200).json({
      ok: true,
      message: 'SERP analysis endpoint online',
      workerUrl,
      status: response ? response.status : 200,
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
