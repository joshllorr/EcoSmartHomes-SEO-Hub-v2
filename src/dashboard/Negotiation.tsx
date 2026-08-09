/**
 * src/dashboard/Negotiation.tsx
 *
 * Multi-Agent Negotiation Console
 * Displays real-time consensus votes from the Risk Guard Agent, Growth Opportunity Agent, and Efficiency Governor Agent alongside reward context and planned actions.
 */

import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  RefreshCw,
  CheckCircle,
  XCircle,
  Zap,
  Cpu,
} from 'lucide-react';
import { apiGet } from '../hooks/useApi';

interface AgentVote {
  agent: string;
  approve: boolean;
  confidence: number;
  notes?: string;
}

interface NegotiationData {
  timestamp: number;
  approved: boolean;
  reason: string;
  votes: AgentVote[];
  longReward?: number;
  simulatedReward?: number;
  plan?: { type: string; reason: string }[];
}

export default function Negotiation() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<NegotiationData>({
    timestamp: Date.now(),
    approved: true,
    reason: 'Multi-agent consensus achieved: campaign plan endorsed.',
    votes: [
      {
        agent: 'Risk Guard Agent',
        approve: true,
        confidence: 0.85,
        notes: 'Sufficient resilience under market stress conditions.',
      },
      {
        agent: 'Growth Opportunity Agent',
        approve: true,
        confidence: 0.9,
        notes: 'Positive trajectory aligns with long-horizon lead objectives.',
      },
      {
        agent: 'Efficiency Governor Agent',
        approve: true,
        confidence: 0.75,
        notes: 'Acceptable cost-to-reward volatility ratio.',
      },
    ],
    longReward: 0.88,
    simulatedReward: 0.84,
    plan: [
      {
        type: 'adjust-keywords',
        reason: 'Long-horizon growth push: high reward trajectory',
      },
      {
        type: 'adjust-regions',
        reason: 'Expand high-performing Irish counties',
      },
    ],
  });

  const fetchNegotiation = async () => {
    try {
      setLoading(true);
      const res = await apiGet('/api/negotiation/latest');
      if (res && res.votes) {
        setData(res);
      }
    } catch (err) {
      console.error('Negotiation fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNegotiation();
  }, []);

  const {
    timestamp,
    approved,
    reason,
    votes,
    longReward,
    simulatedReward,
    plan,
  } = data;

  return (
    <div className="flex flex-col gap-5 text-left">
      <div className="glass-card p-6 border border-teal-500/20 rounded-2xl bg-slate-900/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono text-teal-400 font-bold tracking-wider">
            Phase 15 Multi-Agent Council
          </span>
          <h2 className="text-lg font-bold text-white mt-0.5">
            Multi-Agent Strategy Debate & Consensus Room
          </h2>
        </div>

        <button
          onClick={fetchNegotiation}
          disabled={loading}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Negotiating...' : 'Fetch Council Votes'}
        </button>
      </div>

      {/* Consensus Banner */}
      <div
        className={`glass-card p-6 border rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${approved ? 'border-emerald-500/30 bg-emerald-950/20' : 'border-rose-500/30 bg-rose-950/20'}`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-xl border ${approved ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}
          >
            {approved ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono font-bold uppercase ${approved ? 'text-emerald-400' : 'text-rose-400'}`}
              >
                {approved
                  ? 'CONSENSUS OUTCOME: APPROVED'
                  : 'CONSENSUS OUTCOME: REJECTED'}
              </span>
            </div>
            <p className="text-sm font-semibold text-white mt-0.5">{reason}</p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-slate-400 font-bold shrink-0">
          Last Cycle: {new Date(timestamp).toLocaleString()}
        </span>
      </div>

      {/* Agent Votes Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {votes.map((v, idx) => (
          <div
            key={idx}
            className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col justify-between gap-3"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 font-mono">
                  {v.agent}
                </span>
                {v.approve ? (
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-md flex items-center gap-1">
                    <CheckCircle size={10} /> APPROVE
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] font-bold rounded-md flex items-center gap-1">
                    <XCircle size={10} /> REJECT
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-300 mt-2 italic">
                {v.notes || 'Agent review completed.'}
              </p>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-white/5">
              <span className="text-[10px] text-slate-400">
                Confidence Rating
              </span>
              <span className="text-xs font-mono font-bold text-teal-300">
                {(v.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Reward Context & Plan Under Negotiation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-6 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Cpu size={18} className="text-teal-400" />
            <h3 className="text-sm font-bold text-white">Reward Context</h3>
          </div>

          <div className="flex flex-col gap-2 mt-1">
            <div className="flex justify-between items-center p-3 bg-slate-950/80 border border-white/5 rounded-xl">
              <span className="text-xs text-slate-300 font-medium">
                Real Long-Horizon Reward:
              </span>
              <span className="text-sm font-mono font-bold text-emerald-400">
                {typeof longReward === 'number'
                  ? (longReward * 100).toFixed(0)
                  : '88'}
                %
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-950/80 border border-white/5 rounded-xl">
              <span className="text-xs text-slate-300 font-medium">
                Simulated Stress Reward:
              </span>
              <span className="text-sm font-mono font-bold text-pink-400">
                {typeof simulatedReward === 'number'
                  ? (simulatedReward * 100).toFixed(0)
                  : '84'}
                %
              </span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-sky-400" />
            <h3 className="text-sm font-bold text-white">
              Plan Under Negotiation
            </h3>
          </div>

          <div className="flex flex-col gap-2 mt-1">
            {(
              plan || [
                { type: 'adjust-keywords', reason: 'Long-horizon growth push' },
              ]
            ).map((p, i) => (
              <div
                key={i}
                className="p-3 bg-slate-950/80 border border-white/5 rounded-xl flex items-start gap-2.5"
              >
                <CheckCircle
                  size={14}
                  className="text-teal-400 shrink-0 mt-0.5"
                />
                <div>
                  <span className="text-xs font-mono font-bold text-white uppercase">
                    {p.type}
                  </span>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {p.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
