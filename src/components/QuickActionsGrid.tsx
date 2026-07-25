import { 
  FileText, 
  RefreshCw, 
  Sparkles, 
  Search, 
  Compass, 
  TrendingUp, 
  PlusCircle, 
  Link2, 
  Globe, 
  ArrowUpRight,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { runSERPAnalysis } from "../utils/runSERPAnalysis";
import { generateTitleMeta } from "../utils/generateTitleMeta";
import { useDashboardStore } from "../store/useDashboardStore";

interface QuickActionsGridProps {
  onActionClick: (actionId: string) => void;
}

export default function QuickActionsGrid({ onActionClick }: QuickActionsGridProps) {
  const navigate = useNavigate();
  const setSERP = useDashboardStore((s) => s.setSERP);
  const setTitleMeta = useDashboardStore((s) => s.setTitleMeta);
  const [loading, setLoading] = useState(false);
  const [generatingMeta, setGeneratingMeta] = useState(false);
  const [metaTopic, setMetaTopic] = useState("Raising BER from G to A");
  const [metaTone, setMetaTone] = useState("professional");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const actions = [
    { id: "generate_article", label: "Generate Article", desc: "Write SEO blog draft", icon: FileText, color: "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20" },
    { id: "rewrite_content", label: "Rewrite Content", desc: "Refine existing pages", icon: RefreshCw, color: "text-slate-200 bg-white/5 border border-white/10 hover:bg-white/10" },
    { id: "optimize_content", label: "Optimize Content", desc: "Boost density metrics", icon: Sparkles, color: "text-purple-400 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20" },
    { id: "research_keywords", label: "Research Keywords", desc: "Discover search volume", icon: Search, color: "text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20" },
    { id: "scout_trends", label: "Scout Trends", desc: "Track rising demand", icon: TrendingUp, color: "text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20" },
    { id: "discover_opps", label: "Discover Opportunities", desc: "Find semantic gaps", icon: Compass, color: "text-sky-400 bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20" },
    { id: "build_links", label: "Build Links", desc: "Generate bait assets", icon: Link2, color: "text-teal-400 bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20" },
    { id: "connect_cms", label: "Connect CMS", desc: "Sync posts to site", icon: Globe, color: "text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20" }
  ];

  return (
    <div 
      className="glass-card p-6 text-left flex flex-col gap-4"
      id="quick-actions-card"
    >
      <div>
        <span className="text-xs uppercase font-mono text-slate-400 font-bold">Shortcuts</span>
        <h3 className="text-sm font-semibold text-white mt-0.5">Quick Actions Toolbelt</h3>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={() => onActionClick(act.id)}
              className={`p-3.5 rounded-xl border transition flex flex-col gap-2.5 text-left group cursor-pointer ${act.color}`}
              id={`quick-action-${act.id}`}
            >
              <div className="flex justify-between items-start w-full">
                <div className="p-1.5 bg-black/30 border border-white/10 rounded-lg shadow-2xs shrink-0">
                  <Icon size={16} />
                </div>
                <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition duration-200 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">{act.label}</span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5 leading-tight">{act.desc}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Run SERP Analysis Trigger */}
      <div className="border-t border-white/10 pt-4 mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" id="quick-action-serp-box">
        <div className="text-left">
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
            <Sparkles size={12} className="text-indigo-400 fill-indigo-400/20" />
            <span>Instant Competitor SERP Intelligence</span>
          </h4>
          <p className="text-[10px] text-slate-400 mt-0.5 leading-snug max-w-md">
            Query Gemini directly to run an instant Google search audit for the target keyword <em className="text-[#34d399] font-mono not-italic font-bold">"BER rating Ireland"</em>.
          </p>
        </div>

        <button
          onClick={async () => {
            if (loading) return;
            setLoading(true);
            setErrorMsg(null);
            try {
              const output = await runSERPAnalysis("BER rating Ireland");
              
              // Parse robustly
              let parsedBlock = output;
              if (output.includes("\n\n")) {
                const parts = output.split("\n\n");
                parsedBlock = parts[0];
              }
              const cleanedBlock = parsedBlock.trim().replace(/^```json/, "").replace(/```$/, "").trim();
              const serpData = JSON.parse(cleanedBlock);
              
              // If we have markdown part left, assign it as summary_markdown
              if (output.includes("\n\n")) {
                const parts = output.split("\n\n");
                serpData.summary_markdown = parts.slice(1).join("\n\n");
              }

              setSERP(serpData);
              // Switch view to SERP Analyzer tab to display results
              onActionClick("serp");
            } catch (err: any) {
              console.error(err);
              setErrorMsg(err.message || "Failed to analyze SERP.");
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-white/5 disabled:text-slate-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          id="quick-action-serp-btn"
        >
          {loading ? (
            <>
              <RefreshCw size={13} className="animate-spin text-white" />
              <span>Auditing "BER rating Ireland"...</span>
            </>
          ) : (
            <>
              <TrendingUp size={13} />
              <span>Run SERP Analysis</span>
            </>
          )}
        </button>
      </div>

      {/* SEO Title & Meta Tags Generator */}
      <div className="border-t border-white/10 pt-4 mt-2 space-y-4" id="quick-action-title-meta-box">
        <div className="text-left">
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
            <Sparkles size={12} className="text-[#34d399] fill-[#34d399]/20" />
            <span>Optimal SEO Title & Meta Generator</span>
          </h4>
          <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
            Instantly formulate Irish retrofit-targeted page titles, URL-safe slugs, and high click-rate meta descriptions matching Irish BER or SEAI regulations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* Topic Input */}
          <div className="md:col-span-6 space-y-1.5 text-left">
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
              Article Topic / Keyword
            </label>
            <input
              type="text"
              value={metaTopic}
              onChange={(e) => setMetaTopic(e.target.value)}
              placeholder="e.g. Raising BER from G to A"
              className="w-full bg-black/30 border border-white/10 hover:border-white/20 focus:border-[#34d399] transition rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 font-medium focus:outline-hidden"
              id="title-meta-topic-input"
            />
          </div>

          {/* Tone Selector */}
          <div className="md:col-span-3 space-y-1.5 text-left">
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
              Tone of Voice
            </label>
            <select
              value={metaTone}
              onChange={(e) => setMetaTone(e.target.value)}
              className="w-full bg-black/30 border border-white/10 hover:border-white/20 focus:border-[#34d399] transition rounded-xl px-3.5 py-2 text-xs text-slate-200 font-medium focus:outline-hidden appearance-none cursor-pointer"
              id="title-meta-tone-select"
            >
              <option value="professional">Professional</option>
              <option value="conversational">Conversational</option>
              <option value="technical">Technical</option>
              <option value="educational">Educational</option>
            </select>
          </div>

          {/* Action Button */}
          <div className="md:col-span-3">
            <button
              onClick={async () => {
                if (generatingMeta) return;
                setGeneratingMeta(true);
                setErrorMsg(null);
                try {
                  const result = await generateTitleMeta(metaTopic, metaTone);
                  setTitleMeta(result);
                  // Redirect to the new SEO metadata result page
                  navigate("/title-meta");
                } catch (err: any) {
                  console.error(err);
                  setErrorMsg(err.message || "Failed to generate SEO metadata.");
                } finally {
                  setGeneratingMeta(false);
                }
              }}
              disabled={generatingMeta || !metaTopic.trim()}
              className="w-full bg-teal-600 hover:bg-teal-500 disabled:bg-white/5 disabled:text-slate-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              id="generate-title-meta-btn"
            >
              {generatingMeta ? (
                <>
                  <RefreshCw size={13} className="animate-spin text-slate-200" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles size={13} className="text-white" />
                  <span>Generate Title & Meta</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-3 rounded-xl flex gap-2 text-xs" id="quick-action-serp-error">
          <AlertCircle size={15} className="text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
