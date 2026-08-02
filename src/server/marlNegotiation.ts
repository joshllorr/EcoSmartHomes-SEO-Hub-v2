/**
 * src/server/marlNegotiation.ts
 *
 * Layer 7 — Multi-Agent 4-Step Negotiation Protocol & Emergent Coalition Behavior
 * Implements the 4-Step Negotiation Protocol and 4 Emergent Coalition Structures:
 * 1. MENTOR Coalitions — Strong veteran agent guides weaker/newer agent.
 * 2. SYMBIOTIC Coalitions — Two agents repeatedly collaborate as aligned allies.
 * 3. COMPETITIVE Coalitions — Agents compete for priority but form strategic alliances.
 * 4. ADAPTIVE Coalitions — Agents switch partners based on recent outcome rewards.
 */

import { AgentId, getAgentPerformance } from './rlEngine';
import { AgentProposal } from './marlCoordinator';
import { getAgentGenome } from './marlGenome';

export type CoalitionType =
  | 'REINFORCEMENT'
  | 'DELEGATION'
  | 'PRIORITY'
  | 'DEFENSIVE'
  | 'MENTOR'
  | 'SYMBIOTIC'
  | 'COMPETITIVE'
  | 'ADAPTIVE';

export type NegotiationStyle =
  | 'aggressive'
  | 'strategic'
  | 'defensive'
  | 'clarification'
  | 'collaborative'
  | 'analytical';
export type RiskTolerance = 'high' | 'medium' | 'low';

export interface AgentProfile {
  agentId: AgentId;
  style: NegotiationStyle;
  riskTolerance: RiskTolerance;
  specialtyActions: string[];
  coalitionAffinity: AgentId[];
  personalityTraits: string[];
}

export interface CoalitionProposal {
  coalitionId: string;
  type: CoalitionType;
  members: AgentId[];
  leadAgent: AgentId;
  partnerAgent: AgentId;
  action: string;
  slug: string;
  siteId: string;
  rationale: string;
  confidence: number;
  jointScore: number;
  rewardShareRatio: string;
  timestamp: number;
}

export interface NegotiationRecord {
  id: string;
  type:
    | 'BROADCAST'
    | 'CROSS_BOOST'
    | 'DELEGATION'
    | 'COALITION_FORMED'
    | 'DEFENSIVE_BLOCK'
    | 'MEDIATED_RESOLVE';
  initiatorAgent: AgentId;
  targetAgent?: AgentId;
  slug: string;
  detail: string;
  scoreAdjustment: number;
  timestamp: number;
}

export interface NegotiationState {
  agentProfiles: Record<AgentId, AgentProfile>;
  activeCoalitions: CoalitionProposal[];
  negotiationLogs: NegotiationRecord[];
  totalNegotiationRounds: number;
}

const DEFAULT_AGENT_PROFILES: Record<AgentId, AgentProfile> = {
  'heat-pumps': {
    agentId: 'heat-pumps',
    style: 'aggressive',
    riskTolerance: 'high',
    specialtyActions: ['rewrite_article', 'publish'],
    coalitionAffinity: ['solar', 'grants'],
    personalityTraits: [
      'Pushes rewrite actions aggressively',
      'High confidence',
      'Prefers reinforcement coalitions',
    ],
  },
  solar: {
    agentId: 'solar',
    style: 'strategic',
    riskTolerance: 'high',
    specialtyActions: ['link_bait', 'queue_expansion'],
    coalitionAffinity: ['heat-pumps', 'insulation'],
    personalityTraits: [
      'Prefers link-bait + expansion coalitions',
      'High patience',
      'Often delegates rewrites',
    ],
  },
  insulation: {
    agentId: 'insulation',
    style: 'defensive',
    riskTolerance: 'low',
    specialtyActions: ['queue_expansion', 'rewrite_article'],
    coalitionAffinity: ['grants', 'heat-pumps'],
    personalityTraits: [
      'Blocks risky actions during high volatility',
      'Prefers stability coalitions',
      'Low risk tolerance',
    ],
  },
  grants: {
    agentId: 'grants',
    style: 'analytical',
    riskTolerance: 'low',
    specialtyActions: ['publish', 'generate_draft'],
    coalitionAffinity: ['heat-pumps', 'solar', 'insulation'],
    personalityTraits: [
      'Prefers rewrite + publish explainers',
      'Medium confidence',
      'Mediates conflict deadlocks',
    ],
  },
  default: {
    agentId: 'default',
    style: 'collaborative',
    riskTolerance: 'medium',
    specialtyActions: ['rewrite_article'],
    coalitionAffinity: ['heat-pumps'],
    personalityTraits: ['Standard fleet collaborator'],
  },
};

