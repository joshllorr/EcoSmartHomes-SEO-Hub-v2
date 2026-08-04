/**
 * src/dashboard/Backlinks.tsx
 *
 * Backlinks Intelligence Panel
 * Displays discovered backlinks, AI quality scores, anchor text, and KV historical crawls.
 */

import { useState, useEffect } from "react";
import { Link2, Sparkles, RefreshCw, ExternalLink, ShieldCheck } from "lucide-react";
import { apiPost, apiGet } from "../hooks/useApi";

interface BacklinkItem {
  url: string;
  anchor: string;
  aiScore?: number;
}

export default function Backlinks() {
  const [loading, setLoading] = useState(false);
  const [targetUrl, setTargetUrl] = useState("https://ecosmarthomes.ie");
  const [backlinks, setBacklinks] = useState<BacklinkItem[]>([
    { url: "https://seai.ie/contractors/ecosmarthomes", anchor: "EcoSmartHomes SEAI Registered Retrofit Advisor", aiScore: 0.95 },
    { url: "https://energy.ie/guide", anchor: "Irish Home Energy Retrofit Guide 2026", aiScore: 0.82 },
    { url: "https://limerick.ie/framework", anchor: "Limerick Local Energy Efficiency Framework", aiScore: 0.88 }
  ]);

  const handleDiscover = async () => {
    try {
      setLoading(true);
      const res = await apiPost("/api/seo/backlink-discovery", { targetUrl });
      if (res.ok && res.backlinks) {
        setBacklinks(res.backlinks);
      }
    } catch (err) {
      console.error("Backlink discovery error", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 text-left">
      <div className="glass-card p-6 border border-indigo-500/20 rounded-2xl bg-slate-900/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono text-indigo-400 font-bold tracking-wider">AI Backlink Discovery Engine</span>
          <h2 className="text-lg font-bold text-white mt-0.5">Backlink Intelligence & Quality Scoring</h2>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-white/10 text-xs text-white rounded-xl focus:outline-none focus:border-indigo-400 font-mono w-full md:w-64"
          />
          <button
            onClick={handleDiscover}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 shrink-0"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {loading ? "Scanning..." : "Scan Domain"}
          </button>
        </div>
      </div>

      {/* Backlinks Data Table */}
      <div className="glass-card p-6 border border-white/10 rounded-2xl bg-slate-900/60 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 font-mono">
              <th className="pb-3 font-semibold">Target URL</th>
              <th className="pb-3 font-semibold">Anchor Text</th>
              <th className="pb-3 font-semibold text-right">AI Quality Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {backlinks.map((b, idx) => (
              <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                <td className="py-3 font-mono text-sky-300 max-w-xs truncate">
                  <a href={b.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                    <Link2 size={13} /> {b.url}
                  </a>
                </td>
                <td className="py-3 text-slate-200 font-medium">{b.anchor}</td>
                <td className="py-3 text-right">
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs rounded-full">
                    {(b.aiScore ?? 0.85).toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
