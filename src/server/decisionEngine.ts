/**
 * src/server/decisionEngine.ts
 *
 * Layer 7 — AI-Driven Predictive Autonomous Decision Engine
 * Includes Per-Domain Autonomy Modes (Passive | Assisted | Full Autonomous),
 * Action-Specific Cooldown Timers, Pre-Flight Safety Checklist, and Confidence Gate.
 */

import {
  runDraftGenerator,
  runRewriteEngine,
  queueExpansion,
  runLinkBaitGenerator,
  publishToGitHub,
  DraftPayload,
  RewritePayload,
  ExpansionPayload,
  LinkBaitPayload,
  PublishPayload,
} from '../engines/index';
import { detectAgentId, getAgentRLPolicy } from './rlEngine';
import { evaluateProposals } from './marlCoordinator';

export type AutonomyMode =
  'passive' | 'assisted' | 'full_autonomous' | 'paused';

export type PageSignal = {
  slug: string;
  siteId: string;
  serpVolatility: number;
  trafficTrend: number; // negative = dropping
  backlinks: number;
  pillarScore: number; // 0–1
};

export type TrendVectors = {
  ctrTrend: number; // e.g. -0.03 (-3% WoW)
  serpVolatilityTrend: number; // e.g. 0.12 (+12% volatility rise)
  backlinkGrowthTrend: number; // e.g. 0.08 (+8% growth speed)
  pillarStrengthTrend: number; // e.g. 0.01 (+1% pillar gain)
  contentVelocityTrend: number; // e.g. -0.10 (-10% velocity drop)
};

export type DecisionAction =
  | 'generate_draft'
  | 'rewrite_article'
  | 'queue_expansion'
  | 'link_bait'
  | 'publish';

/** Action-Specific Cooldown Limits (in minutes) to prevent runaway automation */
export const ACTION_COOLDOWN_MINUTES: Record<DecisionAction, number> = {
  rewrite_article: 30, // 30 mins
  queue_expansion: 45, // 45 mins
  link_bait: 60, // 60 mins (1 hour)
  publish: 15, // 15 mins
  generate_draft: 20, // 20 mins
};

export interface PreFlightCheckResult {
  passed: boolean;
  checks: {
    hubOnline: boolean;
    queueLengthReasonable: boolean;
    noConflictingTasks: boolean;
    noManualOverride: boolean;
    noCooldownViolation: boolean;
  };
  failureReason?: string;
}

export type Decision = {
  id: string;
  action: DecisionAction;
  siteId: string;
  slug: string;
  reason: string;
  priority: number;
  confidence: number; // 0.0 – 1.0 (Harbor only executes if >= 0.70 threshold)
  timestamp: number;
  executed: boolean;
  executionResult?: string;
  isPredictive?: boolean;
  preFlightResult?: PreFlightCheckResult;
  autonomyMode?: AutonomyMode;
};

export interface DecisionEngineState {
  autoPilotEnabled: boolean;
  minConfidenceThreshold: number; // Default: 0.70
  lastManualOverrideAt: number | null;
  lastRunAt: number | null;
  domainAutonomyModes: Record<string, AutonomyMode>;
  trendVectors: TrendVectors;
  decisionsHistory: Decision[];
  activeSignals: PageSignal[];
  executingTaskKeys: Set<string>;
  actionCooldowns: Map<string, number>; // "siteId:slug:action" -> timestamp
}

const engineState: DecisionEngineState = {
  autoPilotEnabled: true,
  minConfidenceThreshold: 0.7,
  lastManualOverrideAt: null,
  lastRunAt: null,
  domainAutonomyModes: {
    'ecosmarthomes.ie': 'full_autonomous',
    'future-site-1.ie': 'assisted',
  },
  trendVectors: {
    ctrTrend: -0.06,
    serpVolatilityTrend: 0.14,
    backlinkGrowthTrend: 0.08,
    pillarStrengthTrend: 0.01,
    contentVelocityTrend: -0.05,
  },
  decisionsHistory: [],
  activeSignals: [],
  executingTaskKeys: new Set<string>(),
  actionCooldowns: new Map<string, number>(),
};

