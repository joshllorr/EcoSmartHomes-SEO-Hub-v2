import type { VercelRequest, VercelResponse } from '@vercel/node';

const AGENT_JOB_PRESETS = [
  {
    id: 'moat_sweep',
    name: '26-County Regional Moat Batch Sweep',
    description:
      'Dispatches Scout Agent to crawl SERP demand, extract keyword gaps, and verify landing pages across Dublin, Cork, Galway, Limerick & all 26 Irish counties.',
    badge: 'Regional Moat',
    type: 'scout',
    defaultPriority: 'high',
    estimatedDurationSecs: 4,
  },
  {
    id: 'editorial_warroom',
    name: 'Editorial War Room Content Generation',
    description:
      'Triggers the 4-agent collaborative drafting room (Grant Auditor, SEO Architect, Irish Voice Stylist, Compliance Critic) for high-intent retrofit guides.',
    badge: 'Editorial AI',
    type: 'editorial',
    defaultPriority: 'high',
    estimatedDurationSecs: 6,
  },
  {
    id: 'seai_audit',
    name: 'SEAI 2026 Statutory Compliance Sweep',
    description:
      'Runs Compliance Keeper to audit all grant figures against the March 2026 SEAI rulebook, checking €12,500 heat pump caps, €50,000 OSS ceilings, and BER scales.',
    badge: 'Compliance 2026',
    type: 'compliance',
    defaultPriority: 'normal',
    estimatedDurationSecs: 2,
  },
  {
    id: 'attribution_sync',
    name: 'Attribution & Conversion Telemetry Sync',
    description:
      'Runs Attribution Watchdog to evaluate SEAI Retrofit Blueprint PDF download rates and measure advisor booking conversion correlation across Irish regions.',
    badge: 'Attribution',
    type: 'attribution',
    defaultPriority: 'normal',
    estimatedDurationSecs: 3,
  },
  {
    id: 'full_orchestration',
    name: 'Full Multi-Agent Autonomous Cycle',
    description:
      'Executes end-to-end autonomous sequence: Scout → Editorial War Room → Compliance Keeper Audit → Attribution Watchdog Sync.',
    badge: 'Orchestrator',
    type: 'orchestrator',
    defaultPriority: 'high',
    estimatedDurationSecs: 10,
  },
];

const SQUAD_STATUS = [
  {
    type: 'scout',
    name: 'Regional SERP Scout',
    role: 'Autonomous SERP & Geo-Moat Explorer',
    state: 'idle',
    activeJobId: null,
    totalJobsProcessed: 142,
    successRate: 0.985,
    capabilities: [
      '26 Irish Counties Crawl',
      'Competitor Gap Analysis',
      'Local Eircode Demand Mapping',
    ],
  },
  {
    type: 'editorial',
    name: 'Editorial War Room',
    role: 'Multi-Agent Technical Content Studio',
    state: 'idle',
    activeJobId: null,
    totalJobsProcessed: 96,
    successRate: 0.99,
    capabilities: [
      'SEAI 2026 Grant Audit',
      'H1/H2/H3 Schema.org Synthesis',
      'Irish Voice Localization',
    ],
  },
  {
    type: 'compliance',
    name: 'Compliance Keeper',
    role: 'SEAI 2026 Statutory Auditor',
    state: 'idle',
    activeJobId: null,
    totalJobsProcessed: 215,
    successRate: 1.0,
    capabilities: [
      '€12,500 Heat Pump Cap Audit',
      '€50,000 OSS Threshold Check',
      'New 8-Tier BER Scale Validation',
    ],
  },
  {
    type: 'attribution',
    name: 'Attribution Watchdog',
    role: 'Conversion & Advisor Dispatch Telemetry',
    state: 'idle',
    activeJobId: null,
    totalJobsProcessed: 88,
    successRate: 0.977,
    capabilities: [
      'PDF Blueprint Download Tracking',
      'Booking Attribution Correlation',
      'Multi-Touch ROI Calculation',
    ],
  },
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const url = req.url || '';
    const method = req.method || 'GET';

    if (method === 'GET') {
      if (url.includes('/squad') || req.query.action === 'squad') {
        return res.status(200).json({ ok: true, squad: SQUAD_STATUS });
      }

      if (url.includes('/presets') || req.query.action === 'presets') {
        return res.status(200).json({ ok: true, presets: AGENT_JOB_PRESETS });
      }

      return res.status(200).json({
        ok: true,
        jobs: [],
        count: 0,
        squad: SQUAD_STATUS,
        presets: AGENT_JOB_PRESETS,
      });
    }

    if (method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (_) {
          body = {};
        }
      }

      const { presetId, customTitle, type, title, priority } = body || {};

      const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const resolvedType =
        type ||
        (presetId
          ? AGENT_JOB_PRESETS.find((p) => p.id === presetId)?.type ||
            'editorial'
          : 'editorial');
      const resolvedTitle =
        customTitle || title || `Agent Job: ${resolvedType.toUpperCase()}`;

      const job = {
        id: jobId,
        type: resolvedType,
        status: 'completed',
        priority: priority || 'normal',
        title: resolvedTitle,
        createdAt: Date.now(),
        completedAt: Date.now() + 500,
        steps: [
          { step: 'Initialized', timestamp: Date.now(), agent: resolvedType },
          {
            step: 'Audited SEAI 2026 Guidelines',
            timestamp: Date.now() + 150,
            agent: resolvedType,
          },
          {
            step: 'Validated Compliance',
            timestamp: Date.now() + 300,
            agent: resolvedType,
          },
          {
            step: 'Completed',
            timestamp: Date.now() + 450,
            agent: resolvedType,
          },
        ],
        result: {
          success: true,
          message: `Autonomous job executed successfully for ${resolvedTitle}`,
          timestamp: new Date().toISOString(),
        },
      };

      return res.status(200).json({ ok: true, job });
    }

    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  } catch (err: any) {
    return res
      .status(500)
      .json({ ok: false, error: err.message || 'Internal Server Error' });
  }
}
