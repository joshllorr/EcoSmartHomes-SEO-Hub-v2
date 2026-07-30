/**
 * src/server/marlCoordinator.ts
 * 
 * Layer 7 — Multi-Agent Coordination Layer ("The Orchestra Conductor")
 * Aggregates proposals across all Pillar Agents, resolves resource/slug conflicts,
 * enforces global execution concurrency limits (max 3 tasks), and manages per-agent autonomy toggles.
 */

import { AgentId, getAgentRLPolicy } from "./rlEngine";
import { Decision, DecisionAction, PreFlightCheckResult, runPreFlightChecklist } from "./decisionEngine";
import { runAgentNegotiation } from "./marlNegotiation";
import { getAgentGenome } from "./marlGenome";

export type AgentAutonomyMode = "full_autonomous" | "assisted" | "paused";

export interface AgentProposal extends Decision {
  agentId: AgentId;
  score: number; // priority * confidence
}

export interface CoordinatedQueueItem {
  id: string;
  proposal: AgentProposal;
  status: "EXECUTING" | "QUEUED_ASSISTED" | "DEFERRED_CONFLICT" | "DEFERRED_CONCURRENCY" | "DEFERRED_PAUSED";
  reason: string;
  timestamp: number;
}

export interface CoordinatorState {
  maxConcurrency: number; // Default: 3 concurrent tasks
  activeExecutingCount: number;
  agentAutonomyModes: Record<AgentId, AgentAutonomyMode>;
  coordinatedQueue: CoordinatedQueueItem[];
  conflictResolutionsCount: number;
  lastCoordinatedAt: number | null;
}

const coordinatorState: CoordinatorState = {
  maxConcurrency: 3,
  activeExecutingCount: 0,
  agentAutonomyModes: {
    "heat-pumps": "full_autonomous",
    "solar": "full_autonomous",
    "insulation": "assisted",
    "grants": "full_autonomous",
    "default": "assisted"
  },
  coordinatedQueue: [],
  conflictResolutionsCount: 0,
  lastCoordinatedAt: null
};

/** Get current Coordinator State */
export function getCoordinatorState(): CoordinatorState {
  return coordinatorState;
}

/** Update Autonomy Mode for a specific Pillar Agent */
export function setAgentAutonomyMode(agentId: AgentId, mode: AgentAutonomyMode): Record<AgentId, AgentAutonomyMode> {
  coordinatorState.agentAutonomyModes[agentId] = mode;
  return coordinatorState.agentAutonomyModes;
}

/**
 * Multi-Agent Proposal Evaluator & Conflict Resolver ("Orchestra Conductor")
 * 1. Collects proposals from all active agents.
 * 2. Groups proposals by target (siteId + slug).
 * 3. Resolves conflicts: selects highest scoring proposal (priority * confidence).
 * 4. Checks per-agent autonomy mode & global concurrency limits.
 */