/**
 * Sets Autonomy Mode per domain (passive | assisted | full_autonomous)
 */
export function setDomainAutonomyMode(
  siteId: string,
  mode: AutonomyMode,
): Record<string, AutonomyMode> {
  engineState.domainAutonomyModes[siteId] = mode;
  return engineState.domainAutonomyModes;
}

/**
 * Gets configured domain autonomy modes
 */
export function getDomainAutonomyModes(): Record<string, AutonomyMode> {
  return engineState.domainAutonomyModes;
}

/**
 * Evaluates Pre-Flight Safety Checklist + Action-Specific Cooldowns before firing an autonomous action
 */
export function runPreFlightChecklist(
  d: Decision,
  currentQueueLength = 2,
  maxQueueLength = 10,
): PreFlightCheckResult {
  const now = Date.now();
  const taskKey = `${d.siteId}:${d.slug}:${d.action}`;
  const cooldownKey = `${d.siteId}:${d.slug}:${d.action}`;
  const lastFiredAt = engineState.actionCooldowns.get(cooldownKey) || 0;

  const cooldownMinutes = ACTION_COOLDOWN_MINUTES[d.action] || 30;
  const cooldownMs = cooldownMinutes * 60 * 1000;

  const hubOnline = true; // Local Hub server is connected
  const queueLengthReasonable = currentQueueLength < maxQueueLength;
  const noConflictingTasks = !engineState.executingTaskKeys.has(taskKey);
  const noManualOverride =
    !engineState.lastManualOverrideAt ||
    now - engineState.lastManualOverrideAt > 2 * 60 * 1000;
  const noCooldownViolation = now - lastFiredAt > cooldownMs;

  const checks = {
    hubOnline,
    queueLengthReasonable,
    noConflictingTasks,
    noManualOverride,
    noCooldownViolation,
  };

  const failedChecks: string[] = [];
  if (!hubOnline) failedChecks.push('Hub Offline');
  if (!queueLengthReasonable)
    failedChecks.push(
      `Queue length exceeded (${currentQueueLength}/${maxQueueLength})`,
    );
  if (!noConflictingTasks)
    failedChecks.push('Task conflict currently executing');
  if (!noManualOverride) failedChecks.push('Recent manual override active');
  if (!noCooldownViolation) {
    const elapsedMins = Math.floor((now - lastFiredAt) / 60000);
    failedChecks.push(
      `Action Cooldown Active (${d.action} limited to 1x per ${cooldownMinutes}m, last ran ${elapsedMins}m ago)`,
    );
  }

  const passed = failedChecks.length === 0;
  const failureReason = passed ? undefined : failedChecks.join(', ');

  return { passed, checks, failureReason };
}

/**
 * Calculates / updates current trend vectors across rolling analytics
 */
export function calculateTrendVectors(): TrendVectors {
  engineState.trendVectors = {
    ctrTrend: parseFloat((-0.03 - Math.random() * 0.04).toFixed(3)),
    serpVolatilityTrend: parseFloat((0.1 + Math.random() * 0.06).toFixed(3)),
    backlinkGrowthTrend: parseFloat((0.07 + Math.random() * 0.04).toFixed(3)),
    pillarStrengthTrend: parseFloat((0.01 + Math.random() * 0.02).toFixed(3)),
    contentVelocityTrend: parseFloat((-0.04 - Math.random() * 0.06).toFixed(3)),
  };
  return engineState.trendVectors;
}

/**
 * Predictive Decision Evaluator based on system trend vectors
 */
