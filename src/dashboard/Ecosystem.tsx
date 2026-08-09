/**
 * src/dashboard/Ecosystem.tsx
 *
 * Ecosystem Intelligence Console
 * Unified cross-engine mission control fusing Heatmap, Fusion, Growth, Strategy, Simulation, Negotiation, Budget, Watchdog, and Landing Page CRO.
 */

import { useState, useEffect } from 'react';
import {
  Globe,
  RefreshCw,
  Activity,
  TrendingUp,
  Compass,
  Cpu,
  Users,
  DollarSign,
  Eye,
  Layout,
  ShieldCheck,
} from 'lucide-react';
import { apiGet } from '../hooks/useApi';

interface EcosystemData {
  timestamp: number;
  heatmap: { scrollDepth?: number; clickConcentration?: number };
  fusion: { rank?: number; backlinks?: number; keywords?: string[] };
  growth: { bias?: string; backlinkTrend?: string; heatmapTrend?: string };
  strategy: Record<string, number>;
  simulation: {
    simState?: { cpcVolatility?: number; regionalDemandShock?: number };
  };
  negotiation: {
    approved?: boolean;
    reason?: string;
    votes?: { agent: string; approve: boolean; confidence: number }[];
  };
  budget: { recommendedShift?: number; reason?: string };
  watchdog: { alerts?: string[] };
  landing: { suggestions?: string[] };
}

