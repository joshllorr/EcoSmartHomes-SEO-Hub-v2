import React, { useEffect, useState } from 'react';
import {
  Dna,
  TrendingUp,
  Compass,
  Activity,
  History,
  ShieldCheck,
  Award,
  Grid,
  Zap,
  RefreshCw,
  Layers,
  Sparkles,
  Flame,
  Sun,
  Shield,
  Euro,
} from 'lucide-react';
import { AgentId, AgentPerformance } from './RLPolicyDashboard';
import { PersonalityGenome, EmergentIdentity } from '../server/marlGenome';

export interface AgentProfile {
  agentId: AgentId;
  style: string;
  riskTolerance: string;
  specialtyActions: string[];
  coalitionAffinity: AgentId[];
  personalityTraits: string[];
}

export interface NegotiationState {
  agentProfiles: Record<AgentId, AgentProfile>;
  activeCoalitions: any[];
  negotiationLogs: any[];
  totalNegotiationRounds: number;
}

export function getEmergentStrategyLabel(
  agentId: AgentId,
  genome: PersonalityGenome | null,
): {
  label: string;
  badgeColor: string;
  icon: string;
} {
  if (!genome) {
    return {
      label: 'Fleet Baseline',
      badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
      icon: '🌐',
    };
  }

  const {
    aggression,
    caution,
    collaboration,
    curiosity,
    rewriteBias,
    linkbaitBias,
    publishBias,
  } = genome;

  if (agentId === 'heat-pumps' || (aggression > 0.65 && rewriteBias > 0.6)) {
    return {
      label: 'Aggressive Rewrite Strategist',
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-700',
      icon: '🔥',
    };
  }

  if (agentId === 'solar' || (collaboration > 0.65 && linkbaitBias > 0.6)) {
    return {
      label: 'Collaborative Link-Bait Builder',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-700',
      icon: '☀️',
    };
  }

  if (agentId === 'insulation' || caution > 0.65) {
    return {
      label: 'Defensive SERP Guardian',
      badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-700',
      icon: '🧱',
    };
  }

  if (agentId === 'grants' || curiosity > 0.5 || publishBias > 0.6) {
    return {
      label: 'Curiosity-Driven Explainer Optimizer',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-700',
      icon: '💶',
    };
  }

  return {
    label: 'Balanced Fleet Strategist',
    badgeColor: 'bg-cyan-950 text-cyan-300 border-cyan-700',
    icon: '⚡',
  };
}

