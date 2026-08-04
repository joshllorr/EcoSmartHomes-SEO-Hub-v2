/**
 * src/dashboard/Simulation.tsx
 *
 * Autonomous Market Simulator Console
 * Visualizes simulated future market parameters (CPC volatility, competitor aggression, SERP turbulence), planned action stress testing, and real vs. simulated rewards.
 */

import { useState, useEffect } from "react";
import { Cpu, Activity, RefreshCw, Zap, TrendingUp, ShieldAlert, BarChart2, CheckCircle } from "lucide-react";
import { apiGet } from "../hooks/useApi";

interface SimulationData {
  timestamp: number;
  simState: {
    competitorAggression: number;
    cpcVolatility: number;
    backlinkGrowth: number;
    regionalDemandShock: number;
    serpTurbulence: number;
  };
  plan: { type: string; reason: string }[];
  longReward: number;
  simulatedReward: number;
}

export default function Simulation() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SimulationData>({
    timestamp: Date.now(),
    simState: {
      competitorAggression: 0.65,
      cpcVolatility: -0.12,
      backlinkGrowth: 8,
      regionalDemandShock: 0.18,
      serpTurbulence: 0.05
    },
    plan: [
      { type: "adjust-keywords", reason: "Long-horizon growth push: high reward trajectory" },
      { type: "adjust-regions", reason: "Expand high-performing Irish counties" }
    ],
    longReward: 0.88,
    simulatedReward: 0.84
  });

  const fetchSimulation = async () => {
    try {
      setLoading(true);
      const res = await apiGet("/api/simulation/latest");
      if (res.ok && res.simState) {
        setData(res);
      }
    } catch (err) {
      console.error("Simulation fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulation();
  }, []);

  const { simState, plan, longReward, simulatedReward, timestamp } = data;

  return (
    <div className="flex flex-col gap-5 text-left">
      <div className="glass-card p-6 border border-pink-500/20 rounded-2xl bg-slate-900/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono text-pink-400 font-bold tracking-wider">Phase 14 Market Simulator</span>
          <h2 className="text-lg font-bold text-white mt-0.5">Autonomous Market Stress Testing & Practice Console</h2>
        </div>

        <button
          onClick={fetchSimulation}
          disabled={loading}
          className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Simulating..." : "Run Market Stress Test"}
        </button>
      </div>

      {/* Simulated Market Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="p-4 glass-card border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-1">
          <span className="text-[11px] font-bold text-slate-400">Competitor Aggression</span>
          <span className="text-lg font-mono font-bold text-rose-400">
            {(simState.competitorAggression * 100).toFixed(0)}%
          </span>
          <span className="text-[10px] text-slate-400">Simulated SERP pressure</span>
        </div>

        <div className="p-4 glass-card border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-1">
          <span className="text-[11px] font-bold text-slate-400">CPC Volatility</span>
          <span className="text-lg font-mono font-bold text-amber-400">
            {(simState.cpcVolatility * 100).toFixed(0)}%
          </span>
          <span className="text-[10px] text-slate-400">Bid price fluctuation</span>
        </div>

        <div className="p-4 glass-card border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-1">
          <span className="text-[11px] font-bold text-slate-400">Backlink Growth</span>
          <span className="text-lg font-mono font-bold text-emerald-400">
            +{simState.backlinkGrowth} Links
          </span>
          <span className="text-[10px] text-slate-400">Authority influx</span>
        </div>

        <div className="p-4 glass-card border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-1">
          <span className="text-[11px] font-bold text-slate-400">Demand Shock</span>
          <span className="text-lg font-mono font-bold text-sky-400">
            {(simState.regionalDemandShock * 100).toFixed(0)}%
          </span>
          <span className="text-[10px] text-slate-400">County interest shift</span>
        </div>

        <div className="p-4 glass-card border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-1">
          <span className="text-[11px] font-bold text-slate-400">SERP Turbulence</span>
          <span className="text-lg font-mono font-bold text-purple-400">
            {(simState.serpTurbulence * 100).toFixed(0)}%
          </span>
          <span className="text-[10px] text-slate-400">Algorithm noise</span>
        </div>
      </div>

      {/* Real vs Simulated Reward & Plan Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-6 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Cpu size={18} className="text-pink-400" />
            <h3 className="text-sm font-bold text-white">Reward Model Calibration</h3>
          </div>

          <div className="flex flex-col gap-3 mt-1">
            <div className="flex justify-between items-center p-3 bg-slate-950/80 border border-white/5 rounded-xl">
              <span className="text-xs text-slate-300 font-medium">Real Long-Horizon Reward:</span>
              <span className="text-sm font-mono font-bold text-emerald-400">{(longReward * 100).toFixed(0)}%</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-950/80 border border-white/5 rounded-xl">
              <span className="text-xs text-slate-300 font-medium">Simulated Stress Reward:</span>
              <span className="text-sm font-mono font-bold text-pink-400">{(simulatedReward * 100).toFixed(0)}%</span>
            </div>

            <span className="text-[10px] font-mono text-slate-400">
              Last Simulation Cycle: {new Date(timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>

        <div className="glass-card p-6 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-sky-400" />
            <h3 className="text-sm font-bold text-white">Stress-Tested Planned Actions</h3>
          </div>

          <div className="flex flex-col gap-2 mt-1">
            {plan.map((p, i) => (
              <div key={i} className="p-3 bg-slate-950/80 border border-white/5 rounded-xl flex items-start gap-2.5">
                <CheckCircle size={14} className="text-pink-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-mono font-bold text-white uppercase">{p.type}</span>
                  <p className="text-[11px] text-slate-300 mt-0.5">{p.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