const negotiationState: NegotiationState = {
  agentProfiles: JSON.parse(JSON.stringify(DEFAULT_AGENT_PROFILES)),
  activeCoalitions: [],
  negotiationLogs: [],
  totalNegotiationRounds: 0,
};

export function getNegotiationState(): NegotiationState {
  return negotiationState;
}

/**
 * Resolves Emergent Coalition Type based on performance telemetry & agent synergies
 */
function resolveEmergentCoalitionType(
  p1: AgentProposal,
  p2: AgentProposal,
): CoalitionType {
  const perf1 = getAgentPerformance(p1.agentId);
  const perf2 = getAgentPerformance(p2.agentId);

  // Mentor Coalition: Veteran agent (>3 evals ahead) guides newer agent
  if (Math.abs(perf1.totalEvaluations - perf2.totalEvaluations) >= 3) {
    return 'MENTOR';
  }

  // Symbiotic Coalition: Repeatedly aligned Heat Pumps & Solar alliance
  if (
    (p1.agentId === 'heat-pumps' && p2.agentId === 'solar') ||
    (p1.agentId === 'solar' && p2.agentId === 'heat-pumps')
  ) {
    return 'SYMBIOTIC';
  }

  // Competitive Coalition: Close priority scores competing on same target
  if (Math.abs(p1.score - p2.score) < 0.08) {
    return 'COMPETITIVE';
  }

  // Adaptive Coalition: Dynamic partner switching
  return 'ADAPTIVE';
}

/**
 * Executes 4-Step Negotiation Protocol with Emergent Coalition Behavior
 */
