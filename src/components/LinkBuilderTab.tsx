import { useState } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';
import {
  Link2,
  Sparkles,
  Search,
  Globe,
  Zap,
  ArrowRight,
  Check,
  Copy,
  Layers,
  ExternalLink,
  Trophy,
  AlertCircle,
  RefreshCw,
  Mail,
  Code2,
  BarChart3,
  FileText,
  CheckCircle2,
  Compass,
  ShieldCheck,
  Building2,
  Bookmark,
  Share2,
} from 'lucide-react';

interface PillarPageIdea {
  id: string;
  title: string;
  summary: string;
  targetQuery: string;
  estimatedVolume: string;
  authorityScore: number;
  difficulty?: string;
  difficultyScore?: number;
  subtopicClusters: string[];
  linkBaitAngle?: string;
}

interface LinkOpportunity {
  id: string;
  domain: string;
  domainAuthority: number;
  matchScore: string;
  targetPage: string;
  relevanceType: string;
  contactPerson?: string;
  outreachAngle: string;
  suggestedPitch: string;
  status: 'Uncontacted' | 'Pitch Sent' | 'Connected';
}

interface LinkBaitAsset {
  id: string;
  title: string;
  type: string;
  summary: string;
  whyItAttractsLinks: string;
  targetBacklinkSources: string[];
  estimatedBacklinkPotential: string;
  embedSnippet: string;
  keyFeatures?: string[];
}

interface LinkBuilderTabProps {
  site: string;
  onOpenInWriter: (suggestion: string) => void;
  onXPUnlock?: (amount: number) => void;
}

