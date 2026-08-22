import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    return res.status(200).json({
      ok: true,
      service: 'EcoSmartHomes SEO Hub API Gateway',
      version: '0.0.0-phase49-unified',
      status: 'online',
      endpoints: [
        '/api/serp-intelligence',
        '/api/automation-logs',
        '/api/drift-report',
        '/api/predictive/dashboard',
        '/api/keywords',
        '/api/infrastructure/health',
      ],
      timestamp: Date.now(),
    });
  } catch (err: any) {
    return res
      .status(500)
      .json({ ok: false, error: err.message || 'Internal Server Error' });
  }
}
