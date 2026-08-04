/**
 * src/dashboard/Watchdog.tsx
 *
 * Real-Time Competitor Watchdog Console
 * Displays SERP posture movement, backlink profile deltas, keyword strategy shifts, and content structure updates.
 */

import { useState, useEffect } from "react";
import { Eye, ShieldAlert, RefreshCw, Layers, Award, Tag, Key } from "lucide-react";
import { apiGet } from "../hooks/useApi";

interface WatchdogData {
  timestamp: number;
  alerts: string[];
  snapshot: {
    rank: number;
    backlinks: number;
    keywords: string[];
    contentHash: string;
  };
}

export default function Watchdog() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WatchdogData>({
    timestamp: Date.now(),
    alerts: [
      "Competitor SERP Rank shifted: #4 → #2",
      "Backlink profile delta: 18 → 24 links (+6 new links)",
      "Competitor updated landing page content structure (H1 & CTAs modified).",
      "Competitor modified target keyword posture."
    ],
    snapshot: {
      rank: 2,
      backlinks: 24,
      keywords: ["seai grant retrofit", "heat pump cost ireland", "solar pv limerick"],
      contentHash: "hash-849204"
    }
  });

  const fetchWatchdog = async () => {
    try {
      setLoading(true);
      const res = await apiGet("/api/watchdog/latest");
      if (res && Array.isArray(res.alerts)) {
        setData(res);
      }
    } catch (err) {
      console.error("Watchdog fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchdog();
  }, []);

  const { timestamp, alerts, snapshot } = data;

  return (
    <div className="flex flex-col gap-5 text-left">
      <div className="glass-card p-6 border border-sky-500/20 rounded-2xl bg-slate-900/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono text-sky-400 font-bold tracking-wider">Phase 17 Competitive Intelligence</span>
          <h2 className="text-lg font-bold text-white mt-0.5">Real-Time Competitor Watchdog</h2>
        </div>

        <button
          onClick={fetchWatchdog}
          disabled={loading}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Scanning..." : "Fetch Competitor Alerts"}
        </button>
      </div>

      {/* Alerts Feed */}
      <div className="glass-card p-6 border border-sky-500/30 rounded-2xl bg-sky-950/10 flex flex-col gap-3">
        <div className="flex justify-between items-center border-b border-sky-500/20 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert size={18} className="text-sky-400" />
            <h3 className="text-sm font-bold text-white">Live Competitor Posture Alerts</h3>
          </div>

          <span className="text-[10px] font-mono text-slate-400 font-bold">
            Last Watchdog Scan: {new Date(timestamp).toLocaleString()}
          </span>
        </div>

        <div className="flex flex-col gap-2 mt-1">
          {alerts.map((a, i) => (
            <div key={i} className="p-3 bg-slate-950/80 border border-sky-500/20 rounded-xl flex items-start gap-2.5">
              <Eye size={14} className="text-sky-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-200 font-medium">{a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">Competitor Rank</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono text-teal-400">#{snapshot.rank}</span>
            <span className="text-xs text-slate-400 font-mono">SERP Position</span>
          </div>
        </div>

        <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">Backlinks Count</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-bold font-mono text-indigo-400">{snapshot.backlinks}</span>
            <span className="text-xs text-slate-400 font-mono">Live Inbound Links</span>
          </div>
        </div>

        <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">Content Hash</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-sm font-bold font-mono text-amber-400 truncate">{snapshot.contentHash}</span>
          </div>
        </div>

        <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">Keyword Posture</span>
          <div className="flex flex-wrap gap-1 mt-2">
            {(snapshot.keywords || []).map((k, idx) => (
              <span key={idx} className="px-1.5 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-mono rounded-md">
                {k}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