export default function LinkBuilderTab({
  site,
  onOpenInWriter,
  onXPUnlock,
}: LinkBuilderTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<
    'linker' | 'pillar_pages' | 'link_bait'
  >('linker');

  // Website URL state for Pillar Page / Outreach audit
  const [pillarTopic, setPillarTopic] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState(
    `https://${site.replace(/^https?:\/\//i, '')}/`,
  );
  const [previousSites] = useState<string[]>([
    site.replace(/^https?:\/\//i, ''),
    'ecosmarthomes.ie',
    'retrofit-limerick.ie',
  ]);

  // Loading & Notifications State
  const [loadingPillars, setLoadingPillars] = useState(false);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [loadingBait, setLoadingBait] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  // Link Opportunities State
  const [opportunities, setOpportunities] = useState<LinkOpportunity[]>([
    {
      id: 'link-op-1',
      domain: 'constructireland.ie',
      domainAuthority: 58,
      matchScore: '96%',
      targetPage: `https://${site}/ber-rating-upgrade-guide`,
      relevanceType: 'Irish Construction & Sustainable Building Portal',
      contactPerson: 'Editorial Team (info@constructireland.ie)',
      outreachAngle: 'Resource Page Link',
      suggestedPitch:
        'Hi Editors, noticed your round-up of Irish retrofitting standards. We published an interactive 2026 SEAI grant breakdown and BER rating calculator for homeowners. Thought it would be a valuable addition to your contractor resource guide.',
      status: 'Uncontacted',
    },
    {
      id: 'link-op-2',
      domain: 'energyperformancedatabase.ie',
      domainAuthority: 64,
      matchScore: '92%',
      targetPage: `https://${site}/heat-pump-cost-calculator`,
      relevanceType: 'BER & Energy Advisory Directory',
      contactPerson: "Seán O'Connor (editor@energyperformancedatabase.ie)",
      outreachAngle: 'Guest Expert / Data Reference',
      suggestedPitch:
        'Hi Seán, loved your recent article on heat pump COP ratings in Irish climates. We released a comprehensive 10-year running cost comparison model between gas boilers and air-to-water heat pumps. Would love to contribute dynamic data points or be referenced.',
      status: 'Uncontacted',
    },
    {
      id: 'link-op-3',
      domain: 'selfbuild.ie',
      domainAuthority: 52,
      matchScore: '89%',
      targetPage: `https://${site}/solar-pv-payback-estimator`,
      relevanceType: 'Self Build & Home Extension Magazine',
      contactPerson: 'Ruth Brennan (features@selfbuild.ie)',
      outreachAngle: 'Calculators & Tools Showcase',
      suggestedPitch:
        'Hi Ruth, your readers often ask about battery storage ROI with solar PV installations in Ireland. We built an interactive payback calculator with live CEG feed-in rates. Would your editorial team consider linking it as an practical tool for home builders?',
      status: 'Uncontacted',
    },
    {
      id: 'link-op-4',
      domain: 'limerickleader.ie',
      domainAuthority: 61,
      matchScore: '85%',
      targetPage: `https://${site}/limerick-v94-retrofit-grants`,
      relevanceType: 'Regional News & Mid-West Property Section',
      contactPerson: 'Property Desk (news@limerickleader.ie)',
      outreachAngle: 'Local V94 Eircode News & Community Impact',
      suggestedPitch:
        'Hi Property Desk, we analyzed SEAI grant uptake across Limerick postcodes (Raheen, Castletroy, Dooradoyle). The data shows V94 homeowners cut energy bills by 42% after deep retrofits. Happy to provide localized infographics for a regional feature.',
      status: 'Uncontacted',
    },
  ]);

  // Pillar Page Ideas State
  const [pillars, setPillars] = useState<PillarPageIdea[]>([
    {
      id: 'pillar-init-1',
      title: 'The Ultimate 2026 Irish Home Retrofit & BER Rating Upgrade Bible',
      summary:
        'A 5,000-word authoritative master guide detailing the exact sequence for upgrading home energy ratings from G to A2, SEAI grant claiming rules, heat pump integration, and airtightness standards.',
      targetQuery: 'complete home retrofit guide ireland',
      estimatedVolume: '18.5K/mo',
      authorityScore: 98,
      difficulty: 'MEDIUM',
      difficultyScore: 48,
      subtopicClusters: [
        'SEAI One-Stop-Shop vs Individual Contractor Grants',
        'Heat Pump Installation & Radiator Sizing Checklist',
        'External Wall Insulation (EWI) vs Cavity Pumping',
        'Attic & Roof Insulation Airtightness Membranes',
      ],
      linkBaitAngle:
        'Includes interactive BER letter improvement score calculator & grant payout sequence flowchart.',
    },
    {
      id: 'pillar-init-2',
      title: 'Heat Pump vs Gas Boiler Life-Cycle Cost & ROI Masterclass',
      summary:
        'A comprehensive financial and technical breakdown comparing air-to-water heat pump operating costs against natural gas and kerosene boilers in Irish homes under 2026 carbon tax levels.',
      targetQuery: 'heat pump vs gas boiler cost ireland',
      estimatedVolume: '12.2K/mo',
      authorityScore: 94,
      difficulty: 'LOW',
      difficultyScore: 32,
      subtopicClusters: [
        'Smart Meter Night-Rate Tariff Savings with Heat Pumps',
        'SEAI Heat Pump Grant (€12,500) Application Rules',
        'Coefficient of Performance (COP) in Irish Winter Temps',
        'Underfloor Heating vs Low-Temperature Radiator Retrofits',
      ],
      linkBaitAngle:
        'Includes dynamic 10-year running cost simulator and SEAI grant deduction estimator.',
    },
    {
      id: 'pillar-init-3',
      title: 'Solar PV, Battery Storage & Grid Microgeneration Authority Hub',
      summary:
        'Definitive guide to domestic Solar PV sizing, battery storage payback periods, and earning microgeneration feed-in tariffs (CEG) across Irish energy providers.',
      targetQuery: 'solar pv battery storage payback ireland',
      estimatedVolume: '15.4K/mo',
      authorityScore: 91,
      difficulty: 'MEDIUM',
      difficultyScore: 44,
      subtopicClusters: [
        'SEAI Solar PV Grant Sizing Caps (€2,100)',
        'Export Tariff Rates: Electric Ireland vs Bord Gáis vs Energia',
        'Inverter Sizing & Battery Storage Capacity Math',
        'BER Rating Impact of 4kW Solar PV System',
      ],
      linkBaitAngle:
        'Includes live feed-in tariff rate comparison matrix and annual KwH yield map.',
    },
  ]);

  // Link Bait Assets State
  const [baitAssets, setBaitAssets] = useState<LinkBaitAsset[]>([
    {
      id: 'bait-1',
      title: '2026 Irish Home BER Letter Rating Upgrade Calculator',
      type: 'Interactive Calculator',
      summary:
        'An embeddable JS widget that takes home age, current heating system, and insulation level to output projected BER grade (G to A2) and SEAI grant eligibility.',
      whyItAttractsLinks:
        'Home improvement blogs, mortgage advisors (green mortgages), and estate agents link to this calculator to show clients upgrade potentials.',
      targetBacklinkSources: [
        'Irish Property Portals',
        'Green Mortgage Brokers',
        'SEAI Registered Assessors',
      ],
      estimatedBacklinkPotential: '15–25 High-DA Backlinks / Mo',
      embedSnippet: `<iframe src="${websiteUrl}widgets/ber-calculator" width="100%" height="450" frameborder="0"></iframe>`,
      keyFeatures: [
        'Instant SEAI grant calculation',
        'BER letter jump projection',
        'Downloadable PDF report for banks',
      ],
    },
    {
      id: 'bait-2',
      title:
        'SEAI Grant Breakdown & Contractor Compliance Matrix (2026 Edition)',
      type: 'Reference Chart',
      summary:
        'A clean, visual cheat-sheet matrix comparing all 12 SEAI grant categories, maximum payout caps, required insulation values (R-values), and post-works sign-off steps.',
      whyItAttractsLinks:
        'Industry journalists, architects, and energy consultants reference this chart as an authoritative citation in articles.',
      targetBacklinkSources: [
        'Architecture Blogs',
        'Construction Trade Publications',
        'Home Renovator Forums',
      ],
      estimatedBacklinkPotential: '20+ Editorial Citations',
      embedSnippet: `<div class="seai-matrix-embed" data-domain="${site}" data-accent="#34d399"></div>`,
      keyFeatures: [
        'Always updated with SEAI rules',
        'Printable high-res PDF infographic',
        'Embeddable interactive table',
      ],
    },
    {
      id: 'bait-3',
      title: 'Heat Pump vs Kerosene vs Gas Running Cost Simulator',
      type: 'Comparison Tool',
      summary:
        'A dynamic comparison tool comparing monthly fuel costs under legislative carbon tax increases reaching €100/tonne by 2030.',
      whyItAttractsLinks:
        'Financial columnists, sustainability influencers, and climate journalists link to this tool when reporting on energy price inflation.',
      targetBacklinkSources: [
        'National News Outlets',
        'Personal Finance Blogs',
        'Environmental Policy Hubs',
      ],
      estimatedBacklinkPotential: '30+ High-Authority Links',
      embedSnippet: `<iframe src="${websiteUrl}tools/heat-pump-simulator" width="100%" height="520" frameborder="0"></iframe>`,
      keyFeatures: [
        'Carbon tax trajectory modeling',
        'Smart meter night-rate toggles',
        'Side-by-side fuel comparison',
      ],
    },
  ]);

  // Handlers for API calls
  const handleGeneratePillarIdeas = async () => {
    setLoadingPillars(true);
    setWarningMsg(null);
    try {
      const response = await fetch('/api/generatePillarIdeas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: websiteUrl,
          pillarTopic,
          topic: pillarTopic,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to compile pillar page ideas.');
      }

      const data = await response.json();
      const newPillars = data.pillars || data.ideas || [];
      if (newPillars.length > 0) {
        setPillars(newPillars);
        useDashboardStore
          .getState()
          .updateContentGraph({ pillars: newPillars });
        if (data.warning) setWarningMsg(data.warning);
        if (onXPUnlock) onXPUnlock(35); // Reward +35 XP
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingPillars(false);
    }
  };

  const handleScanOpportunities = async () => {
    setLoadingLinks(true);
    setWarningMsg(null);
    try {
      const response = await fetch('/api/seo/link-opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: websiteUrl }),
      });

      if (!response.ok)
        throw new Error('Failed to retrieve link opportunities.');

      const data = await response.json();
      if (data.success && data.opportunities) {
        setOpportunities(data.opportunities);
        if (data.warning) setWarningMsg(data.warning);
        if (onXPUnlock) onXPUnlock(25);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingLinks(false);
    }
  };

  const handleGenerateLinkBait = async (
    baitCategory = 'Interactive Calculators',
  ) => {
    setLoadingBait(true);
    setWarningMsg(null);
    try {
      const response = await fetch('/api/seo/generate-link-bait', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: websiteUrl, baitType: baitCategory }),
      });

      if (!response.ok)
        throw new Error('Failed to generate link bait concepts.');

      const data = await response.json();
      if (data.success && data.assets) {
        setBaitAssets(data.assets);
        if (data.warning) setWarningMsg(data.warning);
        if (onXPUnlock) onXPUnlock(30);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingBait(false);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const toggleOpportunityStatus = (id: string) => {
    setOpportunities((prev) =>
      prev.map((op) => {
        if (op.id === id) {
          const nextStatus =
            op.status === 'Uncontacted'
              ? 'Pitch Sent'
              : op.status === 'Pitch Sent'
                ? 'Connected'
                : 'Uncontacted';
          return { ...op, status: nextStatus };
        }
        return op;
      }),
    );
    if (onXPUnlock) onXPUnlock(15);
  };

  return (
    <div className="space-y-6 text-left" id="link-builder-tab">
      {/* Top Header Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-semibold text-white tracking-tight flex items-center gap-2.5">
            <Link2 className="text-[#34d399]" size={24} />
            <span>Link Builder & Authority Hub</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed max-w-2xl">
            Find backlink opportunities for your content. Harbor scans relevant
            sites, matches them to your best pages, and hands you a warm
            outreach queue.
          </p>
        </div>

        {/* Gamified Linker XP Badge */}
        <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2.5 shrink-0 self-start md:self-auto">
          <Trophy size={14} className="text-[#34d399]" />
          <div className="text-xs">
            <span className="font-bold text-slate-300">Link Outreach XP:</span>{' '}
            <span className="font-mono bg-[#34d399]/20 border border-[#34d399]/30 px-2 py-0.5 rounded font-semibold text-[#34d399]">
              +35 XP / Asset
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <button
          onClick={() => setActiveSubTab('linker')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeSubTab === 'linker'
              ? 'bg-[#34d399] text-[#0f172a] shadow-lg shadow-[#34d399]/20'
              : 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10'
          }`}
        >
          <Link2 size={14} />
          <span>Linker & Outreach Queue</span>
        </button>

        <button
          onClick={() => setActiveSubTab('pillar_pages')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeSubTab === 'pillar_pages'
              ? 'bg-[#34d399] text-[#0f172a] shadow-lg shadow-[#34d399]/20'
              : 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10'
          }`}
        >
          <Layers size={14} />
          <span>Pillar Pages & Hubs</span>
        </button>

        <button
          onClick={() => setActiveSubTab('link_bait')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeSubTab === 'link_bait'
              ? 'bg-[#34d399] text-[#0f172a] shadow-lg shadow-[#34d399]/20'
              : 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10'
          }`}
        >
          <Zap size={14} />
          <span>Link Bait Builder</span>
        </button>
      </div>

      {/* Warning Notification Banner */}
      {warningMsg && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-3 rounded-xl flex gap-2 text-xs">
          <AlertCircle size={15} className="text-amber-400 shrink-0 mt-0.5" />
          <span>{warningMsg}</span>
        </div>
      )}

      {/* ------------------ SUB-TAB 1: LINKER / OUTREACH QUEUE ------------------ */}
      {activeSubTab === 'linker' && (
        <div className="space-y-6">
          {/* Target Website Selector Bar */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Globe size={13} className="text-[#34d399]" />
                  <span>Target Website Domain *</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://ecosmarthomes.ie/"
                    className="flex-1 px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs font-mono text-white focus:ring-2 focus:ring-[#34d399]/20 focus:border-[#34d399] outline-hidden"
                  />
                  <button
                    onClick={handleScanOpportunities}
                    disabled={loadingLinks || !websiteUrl.trim()}
                    className="bg-[#34d399] hover:bg-[#2bc48d] disabled:opacity-50 text-[#0f172a] px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer"
                  >
                    {loadingLinks ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>Scouting Opportunities...</span>
                      </>
                    ) : (
                      <>
                        <Search size={13} />
                        <span>Find Opportunities</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Previous Sites Chips */}
              <div className="space-y-1 self-start md:self-auto">
                <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
                  Previous Sites:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {previousSites.map((domain, i) => (
                    <button
                      key={i}
                      onClick={() => setWebsiteUrl(`https://${domain}/`)}
                      className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                        websiteUrl.includes(domain)
                          ? 'bg-[#34d399]/20 text-[#34d399] border-[#34d399]/40 font-semibold'
                          : 'bg-white/5 text-slate-400 border-white/10 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {domain}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Outreach Queue Cards */}
          <div className="grid grid-cols-1 gap-4">
            {opportunities.map((op) => (
              <div
                key={op.id}
                className="glass-card p-5 border border-white/10 hover:border-white/20 transition-all space-y-4 rounded-2xl bg-[#0f172a]/40"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-[#34d399] flex items-center justify-center font-bold text-sm shrink-0 font-mono">
                      {op.domain.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-white text-sm hover:text-[#34d399] transition cursor-pointer">
                          {op.domain}
                        </h4>
                        <span className="text-[10px] font-mono font-bold bg-[#34d399]/15 text-[#34d399] border border-[#34d399]/30 px-2 py-0.5 rounded">
                          DA {op.domainAuthority}
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded">
                          Match {op.matchScore}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {op.relevanceType}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleOpportunityStatus(op.id)}
                      className={`text-[11px] font-semibold px-3 py-1.5 rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
                        op.status === 'Connected'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : op.status === 'Pitch Sent'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <CheckCircle2 size={12} />
                      <span>Status: {op.status}</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1 bg-black/30 p-3 rounded-xl border border-white/5">
                    <span className="text-slate-400 font-mono text-[10px] uppercase font-bold block">
                      Target Page on Your Site
                    </span>
                    <a
                      href={op.targetPage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#34d399] hover:underline font-mono truncate block flex items-center gap-1"
                    >
                      <span>{op.targetPage}</span>
                      <ExternalLink size={11} className="shrink-0" />
                    </a>
                  </div>

                  <div className="space-y-1 bg-black/30 p-3 rounded-xl border border-white/5">
                    <span className="text-slate-400 font-mono text-[10px] uppercase font-bold block">
                      Contact & Angle
                    </span>
                    <p className="text-slate-200 font-medium">
                      {op.contactPerson} ·{' '}
                      <span className="text-slate-400">{op.outreachAngle}</span>
                    </p>
                  </div>
                </div>

                {/* Pitch Preview Box */}
                <div className="bg-slate-900/80 p-4 rounded-xl border border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#34d399] font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Mail size={12} />
                      <span>Recommended Warm Outreach Email Pitch</span>
                    </span>
                    <button
                      onClick={() => handleCopyText(op.suggestedPitch, op.id)}
                      className="text-[11px] text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer font-mono"
                    >
                      {copiedId === op.id ? (
                        <>
                          <Check size={11} className="text-emerald-400" />
                          <span className="text-emerald-400">Copied Pitch</span>
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          <span>Copy Pitch</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-slate-300 leading-relaxed font-sans italic">
                    {'"'}
                    {op.suggestedPitch}
                    {'"'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------ SUB-TAB 2: PILLAR PAGES ------------------ */}
      {activeSubTab === 'pillar_pages' && (
        <div className="space-y-6">
          {/* Form Box */}
          <div className="glass-card p-6 space-y-5">
            {/* Pillar Topic Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <span>Pillar Topic</span>
              </label>
              <input
                type="text"
                placeholder="Enter your pillar topic (e.g. Raising BER from G to A)"
                value={pillarTopic}
                onChange={(e) => setPillarTopic(e.target.value)}
                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs font-mono text-white focus:ring-2 focus:ring-[#34d399]/20 focus:border-[#34d399] outline-hidden"
              />
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-end justify-between gap-4">
              <div className="space-y-2 flex-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Globe size={13} className="text-[#34d399]" />
                  <span>Website URL *</span>
                </label>
                <input
                  type="text"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://ecosmarthomes.ie/"
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-xs font-mono text-white focus:ring-2 focus:ring-[#34d399]/20 focus:border-[#34d399] outline-hidden"
                />
              </div>

              {/* Action Button */}
              <button
                onClick={handleGeneratePillarIdeas}
                disabled={loadingPillars || !websiteUrl.trim()}
                className="bg-[#34d399] hover:bg-[#2bc48d] disabled:opacity-50 text-[#0f172a] px-7 py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-lg shadow-[#34d399]/20"
                id="generate-pillar-ideas-btn"
              >
                {loadingPillars ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Mapping Authority Pillars...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Generate Pillar Page Ideas</span>
                  </>
                )}
              </button>
            </div>

            {/* Previous Sites Chip List */}
            <div className="flex items-center gap-2 pt-1 border-t border-white/5 text-xs">
              <span className="text-slate-400 font-mono text-[10px] uppercase font-bold">
                Previous Sites:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {previousSites.map((domain, i) => (
                  <button
                    key={i}
                    onClick={() => setWebsiteUrl(`https://${domain}/`)}
                    className="text-[11px] font-mono bg-white/5 hover:bg-white/10 text-slate-300 px-2.5 py-0.5 rounded-md transition cursor-pointer border border-white/5"
                  >
                    {domain}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pillar Concepts List */}
          <div className="grid grid-cols-1 gap-5">
            {pillars.map((pillar) => (
              <div
                key={pillar.id}
                className="glass-card p-6 border border-white/10 hover:border-white/20 transition-all rounded-2xl bg-[#0f172a]/40 space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold bg-[#34d399]/20 text-[#34d399] border border-[#34d399]/30 px-2.5 py-0.5 rounded uppercase">
                        Authority Score: {pillar.authorityScore}/100
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded">
                        Vol: {pillar.estimatedVolume}
                      </span>
                      {pillar.difficulty && (
                        <span className="text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded uppercase">
                          Difficulty: {pillar.difficulty}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-display font-bold text-white hover:text-[#34d399] transition mt-1">
                      {pillar.title}
                    </h3>
                  </div>

                  {/* Send to Writer Button */}
                  <button
                    onClick={() => onOpenInWriter(pillar.title)}
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 shrink-0 cursor-pointer self-start"
                  >
                    <FileText size={13} className="text-[#34d399]" />
                    <span>Send to AI Writer (+35 XP)</span>
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-black/20 p-3.5 rounded-xl border border-white/5">
                  {pillar.summary}
                </p>

                {/* Subtopic Cluster Chips */}
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
                    Linked Supporting Subtopic Clusters (Internal Mesh):
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {pillar.subtopicClusters.map((sub, idx) => (
                      <div
                        key={idx}
                        className="bg-white/5 border border-white/5 px-3 py-2 rounded-xl text-slate-200 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] shrink-0" />
                        <span className="truncate">{sub}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {pillar.linkBaitAngle && (
                  <div className="bg-[#34d399]/10 border border-[#34d399]/20 p-3 rounded-xl text-xs text-[#34d399] flex items-center gap-2">
                    <Zap size={14} className="shrink-0 text-[#34d399]" />
                    <span>
                      <strong>Natural Link Magnet Angle:</strong>{' '}
                      {pillar.linkBaitAngle}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------ SUB-TAB 3: LINK BAIT BUILDER ------------------ */}
      {activeSubTab === 'link_bait' && (
        <div className="space-y-6">
          {/* Educational Callout Banner */}
          <div className="bg-linear-to-r from-[#34d399]/15 via-emerald-500/10 to-teal-500/10 border border-[#34d399]/30 p-5 rounded-2xl space-y-2 text-left shadow-lg">
            <div className="flex items-center gap-2 text-[#34d399] font-display font-bold text-sm">
              <Zap size={18} className="fill-[#34d399]/20" />
              <span>What is Link Bait?</span>
            </div>
            <p className="text-slate-200 text-xs leading-relaxed max-w-3xl">
              Content designed to be so useful that other websites naturally
              link to it. Think reference charts, calculators, and comparison
              tools that solve real problems.
            </p>
          </div>

          {/* Generator Controls */}
          <div className="flex flex-wrap gap-2">
            {[
              'Interactive Calculators',
              'Reference Charts',
              'Comparison Tools',
              'Infographics',
            ].map((cat) => (
              <button
                key={cat}
                onClick={() => handleGenerateLinkBait(cat)}
                disabled={loadingBait}
                className="bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2"
              >
                <Sparkles size={12} className="text-[#34d399]" />
                <span>Generate {cat}</span>
              </button>
            ))}
          </div>

          {/* Link Bait Assets List */}
          <div className="grid grid-cols-1 gap-5">
            {baitAssets.map((asset) => (
              <div
                key={asset.id}
                className="glass-card p-6 border border-white/10 hover:border-white/20 transition-all rounded-2xl bg-[#0f172a]/40 space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold bg-[#34d399]/20 text-[#34d399] border border-[#34d399]/30 px-2 py-0.5 rounded uppercase">
                        {asset.type}
                      </span>
                      <span className="text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded">
                        Potential: {asset.estimatedBacklinkPotential}
                      </span>
                    </div>
                    <h3 className="text-base font-display font-bold text-white hover:text-[#34d399] transition mt-1">
                      {asset.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleCopyText(asset.embedSnippet, asset.id)}
                    className="bg-[#34d399]/15 hover:bg-[#34d399]/25 text-[#34d399] border border-[#34d399]/30 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer self-start md:self-auto font-mono"
                  >
                    {copiedId === asset.id ? (
                      <>
                        <Check size={13} />
                        <span>Embed Code Copied</span>
                      </>
                    ) : (
                      <>
                        <Code2 size={13} />
                        <span>Copy Widget Embed Code</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {asset.summary}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-black/30 p-3.5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-slate-400 font-mono text-[10px] uppercase font-bold block text-emerald-400">
                      Why Websites Naturally Link to This:
                    </span>
                    <p className="text-slate-200 leading-relaxed">
                      {asset.whyItAttractsLinks}
                    </p>
                  </div>

                  <div className="bg-black/30 p-3.5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-slate-400 font-mono text-[10px] uppercase font-bold block text-purple-400">
                      Target Link Sources:
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {asset.targetBacklinkSources.map((src, i) => (
                        <span
                          key={i}
                          className="bg-white/5 border border-white/5 px-2 py-0.5 rounded text-[11px] text-slate-300"
                        >
                          {src}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Embed Code Snippet Box */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-white/10 pb-1">
                    <span>Embed Code for External Site Owners & Bloggers</span>
                    <span>HTML / iframe</span>
                  </div>
                  <pre className="text-[11px] font-mono text-emerald-400 overflow-x-auto p-1 leading-tight">
                    {asset.embedSnippet}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
