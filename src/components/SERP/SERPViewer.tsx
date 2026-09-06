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
  Activity,
  Bell,
  GitCommit,
  Radio,
  Eye,
  MapPin,
  HelpCircle,
  Video,
  Calculator,
  RefreshCw,
} from 'lucide-react';
import {
  SERPFeatureItem,
  CompetitorDiffResult,
  SERPAlertItem,
  SERPCompetitor,
  SERPRankingGapKeyword,
  detectSERPFeatures,
  classifySearchIntent,
  computeCompetitorDiff,
} from '../../logic/serpIntelligence';
import {
  Position0AnswerCard,
  generatePosition0AnswerCard,
} from '../../logic/positionZeroHijacker';

export interface SERPResult {
  keyword: string;
  intent: string;
  difficulty: number;
  search_volume?: number;
  top_results: SERPCompetitor[];
  opportunities: string[];
  ranking_gap_keywords?: SERPRankingGapKeyword[];
  recommended_outline: string[];
  summary_markdown?: string;
  features?: SERPFeatureItem[];
  diff?: CompetitorDiffResult;
  volatilityIndex?: number;
  volatilityCategory?: 'stable' | 'moderate_shift' | 'high_turbulence';
  alerts?: SERPAlertItem[];
}

interface SERPViewerProps {
  serp?: SERPResult | null;
  onSendToWriter?: (outline: string[], title: string, topic: string) => void;
}

