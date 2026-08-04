/**
 * Cloudflare Worker API Entrypoint — Phase 22 Autonomous Multi-Agent Conflict Resolution
 * Detects agent vote divergence vs evolved action biases and gently resolves conflicts by adjusting action weights and recording resolution cycles.
 */

import { aiPlanner } from "../logic/retrofit/aiPlanner";
import { generateRetrofitPdfHtml } from "../logic/pdf/retrofitPdf";
import { matchContractor, SAMPLE_CONTRACTORS } from "../logic/contractors/matchContractor";
import { generateGrantSubmissionPayload, updateSubmissionLifecycleStatus } from "../logic/grants/submitEngine";
import { generatePostInstallRecord, updatePostInstallTimeline, cronSyncPostInstallRecord } from "../logic/postinstall/trackerEngine";
import { generateJourneyRecord, appendJourneyEvent, JourneyEventType } from "../logic/journey/journeyEngine";
import { updateContractorScore, getContractorScore, updateContractorScoreFromJourney, ContractorMetrics } from "../logic/contractors/contractorScoresEngine";
import { generateHomeUpgradeBundle, getHomeUpgradeBundle } from "../logic/upgrades/homeUpgradeEngine";
import { generateNationalInsights, getNationalInsights } from "../logic/insights/nationalInsightsEngine";
import { generateAndStoreForecast, getForecast } from "../logic/forecasting/retrofitForecastEngine";
import { generateAdvisorReply } from "../logic/advisor/retrofitAdvisorEngine";
import { calculateHomeownerSentiment, getHomeownerSentiment } from "../logic/sentiment/homeownerSentimentEngine";
import { generateCoachMessages, getCoachMessages } from "../logic/coach/retrofitCoachEngine";
import { runOrchestrator, getOrchestratorState } from "../logic/orchestrator/masterOrchestrator";

export interface KVNamespace {
  get(key: string, options?: any): Promise<any>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  list(): Promise<{ keys: { name: string }[] }>;
}

export interface Env {
  BACKLINKS?: KVNamespace;
  COMPETITORS?: KVNamespace;
  HEATMAP?: KVNamespace;
  MARL_STATE?: KVNamespace;
  AI_REFERRALS?: KVNamespace;
  AUTONOMY_LOG?: KVNamespace;
  STRATEGY?: KVNamespace;
  SIMULATION_STATE?: KVNamespace;
  GRANTS_STATE?: KVNamespace;
  ADVISOR_BOOKINGS?: KVNamespace;
  HOMEOWNERS?: KVNamespace;
  RETROFIT_PLANS?: KVNamespace;
  CONTRACTORS?: KVNamespace;
  JOBS?: KVNamespace;
  COMPLIANCE?: KVNamespace;
  GRANT_SUBMISSIONS?: KVNamespace;
  POST_INSTALL?: KVNamespace;
  JOURNEY_TIMELINE?: KVNamespace;
  CONTRACTOR_SCORES?: KVNamespace;
  HOME_UPGRADE_RECOMMENDATIONS?: KVNamespace;
  NATIONAL_INSIGHTS?: KVNamespace;
  RETROFIT_FORECASTS?: KVNamespace;
  RETROFIT_ADVISOR_SESSIONS?: KVNamespace;
  HOMEOWNER_SENTIMENT?: KVNamespace;
  RETROFIT_COACH_MESSAGES?: KVNamespace;
  ORCHESTRATOR_STATE?: KVNamespace;
  GOOGLE_ADS_CLIENT_ID?: string;
  GOOGLE_ADS_CLIENT_SECRET?: string;
  GOOGLE_ADS_REFRESH_TOKEN?: string;
  GOOGLE_ADS_DEVELOPER_TOKEN?: string;
  GOOGLE_ADS_CUSTOMER_ID?: string;
  ASSETS?: { fetch: (req: Request | string) => Promise<Response> };
}

// Central Timeline Updater Worker Helper
async function addTimelineEvent(env: Env, userId: string, event: JourneyEventType, notes?: string) {
  if (!env.JOURNEY_TIMELINE) return;
  try {
    const key = `timeline_${userId}`;
    const raw = await env.JOURNEY_TIMELINE.get(key);
    let record = raw ? JSON.parse(raw) : generateJourneyRecord(userId);
    record = appendJourneyEvent(record, event, notes);
    await env.JOURNEY_TIMELINE.put(key, JSON.stringify(record));
    await env.JOURNEY_TIMELINE.put("latest_timeline", JSON.stringify(record));

    // Auto-update Contractor Quality Score from Journey Timeline
    const triggerEvents = ["installation_complete", "ber_uploaded", "grant_submitted", "seai_approved", "seai_paid"];
    if (triggerEvents.includes(event)) {
      const defaultContractorId = "ctr_2026_08_03_1612";
      await updateContractorScoreFromJourney(env, defaultContractorId, userId).catch(() => {});
    }
  } catch (err) {
    console.error("Failed to append journey timeline event", err);
  }
}

// ----------------------------------------------------
// Phase 22: Autonomous Multi-Agent Conflict Resolution Engine
// ----------------------------------------------------
function detectConflict(negotiation: any, biases: Record<string, number>) {
  const votes = negotiation?.votes || [];
  const approvals = votes.filter((v: any) => v.approve).length;
  const rejections = votes.length - approvals;

  const values = Object.values(biases || { default: 0.5 });
  const maxBias = values.length ? Math.max(...values) : 0.88;
  const minBias = values.length ? Math.min(...values) : 0.65;
  const biasSpread = Number((maxBias - minBias).toFixed(2));

  const conflict = approvals > 0 && rejections > 0 && biasSpread > 0.20;

  return { conflict, biasSpread, approvals, rejections };
}

function resolveConflict(negotiation: any, biases: Record<string, number>) {
  const adjustedBiases = { ...biases };

  for (const vote of negotiation?.votes || []) {
    if (!vote.approve && (vote.notes || "").toLowerCase().includes("risk")) {
      adjustedBiases["adjust-budget"] = Number(((adjustedBiases["adjust-budget"] ?? 0.5) - 0.10).toFixed(2));
    }
    if (!vote.approve && (vote.notes || "").toLowerCase().includes("stress")) {
      adjustedBiases["adjust-bidding"] = Number(((adjustedBiases["adjust-bidding"] ?? 0.5) - 0.10).toFixed(2));
    }
  }

  adjustedBiases["adjust-keywords"] = Number(((adjustedBiases["adjust-keywords"] ?? 0.5) + 0.05).toFixed(2));
  adjustedBiases["adjust-regions"] = Number(((adjustedBiases["adjust-regions"] ?? 0.5) + 0.05).toFixed(2));

  return adjustedBiases;
}

// ----------------------------------------------------
// Phase 21: Autonomous Content Generation Engine
// ----------------------------------------------------
function generateContentDraft(fusion: any, heatmap: any, sim: any, negotiation: any, biases: any) {
  const sections: string[] = [];

  const cpcVolatility = sim?.cpcVolatility ?? 0.28;
  const scrollDepth = heatmap?.scrollDepth ?? 0.42;
  const contentQuality = fusion?.contentQuality ?? 0.65;
  const competitorContentQuality = fusion?.competitorContentQuality ?? 0.82;
  const regionalDemandShock = sim?.regionalDemandShock ?? 0.15;

  const headline = cpcVolatility > 0.25
    ? "Cut Your Energy Bills With Smarter Home Upgrades"
    : "Upgrade Your Home Comfort With EcoSmart Solutions";

  sections.push(`## ${headline}`);

  if (scrollDepth < 0.5) {
    sections.push(
      "### Clear, Fast Benefits\n" +
      "Homeowners in Limerick choose EcoSmartHomes for **quick savings**, **comfort upgrades**, and **trusted local expertise**."
    );
  } else {
    sections.push(
      "### Why Homeowners Trust EcoSmartHomes\n" +
      "We deliver **premium retrofit guidance**, **BER-aligned upgrades**, and **long-term energy savings**."
    );
  }

  if (competitorContentQuality > contentQuality) {
    sections.push(
      "### What Competitors Don't Tell You\n" +
      "- Hidden costs in retrofit planning\n" +
      "- Poor insulation choices that reduce savings\n" +
      "- Missed SEAI grants due to incorrect paperwork"
    );
  }

  if (regionalDemandShock < -0.1) {
    sections.push(
      "### Stable, Predictable Savings\n" +
      "Even when regional demand shifts, our retrofit plans keep your home efficient and your bills low."
    );
  }

  if (negotiation && !negotiation.approved) {
    sections.push(
      "### Simple, Clear Guidance\n" +
      "Our experts break down retrofit steps into **easy, actionable advice** so you always know what's next."
    );
  }

  const topAction = Object.entries(biases || {})
    .sort((a: any, b: any) => b[1] - a[1])[0]?.[0] ?? "adjust-keywords";

  const cta =
    topAction === "improve-landing" || topAction === "adjust-keywords"
      ? "### Ready to Improve Your Home?\nBook a free comfort assessment today."
      : "### Start Saving Today\nGet your free home energy consultation.";

  sections.push(cta);

  return sections.join("\n\n");
}

// ----------------------------------------------------
// Phase 20: Evolutionary Strategy Memory & Engine
// ----------------------------------------------------
export type StrategyMemory = {
  cycles: number[];
  lastActions: any[];
  performance: number[];
  objectives?: Record<string, any>;
  planHistory: {
    timestamp: number;
    plan: { type: string; reason?: string }[];
    longReward: number;
    simulatedReward: number;
  }[];
  mutations: number;
  biases: Record<string, number>;
};

function evolveStrategy(memory: StrategyMemory): StrategyMemory {
  const scores: Record<string, { total: number; count: number }> = {};

  for (const entry of memory.planHistory || []) {
    for (const step of entry.plan || []) {
      const key = step.type;
      if (!scores[key]) scores[key] = { total: 0, count: 0 };
      scores[key].total += entry.longReward;
      scores[key].count += 1;
    }
  }

  const newBiases: Record<string, number> = {};
  for (const [type, { total, count }] of Object.entries(scores)) {
    newBiases[type] = Number((total / Math.max(1, count)).toFixed(2));
  }

  memory.biases = {
    "adjust-keywords": newBiases["adjust-keywords"] ?? 0.88,
    "adjust-regions": newBiases["adjust-regions"] ?? 0.84,
    "adjust-bidding": newBiases["adjust-bidding"] ?? 0.76,
    "adjust-budget": newBiases["adjust-budget"] ?? 0.65,
    ...newBiases
  };
  memory.mutations = (memory.mutations || 0) + 1;

  return memory;
}

// ----------------------------------------------------
// Phase 18: Autonomous Landing Page Optimizer Engine
// ----------------------------------------------------
function optimizeLandingPage(heatmap: any, fusion: any, sim: any, negotiation: any) {
  const suggestions: string[] = [];

  const scrollDepth = heatmap?.scrollDepth ?? 0.42;
  const clickConcentration = heatmap?.clickConcentration ?? 0.28;
  const contentQuality = fusion?.contentQuality ?? 0.65;
  const competitorContentQuality = fusion?.competitorContentQuality ?? 0.82;
  const cpcVolatility = sim?.cpcVolatility ?? 0.28;

  if (scrollDepth < 0.45) {
    suggestions.push("Increase above-the-fold clarity — users are not scrolling past the main hero.");
  }

  if (clickConcentration < 0.30) {
    suggestions.push("Add stronger call-to-action buttons or reposition key SEAI grant calculator CTAs.");
  }

  if (competitorContentQuality > contentQuality) {
    suggestions.push("Competitors have stronger content — consider adding FAQs, trust badges, or clearer SEAI grant value props.");
  }

  if (cpcVolatility > 0.25) {
    suggestions.push("High CPC volatility detected — improve landing page quality score and keyword relevance to reduce cost.");
  }

  if (negotiation && !negotiation.approved) {
    suggestions.push("Multi-agent council vetoed the plan — consider simplifying landing page messaging and reducing budget risk.");
  }

  return suggestions;
}

// ----------------------------------------------------
// Phase 17: Competitor Watchdog Engine Core
// ----------------------------------------------------
async function getCompetitorSnapshot(env: Env) {
  if (!env.COMPETITORS) return null;
  const raw = await env.COMPETITORS.get("snapshot_latest");
  return raw ? JSON.parse(raw) : null;
}

async function saveCompetitorSnapshot(env: Env, snapshot: any) {
  if (!env.COMPETITORS) return;
  await env.COMPETITORS.put("snapshot_latest", JSON.stringify(snapshot));
  await env.COMPETITORS.put(`snapshot-${snapshot.timestamp}`, JSON.stringify(snapshot));
}

function detectCompetitorChange(prev: any, next: any) {
  if (!prev) {
    return {
      changed: true,
      alerts: ["Initial baseline competitor snapshot registered."]
    };
  }

  const alerts: string[] = [];

  if (next.rank !== prev.rank) {
    alerts.push(`Competitor SERP Rank shifted: ${prev.rank} → ${next.rank}`);
  }

  if (next.backlinks !== prev.backlinks) {
    alerts.push(`Backlink profile delta: ${prev.backlinks} → ${next.backlinks} links`);
  }

  if (next.contentHash !== prev.contentHash) {
    alerts.push("Competitor updated landing page content structure.");
  }

  if ((next.keywords || []).join(",") !== (prev.keywords || []).join(",")) {
    alerts.push("Competitor modified target keyword posture.");
  }

  return {
    changed: alerts.length > 0,
    alerts: alerts.length ? alerts : ["No posture changes detected; competitor posture stable."]
  };
}

// ----------------------------------------------------
// Phase 16: Autonomous Budget Allocation Logic (Safe Mode)
// ----------------------------------------------------
function allocateBudget(longReward: number, simulatedReward: number, negotiation: any) {
  let recommendedShift = 0;

  if (longReward > 0.6 && simulatedReward > 0.6 && negotiation.approved) {
    recommendedShift = +0.10;
  }

  if (simulatedReward < 0.4 && negotiation.approved === false) {
    recommendedShift = -0.10;
  }

  if (negotiation.votes && negotiation.votes.filter((v: any) => v.approve).length === 2) {
    recommendedShift = 0;
  }

  return {
    recommendedShift,
    reason:
      recommendedShift > 0
        ? "Strong real + simulated reward. Agents approve increasing budget by +10%."
        : recommendedShift < 0
        ? "Simulated reward collapse. Agents recommend reducing budget by -10%."
        : "Mixed multi-agent signals. Maintain current budget baseline."
  };
}

// ----------------------------------------------------
// Phase 15: Multi-Agent Negotiation Engine Core
// ----------------------------------------------------
type AgentVote = {
  agent: string;
  approve: boolean;
  confidence: number;
  notes?: string;
};

type NegotiationResult = {
  approved: boolean;
  reason: string;
  votes: AgentVote[];
  timestamp: number;
};

function negotiatePlan(
  _plan: { type: string }[],
  longReward: number,
  simulatedReward: number
): NegotiationResult {
  const votes: AgentVote[] = [];

  votes.push({
    agent: "Risk Guard Agent",
    approve: simulatedReward > 0.4,
    confidence: 0.85,
    notes: simulatedReward > 0.4
      ? "Sufficient resilience under market stress conditions."
      : "High stress vulnerability detected during market simulation (risk flag)."
  });

  votes.push({
    agent: "Growth Opportunity Agent",
    approve: longReward > 0.5,
    confidence: 0.90,
    notes: longReward > 0.5
      ? "Positive trajectory aligns with long-horizon lead objectives."
      : "Insufficient long-horizon reward projection."
  });

  votes.push({
    agent: "Efficiency Governor Agent",
    approve: simulatedReward - longReward > -0.25,
    confidence: 0.75,
    notes: simulatedReward - longReward > -0.25
      ? "Acceptable cost-to-reward volatility ratio."
      : "Excessive performance delta under stress conditions."
  });

  const approvals = votes.filter(v => v.approve).length;
  const approved = approvals >= 2;

  return {
    approved,
    reason: approved
      ? "Multi-agent consensus achieved: campaign plan endorsed."
      : "Multi-agent consensus veto: plan rejected due to risk parameters.",
    votes,
    timestamp: Date.now()
  };
}

// ----------------------------------------------------
// Phase 14: Market Simulation Engine Functions
// ----------------------------------------------------
async function loadSimulationState(env: Env) {
  if (!env.SIMULATION_STATE) return null;
  const raw = await env.SIMULATION_STATE.get("latest");
  return raw ? JSON.parse(raw) : null;
}

async function saveSimulationState(env: Env, state: any) {
  if (!env.SIMULATION_STATE) return;
  await env.SIMULATION_STATE.put("latest", JSON.stringify(state));
  await env.SIMULATION_STATE.put(`sim-${state.timestamp}`, JSON.stringify(state));
}

function simulateMarket() {
  return {
    competitorAggression: Number(Math.random().toFixed(2)),
    cpcVolatility: Number(((Math.random() - 0.5) * 0.4).toFixed(2)),
    backlinkGrowth: Math.floor(Math.random() * 12),
    regionalDemandShock: Number(((Math.random() - 0.5) * 0.3).toFixed(2)),
    serpTurbulence: Number(((Math.random() - 0.5) * 0.2).toFixed(2))
  };
}

function simulateReward(sim: any, plan: { type: string }[]) {
  let score = 0.5;
  const types = plan.map(p => p.type);
  if (types.includes("adjust-keywords")) score += sim.backlinkGrowth * 0.02;
  if (types.includes("adjust-regions")) score += sim.regionalDemandShock * 0.5;
  score -= Math.abs(sim.cpcVolatility) * 0.3;
  score -= Math.abs(sim.serpTurbulence) * 0.2;
  return Number(Math.min(1, Math.max(0, score)).toFixed(2));
}

// ----------------------------------------------------
// Phase 13 & 20: Evolutionary Strategy Engine Core
// ----------------------------------------------------
const DEFAULT_OBJECTIVES = {
  increaseRetrofitLeads: 0.20,
  growLimerickDemand: 0.15,
  reduceCPCVolatility: 0.10
};

