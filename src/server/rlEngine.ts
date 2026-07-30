/**
 * src/server/rlEngine.ts
 * 
 * Layer 7 — Multi-Agent Reinforcement Learning (MARL) Autonomous Engine
 * Supports dedicated RL Agents per Pillar Category (Heat Pumps, Solar, Insulation, Grants)
 * and Fleet Domain, featuring Agent-Specific Reward Functions, Custom Learning Rates,
 * Independent Policy Factor Weights, Persistent Multi-Agent Memory, and Agent Performance Telemetry.
 */

import fs from "fs";
import path from "path";
import { evolveAgentGenome } from "./marlGenome";

export type AgentId = "heat-pumps" | "solar" | "insulation" | "grants" | "default";

export type DecisionAction =
  | "generate_draft"
  | "rewrite_article"
  | "queue_expansion"
  | "link_bait"
  | "publish";

export interface MetricsSnapshot {
  ctr: number;           // e.g. 0.035 (3.5%)
  serpPosition: number;  // e.g. 14 (1 = top position)
  backlinks: number;     // e.g. 4
  impressions: number;   // e.g. 1500
  pillarReadiness?: number; // e.g. 0.50
}

export interface ExperienceRecord {
  id: string;
  agentId: AgentId;
  siteId: string;
  slug: string;
  action: DecisionAction;
  reward: number; // Normalized -1.0 -> +1.0
  beforeMetrics: MetricsSnapshot;
  afterMetrics: MetricsSnapshot;
  timestamp: number;
}

export interface PolicyState {
  agentId: AgentId;
  ctrTrendWeight: number;        // Weight given to CTR trends
  serpVolatilityWeight: number; // Weight given to SERP volatility
  backlinkGapWeight: number;     // Weight given to Backlink gaps
  pillarWeaknessWeight: number;  // Weight given to Pillar weakness
  contentVelocityWeight: number; // Weight given to Content velocity
  learningRate: number;          // Per-agent tuned learning rate (e.g., grants: 0.03, solar: 0.06)
  decayFactor: number;           // Default: 0.99
  totalEvaluations: number;
  lastUpdated: number;
}

export interface AgentPerformance {
  agentId: AgentId;
  totalEvaluations: number;
  averageReward: number;      // e.g. +0.42
  efficiencyScore: number;    // 0 - 100%
  smartnessLevel: string;     // e.g. "Novice" | "Proficient Strategy" | "Master SEO Autopilot"
  topAction: DecisionAction | "None";
}

/** Initial Agent-Specific Policy Baselines & Custom Learning Rates */
const DEFAULT_AGENT_POLICIES: Record<AgentId, PolicyState> = {
  "heat-pumps": {
    agentId: "heat-pumps",
    ctrTrendWeight: 0.45,
    serpVolatilityWeight: 0.25,
    backlinkGapWeight: 0.15,
    pillarWeaknessWeight: 0.10,
    contentVelocityWeight: 0.05,
    learningRate: 0.05,
    decayFactor: 0.99,
    totalEvaluations: 0,
    lastUpdated: Date.now()
  },
  "solar": {
    agentId: "solar",
    ctrTrendWeight: 0.20,
    serpVolatilityWeight: 0.15,
    backlinkGapWeight: 0.45,
    pillarWeaknessWeight: 0.10,
    contentVelocityWeight: 0.10,
    learningRate: 0.06, // Higher learning rate for fast-moving solar market
    decayFactor: 0.99,
    totalEvaluations: 0,
    lastUpdated: Date.now()
  },
  "insulation": {
    agentId: "insulation",
    ctrTrendWeight: 0.25,
    serpVolatilityWeight: 0.40,
    backlinkGapWeight: 0.15,
    pillarWeaknessWeight: 0.10,
    contentVelocityWeight: 0.10,
    learningRate: 0.04, // Moderate learning rate for insulation SERP stability
    decayFactor: 0.99,
    totalEvaluations: 0,
    lastUpdated: Date.now()
  },
  "grants": {
    agentId: "grants",
    ctrTrendWeight: 0.40,
    serpVolatilityWeight: 0.20,
    backlinkGapWeight: 0.15,
    pillarWeaknessWeight: 0.15,
    contentVelocityWeight: 0.10,
    learningRate: 0.03, // Slower learning rate for grant explainer stability
    decayFactor: 0.99,
    totalEvaluations: 0,
    lastUpdated: Date.now()
  },
  "default": {
    agentId: "default",
    ctrTrendWeight: 0.30,
    serpVolatilityWeight: 0.25,
    backlinkGapWeight: 0.20,
    pillarWeaknessWeight: 0.15,
    contentVelocityWeight: 0.10,
    learningRate: 0.05,
    decayFactor: 0.99,
    totalEvaluations: 0,
    lastUpdated: Date.now()
  }
};

