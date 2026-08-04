/**
 * src/dashboard/Autonomy.tsx
 *
 * Autonomous SEO Campaign Console
 * Displays live campaign actions (keywords, regions, budget, bidding), MARL council vetoes, and KV action logs.
 */

import { useState, useEffect } from "react";
import { Zap, ShieldCheck, ShieldAlert, Sliders, MapPin, Tag, DollarSign, RefreshCw } from "lucide-react";
import { apiGet } from "../hooks/useApi";

interface CampaignActionItem {
  type: string;
  payload: any;
  reason: string;
  timestamp: number;
}

export default function Autonomy() {
  const [loading, setLoading] = useState(false);
  const [actions, setActions] = useState<CampaignActionItem[]>([
    {
      type: "adjust-regions",
      payload: { regions: ["Dublin", "Limerick", "Cork"] },
      reason: "High forecast demand detected by AI Intelligence Engine",
      timestamp: Date.now() - 3600000
    },
    {
      type: "adjust-keywords",
      payload: { newKeywords: ["retrofit ireland 2026", "home energy upgrade grant"] },
      reason: "Moderate reward: keyword theme expansion",
      timestamp: Date.now() - 7200000
    },
    {
      type: "no-action",
      payload: { vetoed: true },
      reason: "MARL council vetoed autonomous change due to high risk score",
      timestamp: Date.now() - 14400000
    }
  ]);

  const handleFetchHistory = async () => {
    try {
      setLoading(true);
      const res = await apiGet("/api/autonomy/history");
      if (res.ok && res.history) {
        const list = Object.values(res.history) as CampaignActionItem[];
        if (list.length) {
          setActions(list.sort((a, b) => b.timestamp - a.timestamp));
        }
      }
    } catch (err) {
      console.error("Autonomy history fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchHistory();
  }, []);

  const renderIcon = (type: string) => {
    switch (type) {
      case "adjust-regions":
        return <MapPin size={16} className="text-emerald-400" />;
      case "adjust-keywords":
        return <Tag size={16} className="text-sky-400" />;
      case "adjust-budget":
        return <DollarSign size={16} className="text-amber-400" />;
      case "adjust-bidding":
        return <Sliders size={16} className="text-purple-400" />;
      case "no-action":
      default:
        return <ShieldAlert size={16} className="text-rose-400" />;
    }
  };

  return (
    <div className="flex flex-col gap-5 text-left">
      <div className="glass-card p-6 border border-emerald-500/20 rounded-2xl bg-slate-900/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold tracking-wider">Phase 9 Actuator Engine</span>
          <h2 className="text-lg font-bold text-white mt-0.5">Autonomous Campaign Console & Actuator History</h2>
        </div>

        <button
          onClick={handleFetchHistory}
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Refreshing..." : "Fetch Autonomy Log"}
        </button>
      </div>

      {/* Campaign Action Stream */}
      <div className="glass-card p-6 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-emerald-400 animate-pulse" />
          <h3 className="text-sm font-bold text-white">Autonomous Actuator Stream</h3>
        </div>

        <div className="divide-y divide-white/5">
          {actions.map((act, idx) => (
            <div key={idx} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-slate-950 border border-white/10 rounded-xl mt-0.5">
                  {renderIcon(act.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono uppercase text-white">{act.type}</span>
                    {act.payload?.vetoed && (
                      <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] font-bold rounded-md">
                        MARL VETOED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{act.reason}</p>
                  {act.payload?.regions && (
                    <span className="text-[11px] font-mono text-emerald-400 mt-1 block">
                      Target Regions: {act.payload.regions.join(", ")}
                    </span>
                  )}
                  {act.payload?.newKeywords && (
                    <span className="text-[11px] font-mono text-sky-300 mt-1 block">
                      Keywords: {act.payload.newKeywords.join(", ")}
                    </span>
                  )}
                </div>
              </div>

              <span className="text-[10px] font-mono text-slate-400 font-bold shrink-0">
                {new Date(act.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
