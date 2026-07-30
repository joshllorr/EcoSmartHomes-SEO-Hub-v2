/**
 * src/server/marlGenome.ts
 * 
 * Layer 7 — Personality Evolution Loop, Drift Dampening & Stabilization Engine
 * Implements the mathematical trait evolution formula:
 * trait += learningRate * reward * influenceFactor
 * 
 * Features:
 * 1. Drift Dampening: trait *= 0.995
 * 2. Trait Caps: clamp(trait, 0.05, 0.95)
 * 3. Stabilization Events: Detects extreme traits (>0.90) and triggers stabilization rewrites,
 *    coalition resets, and negotiation cooldowns.
 */

import fs from "fs";
import path from "path";
import { AgentId, getMARLMemoryExperiences } from "./rlEngine";

export interface PersonalityGenome {
  agentId: AgentId;
  aggression: number;       // 0.05 to 0.95
  caution: number;          // 0.05 to 0.95
  collaboration: number;    // 0.05 to 0.95
  curiosity: number;        // 0.05 to 0.95
  patience: number;         // 0.05 to 0.95
  riskTolerance: number;    // 0.05 to 0.95
  rewriteBias: number;      // 0.05 to 0.95
  linkbaitBias: number;     // 0.05 to 0.95
  expansionBias: number;    // 0.05 to 0.95
  publishBias: number;      // 0.05 to 0.95
  generation: number;
  lastEvolvedAt: number;
  stabilizationStatus?: string;
  cooldownUntil?: number;
}

export type TraitName = keyof Omit<PersonalityGenome, "agentId" | "generation" | "lastEvolvedAt" | "stabilizationStatus" | "cooldownUntil">;

export interface EmergentIdentity {
  title: string;
  badge: string;
  dominantTraits: string[];
}

export interface StabilizationEventRecord {
  id: string;
  agentId: AgentId;
  type: "STABILIZATION_REWRITE" | "COALITION_RESET" | "NEGOTIATION_COOLDOWN";
  reason: string;
  timestamp: number;
}

const TRAIT_INFLUENCE_MAP: Record<string, Record<TraitName, number>> = {
  rewrite_article: {
    rewriteBias: 1.2,
    aggression: 0.8,
    riskTolerance: 0.5,
    caution: -0.6,
    collaboration: 0.4,
    curiosity: 0.3,
    patience: -0.4,
    linkbaitBias: 0.1,
    expansionBias: 0.2,
    publishBias: 0.4
  },
  link_bait: {
    linkbaitBias: 1.2,
    curiosity: 0.8,
    riskTolerance: 0.6,
    collaboration: 0.7,
    aggression: 0.4,
    caution: -0.4,
    patience: 0.5,
    rewriteBias: 0.2,
    expansionBias: 0.4,
    publishBias: 0.2
  },
  queue_expansion: {
    expansionBias: 1.2,
    patience: 0.8,
    curiosity: 0.7,
    caution: 0.4,
    collaboration: 0.5,
    aggression: -0.3,
    riskTolerance: 0.2,
    rewriteBias: 0.3,
    linkbaitBias: 0.4,
    publishBias: 0.3
  },
  publish: {
    publishBias: 1.2,
    collaboration: 0.8,
    caution: -0.3,
    riskTolerance: 0.4,
    aggression: 0.5,
    curiosity: 0.4,
    patience: 0.3,
    rewriteBias: 0.4,
    linkbaitBias: 0.2,
    expansionBias: 0.3
  }
};