let agentPolicies: Record<AgentId, PolicyState> = JSON.parse(JSON.stringify(DEFAULT_AGENT_POLICIES));
let memoryExperiences: ExperienceRecord[] = [];

const MARL_MEMORY_FILE_PATH = path.join(process.cwd(), "data", "marl_memory.json");

/** Detect target Pillar Agent ID from slug or domain name */
export function detectAgentId(slug: string, siteId = ""): AgentId {
  const target = `${slug} ${siteId}`.toLowerCase();
  if (target.includes("heat-pump") || target.includes("heatpump")) return "heat-pumps";
  if (target.includes("solar") || target.includes("pv") || target.includes("battery")) return "solar";
  if (target.includes("insulation") || target.includes("attic") || target.includes("wall")) return "insulation";
  if (target.includes("grant") || target.includes("seai") || target.includes("subsidy")) return "grants";
  return "default";
}

// Initialize and load persisted MARL memory & agent policies from disk
export function initMARLEngine(): void {
  try {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    if (fs.existsSync(MARL_MEMORY_FILE_PATH)) {
      const raw = fs.readFileSync(MARL_MEMORY_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed.policies) {
        agentPolicies = {
          ...JSON.parse(JSON.stringify(DEFAULT_AGENT_POLICIES)),
          ...parsed.policies
        };
      }
      if (Array.isArray(parsed.experiences)) memoryExperiences = parsed.experiences;
      console.log(`[MARL Engine] Loaded ${memoryExperiences.length} experiences & per-agent policy weights.`);
    } else {
      saveMARLMemory();
    }
  } catch (err) {
    console.error("[MARL Engine] Failed to initialize persistent memory store:", err);
  }
}

