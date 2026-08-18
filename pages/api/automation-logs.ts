import type { VercelRequest, VercelResponse } from '@vercel/node';
import { globalAutomationEngine } from '../../src/logic/automationEngine';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const limit = req.query?.limit ? Number(req.query.limit) : 50;
    const logs = globalAutomationEngine.getLogs(limit);
    return res.status(200).json({
      ok: true,
      success: true,
      logs,
      total: logs.length,
    });
  } catch (err: any) {
    return res
      .status(500)
      .json({ ok: false, error: err.message || 'Internal Server Error' });
  }
}