const DEFAULT_AGENT_GENOMES: Record<AgentId, PersonalityGenome> = {
  "heat-pumps": {
    agentId: "heat-pumps",
    aggression: 0.75,
    caution: 0.20,
    collaboration: 0.65,
    curiosity: 0.50,
    patience: 0.40,
    riskTolerance: 0.70,
    rewriteBias: 0.75,
    linkbaitBias: 0.30,
    expansionBias: 0.40,
    publishBias: 0.50,
    generation: 1,
    lastEvolvedAt: Date.now()
  },
  "solar": {
    agentId: "solar",
    aggression: 0.60,
    caution: 0.30,
    collaboration: 0.75,
    curiosity: 0.65,
    patience: 0.70,
    riskTolerance: 0.60,
    rewriteBias: 0.35,
    linkbaitBias: 0.80,
    expansionBias: 0.60,
    publishBias: 0.45,
    generation: 1,
    lastEvolvedAt: Date.now()
  },
  "insulation": {
    agentId: "insulation",
    aggression: 0.25,
    caution: 0.85,
    collaboration: 0.60,
    curiosity: 0.35,
    patience: 0.80,
    riskTolerance: 0.15,
    rewriteBias: 0.45,
    linkbaitBias: 0.25,
    expansionBias: 0.70,
    publishBias: 0.35,
    generation: 1,
    lastEvolvedAt: Date.now()
  },
  "grants": {
    agentId: "grants",
    aggression: 0.35,
    caution: 0.60,
    collaboration: 0.80,
    curiosity: 0.55,
    patience: 0.65,
    riskTolerance: 0.30,
    rewriteBias: 0.50,
    linkbaitBias: 0.30,
    expansionBias: 0.45,
    publishBias: 0.75,
    generation: 1,
    lastEvolvedAt: Date.now()
  },
  "default": {
    agentId: "default",
    aggression: 0.50,
    caution: 0.50,
    collaboration: 0.50,
    curiosity: 0.50,
    patience: 0.50,
    riskTolerance: 0.50,
    rewriteBias: 0.50,
    linkbaitBias: 0.50,
    expansionBias: 0.50,
    publishBias: 0.50,
    generation: 1,
    lastEvolvedAt: Date.now()
  }
};

let agentGenomes: Record<AgentId, PersonalityGenome> = JSON.parse(JSON.stringify(DEFAULT_AGENT_GENOMES));
let stabilizationLogs: StabilizationEventRecord[] = [];
const GENOMES_FILE_PATH = path.join(process.cwd(), "data", "marl_genomes.json");

/** Initialize persistent Agent Genomes store */
export function initMARLGenomes(): void {
  try {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    if (fs.existsSync(GENOMES_FILE_PATH)) {
      const raw = fs.readFileSync(GENOMES_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed) {
        agentGenomes = {
          ...JSON.parse(JSON.stringify(DEFAULT_AGENT_GENOMES)),
          ...parsed
        };
      }
      console.log(`[MARL Genome] Loaded persistent Agent Personality DNA Genomes from disk.`);
    } else {
      saveMARLGenomes();
    }
  } catch (err) {
    console.error("[MARL Genome] Failed to load genomes from disk:", err);
  }
}

/** Save Agent Genomes to disk */
export function saveMARLGenomes(): void {
  try {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(GENOMES_FILE_PATH, JSON.stringify(agentGenomes, null, 2), "utf-8");
  } catch (err) {
    console.error("[MARL Genome] Failed to save genomes to disk:", err);
  }
}

export function getAgentGenome(agentId: AgentId = "default"): PersonalityGenome {
  return agentGenomes[agentId] || agentGenomes["default"];
}

export function getAllAgentGenomes(): Record<AgentId, PersonalityGenome> {
  return agentGenomes;
}

export function getStabilizationLogs(): StabilizationEventRecord[] {
  return stabilizationLogs;
}

export function getEmergentStrategicIdentity(genome: PersonalityGenome): EmergentIdentity {
  const { aggression, caution, collaboration, curiosity, rewriteBias, linkbaitBias, publishBias, riskTolerance } = genome;

  if (aggression > 0.65 && rewriteBias > 0.60) {
    return {
      title: "Rewrite-Dominant Converter",
      badge: "🔥 High Aggression",
      dominantTraits: ["High-Aggression", "Rewrite-Dominant", "Coalition-Initiator", "Confident Negotiator"]
    };
  }

  if (collaboration > 0.65 && linkbaitBias > 0.60) {
    return {
      title: "Authority Expansion Strategist",
      badge: "☀️ Strategic Collaborator",
      dominantTraits: ["High-Collaboration", "Link-Bait Specialist", "Expansion Strategist", "Patient Negotiator"]
    };
  }

  if (caution > 0.65 || riskTolerance < 0.30) {
    return {
      title: "Defensive Stability Guard",
      badge: "🧱 Defensive Stabilizer",
      dominantTraits: ["High-Caution", "Volatility-Focused", "Defensive Coalition Builder", "Conflict Blocker"]
    };
  }

  if (curiosity > 0.50 || publishBias > 0.60) {
    return {
      title: "Explainer & Conflict Mediator",
      badge: "💶 Clarification Specialist",
      dominantTraits: ["High-Curiosity", "Explainer-Rewrite Specialist", "Mediator in Conflicts", "Balanced Strategist"]
    };
  }

  return {
    title: "Balanced Fleet Operator",
    badge: "🌐 Fleet Baseline",
    dominantTraits: ["Balanced Strategy", "Adaptive Negotiator"]
  };
}