// Save MARL state to disk
export function saveMARLMemory(): void {
  try {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const data = {
      policies: agentPolicies,
      experiences: memoryExperiences.slice(0, 500)
    };
    fs.writeFileSync(MARL_MEMORY_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("[MARL Engine] Error persisting memory store:", err);
  }
}

/**
 * Agent-Specific Reward Function — Calculates normalized scalar reward (-1.0 to +1.0)
 * tuned according to each Pillar Agent's specialized optimization objective.
 */
export function calculateAgentReward(
  agentId: AgentId,
  action: DecisionAction,
  before: MetricsSnapshot,
  after: MetricsSnapshot
): number {
  const ctrDelta = after.ctr - before.ctr;
  const serpDelta = before.serpPosition - after.serpPosition; // positive = moved up in rankings!
  const backlinksDelta = after.backlinks - before.backlinks;
  const impressionsDelta = (after.impressions - before.impressions) / Math.max(before.impressions, 1);

  let rawReward = 0;

  switch (agentId) {
    case "heat-pumps":
      // Agent A: High Reward for CTR & SERP position climbs (conversions on cost/comfort pages)
      rawReward = (ctrDelta * 10.0) + (serpDelta * 0.20) + (impressionsDelta * 0.1);
      break;

    case "solar":
      // Agent B: High Reward for Backlink growth & Impressions
      rawReward = (backlinksDelta * 0.6) + (impressionsDelta * 1.5) + (ctrDelta * 2.0);
      break;

    case "insulation":
      // Agent C: High Reward for SERP stability & Long-Tail impression volume
      rawReward = (serpDelta * 0.25) + (impressionsDelta * 1.8) + (ctrDelta * 3.0);
      break;

    case "grants":
      // Agent D: High Reward for CTR to grant explainer routes & Impressions
      rawReward = (ctrDelta * 9.0) + (impressionsDelta * 1.2) + (serpDelta * 0.1);
      break;

    default:
      rawReward = (ctrDelta * 5.0) + (serpDelta * 0.1) + (backlinksDelta * 0.3) + (impressionsDelta * 0.2);
  }

  // Action-specific modifier per agent
  if (action === "link_bait" && agentId === "solar") rawReward += 0.25;
  if (action === "rewrite_article" && agentId === "heat-pumps") rawReward += 0.25;
  if (action === "queue_expansion" && agentId === "insulation") rawReward += 0.25;

  return Math.max(-1.0, Math.min(1.0, parseFloat(rawReward.toFixed(4))));
}

/**
 * Updates a specific Agent's Policy Factor Weights independently without interfering with other agents.
 */
export function updateAgentPolicy(agentId: AgentId, reward: number, action: DecisionAction): PolicyState {
  const policy = agentPolicies[agentId] || { ...DEFAULT_AGENT_POLICIES["default"], agentId };
  const alpha = policy.learningRate;
  const decay = policy.decayFactor;

  // Update target factor weights for this specific agent
  if (action === "rewrite_article" || action === "publish") {
    policy.ctrTrendWeight += alpha * reward;
    policy.serpVolatilityWeight += alpha * reward * 0.5;
  }
  if (action === "queue_expansion") {
    policy.contentVelocityWeight += alpha * reward;
    policy.serpVolatilityWeight += alpha * reward * 0.5;
  }
  if (action === "link_bait") {
    policy.backlinkGapWeight += alpha * reward;
  }
  if (action === "generate_draft") {
    policy.pillarWeaknessWeight += alpha * reward;
  }

  // Apply decay & clamp factor weights to operational bounds [0.05, 0.95]
  policy.ctrTrendWeight = Math.max(0.05, Math.min(0.95, parseFloat((policy.ctrTrendWeight * decay).toFixed(4))));
  policy.serpVolatilityWeight = Math.max(0.05, Math.min(0.95, parseFloat((policy.serpVolatilityWeight * decay).toFixed(4))));
  policy.backlinkGapWeight = Math.max(0.05, Math.min(0.95, parseFloat((policy.backlinkGapWeight * decay).toFixed(4))));
  policy.pillarWeaknessWeight = Math.max(0.05, Math.min(0.95, parseFloat((policy.pillarWeaknessWeight * decay).toFixed(4))));
  policy.contentVelocityWeight = Math.max(0.05, Math.min(0.95, parseFloat((policy.contentVelocityWeight * decay).toFixed(4))));

  policy.totalEvaluations += 1;
  policy.lastUpdated = Date.now();

  agentPolicies[agentId] = policy;
  saveMARLMemory();

  // Evolve Agent DNA Genome based on RL reward signal
  evolveAgentGenome(agentId, reward, action);

  return policy;
}

/**
 * Record an executed outcome experience into Long-Term MARL Memory for a specific Agent.
 */
export function recordAgentExperience(
  siteId: string,
  slug: string,
  action: DecisionAction,
  before: MetricsSnapshot,
  after: MetricsSnapshot
): ExperienceRecord {
  const agentId = detectAgentId(slug, siteId);
  const reward = calculateAgentReward(agentId, action, before, after);

  const record: ExperienceRecord = {
    id: `marl-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    agentId,
    siteId,
    slug,
    action,
    reward,
    beforeMetrics: before,
    afterMetrics: after,
    timestamp: Date.now()
  };

  memoryExperiences.unshift(record);
  memoryExperiences = memoryExperiences.slice(0, 500);

  // Update only the specific agent's policy
  updateAgentPolicy(agentId, reward, action);

  return record;
}

/**
 * Multi-Agent Experience Replay — Offline batch training segmented by Agent.
 */
export function runMultiAgentExperienceReplay(targetAgentId?: AgentId, sampleSize = 25): { replayCount: number; policies: Record<AgentId, PolicyState> } {
  let samples = [...memoryExperiences];
  if (targetAgentId && targetAgentId !== "default") {
    samples = samples.filter(e => e.agentId === targetAgentId);
  }

  if (samples.length === 0) {
    return { replayCount: 0, policies: agentPolicies };
  }

  const selected = samples.sort(() => 0.5 - Math.random()).slice(0, Math.min(sampleSize, samples.length));

  for (const exp of selected) {
    const reward = calculateAgentReward(exp.agentId, exp.action, exp.beforeMetrics, exp.afterMetrics);
    updateAgentPolicy(exp.agentId, reward, exp.action);
  }

  console.log(`[MARL Engine] Completed Experience Replay on ${selected.length} memories for agent: ${targetAgentId || "all"}.`);
  return { replayCount: selected.length, policies: agentPolicies };
}

/**
 * Calculates Agent Performance & Smartness Telemetry to see which agent is most effective.
 */
export function getAgentPerformance(agentId: AgentId): AgentPerformance {
  const experiences = memoryExperiences.filter(e => e.agentId === agentId);
  if (experiences.length === 0) {
    return {
      agentId,
      totalEvaluations: 0,
      averageReward: 0,
      efficiencyScore: 50,
      smartnessLevel: "Initial Baseline",
      topAction: "None"
    };
  }

  const sumReward = experiences.reduce((acc, e) => acc + e.reward, 0);
  const avgReward = parseFloat((sumReward / experiences.length).toFixed(3));
  const efficiencyScore = Math.min(100, Math.max(0, Math.round((avgReward + 1) * 50)));

  let smartnessLevel = "Novice Strategy";
  if (experiences.length >= 3 && avgReward > 0.1) smartnessLevel = "Proficient Strategy";
  if (experiences.length >= 6 && avgReward > 0.3) smartnessLevel = "Master SEO Autopilot";

  // Action breakdown
  const actionMap: Record<string, { count: number; rewardSum: number }> = {};
  for (const e of experiences) {
    if (!actionMap[e.action]) actionMap[e.action] = { count: 0, rewardSum: 0 };
    actionMap[e.action].count += 1;
    actionMap[e.action].rewardSum += e.reward;
  }

  let topAction: DecisionAction = "rewrite_article";
  let maxAvg = -2;
  for (const [act, data] of Object.entries(actionMap)) {
    const actAvg = data.rewardSum / data.count;
    if (actAvg > maxAvg) {
      maxAvg = actAvg;
      topAction = act as DecisionAction;
    }
  }

  return {
    agentId,
    totalEvaluations: experiences.length,
    averageReward: avgReward,
    efficiencyScore,
    smartnessLevel,
    topAction
  };
}

export function getAllAgentPerformances(): Record<AgentId, AgentPerformance> {
  const agents: AgentId[] = ["heat-pumps", "solar", "insulation", "grants", "default"];
  const result: Record<AgentId, AgentPerformance> = {} as any;
  for (const a of agents) {
    result[a] = getAgentPerformance(a);
  }
  return result;
}

export function getAgentRLPolicy(agentId: AgentId = "default"): PolicyState {
  return agentPolicies[agentId] || agentPolicies["default"];
}

export function getAllAgentPolicies(): Record<AgentId, PolicyState> {
  return agentPolicies;
}

export function getMARLMemoryExperiences(agentId?: AgentId, limit = 50): ExperienceRecord[] {
  if (agentId && agentId !== "default") {
    return memoryExperiences.filter(e => e.agentId === agentId).slice(0, limit);
  }
  return memoryExperiences.slice(0, limit);
}

// Auto-initialize MARL Engine
initMARLEngine();
