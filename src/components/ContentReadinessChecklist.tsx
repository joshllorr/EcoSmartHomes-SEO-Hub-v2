import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Eye,
  Search,
  Sliders,
  Type,
  FileText,
  BarChart2,
  BookOpen,
  Plus,
  X,
  RefreshCw,
  Smartphone,
  Monitor,
  Zap,
} from 'lucide-react';
import { ArticleDraft } from '../types';
import { generateTitleMeta } from '../utils/generateTitleMeta';

interface ContentReadinessChecklistProps {
  title: string;
  content: string;
  metaDescription?: string;
  keywords?: string[];
  siteUrl?: string;
  tone?: string;
  onUpdateMetaDescription?: (newMeta: string) => void;
  onUpdateKeywords?: (newKeywords: string[]) => void;
  onApplyTitleSuggestion?: (suggestedTitle: string) => void;
  onQuickFixApplied?: (result: { title: string; metaDescription: string }) => void;
}

// English Syllable Counter Helper
function countWordSyllables(word: string): number {
  const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!cleanWord) return 0;
  if (cleanWord.length <= 3) return 1;

  // Replace common endings that don't add syllables
  const stripped = cleanWord
    .replace(/(?:[^laeiouy]|ed|es|e)$/, '')
    .replace(/^y/, '');

  const matches = stripped.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(1, matches.length) : 1;
}