export default function SERPViewer({ serp, onSendToWriter }: SERPViewerProps) {
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'competitors'
    | 'diff'
    | 'features'
    | 'gaps'
    | 'outline'
    | 'alerts'
    | 'hijacker'
  >('overview');
  const [copiedOutline, setCopiedOutline] = useState(false);
  const [positionZeroCard, setPositionZeroCard] =
    useState<Position0AnswerCard | null>(null);
  const [hijackLoading, setHijackLoading] = useState(false);
  const [copiedSchema, setCopiedSchema] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const handleHijackPositionZero = async () => {
    if (!serp?.keyword) return;
    setHijackLoading(true);
    try {
      const res = await fetch('/api/seo/hijack-position-zero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: serp.keyword,
          competitorSnippet: serp.top_results?.[0]?.meta_description,
        }),
      });
      const data = await res.json();
      if (data.success && data.answerCard) {
        setPositionZeroCard(data.answerCard);
      } else {
        const fallback = generatePosition0AnswerCard({ keyword: serp.keyword });
        setPositionZeroCard(fallback);
      }
    } catch {
      const fallback = generatePosition0AnswerCard({ keyword: serp.keyword });
      setPositionZeroCard(fallback);
    } finally {
      setHijackLoading(false);
    }
  };

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

  // Derive dynamic fallback features/diff if not already compiled
  const features =
    serp.features || detectSERPFeatures(serp.keyword, serp.top_results);
  const diff =
    serp.diff || computeCompetitorDiff(null, serp.top_results, serp.keyword);
  const volatility =
    serp.volatilityIndex ?? Math.round(diff.volatilityShift * 100);
  const alerts = serp.alerts || [];

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
            <span className="bg-sky-500/10 text-sky-300 border border-sky-500/20 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase">
              Phase 8–15 Engine
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
            Expanded competitor landscape, competitor diff engine, rich SERP
            features, and ranking gaps
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
            <strong>Turbulence:</strong> {volatility}%
          </span>
        </div>
      </div>

      {/* Internal Navigation Tabs (Phases 8–15) */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-[#34d399] text-[#0f172a]'
              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <BarChart3 size={13} />
          <span>Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('competitors')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'competitors'
              ? 'bg-[#34d399] text-[#0f172a]'
              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Building2 size={13} />
          <span>Top Competitors ({serp.top_results.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('diff')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'diff'
              ? 'bg-[#34d399] text-[#0f172a]'
              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <GitCommit size={13} />
          <span>Competitor Diff ({diff.totalChanges} shifts)</span>
        </button>

        <button
          onClick={() => setActiveTab('features')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'features'
              ? 'bg-[#34d399] text-[#0f172a]'
              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Sparkles size={13} />
          <span>SERP Features ({features.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('gaps')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'gaps'
              ? 'bg-[#34d399] text-[#0f172a]'
              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Target size={13} />
          <span>Ranking Gaps</span>
        </button>

        <button
          onClick={() => setActiveTab('outline')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'outline'
              ? 'bg-[#34d399] text-[#0f172a]'
              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <FileText size={13} />
          <span>Target Outline</span>
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'alerts'
              ? 'bg-[#34d399] text-[#0f172a]'
              : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Bell size={13} />
          <span>Change Alerts {alerts.length > 0 && `(${alerts.length})`}</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('hijacker');
            if (!positionZeroCard) handleHijackPositionZero();
          }}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'hijacker'
              ? 'bg-amber-400 text-slate-900 shadow-lg shadow-amber-500/20'
              : 'bg-amber-500/10 text-amber-300 hover:text-white hover:bg-amber-500/20 border border-amber-500/30'
          }`}
        >
          <Zap size={13} className="text-amber-400" />
          <span>⚡ Position 0 Hijacker</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & INSIGHTS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
                    <span className="bg-[#34d399]/20 text-[#34d399] font-bold text-xs p-1 rounded-md shrink-0 font-mono">
                      #{i + 1}
                    </span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="glass-card p-5 space-y-3"
              id="serp-outline-preview-card"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 font-mono flex items-center gap-2">
                  <FileText size={13} className="text-sky-400" />
                  <span>Recommended Article Outline</span>
                </h3>
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

      {/* TAB 2: EXPANDED COMPETITORS */}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-white/5">
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

      {/* TAB 3: COMPETITOR DIFF ENGINE (Phase 9) */}
      {activeTab === 'diff' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-sky-400 font-mono flex items-center gap-2">
                <GitCommit size={14} />
                <span>Phase 9 — Competitor Diff Engine</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Tracks position changes (Δpos), new Page 1 entrants, and dropped
                domains between crawler snapshot passes.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                +{diff.climbedCount} Climbed
              </span>
              <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                -{diff.fallenCount} Dropped
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/20">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-white/5 border-b border-white/10 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Domain / Result</th>
                  <th className="p-3 text-center">Previous</th>
                  <th className="p-3 text-center">Current</th>
                  <th className="p-3 text-center">Rank Diff (Δ)</th>
                  <th className="p-3">Shift Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {diff.diffs.map((d, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition">
                    <td className="p-3">
                      <div className="font-semibold text-white font-mono">
                        {d.domain}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-sm">
                        {d.title}
                      </div>
                    </td>
                    <td className="p-3 text-center font-mono">
                      {d.oldPosition ? `#${d.oldPosition}` : '—'}
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-white">
                      #{d.newPosition}
                    </td>
                    <td className="p-3 text-center font-mono font-bold">
                      {d.positionChange > 0 ? (
                        <span className="text-emerald-400">
                          +{d.positionChange} ↑
                        </span>
                      ) : d.positionChange < 0 ? (
                        <span className="text-rose-400">
                          {d.positionChange} ↓
                        </span>
                      ) : (
                        <span className="text-slate-400">0 →</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          d.status === 'climbed'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : d.status === 'fallen'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : d.status === 'new_entrant'
                                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                                : 'bg-white/5 text-slate-400 border border-white/10'
                        }`}
                      >
                        {d.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: SERP FEATURES & INTENT (Phases 10 & 11) */}
      {activeTab === 'features' && (
        <div className="space-y-5">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-2">
              <Sparkles size={14} />
              <span>
                Phases 10 & 11 — Detected SERP Features & Search Intent
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Identifies Google Ireland rich snippets, People Also Ask
              accordions, local packs, and multi-intent query semantics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feat, idx) => (
              <div
                key={idx}
                className="glass-card p-4 space-y-2 border border-white/10"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {feat.type === 'featured_snippet' && (
                      <Sparkles size={14} className="text-amber-400" />
                    )}
                    {feat.type === 'people_also_ask' && (
                      <HelpCircle size={14} className="text-sky-400" />
                    )}
                    {feat.type === 'local_pack' && (
                      <MapPin size={14} className="text-emerald-400" />
                    )}
                    {feat.type === 'calculator_widget' && (
                      <Calculator size={14} className="text-purple-400" />
                    )}
                    {feat.type === 'video_pack' && (
                      <Video size={14} className="text-rose-400" />
                    )}
                    {feat.type === 'sitelinks' && (
                      <Layers size={14} className="text-blue-400" />
                    )}
                    <h4 className="text-xs font-bold text-white font-mono">
                      {feat.title}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-semibold">
                    Relevance: {feat.relevanceScore}%
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {feat.description}
                </p>
                {feat.sourceUrl && (
                  <a
                    href={feat.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-sky-400 hover:underline flex items-center gap-1 font-mono pt-1"
                  >
                    <span>{feat.sourceUrl}</span>
                    <ExternalLink size={10} />
                  </a>
                )}
                {feat.type === 'featured_snippet' && (
                  <button
                    onClick={() => {
                      setActiveTab('hijacker');
                      if (!positionZeroCard) handleHijackPositionZero();
                    }}
                    className="mt-2 text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Zap size={11} className="text-amber-400" />
                    <span>⚡ Hijack Position 0 / AI Overview</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: RANKING GAPS */}
      {activeTab === 'gaps' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#34d399] font-mono flex items-center gap-2">
                <Target size={14} />
                <span>
                  Google Ireland Organic Ranking Gap Matrix (Phase 12)
                </span>
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
                {(serp.ranking_gap_keywords || []).map((gap, idx) => (
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

      {/* TAB 6: TARGET OUTLINE */}
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
                <span>{copiedOutline ? 'Copied' : 'Copy Outline'}</span>
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

      {/* TAB 7: CHANGE ALERTS & VOLATILITY (Phases 13 & 14) */}
      {activeTab === 'alerts' && (
        <div className="space-y-5">
          <div className="border-b border-white/10 pb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-400 font-mono flex items-center gap-2">
              <Bell size={14} />
              <span>
                Phases 13 & 14 — SERP Volatility Predictor & Change Alerts
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live algorithmic turbulence monitoring and automated strategic
              change alerts.
            </p>
          </div>

          {/* Volatility Meter Card */}
          <div className="glass-card p-5 space-y-3 border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-slate-300 uppercase">
                SERP Page 1 Turbulence Index:
              </span>
              <span className="font-mono font-bold text-sm text-emerald-400">
                {volatility}%
              </span>
            </div>
            <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden border border-white/10">
              <div
                className={`h-full transition-all duration-500 ${
                  volatility < 35
                    ? 'bg-emerald-400'
                    : volatility < 65
                      ? 'bg-amber-400'
                      : 'bg-rose-400'
                }`}
                style={{ width: `${volatility}%` }}
              />
            </div>
            <p className="text-xs text-slate-400">
              {volatility < 35
                ? 'Stable SERP environment. Top rankings have low displacement velocity.'
                : volatility < 65
                  ? 'Moderate SERP fluctuation. Periodic position shifts observed.'
                  : 'Severe turbulence detected. Active algorithm testing or content competition in progress.'}
            </p>
          </div>

          {/* Alerts List */}
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="p-6 bg-white/5 rounded-xl text-center text-xs text-slate-400 font-mono border border-white/5">
                No critical SERP disruption alerts detected for this query.
              </div>
            ) : (
              alerts.map((al) => (
                <div
                  key={al.id}
                  className={`p-4 rounded-xl border flex items-start gap-3 ${
                    al.severity === 'high'
                      ? 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                      : al.severity === 'medium'
                        ? 'bg-amber-950/30 border-amber-500/30 text-amber-300'
                        : 'bg-sky-950/30 border-sky-500/30 text-sky-300'
                  }`}
                >
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <div className="font-bold font-mono uppercase">
                      {al.type.replace(/_/g, ' ')}
                    </div>
                    <div>{al.message}</div>
                    <div className="text-[11px] opacity-80 pt-1 font-mono">
                      <strong>Action:</strong> {al.actionRequired}
                    </div>
                    {al.type === 'FEATURED_SNIPPET_OPPORTUNITY' && (
                      <button
                        onClick={() => {
                          setActiveTab('hijacker');
                          if (!positionZeroCard) handleHijackPositionZero();
                        }}
                        className="mt-2 text-[11px] font-semibold px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 flex items-center gap-1 cursor-pointer transition"
                      >
                        <Zap size={11} className="text-amber-400" />
                        <span>⚡ Launch Position 0 Hijacker</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 8: POSITION 0 & AI OVERVIEW HIJACKER */}
      {activeTab === 'hijacker' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono flex items-center gap-2">
                <Zap size={15} className="text-amber-400" />
                <span>
                  Position 0 & AI Overview Hijacker (Autonomous Answer Engine)
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Generates a 40–55 word authoritative answer card with W3C
                SpeakableSpecification JSON-LD schema to capture Google Ireland
                zero-click citations.
              </p>
            </div>
            <button
              onClick={handleHijackPositionZero}
              disabled={hijackLoading}
              className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition flex items-center gap-1.5 self-start shrink-0 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                size={12}
                className={hijackLoading ? 'animate-spin' : ''}
              />
              <span>
                {hijackLoading ? 'Synthesizing...' : 'Regenerate Snippet'}
              </span>
            </button>
          </div>

          {hijackLoading && !positionZeroCard ? (
            <div className="p-12 text-center text-xs font-mono text-slate-400 space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mx-auto" />
              <div>
                Reverse-engineering competitor Position 0 signals for "
                {serp.keyword}"...
              </div>
            </div>
          ) : positionZeroCard ? (
            <div className="space-y-5">
              {/* Score & Telemetry Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="glass-card p-3.5 space-y-1 border border-amber-500/20 bg-amber-500/5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Hijack Probability
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold font-mono text-amber-400">
                      {positionZeroCard.hijackScore}%
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                      {positionZeroCard.hijackScore >= 85 ? 'HIGH' : 'MODERATE'}
                    </span>
                  </div>
                </div>

                <div className="glass-card p-3.5 space-y-1 border border-white/10">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Word Count
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold font-mono text-white">
                      {positionZeroCard.wordCount}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {positionZeroCard.wordCount >= 40 &&
                      positionZeroCard.wordCount <= 55
                        ? '✓ Optimal (40–55)'
                        : 'Range 35–60'}
                    </span>
                  </div>
                </div>

                <div className="glass-card p-3.5 space-y-1 border border-white/10">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Snippet Format
                  </span>
                  <div className="text-sm font-bold font-mono text-sky-400 capitalize truncate">
                    {positionZeroCard.snippetType.replace(/_/g, ' ')}
                  </div>
                </div>

                <div className="glass-card p-3.5 space-y-1 border border-white/10">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Entity Coverage
                  </span>
                  <div className="text-sm font-bold font-mono text-emerald-400">
                    {positionZeroCard.keyEntities.length} Verified
                  </div>
                </div>
              </div>

              {/* 45-Word Answer Box Card */}
              <div className="glass-card p-5 space-y-3 border-2 border-amber-500/30 bg-gradient-to-b from-amber-500/10 to-transparent">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-amber-400" />
                    <span className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                      Position 0 Featured Snippet & AI Overview Card
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        positionZeroCard.conciseAnswer,
                      );
                      setCopiedSnippet(true);
                      setTimeout(() => setCopiedSnippet(false), 2000);
                    }}
                    className="text-[10px] font-mono px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-200 flex items-center gap-1 cursor-pointer transition"
                  >
                    {copiedSnippet ? (
                      <Check size={11} className="text-emerald-400" />
                    ) : (
                      <Copy size={11} />
                    )}
                    <span>
                      {copiedSnippet ? 'Copied Snippet' : 'Copy Snippet'}
                    </span>
                  </button>
                </div>

                <blockquote className="text-sm text-slate-100 font-medium leading-relaxed bg-black/40 p-4 rounded-xl border border-amber-500/20 italic">
                  "{positionZeroCard.conciseAnswer}"
                </blockquote>

                {/* Key Entities */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    High-Density Irish Entities Recognized by Google:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {positionZeroCard.keyEntities.map((ent, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                      >
                        {ent}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bullet Steps (if any) */}
                {positionZeroCard.bulletSteps &&
                  positionZeroCard.bulletSteps.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-white/10">
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                        Structured Step-by-Step Sequence (Captures Numbered List
                        Snippets):
                      </span>
                      <ol className="space-y-1.5 text-xs text-slate-300 list-decimal list-inside bg-black/20 p-3 rounded-lg border border-white/5">
                        {positionZeroCard.bulletSteps.map((step, idx) => (
                          <li key={idx} className="leading-relaxed">
                            <span className="font-medium text-slate-200">
                              {step}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                {/* Comparison Table (if any) */}
                {positionZeroCard.comparisonTable && (
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      Comparison Table (Captures Table Snippets):
                    </span>
                    <div className="overflow-x-auto rounded-lg border border-white/10 bg-black/30">
                      <table className="w-full text-left text-xs text-slate-300">
                        <thead className="bg-white/5 text-[10px] font-mono text-slate-400 uppercase">
                          <tr>
                            {positionZeroCard.comparisonTable.headers.map(
                              (h, i) => (
                                <th key={i} className="p-2.5">
                                  {h}
                                </th>
                              ),
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {positionZeroCard.comparisonTable.rows.map(
                            (row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-white/5">
                                {row.map((cell, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className="p-2.5 font-mono text-xs"
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ),
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* JSON-LD Schema Card */}
              <div className="glass-card p-5 space-y-3 border border-sky-500/20 bg-sky-500/5">
                <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Layers size={14} className="text-sky-400" />
                    <span className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                      W3C SpeakableSpecification & FAQPage JSON-LD Schema
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        JSON.stringify(positionZeroCard.schemaJsonLd, null, 2),
                      );
                      setCopiedSchema(true);
                      setTimeout(() => setCopiedSchema(false), 2000);
                    }}
                    className="text-[10px] font-mono px-2.5 py-1 rounded bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 flex items-center gap-1 cursor-pointer transition"
                  >
                    {copiedSchema ? (
                      <Check size={11} className="text-emerald-400" />
                    ) : (
                      <Copy size={11} />
                    )}
                    <span>
                      {copiedSchema ? 'Copied JSON-LD' : 'Copy JSON-LD'}
                    </span>
                  </button>
                </div>

                <pre className="text-[11px] font-mono text-sky-200/90 bg-black/60 p-3.5 rounded-xl border border-white/10 overflow-x-auto max-h-60 leading-normal">
                  {JSON.stringify(positionZeroCard.schemaJsonLd, null, 2)}
                </pre>
                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                  <span className="text-amber-400">Target Selectors:</span>
                  <span>
                    {positionZeroCard.speakableCssSelectors.join(', ')}
                  </span>
                </div>
              </div>

              {/* Tactical Recommendations */}
              <div className="glass-card p-4 space-y-2 border border-white/10 bg-white/5">
                <h4 className="text-xs font-bold font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield size={13} />
                  <span>Deployment Checklist for Position 0 Hijack</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {positionZeroCard.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2
                        size={13}
                        className="text-emerald-400 shrink-0 mt-0.5"
                      />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs font-mono text-slate-400 border border-dashed border-white/10 rounded-xl space-y-2">
              <p>
                Click "Regenerate Snippet" to synthesize a Position 0 Answer
                Card for "{serp.keyword}".
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
