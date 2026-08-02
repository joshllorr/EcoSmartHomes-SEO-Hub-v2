import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Circle,
  Sparkles,
  Trophy,
  Zap,
  Filter,
  RefreshCw,
  Check,
  ShieldCheck,
  ArrowUpRight,
} from 'lucide-react';

export interface ChecklistItem {
  id: string;
  title: string;
  category: 'On-Page' | 'Technical & Schema' | 'AI Visibility';
  description: string;
  xp: number;
  impact: 'Critical' | 'High' | 'Medium';
  actionLabel?: string;
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  {
    id: 'meta-descriptions',
    title: 'Add unique meta descriptions to key pages',
    category: 'On-Page',
    description:
      'Ensure all core landing pages have 150-160 character meta descriptions targeting high-intent Irish retrofit terms.',
    xp: 15,
    impact: 'High',
  },
  {
    id: 'h1-headings',
    title: 'Optimize H1 and heading hierarchy',
    category: 'On-Page',
    description:
      "Include primary target terms (e.g. 'BER Rating Ireland') in a single H1 header per page without keyword stuffing.",
    xp: 15,
    impact: 'High',
  },
  {
    id: 'jsonld-schema',
    title: 'Inject JSON-LD structured microdata',
    category: 'Technical & Schema',
    description:
      'Embed Organization, WebSite, and FAQPage schemas so search engines & LLMs cite your site authoritatively.',
    xp: 20,
    impact: 'Critical',
  },
  {
    id: 'alt-text',
    title: 'Add descriptive image alt tags',
    category: 'On-Page',
    description:
      'Describe diagrams, heat pump photos, and retrofitting infographics using descriptive alt attributes.',
    xp: 10,
    impact: 'Medium',
  },
  {
    id: 'faq-llm-snippets',
    title: 'Add conversational Q&A sections',
    category: 'AI Visibility',
    description:
      'Format key answers into clear Question/Answer pairs that Perplexity, ChatGPT, and Gemini cite directly.',
    xp: 25,
    impact: 'Critical',
  },
  {
    id: 'canonical-urls',
    title: 'Configure self-referencing canonical tags',
    category: 'Technical & Schema',
    description:
      'Prevent duplicate content issues caused by tracking query parameters or sitemap variations.',
    xp: 15,
    impact: 'Medium',
  },
  {
    id: 'pagespeed-core-vitals',
    title: 'Optimize Core Web Vitals & LCP',
    category: 'Technical & Schema',
    description:
      'Compress hero images and defer non-critical scripts to maintain a sub-2.5s Largest Contentful Paint.',
    xp: 20,
    impact: 'High',
  },
  {
    id: 'internal-linking',
    title: 'Build contextual internal links',
    category: 'AI Visibility',
    description:
      'Link energy calculators and grant guides together using keyword-rich anchor text to build topical authority.',
    xp: 15,
    impact: 'High',
  },
];

interface QuickSEOChecklistProps {
  onXPUnlock?: (amount: number) => void;
  targetDomain?: string;
}

