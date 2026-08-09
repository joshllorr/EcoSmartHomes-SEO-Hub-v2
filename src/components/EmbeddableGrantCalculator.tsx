/**
 * src/components/EmbeddableGrantCalculator.tsx
 *
 * Embeddable SEAI Grant & Payback Calculator Widget
 * Interactive widget for partner installers with built-in referral link attribution.
 */

import { useState } from 'react';
import { Calculator, Copy, Check, Code, ExternalLink, Zap } from 'lucide-react';

export default function EmbeddableGrantCalculator() {
  const [propertyType, setPropertyType] = useState<
    'detached' | 'semi' | 'apartment'
  >('semi');
  const [hasHeatPump, setHasHeatPump] = useState(true);
  const [hasSolar, setHasSolar] = useState(true);
  const [hasInsulation, setHasInsulation] = useState(true);
  const [hasWindows, setHasWindows] = useState(false);
  const [isOssDeepRetrofit, setIsOssDeepRetrofit] = useState(false);
  const [copied, setCopied] = useState(false);

  // Grant values based on Budget 2026 SEAI scheme (€558M allocation)
  const heatPumpGrant = hasHeatPump ? 12500 : 0;
  const solarGrant = hasSolar ? 1800 : 0;
  const insulationGrant = hasInsulation ? 2000 : 0;
  const windowsGrant = hasWindows ? 4000 : 0;
  const rawGrantSum =
    heatPumpGrant + solarGrant + insulationGrant + windowsGrant;
  const totalGrant = isOssDeepRetrofit
    ? Math.min(50000, Math.round(rawGrantSum * 1.5))
    : rawGrantSum;
  const estimatedSavingsAnnual = Math.round(totalGrant * 0.18);

  const embedCode = `<iframe src="https://ecosmarthomes.ie/widgets/grant-calculator" width="100%" height="450" frameborder="0" title="EcoSmartHomes SEAI Grant Calculator 2026"></iframe>\n<p><a href="https://ecosmarthomes.ie/seai-home-energy-upgrade-grants-2026">Powered by EcoSmartHomes SEAI 2026 Grant Calculator</a></p>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="glass-card p-6 flex flex-col gap-5 text-left border border-emerald-500/20 rounded-2xl bg-slate-900/80 shadow-[0_0_20px_rgba(52,211,153,0.15)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <Calculator size={20} />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold tracking-wider">
              Viral Backlink Engine · Budget 2026 SEAI Scheme (€558M)
            </span>
            <h3 className="text-sm font-bold text-white">
              Embeddable SEAI 2026 Grant Calculator (New BER A0–G)
            </h3>
          </div>
        </div>
        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full">
          ⚡ 1-Click Embed Snippet
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Interactive Controls */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10 flex flex-col gap-3">
          <label className="text-xs font-bold text-slate-300 block">
            Select 2026 Home Energy Upgrades:
          </label>

          <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={hasHeatPump}
              onChange={(e) => setHasHeatPump(e.target.checked)}
              className="rounded accent-emerald-500"
            />
            <span>Heat Pump System (up to €12,500 SEAI Grant)</span>
          </label>

          <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={hasSolar}
              onChange={(e) => setHasSolar(e.target.checked)}
              className="rounded accent-emerald-500"
            />
            <span>Solar PV Panels (€1,800 SEAI Grant)</span>
          </label>

          <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={hasInsulation}
              onChange={(e) => setHasInsulation(e.target.checked)}
              className="rounded accent-emerald-500"
            />
            <span>Attic (€2,000) & External Wall (€8,000) Insulation</span>
          </label>

          <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={hasWindows}
              onChange={(e) => setHasWindows(e.target.checked)}
              className="rounded accent-emerald-500"
            />
            <span>Standalone Windows Upgrade (up to €4,000)</span>
          </label>

          <label className="flex items-center gap-2 text-xs text-amber-300 font-medium cursor-pointer pt-1 border-t border-white/10">
            <input
              type="checkbox"
              checked={isOssDeepRetrofit}
              onChange={(e) => setIsOssDeepRetrofit(e.target.checked)}
              className="rounded accent-amber-500"
            />
            <span>One Stop Shop (OSS) Deep Retrofit (up to €50,000 cap)</span>
          </label>

          <div className="pt-2 border-t border-white/10 flex justify-between items-center">
            <span className="text-xs text-slate-400 font-medium">
              Estimated 2026 Grant Support:
            </span>
            <span className="text-xl font-bold font-mono text-emerald-400">
              €{totalGrant.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Copy Embed Snippet */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10 flex flex-col justify-between gap-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                <Code size={14} /> Iframe Backlink Embed Code
              </span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1"
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Copied!' : 'Copy Embed'}
              </button>
            </div>
            <pre className="mt-2 p-2 bg-slate-900 text-[10px] font-mono text-slate-400 rounded-lg overflow-x-auto border border-white/5 whitespace-pre-wrap">
              {embedCode}
            </pre>
          </div>
          <p className="text-[10px] text-slate-400 font-italic">
            💡 Share this widget with partner contractors to gain contextual
            Dofollow backlinks.
          </p>
        </div>
      </div>
    </div>
  );
}