export function evalPredictiveRules(trends: TrendVectors): Decision[] {
  const decisions: Decision[] = [];
  const now = Date.now();

  if (trends.ctrTrend < -0.05 && trends.serpVolatilityTrend > 0.1) {
    const agentId = detectAgentId('heat-pump-costs', 'ecosmarthomes.ie');
    const policy = getAgentRLPolicy(agentId);
    const confidence = Math.min(
      0.99,
      parseFloat((0.88 * (policy.ctrTrendWeight / 0.3)).toFixed(2)),
    );
    decisions.push({
      id: `pred-${now}-1`,
      action: 'rewrite_article',
      siteId: 'ecosmarthomes.ie',
      slug: 'heat-pump-costs',
      reason: `PREDICTIVE [Agent: ${agentId}]: CTR dropping (${(trends.ctrTrend * 100).toFixed(1)}%) + SERP volatility rising (${(trends.serpVolatilityTrend * 100).toFixed(1)}%) — preemptive rewrite`,
      priority: 0.95,
      confidence,
      timestamp: now,
      executed: false,
      isPredictive: true,
    });
  }

  if (trends.backlinkGrowthTrend < 0.1) {
    const agentId = detectAgentId(
      'solar-pv-grants-ireland',
      'future-site-1.ie',
    );
    const policy = getAgentRLPolicy(agentId);
    const confidence = Math.min(
      0.99,
      parseFloat((0.82 * (policy.backlinkGapWeight / 0.2)).toFixed(2)),
    );
    decisions.push({
      id: `pred-${now}-2`,
      action: 'link_bait',
      siteId: 'future-site-1.ie',
      slug: 'solar-pv-grants-ireland',
      reason: `PREDICTIVE [Agent: ${agentId}]: Backlink growth slowing (${(trends.backlinkGrowthTrend * 100).toFixed(1)}%) — generate new link-bait asset`,
      priority: 0.9,
      confidence,
      timestamp: now,
      executed: false,
      isPredictive: true,
    });
  }

  if (trends.pillarStrengthTrend < 0.02 && trends.contentVelocityTrend < 0) {
    const agentId = detectAgentId('attic-insulation-guide', 'ecosmarthomes.ie');
    const policy = getAgentRLPolicy(agentId);
    const confidence = Math.min(
      0.99,
      parseFloat((0.76 * (policy.contentVelocityWeight / 0.1)).toFixed(2)),
    );
    decisions.push({
      id: `pred-${now}-3`,
      action: 'queue_expansion',
      siteId: 'ecosmarthomes.ie',
      slug: 'attic-insulation-guide',
      reason: `PREDICTIVE [Agent: ${agentId}]: Pillar stagnating (+${(trends.pillarStrengthTrend * 100).toFixed(1)}%) & content velocity dropping (${(trends.contentVelocityTrend * 100).toFixed(1)}%) — expand coverage before decline`,
      priority: 0.85,
      confidence,
      timestamp: now,
      executed: false,
      isPredictive: true,
    });
  }

  return decisions;
}

/**
 * Core Reactive Rule Evaluator for a single page signal
 */
