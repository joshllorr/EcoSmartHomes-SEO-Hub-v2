/**
 * src/dashboard/Content.tsx
 *
 * Autonomous Content Generation Console
 * Renders SERP, CRO, and simulation aligned content drafts, intelligence signals used, and top action biases.
 */

import { useState, useEffect } from "react";
import { FileText, RefreshCw, Sparkles, CheckCircle2, Eye, ShieldCheck } from "lucide-react";
import { apiGet } from "../hooks/useApi";

interface ContentData {
  timestamp: number;
  contentDraft: string;
  fusion: { contentQuality?: number; competitorContentQuality?: number };
  heatmap: { scrollDepth?: number; clickConcentration?: number };
  simState: { cpcVolatility?: number; regionalDemandShock?: number };
  negotiation: { approved?: boolean };
  biases: Record<string, number>;
}

export default function Content() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ContentData>({
    timestamp: Date.now(),
    contentDraft: "## Cut Your Energy Bills With Smarter Home Upgrades\n\n### Clear, Fast Benefits\nHomeowners in Limerick choose EcoSmartHomes for **quick savings**, **comfort upgrades**, and **trusted local expertise**.\n\n### What Competitors Don't Tell You\n- Hidden costs in retrofit planning\n- Poor insulation choices that reduce savings\n- Missed SEAI grants due to incorrect paperwork\n\n### Ready to Improve Your Home?\nBook a free comfort assessment today.",
    fusion: { contentQuality: 0.65, competitorContentQuality: 0.82 },
    heatmap: { scrollDepth: 0.42, clickConcentration: 0.28 },
    simState: { cpcVolatility: 0.28, regionalDemandShock: 0.15 },
    negotiation: { approved: true },
    biases: { "adjust-keywords": 0.88, "adjust-regions": 0.84, "adjust-bidding": 0.76, "adjust-budget": 0.65 }
  });

  const fetchContent = async () => {
    try {
      setLoading(true);
      const res = await apiGet("/api/content/latest");
      if (res && res.timestamp) {
        setData(res);
      }
    } catch (err) {
      console.error("Content fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const { timestamp, contentDraft, fusion, heatmap, simState, negotiation, biases } = data;

  const topBiases = Object.entries(biases || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-5 text-left">
      {/* Header Banner */}
      <div className="glass-card p-6 border border-emerald-500/20 rounded-2xl bg-slate-900/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold tracking-wider">Phase 21 Content Generation Engine</span>
          <h2 className="text-lg font-bold text-white mt-0.5">Autonomous Content Generation Console</h2>
        </div>

        <button
          onClick={fetchContent}
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          {loading ? "Generating Draft..." : "Generate Fresh Content Draft"}
        </button>
      </div>

      {/* Grid: Left Column Draft Preview, Right Column Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Content Draft Markdown Card */}
        <div className="lg:col-span-2 glass-card p-6 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-4">
          <div className="flex justify-between items-center pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Generated Content Draft</h3>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Generated: {new Date(timestamp).toLocaleTimeString()}
            </span>
          </div>

          <div className="p-4 bg-slate-950/80 border border-white/5 rounded-xl text-slate-200 text-xs font-mono whitespace-pre-wrap leading-relaxed">
            {contentDraft}
          </div>
        </div>

        {/* Intelligence Signals & Top Biases */}
        <div className="flex flex-col gap-4">
          {/* Signals Used */}
          <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-teal-400" />
              <h3 className="text-xs font-bold text-white font-mono uppercase">Autonomous Signals Used</h3>
            </div>
            <div className="flex flex-col gap-2 text-xs font-mono text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Scroll Depth:</span>
                <span className="text-teal-300 font-bold">{((heatmap?.scrollDepth ?? 0.42) * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Competitor Content Quality:</span>
                <span className="text-teal-300 font-bold">{fusion?.competitorContentQuality ?? 0.82}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">CPC Volatility:</span>
                <span className="text-pink-300 font-bold">±{((simState?.cpcVolatility ?? 0.28) * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Negotiation Council:</span>
                <span className={`font-bold ${negotiation?.approved ? "text-emerald-400" : "text-rose-400"}`}>
                  {negotiation?.approved ? "Approved" : "Vetoed"}
                </span>
              </div>
            </div>
          </div>

          {/* Top Biases */}
          <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" />
              <h3 className="text-xs font-bold text-white font-mono uppercase">Top Evolved Biases</h3>
            </div>
            <div className="flex flex-col gap-2">
              {topBiases.map(([type, score], i) => (
                <div key={i} className="flex justify-between items-center text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 size={12} className="text-amber-400" />
                    <span className="text-slate-200 font-bold uppercase">{type}</span>
                  </div>
                  <span className="text-amber-300 font-bold">{score.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
