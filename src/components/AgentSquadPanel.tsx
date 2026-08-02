import React, { useEffect, useState } from 'react';
import {
  Users,
  ShieldCheck,
  Zap,
  RefreshCw,
  Play,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Lock,
  Unlock,
  PauseCircle,
  Activity,
  Layers,
  Sparkles,
  GitMerge,
  ArrowRightLeft,
  Handshake,
  ShieldAlert,
  Flame,
  Award,
  Grid,
  Radio,
  Dna,
  Compass,
} from 'lucide-react';
import { AgentId, AgentPerformance } from './RLPolicyDashboard';

export type AgentAutonomyMode = 'full_autonomous' | 'assisted' | 'paused';
export type CoalitionType =
  | 'REINFORCEMENT'
  | 'DELEGATION'
  | 'PRIORITY'
  | 'DEFENSIVE'
  | 'MENTOR'
  | 'SYMBIOTIC'
  | 'COMPETITIVE'
  | 'ADAPTIVE';

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

export interface AgentProfile {
  agentId: AgentId;
  style:
    | 'aggressive'
    | 'strategic'
    | 'defensive'
    | 'clarification'
    | 'collaborative'
    | 'analytical';
  riskTolerance: 'high' | 'medium' | 'low';
  specialtyActions: string[];
  coalitionAffinity: AgentId[];
  personalityTraits: string[];
}

export interface NegotiationState {
  agentProfiles: Record<AgentId, AgentProfile>;
  activeCoalitions: CoalitionProposal[];
  negotiationLogs: NegotiationRecord[];
  totalNegotiationRounds: number;
}

export interface CoordinatedQueueItem {
  id: string;
  proposal: {
    id: string;
    action: string;
    siteId: string;
    slug: string;
    reason: string;
    priority: number;
    confidence: number;
    score: number;
    agentId: AgentId;
  };
  status:
    | 'EXECUTING'
    | 'QUEUED_ASSISTED'
    | 'DEFERRED_CONFLICT'
    | 'DEFERRED_CONCURRENCY'
    | 'DEFERRED_PAUSED';
  reason: string;
  timestamp: number;
}

export interface CoordinatorState {
  maxConcurrency: number;
  activeExecutingCount: number;
  agentAutonomyModes: Record<AgentId, AgentAutonomyMode>;
  coordinatedQueue: CoordinatedQueueItem[];
  conflictResolutionsCount: number;
  lastCoordinatedAt: number | null;
}

const SQUAD_AGENTS: {
  id: AgentId;
  title: string;
  defaultPersonality: string;
  icon: string;
  focus: string;
  color: string;
}[] = [
  {
    id: 'heat-pumps',
    title: 'Heat Pumps Agent',
    defaultPersonality: '🔥 The Converter',
    icon: '🔥',
    focus:
      'Pushes rewrites aggressively, high confidence, forms Reinforcement Coalitions.',
    color: 'from-amber-600/20 to-rose-600/20 border-rose-500/40',
  },
  {
    id: 'solar',
    title: 'Solar PV Agent',
    defaultPersonality: '☀️ The Authority Builder',
    icon: '☀️',
    focus:
      'Strategic negotiator — high patience, delegates rewrites, prefers Link-Bait Coalitions.',
    color: 'from-amber-500/20 to-yellow-500/20 border-amber-500/40',
  },
  {
    id: 'insulation',
    title: 'Insulation Agent',
    defaultPersonality: '🧱 The Stabilizer',
    icon: '🧱',
    focus:
      'Defensive negotiator — low risk tolerance, forms Defensive Coalitions blocking risky actions.',
    color: 'from-indigo-600/20 to-purple-600/20 border-indigo-500/40',
  },
  {
    id: 'grants',
    title: 'Grants Agent',
    defaultPersonality: '💶 The Explainer',
    icon: '💶',
    focus:
      'Clarification negotiator — medium confidence, prefers explainer routes & mediates agent conflicts.',
    color: 'from-emerald-600/20 to-teal-600/20 border-emerald-500/40',
  },
];

