/**
 * src/dashboard/Conflict.tsx
 *
 * Autonomous Multi-Agent Conflict Resolution Console
 * Displays live vote disagreement, bias divergence spread, conflict status, and resolution adjustments.
 */

import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  Users,
  ShieldCheck,
  Scale,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { apiGet } from '../hooks/useApi';

interface ConflictData {
  timestamp: number;
  conflict: {
    conflict: boolean;
    biasSpread: number;
    approvals: number;
    rejections: number;
  };
  negotiation: {
    approved?: boolean;
    votes?: {
      agent: string;
      approve: boolean;
      confidence: number;
      notes?: string;
    }[];
  };
  biases: Record<string, number>;
}

export default function Conflict() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ConflictData>({
    timestamp: Date.now(),
    conflict: { conflict: true, biasSpread: 0.23, approvals: 2, rejections: 1 },
    negotiation: {
      approved: true,
      votes: [
        {
          agent: 'Risk Guard Agent',
          approve: false,
          confidence: 0.85,
          notes: 'High stress vulnerability detected (risk flag).',
        },
        {
          agent: 'Growth Opportunity Agent',
          approve: true,
          confidence: 0.9,
          notes:
            'Positive trajectory aligns with long-horizon lead objectives.',
        },
        {
          agent: 'Efficiency Governor Agent',
          approve: true,
          confidence: 0.75,
          notes: 'Acceptable cost-to-reward volatility ratio.',
        },
      ],
    },
    biases: {
      'adjust-keywords': 0.93,
      'adjust-regions': 0.89,
      'adjust-bidding': 0.66,
      'adjust-budget': 0.55,
    },
  });

  const fetchConflict = async () => {
    try {
      setLoading(true);
      const res = await apiGet('/api/conflict/latest');
      if (res && res.timestamp) {
        setData(res);
      }
    } catch (err) {
      console.error('Conflict fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConflict();
  }, []);

  const { timestamp, conflict, negotiation, biases } = data;

  const sortedBiases = Object.entries(biases || {}).sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex flex-col gap-5 text-left">
      {/* Header Banner */}
      <div className="glass-card p-6 border border-amber-500/20 rounded-2xl bg-slate-900/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono text-amber-400 font-bold tracking-wider">
            Phase 22 Autonomous Multi-Agent Conflict Resolution
          </span>
          <h2 className="text-lg font-bold text-white mt-0.5">
            Multi-Agent Conflict Resolution Console
          </h2>
        </div>

        <button
          onClick={fetchConflict}
          disabled={loading}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Resolving...' : 'Sync Conflict Engine'}
        </button>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Conflict Status */}
        <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle
              size={18}
              className={
                conflict?.conflict ? 'text-amber-400' : 'text-emerald-400'
              }
            />
            <span className="text-xs font-mono font-bold text-slate-300">
              Conflict Status
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span
              className={`text-2xl font-bold font-mono uppercase ${conflict?.conflict ? 'text-amber-400' : 'text-emerald-400'}`}
            >
              {conflict?.conflict
                ? 'Conflict Active & Resolved'
                : 'No Active Disagreement'}
            </span>
          </div>
        </div>

        {/* Approvals vs Rejections */}
        <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-sky-400" />
            <span className="text-xs font-mono font-bold text-slate-300">
              Council Votes Ratio
            </span>
          </div>
          <div className="flex items-baseline gap-3 mt-3 font-mono">
            <span className="text-2xl font-bold text-emerald-400">
              {conflict?.approvals ?? 2} Approved
            </span>
            <span className="text-2xl font-bold text-rose-400">
              {conflict?.rejections ?? 1} Rejection
            </span>
          </div>
        </div>

        {/* Bias Spread */}
        <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <Scale size={18} className="text-purple-400" />
            <span className="text-xs font-mono font-bold text-slate-300">
              Bias Divergence Spread
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-3 font-mono">
            <span className="text-3xl font-bold text-purple-300">
              {(conflict?.biasSpread ?? 0.23).toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 font-mono">Spread Δ</span>
          </div>
        </div>
      </div>

      {/* Grid: Left Column Agent Votes, Right Column Adjusted Biases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Agent Votes Breakdown */}
        <div className="glass-card p-6 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users size={18} className="text-sky-400" />
            Multi-Agent Vote Disagreements
          </h3>

          <div className="flex flex-col gap-3">
            {(negotiation?.votes || []).map((v, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-950/80 border border-white/5 rounded-xl flex flex-col gap-1.5"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {v.approve ? (
                      <CheckCircle2 size={16} className="text-emerald-400" />
                    ) : (
                      <XCircle size={16} className="text-rose-400" />
                    )}
                    <span className="text-xs font-mono font-bold text-white">
                      {v.agent}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${v.approve ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}
                  >
                    {v.approve ? 'APPROVED' : 'REJECTED'}
                  </span>
                </div>
                {v.notes && (
                  <p className="text-[11px] text-slate-400 font-mono pl-6">
                    {v.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Conflict-Resolved Biases */}
        <div className="glass-card p-6 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-400" />
            Conflict-Resolved Action Weights
          </h3>

          <div className="flex flex-col gap-3">
            {sortedBiases.map(([type, weight], idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-950/80 border border-white/5 rounded-xl flex items-center justify-between"
              >
                <span className="text-xs font-mono font-bold text-white uppercase">
                  {type}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-emerald-300">
                    {weight.toFixed(2)} Weight
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
