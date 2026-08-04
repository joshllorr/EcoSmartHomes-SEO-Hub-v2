/**
 * src/dashboard/Budget.tsx
 *
 * Autonomous Budget Allocation Console (Safe Analysis Mode)
 * Visualizes predictive budget shift recommendations (+10%, 0%, -10%), reasoning, real vs. simulated reward context, and agent vote summaries.
 */

import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, TrendingDown, RefreshCw, ShieldCheck, CheckCircle, XCircle } from "lucide-react";
import { apiGet } from "../hooks/useApi";

interface BudgetData {
  timestamp: number;
  longReward: number;
  simulatedReward: number;
  negotiation: {
    approved: boolean;
    reason: string;
    votes: { agent: string; approve: boolean; confidence: number }[];
  };
  recommendedShift: number;
  reason: string;
}

export default function Budget() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BudgetData>({
    timestamp: Date.now(),
    longReward: 0.88,
    simulatedReward: 0.84,
    negotiation: {
      approved: true,
      reason: "Multi-agent consensus achieved: campaign plan endorsed.",
      votes: [
        { agent: "Risk Guard Agent", approve: true, confidence: 0.85 },
        { agent: "Growth Opportunity Agent", approve: true, confidence: 0.90 },
        { agent: "Efficiency Governor Agent", approve: true, confidence: 0.75 }
      ]
    },
    recommendedShift: 0.10,
    reason: "Strong real + simulated reward. Agents approve increasing budget by +10%."
  });

  const fetchBudget = async () => {
    try {
      setLoading(true);
      const res = await apiGet("/api/budget/latest");
      if (res && typeof res.recommendedShift === "number") {
        setData(res);
      }
    } catch (err) {
      console.error("Budget fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, []);

  const { timestamp, longReward, simulatedReward, negotiation, recommendedShift, reason } = data;

  const renderShiftBadge = () => {
    if (recommendedShift > 0) {
      return (
        <span className="px-3.5 py-1 bg-emerald-500/20 text-emerald-300 font-mono font-bold text-sm rounded-full flex items-center gap-1.5 shrink-0">
          <TrendingUp size={16} /> INCREASE BUDGET +{(recommendedShift * 100).toFixed(0)}%
        </span>
      );
    }
    if (recommendedShift < 0) {
      return (
        <span className="px-3.5 py-1 bg-rose-500/20 text-rose-300 font-mono font-bold text-sm rounded-full flex items-center gap-1.5 shrink-0">
          <TrendingDown size={16} /> REDUCE BUDGET {(recommendedShift * 100).toFixed(0)}%
        </span>
      );
    }
    return (
      <span className="px-3.5 py-1 bg-sky-500/20 text-sky-300 font-mono font-bold text-sm rounded-full flex items-center gap-1.5 shrink-0">
        <DollarSign size={16} /> MAINTAIN CURRENT BASELINE
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-5 text-left">
      <div className="glass-card p-6 border border-emerald-500/20 rounded-2xl bg-slate-900/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold tracking-wider">Phase 16 Advisory Intelligence</span>
          <h2 className="text-lg font-bold text-white mt-0.5">Autonomous Budget Allocation Console</h2>
        </div>

        <button
          onClick={fetchBudget}
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Analyzing..." : "Fetch Budget Recommendation"}
        </button>
      </div>

      {/* Recommendation Card */}
      <div className="glass-card p-6 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            {renderShiftBadge()}
          </div>
          <p className="text-sm font-medium text-slate-200 mt-3">{reason}</p>
        </div>

        <span className="text-[10px] font-mono text-slate-400 font-bold shrink-0">
          Last Cycle: {new Date(timestamp).toLocaleString()}
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-6 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <DollarSign size={16} className="text-emerald-400" />
            Reward Calibration Context
          </h3>

          <div className="flex flex-col gap-2 mt-1">
            <div className="flex justify-between items-center p-3 bg-slate-950/80 border border-white/5 rounded-xl">
              <span className="text-xs text-slate-300 font-medium">Real Long-Horizon Reward:</span>
              <span className="text-sm font-mono font-bold text-emerald-400">
                {typeof longReward === "number" ? (longReward * 100).toFixed(0) : "88"}%
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-950/80 border border-white/5 rounded-xl">
              <span className="text-xs text-slate-300 font-medium">Simulated Stress Reward:</span>
              <span className="text-sm font-mono font-bold text-pink-400">
                {typeof simulatedReward === "number" ? (simulatedReward * 100).toFixed(0) : "84"}%
              </span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck size={16} className="text-teal-400" />
            Council Endorsement Summary
          </h3>

          <div className="flex flex-col gap-2 mt-1">
            {(negotiation.votes || []).map((v, i) => (
              <div key={i} className="flex justify-between items-center p-2.5 bg-slate-950/80 border border-white/5 rounded-xl">
                <span className="text-xs text-slate-300 font-mono">{v.agent}</span>
                {v.approve ? (
                  <span className="text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle size={12} /> APPROVE ({(v.confidence * 100).toFixed(0)}%)
                  </span>
                ) : (
                  <span className="text-[11px] font-mono font-bold text-rose-400 flex items-center gap-1">
                    <XCircle size={12} /> REJECT ({(v.confidence * 100).toFixed(0)}%)
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
