import {
  Award,
  FileText,
  ArrowRight,
  BookOpen,
  ExternalLink,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { PillarData } from '../types';

interface PillarPerformanceCardProps {
  pillar: PillarData;
  aiSuggestion: string;
  onOpenInWriter: (suggestion: string) => void;
  onAddSupportPage: () => void;
}

export default function PillarPerformanceCard({
  pillar,
  aiSuggestion,
  onOpenInWriter,
  onAddSupportPage,
}: PillarPerformanceCardProps) {
  // Custom styling for tier
  const getTierColorClass = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'platinum':
        return 'bg-black/40 text-[#34d399] border-[#34d399]/30';
      case 'gold':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'silver':
        return 'bg-white/10 text-slate-200 border-white/10';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  const readinessPercent = pillar.readiness_score;

  return (
    <div
      className="glass-card p-6 flex flex-col gap-6"
      id="pillar-performance-card"
    >
      {/* Card Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xs uppercase tracking-widest font-mono text-slate-400 font-bold">
              Focus SEO Pillar
            </span>
            <span
              className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-bold ${getTierColorClass(pillar.tier)}`}
            >
              {pillar.tier} Tier
            </span>
          </div>
          <h3 className="text-lg font-display font-semibold text-white tracking-tight mt-1">
            {pillar.name}
          </h3>
        </div>

        {/* Circular or pill readiness meter */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-semibold text-white">
              Readiness Score
            </div>
            <div className="text-xs text-slate-400">Tier benchmark: 50+</div>
          </div>
          <div className="relative flex items-center justify-center">
            {/* SVG circle meter */}
            <svg className="w-14 h-14 transform -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="24"
                className="stroke-white/10 fill-none stroke-[4]"
              />
              <circle
                cx="28"
                cy="28"
                r="24"
                className="stroke-[#34d399] fill-none stroke-[4] transition-all duration-1000"
                strokeDasharray="150"
                strokeDashoffset={150 - (150 * readinessPercent) / 100}
              />
            </svg>
            <span className="absolute text-xs font-mono font-bold text-white">
              {readinessPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Grid Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-black/20 p-4 rounded-xl border border-white/5">
        <div className="flex flex-col text-left">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Articles Live
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-semibold text-white">
              {pillar.articles_live}
            </span>
            <span className="text-[10px] font-mono font-bold text-[#34d399] px-2 py-0.5 bg-[#34d399]/10 rounded-full border border-[#34d399]/25 uppercase tracking-wide">
              Unlimited Runs
            </span>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-[#34d399] h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(20, (pillar.articles_live + 1) * 20))}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="flex flex-col text-left">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Acquired Backlinks
          </span>
          <span className="text-2xl font-semibold text-white mt-1">
            {pillar.backlinks}{' '}
            <span className="text-sm font-normal text-slate-400">
              / {pillar.backlinks_required}
            </span>
          </span>
          <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-sky-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${(pillar.backlinks / pillar.backlinks_required) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        <div className="flex flex-col text-left">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            Linkable Bait Assets
          </span>
          <span className="text-lg font-semibold text-white mt-1 truncate">
            {pillar.bait_assets.live}{' '}
            <span className="text-xs text-slate-400 font-normal">live</span> ·{' '}
            {pillar.bait_assets.remaining}{' '}
            <span className="text-xs text-slate-400 font-normal">left</span>
          </span>
          <p className="text-[10px] text-slate-400 mt-2 leading-tight">
            High-value calculator widgets or survey resources that attract free
            incoming links.
          </p>
        </div>
      </div>

      {/* AI Suggestion Box */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-3">
          <div className="shrink-0 w-8 h-8 rounded-lg bg-emerald-500/20 text-[#34d399] flex items-center justify-center">
            <Sparkles size={16} className="text-[#34d399] fill-[#34d399]/10" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#34d399]">
              Harbor AI Priority Content Suggestion
            </div>
            <p className="text-slate-300 text-xs mt-1 font-medium italic">
              “{aiSuggestion}”
            </p>
          </div>
        </div>
        <button
          onClick={() => onOpenInWriter(aiSuggestion)}
          className="bg-[#34d399] hover:bg-[#2bc48d] text-[#0f172a] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 transition cursor-pointer"
          id="open-in-writer-suggestion"
        >
          <FileText size={13} />
          <span>Open in Writer</span>
          <ArrowRight size={12} />
        </button>
      </div>

      {/* Footer Buttons */}
      <div className="flex flex-wrap items-center gap-3 justify-end pt-2 border-t border-white/10">
        <button
          onClick={onAddSupportPage}
          className="px-4 py-2 text-slate-300 hover:bg-white/5 hover:text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          id="add-support-page"
        >
          <BookOpen size={13} />
          <span>Add Support Pages</span>
        </button>
        <button
          onClick={() => onOpenInWriter('')}
          className="px-4 py-2 text-[#34d399] hover:bg-[#34d399]/10 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
          id="open-custom-writer"
        >
          <span>Write Blank Draft</span>
          <ExternalLink size={12} />
        </button>
      </div>
    </div>
  );
}
