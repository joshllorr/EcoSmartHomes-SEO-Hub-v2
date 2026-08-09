/**
 * src/dashboard/MARL.tsx
 *
 * MARL Agent Intelligence Panel — Phase 8 Multi-Agent Consensus
 * Displays agent squad votes (Risk Guard, Reward Hunter, Compliance Keeper), modeled rewards, and rollback controls.
 */

import { useState } from 'react';
import {
  Cpu,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { apiPost } from '../hooks/useApi';

interface AgentVote {
  name: string;
  rollback: boolean;
  weight: number;
}

interface MARLState {
  lastAction: string;
  modeledReward: number;
  rollbackRequired: boolean;
  rollbackScore?: number;
  confidence: number;
  votes?: AgentVote[];
  timestamp?: number;
}

export default function MARL() {
  const [loading, setLoading] = useState(false);
  const [marlState, setMarlState] = useState<MARLState>({
    lastAction: 'content-publish',
    modeledReward: 0.88,
    rollbackRequired: false,
    rollbackScore: 0.15,
    confidence: 0.95,
    votes: [
      { name: 'risk-guard', rollback: false, weight: 0.3 },
      { name: 'reward-hunter', rollback: false, weight: 0.1 },
      { name: 'compliance-keeper', rollback: false, weight: 0.2 },
    ],
  });
  const [rollbackMsg, setRollbackMsg] = useState<string | null>(null);

  const handleRollbackCheck = async () => {
    try {
      setLoading(true);
      setRollbackMsg(null);
      const res = await apiPost('/api/marl/rollback-decision', {
        lastAction: marlState.lastAction,
        rewardScore: marlState.modeledReward,
      });
      if (res.ok && res.marl) {
        setMarlState(res.marl);
        setRollbackMsg(
          res.message || 'Multi-Agent Consensus Decision Evaluated.',
        );
      }
    } catch (err) {
      console.error('MARL rollback error', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 text-left">
      <div className="glass-card p-6 border border-purple-500/20 rounded-2xl bg-slate-900/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono text-purple-400 font-bold tracking-wider">
            Phase 8 Multi-Agent Squad Consensus
          </span>
          <h2 className="text-lg font-bold text-white mt-0.5">
            MARL Weighted Voting & Governance
          </h2>
        </div>

        <button
          onClick={handleRollbackCheck}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
        >
          <RotateCcw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Evaluating Squad...' : 'Trigger Squad Consensus Vote'}
        </button>
      </div>

      {rollbackMsg && (
        <div className="p-3 bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs rounded-xl font-mono">
          ✓ {rollbackMsg}
        </div>
      )}

      {/* Agent Squad Voting Breakdown */}
      <div className="glass-card p-6 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <UserCheck size={18} className="text-purple-400" />
          <h3 className="text-sm font-bold text-white">
            Agent Squad Consensus Breakdown
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(marlState.votes || []).map((vote, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-950/70 border border-white/10 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono uppercase text-sky-300">
                  {vote.name}
                </span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${vote.rollback ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}
                >
                  {vote.rollback ? 'VOTE: ROLLBACK' : 'VOTE: PASS'}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Vote Weight:</span>
                <span className="font-mono text-white font-bold">
                  {vote.weight.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MARL Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 glass-card border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-400">
            Last Evaluated Action
          </span>
          <span className="text-sm font-mono font-bold text-sky-300">
            {marlState.lastAction}
          </span>
          <span className="text-[11px] text-slate-400">
            Executed by MARL Loop
          </span>
        </div>

        <div className="p-5 glass-card border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-400">
            Weighted Modeled Reward
          </span>
          <span className="text-xl font-mono font-bold text-emerald-400">
            {marlState.modeledReward.toFixed(2)}
          </span>
          <span className="text-[11px] text-emerald-300 font-semibold">
            Consensus Threshold: &ge; 0.40
          </span>
        </div>

        <div className="p-5 glass-card border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-400">
            Consensus Rollback Status
          </span>
          <span
            className={`text-xl font-mono font-bold ${marlState.rollbackRequired ? 'text-rose-400' : 'text-emerald-400'}`}
          >
            {marlState.rollbackRequired
              ? 'ROLLBACK (Vote > 0.50)'
              : 'HEALTHY (Pass)'}
          </span>
          <span className="text-[11px] text-slate-400">
            Weighted Score: {(marlState.rollbackScore ?? 0.15).toFixed(2)}
          </span>
        </div>

        <div className="p-5 glass-card border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-400">
            Agent Confidence
          </span>
          <span className="text-xl font-mono font-bold text-purple-300">
            {marlState.confidence.toFixed(2)}
          </span>
          <span className="text-[11px] text-purple-300 font-semibold">
            100% Policy Alignment
          </span>
        </div>
      </div>
    </div>
  );
}