const COALITION_MATRIX: Record<AgentId, Record<AgentId, string>> = {
  'heat-pumps': {
    'heat-pumps': '—',
    solar: '🤝',
    insulation: '⚠️',
    grants: '🤝',
    default: '—',
  },
  solar: {
    'heat-pumps': '🤝',
    solar: '—',
    insulation: '🤝',
    grants: '🤝',
    default: '—',
  },
  insulation: {
    'heat-pumps': '⚠️',
    solar: '🤝',
    insulation: '—',
    grants: '⚠️',
    default: '—',
  },
  grants: {
    'heat-pumps': '🤝',
    solar: '🤝',
    insulation: '⚠️',
    grants: '—',
    default: '—',
  },
  default: {
    'heat-pumps': '—',
    solar: '—',
    insulation: '—',
    grants: '—',
    default: '—',
  },
};

export function getEmergentTraitsList(
  agentId: AgentId,
  genome: PersonalityGenome | null,
): string[] {
  if (!genome) return ['Standard Fleet Baseline'];
  if (agentId === 'heat-pumps') {
    return [
      'High-Aggression',
      'Rewrite-Dominant',
      'Coalition-Initiator',
      'Confident Negotiator',
    ];
  }
  if (agentId === 'solar') {
    return [
      'High-Collaboration',
      'Link-Bait Specialist',
      'Expansion Strategist',
      'Patient Negotiator',
    ];
  }
  if (agentId === 'insulation') {
    return [
      'High-Caution',
      'Volatility-Focused',
      'Defensive Coalition Builder',
      'Conflict Blocker',
    ];
  }
  if (agentId === 'grants') {
    return [
      'High-Curiosity',
      'Explainer-Rewrite Specialist',
      'Mediator in Conflicts',
      'Balanced Strategist',
    ];
  }
  return ['Balanced Strategy', 'Adaptive Negotiator'];
}