export default function QuickSEOChecklist({
  onXPUnlock,
  targetDomain = 'ecosmarthomes.ie',
}: QuickSEOChecklistProps) {
  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ecosmart_seo_checklist_v1');
      return saved ? JSON.parse(saved) : ['jsonld-schema']; // Default 1 completed for nice initial state
    } catch {
      return ['jsonld-schema'];
    }
  });

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [recentXpToast, setRecentXpToast] = useState<{
    amount: number;
    title: string;
  } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(
        'ecosmart_seo_checklist_v1',
        JSON.stringify(completedIds),
      );
    } catch (e) {
      console.error('Failed to save checklist state:', e);
    }
  }, [completedIds]);

  const toggleItem = (item: ChecklistItem) => {
    const isCompleted = completedIds.includes(item.id);

    if (isCompleted) {
      setCompletedIds((prev) => prev.filter((id) => id !== item.id));
    } else {
      setCompletedIds((prev) => [...prev, item.id]);
      if (onXPUnlock) {
        onXPUnlock(item.xp);
      }
      setRecentXpToast({ amount: item.xp, title: item.title });
      setTimeout(() => setRecentXpToast(null), 3000);
    }
  };

  const filteredItems = DEFAULT_CHECKLIST.filter((item) => {
    if (activeCategory === 'All') return true;
    return item.category === activeCategory;
  });

  const totalXP = DEFAULT_CHECKLIST.reduce((acc, curr) => acc + curr.xp, 0);
  const earnedXP = DEFAULT_CHECKLIST.filter((item) =>
    completedIds.includes(item.id),
  ).reduce((acc, curr) => acc + curr.xp, 0);

  const completedCount = completedIds.length;
  const progressPercent = Math.round(
    (completedCount / DEFAULT_CHECKLIST.length) * 100,
  );

  const handleReset = () => {
    setCompletedIds([]);
  };

  const categories = ['All', 'On-Page', 'Technical & Schema', 'AI Visibility'];

  return (
    <div
      className="glass-card p-6 space-y-5 text-left relative overflow-hidden"
      id="quick-seo-checklist-component"
    >
      {/* Toast Popup when XP is unlocked */}
      {recentXpToast && (
        <div className="absolute top-4 right-4 z-20 bg-emerald-500/90 text-[#0f172a] px-3.5 py-2 rounded-xl font-bold text-xs shadow-lg backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <Zap size={15} className="fill-[#0f172a]" />
          <span>+{recentXpToast.amount} XP Earned!</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-[#34d399] border border-emerald-500/20">
              <ShieldCheck size={18} />
            </div>
            <h3 className="font-semibold text-white text-base tracking-tight">
              Quick SEO Checklist
            </h3>
            <span className="text-[10px] font-mono bg-emerald-500/10 text-[#34d399] border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
              Bonus XP Enabled
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Check off key optimization items for{' '}
            <span className="text-slate-200 font-medium font-mono">
              {targetDomain}
            </span>{' '}
            to boost rank and earn XP.
          </p>
        </div>

        {/* XP Progress Indicator */}
        <div className="flex items-center gap-3 bg-black/30 border border-white/10 p-2.5 rounded-xl shrink-0">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Trophy size={16} />
          </div>
          <div>
            <div className="text-[10px] uppercase font-mono text-slate-400 font-semibold">
              Checklist XP
            </div>
            <div className="text-xs font-bold text-white font-mono">
              <span className="text-[#34d399]">{earnedXP}</span> / {totalXP} XP
            </div>
          </div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="space-y-1.5 bg-black/20 border border-white/5 p-3 rounded-xl">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-300">
            Overall Optimization Progress
          </span>
          <span className="font-mono text-[#34d399] font-bold">
            {completedCount} of {DEFAULT_CHECKLIST.length} done (
            {progressPercent}%)
          </span>
        </div>
        <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Filter Tabs & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition cursor-pointer border ${
                activeCategory === cat
                  ? 'bg-[#34d399] text-[#0f172a] border-[#34d399] font-bold shadow-xs'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {completedCount > 0 && (
          <button
            onClick={handleReset}
            className="text-[11px] font-mono text-slate-400 hover:text-slate-200 transition flex items-center gap-1 cursor-pointer"
            title="Reset checklist progress"
          >
            <RefreshCw size={12} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Checklist Items List */}
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
        {filteredItems.map((item) => {
          const isDone = completedIds.includes(item.id);
          return (
            <div
              key={item.id}
              onClick={() => toggleItem(item)}
              className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex items-start gap-3 select-none ${
                isDone
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-300 opacity-90'
                  : 'bg-black/25 hover:bg-black/40 border-white/10 text-white'
              }`}
            >
              <button
                type="button"
                className="mt-0.5 shrink-0 transition"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item);
                }}
              >
                {isDone ? (
                  <CheckCircle2
                    size={18}
                    className="text-[#34d399] fill-emerald-500/20"
                  />
                ) : (
                  <Circle
                    size={18}
                    className="text-slate-500 hover:text-slate-300"
                  />
                )}
              </button>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`text-xs font-semibold ${
                      isDone ? 'line-through text-slate-400' : 'text-white'
                    }`}
                  >
                    {item.title}
                  </span>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${
                        item.impact === 'Critical'
                          ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                          : item.impact === 'High'
                            ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                            : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}
                    >
                      {item.impact}
                    </span>

                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        isDone
                          ? 'bg-emerald-500/20 text-[#34d399]'
                          : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/20'
                      }`}
                    >
                      <Zap
                        size={11}
                        className={
                          isDone ? 'fill-[#34d399]' : 'fill-indigo-300'
                        }
                      />
                      <span>+{item.xp} XP</span>
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
