/**
 * src/dashboard/Heatmap.tsx
 *
 * Regional Demand Heatmap Intelligence Panel
 * Displays county interest scores, 5% AI demand forecasts, and regional trends.
 */

import { useState, useEffect } from "react";
import { MapPin, TrendingUp, Sparkles, RefreshCw } from "lucide-react";
import { apiGet } from "../hooks/useApi";

interface RegionItem {
  county: string;
  interestScore: number;
  forecast: number;
}

export default function Heatmap() {
  const [loading, setLoading] = useState(false);
  const [regions, setRegions] = useState<RegionItem[]>([
    { county: "Limerick", interestScore: 88, forecast: 92 },
    { county: "Cork", interestScore: 73, forecast: 77 },
    { county: "Dublin", interestScore: 91, forecast: 96 },
    { county: "Galway", interestScore: 82, forecast: 86 },
    { county: "Clare", interestScore: 78, forecast: 82 },
    { county: "Kerry", interestScore: 72, forecast: 76 }
  ]);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const res = await apiGet("/api/analytics/regional-heatmap");
      if (res.ok && res.regions) {
        setRegions(res.regions);
      }
    } catch (err) {
      console.error("Heatmap refresh error", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 text-left">
      <div className="glass-card p-6 border border-emerald-500/20 rounded-2xl bg-slate-900/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold tracking-wider">AI Regional Demand Forecasting</span>
          <h2 className="text-lg font-bold text-white mt-0.5">Irish County Retrofit Demand Heatmap</h2>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Refreshing..." : "Refresh Regional Trends"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {regions.map((r, idx) => (
          <div key={idx} className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-emerald-400" />
                <span className="text-sm font-bold text-white">{r.county}</span>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs rounded-full">
                Score: {r.interestScore}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>AI Demand Forecast:</span>
                <span className="font-mono text-sky-300 font-bold">{r.forecast} / 100</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-sky-400"
                  style={{ width: `${r.forecast}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