export default function ContentReadinessChecklist({
  title,
  content,
  metaDescription = '',
  keywords = [],
  siteUrl = 'ecosmarthomes.ie',
  tone = 'Professional',
  onUpdateMetaDescription,
  onUpdateKeywords,
  onApplyTitleSuggestion,
  onQuickFixApplied,
}: ContentReadinessChecklistProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeView, setActiveView] = useState<'checklist' | 'serp'>('checklist');
  const [serpDevice, setSerpDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [customKeywordInput, setCustomKeywordInput] = useState('');
  const [localMeta, setLocalMeta] = useState(metaDescription);
  const [isGeneratingMeta, setIsGeneratingMeta] = useState(false);
  const [isQuickFixing, setIsQuickFixing] = useState(false);
  const [quickFixNotice, setQuickFixNotice] = useState<{
    title: string;
    meta: string;
    oldTitle: string;
    oldMeta: string;
  } | null>(null);
  const [quickFixError, setQuickFixError] = useState<string | null>(null);

  // Synchronize local meta description when prop changes
  React.useEffect(() => {
    setLocalMeta(metaDescription || '');
  }, [metaDescription]);

  // Derived content text metrics
  const textAnalysis = useMemo(() => {
    const rawText = content.replace(/[#*`_~[\]()]/g, ' ').trim();
    const words = rawText.split(/\s+/).filter(Boolean);
    const totalWords = words.length;

    // Sentences
    const sentences = rawText
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s.split(/\s+/).length > 2);
    const totalSentences = Math.max(1, sentences.length);

    // Syllables
    const totalSyllables = words.reduce(
      (acc, w) => acc + countWordSyllables(w),
      0,
    );

    // Flesch Reading Ease Formula: 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
    let fleschScore = 0;
    if (totalWords > 0) {
      fleschScore = Math.round(
        206.835 -
          1.015 * (totalWords / totalSentences) -
          84.6 * (totalSyllables / totalWords),
      );
      fleschScore = Math.max(0, Math.min(100, fleschScore));
    }

    // Paragraphs
    const paragraphs = content
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    // Headings (H2 / H3)
    const h2Count = (content.match(/^##\s+.+$/gm) || []).length;
    const h3Count = (content.match(/^###\s+.+$/gm) || []).length;

    // Average sentence length
    const avgWordsPerSentence = Math.round(totalWords / totalSentences);

    return {
      totalWords,
      totalSentences,
      totalSyllables,
      fleschScore,
      paragraphsCount: paragraphs.length,
      h2Count,
      h3Count,
      avgWordsPerSentence,
    };
  }, [content]);

  // 1. Title Length Audit (Optimal: 45 - 65 chars, max Google SERP is ~60-65)
  const titleAudit = useMemo(() => {
    const len = title.trim().length;
    let status: 'good' | 'warning' | 'error' = 'error';
    let message = '';

    if (len === 0) {
      status = 'error';
      message = 'Title is empty. Enter an SEO-optimized headline.';
    } else if (len < 40) {
      status = 'warning';
      message = `Too short (${len} chars). Optimal range is 45–65 characters for search engines.`;
    } else if (len > 65) {
      status = 'warning';
      message = `Too long (${len} chars). May truncate in Google search results (>60 chars).`;
    } else {
      status = 'good';
      message = `Optimal length (${len} chars). Fits cleanly in desktop and mobile SERPs.`;
    }

    return {
      length: len,
      status,
      message,
      targetMin: 45,
      targetMax: 65,
    };
  }, [title]);

  // 2. Meta Description Audit (Optimal: 120 - 160 chars)
  const metaAudit = useMemo(() => {
    const len = (localMeta || '').trim().length;
    let status: 'good' | 'warning' | 'error' = 'warning';
    let message = '';

    if (len === 0) {
      status = 'warning';
      message = 'Missing meta description. Search engines will generate a fallback snippet.';
    } else if (len < 110) {
      status = 'warning';
      message = `A bit short (${len} chars). Recommended 120–160 characters for maximum CTR.`;
    } else if (len > 165) {
      status = 'warning';
      message = `Too long (${len} chars). Will be clipped with ellipsis (...) in Google search.`;
    } else {
      status = 'good';
      message = `Optimal length (${len} chars). Delivers high click-through appeal in SERPs.`;
    }

    return {
      length: len,
      status,
      message,
      targetMin: 120,
      targetMax: 160,
    };
  }, [localMeta]);

  // 3. Focus Keywords & Density Audit (Optimal: 1.0% - 2.5%)
  const effectiveKeywords = useMemo(() => {
    if (keywords && keywords.length > 0) return keywords;
    // Derive sensible fallback keywords if none provided
    const wordsFromTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 4 && !['guide', 'about', 'their', 'which', 'where', 'boost'].includes(w));
    return wordsFromTitle.slice(0, 3);
  }, [keywords, title]);

  const keywordAudits = useMemo(() => {
    const lowerContent = content.toLowerCase();
    const lowerTitle = title.toLowerCase();
    const totalWords = Math.max(1, textAnalysis.totalWords);

    return effectiveKeywords.map((kw) => {
      const cleanKw = kw.trim().toLowerCase();
      if (!cleanKw) return null;

      // Escape special regex chars
      const escaped = cleanKw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
      const matches = lowerContent.match(regex);
      const count = matches ? matches.length : 0;
      const kwWordCount = cleanKw.split(/\s+/).length;

      // Density % = (occurrences * keyword words / total content words) * 100
      const density = Number(((count * kwWordCount / totalWords) * 100).toFixed(1));
      const inTitle = lowerTitle.includes(cleanKw);

      let status: 'good' | 'warning' | 'error' = 'warning';
      let note = '';

      if (count === 0) {
        status = 'error';
        note = 'Missing from article body';
      } else if (density < 0.8) {
        status = 'warning';
        note = `Low density (${density}%). Aim for 1.0%–2.5%.`;
      } else if (density > 3.0) {
        status = 'error';
        note = `Over-optimized (${density}%). Risk of keyword stuffing.`;
      } else {
        status = 'good';
        note = `Optimal density (${density}%, ${count}x occurrences)`;
      }

      return {
        keyword: kw,
        count,
        density,
        inTitle,
        status,
        note,
      };
    }).filter(Boolean);
  }, [effectiveKeywords, content, title, textAnalysis.totalWords]);

  const overallKeywordStatus: 'good' | 'warning' | 'error' = useMemo(() => {
    if (keywordAudits.length === 0) return 'warning';
    const hasError = keywordAudits.some((k) => k?.status === 'error');
    if (hasError) return 'warning';
    const allGood = keywordAudits.every((k) => k?.status === 'good');
    return allGood ? 'good' : 'warning';
  }, [keywordAudits]);

  // 4. Readability Audit
  const readabilityAudit = useMemo(() => {
    const { fleschScore, avgWordsPerSentence, h2Count, totalWords } = textAnalysis;

    let scoreLabel = 'Standard';
    let status: 'good' | 'warning' | 'error' = 'good';
    let feedback = '';

    if (totalWords < 150) {
      status = 'warning';
      scoreLabel = 'Short Draft';
      feedback = 'Add more substantive content for an accurate readability evaluation.';
    } else if (fleschScore >= 60 && fleschScore <= 80) {
      status = 'good';
      scoreLabel = `Optimal Ease (${fleschScore}/100)`;
      feedback = 'Plain English, highly accessible to Irish homeowners and property owners.';
    } else if (fleschScore > 80) {
      status = 'good';
      scoreLabel = `Very Easy (${fleschScore}/100)`;
      feedback = 'Conversational and straightforward to understand.';
    } else if (fleschScore >= 45 && fleschScore < 60) {
      status = 'warning';
      scoreLabel = `Moderate (${fleschScore}/100)`;
      feedback = 'Slightly technical. Consider breaking down complex sentences.';
    } else {
      status = 'error';
      scoreLabel = `Difficult (${fleschScore}/100)`;
      feedback = 'Dense sentence structures. Simplify vocabulary and shorten sentences.';
    }

    return {
      fleschScore,
      scoreLabel,
      status,
      feedback,
      avgWordsPerSentence,
      h2Count,
    };
  }, [textAnalysis]);

  // Overall Score Calculation (0 - 100)
  const readinessScore = useMemo(() => {
    let score = 0;

    // Title (25 pts)
    if (titleAudit.status === 'good') score += 25;
    else if (titleAudit.status === 'warning') score += 15;
    else score += 5;

    // Meta (25 pts)
    if (metaAudit.status === 'good') score += 25;
    else if (metaAudit.status === 'warning') score += (metaAudit.length > 0 ? 15 : 5);

    // Keywords (25 pts)
    if (overallKeywordStatus === 'good') score += 25;
    else if (overallKeywordStatus === 'warning') score += 15;
    else score += 5;

    // Readability (25 pts)
    if (readabilityAudit.status === 'good') score += 25;
    else if (readabilityAudit.status === 'warning') score += 15;
    else score += 5;

    return Math.min(100, Math.max(0, score));
  }, [titleAudit, metaAudit, overallKeywordStatus, readabilityAudit]);

  // -------------------------------------------------------------
  // Quick Fix Handler: Automatically apply AI-generated title and meta updates
  // -------------------------------------------------------------
  const handleQuickFix = async () => {
    setIsQuickFixing(true);
    setQuickFixError(null);
    setQuickFixNotice(null);

    try {
      const topicToUse =
        title.trim() || 'Irish Home Retrofit & Energy Upgrade Guide';
      const result = await generateTitleMeta(
        topicToUse,
        tone || 'Professional',
        content,
      );

      if (result && result.title && result.meta_description) {
        const previousTitle = title;
        const previousMeta = localMeta;

        // Automatically apply title suggestion to draft
        if (onApplyTitleSuggestion) {
          onApplyTitleSuggestion(result.title);
        }

        // Automatically update meta description
        setLocalMeta(result.meta_description);
        if (onUpdateMetaDescription) {
          onUpdateMetaDescription(result.meta_description);
        }

        // Notify parent if callback provided
        if (onQuickFixApplied) {
          onQuickFixApplied({
            title: result.title,
            metaDescription: result.meta_description,
          });
        }

        setQuickFixNotice({
          title: result.title,
          meta: result.meta_description,
          oldTitle: previousTitle,
          oldMeta: previousMeta,
        });

        setTimeout(() => {
          setQuickFixNotice(null);
        }, 8000);
      }
    } catch (err: any) {
      console.error('Failed to quick-fix title and meta:', err);
      setQuickFixError(
        err.message ||
          'Failed to auto-apply Quick Fix. Please check server connection.',
      );
      setTimeout(() => setQuickFixError(null), 6000);
    } finally {
      setIsQuickFixing(false);
    }
  };

  // Auto-generate meta description with smart extraction
  const handleAutoGenerateMeta = () => {
    setIsGeneratingMeta(true);
    setTimeout(() => {
      // Create a compelling 140-155 character snippet from title and content
      const cleanContent = content
        .replace(/[#*`_~[\]()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      const firstParagraph = cleanContent.split('.')[0] || '';
      let generated = `${title}: ${firstParagraph}`.trim();
      if (generated.length > 155) {
        generated = generated.substring(0, 150) + '...';
      } else if (generated.length < 120) {
        generated = `${title}. Complete guide covering SEAI grants, BER ratings, and Irish home upgrade solutions from EcoSmartHomes.`;
        if (generated.length > 155) {
          generated = generated.substring(0, 150) + '...';
        }
      }

      setLocalMeta(generated);
      if (onUpdateMetaDescription) {
        onUpdateMetaDescription(generated);
      }
      setIsGeneratingMeta(false);
    }, 300);
  };

  const handleMetaChange = (val: string) => {
    setLocalMeta(val);
    if (onUpdateMetaDescription) {
      onUpdateMetaDescription(val);
    }
  };

  const handleAddKeyword = () => {
    if (!customKeywordInput.trim()) return;
    const newKw = customKeywordInput.trim();
    if (!effectiveKeywords.includes(newKw)) {
      const updated = [...effectiveKeywords, newKw];
      if (onUpdateKeywords) {
        onUpdateKeywords(updated);
      }
    }
    setCustomKeywordInput('');
  };

  const handleRemoveKeyword = (kwToRemove: string) => {
    const updated = effectiveKeywords.filter((k) => k !== kwToRemove);
    if (onUpdateKeywords) {
      onUpdateKeywords(updated);
    }
  };

  // Status icon helper
  const renderStatusIcon = (status: 'good' | 'warning' | 'error') => {
    if (status === 'good') {
      return <CheckCircle2 size={16} className="text-[#34d399] shrink-0" />;
    }
    if (status === 'warning') {
      return <AlertTriangle size={16} className="text-amber-400 shrink-0" />;
    }
    return <XCircle size={16} className="text-rose-400 shrink-0" />;
  };

  const cleanSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 50);

  return (
    <div
      className="p-5 border-t border-white/10 bg-slate-950/40 rounded-xl space-y-4 text-left font-sans"
      id="content-readiness-checklist-root"
    >
      {/* Header Bar with Score & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sliders size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Content Readiness & SEO Checklist
              </h4>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  readinessScore >= 85
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : readinessScore >= 60
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}
              >
                {readinessScore}/100 Score
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Live audit of title length, meta description, keyword density, and readability.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Fix Button using LLM processing */}
          <button
            onClick={handleQuickFix}
            disabled={isQuickFixing}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border active:scale-98 shadow-sm ${
              titleAudit.status !== 'good' || metaAudit.status !== 'good'
                ? 'bg-[#34d399]/20 hover:bg-[#34d399]/30 text-[#34d399] hover:text-white border-[#34d399]/40'
                : 'bg-white/10 hover:bg-white/15 text-slate-200 border-white/15'
            }`}
            id="quick-fix-btn"
            title="Quick Fix: Automatically apply LLM-optimized title and meta description updates to the draft"
          >
            {isQuickFixing ? (
              <RefreshCw size={13} className="animate-spin text-[#34d399]" />
            ) : (
              <Zap size={13} className="text-[#34d399] fill-[#34d399]/30" />
            )}
            <span>{isQuickFixing ? 'Quick Fixing...' : 'Quick Fix'}</span>
          </button>

          {/* View Toggle: Checklist vs SERP preview */}
          <div className="bg-black/40 border border-white/10 p-0.5 rounded-lg flex items-center text-[10px] font-mono">
            <button
              onClick={() => setActiveView('checklist')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                activeView === 'checklist'
                  ? 'bg-white/15 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              id="view-checklist-toggle-btn"
            >
              <BarChart2 size={12} />
              <span>Audit</span>
            </button>
            <button
              onClick={() => setActiveView('serp')}
              className={`px-2.5 py-1 rounded-md transition cursor-pointer flex items-center gap-1 ${
                activeView === 'serp'
                  ? 'bg-white/15 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
              id="view-serp-toggle-btn"
            >
              <Eye size={12} />
              <span>Google SERP</span>
            </button>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition cursor-pointer"
            id="toggle-checklist-expand-btn"
            title={isExpanded ? 'Collapse Checklist' : 'Expand Checklist'}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Quick Fix Success / Alert Notifications */}
      {quickFixNotice && (
        <div
          className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs flex items-start justify-between gap-3 animate-in fade-in duration-200 shadow-md"
          id="quick-fix-success-banner"
        >
          <div className="flex items-start gap-2.5">
            <Sparkles size={16} className="text-[#34d399] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span>Quick Fix Applied (LLM Processing)</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono font-normal">
                  Updated Title & Meta
                </span>
              </span>
              <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                <strong>New Title ({quickFixNotice.title.length} chars):</strong> &ldquo;{quickFixNotice.title}&rdquo;
              </p>
              <p className="text-[11px] text-emerald-200/80 leading-relaxed">
                <strong>New Meta ({quickFixNotice.meta.length} chars):</strong> &ldquo;{quickFixNotice.meta}&rdquo;
              </p>
            </div>
          </div>
          <button
            onClick={() => setQuickFixNotice(null)}
            className="text-emerald-300 hover:text-white p-1 rounded hover:bg-emerald-500/20 transition cursor-pointer"
            title="Dismiss notification"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {quickFixError && (
        <div
          className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-center justify-between gap-2 animate-in fade-in duration-200"
          id="quick-fix-error-banner"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-rose-400 shrink-0" />
            <span>{quickFixError}</span>
          </div>
          <button
            onClick={() => setQuickFixError(null)}
            className="text-rose-300 hover:text-white p-1 cursor-pointer"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {isExpanded && (
        <div className="space-y-4 pt-1 animate-in fade-in duration-200">
          {/* Checklist Audit View */}
          {activeView === 'checklist' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Check 1: Title Length */}
              <div
                className="p-3.5 rounded-xl bg-black/30 border border-white/5 space-y-2 flex flex-col justify-between"
                id="check-title-length"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {renderStatusIcon(titleAudit.status)}
                      <span className="text-xs font-bold text-slate-200">
                        1. Title Length
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-300 bg-white/5 px-2 py-0.5 rounded">
                      {titleAudit.length} / 65 chars
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                    {titleAudit.message}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Target: 45–65 chars</span>
                  <div className="flex items-center gap-2">
                    {titleAudit.status !== 'good' && (
                      <button
                        onClick={handleQuickFix}
                        disabled={isQuickFixing}
                        className="text-[10px] text-[#34d399] hover:underline flex items-center gap-1 font-sans cursor-pointer font-semibold"
                        title="Auto-tune title using LLM processing"
                      >
                        <Zap size={10} />
                        <span>Fix Title</span>
                      </button>
                    )}
                    <span
                      className={`font-semibold ${
                        titleAudit.status === 'good'
                          ? 'text-emerald-400'
                          : titleAudit.status === 'warning'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {titleAudit.status === 'good' ? 'Optimal' : 'Needs Tuning'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Check 2: Meta Description */}
              <div
                className="p-3.5 rounded-xl bg-black/30 border border-white/5 space-y-2 flex flex-col justify-between"
                id="check-meta-description"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {renderStatusIcon(metaAudit.status)}
                      <span className="text-xs font-bold text-slate-200">
                        2. Meta Description
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-300 bg-white/5 px-2 py-0.5 rounded">
                      {metaAudit.length} / 160 chars
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                    {metaAudit.message}
                  </p>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={localMeta}
                      onChange={(e) => handleMetaChange(e.target.value)}
                      placeholder="Write 120–160 character meta description..."
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-[#34d399] font-mono"
                      id="meta-description-input"
                    />
                    <button
                      onClick={handleQuickFix}
                      disabled={isQuickFixing}
                      className="px-2 py-1.5 bg-[#34d399]/15 hover:bg-[#34d399]/25 border border-[#34d399]/30 text-[#34d399] hover:text-white rounded-lg text-[10px] font-bold shrink-0 transition cursor-pointer flex items-center gap-1"
                      title="Quick Fix: Auto-generate optimized meta description & title using LLM"
                      id="quick-fix-meta-btn"
                    >
                      <Zap size={11} className={isQuickFixing ? 'animate-spin' : ''} />
                      <span>Fix</span>
                    </button>
                    <button
                      onClick={handleAutoGenerateMeta}
                      disabled={isGeneratingMeta}
                      className="px-2 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 rounded-lg text-[10px] font-bold shrink-0 transition cursor-pointer flex items-center gap-1"
                      title="Auto-extract snippet from draft content"
                      id="generate-meta-btn"
                    >
                      <Sparkles size={11} className={isGeneratingMeta ? 'animate-spin' : ''} />
                      <span>Extract</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Check 3: Keyword Density */}
              <div
                className="p-3.5 rounded-xl bg-black/30 border border-white/5 space-y-2.5 flex flex-col justify-between"
                id="check-keyword-density"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {renderStatusIcon(overallKeywordStatus)}
                      <span className="text-xs font-bold text-slate-200">
                        3. Focus Keyword Density
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      Target: 1.0% – 2.5%
                    </span>
                  </div>

                  {/* Keywords Breakdown List */}
                  <div className="mt-2 space-y-1.5 max-h-[96px] overflow-y-auto pr-1">
                    {keywordAudits.map((kw, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-1.5 rounded-lg bg-black/40 border border-white/5 text-[11px]"
                      >
                        <div className="flex items-center gap-1.5 truncate max-w-[65%]">
                          <span className="font-semibold text-slate-200 truncate">
                            {kw?.keyword}
                          </span>
                          {kw?.inTitle && (
                            <span className="text-[9px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-1 py-0.2 rounded font-mono font-bold">
                              in title
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono text-[10px] font-bold ${
                              kw?.status === 'good'
                                ? 'text-emerald-400'
                                : kw?.status === 'warning'
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {kw?.density}% ({kw?.count}x)
                          </span>
                          <button
                            onClick={() => handleRemoveKeyword(kw!.keyword)}
                            className="text-slate-500 hover:text-rose-400 p-0.5 cursor-pointer"
                            title="Remove keyword"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Focus Keyword Input */}
                <div className="flex items-center gap-1.5 pt-1 border-t border-white/5">
                  <input
                    type="text"
                    value={customKeywordInput}
                    onChange={(e) => setCustomKeywordInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddKeyword();
                    }}
                    placeholder="Add focus keyword to audit..."
                    className="flex-1 bg-black/50 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white placeholder:text-slate-600 focus:outline-hidden focus:border-[#34d399] font-mono"
                  />
                  <button
                    onClick={handleAddKeyword}
                    className="px-2 py-1 bg-white/10 hover:bg-white/15 text-white rounded-lg text-[10px] font-semibold transition cursor-pointer"
                  >
                    <Plus size={12} />
                  </button>
                </div>
              </div>

              {/* Check 4: Readability & Structure */}
              <div
                className="p-3.5 rounded-xl bg-black/30 border border-white/5 space-y-2 flex flex-col justify-between"
                id="check-readability"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {renderStatusIcon(readabilityAudit.status)}
                      <span className="text-xs font-bold text-slate-200">
                        4. Readability & Structure
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                      {readabilityAudit.scoreLabel}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                    {readabilityAudit.feedback}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 font-mono text-[10px]">
                  <div className="bg-black/40 p-1.5 rounded text-center">
                    <span className="text-slate-500 block text-[9px]">Words</span>
                    <span className="font-bold text-white">
                      {textAnalysis.totalWords}
                    </span>
                  </div>
                  <div className="bg-black/40 p-1.5 rounded text-center">
                    <span className="text-slate-500 block text-[9px]">Avg Sent.</span>
                    <span className="font-bold text-white">
                      {textAnalysis.avgWordsPerSentence} wds
                    </span>
                  </div>
                  <div className="bg-black/40 p-1.5 rounded text-center">
                    <span className="text-slate-500 block text-[9px]">H2 Headings</span>
                    <span className="font-bold text-white">
                      {textAnalysis.h2Count}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Google SERP Snippet Preview */}
          {activeView === 'serp' && (
            <div
              className="p-4 rounded-xl bg-slate-900 border border-white/10 space-y-3"
              id="serp-snippet-preview"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <Search size={14} className="text-[#34d399]" />
                  <span>Google Search Result Snippet Preview</span>
                </div>
                <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/5 text-[10px]">
                  <button
                    onClick={() => setSerpDevice('desktop')}
                    className={`px-2 py-0.5 rounded flex items-center gap-1 transition cursor-pointer ${
                      serpDevice === 'desktop'
                        ? 'bg-white/15 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Monitor size={11} />
                    <span>Desktop</span>
                  </button>
                  <button
                    onClick={() => setSerpDevice('mobile')}
                    className={`px-2 py-0.5 rounded flex items-center gap-1 transition cursor-pointer ${
                      serpDevice === 'mobile'
                        ? 'bg-white/15 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone size={11} />
                    <span>Mobile</span>
                  </button>
                </div>
              </div>

              {/* SERP Mock Card */}
              <div
                className={`p-4 rounded-xl bg-white text-slate-900 shadow-lg space-y-1 ${
                  serpDevice === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
                }`}
              >
                {/* SERP Site URL & Favicon */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <div className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] flex items-center justify-center font-bold">
                    E
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-slate-800 leading-none">
                      EcoSmartHomes Ireland
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono truncate">
                      https://{siteUrl}/blog/{cleanSlug || 'article-slug'}
                    </span>
                  </div>
                </div>

                {/* SERP Headline */}
                <h5 className="text-blue-700 hover:underline text-sm sm:text-base font-medium leading-snug cursor-pointer pt-0.5">
                  {title || 'Article Title Preview for Google Search'}
                </h5>

                {/* SERP Meta Snippet */}
                <p className="text-xs text-slate-700 leading-relaxed pt-0.5">
                  {localMeta ||
                    content.substring(0, 150).replace(/[#*`_]/g, '') + '...'}
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1">
                <span>
                  Title pixels: ~{Math.round(titleAudit.length * 9)}px / 580px max
                </span>
                <span>
                  Meta chars: {localMeta.length} / 160 optimal
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