export default function Ecosystem() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<EcosystemData>({
    timestamp: Date.now(),
    heatmap: { scrollDepth: 0.42, clickConcentration: 0.28 },
    fusion: {
      rank: 2,
      backlinks: 24,
      keywords: [
        'seai grant retrofit',
        'heat pump cost ireland',
        'solar pv limerick',
      ],
    },
    growth: {
      bias: 'balanced',
      backlinkTrend: 'up',
      heatmapTrend: 'strong-up',
    },
    strategy: {
      increaseRetrofitLeads: 0.2,
      growLimerickDemand: 0.15,
      reduceCPCVolatility: 0.1,
    },
    simulation: {
      simState: { cpcVolatility: 0.28, regionalDemandShock: 0.15 },
    },
    negotiation: {
      approved: true,
      reason: 'Multi-agent consensus achieved: campaign plan endorsed.',
      votes: [
        { agent: 'Risk Guard Agent', approve: true, confidence: 0.85 },
        { agent: 'Growth Opportunity Agent', approve: true, confidence: 0.9 },
        { agent: 'Efficiency Governor Agent', approve: true, confidence: 0.75 },
      ],
    },
    budget: {
      recommendedShift: 0.1,
      reason: 'Strong real + simulated reward.',
    },
    watchdog: {
      alerts: [
        'Competitor SERP Rank shifted: #4 → #2',
        'Backlink profile delta: 18 → 24 links',
      ],
    },
    landing: {
      suggestions: [
        'Increase above-the-fold clarity',
        'Add stronger call-to-action buttons',
      ],
    },
  });

  const fetchEcosystem = async () => {
    try {
      setLoading(true);
      const res = await apiGet('/api/ecosystem/latest');
      if (res && res.timestamp) {
        setData(res);
      }
    } catch (err) {
      console.error('Ecosystem fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEcosystem();
  }, []);

  const {
    timestamp,
    heatmap,
    fusion,
    growth,
    strategy,
    simulation,
    negotiation,
    budget,
    watchdog,
    landing,
  } = data;

  return (
    <div className="flex flex-col gap-5 text-left">
      {/* Header Banner */}
      <div className="glass-card p-6 border border-emerald-500/20 rounded-2xl bg-slate-900/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold tracking-wider">
            Phase 19 Ecosystem Intelligence
          </span>
          <h2 className="text-xl font-bold text-white mt-0.5">
            Unified Autonomous Mission Control
          </h2>
        </div>

        <button
          onClick={fetchEcosystem}
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Syncing Ecosystem...' : 'Refresh Ecosystem State'}
        </button>
      </div>

      {/* Grid of 9 Subsystem Engines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Heatmap Signals */}
        <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-teal-400" />
            <h3 className="text-xs font-bold text-white font-mono uppercase">
              Heatmap UX Signals
            </h3>
          </div>
          <div className="flex flex-col gap-1.5 text-xs text-slate-300 font-mono">
            <div className="flex justify-between">
              <span>Scroll Depth:</span>
              <span className="text-teal-300 font-bold">
                {((heatmap?.scrollDepth ?? 0.42) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Click Concentration:</span>
              <span className="text-teal-300 font-bold">
                {((heatmap?.clickConcentration ?? 0.28) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Competitor Posture */}
        <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-sky-400" />
            <h3 className="text-xs font-bold text-white font-mono uppercase">
              Competitor Posture
            </h3>
          </div>
          <div className="flex flex-col gap-1.5 text-xs text-slate-300 font-mono">
            <div className="flex justify-between">
              <span>SERP Rank:</span>
              <span className="text-sky-300 font-bold">
                #{fusion?.rank ?? 2}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Backlinks Count:</span>
              <span className="text-sky-300 font-bold">
                {fusion?.backlinks ?? 24}
              </span>
            </div>
          </div>
        </div>

        {/* Predictive Growth */}
        <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-400" />
            <h3 className="text-xs font-bold text-white font-mono uppercase">
              Predictive Growth
            </h3>
          </div>
          <div className="flex flex-col gap-1.5 text-xs text-slate-300 font-mono">
            <div className="flex justify-between">
              <span>Engine Growth Bias:</span>
              <span className="text-indigo-300 font-bold uppercase">
                {growth?.bias ?? 'balanced'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Backlink Trajectory:</span>
              <span className="text-indigo-300 font-bold">
                {growth?.backlinkTrend ?? 'up'}
              </span>
            </div>
          </div>
        </div>

        {/* Strategy Engine */}
        <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Compass size={16} className="text-amber-400" />
            <h3 className="text-xs font-bold text-white font-mono uppercase">
              Strategy Engine
            </h3>
          </div>
          <div className="flex flex-col gap-1.5 text-xs text-slate-300 font-mono">
            <span className="text-[11px] text-slate-400">Objectives:</span>
            <span className="text-amber-300 font-bold truncate">
              {Object.keys(strategy || {}).join(', ') ||
                'Retrofit Leads, Demand'}
            </span>
          </div>
        </div>

        {/* Simulation Engine */}
        <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Cpu size={16} className="text-pink-400" />
            <h3 className="text-xs font-bold text-white font-mono uppercase">
              Simulation Engine
            </h3>
          </div>
          <div className="flex flex-col gap-1.5 text-xs text-slate-300 font-mono">
            <div className="flex justify-between">
              <span>CPC Volatility:</span>
              <span className="text-pink-300 font-bold">
                ±
                {((simulation?.simState?.cpcVolatility ?? 0.28) * 100).toFixed(
                  0,
                )}
                %
              </span>
            </div>
            <div className="flex justify-between">
              <span>Demand Shock:</span>
              <span className="text-pink-300 font-bold">
                {(
                  (simulation?.simState?.regionalDemandShock ?? 0.15) * 100
                ).toFixed(0)}
                %
              </span>
            </div>
          </div>
        </div>

        {/* Multi-Agent Negotiation */}
        <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-teal-400" />
            <h3 className="text-xs font-bold text-white font-mono uppercase">
              Council Consensus
            </h3>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-mono">
              Consensus State:
            </span>
            <span
              className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded ${negotiation?.approved ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}
            >
              {negotiation?.approved ? 'APPROVED' : 'VETOED'}
            </span>
          </div>
        </div>

        {/* Budget Intelligence */}
        <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-emerald-400" />
            <h3 className="text-xs font-bold text-white font-mono uppercase">
              Budget Shift
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-300">
            {(budget?.recommendedShift ?? 0.1) > 0
              ? `Increase Budget +${((budget?.recommendedShift ?? 0.1) * 100).toFixed(0)}%`
              : (budget?.recommendedShift ?? 0.1) < 0
                ? `Reduce Budget ${((budget?.recommendedShift ?? 0.1) * 100).toFixed(0)}%`
                : 'Maintain Current Baseline'}
          </span>
        </div>

        {/* Competitor Watchdog */}
        <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-sky-400" />
            <h3 className="text-xs font-bold text-white font-mono uppercase">
              Watchdog Alerts
            </h3>
          </div>
          <p className="text-[11px] text-slate-300 font-medium truncate">
            {(watchdog?.alerts || [])[0] || 'Competitor SERP Rank shifted'}
          </p>
        </div>

        {/* Landing Page Optimizer */}
        <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Layout size={16} className="text-purple-400" />
            <h3 className="text-xs font-bold text-white font-mono uppercase">
              Landing CRO
            </h3>
          </div>
          <p className="text-[11px] text-slate-300 font-medium truncate">
            {(landing?.suggestions || [])[0] ||
              'Increase above-the-fold clarity'}
          </p>
        </div>
      </div>
    </div>
  );
}
