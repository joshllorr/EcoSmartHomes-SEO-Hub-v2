import { useState, useEffect } from 'react';
import {
  Sun,
  Flame,
  FileText,
  MapPin,
  ArrowLeft,
  Copy,
  Check,
  TrendingDown,
  ExternalLink,
  ShieldCheck,
  Award,
  Zap,
  Clock,
  Sparkles,
  BarChart3,
  Percent,
} from 'lucide-react';

interface TargetAssetPageProps {
  initialSlug?: string;
  onNavigateToTab?: (tab: string) => void;
  onBack?: () => void;
}

export default function TargetAssetPage({
  initialSlug,
  onNavigateToTab,
  onBack,
}: TargetAssetPageProps) {
  const [currentSlug, setCurrentSlug] = useState<string>(
    initialSlug || 'solar-pv-payback-estimator',
  );
  const [copied, setCopied] = useState(false);

  // Solar Calculator State
  const [systemKw, setSystemKw] = useState(4.3);
  const [hasBattery, setHasBattery] = useState(true);
  const [tariff, setTariff] = useState(0.38);
  const [cegRate, setCegRate] = useState(0.24);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace(/^#\/?/, '');
      const path = window.location.pathname.replace(/^\//, '');
      const slug = hash || path || initialSlug || 'solar-pv-payback-estimator';

      if (slug.includes('solar-pv')) {
        setCurrentSlug('solar-pv-payback-estimator');
      } else if (slug.includes('limerick-v94')) {
        setCurrentSlug('limerick-v94-retrofit-grants');
      } else if (slug.includes('ber-rating')) {
        setCurrentSlug('ber-rating-upgrade-guide');
      } else if (slug.includes('heat-pump')) {
        setCurrentSlug('heat-pump-cost-calculator');
      } else if (initialSlug) {
        setCurrentSlug(initialSlug);
      }
    }
  }, [initialSlug]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/#/${currentSlug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Solar Calculations
  const annualKwh = Math.round(systemKw * 950);
  const selfConsumptionPct = hasBattery ? 0.72 : 0.45;
  const selfConsumedKwh = Math.round(annualKwh * selfConsumptionPct);
  const exportedKwh = annualKwh - selfConsumedKwh;

  const billSavings = Math.round(selfConsumedKwh * tariff);
  const cegRevenue = Math.round(exportedKwh * cegRate);
  const totalAnnualBenefit = billSavings + cegRevenue;

  const baseSystemCost = Math.round(systemKw * 1350);
  const batteryCost = hasBattery ? 2400 : 0;
  const grossCost = baseSystemCost + batteryCost;
  const seaiGrant = 1800;
  const netInvestment = Math.max(grossCost - seaiGrant, 0);
  const paybackYears = (netInvestment / totalAnnualBenefit).toFixed(1);
  const twentyFiveYearBenefit = Math.round(
    totalAnnualBenefit * 25 - netInvestment,
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-left py-4 px-2 sm:px-4">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0f172a]/70 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (onBack) onBack();
              else if (onNavigateToTab) onNavigateToTab('link_builder');
              else if (typeof window !== 'undefined')
                window.location.hash = '#/dashboard';
            }}
            className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl border border-white/10 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Link Builder</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Asset Preview:</span>
            <span className="text-[#34d399] font-bold">/{currentSlug}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick tab switchers for demo */}
          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 text-[11px] font-mono">
            <button
              onClick={() => setCurrentSlug('solar-pv-payback-estimator')}
              className={`px-2.5 py-1 rounded-lg transition ${
                currentSlug === 'solar-pv-payback-estimator'
                  ? 'bg-[#34d399]/20 text-[#34d399] font-bold border border-[#34d399]/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Solar PV
            </button>
            <button
              onClick={() => setCurrentSlug('limerick-v94-retrofit-grants')}
              className={`px-2.5 py-1 rounded-lg transition ${
                currentSlug === 'limerick-v94-retrofit-grants'
                  ? 'bg-[#34d399]/20 text-[#34d399] font-bold border border-[#34d399]/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Limerick V94
            </button>
            <button
              onClick={() => setCurrentSlug('ber-rating-upgrade-guide')}
              className={`px-2.5 py-1 rounded-lg transition ${
                currentSlug === 'ber-rating-upgrade-guide'
                  ? 'bg-[#34d399]/20 text-[#34d399] font-bold border border-[#34d399]/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              BER Guide
            </button>
            <button
              onClick={() => setCurrentSlug('heat-pump-cost-calculator')}
              className={`px-2.5 py-1 rounded-lg transition ${
                currentSlug === 'heat-pump-cost-calculator'
                  ? 'bg-[#34d399]/20 text-[#34d399] font-bold border border-[#34d399]/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Heat Pump
            </button>
          </div>

          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 bg-[#34d399] hover:bg-[#2bc48d] text-[#0f172a] text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer font-mono shrink-0 shadow-lg shadow-[#34d399]/20"
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            <span>{copied ? 'Copied Link!' : 'Share Public Link'}</span>
          </button>
        </div>
      </div>

      {/* -------------------- ASSET 1: SOLAR PV PAYBACK ESTIMATOR -------------------- */}
      {currentSlug === 'solar-pv-payback-estimator' && (
        <div className="space-y-6">
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 bg-[#0f172a]/60 space-y-4 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-[10px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Sun size={12} />
                <span>
                  SEAI 2026 Solar PV Grant & Clean Export Guarantee (CEG) Ready
                </span>
              </span>

              <span className="text-xs text-slate-400 font-mono">
                Matched Publisher:{' '}
                <strong className="text-white">selfbuild.ie</strong> (DA 52 ·
                89% Match)
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl font-display font-extrabold text-white tracking-tight">
              Irish Solar PV & Battery Payback Estimator
            </h1>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Calculate your exact return on investment, SEAI domestic grant
              draw-down, and Clean Export Guarantee (CEG) feed-in revenues based
              on real Irish solar irradiance and wholesale microgeneration
              tariffs.
            </p>

            {/* Interactive Calculator Controls Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-white/10">
              <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-2">
                <label className="text-[11px] font-mono text-slate-400 block font-semibold">
                  Array Size: {systemKw.toFixed(1)} kWp (
                  {Math.round(systemKw / 0.43)} Panels)
                </label>
                <input
                  type="range"
                  min="2.0"
                  max="8.0"
                  step="0.4"
                  value={systemKw}
                  onChange={(e) => setSystemKw(parseFloat(e.target.value))}
                  className="w-full accent-[#34d399] cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block">
                  Typical 3-bed: 4.3 kWp
                </span>
              </div>

              <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-2">
                <label className="text-[11px] font-mono text-slate-400 block font-semibold">
                  5 kWh Battery Storage
                </label>
                <button
                  onClick={() => setHasBattery(!hasBattery)}
                  className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    hasBattery
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                  }`}
                >
                  <Zap size={13} />
                  <span>
                    {hasBattery
                      ? 'Included (+72% Self-Use)'
                      : 'No Battery (45% Self-Use)'}
                  </span>
                </button>
                <span className="text-[10px] text-slate-500 block">
                  Stores daytime solar for night
                </span>
              </div>

              <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-2">
                <label className="text-[11px] font-mono text-slate-400 block font-semibold">
                  Grid Import Tariff: €{tariff.toFixed(2)}/kWh
                </label>
                <input
                  type="range"
                  min="0.25"
                  max="0.45"
                  step="0.01"
                  value={tariff}
                  onChange={(e) => setTariff(parseFloat(e.target.value))}
                  className="w-full accent-[#34d399] cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block">
                  Irish average day rate: €0.38
                </span>
              </div>

              <div className="bg-black/30 p-4 rounded-2xl border border-white/5 space-y-2">
                <label className="text-[11px] font-mono text-slate-400 block font-semibold">
                  CEG Export Rate: €{cegRate.toFixed(2)}/kWh
                </label>
                <input
                  type="range"
                  min="0.15"
                  max="0.30"
                  step="0.01"
                  value={cegRate}
                  onChange={(e) => setCegRate(parseFloat(e.target.value))}
                  className="w-full accent-[#34d399] cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block">
                  Bord Gáis / Electric Ireland CEG
                </span>
              </div>
            </div>

            {/* Calculated KPI Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="bg-[#34d399]/10 border border-[#34d399]/30 p-4 rounded-2xl">
                <span className="text-[10px] font-mono font-bold text-[#34d399] uppercase block">
                  Annual Savings & Income
                </span>
                <span className="text-2xl md:text-3xl font-bold text-white mt-1 block">
                  €{totalAnnualBenefit.toLocaleString()}
                  <span className="text-xs text-slate-400 font-normal">
                    {' '}
                    / year
                  </span>
                </span>
                <span className="text-[10px] text-emerald-300 font-mono mt-1 block">
                  (€{billSavings} bills + €{cegRevenue} CEG)
                </span>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                  SEAI Grant Deducted
                </span>
                <span className="text-2xl md:text-3xl font-bold text-emerald-400 mt-1 block">
                  -€{seaiGrant.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                  Max domestic threshold
                </span>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">
                  Net Investment
                </span>
                <span className="text-2xl md:text-3xl font-bold text-white mt-1 block">
                  €{netInvestment.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                  Gross €{grossCost.toLocaleString()}
                </span>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-2xl">
                <span className="text-[10px] font-mono font-bold text-purple-300 uppercase block">
                  Estimated Payback
                </span>
                <span className="text-2xl md:text-3xl font-bold text-purple-200 mt-1 block">
                  {paybackYears} Years
                </span>
                <span className="text-[10px] text-purple-300/80 font-mono mt-1 block">
                  25-Yr Net: +€{twentyFiveYearBenefit.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Pitch & Embed Action Box */}
            <div className="bg-black/40 p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                  Editorial Outreach Angle for Self Build Magazine
                </span>
                <p className="text-xs text-slate-200">
                  Embeddable interactive tool ready for Irish building
                  journalists & home extension bloggers.
                </p>
              </div>

              <button
                onClick={() => {
                  if (onNavigateToTab) onNavigateToTab('estimator');
                  else if (typeof window !== 'undefined')
                    window.location.hash = '#/estimator';
                }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 border border-white/15"
              >
                <Sparkles size={13} className="text-[#34d399]" />
                <span>Launch in Energy Estimator</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- ASSET 2: LIMERICK V94 RETROFIT GRANTS -------------------- */}
      {currentSlug === 'limerick-v94-retrofit-grants' && (
        <div className="space-y-6">
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 bg-[#0f172a]/60 space-y-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-[10px] font-mono font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <MapPin size={12} />
                <span>Regional SEAI Intelligence & V94 Eircode Breakdown</span>
              </span>

              <span className="text-xs text-slate-400 font-mono">
                Matched Publisher:{' '}
                <strong className="text-white">limerickleader.ie</strong> (DA 61
                · 85% Match)
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl font-display font-extrabold text-white tracking-tight">
              Limerick V94 Residential Energy Retrofit Grants & Community Impact
              Audit
            </h1>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Analysis of SEAI retrofit grant drawdowns across Raheen,
              Castletroy, Dooradoyle, Annacotty, and the Dock Road trade
              corridor under the 2026 National Retrofit Plan.
            </p>

            {/* Local Stats Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-black/30 p-5 rounded-2xl border border-white/5 space-y-2">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <MapPin size={14} className="text-[#34d399]" />
                  Raheen & Dooradoyle (V94 2...)
                </span>
                <p className="text-2xl font-extrabold text-[#34d399]">
                  42% Bill Cut
                </p>
                <p className="text-xs text-slate-400 leading-normal">
                  Average post-retrofit energy expenditure reduction across
                  1970s–1990s cavity wall semi-detached houses.
                </p>
              </div>

              <div className="bg-black/30 p-5 rounded-2xl border border-white/5 space-y-2">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <MapPin size={14} className="text-[#34d399]" />
                  Castletroy & Annacotty (V94 3...)
                </span>
                <p className="text-2xl font-extrabold text-blue-400">
                  €12,500 Subsidies
                </p>
                <p className="text-xs text-slate-400 leading-normal">
                  Highest regional heat pump grant draw-downs paired with solar
                  PV microgeneration grid exports.
                </p>
              </div>

              <div className="bg-black/30 p-5 rounded-2xl border border-white/5 space-y-2">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <MapPin size={14} className="text-[#34d399]" />
                  Dock Road Trade Depot Link
                </span>
                <p className="text-2xl font-extrabold text-purple-300">
                  48-Hr Delivery
                </p>
                <p className="text-xs text-slate-400 leading-normal">
                  Local trade supply hub supplying NSAI-certified silver bead,
                  insulation boards, and heat pump manifolds.
                </p>
              </div>
            </div>

            {/* Grant Schedule Table */}
            <div className="bg-black/40 rounded-2xl border border-white/10 p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                2026 SEAI Domestic Grant Rates for Limerick Property Owners
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-[#0f172a]/90 p-3 rounded-xl border border-white/5">
                  <span className="text-slate-400 block text-[10px]">
                    Air-to-Water Heat Pump
                  </span>
                  <span className="text-lg font-bold text-[#34d399]">
                    €12,500
                  </span>
                </div>
                <div className="bg-[#0f172a]/90 p-3 rounded-xl border border-white/5">
                  <span className="text-slate-400 block text-[10px]">
                    External Wall Insulation
                  </span>
                  <span className="text-lg font-bold text-white">€8,000</span>
                </div>
                <div className="bg-[#0f172a]/90 p-3 rounded-xl border border-white/5">
                  <span className="text-slate-400 block text-[10px]">
                    Attic Insulation
                  </span>
                  <span className="text-lg font-bold text-white">€2,000</span>
                </div>
                <div className="bg-[#0f172a]/90 p-3 rounded-xl border border-white/5">
                  <span className="text-slate-400 block text-[10px]">
                    One Stop Shop Max
                  </span>
                  <span className="text-lg font-bold text-purple-400">
                    €50,000
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  if (onNavigateToTab) onNavigateToTab('regional_moat');
                  else if (typeof window !== 'undefined')
                    window.location.hash = '#/regional-moat';
                }}
                className="px-5 py-2.5 bg-[#34d399] hover:bg-[#2bc48d] text-[#0f172a] rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-[#34d399]/20"
              >
                <Sparkles size={14} />
                <span>Open in Regional Moat Engine</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- ASSET 3: BER RATING UPGRADE GUIDE -------------------- */}
      {currentSlug === 'ber-rating-upgrade-guide' && (
        <div className="space-y-6">
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 bg-[#0f172a]/60 space-y-5 shadow-2xl relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Award size={12} />
                <span>NSAI SR:54 & 8-Tier Modernized BER Scale Guide</span>
              </span>

              <span className="text-xs text-slate-400 font-mono">
                Matched Publisher:{' '}
                <strong className="text-white">constructireland.ie</strong> (DA
                58 · 96% Match)
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl font-display font-extrabold text-white tracking-tight">
              The Ultimate 2026 Irish Home Retrofit & BER Upgrade Masterguide
            </h1>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              A comprehensive technical and practical blueprint for upgrading
              older Irish properties from G/F/E to an A0 or B2 standard,
              qualifying for discounted green mortgages and up to €50,000 in
              SEAI support.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black/30 p-5 rounded-2xl border border-white/5 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  The Modernized 8-Tier Scale
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center p-2 rounded-lg bg-[#34d399]/15 border border-[#34d399]/30">
                    <span className="font-bold text-[#34d399]">
                      Tier A0 & A
                    </span>
                    <span className="text-slate-300">
                      &lt; 75 kWh/m²/yr (Net Zero / nZEB)
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="font-bold text-emerald-300">
                      Tier B (B2)
                    </span>
                    <span className="text-slate-300">
                      National Retrofit Target & Green Mortgages
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <span className="font-bold text-amber-300">Tier C & D</span>
                    <span className="text-slate-300">
                      Prime candidates for Heat Pumps & EWI
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                    <span className="font-bold text-red-300">Tier E, F, G</span>
                    <span className="text-slate-300">
                      High priority for Fully Funded Retrofits
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-black/30 p-5 rounded-2xl border border-white/5 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Financial & Grant Returns
                </h4>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-start gap-2">
                    <Percent
                      size={14}
                      className="text-[#34d399] shrink-0 mt-0.5"
                    />
                    <span>
                      <strong>Green Mortgage APR Discount:</strong> 0.25% to
                      0.35% lower rate upon achieving B2.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <TrendingDown
                      size={14}
                      className="text-[#34d399] shrink-0 mt-0.5"
                    />
                    <span>
                      <strong>Heating Bill Cut:</strong> Typical 3-bed home
                      saves €1,800 to €2,400 annually.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ShieldCheck
                      size={14}
                      className="text-[#34d399] shrink-0 mt-0.5"
                    />
                    <span>
                      <strong>Technical Assessment Support:</strong> €350 grant
                      covering pre-works advisory audit.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  if (onNavigateToTab) onNavigateToTab('writer');
                  else if (typeof window !== 'undefined')
                    window.location.hash = '#/writer';
                }}
                className="px-5 py-2.5 bg-[#34d399] hover:bg-[#2bc48d] text-[#0f172a] rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-[#34d399]/20"
              >
                <Sparkles size={14} />
                <span>Open in AI Content Writer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- ASSET 4: HEAT PUMP COST CALCULATOR -------------------- */}
      {currentSlug === 'heat-pump-cost-calculator' && (
        <div className="space-y-6">
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 bg-[#0f172a]/60 space-y-5 shadow-2xl relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Flame size={12} />
                <span>10-Year Lifecycle Cost & SCOP Comparison Model</span>
              </span>

              <span className="text-xs text-slate-400 font-mono">
                Matched Publisher:{' '}
                <strong className="text-white">
                  energyperformancedatabase.ie
                </strong>{' '}
                (DA 64 · 92% Match)
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl font-display font-extrabold text-white tracking-tight">
              Heat Pump vs Gas/Oil Boiler 10-Year Running Cost Calculator
            </h1>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Comparing fuel cost volatility, seasonal coefficient of
              performance (SCOP 4.0), and 10-year cumulative expenditures
              between kerosene oil, natural gas, and air-to-water heat pumps in
              Ireland.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-black/30 p-5 rounded-2xl border border-red-500/20 space-y-2">
                <span className="text-xs font-bold text-red-400">
                  Kerosene Oil Boiler (80% Eff.)
                </span>
                <p className="text-2xl font-bold text-white">
                  €2,380<span className="text-xs text-slate-400"> / yr</span>
                </p>
                <p className="text-xs text-slate-400">
                  10-Year Fuel Cost: €23,800 + €2,400 servicing
                </p>
                <span className="text-[10px] text-red-400 font-mono block">
                  5.2 tonnes CO2/yr
                </span>
              </div>

              <div className="bg-black/30 p-5 rounded-2xl border border-amber-500/20 space-y-2">
                <span className="text-xs font-bold text-amber-400">
                  Gas Boiler (85% Eff.)
                </span>
                <p className="text-2xl font-bold text-white">
                  €2,100<span className="text-xs text-slate-400"> / yr</span>
                </p>
                <p className="text-xs text-slate-400">
                  10-Year Fuel Cost: €21,000 + €1,800 servicing
                </p>
                <span className="text-[10px] text-amber-400 font-mono block">
                  4.1 tonnes CO2/yr
                </span>
              </div>

              <div className="bg-[#34d399]/10 p-5 rounded-2xl border border-[#34d399]/30 space-y-2">
                <span className="text-xs font-bold text-[#34d399]">
                  Air-to-Water Heat Pump (SCOP 4.0)
                </span>
                <p className="text-2xl font-bold text-white">
                  €840<span className="text-xs text-slate-400"> / yr</span>
                </p>
                <p className="text-xs text-[#34d399] font-semibold">
                  10-Year Fuel Savings: €15,400+
                </p>
                <span className="text-[10px] text-emerald-400 font-mono block">
                  0.9 tonnes CO2/yr (-82%)
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  if (onNavigateToTab) onNavigateToTab('estimator');
                  else if (typeof window !== 'undefined')
                    window.location.hash = '#/estimator';
                }}
                className="px-5 py-2.5 bg-[#34d399] hover:bg-[#2bc48d] text-[#0f172a] rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-[#34d399]/20"
              >
                <Sparkles size={14} />
                <span>Open in Energy Estimator</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
