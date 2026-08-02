import {
  Globe,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Settings,
} from 'lucide-react';
import { useState } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';

interface SiteHealthCardProps {
  status: 'failed' | 'success' | 'running';
  error: string | null;
  onRetryScan: (sitemapPath?: string) => void;
}

export default function SiteHealthCard({
  status,
  error,
  onRetryScan,
}: SiteHealthCardProps) {
  const targetDomain = useDashboardStore((s) => s.targetDomain);
  const [loading, setLoading] = useState(false);
  const [sitemapInput, setSitemapInput] = useState('');
  const [showPathInput, setShowPathInput] = useState(false);

  const triggerScan = (path?: string) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onRetryScan(path);
    }, 1500);
  };

  const isFailed = status === 'failed';
  const isSuccess = status === 'success';

  return (
    <div
      className={`glass-card p-6 flex flex-col gap-5 transition-all ${
        isFailed
          ? 'border-rose-500/30'
          : isSuccess
            ? 'border-emerald-500/30'
            : 'border-white/10'
      }`}
      id="site-health-card"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl shrink-0 ${
              isFailed
                ? 'bg-rose-500/15 text-rose-400'
                : isSuccess
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-white/10 text-slate-300'
            }`}
          >
            <Globe size={18} />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs uppercase font-mono text-slate-400 font-bold">
              Diagnostics
            </span>
            <h3 className="text-sm font-semibold text-white">
              Site Health & Crawl Scan
            </h3>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
            isFailed
              ? 'bg-rose-500/20 text-rose-300'
              : isSuccess
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-amber-500/20 text-amber-300'
          }`}
        >
          {status}
        </span>
      </div>

      {isFailed ? (
        <div className="bg-rose-950/20 rounded-xl p-4 border border-rose-500/20 flex gap-3 text-left">
          <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-xs font-semibold text-rose-300">
              Sitemap Discovery Error
            </div>
            <p className="text-[11px] text-rose-400 mt-1 leading-relaxed">
              {error ||
                `Could not find a sitemap in standard locations for https://${targetDomain}.`}
            </p>
            <p className="text-[10px] text-slate-400 mt-2 leading-normal">
              Search engines and AI crawlers cannot index your content without a
              sitemap reference. Try pointing Harbor to a custom path.
            </p>
          </div>
        </div>
      ) : isSuccess ? (
        <div className="bg-emerald-950/20 rounded-xl p-4 border border-emerald-500/20 flex gap-3 text-left">
          <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-xs font-semibold text-emerald-300">
              Crawl Success: Sitemap Found
            </div>
            <p className="text-[11px] text-emerald-400 mt-1 leading-relaxed">
              Your sitemap was correctly identified. All focus pages and active
              pillars are accessible for Google and AI Answer Indexers.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-6 text-slate-400 gap-2">
          <RefreshCw size={16} className="animate-spin text-[#34d399]" />
          <span className="text-xs font-medium">
            Analyzing URL sitemap nodes...
          </span>
        </div>
      )}

      {/* Manual XML input for fixing */}
      {isFailed && !loading && (
        <div className="space-y-3">
          {!showPathInput ? (
            <button
              onClick={() => setShowPathInput(true)}
              className="text-[11px] text-slate-400 hover:text-white transition text-left flex items-center gap-1.5 underline cursor-pointer"
            >
              <Settings size={12} />
              <span>Provide manual sitemap path</span>
            </button>
          ) : (
            <div className="flex gap-2 animate-in slide-in-from-top-1 duration-200">
              <input
                type="text"
                value={sitemapInput}
                onChange={(e) => setSitemapInput(e.target.value)}
                placeholder="/sitemap.xml"
                className="flex-1 px-3 py-1.5 rounded-lg border border-white/10 bg-black/30 text-xs focus:ring-1 focus:ring-[#34d399] outline-hidden font-mono text-white"
              />
              <button
                onClick={() => triggerScan(sitemapInput)}
                className="bg-white hover:bg-slate-100 text-[#0f172a] px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 cursor-pointer"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      )}

      {/* Scan Button */}
      {!loading && (
        <button
          onClick={() => triggerScan(sitemapInput || undefined)}
          className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
            isFailed
              ? 'bg-rose-600 hover:bg-rose-700 text-white'
              : 'bg-white/10 hover:bg-white/15 text-white'
          }`}
          id="retry-scan-button"
        >
          <RefreshCw size={12} />
          <span>{isFailed ? 'Retry Crawl Scan' : 'Run Diagnostics Check'}</span>
        </button>
      )}

      {loading && (
        <button
          disabled
          className="w-full py-2 bg-white/5 text-slate-500 rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
        >
          <RefreshCw size={12} className="animate-spin text-[#34d399]" />
          <span>Scanning URL...</span>
        </button>
      )}
    </div>
  );
}