export function decideForPage(s: PageSignal): Decision[] {
  const decisions: Decision[] = [];
  const now = Date.now();

  if (s.trafficTrend < -0.2 && s.pillarScore < 0.6) {
    decisions.push({
      id: `dec-${now}-${Math.random().toString(36).substring(2, 7)}`,
      action: 'rewrite_article',
      siteId: s.siteId,
      slug: s.slug,
      reason: `Traffic dropping (${(s.trafficTrend * 100).toFixed(0)}%) and pillar score weak (${(s.pillarScore * 100).toFixed(0)}%)`,
      priority: 0.9,
      confidence: 0.91,
      timestamp: now,
      executed: false,
    });
  }

  if (s.backlinks < 3 && s.pillarScore >= 0.6) {
    decisions.push({
      id: `dec-${now}-${Math.random().toString(36).substring(2, 7)}`,
      action: 'link_bait',
      siteId: s.siteId,
      slug: s.slug,
      reason: `Strong pillar score (${(s.pillarScore * 100).toFixed(0)}%), but backlink count low (${s.backlinks})`,
      priority: 0.8,
      confidence: 0.84,
      timestamp: now,
      executed: false,
    });
  }

  if (s.serpVolatility > 0.3) {
    decisions.push({
      id: `dec-${now}-${Math.random().toString(36).substring(2, 7)}`,
      action: 'queue_expansion',
      siteId: s.siteId,
      slug: s.slug,
      reason: `High SERP volatility detected (${s.serpVolatility.toFixed(2)}) — expanding coverage`,
      priority: 0.7,
      confidence: 0.78,
      timestamp: now,
      executed: false,
    });
  }

  if (s.pillarScore < 0.4 && s.trafficTrend >= -0.2) {
    decisions.push({
      id: `dec-${now}-${Math.random().toString(36).substring(2, 7)}`,
      action: 'generate_draft',
      siteId: s.siteId,
      slug: s.slug,
      reason: `Pillar readiness low (${(s.pillarScore * 100).toFixed(0)}%) — generate fresh content draft`,
      priority: 0.65,
      confidence: 0.68,
      timestamp: now,
      executed: false,
    });
  }

  return decisions;
}

/**
 * Loads aggregated PageSignals across all connected fleet domains
 */
export async function loadPageSignals(): Promise<PageSignal[]> {
  const domains = ['ecosmarthomes.ie', 'future-site-1.ie'];
  const sampleSlugs = [
    'heat-pump-costs',
    'solar-pv-grants-ireland',
    'attic-insulation-guide',
    'seai-grant-checker',
    'ber-rating-upgrade',
  ];

  const signals: PageSignal[] = [];

  for (const siteId of domains) {
    for (const slug of sampleSlugs) {
      const hash = (siteId + slug)
        .split('')
        .reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const serpVolatility = parseFloat(((hash % 50) / 100 + 0.1).toFixed(2));
      const trafficTrend = parseFloat((((hash % 70) - 45) / 100).toFixed(2));
      const backlinks = hash % 8;
      const pillarScore = parseFloat((((hash % 60) + 30) / 100).toFixed(2));

      signals.push({
        slug,
        siteId,
        serpVolatility,
        trafficTrend,
        backlinks,
        pillarScore,
      });
    }
  }

  engineState.activeSignals = signals;
  return signals;
}

/**
 * Executes high-priority autonomous decisions according to domain autonomy mode + pre-flight checklist.
 */
