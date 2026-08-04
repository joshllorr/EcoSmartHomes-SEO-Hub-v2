import { useState } from 'react';
import {
  Search,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Compass,
  Globe,
  Sparkles,
  Trophy,
} from 'lucide-react';
import SERPViewer, { SERPResult } from './SERP/SERPViewer';

interface SERPAnalyzerTabProps {
  currentSerp: SERPResult | null;
  onSerpAnalyzed: (serp: SERPResult) => void;
  onXPUnlock?: (amount: number) => void;
  onSendToWriter?: (outline: string[], title: string, topic: string) => void;
}

export default function SERPAnalyzerTab({
  currentSerp,
  onSerpAnalyzed,
  onXPUnlock,
  onSendToWriter,
}: SERPAnalyzerTabProps) {
  const [keyword, setKeyword] = useState(
    currentSerp?.keyword || 'SEAI grants Limerick V94',
  );
  const [loading, setLoading] = useState(false);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!keyword.trim()) return;
    setLoading(true);
    setWarningMsg(null);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/seo/serp-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword }),
      });

      if (!response.ok) {
        throw new Error('Failed to compile SERP analysis with Gemini.');
      }

      const data = await response.json();
      if (data.success && data.serp) {
        onSerpAnalyzed(data.serp);
        if (data.warning) {
          setWarningMsg(data.warning);
        }
        // Reward SEO gamified XP!
        if (onXPUnlock && !currentSerp) {
          onXPUnlock(40); // 40 indexing XP
        }
      } else {
        throw new Error(data.error || 'Failed to receive SERP audit.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err.message || 'An unexpected error occurred during SERP analysis.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left" id="serp-analyzer-tab">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-semibold text-white tracking-tight flex items-center gap-2">
            <Globe className="text-[#34d399]" />
            <span>SERP Intelligence & Competitor Audit</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Perform Google Ireland organic competition analysis. Identify
            content opportunities, outlines, and ranking gaps.
          </p>
        </div>

        {/* Gamified Indexing Badge */}
        <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2.5 shrink-0 self-start md:self-auto">
          <Trophy size={14} className="text-[#34d399]" />
          <div className="text-xs">
            <span className="font-bold text-slate-300">Analysis Reward:</span>{' '}
            <span className="font-mono bg-[#34d399]/20 border border-[#34d399]/30 px-2 py-0.5 rounded font-semibold text-[#34d399]">
              +40 XP
            </span>
          </div>
        </div>
      </div>

      {/* Input box */}
      <div className="glass-card p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search
              size={16}
              className="absolute left-4 top-3.5 text-slate-400"
            />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Enter target Limerick V94 keyword (e.g., heat pump installer Limerick V94, BER rating Raheen...)"
              className="w-full pl-11 pr-4 py-3 bg-black/30 border border-white/10 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#34d399]/20 focus:border-[#34d399] outline-hidden text-white font-medium"
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading || !keyword.trim()}
            className="bg-[#34d399] hover:bg-[#2bc48d] disabled:opacity-50 text-[#0f172a] px-6 py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw size={13} className="animate-spin text-[#0f172a]" />
                <span>Auditing SERPs...</span>
              </>
            ) : (
              <>
                <TrendingUp size={13} />
                <span>Analyze Google SERP</span>
              </>
            )}
          </button>
        </div>

        {warningMsg && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-3 rounded-xl flex gap-2 text-xs">
            <AlertCircle size={15} className="text-amber-400 shrink-0 mt-0.5" />
            <span>{warningMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-3 rounded-xl flex gap-2 text-xs">
            <AlertCircle size={15} className="text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Main SERP Analysis Output */}
      {currentSerp ? (
        <div className="glass-card p-6 border border-white/10 rounded-2xl">
          <SERPViewer serp={currentSerp} onSendToWriter={onSendToWriter} />
        </div>
      ) : (
        <div className="bg-[#0f172a]/40 border-2 border-dashed border-white/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[250px]">
          <div className="w-14 h-14 rounded-full bg-white/5 text-[#34d399] flex items-center justify-center mb-4 border border-white/10 shadow-lg">
            <Globe size={22} className="animate-pulse" />
          </div>
          <h4 className="font-display font-bold text-slate-200 text-sm">
            Awaiting Search Intel
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
            Enter a keyword above to inspect the top 10 ranking competitor
            domains on Google Ireland. Discover thematic opportunities and get
            instant article outlines.
          </p>
        </div>
      )}
    </div>
  );
}
