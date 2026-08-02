import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Sparkles,
  Compass,
  AlertCircle,
  FileText,
  CheckCircle2,
  TrendingUp,
  Target,
  Layers,
  ExternalLink,
  Copy,
  ArrowRight,
  Shield,
  BarChart3,
  Users,
  Building2,
  Check,
  Zap,
} from 'lucide-react';

export interface SERPResult {
  keyword: string;
  intent: string;
  difficulty: number;
  search_volume?: number;
  top_results: {
    position: number;
    title: string;
    url: string;
    meta_description: string;
    themes: string[];
    strengths: string[];
    weaknesses: string[];
    domain_authority?: number;
    monthly_traffic?: number;
    content_type?: string;
    ranking_gaps?: string[];
  }[];
  opportunities: string[];
  ranking_gap_keywords?: {
    keyword: string;
    competitor: string;
    competitorRank: number;
    volume: number;
    difficulty: number;
    opportunityScore: number;
    suggestedAction: string;
  }[];
  recommended_outline: string[];
  summary_markdown?: string;
}

interface SERPViewerProps {
  serp?: SERPResult | null;
  onSendToWriter?: (outline: string[], title: string, topic: string) => void;
}

export default function SERPViewer({ serp, onSendToWriter }: SERPViewerProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'competitors' | 'gaps' | 'outline'
  >('overview');
  const [copiedOutline, setCopiedOutline] = useState(false);

  if (!serp) {
    return (
      <div
        className="bg-[#0f172a]/40 border-2 border-dashed border-white/10 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[220px]"
        id="serp-empty-state"
      >
        <div className="w-12 h-12 rounded-full bg-white/5 text-slate-400 flex items-center justify-center mb-3 border border-white/10">
          <Compass size={18} />
        </div>
        <h4 className="font-display font-semibold text-slate-200 text-sm">
          No SERP analysis yet
        </h4>
        <p className="text-xs text-slate-400 max-w-sm mt-1 leading-normal">
          Run a comprehensive SERP analysis from the search engine intelligence
          dashboard.
        </p>
      </div>
    );
  }

  // Determine difficulty color badges
  const getDifficultyColor = (score: number) => {
    if (score < 30)
      return 'bg-emerald-500/20 text-[#34d399] border-emerald-500/30';
    if (score < 55) return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
    if (score < 75) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
  };

  const getIntentColor = (intent: string) => {
    const term = intent?.toLowerCase() || '';
    if (term.includes('transactional'))
      return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    if (term.includes('commercial'))
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    if (term.includes('local'))
      return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
    return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
  };

  const handleCopyOutline = () => {
    const text = serp.recommended_outline
      .map((line, i) => `${i + 1}. ${line}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedOutline(true);
    setTimeout(() => setCopiedOutline(false), 2000);
  };

  return (
    <div
      className="space-y-6 text-left animate-in fade-in duration-300"
      id="serp-viewer-container"
    >
      {/* Title & Stats Summary Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/10 text-[#34d399] border border-emerald-500/20 text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold tracking-wider">
              Google Ireland (.ie) SERP
            </span>
            {serp.search_volume && (
              <span className="bg-white/5 text-slate-300 border border-white/10 text-[10px] font-mono px-2 py-0.5 rounded font-semibold">
                Est. Volume: {serp.search_volume.toLocaleString()}/mo
              </span>
            )}
          </div>
          <h2 className="text-xl md:text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2 mt-1">
            <TrendingUp className="text-[#34d399]" size={22} />
            <span>
              Organic Target:{' '}
              <em className="text-[#34d399] not-italic font-mono font-semibold">
                “{serp.keyword}”
              </em>
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Expanded competitor landscape, ranking gaps, and strategic content
            opportunities
          </p>
        </div>

        {/* Quick status pills */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getIntentColor(serp.intent)}`}
          >
            <strong>Intent:</strong> {serp.intent}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(serp.difficulty)}`}
          >
            <strong>Difficulty:</strong> {serp.difficulty}/100
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-white/5 border-white/10 text-slate-300">
            <strong>Competitors Audited:</strong> {serp.top_results.length}
          </span>
        </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-[#34d399] text-[#0f172a]'
              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <BarChart3 size={13} />
          <span>Overview & Insights</span>
        </button>

        <button
          onClick={() => setActiveTab('competitors')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'competitors'
              ? 'bg-[#34d399] text-[#0f172a]'
              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Building2 size={13} />
          <span>Expanded Competitors ({serp.top_results.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('gaps')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'gaps'
              ? 'bg-[#34d399] text-[#0f172a]'
              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Target size={13} />
          <span>Ranking Gaps Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('outline')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'outline'
              ? 'bg-[#34d399] text-[#0f172a]'
              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <FileText size={13} />
          <span>Target Article Outline</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & INSIGHTS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Executive Summary Markdown */}
          {serp.summary_markdown && (
            <div
              className="glass-card p-6 space-y-4 border-l-4 border-l-[#34d399]"
              id="serp-summary-card"
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#34d399] font-mono flex items-center gap-2">
                <Sparkles size={14} className="fill-[#34d399]/20" />
                <span>AI Strategic SERP Analysis Summary</span>
              </h3>
              <div className="prose prose-invert prose-xs text-slate-300 max-w-none leading-relaxed space-y-2 markdown-body">
                <ReactMarkdown>{serp.summary_markdown}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Quick 2-Column Bento: Opportunities & Outline Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Strategic Opportunities */}
            <div
              className="glass-card p-5 space-y-3"
              id="serp-opportunities-card"
            >
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#34d399] font-mono flex items-center gap-2 border-b border-white/10 pb-2">
                <Zap size={13} className="text-[#34d399]" />
                <span>Content Opportunities & Winning Angles</span>
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-300">
                {serp.opportunities.map((o, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5 hover:border-white/10 transition"
                  >
                    <span className="bg-[#34d399]/20 text-[#34d399] font-bold text-xs p-1 rounded-md shrink-0">
                      #{i + 1}
                    </span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Outline Preview */}
            <div
              className="glass-card p-5 space-y-3"
              id="serp-outline-preview-card"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 font-mono flex items-center gap-2">
                  <FileText size={13} className="text-sky-400" />
                  <span>Recommended Article Outline</span>
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyOutline}
                    className="text-[10px] text-slate-300 hover:text-white bg-white/5 border border-white/10 px-2 py-1 rounded font-mono flex items-center gap-1 cursor-pointer"
                  >
                    {copiedOutline ? (
                      <Check size={10} className="text-emerald-400" />
                    ) : (
                      <Copy size={10} />
                    )}
                    <span>{copiedOutline ? 'Copied' : 'Copy'}</span>
                  </button>
                  {onSendToWriter && (
                    <button
                      onClick={() =>
                        onSendToWriter(
                          serp.recommended_outline,
                          `Ultimate Guide to ${serp.keyword}`,
                          serp.keyword,
                        )
                      }
                      className="text-[10px] bg-[#34d399] text-[#0f172a] hover:bg-[#2bc48d] px-2.5 py-1 rounded font-bold font-mono flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <ArrowRight size={10} />
                      <span>Send to Writer</span>
                    </button>
                  )}
                </div>
              </div>

              <ul className="space-y-2 text-xs text-slate-300">
                {serp.recommended_outline.map((o, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 leading-relaxed bg-white/5 p-2.5 rounded-lg border border-white/5"
                  >
                    <span className="text-sky-400 font-bold shrink-0 font-mono text-xs">
                      {i + 1}.
                    </span>
                    <span className="font-medium text-slate-200">{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: EXPANDED COMPETITORS LIST */}
      {activeTab === 'competitors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#34d399] font-mono flex items-center gap-2">
              <Building2 size={14} />
              <span>
                Google Ireland Top {serp.top_results.length} Ranking Domains
              </span>
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              Sorted by SERP Organic Rank #1 - #{serp.top_results.length}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {serp.top_results.map((r) => (
              <div
                key={r.position}
                className="glass-card p-5 hover:border-white/15 transition duration-200"
                id={`serp-result-pos-${r.position}`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[#34d399] font-bold text-xs bg-[#34d399]/10 border border-[#34d399]/20 px-2 py-0.5 rounded-md">
                        Position #{r.position}
                      </span>
                      {r.content_type && (
                        <span className="text-[10px] font-mono text-slate-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                          {r.content_type}
                        </span>
                      )}
                      {r.domain_authority && (
                        <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                          DA: {r.domain_authority}
                        </span>
                      )}
                      {r.monthly_traffic && (
                        <span className="text-[10px] font-mono text-sky-300 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded">
                          Traffic: {r.monthly_traffic.toLocaleString()}/mo
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-white tracking-tight leading-snug mt-2">
                      {r.title}
                    </h3>
                    <p className="text-[10px] text-sky-400 font-mono mt-1 hover:underline truncate max-w-xl flex items-center gap-1">
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1"
                      >
                        <span>{r.url}</span>
                        <ExternalLink size={10} />
                      </a>
                    </p>
                    <p className="text-slate-300 text-xs mt-2 leading-relaxed bg-black/25 p-3 rounded-lg border border-white/5">
                      {r.meta_description}
                    </p>
                  </div>
                </div>

                {/* Quick grids for Themes, Strengths, Weaknesses, Ranking Gaps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-white/5">
                  {/* Themes */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 block">
                      Themes:
                    </span>
                    <ul className="space-y-1 text-slate-300 text-xs">
                      {r.themes.map((t, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-1.5 leading-normal"
                        >
                          <span className="text-[#34d399] font-bold shrink-0">
                            ·
                          </span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Strengths */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#34d399] block">
                      Strengths:
                    </span>
                    <ul className="space-y-1 text-slate-300 text-xs">
                      {r.strengths.map((t, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-1.5 leading-normal"
                        >
                          <span className="text-[#34d399] font-bold shrink-0">
                            ✓
                          </span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-rose-400 block">
                      Weaknesses:
                    </span>
                    <ul className="space-y-1 text-slate-300 text-xs">
                      {r.weaknesses.map((t, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-1.5 leading-normal"
                        >
                          <span className="text-rose-400 font-bold shrink-0">
                            ✗
                          </span>
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Ranking Gaps */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-sky-400 block">
                      Content Gaps:
                    </span>
                    <ul className="space-y-1 text-slate-300 text-xs">
                      {(
                        r.ranking_gaps || [
                          'No interactive tools',
                          'Complex jargon',
                        ]
                      ).map((g, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-1.5 leading-normal"
                        >
                          <span className="text-sky-400 font-bold shrink-0">
                            ⚡
                          </span>
                          <span>{g}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: RANKING GAPS MATRIX */}
      {activeTab === 'gaps' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#34d399] font-mono flex items-center gap-2">
                <Target size={14} />
                <span>Google Ireland Organic Ranking Gap Matrix</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                High-intent Irish keywords where competitors rank on Page 1 but
                lack depth or localized answers.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/20">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-white/5 border-b border-white/10 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Gap Keyword</th>
                  <th className="p-3">Primary Competitor</th>
                  <th className="p-3 text-center">Comp Rank</th>
                  <th className="p-3 text-center">Volume</th>
                  <th className="p-3 text-center">KD</th>
                  <th className="p-3 text-center">Opportunity</th>
                  <th className="p-3">Suggested Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(
                  serp.ranking_gap_keywords || [
                    {
                      keyword: 'SEAI grant heat pump Limerick V94',
                      competitor: 'SEAI Ireland',
                      competitorRank: 1,
                      volume: 4800,
                      difficulty: 32,
                      opportunityScore: 94,
                      suggestedAction:
                        'Create targeted regional landing page with V94 Eircode map and local installer directory.',
                    },
                    {
                      keyword: 'BER rating G to A upgrade cost Ireland',
                      competitor: 'SuperHomes',
                      competitorRank: 3,
                      volume: 3600,
                      difficulty: 35,
                      opportunityScore: 91,
                      suggestedAction:
                        'Publish step-by-step cost breakdown table comparing individual grants vs One-Stop-Shop.',
                    },
                    {
                      keyword:
                        'attic insulation grant application process 2026',
                      competitor: 'Citizens Information',
                      competitorRank: 2,
                      volume: 2900,
                      difficulty: 28,
                      opportunityScore: 88,
                      suggestedAction:
                        'Draft a visual 4-step infographic guide with direct SEAI portal download checklist.',
                    },
                    {
                      keyword: 'heat loss indicator pre assessment checklist',
                      competitor: 'RetroKit',
                      competitorRank: 4,
                      volume: 2100,
                      difficulty: 25,
                      opportunityScore: 85,
                      suggestedAction:
                        'Integrate our dynamic Energy Estimator tool with automated HLI calculation.',
                    },
                  ]
                ).map((gap, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition">
                    <td className="p-3 font-semibold text-white font-mono">
                      {gap.keyword}
                    </td>
                    <td className="p-3 text-slate-300">{gap.competitor}</td>
                    <td className="p-3 text-center font-mono">
                      <span className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[11px]">
                        #{gap.competitorRank}
                      </span>
                    </td>
                    <td className="p-3 text-center font-mono text-slate-300">
                      {gap.volume.toLocaleString()}/mo
                    </td>
                    <td className="p-3 text-center font-mono">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getDifficultyColor(gap.difficulty)}`}
                      >
                        {gap.difficulty}
                      </span>
                    </td>
                    <td className="p-3 text-center font-mono">
                      <span className="bg-[#34d399]/20 text-[#34d399] border border-[#34d399]/30 px-2 py-0.5 rounded text-[11px] font-bold">
                        {gap.opportunityScore}/100
                      </span>
                    </td>
                    <td className="p-3 text-slate-300 leading-normal max-w-xs">
                      {gap.suggestedAction}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: TARGET ARTICLE OUTLINE & ACTION */}
      {activeTab === 'outline' && (
        <div className="glass-card p-6 space-y-5 border border-sky-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-sky-400 font-mono flex items-center gap-2">
                <FileText size={16} />
                <span>Recommended Article Content Outline</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Structured section-by-section outline engineered to outrank top
                competitors on Google Ireland.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopyOutline}
                className="bg-white/5 hover:bg-white/10 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border border-white/10 transition flex items-center gap-1.5 cursor-pointer"
              >
                {copiedOutline ? (
                  <Check size={12} className="text-emerald-400" />
                ) : (
                  <Copy size={12} />
                )}
                <span>
                  {copiedOutline ? 'Copied to Clipboard' : 'Copy Outline'}
                </span>
              </button>

              {onSendToWriter && (
                <button
                  onClick={() =>
                    onSendToWriter(
                      serp.recommended_outline,
                      `Ultimate Guide to ${serp.keyword}`,
                      serp.keyword,
                    )
                  }
                  className="bg-[#34d399] hover:bg-[#2bc48d] text-[#0f172a] px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#34d399]/10"
                >
                  <ArrowRight size={13} />
                  <span>Send to AI Writer</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {serp.recommended_outline.map((o, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-white/5 p-3.5 rounded-xl border border-white/5 hover:border-white/15 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30 font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  H2
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-mono">
                    Section {i + 1}: {o}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                    Target focus keywords:{' '}
                    <span className="text-slate-300 font-mono">
                      {serp.keyword}
                    </span>
                    ,{' '}
                    <span className="text-slate-300 font-mono">
                      BER upgrade Ireland
                    </span>
                    ,{' '}
                    <span className="text-slate-300 font-mono">
                      SEAI grant steps
                    </span>
                    .
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