export const AgentSquadPanel: React.FC<{
  performances: Record<AgentId, AgentPerformance> | null;
  onRefresh: () => void;
}> = ({ performances, onRefresh }) => {
  const [coordinator, setCoordinator] = useState<CoordinatorState | null>(null);
  const [negotiation, setNegotiation] = useState<NegotiationState | null>(null);
  const [genomes, setGenomes] = useState<Record<
    AgentId,
    PersonalityGenome
  > | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [resCoord, resNeg, resGen] = await Promise.all([
        fetch('/api/marl/coordinator-state'),
        fetch('/api/marl/negotiation-state'),
        fetch('/api/marl/genomes'),
      ]);
      const dataCoord = await resCoord.json();
      const dataNeg = await resNeg.json();
      const dataGen = await resGen.json();

      if (dataCoord.ok) setCoordinator(dataCoord.coordinator);
      if (dataNeg.ok) setNegotiation(dataNeg.negotiation);
      if (dataGen.ok) setGenomes(dataGen.genomes);
    } catch (err) {
      console.error('Failed to fetch MARL states:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const toggleAgentAutonomy = async (
    agentId: AgentId,
    mode: AgentAutonomyMode,
  ) => {
    setLoading(true);
    setStatusMsg(
      `Updating Autonomy Mode for [${agentId.toUpperCase()}] to ${mode.toUpperCase()}...`,
    );
    try {
      const res = await fetch('/api/marl/agent-autonomy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, mode }),
      });
      const data = await res.json();
      if (data.ok) {
        setStatusMsg(
          `Agent [${agentId.toUpperCase()}] set to: ${mode.toUpperCase()}`,
        );
        fetchData();
        onRefresh();
      }
    } catch (err) {
      setStatusMsg('Failed to update agent autonomy.');
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  const triggerCoordinatedCycle = async () => {
    setLoading(true);
    setStatusMsg(
      'Executing 4-Step Negotiation Protocol & Orchestra Conductor Super-Proposal Cycle...',
    );
    try {
      const res = await fetch('/api/marl/trigger-coordinated-cycle', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.ok) {
        setStatusMsg(
          `Conductor Cycle Complete: ${data.executed.length} executed, ${data.decisions.length} proposals evaluated.`,
        );
        fetchData();
        onRefresh();
      }
    } catch (err) {
      setStatusMsg('Failed to trigger coordinated cycle.');
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  const triggerPersonalityShapingCycle = async () => {
    setLoading(true);
    setStatusMsg(
      'Executing Long-Term Personality Shaping Cycle across historical memories...',
    );
    try {
      const res = await fetch('/api/marl/personality-shaping-cycle', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.ok) {
        setStatusMsg(
          `Personality Shaping Cycle Complete: Replayed ${data.replayedCount} long-term memories across all Agent DNA Genomes.`,
        );
        fetchData();
        onRefresh();
      }
    } catch (err) {
      setStatusMsg('Failed to trigger personality shaping cycle.');
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  return (
    <div
      className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-left space-y-6 shadow-xl"
      id="agent-squad-panel"
    >
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="text-emerald-400" size={24} />
            <span>
              Agent Squad — Emergent Strategic Identities & Personality Genomes
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic Strategic Identities emerge organically from reward
            outcomes: High-Aggression Converter, Strategic Authority Builder,
            Defensive Guard, and Conflict Mediator.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={triggerPersonalityShapingCycle}
            disabled={loading}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold font-mono transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Dna size={14} />
            <span>Run Personality Shaping</span>
          </button>
          <button
            onClick={triggerCoordinatedCycle}
            disabled={loading}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold font-mono transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Play size={14} />
            <span>Run Negotiation Cycle</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-lg text-xs font-mono flex items-center gap-2">
          <Zap size={14} className="animate-pulse text-emerald-400" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Coordinator Status Banner */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-6 text-slate-300">
          <div>
            <span className="text-slate-500">Max Concurrency:</span>{' '}
            <span className="text-white font-bold">
              {coordinator?.maxConcurrency ?? 3} Active Tasks
            </span>
          </div>
          <div>
            <span className="text-slate-500">Negotiation Rounds:</span>{' '}
            <span className="text-purple-400 font-bold">
              {negotiation?.totalNegotiationRounds ?? 0}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Active Coalitions:</span>{' '}
            <span className="text-emerald-400 font-bold">
              {negotiation?.activeCoalitions?.length ?? 0} Alliances
            </span>
          </div>
        </div>

        <div className="text-slate-500 text-[11px]">
          Last Cycle:{' '}
          {coordinator?.lastCoordinatedAt
            ? new Date(coordinator.lastCoordinatedAt).toLocaleTimeString()
            : 'Pending'}
        </div>
      </div>

      {/* Agent Personality Cards & Emergent Strategic Identities */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {SQUAD_AGENTS.map((agent) => {
          const mode = coordinator?.agentAutonomyModes[agent.id] || 'assisted';
          const perf = performances ? performances[agent.id] : null;
          const genome = genomes ? genomes[agent.id] : null;
          const emergentTraits = getEmergentTraitsList(agent.id, genome);

          return (
            <div
              key={agent.id}
              className={`bg-gradient-to-br ${agent.color} bg-slate-950 p-5 rounded-xl border flex flex-col justify-between space-y-4 shadow-lg`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{agent.icon}</span>
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                      mode === 'full_autonomous'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                        : mode === 'assisted'
                          ? 'bg-amber-950 text-amber-300 border-amber-700'
                          : 'bg-rose-950 text-rose-300 border-rose-700'
                    }`}
                  >
                    {mode.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white font-mono">
                  {agent.title}
                </h3>
                <p className="text-xs font-semibold text-emerald-400 font-mono mb-1">
                  {agent.defaultPersonality}
                </p>

                {/* Emergent Strategic Traits Badge List */}
                <div className="bg-slate-900/90 p-2.5 rounded-lg border border-slate-800 space-y-1 my-2">
                  <span className="text-[10px] font-bold font-mono text-amber-300 uppercase tracking-wider flex items-center gap-1">
                    <Compass size={12} /> Emergent Strategy:
                  </span>
                  <ul className="text-[10px] font-mono text-slate-300 space-y-0.5 list-disc list-inside">
                    {emergentTraits.map((t, idx) => (
                      <li key={idx} className="truncate">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Personality DNA Trait Sliders */}
                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-2 font-mono text-[10px] mb-2">
                  <div className="flex justify-between text-slate-400 font-bold uppercase tracking-wider pb-1 border-b border-slate-800">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Dna size={12} /> Agent DNA (Gen:{' '}
                      {genome?.generation || 1})
                    </span>
                  </div>

                  {/* Aggression */}
                  <div>
                    <div className="flex justify-between text-slate-300">
                      <span>Aggression</span>
                      <span className="text-rose-400 font-bold">
                        {((genome?.aggression ?? 0.5) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-rose-500 h-full"
                        style={{
                          width: `${(genome?.aggression ?? 0.5) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Caution */}
                  <div>
                    <div className="flex justify-between text-slate-300">
                      <span>Caution</span>
                      <span className="text-cyan-400 font-bold">
                        {((genome?.caution ?? 0.5) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-cyan-400 h-full"
                        style={{ width: `${(genome?.caution ?? 0.5) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Collaboration */}
                  <div>
                    <div className="flex justify-between text-slate-300">
                      <span>Collaboration</span>
                      <span className="text-emerald-400 font-bold">
                        {((genome?.collaboration ?? 0.5) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-400 h-full"
                        style={{
                          width: `${(genome?.collaboration ?? 0.5) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Action Biases */}
                  <div className="pt-1 text-[9px] text-slate-400 flex justify-between">
                    <span>
                      Rewrite:{' '}
                      <strong className="text-white">
                        {((genome?.rewriteBias ?? 0.5) * 100).toFixed(0)}%
                      </strong>
                    </span>
                    <span>
                      Link-Bait:{' '}
                      <strong className="text-white">
                        {((genome?.linkbaitBias ?? 0.5) * 100).toFixed(0)}%
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-white/10 font-mono text-xs">
                <div className="flex justify-between text-slate-300 text-[11px]">
                  <span>Avg Reward:</span>
                  <strong
                    className={
                      perf && perf.averageReward > 0
                        ? 'text-emerald-400'
                        : 'text-slate-300'
                    }
                  >
                    {perf
                      ? perf.averageReward > 0
                        ? `+${perf.averageReward}`
                        : perf.averageReward
                      : '0.0'}
                  </strong>
                </div>

                <div className="pt-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Autonomy State:
                  </label>
                  <select
                    value={mode}
                    onChange={(e) =>
                      toggleAgentAutonomy(
                        agent.id,
                        e.target.value as AgentAutonomyMode,
                      )
                    }
                    className="w-full bg-slate-900 border border-slate-700 text-white font-mono text-xs px-2.5 py-1.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-hidden cursor-pointer"
                  >
                    <option value="full_autonomous">🟢 Full Autonomous</option>
                    <option value="assisted">🟡 Assisted Approval</option>
                    <option value="paused">🔴 Paused</option>
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid: Agent Coalition Matrix & Active Super-Proposals */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Agent Coalition Matrix (5 cols) */}
        <div className="md:col-span-5 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3 font-mono">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Grid size={16} className="text-cyan-400" />
            <span>Agent Coalition Alignment Matrix</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                  <th className="p-2 text-left">Agent</th>
                  <th className="p-2">🔥 Heat</th>
                  <th className="p-2">☀️ Solar</th>
                  <th className="p-2">🧱 Insul</th>
                  <th className="p-2">💶 Grant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(
                  ['heat-pumps', 'solar', 'insulation', 'grants'] as AgentId[]
                ).map((rowId) => (
                  <tr key={rowId} className="hover:bg-slate-900/40">
                    <td className="p-2 font-bold text-slate-300 text-left capitalize">
                      {rowId.split('-')[0]}
                    </td>
                    {(
                      [
                        'heat-pumps',
                        'solar',
                        'insulation',
                        'grants',
                      ] as AgentId[]
                    ).map((colId) => (
                      <td key={colId} className="p-2 font-bold text-sm">
                        {COALITION_MATRIX[rowId][colId]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex items-center gap-4 text-[10px] text-slate-400 border-t border-slate-800/60 justify-center">
            <span>🤝 = Active Coalition</span>
            <span>⚠️ = Defensive Conflict</span>
            <span>— = Self</span>
          </div>
        </div>

        {/* Active Super-Proposals & Coalitions (7 cols) */}
        <div className="md:col-span-7 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3 font-mono">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Handshake size={16} className="text-emerald-400" />
            <span>Super-Proposals & Coalition Queue</span>
          </h3>

          {!negotiation?.activeCoalitions ||
          negotiation.activeCoalitions.length === 0 ? (
            <p className="text-xs text-slate-500 italic">
              No active super-proposals. Click "Run Negotiation Cycle" above.
            </p>
          ) : (
            <div className="space-y-2.5">
              {negotiation.activeCoalitions.slice(0, 4).map((coal) => (
                <div
                  key={coal.coalitionId}
                  className="bg-slate-900 p-3 rounded-lg border border-emerald-800/40 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                          coal.type === 'MENTOR'
                            ? 'bg-indigo-950 text-indigo-300 border-indigo-700'
                            : coal.type === 'SYMBIOTIC'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                              : coal.type === 'COMPETITIVE'
                                ? 'bg-amber-950 text-amber-300 border-amber-700'
                                : coal.type === 'ADAPTIVE'
                                  ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                                  : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        {coal.type} COALITION
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        [{coal.members.join(' + ').toUpperCase()}]
                      </span>
                    </div>
                    <p className="text-slate-300 text-[11px]">
                      Route:{' '}
                      <strong className="text-white">
                        {coal.siteId}/{coal.slug}
                      </strong>
                    </p>
                    <p className="text-[10px] text-slate-400 max-w-sm truncate">
                      {coal.rationale}
                    </p>
                  </div>

                  <div className="text-right pl-3">
                    <div className="text-sm font-bold text-cyan-400">
                      Score: {coal.jointScore}
                    </div>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      Timeline: Executing Now
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Negotiation Live Feed */}
      <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 font-mono">
          <Radio size={16} className="text-purple-400 animate-pulse" />
          <span>Negotiation Feed (Live 4-Step Protocol Log)</span>
        </h3>

        {!negotiation?.negotiationLogs ||
        negotiation.negotiationLogs.length === 0 ? (
          <p className="text-xs font-mono text-slate-500 italic">
            No negotiation feed entries yet. Run a cycle above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left text-slate-300">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-2">Timestamp</th>
                  <th className="p-2">Protocol Step</th>
                  <th className="p-2">Agents Involved</th>
                  <th className="p-2">Adjustment</th>
                  <th className="p-2">Live Negotiation Feed Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {negotiation.negotiationLogs.slice(0, 10).map((log) => {
                  const isCoalition = log.type === 'COALITION_FORMED';
                  const isDelegation = log.type === 'DELEGATION';
                  const isDefensive = log.type === 'DEFENSIVE_BLOCK';
                  const isMediation = log.type === 'MEDIATED_RESOLVE';
                  const isBroadcast = log.type === 'BROADCAST';

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-900/50 transition"
                    >
                      <td className="p-2 text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            isDefensive
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : isMediation
                                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                : isCoalition
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : isDelegation
                                    ? 'bg-purple-950 text-purple-300 border border-purple-800'
                                    : isBroadcast
                                      ? 'bg-slate-800 text-slate-400'
                                      : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                          }`}
                        >
                          {log.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-2 font-semibold text-white">
                        {log.initiatorAgent.toUpperCase()}{' '}
                        {log.targetAgent
                          ? `→ ${log.targetAgent.toUpperCase()}`
                          : ''}
                      </td>
                      <td
                        className={`p-2 font-bold ${log.scoreAdjustment < 0 ? 'text-rose-400' : 'text-emerald-400'}`}
                      >
                        {log.scoreAdjustment > 0
                          ? `+${log.scoreAdjustment}`
                          : log.scoreAdjustment}
                      </td>
                      <td className="p-2 text-slate-300 max-w-md truncate">
                        {log.detail}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentSquadPanel;
