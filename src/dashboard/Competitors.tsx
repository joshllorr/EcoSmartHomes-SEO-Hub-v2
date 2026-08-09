/**
 * src/dashboard/Competitors.tsx
 *
 * Competitor Diff Intelligence Panel
 * Displays competitor domains, content size, SERP deltas, and AI strategy inferences.
 */

import { useState } from 'react';
import { TrendingUp, RefreshCw, ShieldAlert, Sparkles } from 'lucide-react';
import { apiPost } from '../hooks/useApi';

interface CompetitorItem {
  domain: string;
  contentSize: number;
  rankChange: number;
  strategy: string;
}

export default function Competitors() {
  const [loading, setLoading] = useState(false);
  const [competitors, setCompetitors] = useState<CompetitorItem[]>([
    {
      domain: 'retrofitireland.ie',
      contentSize: 18500,
      rankChange: +3,
      strategy: 'Aggressive retrofit content push',
    },
    {
      domain: 'greenhomehub.ie',
      contentSize: 24200,
      rankChange: -1,
      strategy: 'Large content expansion',
    },
    {
      domain: 'seaimatching.ie',
      contentSize: 14100,
      rankChange: +2,
      strategy: 'Stable SEO posture',
    },
  ]);

  const handleDiffScan = async () => {
    try {
      setLoading(true);
      const res = await apiPost('/api/seo/competitor-diff', {
        competitors: competitors.map((c) => c.domain),
      });
      if (res.ok && res.competitors) {
        setCompetitors(res.competitors);
      }
    } catch (err) {
      console.error('Competitor diff error', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 text-left">
      <div className="glass-card p-6 border border-sky-500/20 rounded-2xl bg-slate-900/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono text-sky-400 font-bold tracking-wider">
            AI Competitor Intelligence
          </span>
          <h2 className="text-lg font-bold text-white mt-0.5">
            Competitor SERP Delta & Strategy Inference
          </h2>
        </div>

        <button
          onClick={handleDiffScan}
          disabled={loading}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Analyzing...' : 'Run SERP Diff Scan'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {competitors.map((item, idx) => (
          <div
            key={idx}
            className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white font-mono">
                {item.domain}
              </span>
              <span
                className={`px-2.5 py-1 text-xs font-bold rounded-full ${item.rankChange >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}
              >
                SERP{' '}
                {item.rankChange >= 0 ? `+${item.rankChange}` : item.rankChange}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">
                AI Strategy Inference
              </span>
              <span className="text-xs font-semibold text-sky-300 block">
                &quot;{item.strategy}&quot;
              </span>
            </div>

            <div className="pt-2 border-t border-white/5 flex justify-between items-center text-xs text-slate-400">
              <span>Payload Size:</span>
              <span className="font-mono text-white">
                {item.contentSize.toLocaleString()} bytes
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
