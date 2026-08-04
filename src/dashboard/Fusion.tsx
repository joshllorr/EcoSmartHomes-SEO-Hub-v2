/**
 * src/dashboard/Fusion.tsx
 *
 * Autonomous SEO + Ads Fusion Engine Console
 * Visualizes multi-channel fusion decisions, signal strength meters, reasoning breakdown, and actuator mapping.
 */

import { useState, useEffect } from "react";
import { Zap, Layers, Activity, TrendingUp, RefreshCw, ShieldCheck, MapPin, Tag, Sliders } from "lucide-react";
import { apiGet } from "../hooks/useApi";

interface FusionLogItem {
  fusion: {
    reason: string;
    signalStrength: number;
    suggestedActionType: string;
  };
  ctx?: any;
  timestamp: number;
}

export default function Fusion() {
  const [loading, setLoading] = useState(false);
  const [fusionLogs, setFusionLogs] = useState<FusionLogItem[]>([
    {
      fusion: {
        reason: "High reward + strong regional demand -> expand regions.",
        signalStrength: 0.9,
        suggestedActionType: "adjust-regions"
      },
      timestamp: Date.now() - 3600000
    },
    {
      fusion: {
        reason: "Good reward + backlink growth -> expand keywords.",
        signalStrength: 0.8,
        suggestedActionType: "adjust-keywords"
      },
      timestamp: Date.now() - 7200000
    },
    {
      fusion: {
        reason: "Competitors pushing hard -> adjust bidding strategy.",
        signalStrength: 0.7,
        suggestedActionType: "adjust-bidding"
      },
      timestamp: Date.now() - 14400000
    }
  ]);

  const fetchFusionHistory = async () => {
    try {
      setLoading(true);
      const res = await apiGet("/api/fusion/history");
      if (res.ok && res.history) {
        const list = Object.values(res.history) as FusionLogItem[];
        if (list.length) {
          setFusionLogs(list.sort((a, b) => b.timestamp - a.timestamp));
        }
      }
    } catch (err) {
      console.error("Fusion history fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFusionHistory();
  }, []);

  return (
    <div className="flex flex-col gap-5 text-left">
      <div className="glass-card p-6 border border-sky-500/20 rounded-2xl bg-slate-900/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono text-sky-400 font-bold tracking-wider">Phase 11 Cross-Channel Engine</span>
          <h2 className="text-lg font-bold text-white mt-0.5">Autonomous SEO + Ads Fusion Console</h2>
        </div>

        <button
          onClick={fetchFusionHistory}
          disabled={loading}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Refreshing..." : "Fetch Fusion Log"}
        </button>
      </div>

      {/* Fusion Logs Stream */}
      <div className="glass-card p-6 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-sky-400" />
          <h3 className="text-sm font-bold text-white">Multi-Channel Fused Intelligence Decisions</h3>
        </div>

        <div className="divide-y divide-white/5">
          {fusionLogs.map((item, idx) => (
            <div key={idx} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2.5 bg-slate-950 border border-sky-500/30 rounded-xl text-sky-300 mt-0.5">
                  <Activity size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-white uppercase">{item.fusion.suggestedActionType}</span>
                    <span className="px-2.5 py-0.5 bg-sky-500/20 text-sky-300 font-mono font-bold text-[10px] rounded-full">
                      Signal: {(item.fusion.signalStrength * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 font-medium">{item.fusion.reason}</p>
                </div>
              </div>

              <span className="text-[10px] font-mono text-slate-400 font-bold shrink-0">
                {new Date(item.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