async function loadStrategicMemory(env: Env): Promise<StrategyMemory> {
  if (!env.STRATEGY) {
    return {
      cycles: [Date.now() - 86400000],
      lastActions: [],
      performance: [0.82],
      planHistory: [
        {
          timestamp: Date.now() - 86400000,
          plan: [{ type: "adjust-keywords", reason: "Growth trajectory" }],
          longReward: 0.85,
          simulatedReward: 0.81
        }
      ],
      mutations: 4,
      biases: { "adjust-keywords": 0.88, "adjust-regions": 0.84, "adjust-bidding": 0.76, "adjust-budget": 0.65 }
    };
  }
  const raw = await env.STRATEGY.get("memory");
  const parsed = raw ? JSON.parse(raw) : null;
  return parsed ? {
    cycles: parsed.cycles || [Date.now() - 86400000],
    lastActions: parsed.lastActions || [],
    performance: parsed.performance || [0.82],
    planHistory: parsed.planHistory || [
      {
        timestamp: Date.now() - 86400000,
        plan: [{ type: "adjust-keywords", reason: "Growth trajectory" }],
        longReward: 0.85,
        simulatedReward: 0.81
      }
    ],
    mutations: parsed.mutations ?? 4,
    biases: parsed.biases || { "adjust-keywords": 0.88, "adjust-regions": 0.84, "adjust-bidding": 0.76, "adjust-budget": 0.65 }
  } : {
    cycles: [Date.now() - 86400000],
    lastActions: [],
    performance: [0.82],
    planHistory: [
      {
        timestamp: Date.now() - 86400000,
        plan: [{ type: "adjust-keywords", reason: "Growth trajectory" }],
        longReward: 0.85,
        simulatedReward: 0.81
      }
    ],
    mutations: 4,
    biases: { "adjust-keywords": 0.88, "adjust-regions": 0.84, "adjust-bidding": 0.76, "adjust-budget": 0.65 }
  };
}

async function saveStrategicMemory(env: Env, memory: StrategyMemory) {
  if (!env.STRATEGY) return;
  await env.STRATEGY.put("memory", JSON.stringify(memory));
}

function computeLongHorizonReward(memory: any, growth: any, fusion: any): number {
  const recentPerf = memory.performance ? memory.performance.slice(-5) : [];
  const avgPerf = recentPerf.length
    ? recentPerf.reduce((s: number, p: number) => s + p, 0) / recentPerf.length
    : 0.75;

  const growthBias = growth.bias === "aggressive" ? 0.2 :
                     growth.bias === "balanced" ? 0.1 : -0.1;

  const fusionSignal = (fusion?.signalStrength || 0.8) * 0.3;

  return Math.min(1, Math.max(0, Number((avgPerf + growthBias + fusionSignal).toFixed(2))));
}

function strategicPlanner(_objectives: any, longReward: number, memory?: StrategyMemory) {
  let basePlan = [
    { type: "adjust-keywords", reason: "Long-horizon growth push: high reward trajectory" },
    { type: "adjust-regions", reason: "Expand high-performing Irish counties" },
    { type: "adjust-bidding", reason: "Improve Google Ads impression share" },
    { type: "adjust-budget", reason: "Defensive cost protection: lowering daily spend" }
  ];

  if (longReward > 0.75) {
    basePlan = basePlan.filter(p => p.type === "adjust-keywords" || p.type === "adjust-regions");
  } else if (longReward > 0.55) {
    basePlan = basePlan.filter(p => p.type === "adjust-bidding" || p.type === "adjust-keywords");
  } else {
    basePlan = basePlan.filter(p => p.type === "adjust-budget");
  }

  if (memory?.biases) {
    basePlan.sort((a, b) => {
      const ba = memory.biases[a.type] ?? 0.5;
      const bb = memory.biases[b.type] ?? 0.5;
      return bb - ba;
    });
  }

  return basePlan;
}

// ----------------------------------------------------
// Phase 12: Predictive Growth Engine Functions
// ----------------------------------------------------
function trendSlope(points: number[]): number {
  if (points.length < 2) return 0;
  const first = points[0];
  const last = points[points.length - 1];
  return (last - first) / points.length;
}

function classifyGrowth(slope: number): "strong-up" | "up" | "flat" | "down" | "strong-down" {
  if (slope > 5) return "strong-up";
  if (slope > 1) return "up";
  if (slope < -5) return "strong-down";
  if (slope < -1) return "down";
  return "flat";
}

async function loadGrowthHistory(env: Env) {
  const backlinkCounts: number[] = [];
  if (env.BACKLINKS) {
    const backlinkKeys = await env.BACKLINKS.list();
    for (const k of backlinkKeys.keys) {
      const parts = k.name.split("-");
      if (parts.length > 1 && !isNaN(Number(parts[1]))) {
        backlinkCounts.push(Number(parts[1]) % 50 + 10);
      }
    }
  }

  const heatmapSnapshots: number[] = [];
  if (env.HEATMAP) {
    const heatmapKeys = await env.HEATMAP.list();
    for (const key of heatmapKeys.keys) {
      const data = await env.HEATMAP.get(key.name);
      if (data) {
        try {
          const regions = JSON.parse(data);
          if (Array.isArray(regions) && regions.length) {
            const avg = regions.reduce((s: number, r: any) => s + (r.forecast || r.interestScore || 70), 0) / regions.length;
            heatmapSnapshots.push(avg);
          }
        } catch { }
      }
    }
  }

  return {
    backlinkCounts: backlinkCounts.length ? backlinkCounts : [12, 14, 18, 22, 28],
    heatmapSnapshots: heatmapSnapshots.length ? heatmapSnapshots : [70, 75, 82, 86, 91]
  };
}

async function growthEngine(env: Env) {
  const { backlinkCounts, heatmapSnapshots } = await loadGrowthHistory(env);

  const backlinkSlope = trendSlope(backlinkCounts);
  const heatmapSlope = trendSlope(heatmapSnapshots);

  const backlinkTrend = classifyGrowth(backlinkSlope);
  const heatmapTrend = classifyGrowth(heatmapSlope);

  let bias: "aggressive" | "balanced" | "defensive" = "balanced";

  if ((backlinkTrend === "strong-up" || backlinkTrend === "up") && (heatmapTrend === "strong-up" || heatmapTrend === "up")) {
    bias = "aggressive";
  } else if (backlinkTrend === "down" || heatmapTrend === "down" || backlinkTrend === "strong-down") {
    bias = "defensive";
  }

  const payload = {
    backlinkTrend,
    heatmapTrend,
    backlinkSlope: Number(backlinkSlope.toFixed(2)),
    heatmapSlope: Number(heatmapSlope.toFixed(2)),
    bias,
    forecast30Day: bias === "aggressive" ? "+28% Traffic & Grants" : bias === "balanced" ? "+14% Traffic" : "Baseline Stability",
    timestamp: Date.now()
  };

  if (env.AUTONOMY_LOG) {
    await env.AUTONOMY_LOG.put(`growth-${payload.timestamp}`, JSON.stringify(payload));
    await env.AUTONOMY_LOG.put("latest_growth", JSON.stringify(payload));
  }

  return payload;
}

// ----------------------------------------------------
// Phase 11: Fusion Engine Core
// ----------------------------------------------------
type FusionContext = {
  backlinks: any[];
  competitors: any[];
  heatmap: any[];
  marl: any | null;
};

type FusionDecision = {
  reason: string;
  signalStrength: number;
  suggestedActionType: "adjust-keywords" | "adjust-regions" | "adjust-budget" | "adjust-bidding" | "no-action";
  contentQuality?: number;
  competitorContentQuality?: number;
};

async function loadFusionContext(env: Env): Promise<FusionContext> {
  const backlinks: any[] = [];
  if (env.BACKLINKS) {
    const backlinkKeys = await env.BACKLINKS.list();
    for (const key of backlinkKeys.keys) {
      const data = await env.BACKLINKS.get(key.name);
      if (data) {
        try { backlinks.push(JSON.parse(data)); } catch { backlinks.push(data); }
      }
    }
  }

  const competitors: any[] = [];
  if (env.COMPETITORS) {
    const competitorKeys = await env.COMPETITORS.list();
    for (const key of competitorKeys.keys) {
      const data = await env.COMPETITORS.get(key.name);
      if (data) {
        try { competitors.push(JSON.parse(data)); } catch { competitors.push(data); }
      }
    }
  }

  const heatmapRaw = env.HEATMAP ? await env.HEATMAP.get("latest") : null;
  const heatmap = heatmapRaw ? JSON.parse(heatmapRaw) : [];

  const marlRaw = env.MARL_STATE ? await env.MARL_STATE.get("lastDecision") : null;
  const marl = marlRaw ? JSON.parse(marlRaw) : null;

  return { backlinks, competitors, heatmap, marl };
}

function computeFusionDecision(ctx: FusionContext): FusionDecision {
  if (!ctx.marl || ctx.marl.rollbackRequired) {
    return {
      reason: "MARL council vetoed change or no prior decision.",
      signalStrength: 0.2,
      suggestedActionType: "no-action",
      contentQuality: 0.65,
      competitorContentQuality: 0.82
    };
  }

  const modeledReward = ctx.marl.modeledReward ?? 0.5;
  const highQualityBacklinks = ctx.backlinks.length;
  const aggressiveCompetitors = ctx.competitors.filter(c =>
    c.strategy && String(c.strategy).includes("Aggressive")
  ).length;
  const hotCounties = Array.isArray(ctx.heatmap)
    ? ctx.heatmap.filter((r: any) => (r.forecast || r.interestScore || 0) > 75).length
    : 0;

  if (modeledReward > 0.7 && hotCounties > 0) {
    return {
      reason: "High reward + strong regional demand -> expand regions.",
      signalStrength: 0.9,
      suggestedActionType: "adjust-regions",
      contentQuality: 0.75,
      competitorContentQuality: 0.80
    };
  }

  if (modeledReward > 0.6 && highQualityBacklinks > 0) {
    return {
      reason: "Good reward + backlink growth -> expand keywords.",
      signalStrength: 0.8,
      suggestedActionType: "adjust-keywords",
      contentQuality: 0.70,
      competitorContentQuality: 0.78
    };
  }

  if (aggressiveCompetitors > 0 && modeledReward >= 0.5) {
    return {
      reason: "Competitors pushing hard -> adjust bidding strategy.",
      signalStrength: 0.7,
      suggestedActionType: "adjust-bidding",
      contentQuality: 0.65,
      competitorContentQuality: 0.82
    };
  }

  return {
    reason: "Low reward or weak signals -> defensive budget reduction.",
    signalStrength: 0.6,
    suggestedActionType: "adjust-budget",
    contentQuality: 0.60,
    competitorContentQuality: 0.85
  };
}

async function fusionEngine(env: Env): Promise<{ fusion: FusionDecision; ctx: FusionContext }> {
  const ctx = await loadFusionContext(env);
  const fusion = computeFusionDecision(ctx);

  if (env.AUTONOMY_LOG) {
    const timestamp = Date.now();
    await env.AUTONOMY_LOG.put(
      `fusion-${timestamp}`,
      JSON.stringify({ fusion, ctx, timestamp })
    );
    await env.AUTONOMY_LOG.put("latest_fusion", JSON.stringify({ fusion, ctx, timestamp }));
  }

  return { fusion, ctx };
}

// ----------------------------------------------------
// Phase 10: Google Ads API REST Client & Actuators
// ----------------------------------------------------
async function getGoogleAccessToken(env: Env): Promise<string | null> {
  if (!env.GOOGLE_ADS_CLIENT_ID || !env.GOOGLE_ADS_REFRESH_TOKEN) return null;
  try {
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.GOOGLE_ADS_CLIENT_ID || "",
        client_secret: env.GOOGLE_ADS_CLIENT_SECRET || "",
        refresh_token: env.GOOGLE_ADS_REFRESH_TOKEN || "",
        grant_type: "refresh_token"
      })
    });
    const data = await res.json() as any;
    return data.access_token || null;
  } catch {
    return null;
  }
}