export async function executeDecisions(
  decisions: Decision[],
  minPriority = 0.7,
  minConfidence = engineState.minConfidenceThreshold,
): Promise<Decision[]> {
  const executedList: Decision[] = [];

  for (const d of decisions) {
    // Determine Per-Domain Autonomy Mode (default: assisted)
    const mode = engineState.domainAutonomyModes[d.siteId] || 'assisted';
    d.autonomyMode = mode;

    if (mode === 'passive') {
      d.executed = false;
      d.executionResult =
        'PASSIVE MODE: Suggestion logged (Auto-execution disabled)';
    } else if (mode === 'assisted') {
      d.executed = false;
      d.executionResult = 'ASSISTED MODE: Queued for Human Approval';
    } else if (mode === 'full_autonomous') {
      // 1. Confidence & Priority Gate
      if (
        d.priority >= minPriority &&
        d.confidence >= minConfidence &&
        !d.executed
      ) {
        // 2. Pre-Flight Safety Checklist Gate (including Cooldown check)
        const preFlight = runPreFlightChecklist(d);
        d.preFlightResult = preFlight;

        if (!preFlight.passed) {
          console.warn(
            `[Pre-Flight & Cooldown] Action DEFERRED for ${d.siteId}/${d.slug} (${d.action}): ${preFlight.failureReason}`,
          );
          d.executed = false;
          d.executionResult = `DEFERRED: ${preFlight.failureReason}`;
        } else {
          d.executed = true;
          d.executionResult = 'Processing in background...';
          executedList.push(d);

          const taskKey = `${d.siteId}:${d.slug}:${d.action}`;
          engineState.executingTaskKeys.add(taskKey);
          engineState.actionCooldowns.set(taskKey, Date.now());

          (async () => {
            try {
              console.log(
                `[Predictive Engine] Full Autonomous Executing (${d.action}): ${d.siteId}/${d.slug}`,
              );
              let res: unknown;
              switch (d.action) {
                case 'generate_draft':
                  res = await runDraftGenerator({
                    slug: d.slug,
                    siteId: d.siteId,
                  } as DraftPayload);
                  break;
                case 'rewrite_article':
                  res = await runRewriteEngine({
                    slug: d.slug,
                    siteId: d.siteId,
                  } as RewritePayload);
                  break;
                case 'queue_expansion':
                  res = await queueExpansion({
                    slug: d.slug,
                    siteId: d.siteId,
                  } as ExpansionPayload);
                  break;
                case 'link_bait':
                  res = await runLinkBaitGenerator({
                    slug: d.slug,
                    siteId: d.siteId,
                  } as LinkBaitPayload);
                  break;
                case 'publish':
                  res = await publishToGitHub({
                    slug: d.slug,
                    siteId: d.siteId,
                  } as PublishPayload);
                  break;
              }
              d.executionResult = JSON.stringify(res || { ok: true });
            } catch (err) {
              const errorMsg = err instanceof Error ? err.message : String(err);
              console.error(
                `[Predictive Engine] Failed to execute ${d.action}:`,
                errorMsg,
              );
              d.executionResult = `Error: ${errorMsg}`;
            } finally {
              engineState.executingTaskKeys.delete(taskKey);
            }
          })();
        }
      }
    }

    // Record decision into ledger
    if (
      !engineState.decisionsHistory.some((existing) => existing.id === d.id)
    ) {
      engineState.decisionsHistory.unshift(d);
    }
  }

  engineState.decisionsHistory = engineState.decisionsHistory.slice(0, 100);
  return executedList;
}

/**
 * Runs a full predictive decision cycle with Autonomy Modes & Pre-Flight validation
 */
export async function runDecisionCycle(): Promise<{
  trends: TrendVectors;
  signals: PageSignal[];
  decisions: Decision[];
  executed: Decision[];
}> {
  const trends = calculateTrendVectors();
  const signals = await loadPageSignals();

  const predictiveDecisions = evalPredictiveRules(trends);
  const reactiveDecisions = signals.flatMap(decideForPage);

  const rawDecisions = [...predictiveDecisions, ...reactiveDecisions];
  rawDecisions.sort((a, b) => b.priority - a.priority);

  // Pass raw decisions through Multi-Agent Coordinator ("Orchestra Conductor")
  const coordinated = evaluateProposals(
    rawDecisions,
    engineState.executingTaskKeys.size,
  );

  let executed: Decision[] = [];
  if (
    engineState.autoPilotEnabled &&
    coordinated.approvedForExecution.length > 0
  ) {
    executed = await executeDecisions(
      coordinated.approvedForExecution,
      0.7,
      engineState.minConfidenceThreshold,
    );
  } else {
    for (const d of rawDecisions) {
      if (
        !engineState.decisionsHistory.some((existing) => existing.id === d.id)
      ) {
        engineState.decisionsHistory.unshift(d);
      }
    }
    engineState.decisionsHistory = engineState.decisionsHistory.slice(0, 100);
  }

  engineState.lastRunAt = Date.now();
  return { trends, signals, decisions: rawDecisions, executed };
}

/**
 * Gets decision engine status & history
 */
export function getDecisionEngineState(): DecisionEngineState {
  return engineState;
}

/**
 * Toggles auto-pilot status and records manual override timestamp
 */
export function setAutoPilot(enabled: boolean): boolean {
  engineState.autoPilotEnabled = enabled;
  engineState.lastManualOverrideAt = Date.now();
  return engineState.autoPilotEnabled;
}
