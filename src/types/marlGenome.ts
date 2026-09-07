export type AgentId =
  | 'planner'
  | 'writer'
  | 'link_builder'
  | 'auditor'
  | 'negotiator';

export interface PersonalityGenome {
  agentId: AgentId;
  aggression: number;
  caution: number;
  collaboration: number;
  curiosity: number;
  patience: number;
  riskTolerance: number;
  rewriteBias: number;
  linkbaitBias: number;
  expansionBias: number;
  publishBias: number;
  generation: number;
  lastEvolvedAt: number;
  stabilizationStatus?: string;
  cooldownUntil?: number;
}

export type TraitName = keyof Omit<
  PersonalityGenome,
  | 'agentId'
  | 'generation'
  | 'lastEvolvedAt'
  | 'stabilizationStatus'
  | 'cooldownUntil'
>;

export interface EmergentIdentity {
  title: string;
  badge: string;
  dominantTraits: string[];
}
