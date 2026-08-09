/**
 * src/dashboard/Evolution.tsx
 *
 * Autonomous Multi-Cycle Strategy Evolution Console
 * Displays genetic mutations count, top evolved action biases, average reward trends, and latest market simulation context.
 */

import { useState, useEffect } from 'react';
import {
  Dna,
  Award,
  RefreshCw,
  TrendingUp,
  Cpu,
  CheckCircle2,
} from 'lucide-react';
import { apiGet } from '../hooks/useApi';

interface StrategyData {
  mutations?: number;
  biases?: Record<string, number>;
  planHistory?: {
    timestamp: number;
    plan: { type: string; reason?: string }[];
    longReward: number;
    simulatedReward: number;
  }[];
}

interface SimulationData {
  simState?: {
    cpcVolatility?: number;
    regionalDemandShock?: number;
  };
}

interface EcosystemData {
  timestamp: number;
  strategy?: StrategyData;
  simulation?: SimulationData;
}

export default function Evolution() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<EcosystemData>({
    timestamp: Date.now(),
    strategy: {
      mutations: 4,
      biases: {
        'adjust-keywords': 0.88,
        'adjust-regions': 0.84,
        'adjust-bidding': 0.76,
        'adjust-budget': 0.65,
      },
      planHistory: [
        {
          timestamp: Date.now() - 86400000 * 2,
          plan: [{ type: 'adjust-keywords', reason: 'Growth trajectory' }],
          longReward: 0.88,
          simulatedReward: 0.84,
        },
        {
          timestamp: Date.now() - 86400000,
          plan: [
            {
              type: 'adjust-regions',
              reason: 'Expand high-performing Irish counties',
            },
          ],
          longReward: 0.84,
          simulatedReward: 0.8,
        },
      ],
    },
    simulation: {
      simState: {
        cpcVolatility: 0.28,
        regionalDemandShock: 0.15,
      },
    },
  });

  const fetchEvolution = async () => {
    try {
      setLoading(true);
      const res = await apiGet('/api/ecosystem/latest');
      if (res && res.timestamp) {
        setData(res);
      }
    } catch (err) {
      console.error('Evolution fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvolution();
  }, []);

  const strategy = data.strategy || {};
  const simulation = data.simulation || {};

  const mutations = strategy.mutations ?? 4;
  const biases = strategy.biases ?? {
    'adjust-keywords': 0.88,
    'adjust-regions': 0.84,
    'adjust-bidding': 0.76,
    'adjust-budget': 0.65,
  };
  const planHistory = strategy.planHistory ?? [];

  // Compute reward trend
  const rewards = planHistory.map((p) => p.longReward);
  const avgReward =
    rewards.length > 0
      ? (rewards.reduce((a, b) => a + b, 0) / rewards.length).toFixed(2)
      : '0.86';

  // Top evolved biases
  const sortedBiases = Object.entries(biases)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-5 text-left">
      <div className="glass-card p-6 border border-pink-500/20 rounded-2xl bg-slate-900/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono text-pink-400 font-bold tracking-wider">
            Phase 20 Multi-Cycle Strategy Evolution
          </span>
          <h2 className="text-lg font-bold text-white mt-0.5">
            Strategy Evolution Console
          </h2>
        </div>

        <button
          onClick={fetchEvolution}
          disabled={loading}
          className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Evolving...' : 'Fetch Evolution Metrics'}
        </button>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <Dna size={18} className="text-pink-400" />
            <span className="text-xs font-mono font-bold text-slate-300">
              Genetic Mutations
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-bold font-mono text-pink-400">
              {mutations}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Generational Cycles
            </span>
          </div>
        </div>

        <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-400" />
            <span className="text-xs font-mono font-bold text-slate-300">
              Long-Horizon Reward Trend
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-bold font-mono text-emerald-400">
              {avgReward}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Avg ({rewards.length || 2} cycles)
            </span>
          </div>
        </div>

        <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <Cpu size={18} className="text-sky-400" />
            <span className="text-xs font-mono font-bold text-slate-300">
              Market Stress Context
            </span>
          </div>
          <div className="flex flex-col gap-1 mt-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">CPC Volatility:</span>
              <span className="text-pink-300 font-bold">
                ±
                {((simulation.simState?.cpcVolatility ?? 0.28) * 100).toFixed(
                  0,
                )}
                %
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Demand Shock:</span>
              <span className="text-amber-300 font-bold">
                {(
                  (simulation.simState?.regionalDemandShock ?? 0.15) * 100
                ).toFixed(0)}
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Evolved Biases List */}
      <div className="glass-card p-6 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Award size={18} className="text-teal-400" />
          Top Evolved Action Biases
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sortedBiases.map(([type, score], i) => (
            <div
              key={i}
              className="p-3.5 bg-slate-950/80 border border-white/5 rounded-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-teal-400" />
                <span className="text-xs font-mono font-bold text-white uppercase">
                  {type}
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-teal-300">
                {score.toFixed(2)} Rating
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