export function runAgentNegotiation(rawProposals: AgentProposal[]): {
  negotiatedProposals: AgentProposal[];
  activeCoalitions: CoalitionProposal[];
  negotiationLogs: NegotiationRecord[];
} {
  const now = Date.now();
  negotiationState.totalNegotiationRounds += 1;
  const logs: NegotiationRecord[] = [];
  let negotiatedProposals = rawProposals.map((p) => ({ ...p }));

  // STEP 1 — AGENTS BROADCAST PROPOSALS
  for (const p of rawProposals) {
    logs.push({
      id: `neg-step1-${now}-${Math.random().toString(36).substring(2, 7)}`,
      type: 'BROADCAST',
      initiatorAgent: p.agentId,
      slug: p.slug,
      detail: `[STEP 1 BROADCAST] Agent [${p.agentId.toUpperCase()}] broadcasted proposal (${p.action}) on ${p.siteId}/${p.slug} (Priority: ${p.priority}, Confidence: ${p.confidence}).`,
      scoreAdjustment: 0,
      timestamp: now,
    });
  }

  // STEP 2 — AGENTS EVALUATE EACH OTHER
  negotiatedProposals = negotiatedProposals.filter((p) => {
    const isRisky = p.action === 'rewrite_article' || p.action === 'publish';
    const isHighVolatility = p.confidence < 0.65;

    if (isRisky && isHighVolatility) {
      logs.push({
        id: `neg-step2-${now}-${Math.random().toString(36).substring(2, 7)}`,
        type: 'DEFENSIVE_BLOCK',
        initiatorAgent: 'insulation',
        targetAgent: p.agentId,
        slug: p.slug,
        detail: `[STEP 2 EVALUATION] 🧱 The Stabilizer (Insulation) blocked risky action (${p.action}) on ${p.slug} — SERP volatility too high.`,
        scoreAdjustment: -1.0,
        timestamp: now,
      });
      return false;
    }
    return true;
  });

  for (const p of negotiatedProposals) {
    if (p.agentId === 'solar' && p.action === 'rewrite_article') {
      const prev = p.agentId;
      p.agentId = 'heat-pumps';
      p.score = parseFloat((p.score + 0.15).toFixed(3));
      logs.push({
        id: `neg-step2-${now}-${Math.random().toString(36).substring(2, 7)}`,
        type: 'DELEGATION',
        initiatorAgent: prev,
        targetAgent: 'heat-pumps',
        slug: p.slug,
        detail: `[STEP 2 EVALUATION] ☀️ The Authority Builder (Solar) delegated rewrite on ${p.slug} to 🔥 The Converter (Heat Pumps).`,
        scoreAdjustment: 0.15,
        timestamp: now,
      });
    }
  }

  // STEP 3 — AGENTS ADJUST PROPOSALS
  for (const p of negotiatedProposals) {
    if (p.agentId === 'heat-pumps' && p.action === 'rewrite_article') {
      const genome = getAgentGenome('heat-pumps');
      const boost = parseFloat((0.15 + genome.rewriteBias * 0.15).toFixed(3));
      p.score = parseFloat((p.score + boost).toFixed(3));
      logs.push({
        id: `neg-step3-${now}-${Math.random().toString(36).substring(2, 7)}`,
        type: 'CROSS_BOOST',
        initiatorAgent: 'heat-pumps',
        slug: p.slug,
        detail: `[STEP 3 ADJUSTMENT] 🔥 The Converter (Heat Pumps) aggressively boosted rewrite priority (+${boost} score, Genome Rewrite Bias: ${genome.rewriteBias}).`,
        scoreAdjustment: boost,
        timestamp: now,
      });
    }
  }

  for (let i = 0; i < negotiatedProposals.length; i++) {
    for (let j = i + 1; j < negotiatedProposals.length; j++) {
      const p1 = negotiatedProposals[i];
      const p2 = negotiatedProposals[j];
      if (p1.slug === p2.slug && Math.abs(p1.score - p2.score) < 0.05) {
        p1.score = parseFloat((p1.score + 0.1).toFixed(3));
        logs.push({
          id: `neg-step3-${now}-${Math.random().toString(36).substring(2, 7)}`,
          type: 'MEDIATED_RESOLVE',
          initiatorAgent: 'grants',
          targetAgent: p1.agentId,
          slug: p1.slug,
          detail: `[STEP 3 ADJUSTMENT] 💶 The Explainer (Grants) mediated deadlock between ${p1.agentId.toUpperCase()} and ${p2.agentId.toUpperCase()}.`,
          scoreAdjustment: 0.1,
          timestamp: now,
        });
        break;
      }
    }
  }

  // STEP 4 — COALITION FORMATION
  const newCoalitions: CoalitionProposal[] = [];

  for (let i = 0; i < negotiatedProposals.length; i++) {
    const p1 = negotiatedProposals[i];
    for (let j = i + 1; j < negotiatedProposals.length; j++) {
      const p2 = negotiatedProposals[j];

      if (p1.agentId !== p2.agentId && p1.slug === p2.slug) {
        const compositeScore =
          p1.priority * p1.confidence + p2.priority * p2.confidence;
        const jointScore = parseFloat((compositeScore + 0.25).toFixed(3));
        const jointConfidence = parseFloat(
          ((p1.confidence + p2.confidence) / 2).toFixed(2),
        );

        const emergentType = resolveEmergentCoalitionType(p1, p2);
        const coalitionId = `coalition-${now}-${p1.agentId}-${p2.agentId}`;

        const coalition: CoalitionProposal = {
          coalitionId,
          type: emergentType,
          members: [p1.agentId, p2.agentId],
          leadAgent: p1.agentId,
          partnerAgent: p2.agentId,
          action: `${p1.action} + ${p2.action}`,
          slug: p1.slug,
          siteId: p1.siteId,
          rationale: `[${emergentType} COALITION] Emergent alliance between ${p1.agentId.toUpperCase()} & ${p2.agentId.toUpperCase()} on ${p1.slug} (Confidence: ${jointConfidence})`,
          confidence: jointConfidence,
          jointScore,
          rewardShareRatio: '60/40',
          timestamp: now,
        };

        newCoalitions.push(coalition);
        p1.score = jointScore;
        p1.reason = `SUPER-PROPOSAL [${emergentType} COALITION: ${p1.agentId.toUpperCase()} + ${p2.agentId.toUpperCase()}]: ${coalition.action}`;

        logs.push({
          id: `neg-step4-${now}-${Math.random().toString(36).substring(2, 7)}`,
          type: 'COALITION_FORMED',
          initiatorAgent: p1.agentId,
          targetAgent: p2.agentId,
          slug: p1.slug,
          detail: `[STEP 4 COALITION] Emergent ${emergentType} Super-Proposal Formed: ${p1.agentId.toUpperCase()} & ${p2.agentId.toUpperCase()} united on ${p1.slug} (Joint Score: ${jointScore}).`,
          scoreAdjustment: 0.25,
          timestamp: now,
        });
        break;
      }
    }
  }

  negotiationState.activeCoalitions = [
    ...newCoalitions,
    ...negotiationState.activeCoalitions,
  ].slice(0, 20);
  negotiationState.negotiationLogs = [
    ...logs,
    ...negotiationState.negotiationLogs,
  ].slice(0, 60);

  return {
    negotiatedProposals,
    activeCoalitions: negotiationState.activeCoalitions,
    negotiationLogs: negotiationState.negotiationLogs,
  };
}
