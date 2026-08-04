/**
 * src/dashboard/Growth.tsx
 *
 * Predictive Growth Console Panel
 * Visualizes 30-day forward demand projections, backlink & heatmap trend slopes, and growth biases (Aggressive / Balanced / Defensive).
 */

import { useState, useEffect } from "react";
import { TrendingUp, Activity, Sparkles, Compass, ShieldCheck, Zap, RefreshCw, BarChart2 } from "lucide-react";
import { apiGet } from "../hooks/useApi";

interface GrowthLogItem {
  backlinkTrend: string;
  heatmapTrend: string;
  backlinkSlope: number;
  heatmapSlope: number;
  bias: "aggressive" | "balanced" | "defensive";
  forecast30Day: string;
  timestamp: number;
}

export default function Growth() {
  const [loading, setLoading] = useState(false);
  const [growthState, setGrowthState] = useState<GrowthLogItem>({
    backlinkTrend: "strong-up",
    heatmapTrend: "up",
    backlinkSlope: 6.4,
    heatmapSlope: 2.8,
    bias: "aggressive",
    forecast30Day: "+28% Traffic & SEAI Grant Leads",
    timestamp: Date.now()
  });

  const fetchGrowthHistory = async () => {
    try {
      setLoading(true);
      const res = await apiGet("/api/growth/history");
      if (res.ok && res.history) {
        const list = Object.values(res.history) as GrowthLogItem[];
        if (list.length) {
          const latest = list.sort((a, b) => b.timestamp - a.timestamp)[0];
          setGrowthState(latest);
        }
      }
    } catch (err) {
      console.error("Growth history fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrowthHistory();
  }, []);

  const getBiasBadge = (bias: string) => {
    switch (bias) {
      case "aggressive":
        return <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs rounded-full">🔥 AGGRESSIVE EXPANSION</span>;
      case "defensive":
        return <span className="px-3 py-1 bg-rose-500/20 text-rose-300 font-mono font-bold text-xs rounded-full">🛡️ DEFENSIVE REDUCTION</span>;
      case "balanced":
      default:
        return <span className="px-3 py-1 bg-sky-500/20 text-sky-300 font-mono font-bold text-xs rounded-full">⚡ BALANCED CALIBRATION</span>;
    }
  };

  return (
    <div className="flex flex-col gap-5 text-left">
      <div className="glass-card p-6 border border-emerald-500/20 rounded-2xl bg-slate-900/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold tracking-wider">Phase 12 Predictive Intelligence</span>
          <h2 className="text-lg font-bold text-white mt-0.5">Predictive Growth Engine Console</h2>
        </div>

        <button
          onClick={fetchGrowthHistory}
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Modeling..." : "Fetch Growth Model"}
        </button>
      </div>

      {/* Growth Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 glass-card border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-400">Backlink Growth Trend</span>
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono font-bold text-emerald-400 uppercase">{growthState.backlinkTrend}</span>
            <span className="text-xs font-mono text-slate-300">Slope: +{growthState.backlinkSlope}</span>
          </div>
          <span className="text-[11px] text-slate-400">Historical crawl trajectory</span>
        </div>

        <div className="p-5 glass-card border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-400">Heatmap Demand Trend</span>
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono font-bold text-sky-400 uppercase">{growthState.heatmapTrend}</span>
            <span className="text-xs font-mono text-slate-300">Slope: +{growthState.heatmapSlope}</span>
          </div>
          <span className="text-[11px] text-slate-400">Irish county search velocity</span>
        </div>

        <div className="p-5 glass-card border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-400">Engine Growth Bias</span>
          <div>{getBiasBadge(growthState.bias)}</div>
          <span className="text-[11px] text-slate-400 mt-1">Tilts actuators for ROI</span>
        </div>

        <div className="p-5 glass-card border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-2">
          <span className="text-xs font-bold text-slate-400">Forward 30-Day Outlook</span>
          <span className="text-sm font-mono font-bold text-emerald-300">{growthState.forecast30Day}</span>
          <span className="text-[11px] text-emerald-400 font-semibold">100% Growth Alignment</span>
        </div>
      </div>
    </div>
  );
}