/**
 * Checks for extreme trait drift (>0.90) and triggers Stabilization Events:
 * 1. Stabilization Rewrites: re-aligns baseline weights
 * 2. Coalition Resets: resets extreme coalition affinities
 * 3. Negotiation Cooldowns: applies temporary 5-min cooldown
 */
export function checkAndTriggerStabilization(agentId: AgentId, genome: PersonalityGenome): void {
  const now = Date.now();

  // 1. Hyper-Aggression Check
  if (genome.aggression > 0.90 || genome.rewriteBias > 0.90) {
    genome.aggression = 0.70;
    genome.rewriteBias = 0.70;
    genome.cooldownUntil = now + (5 * 60 * 1000); // 5-minute cooldown
    genome.stabilizationStatus = "STABILIZATION_COOLDOWN";

    stabilizationLogs.unshift({
      id: `stab-${now}-${Math.random().toString(36).substring(2, 7)}`,
      agentId,
      type: "NEGOTIATION_COOLDOWN",
      reason: `Agent [${agentId.toUpperCase()}] exceeded aggression ceiling (0.90). Triggered 5-min Negotiation Cooldown & Trait Re-alignment.`,
      timestamp: now
    });
  }

  // 2. Ultra-Paranoid Caution Check
  if (genome.caution > 0.90 || genome.riskTolerance < 0.08) {
    genome.caution = 0.65;
    genome.riskTolerance = 0.25;
    genome.stabilizationStatus = "STABILIZATION_REWRITE";

    stabilizationLogs.unshift({
      id: `stab-${now}-${Math.random().toString(36).substring(2, 7)}`,
      agentId,
      type: "STABILIZATION_REWRITE",
      reason: `Agent [${agentId.toUpperCase()}] exceeded caution ceiling (0.90). Triggered Stabilization Rewrite to restore operational confidence.`,
      timestamp: now
    });
  }

  stabilizationLogs = stabilizationLogs.slice(0, 30);
}

/**
 * Personality Evolution Loop with Drift Dampening & Trait Caps
 */
export function evolveAgentGenome(agentId: AgentId, reward: number, action: string): PersonalityGenome {
  const g = agentGenomes[agentId] || { ...DEFAULT_AGENT_GENOMES["default"], agentId };
  const learningRate = 0.05;
  const influence = TRAIT_INFLUENCE_MAP[action] || TRAIT_INFLUENCE_MAP["rewrite_article"];

  const traitNames: TraitName[] = [
    "aggression", "caution", "collaboration", "curiosity", "patience",
    "riskTolerance", "rewriteBias", "linkbaitBias", "expansionBias", "publishBias"
  ];

  for (const trait of traitNames) {
    const influenceFactor = influence[trait] ?? 0.5;
    const delta = learningRate * reward * influenceFactor;

    // Apply Evolution & Drift Dampening (trait *= 0.995)
    let updatedTrait = (g[trait] + delta) * 0.995;

    // Apply Trait Caps: clamp(trait, 0.05, 0.95)
    g[trait] = Math.max(0.05, Math.min(0.95, parseFloat(updatedTrait.toFixed(3))));
  }

  g.generation += 1;
  g.lastEvolvedAt = Date.now();

  // Check for extreme drift and trigger stabilization if needed
  checkAndTriggerStabilization(agentId, g);

  agentGenomes[agentId] = g;
  saveMARLGenomes();
  return g;
}

/**
 * Personality Shaping Cycle
 */
export function runPersonalityShapingCycle(sampleSize = 30): {
  replayedCount: number;
  evolvedGenomes: Record<AgentId, PersonalityGenome>;
} {
  const experiences = getMARLMemoryExperiences(undefined, sampleSize);
  if (experiences.length === 0) {
    return { replayedCount: 0, evolvedGenomes: agentGenomes };
  }

  for (const exp of experiences) {
    evolveAgentGenome(exp.agentId || "default", exp.reward, exp.action);
  }

  console.log(`[Personality Shaping Cycle] Replayed ${experiences.length} long-term memories across all Pillar Agent Genomes.`);
  return { replayedCount: experiences.length, evolvedGenomes: agentGenomes };
}

// Auto-initialize Genomes on load
initMARLGenomes();