export const AgentEvolutionDashboard: React.FC<{
  performances: Record<AgentId, AgentPerformance> | null;
  onRefresh: () => void;
}> = ({ performances, onRefresh }) => {
  const [genomes, setGenomes] = useState<Record<
    AgentId,
    PersonalityGenome
  > | null>(null);
  const [negotiation, setNegotiation] = useState<NegotiationState | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentId>('heat-pumps');

  const fetchData = async () => {
    try {
      const [resGen, resNeg] = await Promise.all([
        fetch('/api/marl/genomes'),
        fetch('/api/marl/negotiation-state'),
      ]);
      const dataGen = await resGen.json();
      const dataNeg = await resNeg.json();

      if (dataGen.ok) setGenomes(dataGen.genomes);
      if (dataNeg.ok) setNegotiation(dataNeg.negotiation);
    } catch (err) {
      console.error('Failed to fetch evolution states:', err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const currentGenome = genomes ? genomes[selectedAgent] : null;
  const currentLabel = getEmergentStrategyLabel(selectedAgent, currentGenome);
  const currentPerf = performances ? performances[selectedAgent] : null;

  return (
    <div
      className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-left space-y-6 shadow-xl"
      id="agent-evolution-dashboard"
    >
      {/* Dashboard Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Dna className="text-indigo-400" size={24} />
            <span>Agent Evolution Dashboard & Personality Trajectory</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time Emergent Strategy Labels, DNA Trait Drift, Reward
            Histories, and Trajectory Timelines across all 4 Pillar Agents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['heat-pumps', 'solar', 'insulation', 'grants'] as AgentId[]).map(
            (agentId) => (
              <button
                key={agentId}
                onClick={() => setSelectedAgent(agentId)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  selectedAgent === agentId
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                <span>
                  {agentId === 'heat-pumps'
                    ? '🔥 Heat'
                    : agentId === 'solar'
                      ? '☀️ Solar'
                      : agentId === 'insulation'
                        ? '🧱 Insul'
                        : '💶 Grant'}
                </span>
              </button>
            ),
          )}
        </div>
      </div>

      {/* Selected Agent Header & Emergent Strategy Label */}
      <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-3xl">{currentLabel.icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white font-mono capitalize">
                {selectedAgent.replace('-', ' ')} Agent
              </h3>
              <span
                className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${currentLabel.badgeColor}`}
              >
                {currentLabel.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Generation:{' '}
              <strong className="text-white">
                {currentGenome?.generation ?? 1}
              </strong>{' '}
              • Last Evolved:{' '}
              {currentGenome?.lastEvolvedAt
                ? new Date(currentGenome.lastEvolvedAt).toLocaleTimeString()
                : 'Pending'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 font-mono text-xs">
          <div>
            <span className="text-slate-500 block">Avg RL Reward:</span>
            <span
              className={`text-sm font-bold ${currentPerf && currentPerf.averageReward > 0 ? 'text-emerald-400' : 'text-slate-300'}`}
            >
              {currentPerf
                ? currentPerf.averageReward > 0
                  ? `+${currentPerf.averageReward}`
                  : currentPerf.averageReward
                : '0.0'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Total Evaluations:</span>
            <span className="text-sm font-bold text-cyan-400">
              {currentPerf?.totalEvaluations ?? 0} Cycles
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Confidence Score:</span>
            <span className="text-sm font-bold text-indigo-400">
              {currentPerf
                ? `${Math.min(98, Math.round(75 + currentPerf.averageReward * 15))}%`
                : '85%'}
            </span>
          </div>
        </div>
      </div>

      {/* 10 Trait Genome Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {currentGenome &&
          [
            {
              label: 'Aggression',
              val: currentGenome.aggression,
              color: 'bg-rose-500',
              text: 'text-rose-400',
            },
            {
              label: 'Caution',
              val: currentGenome.caution,
              color: 'bg-cyan-400',
              text: 'text-cyan-400',
            },
            {
              label: 'Collaboration',
              val: currentGenome.collaboration,
              color: 'bg-emerald-400',
              text: 'text-emerald-400',
            },
            {
              label: 'Curiosity',
              val: currentGenome.curiosity,
              color: 'bg-purple-400',
              text: 'text-purple-400',
            },
            {
              label: 'Patience',
              val: currentGenome.patience,
              color: 'bg-amber-400',
              text: 'text-amber-400',
            },
            {
              label: 'Risk Tolerance',
              val: currentGenome.riskTolerance,
              color: 'bg-indigo-400',
              text: 'text-indigo-400',
            },
            {
              label: 'Rewrite Bias',
              val: currentGenome.rewriteBias,
              color: 'bg-rose-400',
              text: 'text-rose-300',
            },
            {
              label: 'Link-Bait Bias',
              val: currentGenome.linkbaitBias,
              color: 'bg-yellow-400',
              text: 'text-yellow-300',
            },
            {
              label: 'Expansion Bias',
              val: currentGenome.expansionBias,
              color: 'bg-teal-400',
              text: 'text-teal-300',
            },
            {
              label: 'Publish Bias',
              val: currentGenome.publishBias,
              color: 'bg-emerald-500',
              text: 'text-emerald-300',
            },
          ].map((t) => (
            <div
              key={t.label}
              className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono space-y-2"
            >
              <div className="flex justify-between text-xs text-slate-300">
                <span>{t.label}</span>
                <strong className={`font-bold ${t.text}`}>
                  {(t.val * 100).toFixed(0)}%
                </strong>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`${t.color} h-full transition-all duration-500`}
                  style={{ width: `${t.val * 100}%` }}
                />
              </div>
            </div>
          ))}
      </div>

      {/* Trait Drift & Evolution Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Trait Drift & Trajectory (7 cols) */}
        <div className="md:col-span-7 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3 font-mono">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-400" />
            <span>Trait Drift & Confidence Trajectory Timeline</span>
          </h3>

          <div className="space-y-3 pt-2">
            {/* Generation Timeline Nodes */}
            <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-950 border border-indigo-600 text-indigo-300 flex items-center justify-center font-bold text-[10px]">
                  G1
                </span>
                <div>
                  <div className="text-white font-bold">
                    Initial Genome Creation
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    Baseline Trait Vector Initialized
                  </div>
                </div>
              </div>
              <span className="text-slate-500 text-[10px]">Baseline</span>
            </div>

            <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-600 text-emerald-300 flex items-center justify-center font-bold text-[10px]">
                  G
                  {currentGenome?.generation
                    ? Math.max(1, currentGenome.generation - 1)
                    : 1}
                </span>
                <div>
                  <div className="text-white font-bold">
                    Reinforcement Evolution
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    Action Biases & Collaboration Adjusted (+0.05 per positive
                    reward)
                  </div>
                </div>
              </div>
              <span className="text-emerald-400 text-[10px]">Complete</span>
            </div>

            <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-indigo-800/40 text-xs">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-600 text-cyan-300 flex items-center justify-center font-bold text-[10px] animate-pulse">
                  G{currentGenome?.generation ?? 2}
                </span>
                <div>
                  <div className="text-white font-bold">
                    Current Active Genome Generation
                  </div>
                  <div className="text-slate-400 text-[10px]">
                    Emergent Label: {currentLabel.label}
                  </div>
                </div>
              </div>
              <span className="text-cyan-400 font-bold text-[10px]">
                Active Now
              </span>
            </div>
          </div>
        </div>

        {/* Emergent Strategy Labels Across Squad (5 cols) */}
        <div className="md:col-span-5 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3 font-mono">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Compass size={16} className="text-amber-400" />
            <span>Squad Emergent Strategy Labels</span>
          </h3>

          <div className="space-y-2.5 pt-1">
            {(['heat-pumps', 'solar', 'insulation', 'grants'] as AgentId[]).map(
              (agentId) => {
                const g = genomes ? genomes[agentId] : null;
                const lbl = getEmergentStrategyLabel(agentId, g);

                return (
                  <div
                    key={agentId}
                    onClick={() => setSelectedAgent(agentId)}
                    className={`bg-slate-900 p-3 rounded-lg border flex items-center justify-between text-xs cursor-pointer transition ${
                      selectedAgent === agentId
                        ? 'border-indigo-500 bg-indigo-950/30'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{lbl.icon}</span>
                      <div>
                        <div className="font-bold text-white capitalize">
                          {agentId.replace('-', ' ')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {lbl.label}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold">
                      Gen {g?.generation ?? 1}
                    </span>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentEvolutionDashboard;
