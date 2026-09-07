import type { VercelRequest, VercelResponse } from '@vercel/node';
import { globalAgentDispatchEngine } from '../../src/logic/agents/agentDispatchEngine';
import {
  AGENT_JOB_PRESETS,
  triggerAgentPreset,
} from '../../src/logic/agents/agentJobPresets';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const url = req.url || '';
    const method = req.method || 'GET';

    if (method === 'GET') {
      if (url.includes('/squad') || req.query.action === 'squad') {
        const squad = globalAgentDispatchEngine.getSquadStatus();
        return res.status(200).json({ ok: true, squad });
      }

      if (url.includes('/presets') || req.query.action === 'presets') {
        return res.status(200).json({ ok: true, presets: AGENT_JOB_PRESETS });
      }

      const type = req.query.type as any;
      const status = req.query.status as any;
      const jobs = globalAgentDispatchEngine.getJobs({ type, status });
      return res.status(200).json({ ok: true, jobs, count: jobs.length });
    }

    if (method === 'POST') {
      if (url.includes('/preset') || req.query.action === 'preset') {
        const { presetId, customTitle, overridePayload } = req.body || {};
        if (!presetId) {
          return res.status(400).json({ ok: false, error: 'Missing presetId' });
        }
        const job = await triggerAgentPreset(presetId, {
          customTitle,
          overridePayload,
        });
        return res.status(200).json({ ok: true, job });
      }

      if (url.includes('/consensus') || req.query.action === 'consensus') {
        const { job } = req.body || {};
        const consensus = globalAgentDispatchEngine.evaluateConsensus(
          job || { type: 'editorial' },
        );
        return res.status(200).json({ ok: true, consensus });
      }

      // Default dispatch
      const { type, payload, title, priority } = req.body || {};
      if (!type) {
        return res.status(400).json({ ok: false, error: 'Missing agent type' });
      }
      const job = await globalAgentDispatchEngine.dispatchJob(
        type,
        payload || {},
        {
          title,
          priority,
        },
      );
      return res.status(200).json({ ok: true, job });
    }

    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  } catch (err: any) {
    return res
      .status(500)
      .json({ ok: false, error: err.message || 'Internal Server Error' });
  }
}
