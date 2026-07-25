import { useState, useEffect } from "react";
import { useDashboardStore } from "../store/useDashboardStore";
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Globe, 
  BookOpen, 
  Tag, 
  Sliders, 
  ArrowRight,
  RefreshCw,
  Search,
  ThumbsUp,
  FileCheck,
  ChevronRight,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ArticleDraft, DashboardState } from "../types";

interface ContentAuditTabProps {
  drafts: ArticleDraft[];
  onUpdateDraft: (updatedDraft: ArticleDraft) => void;
  onXPUnlock: (amount: number) => void;
  onNavigateToTab: (tab: string) => void;
}

export default function ContentAuditTab({
  drafts = [],
  onUpdateDraft,
  onXPUnlock,
  onNavigateToTab
}: ContentAuditTabProps) {
  const targetDomain = useDashboardStore((s) => s.targetDomain);
  const [selectedDraftId, setSelectedDraftId] = useState<string>("");
  const [activeDraft, setActiveDraft] = useState<ArticleDraft | null>(null);
  const [fixingMetric, setFixingMetric] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync selected draft when selection changes or drafts list updates
  useEffect(() => {
    if (drafts.length > 0) {
      if (!selectedDraftId || !drafts.some(d => d.id === selectedDraftId)) {
        setSelectedDraftId(drafts[0].id);
        setActiveDraft(drafts[0]);
      } else {
        const found = drafts.find(d => d.id === selectedDraftId);
        if (found) {
          setActiveDraft(found);
        }
      }
    } else {
      setActiveDraft(null);
    }
  }, [selectedDraftId, drafts]);

  // Clean success/error notifications on draft change
  useEffect(() => {
    setSuccessMsg(null);
    setWarningMsg(null);
    setErrorMsg(null);
  }, [selectedDraftId]);

  if (drafts.length === 0) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 bg-[#34d399]/10 border border-[#34d399]/25 rounded-full flex items-center justify-center text-[#34d399] mb-4">
          <FileCheck size={32} />
        </div>
        <h3 className="font-display font-semibold text-xl text-white">No drafts available to audit</h3>
        <p className="text-slate-400 text-xs max-w-sm mt-2 leading-relaxed">
          Create an article draft using the AI Writer tool first, then return here to run deep SEO diagnostic sweeps, check readability, and optimize keyword density.
        </p>
        <button
          onClick={() => onNavigateToTab("writer")}
          className="mt-6 bg-[#34d399] hover:bg-[#2bc48d] text-[#0f172a] px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
        >
          <span>Open AI Writer</span>
          <ArrowRight size={14} />
        </button>
      </div>
    );
  }

  if (!activeDraft) return null;

  // -------------------------------------------------------------
  // Dynamic SEO Metric Calculations
  // -------------------------------------------------------------
  const wordCount = activeDraft.content.split(/\s+/).filter(Boolean).length || 1;
  const sentenceCount = activeDraft.content.split(/[.!?]+/).filter(s => s.trim().length > 0).length || 1;
  const avgSentenceLength = parseFloat((wordCount / sentenceCount).toFixed(1));

  // 1. Readability Analysis
  let readabilityScore = 100;
  let readabilityStatus: "Optimized" | "Complex" | "Simple" = "Optimized";
  let readabilityFeedback = "";

  if (avgSentenceLength > 18) {
    readabilityStatus = "Complex";
    readabilityScore = Math.max(30, Math.round(100 - (avgSentenceLength - 15) * 4.5));
    readabilityFeedback = `Your sentences average ${avgSentenceLength} words. This makes the content dense and harder to read for homeowners seeking quick answers.`;
  } else if (avgSentenceLength < 10) {
    readabilityStatus = "Simple";
    readabilityScore = Math.min(100, Math.round(80 + avgSentenceLength * 1.5));
    readabilityFeedback = `Your sentences average ${avgSentenceLength} words. It's highly readable but could use more diverse structure and detailed retrofitting steps to establish topical authority.`;
  } else {
    readabilityStatus = "Optimized";
    readabilityScore = 95;
    readabilityFeedback = `Superb sentence structure! Averaging ${avgSentenceLength} words per sentence strikes the ideal balance for high search ranking and residential audience comprehension.`;
  }

  // 2. Keyword Density Analysis
  const targetKeywords = activeDraft.keywords && activeDraft.keywords.length > 0
    ? activeDraft.keywords
    : ["BER rating Ireland", "home retrofit", "SEAI grants", "energy efficiency", "heat pump installation"];

  let matchTotal = 0;
  const keywordMatches = targetKeywords.map(kw => {
    const regex = new RegExp(kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), "gi");
    const count = (activeDraft.content.match(regex) || []).length;
    matchTotal += count;
    const density = parseFloat(((count / wordCount) * 100).toFixed(2));
    return { keyword: kw, count, density };
  });

  const overallDensity = parseFloat(((matchTotal / wordCount) * 100).toFixed(2));
  let densityScore = 100;
  let densityStatus: "Low" | "Optimized" | "High" = "Optimized";
  let densityFeedback = "";

  if (overallDensity < 1.2) {
    densityStatus = "Low";
    densityScore = Math.max(25, Math.round(overallDensity * 75));
    densityFeedback = `Keyword density is too sparse (${overallDensity}%). Google might struggle to associate this draft with your target queries. Try adding more mentions of your focus keywords.`;
  } else if (overallDensity > 3.5) {
    densityStatus = "High";
    densityScore = Math.max(35, Math.round(100 - (overallDensity - 3) * 15));
    densityFeedback = `Potential keyword stuffing detected (${overallDensity}%). Overusing target phrases can lead to search penalties. Smooth out repetitions for a more organic conversational flow.`;
  } else {
    densityStatus = "Optimized";
    densityScore = 98;
    densityFeedback = `Fantastic targeting! An organic density of ${overallDensity}% is highly optimized for modern search semantics and avoids stuffing.`;
  }

  // 3. Meta-Tag Optimization Analysis
  const mTitle = activeDraft.metaTitle || "";
  const mDesc = activeDraft.metaDescription || "";

  let titleScore = 0;
  let titleStatus: "Missing" | "Short" | "Optimized" | "Long" = "Missing";
  if (!mTitle) {
    titleStatus = "Missing";
    titleScore = 0;
  } else if (mTitle.length < 40) {
    titleStatus = "Short";
    titleScore = 50;
  } else if (mTitle.length > 65) {
    titleStatus = "Long";
    titleScore = 65;
  } else {
    titleStatus = "Optimized";
    titleScore = 100;
  }

  let descScore = 0;
  let descStatus: "Missing" | "Short" | "Optimized" | "Long" = "Missing";
  if (!mDesc) {
    descStatus = "Missing";
    descScore = 0;
  } else if (mDesc.length < 100) {
    descStatus = "Short";
    descScore = 45;
  } else if (mDesc.length > 170) {
    descStatus = "Long";
    descScore = 60;
  } else {
    descStatus = "Optimized";
    descScore = 100;
  }

  const metaScore = Math.round((titleScore + descScore) / 2);

  // Overall combined score
  const overallSEOAuditScore = Math.round((readabilityScore + densityScore + metaScore) / 3);

  // -------------------------------------------------------------
  // Fix Action Handlers
  // -------------------------------------------------------------
  const handleFix = async (metricType: "meta" | "density" | "readability") => {
    setFixingMetric(metricType);
    setSuccessMsg(null);
    setWarningMsg(null);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/seo/optimize-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draft: activeDraft,
          actionType: metricType
        })
      });

      if (!response.ok) {
        throw new Error("Optimization API request failed");
      }

      const data = await response.json();

      let updated: ArticleDraft = { ...activeDraft };

      if (metricType === "meta") {
        updated.metaTitle = data.metaTitle;
        updated.metaDescription = data.metaDescription;
      } else if (metricType === "density") {
        updated.content = data.content;
        updated.wordCount = data.wordCount || data.content.split(/\s+/).filter(Boolean).length;
      } else if (metricType === "readability") {
        updated.content = data.content;
        updated.wordCount = data.wordCount || data.content.split(/\s+/).filter(Boolean).length;
      }

      onUpdateDraft(updated);
      setActiveDraft(updated);

      if (data.warning) {
        setWarningMsg(data.warning);
      } else {
        setSuccessMsg(`Successfully optimized your article's ${metricType === "meta" ? "Google meta tags" : metricType === "density" ? "keyword density" : "readability" }!`);
      }

      // Reward XP for fixing metrics
      onXPUnlock(15);

    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to apply automatic SEO optimization. Please check your connection.");
    } finally {
      setFixingMetric(null);
    }
  };

  return (
    <div className="space-y-6 text-left" id="content-audit-tab">
      
      {/* Tab Header & Dropdown */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-semibold text-white tracking-tight flex items-center gap-2">
            <FileCheck className="text-[#34d399]" />
            <span>Content Quality SEO Audit</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Run complete linguistic sweeps on drafts for readability, keyword depth, and search snippet optimization.
          </p>
        </div>

        {/* Draft Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-400 font-mono whitespace-nowrap">Select Draft:</label>
          <select
            value={selectedDraftId}
            onChange={(e) => setSelectedDraftId(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#34d399]"
            id="draft-select-dropdown"
          >
            {drafts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title.length > 35 ? d.title.substring(0, 32) + "..." : d.title} ({d.status})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Overview Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Gauge score card */}
        <div className="glass-card p-6 flex flex-col justify-between relative overflow-hidden col-span-1">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#34d399]/5 rounded-full blur-xl"></div>
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">Combined SEO Strength</h3>
            <p className="text-[10px] text-slate-400 mt-1 leading-normal">
              An aggregate audit computed from target density weightings, average sentence structures, and metadata bounds.
            </p>
          </div>

          <div className="py-6 flex items-center justify-center">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Foreground Meter */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke={overallSEOAuditScore > 80 ? "#34d399" : overallSEOAuditScore > 50 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * overallSEOAuditScore) / 100}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-white tracking-tight">{overallSEOAuditScore}%</span>
                <span className="text-[9px] font-mono uppercase font-bold tracking-widest text-[#34d399] mt-0.5">
                  {overallSEOAuditScore > 85 ? "A-Grade" : overallSEOAuditScore > 70 ? "B-Grade" : "Needs Work"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-lg border border-white/5 text-[10px] text-slate-400 leading-tight">
            <Info size={12} className="text-[#34d399] shrink-0" />
            <span>Targeting 85%+ secures optimal search indexing on modern search networks.</span>
          </div>
        </div>

        {/* Realistic SERP Preview snippet (Visual Wow Factor!) */}
        <div className="glass-card p-6 col-span-1 lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Globe size={13} className="text-sky-400" />
              <span>Google SERP Snippet Preview</span>
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">
              Visualize how your draft will appear to Irish homeowners searching for retrofitting assistance.
            </p>
          </div>

          <div className="bg-[#1e1e1e] border border-white/5 p-4 rounded-xl space-y-2 font-sans my-4 shadow-inner">
            <div className="flex items-center gap-1.5 text-xs text-[#dadce0]">
              <div className="w-5 h-5 bg-[#3c4043] rounded-full flex items-center justify-center text-[8px] text-[#8ab4f8] font-bold">
                ES
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] leading-tight font-medium">{targetDomain}</span>
                <span className="text-[9px] text-[#9aa0a6] leading-none">https://{targetDomain} › blog › retrofit</span>
              </div>
            </div>

            {/* Title snippet */}
            <h4 className="text-lg text-[#8ab4f8] hover:underline cursor-pointer font-medium leading-snug">
              {mTitle || activeDraft.title}
            </h4>

            {/* Description Snippet */}
            <p className="text-xs text-[#bdc1c6] leading-relaxed line-clamp-2">
              {mDesc || "No meta description generated yet. Google will crawl your page and display an auto-generated summary which can hurt search click-through rates. Click 'Fix Meta' below to resolve."}
            </p>
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-white/5 pt-3">
            <span>Title: <strong className={titleStatus === "Optimized" ? "text-emerald-400" : "text-amber-400"}>{mTitle.length} chars</strong> (50-60 target)</span>
            <span>Desc: <strong className={descStatus === "Optimized" ? "text-emerald-400" : "text-amber-400"}>{mDesc.length} chars</strong> (120-160 target)</span>
          </div>
        </div>

      </div>

      {/* Notifications block */}
      <AnimatePresence mode="wait">
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-3 text-emerald-300 text-xs"
          >
            <CheckCircle2 size={16} className="text-[#34d399]" />
            <span>{successMsg} 🚀 <strong>+15 XP Earned!</strong></span>
          </motion.div>
        )}
        {warningMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-amber-500/10 border border-amber-500/25 p-4 rounded-xl flex items-center gap-3 text-amber-300 text-xs"
          >
            <AlertTriangle size={16} className="text-amber-400 shrink-0" />
            <span>{warningMsg} <strong>+15 XP Earned!</strong></span>
          </motion.div>
        )}
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3 text-red-400 text-xs"
          >
            <AlertTriangle size={16} className="text-red-400" />
            <span>{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detailed Diagnostics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* 1. Keyword Density Card */}
        <div className="glass-card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-white text-sm flex items-center gap-1.5">
                <Tag size={15} className="text-[#34d399]" />
                <span>Keyword Density Audit</span>
              </h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                densityStatus === "Optimized" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
              }`}>
                {densityStatus}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-normal">
              {densityFeedback}
            </p>

            {/* Keyword matches table */}
            <div className="bg-black/15 border border-white/5 rounded-xl overflow-hidden text-xs my-2">
              <div className="grid grid-cols-3 bg-white/5 px-3 py-1.5 text-[9px] font-mono uppercase tracking-wider text-slate-400 font-bold border-b border-white/5">
                <span>Phrase</span>
                <span className="text-center">Matches</span>
                <span className="text-right">Density</span>
              </div>
              <div className="divide-y divide-white/5">
                {keywordMatches.map((m, idx) => (
                  <div key={idx} className="grid grid-cols-3 px-3 py-2 text-slate-300">
                    <span className="truncate font-medium">{m.keyword}</span>
                    <span className="text-center font-mono">{m.count}</span>
                    <span className={`text-right font-mono ${m.density > 0 ? "text-slate-200" : "text-slate-500"}`}>{m.density}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => handleFix("density")}
            disabled={fixingMetric !== null || densityStatus === "Optimized"}
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              densityStatus === "Optimized"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default"
                : "bg-white/10 hover:bg-[#34d399] text-white hover:text-[#0f172a] border border-white/10"
            }`}
          >
            {fixingMetric === "density" ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                <span>Injecting Semantic Keywords...</span>
              </>
            ) : densityStatus === "Optimized" ? (
              <>
                <CheckCircle2 size={13} />
                <span>Fully Optimized</span>
              </>
            ) : (
              <>
                <Sparkles size={13} />
                <span>Fix Keyword Density (+15 XP)</span>
              </>
            )}
          </button>
        </div>

        {/* 2. Readability Card */}
        <div className="glass-card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-white text-sm flex items-center gap-1.5">
                <BookOpen size={15} className="text-violet-400" />
                <span>Readability Audit</span>
              </h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                readabilityStatus === "Optimized" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
              }`}>
                {readabilityStatus}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-normal">
              {readabilityFeedback}
            </p>

            {/* Readability statistics list */}
            <div className="bg-black/15 border border-white/5 rounded-xl p-3.5 space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Words Count:</span>
                <span className="font-mono font-bold text-white">{wordCount} words</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Sentences:</span>
                <span className="font-mono text-white">{sentenceCount} sentences</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Avg Sentence Length:</span>
                <span className="font-mono font-bold text-white">{avgSentenceLength} words/sentence</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Flesch Reading Grade:</span>
                <span className={`font-mono font-bold ${
                  readabilityScore > 80 ? "text-emerald-400" : "text-amber-400"
                }`}>
                  {readabilityScore}% ({readabilityScore > 80 ? "Excellent" : readabilityScore > 50 ? "Standard" : "Hard"})
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleFix("readability")}
            disabled={fixingMetric !== null || readabilityStatus === "Optimized"}
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              readabilityStatus === "Optimized"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default"
                : "bg-white/10 hover:bg-[#34d399] text-white hover:text-[#0f172a] border border-white/10"
            }`}
          >
            {fixingMetric === "readability" ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                <span>Improving Readability...</span>
              </>
            ) : readabilityStatus === "Optimized" ? (
              <>
                <CheckCircle2 size={13} />
                <span>Fully Readable</span>
              </>
            ) : (
              <>
                <Sparkles size={13} />
                <span>Fix Readability (+15 XP)</span>
              </>
            )}
          </button>
        </div>

        {/* 3. Meta-Tags Card */}
        <div className="glass-card p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-white text-sm flex items-center gap-1.5">
                <Sliders size={15} className="text-sky-400" />
                <span>Meta-Tag Optimization</span>
              </h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                metaScore > 85 ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
              }`}>
                {metaScore > 85 ? "Optimized" : "Low Score"}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-normal">
              Structured titles and descriptions prevent truncation, raise organic Click-Through-Rates (CTR), and inform search spiders.
            </p>

            <div className="bg-black/15 border border-white/5 rounded-xl p-3.5 space-y-3.5 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Google Title Tag:</span>
                  <span className={titleStatus === "Optimized" ? "text-emerald-400" : "text-amber-400"}>
                    {titleStatus} ({mTitle.length} chars)
                  </span>
                </div>
                <div className="bg-white/5 p-2 rounded border border-white/5 text-slate-300 font-mono text-[10px] truncate">
                  {mTitle || <em className="text-slate-500">Missing Title tag!</em>}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Google Description Tag:</span>
                  <span className={descStatus === "Optimized" ? "text-emerald-400" : "text-amber-400"}>
                    {descStatus} ({mDesc.length} chars)
                  </span>
                </div>
                <div className="bg-white/5 p-2 rounded border border-white/5 text-slate-300 font-mono text-[10px] line-clamp-2 leading-relaxed">
                  {mDesc || <em className="text-slate-500">Missing Description tag!</em>}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => handleFix("meta")}
            disabled={fixingMetric !== null || (titleStatus === "Optimized" && descStatus === "Optimized")}
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              (titleStatus === "Optimized" && descStatus === "Optimized")
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default"
                : "bg-white/10 hover:bg-[#34d399] text-white hover:text-[#0f172a] border border-white/10"
            }`}
          >
            {fixingMetric === "meta" ? (
              <>
                <RefreshCw size={13} className="animate-spin" />
                <span>Crafting Google Meta Tags...</span>
              </>
            ) : (titleStatus === "Optimized" && descStatus === "Optimized") ? (
              <>
                <CheckCircle2 size={13} />
                <span>Meta Tags Optimized</span>
              </>
            ) : (
              <>
                <Sparkles size={13} />
                <span>Fix Meta Tags (+15 XP)</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Interactive Active Content Sandbox view */}
      <div className="glass-card p-6 text-left space-y-4">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-[#34d399]" />
            <h3 className="font-semibold text-white text-base">Active Article Text Draft Box</h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">ID: {activeDraft.id} | Last Edited: {activeDraft.date}</span>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Article Title:</label>
            <input
              type="text"
              value={activeDraft.title}
              onChange={(e) => {
                const updated = { ...activeDraft, title: e.target.value };
                onUpdateDraft(updated);
                setActiveDraft(updated);
              }}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#34d399]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Article Content Body:</label>
            <textarea
              rows={8}
              value={activeDraft.content}
              onChange={(e) => {
                const text = e.target.value;
                const updated = { 
                  ...activeDraft, 
                  content: text,
                  wordCount: text.split(/\s+/).filter(Boolean).length
                };
                onUpdateDraft(updated);
                setActiveDraft(updated);
              }}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-200 leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#34d399] font-mono"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
