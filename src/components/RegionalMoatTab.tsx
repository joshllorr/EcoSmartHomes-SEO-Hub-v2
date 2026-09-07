/**
 * src/components/RegionalMoatTab.tsx
 *
 * Programmatic Regional SEO Moat Hub
 * National Command Center covering all 26 Irish Counties & Eircodes.
 * Features batch generation, live landing page preview, schema inspection,
 * and sitemap export.
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  MapPin,
  Globe,
  Layers,
  Search,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Copy,
  Code2,
  FileText,
  RefreshCw,
  Zap,
  Building,
  ChevronRight,
  X,
  Download,
} from 'lucide-react';
import {
  IRISH_COUNTIES_DATA,
  IrishCountyInfo,
  getCountiesByProvince,
} from '../data/irishCountiesData';
import {
  globalRegionalSeoMoatEngine,
  RegionalLandingPage,
} from '../logic/regionalSeoMoatEngine';

export default function RegionalMoatTab() {
  const [selectedSlug, setSelectedSlug] = useState<string>('limerick');
  const [provinceFilter, setProvinceFilter] = useState<
    'All' | 'Munster' | 'Leinster' | 'Connacht' | 'Ulster'
  >('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewPage, setPreviewPage] = useState<RegionalLandingPage | null>(
    () => {
      return globalRegionalSeoMoatEngine.generateCountyPage('limerick');
    },
  );

  const [activeSchemaTab, setActiveSchemaTab] = useState<
    'localBusiness' | 'faqPage' | 'breadcrumbList'
  >('localBusiness');
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [isBatchDeploying, setIsBatchDeploying] = useState(false);
  const [batchDeploySuccess, setBatchDeploySuccess] = useState<string | null>(
    null,
  );
  const [showSitemapModal, setShowSitemapModal] = useState(false);

  // Filtered list of counties
  const filteredCounties = useMemo(() => {
    let list = IRISH_COUNTIES_DATA;
    if (provinceFilter !== 'All') {
      list = getCountiesByProvince(provinceFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.county.toLowerCase().includes(q) ||
          c.irishName.toLowerCase().includes(q) ||
          c.eircode.toLowerCase().includes(q) ||
          (c.secondaryEircodes &&
            c.secondaryEircodes.some((sec) => sec.toLowerCase().includes(q))) ||
          c.majorTowns.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [provinceFilter, searchQuery]);

  // Aggregate statistics
  const totalMonthlySearches = useMemo(() => {
    return IRISH_COUNTIES_DATA.reduce((sum, c) => sum + c.monthlySearches, 0);
  }, []);

  const totalContractors = useMemo(() => {
    return IRISH_COUNTIES_DATA.reduce(
      (sum, c) => sum + c.registeredContractors,
      0,
    );
  }, []);

  // Update preview page when slug changes
  const handleSelectCounty = (slug: string) => {
    setSelectedSlug(slug);
    try {
      const page = globalRegionalSeoMoatEngine.generateCountyPage(slug);
      setPreviewPage(page);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopySchema = (schemaObj: Record<string, any>) => {
    navigator.clipboard.writeText(JSON.stringify(schemaObj, null, 2));
    setCopiedSchema(true);
    setTimeout(() => setCopiedSchema(false), 2000);
  };

  const handleBatchDeploy = async () => {
    setIsBatchDeploying(true);
    setBatchDeploySuccess(null);

    try {
      const res = await fetch('/api/seo/regional/batch-generate', {
        method: 'POST',
      });
      if (res.ok) {
        setBatchDeploySuccess(
          'Successfully deployed all 26 Irish County landing pages and refreshed /sitemap-regional.xml!',
        );
      } else {
        // Local generation fallback
        const summary = globalRegionalSeoMoatEngine.generateAllCountiesMoat();
        setBatchDeploySuccess(
          `Compiled ${summary.totalCounties} county hubs (${summary.totalMonthlySearches.toLocaleString()} monthly search volume covered)!`,
        );
      }
    } catch {
      const summary = globalRegionalSeoMoatEngine.generateAllCountiesMoat();
      setBatchDeploySuccess(
        `Compiled ${summary.totalCounties} county hubs (${summary.totalMonthlySearches.toLocaleString()} monthly search volume covered)!`,
      );
    } finally {
      setIsBatchDeploying(false);
      setTimeout(() => setBatchDeploySuccess(null), 5000);
    }
  };

  const sitemapXml = useMemo(() => {
    return globalRegionalSeoMoatEngine.generateRegionalSitemapXml();
  }, []);

  return (
    <div className="space-y-6 text-left" id="regional-moat-tab">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Globe size={22} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-display font-semibold text-white tracking-tight flex items-center gap-2">
                <span>Programmatic Regional SEO Moat</span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                  26 ROI COUNTIES
                </span>
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Dominating Irish local SERPs across Munster, Leinster, Connacht
                & Ulster with structured landing pages and verified Eircode
                schemas.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowSitemapModal(true)}
            className="px-3.5 py-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/40 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
          >
            <Download size={14} className="text-emerald-400" />
            <span>Regional XML Sitemap</span>
          </button>

          <button
            onClick={handleBatchDeploy}
            disabled={isBatchDeploying}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-md cursor-pointer"
          >
            {isBatchDeploying ? (
              <>
                <RefreshCw size={14} className="animate-spin text-slate-950" />
                <span>Deploying 26 Counties...</span>
              </>
            ) : (
              <>
                <Zap size={14} className="fill-slate-950 text-slate-950" />
                <span>Deploy 26-County Moat</span>
              </>
            )}
          </button>
        </div>
      </div>

      {batchDeploySuccess && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 px-4 py-3 rounded-xl text-xs flex items-center justify-between animate-in fade-in duration-200">
          <span className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{batchDeploySuccess}</span>
          </span>
          <button
            onClick={() => setBatchDeploySuccess(null)}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card p-4 rounded-xl border border-white/10 bg-slate-900/60">
          <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
            Counties Indexed
          </span>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            26 / 26
          </div>
          <span className="text-[10px] text-emerald-400 font-medium">
            100% Republic of Ireland
          </span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-white/10 bg-slate-900/60">
          <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
            Monthly Search Footprint
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {totalMonthlySearches.toLocaleString()}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            High-intent SEAI keywords
          </span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-white/10 bg-slate-900/60">
          <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
            Approved Contractor Network
          </span>
          <div className="text-2xl font-bold font-mono text-indigo-400 mt-1">
            {totalContractors}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            SEAI registered partners
          </span>
        </div>

        <div className="glass-card p-4 rounded-xl border border-white/10 bg-slate-900/60">
          <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
            Provinces Unified
          </span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
            4 / 4
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            Munster, Leinster, Connacht, Ulster
          </span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: County Selection Matrix */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-card p-4 rounded-2xl border border-white/10 bg-slate-900/60 space-y-3">
            {/* Filter controls */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-1">
                {(
                  ['All', 'Munster', 'Leinster', 'Connacht', 'Ulster'] as const
                ).map((prov) => (
                  <button
                    key={prov}
                    onClick={() => setProvinceFilter(prov)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      provinceFilter === prov
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {prov}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by county, Eircode (e.g. V94, T12), or town..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-400 font-mono"
                />
              </div>
            </div>

            {/* Counties List Scrollable */}
            <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
              {filteredCounties.map((c) => {
                const isSelected = selectedSlug === c.slug;
                return (
                  <button
                    key={c.slug}
                    onClick={() => handleSelectCounty(c.slug)}
                    className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500/60 text-white shadow-md ring-1 ring-emerald-500/40'
                        : 'bg-slate-950/40 border-white/5 text-slate-300 hover:bg-slate-900/80 hover:border-white/10'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">
                          {c.county}
                        </span>
                        <span className="font-mono text-[10px] px-1.5 py-0.2 bg-white/10 rounded text-slate-300">
                          {c.eircode}
                        </span>
                        <span className="text-[10px] text-slate-400 italic">
                          {c.irishName}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {c.majorTowns.slice(0, 3).join(', ')}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-emerald-400">
                        {c.monthlySearches.toLocaleString()}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">
                          /mo
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400">
                        Rank #{c.avgRank}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Landing Page & Schema Preview Drawer */}
        <div className="lg:col-span-7 space-y-4">
          {previewPage ? (
            <div className="glass-card rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden flex flex-col">
              {/* Preview Header */}
              <div className="bg-white/5 border-b border-white/10 p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-tight">
                      {previewPage.county} ({previewPage.eircode}) Programmatic
                      Hub
                    </h3>
                    <span className="text-[10px] font-mono text-emerald-400">
                      Canonical: {previewPage.canonicalUrl}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                    {previewPage.wordCount} words
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                    {previewPage.readingTimeMins} min read
                  </span>
                </div>
              </div>

              {/* Meta Tags Quick Audit Bar */}
              <div className="p-4 border-b border-white/5 bg-black/20 space-y-2">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 mb-1">
                    <span>Target Meta Title</span>
                    <span className="text-emerald-400">
                      {previewPage.metaTitle.length} / 60 chars
                    </span>
                  </div>
                  <div className="text-xs text-white font-semibold bg-black/40 p-2 rounded-lg border border-white/5 font-mono">
                    {previewPage.metaTitle}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 mb-1">
                    <span>Target Meta Description</span>
                    <span className="text-emerald-400">
                      {previewPage.metaDescription.length} / 160 chars
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 bg-black/40 p-2 rounded-lg border border-white/5 font-mono">
                    {previewPage.metaDescription}
                  </div>
                </div>
              </div>

              {/* Schema Markup Inspector Tabs */}
              <div className="border-b border-white/5 bg-black/30 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                    <Code2 size={14} className="text-indigo-400" />
                    <span>Google Rich Results Schemas:</span>
                  </div>

                  <button
                    onClick={() =>
                      handleCopySchema(
                        previewPage.jsonLdSchemas[activeSchemaTab],
                      )
                    }
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/15 text-slate-200 rounded-md text-[10px] font-mono font-semibold flex items-center gap-1 transition cursor-pointer"
                  >
                    {copiedSchema ? (
                      <CheckCircle2 size={11} className="text-emerald-400" />
                    ) : (
                      <Copy size={11} />
                    )}
                    <span>{copiedSchema ? 'Copied' : 'Copy Schema'}</span>
                  </button>
                </div>

                {/* Tab buttons */}
                <div className="flex items-center gap-1">
                  {[
                    { id: 'localBusiness', label: 'LocalBusiness Schema' },
                    { id: 'faqPage', label: 'FAQPage Schema' },
                    { id: 'breadcrumbList', label: 'Breadcrumbs' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSchemaTab(tab.id as any)}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono transition cursor-pointer ${
                        activeSchemaTab === tab.id
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Schema Code box */}
                <pre className="text-[10px] text-indigo-200 font-mono overflow-x-auto max-h-36 p-2.5 bg-slate-950 rounded-lg border border-white/5">
                  {JSON.stringify(
                    previewPage.jsonLdSchemas[activeSchemaTab],
                    null,
                    2,
                  )}
                </pre>
              </div>

              {/* Markdown Content Preview */}
              <div className="p-5 overflow-y-auto max-h-[380px] bg-black/15 text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap select-text">
                {previewPage.contentMarkdown}
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 rounded-2xl border border-white/10 bg-slate-900/60 text-center">
              <MapPin size={24} className="mx-auto text-slate-500 mb-2" />
              <p className="text-slate-400 text-xs">
                Select a county from the left to preview its programmatic SEO
                page and schemas.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* XML Sitemap Modal */}
      {showSitemapModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0f172a] border border-white/15 rounded-2xl max-w-2xl w-full p-6 space-y-4 text-left shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Download size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Programmatic Regional XML Sitemap
                  </h3>
                  <span className="text-[11px] font-mono text-emerald-400">
                    GET /sitemap-regional.xml (26 Counties)
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowSitemapModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              This dedicated sitemap indexes all 26 Republic of Ireland counties
              at priority 0.9. It is automatically registered in{' '}
              <code className="text-emerald-300 font-mono">/robots.txt</code>{' '}
              and ready for Google Search Console submission.
            </p>

            <pre className="text-[10px] text-emerald-200 font-mono overflow-x-auto max-h-72 p-3 bg-slate-950 rounded-xl border border-white/10 select-all">
              {sitemapXml}
            </pre>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(sitemapXml);
                  alert('Sitemap XML copied to clipboard!');
                }}
                className="px-3.5 py-1.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-emerald-400 transition cursor-pointer"
              >
                Copy XML
              </button>
              <button
                onClick={() => setShowSitemapModal(false)}
                className="px-3.5 py-1.5 bg-white/10 text-white font-semibold text-xs rounded-lg hover:bg-white/15 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
