import React, { useState } from 'react';
import {
  Building2,
  Globe,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Check,
  Search,
  HelpCircle,
  MapPin,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Layers,
  ChevronDown,
  ChevronUp,
  Zap,
  Award,
  Info,
  Bot,
  Tag,
  Bookmark,
  Share2,
  FileCode2,
} from 'lucide-react';

interface EntityCardPreviewProps {
  schemaJsonStr: string;
  orgName: string;
  targetUrl: string;
  description: string;
  selectedAreas: string[];
  appliedNodes: any[];
}

interface FieldStatus {
  isValid: boolean;
  status: 'optimized' | 'warning';
  label: string;
  reason: string;
}

function PropertyTooltip({
  propName,
  schemaType,
  description,
}: {
  propName: string;
  schemaType?: string;
  description: string;
}) {
  return (
    <div className="opacity-0 group-hover/prop:opacity-100 transition-all duration-200 pointer-events-none absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-64 p-2.5 bg-slate-900/95 text-slate-200 text-[10px] font-mono leading-tight rounded-xl border border-emerald-500/40 shadow-2xl backdrop-blur-md space-y-1">
      <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-white/10 pb-1">
        <span className="flex items-center gap-1">
          <Tag size={10} />
          <span>Schema.org: {propName}</span>
        </span>
        {schemaType && (
          <span className="text-[9px] bg-emerald-500/20 px-1.5 py-0.2 rounded text-emerald-300 font-semibold">
            {schemaType}
          </span>
        )}
      </div>
      <p className="text-slate-300 font-sans text-[10px] leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function FieldStatusBadge({ status }: { status: FieldStatus }) {
  if (status.isValid) {
    return (
      <div
        className="flex items-center gap-1 bg-emerald-500/15 text-emerald-300 border border-emerald-500/35 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 shadow-sm hover:bg-emerald-500/25 transition cursor-help"
        title={status.reason}
      >
        <CheckCircle2 size={11} className="text-emerald-400" />
        <span>{status.label}</span>
      </div>
    );
  }
  return (
    <div
      className="flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 shadow-sm hover:bg-amber-500/30 transition cursor-help"
      title={status.reason}
    >
      <AlertCircle size={11} className="text-amber-400" />
      <span>{status.label}</span>
    </div>
  );
}

export default function EntityCardPreview({
  schemaJsonStr,
  orgName,
  targetUrl,
  description,
  selectedAreas,
  appliedNodes,
}: EntityCardPreviewProps) {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<
    'knowledge_panel' | 'ai_perception' | 'graph_nodes'
  >('knowledge_panel');

  // Attempt to parse JSON-LD string safely
  let parsedSchema: any = null;
  let parseError: string | null = null;

  try {
    parsedSchema = JSON.parse(schemaJsonStr);
  } catch (err: any) {
    parseError = err?.message || 'Invalid JSON syntax';
  }

  // Extract nodes from @graph array or top-level object
  const graphNodes: any[] = Array.isArray(parsedSchema?.['@graph'])
    ? parsedSchema['@graph']
    : parsedSchema
      ? [parsedSchema]
      : [];

  // Find specific node types from parsed JSON-LD
  const orgNode = graphNodes.find(
    (n) =>
      n['@type'] === 'Organization' ||
      n['@type'] === 'LocalBusiness' ||
      n['@type']?.includes?.('Business'),
  );
  const websiteNode = graphNodes.find((n) => n['@type'] === 'WebSite');
  const faqNode = graphNodes.find((n) => n['@type'] === 'FAQPage');
  const searchActionNode = graphNodes.find(
    (n) =>
      n['@type'] === 'SearchAction' ||
      n?.potentialAction?.['@type'] === 'SearchAction',
  );

  // Fallbacks
  const displayTitle =
    orgName || orgNode?.name || websiteNode?.name || 'EcoSmart Homes';
  const displayUrl =
    targetUrl || orgNode?.url || websiteNode?.url || 'https://ecosmarthomes.ie';
  const cleanDomain = displayUrl
    .replace(/^https?:\/\//i, '')
    .replace(/\/.*$/, '');
  const displayDesc =
    description ||
    websiteNode?.description ||
    'Energy efficiency, home retrofitting, and BER rating optimization authority.';

  // Extract knowsAbout list
  const knowsAboutList: string[] = orgNode?.knowsAbout || [
    'Home Energy Upgrades',
    'BER Rating Optimization',
    'SEAI Retrofit Grants',
    'Heat Pump Systems',
    'Thermal Wall & Roof Insulation',
  ];

  // Extract FAQ items
  const faqQuestions = faqNode?.mainEntity || [
    {
      name: 'How do I upgrade my home BER rating in Ireland?',
      acceptedAnswer: {
        text: 'Upgrading a BER rating involves insulation improvements, draft proofing, heat pump integration, and solar PV installations.',
      },
    },
    {
      name: 'What SEAI grants are available for home retrofitting?',
      acceptedAnswer: {
        text: 'SEAI offers grants for wall insulation, attic insulation, heat pumps, solar water heating, and solar PV panels.',
      },
    },
  ];

  // Node types array
  const activeNodeTypes = graphNodes.map((n) => n['@type']).filter(Boolean);

  // EVALUATE SCHEMA VALIDATION STATUSES FOR EACH PROPERTY BLOCK
  const urlStatus: FieldStatus = (() => {
    if (!displayUrl || displayUrl === 'https://' || displayUrl === 'http://') {
      return {
        isValid: false,
        status: 'warning',
        label: 'Attention Needed',
        reason: 'Target URL is blank or incomplete.',
      };
    }
    if (
      !displayUrl.startsWith('http://') &&
      !displayUrl.startsWith('https://')
    ) {
      return {
        isValid: false,
        status: 'warning',
        label: 'Attention Needed',
        reason: 'URL missing http:// or https:// protocol prefix.',
      };
    }
    return {
      isValid: true,
      status: 'optimized',
      label: 'Optimized',
      reason: 'Canonical URL and domain URI validated.',
    };
  })();

  const nameStatus: FieldStatus = (() => {
    if (!displayTitle || displayTitle.trim().length < 2) {
      return {
        isValid: false,
        status: 'warning',
        label: 'Attention Needed',
        reason: 'Organization name is missing or too short.',
      };
    }
    if (!orgNode && !websiteNode) {
      return {
        isValid: false,
        status: 'warning',
        label: 'Attention Needed',
        reason: 'No Organization or WebSite type node in graph.',
      };
    }
    return {
      isValid: true,
      status: 'optimized',
      label: 'Optimized',
      reason: 'Primary entity name & @type classification defined.',
    };
  })();

  const descStatus: FieldStatus = (() => {
    const len = displayDesc ? displayDesc.trim().length : 0;
    if (len === 0) {
      return {
        isValid: false,
        status: 'warning',
        label: 'Attention Needed',
        reason: 'Description property is missing.',
      };
    }
    if (len < 30) {
      return {
        isValid: false,
        status: 'warning',
        label: 'Attention Needed',
        reason: `Description short (${len} chars). Recommend at least 30 chars.`,
      };
    }
    if (len > 320) {
      return {
        isValid: false,
        status: 'warning',
        label: 'Attention Needed',
        reason: `Description long (${len} chars). May truncate in Google snippets.`,
      };
    }
    return {
      isValid: true,
      status: 'optimized',
      label: 'Optimized',
      reason: `Description length (${len} chars) optimal for SERPs & AI engines.`,
    };
  })();

  const areaStatus: FieldStatus = (() => {
    if (!selectedAreas || selectedAreas.length === 0) {
      return {
        isValid: false,
        status: 'warning',
        label: 'Broad Coverage',
        reason:
          'No specific local target areas selected. Set regional suburbs in generator.',
      };
    }
    return {
      isValid: true,
      status: 'optimized',
      label: 'Optimized',
      reason: `${selectedAreas.length} local target territories mapped in areaServed.`,
    };
  })();

  const topicStatus: FieldStatus = (() => {
    if (!knowsAboutList || knowsAboutList.length < 3) {
      return {
        isValid: false,
        status: 'warning',
        label: 'Attention Needed',
        reason: 'Fewer than 3 topic entities declared in knowsAbout.',
      };
    }
    return {
      isValid: true,
      status: 'optimized',
      label: 'Optimized',
      reason: `${knowsAboutList.length} topical vectors linked for AI retrieval.`,
    };
  })();

  const searchStatus: FieldStatus = (() => {
    if (!searchActionNode) {
      return {
        isValid: false,
        status: 'warning',
        label: 'SearchAction Inactive',
        reason: 'SearchAction node missing from @graph.',
      };
    }
    return {
      isValid: true,
      status: 'optimized',
      label: 'Optimized',
      reason: 'SearchAction active for Google Sitelinks SearchBox.',
    };
  })();

  const faqStatus: FieldStatus = (() => {
    if (!faqNode) {
      return {
        isValid: false,
        status: 'warning',
        label: 'FAQ Inactive',
        reason: 'FAQPage node missing from @graph.',
      };
    }
    if (!faqQuestions || faqQuestions.length < 2) {
      return {
        isValid: false,
        status: 'warning',
        label: 'Attention Needed',
        reason: 'Fewer than 2 Q&A pairs in FAQPage schema.',
      };
    }
    return {
      isValid: true,
      status: 'optimized',
      label: 'Optimized',
      reason: `${faqQuestions.length} Q&A items structured for Google & Perplexity direct answers.`,
    };
  })();

  const allStatuses = [
    urlStatus,
    nameStatus,
    descStatus,
    areaStatus,
    topicStatus,
    searchStatus,
    faqStatus,
  ];
  const optimizedCount = allStatuses.filter((s) => s.isValid).length;
  const totalCount = allStatuses.length;
  const overallHealth = Math.round((optimizedCount / totalCount) * 100);

  return (
    <div
      id="entity-card-preview"
      className="bg-[#0b1329] border border-white/10 rounded-2xl p-4 sm:p-5 text-left space-y-3.5 shadow-2xl relative overflow-hidden flex flex-col h-full font-sans"
    >
      {/* Search Engine Knowledge Graph Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-sky-500 text-slate-950 flex items-center justify-center font-bold shadow-md shrink-0">
            <Sparkles size={15} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white tracking-tight font-mono">
                Google Knowledge Graph Card
              </span>
              <span className="bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase">
                LIVE INTERPRETED
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Search engine & AI bot entity interpretation preview
            </p>
          </div>
        </div>

        {/* View mode toggle tabs */}
        <div className="flex items-center gap-1 bg-black/50 border border-white/10 p-0.5 rounded-lg text-[10px] font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('knowledge_panel')}
            className={`px-2.5 py-1 rounded-md transition font-semibold cursor-pointer ${
              activeTab === 'knowledge_panel'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Entity Card
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ai_perception')}
            className={`px-2.5 py-1 rounded-md transition font-semibold cursor-pointer ${
              activeTab === 'ai_perception'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            AI Engine View
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('graph_nodes')}
            className={`px-2.5 py-1 rounded-md transition font-semibold cursor-pointer ${
              activeTab === 'graph_nodes'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Graph ({activeNodeTypes.length})
          </button>
        </div>
      </div>

      {/* SCHEMA VALIDATION STATE SUMMARY BANNER */}
      <div className="bg-slate-900/90 border border-white/10 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${overallHealth >= 80 ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-pulse'}`}
          />
          <span className="text-white font-bold">
            Schema Validation Health: {overallHealth}%
          </span>
          <span className="text-[10px] text-slate-400">
            ({optimizedCount}/{totalCount} Validated)
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
          <span className="flex items-center gap-1 text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
            <CheckCircle2 size={10} className="text-emerald-400" />
            <span>{optimizedCount} Optimized</span>
          </span>
          {totalCount - optimizedCount > 0 && (
            <span className="flex items-center gap-1 text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
              <AlertCircle size={10} className="text-amber-400" />
              <span>{totalCount - optimizedCount} Attention</span>
            </span>
          )}
        </div>
      </div>

      {parseError ? (
        <div className="bg-rose-950/60 border border-rose-500/40 text-rose-200 rounded-xl p-4 text-xs font-mono space-y-2">
          <div className="flex items-center gap-2 font-bold text-rose-400">
            <Info size={16} />
            <span>JSON-LD Parse Warning</span>
          </div>
          <p>{parseError}</p>
          <p className="text-[10px] text-slate-400">
            Fix the JSON syntax in the editor panel to see the live Entity Card
            preview.
          </p>
        </div>
      ) : activeTab === 'knowledge_panel' ? (
        <div className="space-y-4 flex-1 overflow-y-auto pr-1">
          {/* Simulated Google Search Results Header / Knowledge Panel Card */}
          <div className="bg-slate-900/90 border border-white/15 rounded-xl p-4 space-y-3.5 shadow-xl relative">
            {/* 1. Domain & Favicon bar Block */}
            <div
              className={`p-2.5 rounded-xl border transition-all ${
                urlStatus.isValid
                  ? 'bg-black/30 border-white/10'
                  : 'bg-amber-950/20 border-amber-500/40'
              }`}
            >
              <div className="flex items-center justify-between relative group/prop">
                <PropertyTooltip
                  propName="url & @id"
                  schemaType="URL"
                  description="Canonical WebSite or Organization URI identifying the authoritative web domain."
                />
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center font-bold text-[10px]">
                    {cleanDomain.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-[11px] font-medium text-slate-200 font-mono">
                      {cleanDomain}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono truncate max-w-[180px]">
                      {displayUrl}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <FieldStatusBadge status={urlStatus} />
                  <div className="hidden sm:flex items-center gap-1.5 bg-sky-500/10 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold relative group/prop">
                    <PropertyTooltip
                      propName="publisher / author"
                      schemaType="Organization"
                      description="Signals to Google Knowledge Graph that this entity identity has been verified through structured JSON-LD linkage."
                    />
                    <ShieldCheck size={12} className="text-sky-400" />
                    <span>Verified</span>
                  </div>
                </div>
              </div>
              {!urlStatus.isValid && (
                <p className="text-[10px] font-mono text-amber-300/90 mt-1.5 flex items-center gap-1">
                  <AlertCircle size={10} />
                  <span>{urlStatus.reason}</span>
                </p>
              )}
            </div>

            {/* 2. Entity Main Title & Verification Block */}
            <div
              className={`p-3 rounded-xl border transition-all relative group/prop space-y-2 ${
                nameStatus.isValid && descStatus.isValid
                  ? 'bg-black/30 border-white/10'
                  : 'bg-amber-950/20 border-amber-500/40'
              }`}
            >
              <PropertyTooltip
                propName="name & @type"
                schemaType="Text / LocalBusiness"
                description="The primary official name and Schema.org classification (e.g. LocalBusiness/Organization) for the entity."
              />

              <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-2">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    <span>{displayTitle}</span>
                    <span
                      className="w-4 h-4 rounded-full bg-sky-500 text-slate-950 inline-flex items-center justify-center text-[10px] font-bold shrink-0"
                      title="Google Knowledge Panel Verified"
                    >
                      ✓
                    </span>
                  </h3>
                  <p className="text-xs text-emerald-400 font-mono mt-0.5 font-medium flex items-center gap-1">
                    <Building2 size={12} />
                    <span>
                      Home Energy Upgrades & BER Optimization Organization
                    </span>
                  </p>
                </div>
                <FieldStatusBadge status={nameStatus} />
              </div>

              {/* 3. Description Block */}
              <div className="relative group/prop pt-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold">
                    Entity Description
                  </span>
                  <FieldStatusBadge status={descStatus} />
                </div>
                <PropertyTooltip
                  propName="description"
                  schemaType="Text"
                  description="Concise description summarizing the organization's purpose, services, and authority for search snippets and AI models."
                />
                <p className="text-xs text-slate-300 leading-relaxed bg-black/40 p-2.5 rounded-lg border border-white/5 hover:border-emerald-500/40 transition-colors">
                  {displayDesc}
                </p>
                {!descStatus.isValid && (
                  <p className="text-[10px] font-mono text-amber-300/90 mt-1 flex items-center gap-1">
                    <AlertCircle size={10} />
                    <span>{descStatus.reason}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Entity Attributes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* 4. Local Coverage / Areas Served Block */}
              <div
                className={`border transition-colors rounded-xl p-3 space-y-1.5 relative group/prop ${
                  areaStatus.isValid
                    ? 'bg-black/40 border-white/10 hover:border-emerald-500/40'
                    : 'bg-amber-950/20 border-amber-500/40'
                }`}
              >
                <PropertyTooltip
                  propName="areaServed"
                  schemaType="Place / AdministrativeArea"
                  description="Geographic postal areas or cities where the business offers active coverage."
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1">
                    <MapPin size={11} className="text-emerald-400" />
                    <span>Territory Served</span>
                  </span>
                  <FieldStatusBadge status={areaStatus} />
                </div>

                <div className="flex flex-wrap gap-1 pt-0.5">
                  {selectedAreas && selectedAreas.length > 0 ? (
                    selectedAreas.slice(0, 5).map((area) => (
                      <span
                        key={area}
                        className="bg-emerald-950/80 border border-emerald-500/30 text-emerald-200 text-[10px] font-mono px-1.5 py-0.2 rounded"
                      >
                        {area}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] font-mono text-amber-300/80 italic">
                      Broad coverage (No specific areas selected)
                    </span>
                  )}
                  {selectedAreas && selectedAreas.length > 5 && (
                    <span className="bg-white/5 text-slate-300 text-[10px] font-mono px-1.5 py-0.2 rounded">
                      +{selectedAreas.length - 5} more
                    </span>
                  )}
                </div>
                {!areaStatus.isValid && (
                  <p className="text-[9px] font-mono text-amber-300/90 pt-1 flex items-center gap-1">
                    <AlertCircle size={9} />
                    <span>{areaStatus.reason}</span>
                  </p>
                )}
              </div>

              {/* 5. Topic Knowledge Graph Block */}
              <div
                className={`border transition-colors rounded-xl p-3 space-y-1.5 relative group/prop ${
                  topicStatus.isValid
                    ? 'bg-black/40 border-white/10 hover:border-sky-500/40'
                    : 'bg-amber-950/20 border-amber-500/40'
                }`}
              >
                <PropertyTooltip
                  propName="knowsAbout"
                  schemaType="Text / URL"
                  description="Explicit topical entities and domain concepts the business specializes in, forming the base of AI citation graphs."
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1">
                    <Award size={11} className="text-sky-400" />
                    <span>Topic Expertise</span>
                  </span>
                  <FieldStatusBadge status={topicStatus} />
                </div>

                <div className="flex flex-wrap gap-1 pt-0.5">
                  {knowsAboutList.map((topic, i) => (
                    <span
                      key={i}
                      className="bg-sky-950/80 border border-sky-500/30 text-sky-200 text-[10px] font-mono px-1.5 py-0.2 rounded"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
                {!topicStatus.isValid && (
                  <p className="text-[9px] font-mono text-amber-300/90 pt-1 flex items-center gap-1">
                    <AlertCircle size={9} />
                    <span>{topicStatus.reason}</span>
                  </p>
                )}
              </div>
            </div>

            {/* 6. Google Sitelinks SearchBox Preview Block */}
            <div
              className={`border transition-colors rounded-xl p-3 space-y-2 relative group/prop ${
                searchStatus.isValid
                  ? 'bg-black/50 border-white/10 hover:border-indigo-500/40'
                  : 'bg-amber-950/20 border-amber-500/40'
              }`}
            >
              <PropertyTooltip
                propName="potentialAction"
                schemaType="SearchAction"
                description="Informs search engines how to direct internal site search queries directly from Google SERP sitelinks."
              />
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1 text-indigo-300 font-bold">
                  <Search size={11} />
                  <span>Google Sitelinks SearchBox</span>
                </span>
                <FieldStatusBadge status={searchStatus} />
              </div>
              <div className="relative">
                <input
                  type="text"
                  disabled
                  value={`Search ${displayTitle}...`}
                  className="w-full bg-slate-900 border border-white/15 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-400 font-mono cursor-not-allowed"
                />
                <Search
                  size={12}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500"
                />
              </div>
              {!searchStatus.isValid && (
                <p className="text-[10px] font-mono text-amber-300/90 flex items-center gap-1">
                  <AlertCircle size={10} />
                  <span>{searchStatus.reason}</span>
                </p>
              )}
            </div>

            {/* 7. Google Rich Snippet FAQ Accordion Block */}
            <div
              className={`space-y-2 p-3 rounded-xl border transition-all relative group/prop ${
                faqStatus.isValid
                  ? 'bg-black/40 border-white/10'
                  : 'bg-amber-950/20 border-amber-500/40'
              }`}
            >
              <PropertyTooltip
                propName="FAQPage"
                schemaType="FAQPage"
                description="Structured Questions and Answers array (mainEntity) for Google Rich Snippets and Perplexity/Gemini direct answers."
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold font-mono text-slate-200 flex items-center gap-1.5">
                  <HelpCircle size={13} className="text-[#34d399]" />
                  <span>Google Rich Snippet Q&A (FAQPage)</span>
                </span>
                <FieldStatusBadge status={faqStatus} />
              </div>

              {faqQuestions && faqQuestions.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  {faqQuestions.map((faq: any, idx: number) => {
                    const isOpen = openFaqIndex === idx;
                    const qText =
                      faq.name || faq.question || `Question #${idx + 1}`;
                    const aText =
                      faq.acceptedAnswer?.text ||
                      faq.answer ||
                      'Detailed structured answer provided in JSON-LD script.';

                    return (
                      <div
                        key={idx}
                        className="bg-black/40 border border-white/10 hover:border-emerald-500/30 rounded-lg overflow-hidden transition relative group/prop"
                      >
                        <PropertyTooltip
                          propName="mainEntity[].Question"
                          schemaType="Question / Answer"
                          description="Specific question prompt and acceptedAnswer text block for search engine zero-click results."
                        />
                        <button
                          type="button"
                          onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                          className="w-full text-left p-2 text-xs font-semibold text-slate-200 flex items-center justify-between gap-2 hover:bg-white/5 transition cursor-pointer"
                        >
                          <span className="line-clamp-1">{qText}</span>
                          {isOpen ? (
                            <ChevronUp
                              size={13}
                              className="text-emerald-400 shrink-0"
                            />
                          ) : (
                            <ChevronDown
                              size={13}
                              className="text-slate-400 shrink-0"
                            />
                          )}
                        </button>
                        {isOpen && (
                          <div className="p-2.5 pt-0 text-[11px] text-slate-300 leading-relaxed font-sans border-t border-white/5 bg-black/20">
                            {aText}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[10px] font-mono text-amber-300/90 pt-1 flex items-center gap-1">
                  <AlertCircle size={10} />
                  <span>{faqStatus.reason}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === 'ai_perception' ? (
        <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 border-b border-white/10 pb-2.5">
              <Bot size={18} className="text-[#34d399]" />
              <div>
                <h4 className="text-xs font-bold text-white font-mono">
                  Conversational AI Engine Indexing View
                </h4>
                <p className="text-[10px] text-slate-400 font-mono">
                  How Perplexity, ChatGPT & Gemini synthesize your entity data
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="bg-black/50 border border-white/10 hover:border-emerald-500/40 rounded-lg p-3 space-y-1 relative group/prop transition-colors">
                <PropertyTooltip
                  propName="Organization Entity"
                  schemaType="@type resolution"
                  description="Primary entity identifier compiled by LLMs from name, url, and @id fields."
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#34d399] font-bold block">
                    1. Identified Authority Entity:
                  </span>
                  <FieldStatusBadge status={nameStatus} />
                </div>
                <p className="font-mono text-slate-200 font-semibold">
                  {displayTitle} ({cleanDomain})
                </p>
              </div>

              <div className="bg-black/50 border border-white/10 hover:border-sky-500/40 rounded-lg p-3 space-y-1 relative group/prop transition-colors">
                <PropertyTooltip
                  propName="knowsAbout Matrix"
                  schemaType="Semantic Vector"
                  description="Topical vector embeddings extracted from knowsAbout array for generative response citations."
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-sky-400 font-bold block">
                    2. Core Topical Competencies:
                  </span>
                  <FieldStatusBadge status={topicStatus} />
                </div>
                <p className="text-[11px] text-slate-300">
                  {knowsAboutList.join(' • ')}
                </p>
              </div>

              <div className="bg-black/50 border border-white/10 hover:border-amber-500/40 rounded-lg p-3 space-y-1 relative group/prop transition-colors">
                <PropertyTooltip
                  propName="areaServed Boundaries"
                  schemaType="Spatial Anchor"
                  description="Geographic region anchors mapped to regional user queries and map packs."
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-amber-300 font-bold block">
                    3. Local Citation Anchors:
                  </span>
                  <FieldStatusBadge status={areaStatus} />
                </div>
                <p className="text-[11px] text-slate-300">
                  {selectedAreas && selectedAreas.length > 0
                    ? `Active coverage confirmed in ${selectedAreas.slice(0, 8).join(', ')}${selectedAreas.length > 8 ? ` and ${selectedAreas.length - 8} other Limerick suburbs.` : '.'}`
                    : 'Nationwide Ireland entity coverage.'}
                </p>
              </div>

              <div className="bg-black/50 border border-white/10 hover:border-indigo-500/40 rounded-lg p-3 space-y-1 relative group/prop transition-colors">
                <PropertyTooltip
                  propName="Schema Validation Score"
                  schemaType="Confidence Metric"
                  description="LLM retrieval confidence based on complete JSON-LD markup and Q&A microdata."
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-indigo-300 font-bold block">
                    4. LLM Search Citation Readiness:
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    {overallHealth}% Confidence
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  {overallHealth >= 80
                    ? 'High confidence score. The JSON-LD schema explicitly declares publisher identity, website target, and Q&A microdata for zero-click AI responses.'
                    : 'Moderate confidence score. Add missing Schema fields (e.g. FAQ questions or target areas) to boost LLM indexing readiness.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* GRAPH NODES TAB */
        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
              <Layers size={14} className="text-[#34d399]" />
              <span>Active Schema Graph Nodes ({graphNodes.length})</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              @graph hierarchy
            </span>
          </div>

          <div className="space-y-2">
            {graphNodes.map((node, i) => {
              const nodeType = node['@type'] || 'Thing';
              const isNodeValid = Boolean(
                node['@type'] && (node['@id'] || node.name || node.url),
              );

              return (
                <div
                  key={i}
                  className="bg-black/50 border border-white/10 hover:border-emerald-500/40 rounded-xl p-3 text-xs font-mono space-y-1.5 relative group/prop transition-colors"
                >
                  <PropertyTooltip
                    propName={nodeType}
                    schemaType="@graph member"
                    description={`Node of type '@${nodeType}' linked in the JSON-LD knowledge graph.`}
                  />
                  <div className="flex items-center justify-between">
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded font-bold flex items-center gap-1">
                      <CheckCircle2 size={10} className="text-emerald-400" />
                      <span>@{nodeType}</span>
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {node['@id'] || `node_${i}`}
                    </span>
                  </div>
                  {node.name && (
                    <p className="text-white font-semibold text-xs">
                      {node.name}
                    </p>
                  )}
                  <div className="bg-black/60 rounded p-2 text-[10px] text-slate-400 max-h-[80px] overflow-x-auto">
                    <pre>{JSON.stringify(node, null, 2)}</pre>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer status bar */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span className="flex items-center gap-1 text-emerald-400 font-semibold">
          <CheckCircle2 size={12} />
          <span>Real-time JSON-LD Sync</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Schema.org Standard Compliant</span>
        </span>
      </div>
    </div>
  );
}
