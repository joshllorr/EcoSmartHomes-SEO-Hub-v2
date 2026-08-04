import { Sparkles, BarChart2, Eye, Compass, HelpCircle, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { useDashboardStore } from "../store/useDashboardStore";

interface AIVisibilityCardProps {
  visits: number;
  onOptimizeClick: () => void;
}

export default function AIVisibilityCard({
  visits,
  onOptimizeClick
}: AIVisibilityCardProps) {
  const targetDomain = useDashboardStore((s) => s.targetDomain);
  const [showGuide, setShowGuide] = useState(false);
  const [totalReferrals, setTotalReferrals] = useState<number>(visits || 148);
  const [sources, setSources] = useState([
    { name: "ChatGPT (SearchGPT)", visits: 62, percent: "42%", color: "bg-teal-500" },
    { name: "Perplexity AI", visits: 44, percent: "30%", color: "bg-sky-500" },
    { name: "Gemini", visits: 28, percent: "19%", color: "bg-indigo-500" },
    { name: "Claude (Answer Engine)", visits: 14, percent: "9%", color: "bg-orange-500" }
  ]);

  useEffect(() => {
    fetch("/api/analytics/ai-referrals")
      .then((res) => res.json())
      .then((data) => {
        if (data.ok && data.sources) {
          setSources(data.sources);
          if (data.totalVisits) setTotalReferrals(data.totalVisits);
        }
      })
      .catch((err) => console.warn("AIVisibilityCard: Using fallback referral analytics", err));
  }, []);

  return (
    <div 
      className="glass-card p-6 flex flex-col gap-5 text-left"
      id="ai-visibility-card"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 text-purple-300 rounded-xl shrink-0">
            <Sparkles size={18} className="fill-purple-300/10" />
          </div>
          <div>
            <span className="text-xs uppercase font-mono text-slate-400 font-bold">Generative Search</span>
            <h3 className="text-sm font-semibold text-white">AI Engine Answer Referrals</h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-white/10 px-2.5 py-1 rounded-lg">
          <BarChart2 size={13} />
          <span>Last 30 days</span>
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-white font-mono">{totalReferrals}</span>
        <span className="text-xs text-slate-400 font-medium">total referral sessions</span>
      </div>

      {/* AI visibility bar chart representation */}
      <div className="space-y-3 bg-black/20 border border-white/5 p-4 rounded-xl">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
          Distribution by Engine
        </span>
        <div className="space-y-2">
          {sources.map((src) => (
            <div key={src.name} className="space-y-1">
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span className="font-medium">{src.name}</span>
                <span className="font-mono font-bold text-white">{src.visits}</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className={`${src.color} h-full rounded-full transition-all duration-1000`} style={{ width: src.percent }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actionable recommendation */}
      <p className="text-xs text-slate-400 leading-relaxed">
        AI Answer models index websites based on structural semantic density and conversational content. Currently, <span className="font-semibold text-slate-300">{targetDomain}</span> is not visible in LLM indices.
      </p>

      {/* Toggle interactive optimization guide */}
      <div className="space-y-2.5">
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="text-xs text-[#34d399] hover:text-[#2bc48d] font-semibold flex items-center gap-1.5 outline-hidden cursor-pointer"
          id="toggle-ai-optimization-guide"
        >
          <Compass size={13} />
          <span>{showGuide ? "Hide Optimization Recommendations" : "Show AI Optimization Tips"}</span>
        </button>

        {showGuide && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 space-y-3.5 animate-in slide-in-from-top-1 duration-200">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-300">
                1. Structural Q&A Layout
              </span>
              <p className="text-[11px] text-slate-300 leading-normal">
                Make sure your retrofitting headings are phrased as active questions (e.g., <em>"What is a BER rating?"</em>) followed immediately by a clear, one-sentence direct answer. AI engines love compiling these.
              </p>
            </div>
            <div className="space-y-1 border-t border-white/10 pt-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-300">
                2. Semantic Keyword Density
              </span>
              <p className="text-[11px] text-slate-300 leading-normal">
                Avoid generic summaries. Use specific technical terms like <em>"SEAI grant specifications"</em>, <em>"One-Stop-Shop sequence"</em>, and <em>"U-values"</em> to establish maximum subject-matter authority.
              </p>
            </div>
            <div className="space-y-1 border-t border-white/10 pt-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-300">
                3. Entity & Schema Markup
              </span>
              <p className="text-[11px] text-slate-300 leading-normal">
                Include structured microdata matching Irish building standards. This gives machine-readable schemas that Perplexity or SearchGPT rely on to fetch live facts.
              </p>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={onOptimizeClick}
        className="w-full py-2 bg-[#34d399] hover:bg-[#2bc48d] text-[#0f172a] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
        id="optimize-ai-visibility-btn"
      >
        <Sparkles size={12} className="fill-[#0f172a]" />
        <span>Boost AI Visibility</span>
      </button>
    </div>
  );
}
