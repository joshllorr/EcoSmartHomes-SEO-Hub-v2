import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Zap,
  Target,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Layers,
  Award,
} from 'lucide-react';
import { PredictiveDashboardSummary } from '../logic/predictiveEngine';

interface SEOInsightsPanelProps {
  onOpenInWriter?: (topic: string) => void;
  onNavigateToSERP?: (keyword: string) => void;
}

export default function SEOInsightsPanel({
  onOpenInWriter,
  onNavigateToSERP,
}: SEOInsightsPanelProps) {
  const [summary, setSummary] = useState<PredictiveDashboardSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPredictiveData = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/predictive/dashboard');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.summary) {
            setSummary(data.summary);
          }
        }
      } catch (err) {
        // Safe offline fallback
      } finally {
        setLoading(false);
      }
    };

    fetchPredictiveData();
  }, []);

  const handleAction = (keyword: string) => {
    if (onNavigateToSERP) {
      onNavigateToSERP(keyword);
    } else if (onOpenInWriter) {
      onOpenInWriter(`Complete Guide to ${keyword} (2026 Edition)`);
    }
  };

  return (
    <div
      className="glass-card p-5 text-left border border-white/10 rounded-2xl bg-slate-900/60 space-y-4"
      id="seo-insights-panel"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Predictive SEO & Retrofit Insights
              </h3>
              <span className="bg-sky-500/20 text-sky-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-sky-500/30">
                Phase 40 Core
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Grounded SEAI grant deadlines, seasonal opportunity surges, and Page 1 breakout targets
            </p>
          </div>
        </div>

        {summary && (
          <div className="hidden sm:flex items-center gap-2">
            <div className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-xs font-mono text-slate-300">
              Pipeline: <strong className="text-emerald-400">€{(summary.predictedMonthlyPipelineValue / 1000).toFixed(0)}k/mo</strong>
            </div>
            <div className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-xs font-mono text-slate-300">
              Growth: <strong className="text-sky-400">+{summary.trafficGrowthPercentage}%</strong>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Insight 1: Breakout Opportunity */}
        <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold font-mono uppercase">
              <TrendingUp size={13} />
              <span>Breakout Velocity Target</span>
            </div>
            <h4 className="text-xs font-bold text-white leading-snug">
              “solar pv grants ireland”
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Rising velocity (Slope -0.8). 30-day model predicts jump to #2 position with <strong>+1,800 monthly visits</strong>.
            </p>
          </div>
          <button
            onClick={() => handleAction('solar pv grants ireland')}
            className="w-full mt-2 py-1.5 px-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] font-mono flex items-center justify-center gap-1 transition cursor-pointer"
          >
            <span>Execute SERP Audit</span>
            <ArrowRight size={12} />
          </button>
        </div>

        {/* Insight 2: Seasonal Demand Surge */}
        <div className="p-3.5 rounded-xl bg-sky-950/20 border border-sky-500/30 space-y-2 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-sky-400 text-xs font-bold font-mono uppercase">
              <Calendar size={13} />
              <span>Seasonal Demand Surge</span>
            </div>
            <h4 className="text-xs font-bold text-white leading-snug">
              Heat Pump Grants & Limerick V94
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Winter retrofit peak season active. Conversion rates up <strong>+4.8%</strong> for localized quote requests.
            </p>
          </div>
          <button
            onClick={() => handleAction('heat pump installer Limerick V94')}
            className="w-full mt-2 py-1.5 px-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-[11px] font-mono flex items-center justify-center gap-1 transition cursor-pointer"
          >
            <span>View Local Targets</span>
            <ArrowRight size={12} />
          </button>
        </div>

        {/* Insight 3: Volatility Risk Defense */}
        <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 space-y-2 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold font-mono uppercase">
              <ShieldAlert size={13} />
              <span>Volatility Defense Triggered</span>
            </div>
            <h4 className="text-xs font-bold text-white leading-snug">
              “ber rating upgrade steps”
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Risk score 74/100 (high turbulence). Automated rewrite enqueued to fortify Page 1 position.
            </p>
          </div>
          <button
            onClick={() => handleAction('ber rating upgrade steps')}
            className="w-full mt-2 py-1.5 px-2.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-[11px] font-mono flex items-center justify-center gap-1 transition cursor-pointer"
          >
            <span>Review Defense Draft</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