export function evaluateProposals(
  rawDecisions: Decision[],
  currentExecutingCount = 0
): {
  approvedForExecution: AgentProposal[];
  coordinatedQueue: CoordinatedQueueItem[];
} {
  const now = Date.now();
  coordinatorState.activeExecutingCount = currentExecutingCount;

  // 1. Map raw decisions into Agent Proposals with calculated scores
  const proposals: AgentProposal[] = rawDecisions.map((d) => {
    const slugLower = `${d.slug} ${d.siteId}`.toLowerCase();
    let agentId: AgentId = "default";
    if (slugLower.includes("heat-pump") || slugLower.includes("heatpump")) agentId = "heat-pumps";
    else if (slugLower.includes("solar") || slugLower.includes("pv")) agentId = "solar";
    else if (slugLower.includes("insulation") || slugLower.includes("attic")) agentId = "insulation";
    else if (slugLower.includes("grant") || slugLower.includes("seai")) agentId = "grants";

    const policy = getAgentRLPolicy(agentId);
    const score = parseFloat((d.priority * d.confidence * (policy.ctrTrendWeight / 0.30)).toFixed(3));

    return {
      ...d,
      agentId,
      score
    };
  });

  // 1.5. Run Pre-Conductor Multi-Agent Negotiation Loop (Delegation, Peer Boosting, Joint Coalitions)
  const negotiationResult = runAgentNegotiation(proposals);
  const negotiatedProposals = negotiationResult.negotiatedProposals;

  // 2. Conflict Resolution: Group proposals by target (siteId + ":" + slug)
  const targetMap = new Map<string, AgentProposal[]>();
  for (const p of negotiatedProposals) {
    const targetKey = `${p.siteId}:${p.slug}`;
    if (!targetMap.has(targetKey)) targetMap.set(targetKey, []);
    targetMap.get(targetKey)!.push(p);
  }

  const winners: AgentProposal[] = [];
  const conflicts: AgentProposal[] = [];

  for (const [targetKey, list] of targetMap.entries()) {
    if (list.length === 1) {
      winners.push(list[0]);
    } else {
      // Sort by score descending — highest score wins conflict!
      list.sort((a, b) => b.score - a.score);
      winners.push(list[0]);
      conflicts.push(...list.slice(1));
      coordinatorState.conflictResolutionsCount += (list.length - 1);
      console.log(`[Coordinator Conductor] Conflict Resolved for ${targetKey}: Winner = Agent [${list[0].agentId}] (Score: ${list[0].score})`);
    }
  }

  // Sort winning proposals by score descending
  winners.sort((a, b) => b.score - a.score);

  const approvedForExecution: AgentProposal[] = [];
  const queueItems: CoordinatedQueueItem[] = [];
  let availableSlots = Math.max(0, coordinatorState.maxConcurrency - currentExecutingCount);

  // 3. Process winning proposals against per-agent autonomy & global concurrency
  for (const p of winners) {
    const mode = coordinatorState.agentAutonomyModes[p.agentId] || "assisted";
    const genome = getAgentGenome(p.agentId);
    const isCoolingDown = genome.cooldownUntil && genome.cooldownUntil > now;
    p.autonomyMode = mode;

    if (isCoolingDown) {
      queueItems.push({
        id: `coord-${now}-${p.id}`,
        proposal: p,
        status: "DEFERRED_PAUSED",
        reason: `Agent [${p.agentId.toUpperCase()}] is under Stabilization Negotiation Cooldown.`,
        timestamp: now
      });
    } else if (mode === "paused") {
      queueItems.push({
        id: `coord-${now}-${p.id}`,
        proposal: p,
        status: "DEFERRED_PAUSED",
        reason: `Agent [${p.agentId.toUpperCase()}] is PAUSED by operator.`,
        timestamp: now
      });
    } else if (mode === "assisted") {
      queueItems.push({
        id: `coord-${now}-${p.id}`,
        proposal: p,
        status: "QUEUED_ASSISTED",
        reason: `Agent [${p.agentId.toUpperCase()}] is in ASSISTED mode — queued for human review.`,
        timestamp: now
      });
    } else if (mode === "full_autonomous") {
      if (availableSlots > 0) {
        approvedForExecution.push(p);
        availableSlots -= 1;
        queueItems.push({
          id: `coord-${now}-${p.id}`,
          proposal: p,
          status: "EXECUTING",
          reason: `Approved by Coordinator. Executing autonomously.`,
          timestamp: now
        });
      } else {
        queueItems.push({
          id: `coord-${now}-${p.id}`,
          proposal: p,
          status: "DEFERRED_CONCURRENCY",
          reason: `Global Concurrency Limit reached (${coordinatorState.maxConcurrency} active tasks). Throttled in queue.`,
          timestamp: now
        });
      }
    }
  }

  // Add conflict deferred items to queue logs
  for (const c of conflicts) {
    queueItems.push({
      id: `coord-${now}-${c.id}`,
      proposal: c,
      status: "DEFERRED_CONFLICT",
      reason: `Conflict Deferred: Lower score than competing proposal on ${c.siteId}/${c.slug}.`,
      timestamp: now
    });
  }

  coordinatorState.coordinatedQueue = queueItems.slice(0, 50);
  coordinatorState.lastCoordinatedAt = now;

  return {
    approvedForExecution,
    coordinatedQueue: queueItems
  };
}
