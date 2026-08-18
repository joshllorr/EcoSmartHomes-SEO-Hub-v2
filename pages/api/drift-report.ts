import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  detectPhaseDrift,
  autoRepairDrift,
} from '../../src/logic/phaseDriftDetector';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'POST') {
      const result = autoRepairDrift();
      return res.status(200).json({
        ok: true,
        success: true,
        result,
      });
    }

    const report = detectPhaseDrift();
    return res.status(200).json({
      ok: true,
      success: true,
      report,
    });
  } catch (err: any) {
    return res
      .status(500)
      .json({ ok: false, error: err.message || 'Internal Server Error' });
  }
}