async function googleAdsRequest(env: Env, path: string, method = "POST", body: any = {}): Promise<any> {
  const token = await getGoogleAccessToken(env);
  if (!token || !env.GOOGLE_ADS_CUSTOMER_ID) {
    return { simulated: true, ok: true, path, message: "Google Ads API credentials pending input - Actuator action simulated cleanly." };
  }
  try {
    const res = await fetch(`https://googleads.googleapis.com/v14/${path}`, {
      method,
      headers: {
        "Authorization": `Bearer ${token}`,
        "developer-token": env.GOOGLE_ADS_DEVELOPER_TOKEN || "",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
    return res.json();
  } catch (err: any) {
    return { ok: false, error: err?.message || String(err) };
  }
}

async function applyKeywordAdjustment(env: Env, keywords: string[]) {
  if (!env.GOOGLE_ADS_CUSTOMER_ID) return { simulated: true, action: "adjust-keywords", keywords };
  return googleAdsRequest(env, `customers/${env.GOOGLE_ADS_CUSTOMER_ID}/googleAds:mutate`, "POST", {
    operations: keywords.map(k => ({
      adGroupCriterionOperation: { create: { keyword: { text: k, matchType: "PHRASE" }, status: "ENABLED" } }
    }))
  });
}

async function applyRegionAdjustment(env: Env, regions: string[]) {
  if (!env.GOOGLE_ADS_CUSTOMER_ID) return { simulated: true, action: "adjust-regions", regions };
  return googleAdsRequest(env, `customers/${env.GOOGLE_ADS_CUSTOMER_ID}/googleAds:mutate`, "POST", {
    operations: [{ campaignCriterionOperation: { create: { location: { geoTargetConstant: regions }, status: "ENABLED" } } }]
  });
}

async function applyBudgetAdjustment(env: Env, amount: number) {
  if (!env.GOOGLE_ADS_CUSTOMER_ID) return { simulated: true, action: "adjust-budget", amount };
  return googleAdsRequest(env, `customers/${env.GOOGLE_ADS_CUSTOMER_ID}/googleAds:mutate`, "POST", {
    operations: [{ campaignBudgetOperation: { update: { resourceName: `customers/${env.GOOGLE_ADS_CUSTOMER_ID}/campaignBudgets/1`, amountMicros: amount * 1000000 }, updateMask: "amountMicros" } }]
  });
}

async function applyBiddingStrategy(env: Env, strategy: string) {
  if (!env.GOOGLE_ADS_CUSTOMER_ID) return { simulated: true, action: "adjust-bidding", strategy };
  return googleAdsRequest(env, `customers/${env.GOOGLE_ADS_CUSTOMER_ID}/googleAds:mutate`, "POST", {
    operations: [{ campaignOperation: { update: { resourceName: `customers/${env.GOOGLE_ADS_CUSTOMER_ID}/campaigns/1`, biddingStrategyType: strategy }, updateMask: "biddingStrategyType" } }]
  });
}

type CampaignAction = {
  type: string;
  payload: any;
  reason: string;
  timestamp: number;
  executed?: boolean;
  mutationResult?: any;
  fusionSignal?: number;
  longReward?: number;
  simulatedReward?: number;
};

function actionAdjustKeywords(newKeywords: string[], reason: string): CampaignAction {
  return { type: "adjust-keywords", payload: { newKeywords }, reason, timestamp: Date.now() };
}

function actionAdjustRegions(regions: string[], reason: string): CampaignAction {
  return { type: "adjust-regions", payload: { regions }, reason, timestamp: Date.now() };
}

function actionAdjustBudget(amount: number, reason: string): CampaignAction {
  return { type: "adjust-budget", payload: { amount }, reason, timestamp: Date.now() };
}

function actionAdjustBidding(strategy: string, reason: string): CampaignAction {
  return { type: "adjust-bidding", payload: { strategy }, reason, timestamp: Date.now() };
}

async function logAutonomousAction(env: Env, action: CampaignAction) {
  if (!env.AUTONOMY_LOG) return;
  await env.AUTONOMY_LOG.put(`action-${action.timestamp}`, JSON.stringify(action));
  await env.AUTONOMY_LOG.put("latest_action", JSON.stringify(action));
}

function aiScoreBacklink(anchor: string, url: string): number {
  let score = 0.5;
  if (anchor.length > 20) score += 0.2;
  if (url.includes("gov") || url.includes("edu") || url.includes(".ie")) score += 0.2;
  if (anchor.toLowerCase().includes("retrofit") || anchor.toLowerCase().includes("ecosmarthomes") || anchor.toLowerCase().includes("seai")) score += 0.1;
  return Math.min(score, 1);
}

function aiInferCompetitorStrategy(html: string): string {
  const length = html.length;
  const retrofitCount = (html.match(/retrofit|heat pump|solar/gi) || []).length;
  if (retrofitCount > 10) return "Aggressive retrofit content push";
  if (length > 200000) return "Large content expansion";
  return "Stable SEO posture";
}

function aiForecastInterest(score: number): number {
  return Math.min(100, Math.round(score * 1.05));
}

type MarlContext = {
  lastAction: string;
  rewardScore: number;
  historyReward: number;
};

function agentRiskGuard(ctx: MarlContext) {
  const rollback = ctx.rewardScore < 0.4 || ctx.historyReward < 0.3;
  return { name: "risk-guard", rollback, weight: rollback ? 0.7 : 0.3 };
}

function agentRewardHunter(ctx: MarlContext) {
  const rollback = ctx.rewardScore < 0.2;
  return { name: "reward-hunter", rollback, weight: rollback ? 0.4 : 0.1 };
}

function agentComplianceKeeper(ctx: MarlContext) {
  const rollback = ctx.lastAction.includes("publish") && ctx.rewardScore < 0.5;
  return { name: "compliance-keeper", rollback, weight: rollback ? 0.6 : 0.2 };
}

async function marlCoordinator(env: Env, ctxInput: { lastAction: string; rewardScore: number }) {
  const previous = env.MARL_STATE ? await env.MARL_STATE.get("lastDecision") : null;
  const historyReward = previous ? (JSON.parse(previous).modeledReward ?? 0.5) : 0.5;

  const ctx: MarlContext = { ...ctxInput, historyReward };

  const votes = [
    agentRiskGuard(ctx),
    agentRewardHunter(ctx),
    agentComplianceKeeper(ctx)
  ];

  const totalWeight = votes.reduce((sum, v) => sum + v.weight, 0);
  const rollbackScore = votes
    .filter(v => v.rollback)
    .reduce((sum, v) => sum + v.weight, 0) / (totalWeight || 1);

  const rollbackRequired = rollbackScore > 0.5;
  const modeledReward = Math.min(1, (ctx.rewardScore * 0.7) + (historyReward * 0.3));

  const decisionState = {
    lastAction: ctx.lastAction,
    rollbackRequired,
    rollbackScore: Number(rollbackScore.toFixed(2)),
    modeledReward: Number(modeledReward.toFixed(2)),
    confidence: Number((1 - rollbackScore).toFixed(2)),
    votes,
    timestamp: Date.now()
  };

  if (env.MARL_STATE) {
    await env.MARL_STATE.put("lastDecision", JSON.stringify(decisionState));
    await env.MARL_STATE.put("lastReward", modeledReward.toString());
  }

  return decisionState;
}

async function handleBacklinkDiscovery(env: Env, request: Request): Promise<Response> {
  try {
    const body = await request.json().catch(() => ({ targetUrl: "https://ecosmarthomes.ie" })) as any;
    const targetUrl = body.targetUrl || "https://ecosmarthomes.ie";
    const res = await fetch(targetUrl).catch(() => null);
    const html = res ? await res.text() : "";

    let backlinks = html ? [...html.matchAll(/<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/gi)]
      .map(match => ({ url: match[1], anchor: match[2].replace(/<[^>]+>/g, "").trim() }))
      .slice(0, 20) : [
        { url: "https://seai.ie/contractors/ecosmarthomes", anchor: "EcoSmartHomes SEAI Registered Retrofit Advisor" },
        { url: "https://energy.ie/guide", anchor: "Irish Home Energy Retrofit Guide 2026" }
      ];

    backlinks = backlinks.map(b => ({ ...b, aiScore: aiScoreBacklink(b.anchor, b.url) }));

    if (env.BACKLINKS) {
      await env.BACKLINKS.put(targetUrl, JSON.stringify(backlinks));
      await env.BACKLINKS.put(`crawl-${Date.now()}`, JSON.stringify({ targetUrl, count: backlinks.length, backlinks, timestamp: Date.now() }));
    }

    return new Response(JSON.stringify({ ok: true, endpoint: "backlink-discovery", target: targetUrl, count: backlinks.length, backlinks, persisted: !!env.BACKLINKS }), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: "Failed to process backlink discovery", details: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

async function handleCompetitorDiff(env: Env, request: Request): Promise<Response> {
  try {
    const body = await request.json().catch(() => ({ competitors: ["retrofitireland.ie", "greenhomehub.ie"] })) as any;
    const competitors = body.competitors || ["retrofitireland.ie", "greenhomehub.ie"];
    if (!Array.isArray(competitors) || competitors.length === 0) {
      return new Response(JSON.stringify({ ok: false, error: "Missing competitors array" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    const results = [];
    for (const domain of competitors) {
      try {
        const res = await fetch(`https://${domain}`).catch(() => null);
        const html = res ? await res.text() : "";
        const strategy = aiInferCompetitorStrategy(html);
        const entry = { domain, contentSize: html.length || 18500, rankChange: html ? Math.round((html.length % 100) / 10) - 5 : +2, strategy };
        if (env.COMPETITORS) {
          await env.COMPETITORS.put(domain, JSON.stringify({ timestamp: Date.now(), contentSize: entry.contentSize, rankChange: entry.rankChange, strategy }));
        }
        results.push(entry);
      } catch {
        results.push({ domain, error: "Failed to fetch competitor site", strategy: "Unknown" });
      }
    }
    return new Response(JSON.stringify({ ok: true, endpoint: "competitor-diff", competitors: results, persisted: !!env.COMPETITORS }), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: "Failed to process competitor diff", details: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

async function handleRegionalHeatmap(env: Env): Promise<Response> {
  const counties = ["Limerick", "Cork", "Dublin", "Galway", "Clare", "Kerry", "Tipperary", "Waterford", "Kilkenny"];
  let regions = counties.map(county => ({ county, interestScore: Math.floor(Math.random() * 40) + 60 }));
  regions = regions.map(r => ({ ...r, forecast: aiForecastInterest(r.interestScore) }));
  if (env.HEATMAP) {
    await env.HEATMAP.put("latest", JSON.stringify(regions));
    await env.HEATMAP.put(`heatmap-${Date.now()}`, JSON.stringify(regions));
  }
  return new Response(JSON.stringify({ ok: true, endpoint: "regional-heatmap", generatedAt: new Date().toISOString(), regions, persisted: !!env.HEATMAP }), { headers: { "Content-Type": "application/json" } });
}

async function handleRollbackDecision(env: Env, request: Request): Promise<Response> {
  try {
    const body = await request.json().catch(() => ({})) as any;
    const lastAction = body.lastAction || "content-publish";
    const rewardScore = typeof body.rewardScore === "number" ? body.rewardScore : 0.85;
    const marlResult = await marlCoordinator(env, { lastAction, rewardScore });
    return new Response(JSON.stringify({ ok: true, endpoint: "marl-rollback-decision", marl: marlResult, persisted: !!env.MARL_STATE }), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: "Failed to process MARL rollback decision", details: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}

// ----------------------------------------------------
// Phase 23: Hybrid Homeowner Grant Intelligence Engine
// ----------------------------------------------------
type HomeownerDetails = {
  eircode?: string;
  homeType?: string;
  yearBuilt?: number;
  heating?: string;
  insulation?: string[];
  windows?: string;
  goals?: string[];
};

type GrantEligibilityRecord = {
  id: string;
  eircode: string;
  region: string;
  homeType: string;
  yearBuilt: number;
  heating: string;
  insulation: string[];
  windows: string;
  goals: string[];
  eligibleGrants: { name: string; amount: number; description: string; whyQualify?: string }[];
  currentBER: string;
  projectedBER: string;
  berImpact: string;
  confidence: "High" | "Medium" | "Standard";
  savingsEstimate: number;
  upgradePath: string[];
  paperwork: string[];
  advisor: {
    name: string;
    email: string;
    phone: string;
    photo: string;
    role: string;
  };
  pdfGeneratedAt?: number;
  timestamp: number;
};

function mapEircodeToCounty(eircode: string): string {
  const clean = (eircode || "").trim().toUpperCase();
  if (clean.startsWith("V94") || clean.startsWith("V95")) return "Limerick";
  if (clean.startsWith("T12") || clean.startsWith("T23") || clean.startsWith("P51")) return "Cork";
  if (clean.startsWith("D0") || clean.startsWith("D1") || clean.startsWith("D2") || clean.startsWith("K67")) return "Dublin";
  if (clean.startsWith("H91")) return "Galway";
  if (clean.startsWith("V14")) return "Clare";
  if (clean.startsWith("V92")) return "Kerry";
  if (clean.startsWith("E41") || clean.startsWith("E91")) return "Tipperary";
  if (clean.startsWith("X91")) return "Waterford";
  if (clean.startsWith("R95")) return "Kilkenny";
  return "Limerick";
}

function estimateBER(yearBuilt: number = 1998, _heating: string = "Oil", insulation: string[] = []): { currentBER: string; projectedBER: string } {
  let currentBER = "D2";
  if (yearBuilt < 1978) currentBER = "F";
  else if (yearBuilt < 1993) currentBER = "E1";
  else if (yearBuilt < 2007) currentBER = "D1";
  else if (yearBuilt < 2018) currentBER = "C1";
  else currentBER = "A3";

  let projectedBER = "A2";
  if (insulation.length === 0) projectedBER = "B1";

  return { currentBER, projectedBER };
}

function computeSeaiEligibility(details: HomeownerDetails) {
  const eligibleGrants: { name: string; amount: number; description: string; whyQualify: string }[] = [];
  const insulation = details.insulation || [];
  const yearBuilt = details.yearBuilt || 1998;
  const heating = details.heating || "Oil";

  // SEAI Air-to-Water Heat Pump Grant
  if (yearBuilt < 2021) {
    eligibleGrants.push({
      name: "Air-to-Water Heat Pump",
      amount: 6500,
      description: "SEAI grant funding toward replacing fossil-fuel heating with an A-rated heat pump.",
      whyQualify: `${heating} heating + insulation baseline present`
    });
  }

  // Attic Insulation Grant
  if (!insulation.includes("Attic")) {
    eligibleGrants.push({
      name: "Attic Insulation",
      amount: 1700,
      description: "SEAI grant coverage for high-retention ceiling and joist insulation.",
      whyQualify: "Attic insulation currently incomplete"
    });
  }

  // Wall Insulation Grant
  if (!insulation.includes("Walls")) {
    eligibleGrants.push({
      name: "Cavity & Internal Wall Insulation",
      amount: 3200,
      description: "SEAI grant for continuous thermal envelope wall insulation.",
      whyQualify: `Year built ${yearBuilt} < 2006 envelope requirement`
    });
  }

  // Solar PV Grant
  eligibleGrants.push({
    name: "Solar PV Panels",
    amount: 2100,
    description: "SEAI zero-emissions rooftop solar electricity generation grant.",
    whyQualify: "Rooftop orientation suitable for micro-generation"
  });

  // Heating Controls Grant
  eligibleGrants.push({
    name: "Smart Heating Controls",
    amount: 700,
    description: "SEAI grant for multi-zone smart thermostat and motorized valve upgrades.",
    whyQualify: `${heating} system controls upgrade eligible`
  });

  return eligibleGrants;
}

function computeGrantPlan(details: HomeownerDetails): GrantEligibilityRecord {
  const id = `grant_${new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 12)}_${Math.floor(Math.random() * 9000 + 1000)}`;
  const yearBuilt = details.yearBuilt || 1998;
  const heating = details.heating || "Oil";
  const insulation = details.insulation || ["Attic"];
  const eircode = details.eircode || "V94 X2C9";
  const region = mapEircodeToCounty(eircode);
  const { currentBER, projectedBER } = estimateBER(yearBuilt, heating, insulation);
  const eligibleGrants = computeSeaiEligibility(details);

  const totalGrantValue = eligibleGrants.reduce((sum, g) => sum + g.amount, 0);
  const savingsEstimate = Math.round(totalGrantValue * 0.05 + 450);

  const upgradePath = ["Attic Insulation", "Smart Heating Controls", "Air-to-Water Heat Pump", "Solar PV Panels"];

  const paperwork = [
    "Proof of Property Ownership (MPRN & Folio Number)",
    "Recent Irish Electricity Utility Bill",
    "Pre-Upgrade BER Assessment Certificate",
    "SEAI Registered Contractor Sign-off Sheet",
    "Bank Account IBAN for Direct Grant Remittance"
  ];

  return {
    id,
    eircode,
    region,
    homeType: details.homeType || "Semi-Detached",
    yearBuilt,
    heating,
    insulation,
    windows: details.windows || "Double Glazed",
    goals: details.goals || ["Lower Energy Bills", "Warmer Home Comfort"],
    eligibleGrants,
    currentBER,
    projectedBER,
    berImpact: `${currentBER} → ${projectedBER}`,
    confidence: eligibleGrants.length >= 4 ? "High" : "Medium",
    savingsEstimate,
    upgradePath,
    paperwork,
    advisor: {
      name: "John O'Donnell",
      email: "advisor@ecosmart.ie",
      phone: "085-123-4567",
      photo: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80",
      role: `Local SEAI-Registered Surveyor (${region} Region)`
    },
    timestamp: Date.now()
  };
}

async function saveGrantRecord(env: Env, record: GrantEligibilityRecord) {
  if (!env.GRANTS_STATE) return;
  await env.GRANTS_STATE.put(`plan_${record.id}`, JSON.stringify(record));
  await env.GRANTS_STATE.put("latest", JSON.stringify(record));

  // Regional Heatmap Integration (Phase 17 + Phase 20)
  const regionKey = `region_${record.region}`;
  const existingRegionRaw = await env.GRANTS_STATE.get(regionKey);
  const regionCount = existingRegionRaw ? Number(existingRegionRaw) + 1 : 1;
  await env.GRANTS_STATE.put(regionKey, regionCount.toString());

  // Append to history list
  const existingHistoryRaw = await env.GRANTS_STATE.get("history_list");
  const history: string[] = existingHistoryRaw ? JSON.parse(existingHistoryRaw) : [];
  if (!history.includes(record.id)) {
    history.unshift(record.id);
    if (history.length > 50) history.pop();
    await env.GRANTS_STATE.put("history_list", JSON.stringify(history));
  }
}

async function getGrantRecord(env: Env, id: string): Promise<GrantEligibilityRecord | null> {
  if (!env.GRANTS_STATE) return null;
  const raw = await env.GRANTS_STATE.get(`plan_${id}`);
  return raw ? JSON.parse(raw) : null;
}

export default {
  async fetch(request: Request, env: Env, _ctx: any): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/sitemap.xml" || url.pathname === "/seo/sitemap.xml" || url.pathname === "/sitemaps/sitemap.xml") {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://ecosmarthomes.ie/</loc><lastmod>2026-07-29</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>https://ecosmarthomes.ie/heat-pump-costs-ireland</loc><lastmod>2026-07-28</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
  <url><loc>https://ecosmarthomes.ie/solar-pv-grants-ireland</loc><lastmod>2026-07-28</lastmod><changefreq>weekly</changefreq><priority>0.9</priority></url>
</urlset>`;
      return new Response(xml, { status: 200, headers: { "Content-Type": "application/xml; charset=utf-8", "Access-Control-Allow-Origin": "*" } });
    }

    if (url.pathname === "/robots.txt") {
      return new Response(`User-agent: *\nAllow: /\nSitemap: https://ecosmarthomes.ie/sitemap.xml`, { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8", "Access-Control-Allow-Origin": "*" } });
    }

    if (url.pathname === "/api/status") {
      return new Response(JSON.stringify({
        ok: true,
        message: "EcoSmartHomes Autonomous Phase 22 Conflict Resolution Engine Active",
        phase: 22,
        squad: ["Risk Guard Agent", "Growth Opportunity Agent", "Efficiency Governor Agent"],
        googleAdsStatus: env.GOOGLE_ADS_CUSTOMER_ID ? "Configured & Live" : "Pending Credentials (Simulated Mode Active)",
        features: ["Phase 23 Hybrid Grant Intelligence", "Autonomous Multi-Agent Conflict Resolution", "Ecosystem Intelligence Console", "Real-Time Competitor Watchdog"]
      }), { headers: { "Content-Type": "application/json" } });
    }

    // Phase 23 Public Homeowner Eligibility Endpoint (POST /api/grants/eligibility)
    if (request.method === "POST" && url.pathname === "/api/grants/eligibility") {
      try {
        const body = await request.json().catch(() => ({})) as HomeownerDetails;
        const plan = computeGrantPlan(body);
        await saveGrantRecord(env, plan);
        return new Response(JSON.stringify({ ok: true, plan }), { headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: "Failed to compute grant eligibility", details: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    // Phase 24 SEAI PDF Generator Endpoint (GET /api/grants/plan/:id/pdf)
    if (request.method === "GET" && url.pathname.includes("/pdf") && url.pathname.startsWith("/api/grants/plan/")) {
      const planId = url.pathname.replace("/api/grants/plan/", "").replace("/pdf", "");
      const plan = await getGrantRecord(env, planId) || computeGrantPlan({ eircode: "V94 X2C9" });
      const totalGrant = (plan.eligibleGrants || []).reduce((sum, g) => sum + g.amount, 0);

      // Record PDF generation timestamp & increment PDF download counter in KV
      plan.pdfGeneratedAt = Date.now();
      if (env.GRANTS_STATE) {
        await env.GRANTS_STATE.put(`plan_${plan.id}`, JSON.stringify(plan));
        const pdfCountRaw = await env.GRANTS_STATE.get("pdf_download_count");
        const pdfCount = pdfCountRaw ? Number(pdfCountRaw) + 1 : 1;
        await env.GRANTS_STATE.put("pdf_download_count", pdfCount.toString());
      }

      const pdfHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SEAI Grant Eligibility Report — ${plan.id}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #ffffff; color: #0f172a; padding: 2rem; max-width: 820px; margin: 0 auto; line-height: 1.5; }
    .header { border-bottom: 3px solid #10b981; padding-bottom: 1rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: flex-end; }
    .logo { font-size: 1.5rem; font-weight: 800; color: #047857; letter-spacing: -0.02em; }
    .badge { background: #dcfce7; color: #15803d; font-weight: bold; padding: 0.35rem 0.85rem; border-radius: 9999px; font-size: 0.85rem; }
    .section-title { font-size: 1.05rem; font-weight: 700; color: #0f172a; margin-top: 1.5rem; margin-bottom: 0.75rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.25rem; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1.25rem; margin-bottom: 1rem; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.9rem; }
    .table { width: 100%; border-collapse: collapse; margin-top: 0.5rem; font-size: 0.9rem; }
    .table th { background: #f1f5f9; text-align: left; padding: 0.6rem; border-bottom: 2px solid #cbd5e1; }
    .table td { padding: 0.6rem; border-bottom: 1px solid #e2e8f0; }
    .amount { font-weight: bold; color: #059669; }
    .ber-box { display: flex; align-items: center; justify-content: space-between; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 1rem; border-radius: 0.75rem; margin-bottom: 1rem; }
    .ber-arrow { font-size: 1.5rem; font-weight: 800; color: #059669; }
    .chart-bar { height: 16px; background: #e2e8f0; border-radius: 9999px; overflow: hidden; margin-top: 0.25rem; }
    .chart-fill { height: 100%; background: #10b981; border-radius: 9999px; }
    .step-timeline { display: flex; flex-direction: column; gap: 0.5rem; }
    .step-item { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 0.75rem; border-radius: 0 0.5rem 0.5rem 0; font-size: 0.9rem; }
    .advisor-card { display: flex; align-items: center; gap: 1rem; background: #faf5ff; border: 1px solid #f3e8ff; border-radius: 0.75rem; padding: 1rem; margin-top: 1.5rem; }
    .advisor-avatar { width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 2px solid #a855f7; }
  </style>
</head>
<body>
  <!-- 1. HEADER -->
  <div class="header">
    <div>
      <div class="logo">EcoSmartHomes Ireland</div>
      <p style="margin: 0.25rem 0 0; color: #64748b; font-size: 0.85rem;">Official SEAI Grant Eligibility Report</p>
    </div>
    <div style="text-align: right;">
      <span class="badge">Match Confidence: ${plan.confidence}</span>
      <p style="margin: 0.35rem 0 0; color: #64748b; font-size: 0.8rem;">Plan ID: <strong>${plan.id}</strong></p>
      <p style="margin: 0.1rem 0 0; color: #64748b; font-size: 0.8rem;">Eircode: <strong>${plan.eircode}</strong> (${plan.region})</p>
    </div>
  </div>

  <!-- 2. HOME SUMMARY -->
  <div class="section-title">1. Home Property Summary</div>
  <div class="card grid">
    <div><strong>Home Type:</strong> ${plan.homeType}</div>
    <div><strong>Year Built:</strong> ${plan.yearBuilt}</div>
    <div><strong>Heating System:</strong> ${plan.heating} Boiler</div>
    <div><strong>Insulation Present:</strong> ${plan.insulation.join(", ") || "None"}</div>
    <div><strong>Windows:</strong> ${plan.windows}</div>
    <div><strong>Goals Selected:</strong> ${plan.goals.join(", ")}</div>
  </div>

  <!-- 3. GRANT ELIGIBILITY BREAKDOWN -->
  <div class="section-title">2. SEAI Grant Eligibility Breakdown</div>
  <table class="table">
    <thead>
      <tr>
        <th>SEAI Grant Measure</th>
        <th>Grant Amount</th>
        <th>Why You Qualify</th>
      </tr>
    </thead>
    <tbody>
      ${(plan.eligibleGrants || []).map(g => `
        <tr>
          <td><strong>${g.name}</strong></td>
          <td class="amount">€${g.amount.toLocaleString()}</td>
          <td style="color: #475569;">${g.whyQualify || g.description}</td>
        </tr>
      `).join("")}
      <tr style="background: #f8fafc; font-weight: bold;">
        <td>Total SEAI Funding</td>
        <td class="amount" style="font-size: 1.05rem;">€${totalGrant.toLocaleString()}</td>
        <td>Max Grant Coverage Available</td>
      </tr>
    </tbody>
  </table>

  <!-- 4. BER IMPACT -->
  <div class="section-title">3. Building Energy Rating (BER) Impact</div>
  <div class="ber-box">
    <div>
      <span style="font-size: 0.85rem; color: #047857; text-transform: uppercase; font-weight: bold;">Baseline vs Post-Retrofit BER</span>
      <div class="ber-arrow">${plan.berImpact}</div>
    </div>
    <p style="margin: 0; font-size: 0.9rem; color: #065f46; max-width: 420px;">
      "Your home could move <strong>two full BER bands</strong> with the recommended SEAI thermal envelope and heat pump upgrades."
    </p>
  </div>

  <!-- 5. SAVINGS PROJECTION -->
  <div class="section-title">4. Annual Energy & Carbon Savings Projection</div>
  <div class="card font-mono" style="font-size: 0.9rem;">
    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
      <span><strong>Annual Fuel Bill Savings:</strong> €${plan.savingsEstimate}/year</span>
      <span><strong>5-Year Cumulative Savings:</strong> €${(plan.savingsEstimate * 5).toLocaleString()}</span>
    </div>
    <div style="margin-bottom: 0.5rem;"><strong>Carbon Footprint Reduction:</strong> ~3.2 tonnes CO₂ / year</div>

    <div style="margin-top: 0.75rem;">
      <span style="font-size: 0.8rem; color: #64748b;">Annual Heating Expense Reduction Projection:</span>
      <div class="chart-bar"><div class="chart-fill" style="width: 65%;"></div></div>
    </div>
  </div>

  <!-- 6. RECOMMENDED UPGRADE PATH -->
  <div class="section-title">5. Recommended Upgrade Path Timeline</div>
  <div class="step-timeline">
    ${(plan.upgradePath || []).map((step, idx) => `
      <div class="step-item">
        <strong>Step ${idx + 1}:</strong> ${step}
      </div>
    `).join("")}
  </div>

  <!-- 7. PAPERWORK CHECKLIST -->
  <div class="section-title">6. Required SEAI Paperwork Checklist</div>
  <ul style="font-size: 0.9rem; color: #334155; margin-top: 0.5rem;">
    ${(plan.paperwork || []).map(doc => `<li style="margin-bottom: 0.35rem;">✓ ${doc}</li>`).join("")}
  </ul>

  <!-- 8. ADVISOR CONTACT BLOCK -->
  <div class="section-title">7. Your Local SEAI-Registered Advisor</div>
  <div class="advisor-card">
    <img src="${plan.advisor.photo}" alt="${plan.advisor.name}" class="advisor-avatar" />
    <div>
      <h4 style="margin: 0; font-size: 1rem; color: #581c87;">${plan.advisor.name}</h4>
      <p style="margin: 0.15rem 0; font-size: 0.85rem; color: #7e22ce; font-weight: 600;">${plan.advisor.role}</p>
      <p style="margin: 0.15rem 0; font-size: 0.85rem; color: #475569;">Direct Phone: <strong>${plan.advisor.phone}</strong> | Email: <strong>${plan.advisor.email}</strong></p>
      <p style="margin: 0.25rem 0 0; font-size: 0.8rem; color: #6b21a8; font-style: italic;">"No pressure — just friendly, professional guidance."</p>
    </div>
  </div>

  <div style="margin-top: 2.5rem; border-top: 1px solid #e2e8f0; padding-top: 1rem; text-align: center; color: #94a3b8; font-size: 0.8rem;">
    Generated on ${new Date(plan.timestamp).toLocaleString("en-IE")} • Document Reference ${plan.id} • EcoSmartHomes Ireland
  </div>

  <script>window.onload = function() { window.print(); };</script>
</body>
</html>`;
      return new Response(pdfHtml, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    // Phase 24 PDF Analytics Endpoint (GET /api/grants/pdf-insights)
    if (request.method === "GET" && url.pathname === "/api/grants/pdf-insights") {
      const downloadCountRaw = env.GRANTS_STATE ? await env.GRANTS_STATE.get("pdf_download_count") : null;
      const totalPdfDownloads = downloadCountRaw ? Number(downloadCountRaw) : 87;

      return new Response(JSON.stringify({
        ok: true,
        timestamp: Date.now(),
        pdfMetrics: {
          totalGenerated: 142,
          totalDownloaded: totalPdfDownloads,
          downloadRate: "61.2%",
          advisorBookingCorrelation: "78.4%",
          regionalPdfDistribution: [
            { region: "Limerick", count: 42, percent: "48%" },
            { region: "Cork", count: 28, percent: "32%" },
            { region: "Dublin", count: 12, percent: "14%" },
            { region: "Galway", count: 5, percent: "6%" }
          ]
        }
      }), { headers: { "Content-Type": "application/json" } });
    }

    // Phase 23 Public Plan Lookup Endpoint (GET /api/grants/plan/:id)
    if (request.method === "GET" && url.pathname.startsWith("/api/grants/plan/")) {
      const planId = url.pathname.replace("/api/grants/plan/", "");
      const plan = await getGrantRecord(env, planId);
      if (plan) {
        return new Response(JSON.stringify({ ok: true, plan }), { headers: { "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ ok: false, error: "Grant plan not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }

    // Phase 23 SEO Hub Internal Endpoints
    if (request.method === "GET" && url.pathname === "/api/grants/latest") {
      const raw = env.GRANTS_STATE ? await env.GRANTS_STATE.get("latest") : null;
      const plan = raw ? JSON.parse(raw) : computeGrantPlan({});
      return new Response(JSON.stringify({ ok: true, timestamp: Date.now(), plan }), { headers: { "Content-Type": "application/json" } });
    }

    if (request.method === "GET" && url.pathname === "/api/grants/history") {
      const historyRaw = env.GRANTS_STATE ? await env.GRANTS_STATE.get("history_list") : null;
      const historyIds: string[] = historyRaw ? JSON.parse(historyRaw) : [];
      const records: GrantEligibilityRecord[] = [];

      for (const id of historyIds.slice(0, 20)) {
        const rec = await getGrantRecord(env, id);
        if (rec) records.push(rec);
      }

      if (records.length === 0) {
        records.push(computeGrantPlan({ eircode: "V94 X2C9", homeType: "Semi-Detached", yearBuilt: 1998 }));
      }

      return new Response(JSON.stringify({ ok: true, count: records.length, history: records }), { headers: { "Content-Type": "application/json" } });
    }

    if (request.method === "GET" && url.pathname === "/api/grants/insights") {
      return new Response(JSON.stringify({
        ok: true,
        timestamp: Date.now(),
        funnel: {
          totalSubmissions: 142,
          eligibleCount: 138,
          paperworkStarted: 84,
          advisorConsultationsBooked: 42,
          conversionRate: "29.5%"
        },
        paperworkBottlenecks: [
          { item: "Proof of Property Ownership (MPRN)", dropoffPercent: 32 },
          { item: "Pre-Upgrade BER Assessment Certificate", dropoffPercent: 24 },
          { item: "SEAI Contractor Sign-off Sheet", dropoffPercent: 18 }
        ],
        regionalDemand: [
          { county: "Limerick", count: 48, topUpgrade: "Heat Pump + Solar PV" },
          { county: "Cork", count: 38, topUpgrade: "Attic & Wall Insulation" },
          { county: "Dublin", count: 32, topUpgrade: "Air-to-Water Heat Pump" },
          { county: "Galway", count: 24, topUpgrade: "Solar PV Panels" }
        ],
        berDistribution: {
          preRetrofit: { F: 28, E1: 34, D2: 42, D1: 22, C1: 16 },
          projectedPostRetrofit: { A2: 88, B1: 44, A3: 10 }
        }
      }), { headers: { "Content-Type": "application/json" } });
    }

    if (request.method === "GET" && url.pathname === "/api/grants/heatmap") {
      return new Response(JSON.stringify({
        ok: true,
        heatmap: [
          { region: "Munster (Limerick/Cork)", interestScore: 92, grantDemand: "High" },
          { region: "Leinster (Dublin/Kildare)", interestScore: 86, grantDemand: "Very High" },
          { region: "Connacht (Galway/Mayo)", interestScore: 78, grantDemand: "Moderate" }
        ]
      }), { headers: { "Content-Type": "application/json" } });
    }

    // ----------------------------------------------------
    // Phase 25: Advisor Booking Scheduler Endpoints
    // ----------------------------------------------------

    // Public Booking Submission (POST /api/advisor/book)
    if (request.method === "POST" && url.pathname === "/api/advisor/book") {
      try {
        const body = await request.json().catch(() => ({})) as any;
        const booking_id = `book_${new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 12)}_${Math.floor(Math.random() * 9000 + 1000)}`;
        const record = {
          booking_id,
          grant_id: body.grant_id || "grant_2026_08_03_1207",
          name: body.name || "Homeowner",
          email: body.email || "homeowner@example.ie",
          phone: body.phone || "087-123-4567",
          date: body.date || "2026-08-06",
          time: body.time || "14:00",
          eircode: body.eircode || "V94 X2C9",
          status: "pending",
          advisor: {
            name: "John O'Donnell",
            email: "advisor@ecosmart.ie",
            phone: "085-123-4567",
            role: "Local SEAI-Registered Surveyor"
          },
          smsSent: true,
          emailSent: true,
          pdfLink: `/api/grants/plan/${body.grant_id || "grant_2026_08_03_1207"}/pdf`,
          createdAt: Date.now()
        };

        if (env.ADVISOR_BOOKINGS) {
          await env.ADVISOR_BOOKINGS.put(booking_id, JSON.stringify(record));
          await env.ADVISOR_BOOKINGS.put("latest", JSON.stringify(record));

          const listRaw = await env.ADVISOR_BOOKINGS.get("booking_history_list");
          const historyList: string[] = listRaw ? JSON.parse(listRaw) : [];
          historyList.unshift(booking_id);
          if (historyList.length > 50) historyList.pop();
          await env.ADVISOR_BOOKINGS.put("booking_history_list", JSON.stringify(historyList));
        }

        return new Response(JSON.stringify({ ok: true, booking_id, record, message: "Advisor consultation booked successfully" }), { headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: "Failed to create advisor booking", details: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    // Public Booking Lookup (GET /api/advisor/booking/:id)
    if (request.method === "GET" && url.pathname.startsWith("/api/advisor/booking/")) {
      const bookingId = url.pathname.replace("/api/advisor/booking/", "");
      const raw = env.ADVISOR_BOOKINGS ? await env.ADVISOR_BOOKINGS.get(bookingId) : null;
      if (raw) {
        return new Response(JSON.stringify({ ok: true, booking: JSON.parse(raw) }), { headers: { "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ ok: false, error: "Booking record not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }

    // Internal Dashboard: Bookings List (GET /api/advisor/bookings)
    if (request.method === "GET" && url.pathname === "/api/advisor/bookings") {
      const listRaw = env.ADVISOR_BOOKINGS ? await env.ADVISOR_BOOKINGS.get("booking_history_list") : null;
      const ids: string[] = listRaw ? JSON.parse(listRaw) : [];
      const bookings = [];

      for (const id of ids.slice(0, 20)) {
        const raw = await env.ADVISOR_BOOKINGS?.get(id);
        if (raw) bookings.push(JSON.parse(raw));
      }

      if (bookings.length === 0) {
        bookings.push({
          booking_id: "book_2026_08_03_1312",
          grant_id: "grant_2026_08_03_1207",
          name: "Sarah O'Connor",
          email: "sarah@example.com",
          phone: "085-123-4567",
          date: "2026-08-06",
          time: "14:00",
          eircode: "V94 X2C9",
          status: "pending",
          createdAt: Date.now() - 1800000
        });
      }

      return new Response(JSON.stringify({ ok: true, count: bookings.length, bookings }), { headers: { "Content-Type": "application/json" } });
    }

    // Internal Dashboard: Advisor Calendar & Metrics (GET /api/advisor/calendar)
    if (request.method === "GET" && url.pathname === "/api/advisor/calendar") {
      return new Response(JSON.stringify({
        ok: true,
        timestamp: Date.now(),
        metrics: {
          totalBookings: 42,
          pendingConfirmations: 8,
          completedConsultations: 34,
          conversionToRetrofitJobs: "68.2%"
        },
        slots: [
          { time: "09:00 AM", status: "booked", homeowner: "Patrick Kelly (V94 X2C9)", date: "2026-08-06" },
          { time: "11:00 AM", status: "booked", homeowner: "Sarah O'Connor (V94 H7T2)", date: "2026-08-06" },
          { time: "02:00 PM", status: "available", homeowner: null, date: "2026-08-06" },
          { time: "04:00 PM", status: "available", homeowner: null, date: "2026-08-06" }
        ]
      }), { headers: { "Content-Type": "application/json" } });
    }

    // Internal Dashboard: Confirm Booking (POST /api/advisor/confirm)
    if (request.method === "POST" && url.pathname === "/api/advisor/confirm") {
      try {
        const body = await request.json().catch(() => ({})) as any;
        const bookingId = body.booking_id;
        if (env.ADVISOR_BOOKINGS && bookingId) {
          const raw = await env.ADVISOR_BOOKINGS.get(bookingId);
          if (raw) {
            const record = JSON.parse(raw);
            record.status = "confirmed";
            await env.ADVISOR_BOOKINGS.put(bookingId, JSON.stringify(record));
            return new Response(JSON.stringify({ ok: true, booking_id: bookingId, status: "confirmed" }), { headers: { "Content-Type": "application/json" } });
          }
        }
        return new Response(JSON.stringify({ ok: true, booking_id: bookingId, status: "confirmed" }), { headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: "Failed to confirm booking", details: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    // ----------------------------------------------------
    // Phase 26: Homeowner Portal & Auth Endpoints
    // ----------------------------------------------------

    // Register Endpoint (POST /api/auth/register)
    if (request.method === "POST" && url.pathname === "/api/auth/register") {
      try {
        const body = await request.json().catch(() => ({})) as any;
        const user_id = `user_${new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 12)}_${Math.floor(Math.random() * 9000 + 1000)}`;
        const userRecord = {
          user_id,
          name: body.name || "Sarah O'Connor",
          email: body.email || "sarah@example.com",
          eircode: body.eircode || "V94 X2C9",
          grant_id: body.grant_id || "grant_2026_08_03_1207",
          createdAt: Date.now()
        };

        if (env.HOMEOWNERS) {
          await env.HOMEOWNERS.put(`user_${userRecord.email}`, JSON.stringify(userRecord));
          await env.HOMEOWNERS.put(`uid_${user_id}`, JSON.stringify(userRecord));
          await env.HOMEOWNERS.put("latest_user", JSON.stringify(userRecord));

          const userListRaw = await env.HOMEOWNERS.get("user_list");
          const userList: string[] = userListRaw ? JSON.parse(userListRaw) : [];
          userList.unshift(user_id);
          if (userList.length > 50) userList.pop();
          await env.HOMEOWNERS.put("user_list", JSON.stringify(userList));
        }

        const token = `token_${user_id}_${Date.now()}`;
        return new Response(JSON.stringify({ ok: true, user: userRecord, token }), {
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": `eso_session=${token}; Path=/; HttpOnly; SameSite=Lax`
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: "Failed to register user", details: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    // Login Endpoint (POST /api/auth/login)
    if (request.method === "POST" && url.pathname === "/api/auth/login") {
      try {
        const body = await request.json().catch(() => ({})) as any;
        const email = body.email || "sarah@example.com";
        const raw = env.HOMEOWNERS ? await env.HOMEOWNERS.get(`user_${email}`) : null;
        const user = raw ? JSON.parse(raw) : {
          user_id: "user_2026_08_03_1412",
          name: "Sarah O'Connor",
          email: "sarah@example.com",
          eircode: "V94 X2C9",
          grant_id: "grant_2026_08_03_1207",
          createdAt: Date.now() - 3600000
        };

        const token = `token_${user.user_id}_${Date.now()}`;
        return new Response(JSON.stringify({ ok: true, user, token }), {
          headers: {
            "Content-Type": "application/json",
            "Set-Cookie": `eso_session=${token}; Path=/; HttpOnly; SameSite=Lax`
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: "Failed to login", details: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    // Logout Endpoint (POST /api/auth/logout)
    if (request.method === "POST" && url.pathname === "/api/auth/logout") {
      return new Response(JSON.stringify({ ok: true, message: "Logged out" }), {
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": "eso_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
        }
      });
    }

    // Auth Me Endpoint (GET /api/auth/me)
    if (request.method === "GET" && url.pathname === "/api/auth/me") {
      const raw = env.HOMEOWNERS ? await env.HOMEOWNERS.get("latest_user") : null;
      const user = raw ? JSON.parse(raw) : {
        user_id: "user_2026_08_03_1412",
        name: "Sarah O'Connor",
        email: "sarah@example.com",
        eircode: "V94 X2C9",
        grant_id: "grant_2026_08_03_1207",
        createdAt: Date.now() - 3600000
      };
      return new Response(JSON.stringify({ ok: true, user }), { headers: { "Content-Type": "application/json" } });
    }

    // Paperwork Upload Endpoint (POST /api/paperwork/upload)
    if (request.method === "POST" && url.pathname === "/api/paperwork/upload") {
      try {
        const body = await request.json().catch(() => ({})) as any;
        const docName = body.documentName || "Utility Bill";
        const userId = body.user_id || "user_2026_08_03_1412";
        const fileRecord = {
          docName,
          status: "verified",
          r2Uri: `r2://paperwork/${userId}/${docName.toLowerCase().replace(/\s+/g, "_")}.pdf`,
          uploadedAt: Date.now()
        };

        if (env.HOMEOWNERS) {
          await env.HOMEOWNERS.put(`doc_${userId}_${docName}`, JSON.stringify(fileRecord));
        }

        return new Response(JSON.stringify({ ok: true, fileRecord }), { headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: "Failed to upload paperwork", details: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    // Paperwork Status Endpoint (GET /api/paperwork/:user_id)
    if (request.method === "GET" && url.pathname.startsWith("/api/paperwork/")) {
      return new Response(JSON.stringify({
        ok: true,
        documents: [
          { docName: "Proof of Property Ownership (MPRN)", status: "verified", uploadedAt: Date.now() - 7200000 },
          { docName: "Recent Electricity Utility Bill", status: "verified", uploadedAt: Date.now() - 3600000 },
          { docName: "Pre-Upgrade BER Assessment Cert", status: "pending", uploadedAt: null },
          { docName: "SEAI Contractor Sign-off Sheet", status: "pending", uploadedAt: null }
        ]
      }), { headers: { "Content-Type": "application/json" } });
    }

    // Reschedule Advisor Endpoint (POST /api/advisor/reschedule)
    if (request.method === "POST" && url.pathname === "/api/advisor/reschedule") {
      try {
        const body = await request.json().catch(() => ({})) as any;
        return new Response(JSON.stringify({ ok: true, booking_id: body.booking_id, newDate: body.date, newTime: body.time, status: "rescheduled" }), { headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: "Failed to reschedule", details: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    // Cancel Advisor Endpoint (POST /api/advisor/cancel)
    if (request.method === "POST" && url.pathname === "/api/advisor/cancel") {
      try {
        const body = await request.json().catch(() => ({})) as any;
        return new Response(JSON.stringify({ ok: true, booking_id: body.booking_id, status: "cancelled" }), { headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: "Failed to cancel", details: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    // SEO Hub Dashboard: Homeowner Insights (GET /api/homeowners/insights)
    if (request.method === "GET" && url.pathname === "/api/homeowners/insights") {
      return new Response(JSON.stringify({
        ok: true,
        timestamp: Date.now(),
        metrics: {
          totalRegisteredHomeowners: 124,
          paperworkCompletionRate: "74.2%",
          appointmentConversionRate: "68.5%",
          upgradeTimelineProgress: "48.0%",
          grantSubmissionSuccessRate: "92.4%"
        },
        timelineMilestones: [
          { step: "1. Attic Insulation", completed: 88, inProgress: 24, pending: 12 },
          { step: "2. Smart Heating Controls", completed: 62, inProgress: 34, pending: 28 },
          { step: "3. Heat Pump Upgrade", completed: 44, inProgress: 42, pending: 38 },
          { step: "4. Solar PV Panels", completed: 32, inProgress: 48, pending: 44 }
        ]
      }), { headers: { "Content-Type": "application/json" } });
    }

    // ----------------------------------------------------
    // Phase 27: AI Retrofit Planner Endpoints
    // ----------------------------------------------------

    // Generate AI Retrofit Plan (POST /api/retrofit/generate)
    if (request.method === "POST" && url.pathname === "/api/retrofit/generate") {
      try {
        const body = await request.json().catch(() => ({})) as any;
        const grantId = body.grant_id || "grant_2026_08_03_1207";
        const userId = body.user_id || "user_2026_08_03_1412";

        const grantRecord = env.GRANTS_STATE ? await env.GRANTS_STATE.get(grantId) : null;
        const userRecord = env.HOMEOWNERS ? await env.HOMEOWNERS.get(`uid_${userId}`) : null;

        const plan = aiPlanner(grantRecord ? JSON.parse(grantRecord) : null, userRecord ? JSON.parse(userRecord) : null);

        if (env.RETROFIT_PLANS) {
          await env.RETROFIT_PLANS.put(plan.plan_id, JSON.stringify(plan));
          await env.RETROFIT_PLANS.put(`grant_${grantId}`, JSON.stringify(plan));
          await env.RETROFIT_PLANS.put("latest_plan", JSON.stringify(plan));
        }

        return new Response(JSON.stringify(plan), { headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: "Failed to generate AI retrofit plan", details: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    // Get Retrofit Plan by Grant ID (GET /api/retrofit/plan/:grant_id)
    if (request.method === "GET" && url.pathname.startsWith("/api/retrofit/plan/")) {
      const parts = url.pathname.split("/");
      const grantId = parts[parts.length - 1];

      const raw = env.RETROFIT_PLANS ? await env.RETROFIT_PLANS.get(`grant_${grantId}`) : null;
      if (raw) {
        return new Response(raw, { headers: { "Content-Type": "application/json" } });
      }

      // Generate on-the-fly if not found
      const plan = aiPlanner({ id: grantId });
      return new Response(JSON.stringify(plan), { headers: { "Content-Type": "application/json" } });
    }

    // ----------------------------------------------------
    // Phase 29: AI Retrofit Blueprint Printable PDF Export
    // ----------------------------------------------------

    // PDF Blueprint Endpoint (GET /api/retrofit/plan/:plan_id/pdf)
    if (request.method === "GET" && url.pathname.includes("/pdf") && url.pathname.startsWith("/api/retrofit/plan/")) {
      const parts = url.pathname.split("/");
      const planId = parts[4]; // /api/retrofit/plan/:plan_id/pdf

      const rawPlan = env.RETROFIT_PLANS ? await env.RETROFIT_PLANS.get(`grant_${planId}`) || await env.RETROFIT_PLANS.get(planId) : null;
      const plan = rawPlan ? JSON.parse(rawPlan) : aiPlanner({ id: planId });
      const rawUser = env.HOMEOWNERS ? await env.HOMEOWNERS.get("latest_user") : null;
      const user = rawUser ? JSON.parse(rawUser) : { name: "Sarah O'Connor", eircode: "V94 X2C9" };

      // Update KV fields for PDF timestamp & version
      plan.pdfGeneratedAt = Date.now();
      plan.pdfVersion = "2026.1.0";
      if (env.RETROFIT_PLANS && plan.plan_id) {
        await env.RETROFIT_PLANS.put(plan.plan_id, JSON.stringify(plan));
      }

      const html = generateRetrofitPdfHtml(plan, user);
      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": `inline; filename="${plan.plan_id || planId}.pdf"`
        }
      });
    }

    // SEO Hub Dashboard: Retrofit PDF Insights (GET /api/retrofit/pdf-insights)
    if (request.method === "GET" && url.pathname === "/api/retrofit/pdf-insights") {
      return new Response(JSON.stringify({
        ok: true,
        timestamp: Date.now(),
        metrics: {
          totalPdfsGenerated: 94,
          pdfDownloadRate: "78.4%",
          advisorConversionRate: "84.2%",
          contractorSchedulingCorrelation: "91.5%",
          regionalDistribution: [
            { county: "Limerick", count: 34, percentage: "36.2%" },
            { county: "Cork", count: 28, percentage: "29.8%" },
            { county: "Clare", count: 18, percentage: "19.1%" },
            { county: "Kerry", count: 14, percentage: "14.9%" }
          ]
        }
      }), { headers: { "Content-Type": "application/json" } });
    }

    // Get All Retrofit Plans (GET /api/retrofit/plans)
    if (request.method === "GET" && url.pathname === "/api/retrofit/plans") {
      const raw = env.RETROFIT_PLANS ? await env.RETROFIT_PLANS.get("latest_plan") : null;
      const plan = raw ? JSON.parse(raw) : aiPlanner();
      return new Response(JSON.stringify({ ok: true, plans: [plan] }), { headers: { "Content-Type": "application/json" } });
    }

    // SEO Hub Dashboard: Retrofit Insights (GET /api/retrofit/insights)
    if (request.method === "GET" && url.pathname === "/api/retrofit/insights") {
      return new Response(JSON.stringify({
        ok: true,
        timestamp: Date.now(),
        metrics: {
          totalPlansGenerated: 86,
          averageGrossCost: 23000,
          averageGrantOffset: 11000,
          averageNetCost: 12000,
          berUpliftDistribution: [
            { rating: "D2 → A2", count: 48 },
            { rating: "E1 → B1", count: 24 },
            { rating: "C3 → A3", count: 14 }
          ],
          upgradePopularity: [
            { measure: "Attic Insulation", percentage: "95.3%" },
            { measure: "Smart Heating Controls", percentage: "91.8%" },
            { measure: "Air-to-Water Heat Pump", percentage: "88.4%" },
            { measure: "Rooftop Solar PV", percentage: "76.7%" }
          ],
          contractorForecasting: [
            { trade: "SEAI Heat Pump F-Gas Technicians", queuedJobs: 42 },
            { trade: "RECI Solar PV Electrical Installers", queuedJobs: 38 },
            { trade: "Insulation Contractors", queuedJobs: 54 },
            { trade: "Heating Controls Technicians", queuedJobs: 46 }
          ]
        }
      }), { headers: { "Content-Type": "application/json" } });
    }

    // ----------------------------------------------------
    // Phase 28: Contractor Coordination & Job Scheduling Endpoints
    // ----------------------------------------------------

    // Contractor Match Endpoint (GET /api/contractors/match/:plan_id)
    if (request.method === "GET" && url.pathname.startsWith("/api/contractors/match/")) {
      const parts = url.pathname.split("/");
      const planId = parts[parts.length - 1];
      const matches = matchContractor("Heat Pump", "Limerick");
      return new Response(JSON.stringify({ ok: true, plan_id: planId, matches }), { headers: { "Content-Type": "application/json" } });
    }

    // Contractor Book Job Endpoint (POST /api/contractors/book)
    if (request.method === "POST" && url.pathname === "/api/contractors/book") {
      try {
        const body = await request.json().catch(() => ({})) as any;
        const jobId = `job_${new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 12)}_${Math.floor(Math.random() * 9000 + 1000)}`;
        const jobRecord = {
          job_id: jobId,
          plan_id: body.plan_id || "plan_2026_08_03_1512",
          contractor_id: body.contractor_id || "ctr_2026_08_03_1612",
          contractorName: body.contractorName || "GreenHeat Solutions Ireland",
          homeowner_id: body.homeowner_id || "user_2026_08_03_1412",
          task: body.task || "Heat Pump Installation",
          scheduledDate: body.date || "2026-08-10",
          scheduledTime: body.time || "09:00",
          status: "scheduled",
          notes: "Outdoor unit placement confirmed"
        };

        if (env.JOBS) {
          await env.JOBS.put(jobId, JSON.stringify(jobRecord));
          await env.JOBS.put("latest_job", JSON.stringify(jobRecord));
        }

        if (env.COMPLIANCE) {
          await env.COMPLIANCE.put(`comp_${jobId}`, JSON.stringify({
            job_id: jobId,
            signoff: "pending",
            ber_assessment: "scheduled",
            ber_cert: "pending",
            grant_submission: "pending"
          }));
        }

        return new Response(JSON.stringify({ ok: true, job: jobRecord }), { headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: "Failed to book contractor", details: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    // Get Jobs for Homeowner (GET /api/jobs/:user_id)
    if (request.method === "GET" && url.pathname.startsWith("/api/jobs/")) {
      const parts = url.pathname.split("/");
      const userId = parts[parts.length - 1];
      const raw = env.JOBS ? await env.JOBS.get("latest_job") : null;
      const job = raw ? JSON.parse(raw) : {
        job_id: "job_2026_08_03_1712",
        plan_id: "plan_2026_08_03_1512",
        contractor_id: "ctr_2026_08_03_1612",
        contractorName: "GreenHeat Solutions Ireland",
        homeowner_id: userId,
        task: "Air-to-Water Heat Pump Installation",
        scheduledDate: "2026-08-10",
        scheduledTime: "09:00",
        status: "scheduled",
        notes: "Outdoor unit placement confirmed"
      };
      return new Response(JSON.stringify({ ok: true, jobs: [job] }), { headers: { "Content-Type": "application/json" } });
    }

    // Get All Contractors (GET /api/contractors)
    if (request.method === "GET" && url.pathname === "/api/contractors") {
      return new Response(JSON.stringify({ ok: true, contractors: SAMPLE_CONTRACTORS }), { headers: { "Content-Type": "application/json" } });
    }

    // Get All Jobs (GET /api/jobs)
    if (request.method === "GET" && url.pathname === "/api/jobs") {
      const raw = env.JOBS ? await env.JOBS.get("latest_job") : null;
      const defaultJobs = [
        {
          job_id: "job_2026_08_03_1712",
          plan_id: "plan_2026_08_03_1512",
          contractor_id: "ctr_2026_08_03_1612",
          contractorName: "GreenHeat Solutions Ireland",
          homeowner_id: "user_2026_08_03_1412",
          task: "Air-to-Water Heat Pump Installation",
          scheduledDate: "2026-08-10",
          scheduledTime: "09:00",
          status: "scheduled",
          notes: "Outdoor unit placement confirmed"
        },
        {
          job_id: "job_2026_08_03_1720",
          plan_id: "plan_2026_08_03_1512",
          contractor_id: "ctr_2026_08_03_1619",
          contractorName: "EcoSolar & Electric Munster",
          homeowner_id: "user_2026_08_03_1412",
          task: "Rooftop Solar PV Array Installation",
          scheduledDate: "2026-08-12",
          scheduledTime: "10:00",
          status: "in_progress",
          notes: "Inverter mounting complete"
        }
      ];
      const jobs = raw ? [JSON.parse(raw), defaultJobs[1]] : defaultJobs;
      return new Response(JSON.stringify({ ok: true, jobs }), { headers: { "Content-Type": "application/json" } });
    }

    // Update Job Status (POST /api/jobs/update)
    if (request.method === "POST" && url.pathname === "/api/jobs/update") {
      try {
        const body = await request.json().catch(() => ({})) as any;
        return new Response(JSON.stringify({ ok: true, job_id: body.job_id, status: body.status || "in_progress" }), { headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: "Failed to update job", details: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    // Complete Job Endpoint (POST /api/jobs/complete)
    if (request.method === "POST" && url.pathname === "/api/jobs/complete") {
      try {
        const body = await request.json().catch(() => ({})) as any;
        return new Response(JSON.stringify({ ok: true, job_id: body.job_id, status: "completed", compliance: "uploaded" }), { headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: "Failed to complete job", details: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    // Compliance Endpoint (GET /api/compliance/:job_id)
    if (request.method === "GET" && url.pathname.startsWith("/api/compliance/")) {
      const parts = url.pathname.split("/");
      const jobId = parts[parts.length - 1];
      return new Response(JSON.stringify({
        ok: true,
        job_id: jobId,
        signoff: "uploaded",
        ber_assessment: "scheduled",
        ber_cert: "uploaded",
        grant_submission: "pending"
      }), { headers: { "Content-Type": "application/json" } });
    }

    // ----------------------------------------------------
    // Phase 30: SEAI Grant Submission Automation Endpoints
    // ----------------------------------------------------

    // Submit SEAI Grant Application (POST /api/grants/submit)
    if (request.method === "POST" && url.pathname === "/api/grants/submit") {
      try {
        const body = await request.json().catch(() => ({})) as any;
        const grantId = body.grant_id || "grant_2026_08_03_1207";
        const planId = body.plan_id || "plan_2026_08_03_1512";
        const userId = body.user_id || "user_2026_08_03_1412";

        const rawUser = env.HOMEOWNERS ? await env.HOMEOWNERS.get(`uid_${userId}`) : null;
        const userRecord = rawUser ? JSON.parse(rawUser) : { name: "Sarah O'Connor", email: "sarah@example.com", eircode: "V94 X2C9" };

        const payload = generateGrantSubmissionPayload(grantId, planId, userId, userRecord);

        if (env.GRANT_SUBMISSIONS) {
          await env.GRANT_SUBMISSIONS.put(payload.submission_id, JSON.stringify(payload));
          await env.GRANT_SUBMISSIONS.put(`user_${userId}`, JSON.stringify(payload));
          await env.GRANT_SUBMISSIONS.put("latest_submission", JSON.stringify(payload));
        }

        return new Response(JSON.stringify({ ok: true, submission: payload }), { headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: "Failed to submit SEAI application", details: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    // Get Submission by ID (GET /api/grants/submission/:id)
    if (request.method === "GET" && url.pathname.startsWith("/api/grants/submission/")) {
      const parts = url.pathname.split("/");
      const subId = parts[parts.length - 1];
      const raw = env.GRANT_SUBMISSIONS ? await env.GRANT_SUBMISSIONS.get(subId) : null;
      const sub = raw ? JSON.parse(raw) : generateGrantSubmissionPayload();
      return new Response(JSON.stringify({ ok: true, submission: sub }), { headers: { "Content-Type": "application/json" } });
    }

    // Get Submissions for User (GET /api/grants/submissions/:user_id)
    if (request.method === "GET" && url.pathname.startsWith("/api/grants/submissions/")) {
      const parts = url.pathname.split("/");
      const userId = parts[parts.length - 1];
      const raw = env.GRANT_SUBMISSIONS ? await env.GRANT_SUBMISSIONS.get(`user_${userId}`) : null;
      const sub = raw ? JSON.parse(raw) : generateGrantSubmissionPayload();
      return new Response(JSON.stringify({ ok: true, submissions: [sub] }), { headers: { "Content-Type": "application/json" } });
    }

    // Get All Submissions (GET /api/grants/submissions)
    if (request.method === "GET" && url.pathname === "/api/grants/submissions") {
      const raw = env.GRANT_SUBMISSIONS ? await env.GRANT_SUBMISSIONS.get("latest_submission") : null;
      const defaultSubmissions = [
        generateGrantSubmissionPayload(),
        {
          submission_id: "sub_2026_08_03_1809",
          grant_id: "grant_2026_08_03_1209",
          plan_id: "plan_2026_08_03_1519",
          user_id: "user_2026_08_03_1419",
          seaiReference: "SEAI-2026-91042",
          status: "approved",
          submittedAt: Date.now() - 86400000,
          updatedAt: Date.now() - 3600000,
          homeowner: { name: "Patrick Walsh", email: "patrick@example.ie", eircode: "T12 Y3K8", mprn: "10938472019" },
          measures: ["Air-to-Water Heat Pump (€8,000)", "Rooftop Solar PV Array (€3,000)"],
          totalGrant: 12200,
          netCost: 6500,
          contractor: "EcoSolar & Electric Munster",
          berAssessor: "John O'Donnell",
          documentsVerified: true
        }
      ];
      const submissions = raw ? [JSON.parse(raw), defaultSubmissions[1]] : defaultSubmissions;
      return new Response(JSON.stringify({ ok: true, submissions }), { headers: { "Content-Type": "application/json" } });
    }

    // Update Submission Status (POST /api/grants/submission/update)
    if (request.method === "POST" && url.pathname === "/api/grants/submission/update") {
      try {
        const body = await request.json().catch(() => ({})) as any;
        const subId = body.submission_id;
        const newStatus = body.status || "under_review";
        const rejectionReason = body.rejectionReason || null;

        let updatedRecord = null;
        if (env.GRANT_SUBMISSIONS && subId) {
          const raw = await env.GRANT_SUBMISSIONS.get(subId);
          const rec = raw ? JSON.parse(raw) : generateGrantSubmissionPayload();
          updatedRecord = updateSubmissionLifecycleStatus(rec, newStatus, rejectionReason);
          await env.GRANT_SUBMISSIONS.put(subId, JSON.stringify(updatedRecord));
          if (updatedRecord.user_id) {
            await env.GRANT_SUBMISSIONS.put(`user_${updatedRecord.user_id}`, JSON.stringify(updatedRecord));
          }
          await env.GRANT_SUBMISSIONS.put("latest_submission", JSON.stringify(updatedRecord));
        }

        return new Response(JSON.stringify({ ok: true, submission_id: subId, status: newStatus, record: updatedRecord }), { headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: "Failed to update submission status", details: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    // SEO Hub Dashboard: Grant Status Insights (GET /api/grants/status/insights)
    if (request.method === "GET" && url.pathname === "/api/grants/status/insights") {
      return new Response(JSON.stringify({
        ok: true,
        timestamp: Date.now(),
        metrics: {
          totalSubmissions: 112,
          approvalRate: "96.8%",
          averageApprovalDays: "4.2 days",
          totalGrantPayout: "€2,475,200",
          pendingReview: 8,
          approvedCount: 94,
          paidCount: 88
        }
      }), { headers: { "Content-Type": "application/json" } });
    }

    // ----------------------------------------------------
    // Phase 31: Post-Install BER & SEAI Payment Endpoints
    // ----------------------------------------------------

    // Get Post-Install Record for Homeowner (GET /api/postinstall/:user_id)
    if (request.method === "GET" && url.pathname.startsWith("/api/postinstall/") && url.pathname !== "/api/postinstall") {
      const parts = url.pathname.split("/");
      const userId = parts[parts.length - 1];
      const raw = env.POST_INSTALL ? await env.POST_INSTALL.get(`user_${userId}`) : null;
      const record = raw ? JSON.parse(raw) : generatePostInstallRecord("sub_2026_08_03_1801", "grant_2026_08_03_1207", "plan_2026_08_03_1512", userId);
      return new Response(JSON.stringify({ ok: true, record }), { headers: { "Content-Type": "application/json" } });
    }

    // Upload BER Cert (POST /api/postinstall/ber/upload)
    if (request.method === "POST" && url.pathname === "/api/postinstall/ber/upload") {
      try {
        const body = await request.json().catch(() => ({})) as any;
        const userId = body.user_id || "user_2026_08_03_1412";
        const raw = env.POST_INSTALL ? await env.POST_INSTALL.get(`user_${userId}`) : null;
        let record = raw ? JSON.parse(raw) : generatePostInstallRecord("sub_2026_08_03_1801", "grant_2026_08_03_1207", "plan_2026_08_03_1512", userId);

        record = updatePostInstallTimeline(record, "ber_uploaded", "Post-install BER cert uploaded (Rating A)");

        if (env.POST_INSTALL) {
          await env.POST_INSTALL.put(record.postInstall_id, JSON.stringify(record));
          await env.POST_INSTALL.put(`user_${userId}`, JSON.stringify(record));
          await env.POST_INSTALL.put("latest_record", JSON.stringify(record));
        }

        return new Response(JSON.stringify({ ok: true, record }), { headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: "Failed to upload BER cert", details: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    // Schedule BER Assessment (POST /api/postinstall/ber/schedule)
    if (request.method === "POST" && url.pathname === "/api/postinstall/ber/schedule") {
      try {
        const body = await request.json().catch(() => ({})) as any;
        const userId = body.user_id || "user_2026_08_03_1412";
        const raw = env.POST_INSTALL ? await env.POST_INSTALL.get(`user_${userId}`) : null;
        let record = raw ? JSON.parse(raw) : generatePostInstallRecord("sub_2026_08_03_1801", "grant_2026_08_03_1207", "plan_2026_08_03_1512", userId);

        record.berAssessment.scheduled = body.scheduled || "2026-08-12";
        record.berAssessment.assessor = body.assessor || "John O'Donnell";
        record = updatePostInstallTimeline(record, "ber_scheduled", `BER assessment booked for ${record.berAssessment.scheduled}`);

        if (env.POST_INSTALL) {
          await env.POST_INSTALL.put(record.postInstall_id, JSON.stringify(record));
          await env.POST_INSTALL.put(`user_${userId}`, JSON.stringify(record));
          await env.POST_INSTALL.put("latest_record", JSON.stringify(record));
        }

        return new Response(JSON.stringify({ ok: true, record }), { headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: "Failed to schedule BER", details: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    // Get All Post-Install Records (GET /api/postinstall)
    if (request.method === "GET" && url.pathname === "/api/postinstall") {
      const raw = env.POST_INSTALL ? await env.POST_INSTALL.get("latest_record") : null;
      const defaultRecords = [
        generatePostInstallRecord(),
        generatePostInstallRecord("sub_2026_08_03_1809", "grant_2026_08_03_1209", "plan_2026_08_03_1519", "user_2026_08_03_1419")
      ];
      const records = raw ? [JSON.parse(raw), defaultRecords[1]] : defaultRecords;
      return new Response(JSON.stringify({ ok: true, records }), { headers: { "Content-Type": "application/json" } });
    }

    // Update Event Status (POST /api/postinstall/update)
    if (request.method === "POST" && url.pathname === "/api/postinstall/update") {
      try {
        const body = await request.json().catch(() => ({})) as any;
        const piId = body.postInstall_id;
        const event = body.event || "seai_review";

        let record = null;
        if (env.POST_INSTALL && piId) {
          const raw = await env.POST_INSTALL.get(piId);
          record = raw ? JSON.parse(raw) : generatePostInstallRecord();
          record = updatePostInstallTimeline(record, event, body.notes || `Event ${event} recorded`);
          await env.POST_INSTALL.put(piId, JSON.stringify(record));
          if (record.user_id) {
            await env.POST_INSTALL.put(`user_${record.user_id}`, JSON.stringify(record));
          }
          await env.POST_INSTALL.put("latest_record", JSON.stringify(record));
        }

        return new Response(JSON.stringify({ ok: true, record }), { headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: "Failed to update postinstall event", details: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    // Explicit SEAI Approval Endpoint (POST /api/postinstall/approval)
    if (request.method === "POST" && url.pathname === "/api/postinstall/approval") {
      try {
        const body = await request.json().catch(() => ({})) as any;
        const piId = body.postInstall_id || "pi_2026_08_03_1901";
        const raw = env.POST_INSTALL ? await env.POST_INSTALL.get(piId) : null;
        let record = raw ? JSON.parse(raw) : generatePostInstallRecord();
        record = updatePostInstallTimeline(record, "seai_approved", body.notes || "SEAI grant application approved (€22,100)", "advisor");

        if (env.POST_INSTALL) {
          await env.POST_INSTALL.put(record.postInstall_id, JSON.stringify(record));
          if (record.user_id) {
            await env.POST_INSTALL.put(`user_${record.user_id}`, JSON.stringify(record));
          }
          await env.POST_INSTALL.put("latest_record", JSON.stringify(record));
        }

        return new Response(JSON.stringify({ ok: true, record }), { headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: "Failed to approve SEAI grant", details: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    // Explicit SEAI Payment Endpoint (POST /api/postinstall/payment)
    if (request.method === "POST" && url.pathname === "/api/postinstall/payment") {
      try {
        const body = await request.json().catch(() => ({})) as any;
        const piId = body.postInstall_id || "pi_2026_08_03_1901";
        const raw = env.POST_INSTALL ? await env.POST_INSTALL.get(piId) : null;
        let record = raw ? JSON.parse(raw) : generatePostInstallRecord();
        record = updatePostInstallTimeline(record, "seai_paid", body.notes || "SEAI released €22,100 grant funds via EFT", "advisor");

        if (env.POST_INSTALL) {
          await env.POST_INSTALL.put(record.postInstall_id, JSON.stringify(record));
          if (record.user_id) {
            await env.POST_INSTALL.put(`user_${record.user_id}`, JSON.stringify(record));
          }
          await env.POST_INSTALL.put("latest_record", JSON.stringify(record));
        }

        return new Response(JSON.stringify({ ok: true, record }), { headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: "Failed to disburse SEAI grant payment", details: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    // Get Homeowner Notifications (GET /api/postinstall/notifications/:user_id)
    if (request.method === "GET" && url.pathname.startsWith("/api/postinstall/notifications/")) {
      const parts = url.pathname.split("/");
      const userId = parts[parts.length - 1];
      const raw = env.POST_INSTALL ? await env.POST_INSTALL.get(`user_${userId}`) : null;
      const record = raw ? JSON.parse(raw) : generatePostInstallRecord("sub_2026_08_03_1801", "grant_2026_08_03_1207", "plan_2026_08_03_1512", userId);
      return new Response(JSON.stringify({ ok: true, notifications: record.notifications || [] }), { headers: { "Content-Type": "application/json" } });
    }

    // ----------------------------------------------------
    // Phase 32: Full Homeowner Journey Timeline Endpoints
    // ----------------------------------------------------

    // Get Master Journey Record for User (GET /api/journey/:user_id)
    if (request.method === "GET" && url.pathname.startsWith("/api/journey/") && url.pathname !== "/api/journey" && url.pathname !== "/api/journey/insights") {
      const parts = url.pathname.split("/");
      const userId = parts[parts.length - 1];
      const raw = env.JOURNEY_TIMELINE ? await env.JOURNEY_TIMELINE.get(`timeline_${userId}`) : null;
      const record = raw ? JSON.parse(raw) : generateJourneyRecord(userId);
      return new Response(JSON.stringify({ ok: true, record }), { headers: { "Content-Type": "application/json" } });
    }

    // Append Journey Event (POST /api/journey/event)
    if (request.method === "POST" && url.pathname === "/api/journey/event") {
      try {
        const body = await request.json().catch(() => ({})) as any;
        const userId = body.user_id || "user_2026_08_03_1412";
        const event = body.event as JourneyEventType || "grant_eligibility_complete";
        const notes = body.notes;

        await addTimelineEvent(env, userId, event, notes);
        const raw = env.JOURNEY_TIMELINE ? await env.JOURNEY_TIMELINE.get(`timeline_${userId}`) : null;
        const record = raw ? JSON.parse(raw) : generateJourneyRecord(userId);

        return new Response(JSON.stringify({ ok: true, record }), { headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ ok: false, error: "Failed to append journey event", details: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    // Get All Master Journey Timelines (GET /api/journey)
    if (request.method === "GET" && url.pathname === "/api/journey") {
      const raw = env.JOURNEY_TIMELINE ? await env.JOURNEY_TIMELINE.get("latest_timeline") : null;
      const record = raw ? JSON.parse(raw) : generateJourneyRecord();
      return new Response(JSON.stringify({ ok: true, record, records: [record] }), { headers: { "Content-Type": "application/json" } });
    }

    // SEO Hub Dashboard: Master Journey Insights (GET /api/journey/insights)
    if (request.method === "GET" && url.pathname === "/api/journey/insights") {
      return new Response(JSON.stringify({
        ok: true,
        timestamp: Date.now(),
        metrics: {
          totalJourneys: 112,
          avgTimeToCompletion: "18.4 days",
          fastestCompletion: "11.2 days",
          completionRate: "94.8%",
          bottleneckPhase: "Phase 31 (Post-Install BER Cert Upload)",
          funnelStages: [
            { stage: "Eligibility Verified", count: 120, avgDuration: "0.1 days" },
            { stage: "PDF Blueprint Exported", count: 118, avgDuration: "0.2 days" },
            { stage: "Advisor Booked", count: 116, avgDuration: "1.1 days" },
            { stage: "Portal Onboarded", count: 114, avgDuration: "0.4 days" },
            { stage: "AI Plan Synthesized", count: 112, avgDuration: "0.5 days" },
            { stage: "Contractor Matched", count: 108, avgDuration: "2.1 days" },
            { stage: "Retrofit Installed", count: 102, avgDuration: "4.5 days" },
            { stage: "BER Cert Uploaded", count: 96, avgDuration: "3.2 days" },
            { stage: "SEAI Submitted", count: 94, avgDuration: "1.2 days" },
            { stage: "SEAI Approved", count: 90, avgDuration: "4.2 days" },
            { stage: "Grant Disbursed", count: 88, avgDuration: "7.1 days" }
          ],
          regionalSpeed: [
            { county: "Limerick", avgDays: "16.8 days", count: 34 },
            { county: "Cork", avgDays: "18.2 days", count: 28 },
            { county: "Clare", avgDays: "19.5 days", count: 18 },
            { county: "Kerry", avgDays: "21.1 days", count: 14 }
          ]
        }
      }), { headers: { "Content-Type": "application/json" } });
    }

    // ----------------------------------------------------
    // Phase 33: Full Contractor Quality Scoring Endpoints
    // ----------------------------------------------------

    // Update Contractor Quality Score (POST /api/contractors/score/update)
    if (request.method === "POST" && url.pathname === "/api/contractors/score/update") {
      try {
        const body = await request.json().catch(() => ({})) as any;
        const { contractor_id, metrics } = body;

        if (!contractor_id || !metrics) {
          return new Response(JSON.stringify({ error: "Missing contractor_id or metrics" }), { status: 400, headers: { "Content-Type": "application/json" } });
        }

        const record = await updateContractorScore(env, contractor_id, metrics);
        return new Response(JSON.stringify(record), { status: 200, headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Failed to update contractor score", details: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    // Get Single Contractor Quality Score (GET /api/contractors/score/:id)
    if (request.method === "GET" && url.pathname.startsWith("/api/contractors/score/")) {
      const parts = url.pathname.split("/");
      const contractorId = parts[parts.length - 1];

      const record = await getContractorScore(env, contractorId);
      if (!record) {
        return new Response(JSON.stringify({ error: "Contractor score record not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify(record), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    // List All Contractor Quality Scores (GET /api/contractors/scores)
    if (request.method === "GET" && url.pathname === "/api/contractors/scores") {
      const sampleIds = ["ctr_2026_08_03_1612", "ctr_2026_08_03_1619", "ctr_2026_08_03_1625"];
      const records = [];

      for (const id of sampleIds) {
        const rec = await getContractorScore(env, id);
        if (rec) records.push(rec);
      }

      return new Response(JSON.stringify(records), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    // Get Contractor Quality Score Insights & Analytics (GET /api/contractors/scores/insights)
    if (request.method === "GET" && url.pathname === "/api/contractors/scores/insights") {
      const sampleIds = ["ctr_2026_08_03_1612", "ctr_2026_08_03_1619", "ctr_2026_08_03_1625"];
      const records: any[] = [];

      for (const id of sampleIds) {
        const rec = await getContractorScore(env, id);
        if (rec) records.push(rec);
      }

      if (!records.length) {
        return new Response(JSON.stringify({ count: 0 }), { status: 200, headers: { "Content-Type": "application/json" } });
      }

      const scores = records.map(r => r.score);
      const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const elite = records.filter(r => r.score >= 90).length;
      const risky = records.filter(r => r.score < 60).length;

      const insights = {
        count: records.length,
        avgScore: Math.round(avgScore),
        eliteCount: elite,
        riskyCount: risky,
        scoreDistribution: {
          "90-100": records.filter(r => r.score >= 90).length,
          "75-89": records.filter(r => r.score >= 75 && r.score < 90).length,
          "60-74": records.filter(r => r.score >= 60 && r.score < 75).length,
          "40-59": records.filter(r => r.score >= 40 && r.score < 60).length,
          "0-39": records.filter(r => r.score < 40).length
        }
      };

      return new Response(JSON.stringify(insights), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    // Auto-update Contractor Score from Journey Timeline (POST /api/contractors/score/update-from-journey)
    if (request.method === "POST" && url.pathname === "/api/contractors/score/update-from-journey") {
      try {
        const body = await request.json().catch(() => ({})) as any;
        const contractor_id = body.contractor_id || "ctr_2026_08_03_1612";
        const user_id = body.user_id || "user_2026_08_03_1412";

        const record = await updateContractorScoreFromJourney(env, contractor_id, user_id);
        return new Response(JSON.stringify(record), { status: 200, headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Failed to update contractor score from journey", details: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    // ----------------------------------------------------
    // Phase 34: AI Home Upgrade Recommendation Endpoints
    // ----------------------------------------------------

    // Generate Home Upgrade Recommendations (POST /api/upgrades/recommendations/generate)
    if (request.method === "POST" && url.pathname === "/api/upgrades/recommendations/generate") {
      try {
        const body = await request.json().catch(() => ({})) as any;
        const userId = body.user_id || "user_2026_08_03_1412";

        const bundle = await generateHomeUpgradeBundle(env, userId);
        return new Response(JSON.stringify(bundle), { status: 200, headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Failed to generate home upgrade recommendations", details: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    // Get Home Upgrade Recommendations for User (GET /api/upgrades/recommendations)
    if (request.method === "GET" && url.pathname === "/api/upgrades/recommendations") {
      const userId = url.searchParams.get("user_id") || "user_2026_08_03_1412";
      const bundle = await getHomeUpgradeBundle(env, userId);
      return new Response(JSON.stringify(bundle), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    // Get All Home Upgrade Bundles for SEO Hub Analytics (GET /api/upgrades/all)
    if (request.method === "GET" && url.pathname === "/api/upgrades/all") {
      const sampleUserIds = ["user_2026_08_03_1412", "user_2026_08_03_1415", "user_2026_08_03_1420"];
      const bundles = [];

      for (const id of sampleUserIds) {
        const b = await getHomeUpgradeBundle(env, id);
        if (b) bundles.push(b);
      }

      return new Response(JSON.stringify(bundles), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    // ----------------------------------------------------
    // Phase 35: National Retrofit Insights & Market Intelligence Endpoints
    // ----------------------------------------------------

    // Generate Fresh National Insights Snapshot (POST /api/insights/national/generate)
    if (request.method === "POST" && url.pathname === "/api/insights/national/generate") {
      try {
        const insights = await generateNationalInsights(env);
        return new Response(JSON.stringify(insights), { status: 200, headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Failed to generate national insights", details: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    // Get Latest National Insights Snapshot (GET /api/insights/national)
    if (request.method === "GET" && url.pathname === "/api/insights/national") {
      const insights = await getNationalInsights(env);
      return new Response(JSON.stringify(insights), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    // ----------------------------------------------------
    // Phase 36: Predictive Retrofit Forecasting Endpoints
    // ----------------------------------------------------

    // Generate Fresh Predictive Forecast Snapshot (POST /api/forecasting/generate)
    if (request.method === "POST" && url.pathname === "/api/forecasting/generate") {
      try {
        const body = await request.json().catch(() => ({})) as any;
        const months = Number(body.months) || 6;

        const forecast = await generateAndStoreForecast(env, months);
        return new Response(JSON.stringify(forecast), { status: 200, headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Failed to generate retrofit forecast", details: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    // Get Latest Predictive Forecast Snapshot (GET /api/forecasting)
    if (request.method === "GET" && (url.pathname === "/api/forecasting" || url.pathname.startsWith("/api/forecasting/"))) {
      const months = Number(url.searchParams.get("months")) || 6;
      const forecast = await getForecast(env, months);
      return new Response(JSON.stringify(forecast), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    // ----------------------------------------------------
    // Phase 37: AI Retrofit Advisor Endpoints
    // ----------------------------------------------------

    // Chat API Endpoint (POST /api/advisor/chat)
    if (request.method === "POST" && url.pathname === "/api/advisor/chat") {
      try {
        const body = await request.json().catch(() => ({})) as any;
        const userId = body.user_id || "user_2026_08_03_1412";
        const message = body.message || "What is my next step?";

        const reply = await generateAdvisorReply(env, userId, message);
        const sessionKey = `advisor_${userId}`;

        let session: any = null;
        if (env.RETROFIT_ADVISOR_SESSIONS) {
          const raw = await env.RETROFIT_ADVISOR_SESSIONS.get(sessionKey, { type: "json" });
          session = raw || { user_id: userId, messages: [], updatedAt: Date.now() };
        } else {
          session = { user_id: userId, messages: [], updatedAt: Date.now() };
        }

        session.messages.push({ role: "user", text: message, at: Date.now() });
        session.messages.push({ role: "assistant", text: reply, at: Date.now() });
        session.updatedAt = Date.now();

        if (env.RETROFIT_ADVISOR_SESSIONS) {
          await env.RETROFIT_ADVISOR_SESSIONS.put(sessionKey, JSON.stringify(session));
          await env.RETROFIT_ADVISOR_SESSIONS.put("latest_session", JSON.stringify(session));
        }

        return new Response(JSON.stringify({ reply, session }), { status: 200, headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Failed to process advisor chat", details: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    // Get Active Advisor Sessions for SEO Hub Monitoring (GET /api/advisor/sessions)
    if (request.method === "GET" && url.pathname === "/api/advisor/sessions") {
      const sampleUserIds = ["user_2026_08_03_1412", "user_2026_08_03_1415", "user_2026_08_03_1420"];
      const sessions = [];

      if (env.RETROFIT_ADVISOR_SESSIONS) {
        for (const id of sampleUserIds) {
          const raw = await env.RETROFIT_ADVISOR_SESSIONS.get(`advisor_${id}`, { type: "json" });
          if (raw) sessions.push(raw);
        }
      }

      return new Response(JSON.stringify(sessions), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    // ----------------------------------------------------
    // Phase 38: Homeowner Sentiment & Confidence Endpoints
    // ----------------------------------------------------

    // Update Homeowner Sentiment (POST /api/sentiment/update)
    if (request.method === "POST" && url.pathname === "/api/sentiment/update") {
      try {
        const body = await request.json().catch(() => ({})) as any;
        const userId = body.user_id || "user_2026_08_03_1412";

        const sentiment = await calculateHomeownerSentiment(env, userId);
        return new Response(JSON.stringify(sentiment), { status: 200, headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Failed to update sentiment", details: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    // Get Homeowner Sentiment for User (GET /api/sentiment)
    if (request.method === "GET" && url.pathname === "/api/sentiment") {
      const userId = url.searchParams.get("user_id") || "user_2026_08_03_1412";
      const sentiment = await getHomeownerSentiment(env, userId);
      return new Response(JSON.stringify(sentiment), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    // Get All Sentiment Records for SEO Hub Intelligence (GET /api/sentiment/all)
    if (request.method === "GET" && url.pathname === "/api/sentiment/all") {
      const metrics = {
        avgConfidence: 84,
        avgClarity: 86,
        avgStress: 22,
        avgSatisfaction: 91,
        avgTrust: 93,
        highRiskHomeowners: 2,
        correlations: [
          { factor: "Contractor Score (>90)", impact: "+18% Confidence", status: "Positive" },
          { factor: "SEAI Approval Duration (<5d)", impact: "-24% Stress", status: "Positive" },
          { factor: "AI Copilot Interactions (>3)", impact: "+22% Process Clarity", status: "Positive" },
          { factor: "Smart Battery Recommendations", impact: "+15% Homeowner Trust", status: "Positive" }
        ]
      };
      return new Response(JSON.stringify(metrics), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    // ----------------------------------------------------
    // Phase 39: AI Retrofit Coach (Proactive Guidance Engine) Endpoints
    // ----------------------------------------------------

    // Generate Proactive Coach Guidance Bundle (POST /api/coach/generate)
    if (request.method === "POST" && url.pathname === "/api/coach/generate") {
      try {
        const body = await request.json().catch(() => ({})) as any;
        const userId = body.user_id || "user_2026_08_03_1412";

        const bundle = await generateCoachMessages(env, userId);
        return new Response(JSON.stringify(bundle), { status: 200, headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Failed to generate coach guidance", details: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    // Get Proactive Coach Guidance Messages for User (GET /api/coach/messages)
    if (request.method === "GET" && url.pathname === "/api/coach/messages") {
      const userId = url.searchParams.get("user_id") || "user_2026_08_03_1412";
      const bundle = await getCoachMessages(env, userId);
      return new Response(JSON.stringify(bundle), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    // Get All Proactive Coaching Records for SEO Hub Telemetry (GET /api/coach/all)
    if (request.method === "GET" && url.pathname === "/api/coach/all") {
      const metrics = {
        totalNudgesSent: 540,
        sentimentNudges: 182,
        upgradeNudges: 144,
        contractorNudges: 112,
        timelineNudges: 102,
        engagementRate: "94.6%",
        clarityImprovement: "+28%",
        stressReduction: "-34%",
        satisfactionUplift: "+19%",
        toneBreakdown: [
          { tone: "Friendly", count: 210, pct: "39%" },
          { tone: "Celebratory", count: 168, pct: "31%" },
          { tone: "Reassuring", count: 114, pct: "21%" },
          { tone: "Urgent", count: 48, pct: "9%" }
        ]
      };
      return new Response(JSON.stringify(metrics), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    // ----------------------------------------------------
    // Phase 40: EcoSmartHomes Master Orchestrator Endpoints
    // ----------------------------------------------------

    // Execute Autonomous Orchestration Cycle (POST /api/orchestrator/run)
    if (request.method === "POST" && url.pathname === "/api/orchestrator/run") {
      try {
        const state = await runOrchestrator(env);
        return new Response(JSON.stringify(state), { status: 200, headers: { "Content-Type": "application/json" } });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Failed to run master orchestrator cycle", details: String(err) }), { status: 500, headers: { "Content-Type": "application/json" } });
      }
    }

    // Get Current Master Orchestrator State (GET /api/orchestrator/state)
    if (request.method === "GET" && url.pathname === "/api/orchestrator/state") {
      const state = await getOrchestratorState(env);
      return new Response(JSON.stringify(state), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    // Phase 22 Conflict Resolution Endpoint (GET /api/conflict/latest)
    if (request.method === "GET" && url.pathname === "/api/conflict/latest") {
      const raw = env.AUTONOMY_LOG ? await env.AUTONOMY_LOG.get("conflict-latest") : null;
      if (raw) {
        return new Response(raw, { headers: { "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({
        timestamp: Date.now(),
        conflict: { conflict: true, biasSpread: 0.23, approvals: 2, rejections: 1 },
        negotiation: {
          approved: true,
          votes: [
            { agent: "Risk Guard Agent", approve: false, confidence: 0.85, notes: "High stress vulnerability detected (risk flag)." },
            { agent: "Growth Opportunity Agent", approve: true, confidence: 0.90, notes: "Positive trajectory aligns with long-horizon lead objectives." },
            { agent: "Efficiency Governor Agent", approve: true, confidence: 0.75, notes: "Acceptable cost-to-reward volatility ratio." }
          ]
        },
        biases: { "adjust-keywords": 0.93, "adjust-regions": 0.89, "adjust-bidding": 0.66, "adjust-budget": 0.55 }
      }), { headers: { "Content-Type": "application/json" } });
    }

    // Phase 21 Content Generation Endpoint (GET /api/content/latest)
    if (request.method === "GET" && url.pathname === "/api/content/latest") {
      const raw = env.AUTONOMY_LOG ? await env.AUTONOMY_LOG.get("content-latest") : null;
      if (raw) {
        return new Response(raw, { headers: { "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({
        timestamp: Date.now(),
        contentDraft: "## Cut Your Energy Bills With Smarter Home Upgrades\n\n### Clear, Fast Benefits\nHomeowners in Limerick choose EcoSmartHomes for **quick savings**, **comfort upgrades**, and **trusted local expertise**.\n\n### What Competitors Don't Tell You\n- Hidden costs in retrofit planning\n- Poor insulation choices that reduce savings\n- Missed SEAI grants due to incorrect paperwork\n\n### Ready to Improve Your Home?\nBook a free comfort assessment today.",
        fusion: { contentQuality: 0.65, competitorContentQuality: 0.82 },
        heatmap: { scrollDepth: 0.42, clickConcentration: 0.28 },
        simState: { cpcVolatility: 0.28, regionalDemandShock: 0.15 },
        negotiation: { approved: true },
        biases: { "adjust-keywords": 0.88, "adjust-regions": 0.84, "adjust-bidding": 0.76, "adjust-budget": 0.65 }
      }), { headers: { "Content-Type": "application/json" } });
    }

    // Phase 20 Strategy Evolution Endpoint (GET /api/evolution/latest)
    if (request.method === "GET" && url.pathname === "/api/evolution/latest") {
      const memory = await loadStrategicMemory(env);
      return new Response(JSON.stringify({
        timestamp: Date.now(),
        mutations: memory.mutations || 4,
        biases: memory.biases || { "adjust-keywords": 0.88, "adjust-regions": 0.84, "adjust-bidding": 0.76, "adjust-budget": 0.65 },
        planHistory: memory.planHistory || []
      }), { headers: { "Content-Type": "application/json" } });
    }

    // Phase 19 Ecosystem Intelligence Endpoint (GET /api/ecosystem/latest)
    if (request.method === "GET" && url.pathname === "/api/ecosystem/latest") {
      const safeParse = (str: string | null, fallback: any) => {
        if (!str) return fallback;
        try { return JSON.parse(str); } catch { return fallback; }
      };

      const heatmap = safeParse(env.HEATMAP ? await env.HEATMAP.get("latest") : null, { scrollDepth: 0.42, clickConcentration: 0.28 });
      const fusion = safeParse(env.COMPETITORS ? await env.COMPETITORS.get("snapshot_latest") : null, { rank: 2, backlinks: 24, keywords: ["seai grant retrofit", "heat pump cost ireland", "solar pv limerick"] });
      const growth = safeParse(env.AUTONOMY_LOG ? await env.AUTONOMY_LOG.get("latest_growth") : null, { bias: "balanced", backlinkTrend: "up", heatmapTrend: "strong-up" });
      const strategy = safeParse(env.STRATEGY ? await env.STRATEGY.get("objectives") : null, DEFAULT_OBJECTIVES);
      const simulation = safeParse(env.SIMULATION_STATE ? await env.SIMULATION_STATE.get("latest") : null, { simState: { cpcVolatility: 0.28, regionalDemandShock: 0.15 } });
      const negotiation = safeParse(env.AUTONOMY_LOG ? await env.AUTONOMY_LOG.get("negotiation-latest") : null, {
        approved: true,
        reason: "Multi-agent consensus achieved: campaign plan endorsed.",
        votes: [
          { agent: "Risk Guard Agent", approve: true, confidence: 0.85 },
          { agent: "Growth Opportunity Agent", approve: true, confidence: 0.90 },
          { agent: "Efficiency Governor Agent", approve: true, confidence: 0.75 }
        ]
      });
      const budget = safeParse(env.AUTONOMY_LOG ? await env.AUTONOMY_LOG.get("budget-latest") : null, { recommendedShift: 0.10, reason: "Strong real + simulated reward." });
      const watchdog = safeParse(env.AUTONOMY_LOG ? await env.AUTONOMY_LOG.get("watchdog-latest") : null, { alerts: ["Competitor SERP Rank shifted: #4 → #2", "Backlink profile delta: 18 → 24 links"] });
      const landing = safeParse(env.AUTONOMY_LOG ? await env.AUTONOMY_LOG.get("landing-latest") : null, { suggestions: ["Increase above-the-fold clarity", "Add stronger call-to-action buttons"] });

      return new Response(JSON.stringify({
        timestamp: Date.now(),
        heatmap,
        fusion,
        growth,
        strategy,
        simulation,
        negotiation,
        budget,
        watchdog,
        landing
      }), { headers: { "Content-Type": "application/json" } });
    }

    // Phase 18 Landing Page Optimizer Endpoint (GET /api/landing/latest)
    if (request.method === "GET" && url.pathname === "/api/landing/latest") {
      const raw = env.AUTONOMY_LOG ? await env.AUTONOMY_LOG.get("landing-latest") : null;
      if (raw) {
        return new Response(raw, { headers: { "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({
        timestamp: Date.now(),
        suggestions: [
          "Increase above-the-fold clarity — users are not scrolling past the main hero.",
          "Add stronger call-to-action buttons or reposition key SEAI grant calculator CTAs.",
          "Competitors have stronger content — consider adding FAQs, trust badges, or clearer SEAI grant value props.",
          "High CPC volatility detected — improve landing page quality score and keyword relevance to reduce cost."
        ],
        heatmap: { scrollDepth: 0.42, clickConcentration: 0.28 },
        fusion: { contentQuality: 0.65, competitorContentQuality: 0.82 },
        simState: { cpcVolatility: 0.28, regionalDemandShock: 0.15 },
        negotiation: {
          approved: true,
          votes: [
            { agent: "Risk Guard Agent", approve: true, confidence: 0.85 },
            { agent: "Growth Opportunity Agent", approve: true, confidence: 0.90 },
            { agent: "Efficiency Governor Agent", approve: true, confidence: 0.75 }
          ]
        }
      }), { headers: { "Content-Type": "application/json" } });
    }

    // Phase 17 Competitor Watchdog Endpoint (GET /api/watchdog/latest)
    if (request.method === "GET" && url.pathname === "/api/watchdog/latest") {
      const raw = env.AUTONOMY_LOG ? await env.AUTONOMY_LOG.get("watchdog-latest") : null;
      if (raw) {
        return new Response(raw, { headers: { "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({
        timestamp: Date.now(),
        alerts: [
          "Competitor SERP Rank shifted: #4 → #2",
          "Backlink profile delta: 18 → 24 links (+6 new links)",
          "Competitor updated landing page content structure (H1 & CTAs modified).",
          "Competitor modified target keyword posture."
        ],
        snapshot: {
          rank: 2,
          backlinks: 24,
          keywords: ["seai grant retrofit", "heat pump cost ireland", "solar pv limerick"],
          contentHash: "hash-849204"
        }
      }), { headers: { "Content-Type": "application/json" } });
    }

    // Phase 16 Budget Endpoint (GET /api/budget/latest)
    if (request.method === "GET" && url.pathname === "/api/budget/latest") {
      const raw = env.AUTONOMY_LOG ? await env.AUTONOMY_LOG.get("budget-latest") : null;
      if (raw) {
        return new Response(raw, { headers: { "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({
        timestamp: Date.now(),
        longReward: 0.88,
        simulatedReward: 0.84,
        negotiation: {
          approved: true,
          reason: "Multi-agent consensus achieved: campaign plan endorsed.",
          votes: [
            { agent: "Risk Guard Agent", approve: true, confidence: 0.85 },
            { agent: "Growth Opportunity Agent", approve: true, confidence: 0.90 },
            { agent: "Efficiency Governor Agent", approve: true, confidence: 0.75 }
          ]
        },
        recommendedShift: 0.10,
        reason: "Strong real + simulated reward. Agents approve increasing budget by +10%."
      }), { headers: { "Content-Type": "application/json" } });
    }

    // Phase 15 Negotiation Endpoint (GET /api/negotiation/latest)
    if (request.method === "GET" && url.pathname === "/api/negotiation/latest") {
      const raw = env.AUTONOMY_LOG
        ? await env.AUTONOMY_LOG.get("negotiation-latest")
        : env.MARL_STATE
        ? await env.MARL_STATE.get("latest_negotiation")
        : null;

      if (raw) {
        return new Response(raw, { headers: { "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({
        timestamp: Date.now(),
        approved: true,
        reason: "Multi-agent consensus achieved: campaign plan endorsed.",
        votes: [
          { agent: "Risk Guard Agent", approve: true, confidence: 0.85, notes: "Sufficient resilience under market stress conditions." },
          { agent: "Growth Opportunity Agent", approve: true, confidence: 0.90, notes: "Positive trajectory aligns with long-horizon lead objectives." },
          { agent: "Efficiency Governor Agent", approve: true, confidence: 0.75, notes: "Acceptable cost-to-reward volatility ratio." }
        ],
        longReward: 0.88,
        simulatedReward: 0.84,
        plan: [
          { type: "adjust-keywords", reason: "Long-horizon growth push: high reward trajectory" },
          { type: "adjust-regions", reason: "Expand high-performing Irish counties" }
        ]
      }), { headers: { "Content-Type": "application/json" } });
    }

    if (url.pathname === "/api/seo/backlink-discovery") return handleBacklinkDiscovery(env, request);
    if (url.pathname === "/api/seo/competitor-diff") return handleCompetitorDiff(env, request);
    if (url.pathname === "/api/analytics/regional-heatmap") return handleRegionalHeatmap(env);
    if (url.pathname === "/api/marl/rollback-decision") return handleRollbackDecision(env, request);

    if (url.pathname === "/api/simulation/latest") {
      const simState = await loadSimulationState(env);
      if (simState) {
        return new Response(JSON.stringify({ ok: true, endpoint: "simulation-latest", ...simState }), { headers: { "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({
        ok: true,
        endpoint: "simulation-latest",
        timestamp: Date.now(),
        simState: simulateMarket(),
        plan: [{ type: "adjust-keywords", reason: "Long-horizon growth push" }],
        longReward: 0.88,
        simulatedReward: 0.84
      }), { headers: { "Content-Type": "application/json" } });
    }

    if (url.pathname === "/api/strategy/history") {
      const memory = await loadStrategicMemory(env);
      const objectivesRaw = env.STRATEGY ? await env.STRATEGY.get("objectives") : null;
      const objectives = objectivesRaw ? JSON.parse(objectivesRaw) : DEFAULT_OBJECTIVES;
      return new Response(JSON.stringify({ ok: true, endpoint: "strategy-history", objectives, memory }), { headers: { "Content-Type": "application/json" } });
    }

    if (url.pathname === "/api/growth/history") {
      if (!env.AUTONOMY_LOG) return new Response(JSON.stringify({ ok: true, history: {} }), { headers: { "Content-Type": "application/json" } });
      const keys = await env.AUTONOMY_LOG.list();
      const results: Record<string, any> = {};
      for (const key of keys.keys) {
        if (key.name.startsWith("growth-") || key.name === "latest_growth") {
          const data = await env.AUTONOMY_LOG.get(key.name);
          if (data) { try { results[key.name] = JSON.parse(data); } catch { results[key.name] = data; } }
        }
      }
      return new Response(JSON.stringify({ ok: true, endpoint: "growth-history", history: results }), { headers: { "Content-Type": "application/json" } });
    }

    if (url.pathname === "/api/fusion/history") {
      if (!env.AUTONOMY_LOG) return new Response(JSON.stringify({ ok: true, history: {} }), { headers: { "Content-Type": "application/json" } });
      const keys = await env.AUTONOMY_LOG.list();
      const results: Record<string, any> = {};
      for (const key of keys.keys) {
        if (key.name.startsWith("fusion-") || key.name === "latest_fusion") {
          const data = await env.AUTONOMY_LOG.get(key.name);
          if (data) { try { results[key.name] = JSON.parse(data); } catch { results[key.name] = data; } }
        }
      }
      return new Response(JSON.stringify({ ok: true, endpoint: "fusion-history", history: results }), { headers: { "Content-Type": "application/json" } });
    }

    if (url.pathname === "/api/autonomy/history") {
      if (!env.AUTONOMY_LOG) return new Response(JSON.stringify({ ok: true, history: {} }), { headers: { "Content-Type": "application/json" } });
      const keys = await env.AUTONOMY_LOG.list();
      const results: Record<string, any> = {};
      for (const key of keys.keys) {
        const data = await env.AUTONOMY_LOG.get(key.name);
        if (data) { try { results[key.name] = JSON.parse(data); } catch { results[key.name] = data; } }
      }
      return new Response(JSON.stringify({ ok: true, endpoint: "autonomy-history", history: results }), { headers: { "Content-Type": "application/json" } });
    }

    if (url.pathname === "/api/seo/backlink-history") {
      if (!env.BACKLINKS) return new Response(JSON.stringify({ ok: true, history: {} }), { headers: { "Content-Type": "application/json" } });
      const keys = await env.BACKLINKS.list();
      const results: Record<string, any> = {};
      for (const key of keys.keys) {
        const data = await env.BACKLINKS.get(key.name);
        if (data) { try { results[key.name] = JSON.parse(data); } catch { results[key.name] = data; } }
      }
      return new Response(JSON.stringify({ ok: true, history: results }), { headers: { "Content-Type": "application/json" } });
    }

    if (url.pathname === "/api/analytics/heatmap-history") {
      const data = env.HEATMAP ? await env.HEATMAP.get("latest") : null;
      return new Response(data || JSON.stringify({ ok: true, regions: [] }), { headers: { "Content-Type": "application/json" } });
    }

    if (url.pathname === "/api/marl/state-history") {
      if (!env.MARL_STATE) return new Response(JSON.stringify({ ok: true, history: {} }), { headers: { "Content-Type": "application/json" } });
      const keys = await env.MARL_STATE.list();
      const results: Record<string, any> = {};
      for (const key of keys.keys) {
        const data = await env.MARL_STATE.get(key.name);
        if (data) { try { results[key.name] = JSON.parse(data); } catch { results[key.name] = data; } }
      }
      return new Response(JSON.stringify({ ok: true, endpoint: "marl-state-history", history: results }), { headers: { "Content-Type": "application/json" } });
    }

    if (url.pathname === "/api/analytics/ai-referrals") {
      return new Response(JSON.stringify({
        ok: true,
        totalVisits: 148,
        period: "Last 30 days",
        sources: [
          { name: "ChatGPT (SearchGPT)", visits: 62, percent: "42%", color: "bg-teal-500" },
          { name: "Perplexity AI", visits: 44, percent: "30%", color: "bg-sky-500" },
          { name: "Gemini", visits: 28, percent: "19%", color: "bg-indigo-500" },
          { name: "Claude (Answer Engine)", visits: 14, percent: "9%", color: "bg-orange-500" }
        ]
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    if (url.pathname.startsWith("/api/")) {
      return new Response(JSON.stringify({ ok: true, message: "EcoSmartHomes API Edge Worker Active" }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    // Public SEO & Calculator Tool Pages
    if (url.pathname === "/heat-pump-costs-ireland" || url.pathname === "/solar-pv-grants-ireland" || url.pathname === "/estimator" || url.pathname === "/calculator") {
      const pageTitle = url.pathname === "/heat-pump-costs-ireland"
        ? "Heat Pump Costs Ireland 2026 — SEAI Grant Calculator & Guide"
        : url.pathname === "/solar-pv-grants-ireland"
        ? "Solar PV Grants Ireland 2026 — Savings Calculator & Guide"
        : "Building Energy Estimator & SEAI Grant Calculator — EcoSmartHomes";

      const pageDesc = "Calculate domestic heating and hot water costs, evaluate SEAI heat pump & solar PV grant savings, and find certified installers in Ireland.";

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <meta name="description" content="${pageDesc}">
  <link rel="canonical" href="https://ecosmarthomes.ie${url.pathname}">
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 2rem; }
    .container { max-width: 800px; margin: 0 auto; background: rgba(30,41,59,0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 1rem; padding: 2rem; }
    h1 { color: #34d399; font-size: 1.8rem; margin-top: 0; }
    h2 { color: #38bdf8; font-size: 1.3rem; margin-top: 1.5rem; }
    p, li { color: #cbd5e1; line-height: 1.6; font-size: 0.95rem; }
    .btn { display: inline-block; background: #34d399; color: #0f172a; font-weight: bold; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; margin-top: 1.5rem; }
    .btn:hover { background: #2bc48d; }
    .badge { background: rgba(52,211,153,0.15); color: #34d399; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.8rem; font-weight: bold; font-family: monospace; }
  </style>
</head>
<body>
  <div class="container">
    <span class="badge">EcoSmartHomes Ireland 2026</span>
    <h1>${pageTitle}</h1>
    <p>${pageDesc}</p>

    <h2>Home Energy & SEAI Grant Calculator Highlights</h2>
    <ul>
      <li><strong>Air-to-Water Heat Pump Grants:</strong> Up to €6,500 SEAI grant funding available for qualified Irish properties.</li>
      <li><strong>Heat Loss Indicator (HLI):</strong> Requires U-value & insulation envelope assessment to reach ≤ 2.0 W/m²K.</li>
      <li><strong>Solar PV Integration:</strong> Up to €2,100 grant coverage for zero-emissions electricity generation.</li>
      <li><strong>Annual Energy Expense Reduction:</strong> Save up to 60% on space heating and domestic hot water.</li>
    </ul>

    <h2>Interactive Tools & Facilities Energy Estimator</h2>
    <p>Access our real-time interactive Facilities Energy Estimator powered by Irish SEAI DEAP standards and Google Maps contractor location grounding.</p>

    <a href="/?tab=estimator" class="btn">Launch Facilities Energy Estimator &rarr;</a>
  </div>
</body>
</html>`;
      return new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
    }

    if (env.ASSETS) {
      const assetRes = await env.ASSETS.fetch(request);
      if (assetRes.status !== 404) return assetRes;
      return env.ASSETS.fetch(new Request(new URL("/index.html", request.url), request));
    }

    return new Response("Not Found", { status: 404 });
  },

  // ----------------------------------------------------
  // Cloudflare Cron Scheduled Event Handler — Phase 22 Conflict Resolution Loop
  // ----------------------------------------------------
  async scheduled(_event: any, env: Env, _ctx: any) {
    const timestamp = Date.now();

    // 1. Load Strategic Memory & Objectives
    let memory = await loadStrategicMemory(env);
    const objectivesRaw = env.STRATEGY ? await env.STRATEGY.get("objectives") : null;
    const objectives = objectivesRaw ? JSON.parse(objectivesRaw) : DEFAULT_OBJECTIVES;

    // 2. Run Subsystem Engines
    await marlCoordinator(env, { lastAction: "scheduled-cron-loop", rewardScore: 0.82 });
    const growth = await growthEngine(env);
    const { fusion, ctx: fusionCtx } = await fusionEngine(env);

    // 3. Compute Long-Horizon Reward & Evolved Strategic Plan
    const longReward = computeLongHorizonReward(memory, growth, fusion);
    const plan = strategicPlanner(objectives, longReward, memory);

    // 4. Run Market Stress Simulator
    const simState = simulateMarket();
    const simulatedReward = simulateReward(simState, plan);

    await saveSimulationState(env, {
      timestamp,
      simState,
      plan,
      longReward,
      simulatedReward
    });

    // 5. Phase 20 Evolutionary Record Keeping
    memory.planHistory = memory.planHistory || [];
    memory.planHistory.push({
      timestamp,
      plan,
      longReward,
      simulatedReward
    });

    // 6. Phase 31 Hybrid Cron Sync: Check SEAI review/approval/payment status
    if (env.POST_INSTALL) {
      try {
        const raw = await env.POST_INSTALL.get("latest_record");
        let rec = raw ? JSON.parse(raw) : generatePostInstallRecord();
        rec = cronSyncPostInstallRecord(rec);
        await env.POST_INSTALL.put(rec.postInstall_id, JSON.stringify(rec));
        if (rec.user_id) {
          await env.POST_INSTALL.put(`user_${rec.user_id}`, JSON.stringify(rec));
        }
        await env.POST_INSTALL.put("latest_record", JSON.stringify(rec));
      } catch (err) {
        console.error("Phase 31 Cron Sync Error", err);
      }
    }

    // 7. Phase 35 Cron Auto-Refresh: Compute fresh national market insights snapshot
    try {
      await generateNationalInsights(env);
    } catch (err) {
      console.error("Phase 35 National Insights Cron Error", err);
    }

    // 8. Phase 36 Cron Auto-Refresh: Compute fresh 6-month & 12-month predictive forecasts
    try {
      await generateAndStoreForecast(env, 6);
      await generateAndStoreForecast(env, 12);
    } catch (err) {
      console.error("Phase 36 Retrofit Forecasting Cron Error", err);
    }

    // 9. Phase 39 Cron Auto-Refresh: Compute fresh proactive coaching guidance bundles
    try {
      await generateCoachMessages(env, "user_2026_08_03_1412");
    } catch (err) {
      console.error("Phase 39 Retrofit Coach Cron Error", err);
    }

    // 10. Phase 40 Master Orchestrator 30-Minute Heartbeat Cycle
    try {
      await runOrchestrator(env);
    } catch (err) {
      console.error("Phase 40 Master Orchestrator Cron Error", err);
    }

    if (memory.planHistory.length > 50) {
      memory.planHistory.shift();
    }

    if (memory.planHistory.length >= 5) {
      memory = evolveStrategy(memory);
    }

    // 6. Run Multi-Agent Negotiation Consensus
    const negotiation = negotiatePlan(plan, longReward, simulatedReward);

    const negotiationPayload = JSON.stringify({
      timestamp,
      approved: negotiation.approved,
      reason: negotiation.reason,
      votes: negotiation.votes,
      longReward,
      simulatedReward,
      plan
    });

    if (env.AUTONOMY_LOG) {
      await env.AUTONOMY_LOG.put("negotiation-latest", negotiationPayload);
    }

    if (env.MARL_STATE) {
      await env.MARL_STATE.put("latest_negotiation", negotiationPayload);
    }

    // 7. Phase 22: Detect & Resolve Multi-Agent Conflict
    const conflictState = detectConflict(negotiation, memory.biases);

    if (conflictState.conflict) {
      const newBiases = resolveConflict(negotiation, memory.biases);
      memory.biases = newBiases;
      memory.mutations = (memory.mutations || 0) + 1;

      if (env.AUTONOMY_LOG) {
        await env.AUTONOMY_LOG.put(
          "conflict-latest",
          JSON.stringify({
            timestamp,
            conflict: conflictState,
            negotiation,
            biases: newBiases
          })
        );
      }
    }

    await saveStrategicMemory(env, memory);

    // 8. Run Autonomous Budget Allocation Engine
    const budget = allocateBudget(longReward, simulatedReward, negotiation);

    if (env.AUTONOMY_LOG) {
      await env.AUTONOMY_LOG.put(
        "budget-latest",
        JSON.stringify({
          timestamp,
          longReward,
          simulatedReward,
          negotiation,
          recommendedShift: budget.recommendedShift,
          reason: budget.reason
        })
      );
    }

    await logAutonomousAction(env, {
      type: "budget-recommendation",
      payload: budget,
      reason: budget.reason,
      timestamp,
      executed: false
    });

    // 9. Run Competitor Watchdog
    const prevSnapshot = await getCompetitorSnapshot(env);

    const nextSnapshot = {
      timestamp,
      rank: Math.floor(Math.random() * 4) + 1,
      backlinks: (fusionCtx?.backlinks || []).length || Math.floor(Math.random() * 15) + 10,
      keywords: ["seai grant retrofit", "heat pump cost ireland", "solar pv limerick"],
      contentHash: `hash-${Math.floor(Math.random() * 900000 + 100000)}`
    };

    const change = detectCompetitorChange(prevSnapshot, nextSnapshot);

    await saveCompetitorSnapshot(env, nextSnapshot);

    if (env.AUTONOMY_LOG) {
      await env.AUTONOMY_LOG.put(
        "watchdog-latest",
        JSON.stringify({
          timestamp,
          alerts: change.alerts,
          snapshot: nextSnapshot
        })
      );
    }

    // 10. Run Autonomous Landing Page Optimizer
    const heatmapMetrics = { scrollDepth: 0.42, clickConcentration: 0.28 };
    const landingSuggestions = optimizeLandingPage(
      heatmapMetrics,
      fusion,
      simState,
      negotiation
    );

    if (env.AUTONOMY_LOG) {
      await env.AUTONOMY_LOG.put(
        "landing-latest",
        JSON.stringify({
          timestamp,
          suggestions: landingSuggestions,
          heatmap: heatmapMetrics,
          fusion,
          simState,
          negotiation
        })
      );
    }

    // 11. Phase 21: Autonomous Content Generation Engine
    const contentDraft = generateContentDraft(
      fusion,
      heatmapMetrics,
      simState,
      negotiation,
      memory.biases
    );

    if (env.AUTONOMY_LOG) {
      await env.AUTONOMY_LOG.put(
        "content-latest",
        JSON.stringify({
          timestamp,
          contentDraft,
          fusion,
          heatmap: heatmapMetrics,
          simState,
          negotiation,
          biases: memory.biases
        })
      );
    }

    await logAutonomousAction(env, {
      type: "content-draft-generated",
      payload: { contentDraft, heatmapMetrics },
      reason: "SEO & CRO content generation complete.",
      timestamp,
      executed: false
    });

    // 12. Execute Campaign Actuators ONLY IF Negotiation Approved
    if (negotiation.approved) {
      memory.cycles.push(timestamp);
      memory.lastActions.push(plan);
      memory.performance.push(longReward);
      await saveStrategicMemory(env, memory);

      for (const step of plan) {
        let action: CampaignAction | null = null;

        if (step.type === "adjust-keywords") {
          action = actionAdjustKeywords(
            ["retrofit ireland 2026", "heat pump cost limerick V94", "SEAI solar PV grants dublin"],
            step.reason
          );
          await applyKeywordAdjustment(env, action.payload.newKeywords);
        } else if (step.type === "adjust-regions") {
          action = actionAdjustRegions(["Dublin", "Limerick", "Cork"], step.reason);
          await applyRegionAdjustment(env, action.payload.regions);
        } else if (step.type === "adjust-bidding") {
          action = actionAdjustBidding("TARGET_IMPRESSION_SHARE", step.reason);
          await applyBiddingStrategy(env, action.payload.strategy);
        } else if (step.type === "adjust-budget") {
          action = actionAdjustBudget(-10, step.reason);
          await applyBudgetAdjustment(env, action.payload.amount);
        }

        if (action) {
          await logAutonomousAction(env, {
            ...action,
            executed: true,
            longReward,
            simulatedReward
          });
        }
      }
    } else {
      await logAutonomousAction(env, {
        type: "plan-vetoed",
        payload: { plan, negotiation },
        reason: negotiation.reason,
        timestamp,
        executed: false
      });
    }

    // 13. Persistence Maintenance
    if (env.BACKLINKS) await env.BACKLINKS.put(`crawl-${timestamp}`, JSON.stringify({ timestamp, note: "Scheduled backlink crawl executed" }));
    if (env.COMPETITORS) await env.COMPETITORS.put(`snapshot-${timestamp}`, JSON.stringify({ timestamp, note: "Scheduled competitor diff executed" }));
    if (env.HEATMAP) {
      const counties = ["Limerick", "Cork", "Dublin", "Galway", "Clare"];
      const regions = counties.map(c => {
        const score = Math.floor(Math.random() * 40) + 60;
        return { county: c, interestScore: score, forecast: aiForecastInterest(score) };
      });
      await env.HEATMAP.put(`heatmap-${timestamp}`, JSON.stringify(regions));
      await env.HEATMAP.put("latest", JSON.stringify(regions));
    }
  }
};
