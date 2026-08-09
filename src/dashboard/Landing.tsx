/**
 * src/dashboard/Landing.tsx
 *
 * Autonomous Landing Page Optimizer Console
 * Displays actionable Conversion Rate Optimization (CRO) recommendations, heatmap scroll/click metrics, competitor quality scores, CPC volatility, and multi-agent vote breakdowns.
 */

import { useState, useEffect } from 'react';
import {
  Layout,
  Lightbulb,
  RefreshCw,
  Eye,
  ShieldCheck,
  DollarSign,
  Activity,
} from 'lucide-react';
import { apiGet } from '../hooks/useApi';

interface LandingData {
  timestamp: number;
  suggestions: string[];
  heatmap: { scrollDepth: number; clickConcentration: number };
  fusion: { contentQuality: number; competitorContentQuality: number };
  simState: { cpcVolatility: number; regionalDemandShock: number };
  negotiation: {
    approved: boolean;
    votes: { agent: string; approve: boolean; confidence: number }[];
  };
}

export default function Landing() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<LandingData>({
    timestamp: Date.now(),
    suggestions: [
      'Increase above-the-fold clarity — users are not scrolling past the main hero.',
      'Add stronger call-to-action buttons or reposition key SEAI grant calculator CTAs.',
      'Competitors have stronger content — consider adding FAQs, trust badges, or clearer SEAI grant value props.',
      'High CPC volatility detected — improve landing page quality score and keyword relevance to reduce cost.',
    ],
    heatmap: { scrollDepth: 0.42, clickConcentration: 0.28 },
    fusion: { contentQuality: 0.65, competitorContentQuality: 0.82 },
    simState: { cpcVolatility: 0.28, regionalDemandShock: 0.15 },
    negotiation: {
      approved: true,
      votes: [
        { agent: 'Risk Guard Agent', approve: true, confidence: 0.85 },
        { agent: 'Growth Opportunity Agent', approve: true, confidence: 0.9 },
        { agent: 'Efficiency Governor Agent', approve: true, confidence: 0.75 },
      ],
    },
  });

  const fetchLanding = async () => {
    try {
      setLoading(true);
      const res = await apiGet('/api/landing/latest');
      if (res && Array.isArray(res.suggestions)) {
        setData(res);
      }
    } catch (err) {
      console.error('Landing fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLanding();
  }, []);

  const { timestamp, suggestions, heatmap, fusion, simState, negotiation } =
    data;

  return (
    <div className="flex flex-col gap-5 text-left">
      <div className="glass-card p-6 border border-purple-500/20 rounded-2xl bg-slate-900/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono text-purple-400 font-bold tracking-wider">
            Phase 18 Autonomous CRO Engine
          </span>
          <h2 className="text-lg font-bold text-white mt-0.5">
            Autonomous Landing Page Optimizer
          </h2>
        </div>

        <button
          onClick={fetchLanding}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Optimizing...' : 'Fetch CRO Recommendations'}
        </button>
      </div>

      {/* Suggestions Feed */}
      <div className="glass-card p-6 border border-purple-500/30 rounded-2xl bg-purple-950/10 flex flex-col gap-3">
        <div className="flex justify-between items-center border-b border-purple-500/20 pb-3">
          <div className="flex items-center gap-2">
            <Lightbulb size={18} className="text-purple-400" />
            <h3 className="text-sm font-bold text-white">
              Actionable CRO Recommendations
            </h3>
          </div>

          <span className="text-[10px] font-mono text-slate-400 font-bold">
            Last Cycle: {new Date(timestamp).toLocaleString()}
          </span>
        </div>

        <div className="flex flex-col gap-2 mt-1">
          {suggestions.map((s, i) => (
            <div
              key={i}
              className="p-3 bg-slate-950/80 border border-purple-500/20 rounded-xl flex items-start gap-2.5"
            >
              <Layout size={14} className="text-purple-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-200 font-medium">{s}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics & Signals Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Heatmap Signals */}
        <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col justify-between gap-3">
          <div className="flex items-center gap-2">
            <Eye size={16} className="text-teal-400" />
            <h4 className="text-xs font-bold text-white font-mono">
              Heatmap UX Signals
            </h4>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center p-2.5 bg-slate-950/80 rounded-xl border border-white/5">
              <span className="text-xs text-slate-400">Scroll Depth</span>
              <span className="text-xs font-mono font-bold text-teal-300">
                {((heatmap?.scrollDepth ?? 0.42) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-slate-950/80 rounded-xl border border-white/5">
              <span className="text-xs text-slate-400">
                CTA Click Concentration
              </span>
              <span className="text-xs font-mono font-bold text-teal-300">
                {((heatmap?.clickConcentration ?? 0.28) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Competitor Quality Comparison */}
        <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col justify-between gap-3">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-sky-400" />
            <h4 className="text-xs font-bold text-white font-mono">
              Content Quality Comparison
            </h4>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center p-2.5 bg-slate-950/80 rounded-xl border border-white/5">
              <span className="text-xs text-slate-400">
                Your Content Rating
              </span>
              <span className="text-xs font-mono font-bold text-sky-300">
                {((fusion?.contentQuality ?? 0.65) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-slate-950/80 rounded-xl border border-white/5">
              <span className="text-xs text-slate-400">
                Top Competitor Rating
              </span>
              <span className="text-xs font-mono font-bold text-indigo-400">
                {((fusion?.competitorContentQuality ?? 0.82) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>

        {/* Market CPC Volatility */}
        <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col justify-between gap-3">
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-pink-400" />
            <h4 className="text-xs font-bold text-white font-mono">
              Market Stress & CPC
            </h4>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center p-2.5 bg-slate-950/80 rounded-xl border border-white/5">
              <span className="text-xs text-slate-400">CPC Volatility</span>
              <span className="text-xs font-mono font-bold text-pink-400">
                ±{((simState?.cpcVolatility ?? 0.28) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex justify-between items-center p-2.5 bg-slate-950/80 rounded-xl border border-white/5">
              <span className="text-xs text-slate-400">
                Regional Demand Shock
              </span>
              <span className="text-xs font-mono font-bold text-amber-400 font-semibold">
                {((simState?.regionalDemandShock ?? 0.15) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
