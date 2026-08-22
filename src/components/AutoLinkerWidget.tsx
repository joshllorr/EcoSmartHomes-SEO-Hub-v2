import { useState, useMemo, useEffect } from 'react';
import {
  Link2,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Zap,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  Check,
  Undo2,
  X,
  Layers,
  BookOpen,
  Filter,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AutoLinkSuggestion,
  ContentLibraryEntry,
  DEFAULT_CONTENT_LIBRARY,
  scanDraftForInternalLinks,
  insertLinkIntoContent,
  insertAllHighConfidenceLinks,
  removeLinkFromContent,
} from '../utils/autoLinker';
import { ArticleDraft } from '../types';

interface AutoLinkerWidgetProps {
  content: string;
  onUpdateContent: (newContent: string) => void;
  siteUrl?: string;
  currentDraftId?: string;
  currentTitle?: string;
  drafts?: ArticleDraft[];
  onXPUnlock?: (xp: number) => void;
}

export default function AutoLinkerWidget({
  content,
  onUpdateContent,
  siteUrl = 'ecosmarthomes.ie',
  currentDraftId,
  currentTitle,
  drafts = [],
  onXPUnlock,
}: AutoLinkerWidgetProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [filterMode, setFilterMode] = useState<'all' | 'unlinked' | 'high_relevance'>('all');
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [lastActionMessage, setLastActionMessage] = useState<{
    text: string;
    undoAction?: () => void;
  } | null>(null);

  // Combine default content library with any drafts passed into the widget
  const combinedLibrary = useMemo<ContentLibraryEntry[]>(() => {
    const libraryMap = new Map<string, ContentLibraryEntry>();

    // Add default library entries
    DEFAULT_CONTENT_LIBRARY.forEach((item) => {
      libraryMap.set(item.slug, item);
    });

    // Add custom drafts from props
    drafts.forEach((d) => {
      if (!d.id || d.id === currentDraftId) return;
      const slug =
        d.slug ||
        d.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');

      if (!libraryMap.has(slug)) {
        libraryMap.set(slug, {
          id: `draft-${d.id}`,
          title: d.title,
          slug,
          url: `/articles/${slug}`,
          topic: d.topic || 'Retrofit & Energy',
          categoryType: 'Article',
          metaDescription: d.metaDescription,
          keywords: d.keywords || [d.title],
          anchorPhrases: [d.title],
        });
      }
    });

    return Array.from(libraryMap.values());
  }, [drafts, currentDraftId]);

  // Run scan whenever content or library changes
  const scanResult = useMemo(() => {
    return scanDraftForInternalLinks(content, combinedLibrary, {
      currentArticleId: currentDraftId,
      currentArticleTitle: currentTitle,
      siteDomain: siteUrl,
      minScore: 0.7,
    });
  }, [content, combinedLibrary, currentDraftId, currentTitle, siteUrl]);

  // Filtered suggestions
  const visibleSuggestions = useMemo(() => {
    return scanResult.suggestions.filter((s) => {
      if (dismissedIds.has(s.id)) return false;
      if (filterMode === 'unlinked') return !s.isLinked;
      if (filterMode === 'high_relevance') return s.relevanceScore >= 0.9;
      return true;
    });
  }, [scanResult.suggestions, dismissedIds, filterMode]);

  // Handle Rescan Draft animation
  const handleRescan = () => {
    setIsScanning(true);
    setDismissedIds(new Set());
    setTimeout(() => {
      setIsScanning(false);
    }, 450);
  };

  // One-click Insert Link
  const handleInsertLink = (suggestion: AutoLinkSuggestion) => {
    const result = insertLinkIntoContent(content, suggestion);
    if (result.success) {
      const prevContent = content;
      onUpdateContent(result.newContent);

      if (onXPUnlock) {
        onXPUnlock(5);
      }

      setLastActionMessage({
        text: `Linked "${result.replacedAnchor}" → ${suggestion.targetArticle.title}`,
        undoAction: () => onUpdateContent(prevContent),
      });

      setTimeout(() => {
        setLastActionMessage((current) => (current?.text.includes(result.replacedAnchor) ? null : current));
      }, 5000);
    }
  };

  // One-click Auto-Link All High Confidence
  const handleAutoLinkAll = () => {
    setIsScanning(true);
    setTimeout(() => {
      const prevContent = content;
      const result = insertAllHighConfidenceLinks(content, scanResult.suggestions, 0.85);

      if (result.insertedCount > 0) {
        onUpdateContent(result.newContent);
        if (onXPUnlock) {
          onXPUnlock(10);
        }
        setLastActionMessage({
          text: `Successfully inserted ${result.insertedCount} internal links into your draft!`,
          undoAction: () => onUpdateContent(prevContent),
        });
      } else {
        setLastActionMessage({
          text: 'All high-relevance internal links are already inserted.',
        });
      }

      setIsScanning(false);
      setTimeout(() => {
        setLastActionMessage(null);
      }, 5000);
    }, 400);
  };

  // One-click Remove / Unlink
  const handleRemoveLink = (suggestion: AutoLinkSuggestion) => {
    const result = removeLinkFromContent(content, suggestion.targetUrl, suggestion.anchorText);
    if (result.success) {
      const prevContent = content;
      onUpdateContent(result.newContent);
      setLastActionMessage({
        text: `Removed link for "${suggestion.anchorText}"`,
        undoAction: () => onUpdateContent(prevContent),
      });
    }
  };

  // Dismiss suggestion from active view
  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  return (
    <div
      id="auto-linker-widget"
      className="bg-gradient-to-b from-[#131b2e] to-[#0f172a] rounded-xl border border-indigo-500/25 shadow-xl shadow-black/20 overflow-hidden text-left"
    >
      {/* Header */}
      <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 border-b border-indigo-500/15 bg-indigo-950/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Zap size={18} className="text-indigo-400 fill-indigo-400/20" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>Auto-Linker</span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Semantic Mesh
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Scans draft text & suggests high-authority internal links to existing library articles.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {scanResult.totalOpportunities > 0 && (
            <button
              onClick={handleAutoLinkAll}
              disabled={isScanning}
              id="auto-link-all-btn"
              className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
              title="Automatically insert all high-confidence links into the draft"
            >
              <Sparkles size={13} className="text-amber-300 fill-amber-300" />
              <span>Auto-Link All ({scanResult.totalOpportunities})</span>
            </button>
          )}

          <button
            onClick={handleRescan}
            disabled={isScanning}
            className="p-1.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition cursor-pointer"
            title="Rescan draft content"
          >
            <RefreshCw size={14} className={isScanning ? 'animate-spin text-indigo-400' : ''} />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition cursor-pointer"
            title={isExpanded ? 'Collapse Auto-Linker' : 'Expand Auto-Linker'}
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Summary Pills Bar */}
      <div className="px-4 py-2.5 bg-black/30 border-b border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-mono font-medium border border-indigo-500/20">
            <Link2 size={11} />
            <span>{scanResult.linkDensity.existingLinksCount} Active Links</span>
          </span>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono font-medium border ${
              scanResult.totalOpportunities > 0
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25'
                : 'bg-slate-500/15 text-slate-400 border-slate-500/20'
            }`}
          >
            <Sparkles size={11} />
            <span>{scanResult.totalOpportunities} Opportunities</span>
          </span>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300 font-mono font-medium border border-white/5">
            <span>
              Density: {scanResult.linkDensity.linksPerThousandWords} / 1k words (
              {scanResult.linkDensity.densityStatus === 'optimal'
                ? 'Optimal'
                : scanResult.linkDensity.densityStatus === 'low'
                ? 'Low'
                : 'High'}
              )
            </span>
          </span>
        </div>

        {/* Filter controls */}
        {isExpanded && scanResult.suggestions.length > 0 && (
          <div className="flex items-center gap-1.5 bg-white/5 p-0.5 rounded-lg border border-white/5">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({scanResult.suggestions.length})
            </button>
            <button
              onClick={() => setFilterMode('unlinked')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                filterMode === 'unlinked'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Unlinked ({scanResult.totalOpportunities})
            </button>
            <button
              onClick={() => setFilterMode('high_relevance')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
                filterMode === 'high_relevance'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              90%+ Relevance
            </button>
          </div>
        )}
      </div>

      {/* Action Notification Banner */}
      <AnimatePresence>
        {lastActionMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-emerald-500/15 border-b border-emerald-500/30 px-4 py-2 flex items-center justify-between gap-3 text-xs text-emerald-200"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span>{lastActionMessage.text}</span>
            </div>
            {lastActionMessage.undoAction && (
              <button
                onClick={lastActionMessage.undoAction}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-medium transition cursor-pointer text-[11px]"
              >
                <Undo2 size={11} />
                <span>Undo</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 sm:p-5 space-y-3"
          >
            {visibleSuggestions.length === 0 ? (
              <div className="text-center py-6 px-4 bg-white/5 rounded-lg border border-white/5 space-y-2">
                <BookOpen size={24} className="text-slate-500 mx-auto" />
                <p className="text-xs text-slate-300 font-medium">
                  {scanResult.totalOpportunities === 0
                    ? 'All high-relevance internal links are already inserted in this draft!'
                    : 'No suggestions match the selected filter.'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {scanResult.totalOpportunities === 0
                    ? 'Your draft maintains optimal internal link distribution connecting to core SEO pillars.'
                    : 'Switch back to "All" or "Unlinked" to view all available internal linking matches.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {visibleSuggestions.map((suggestion) => {
                  const percentScore = Math.round(suggestion.relevanceScore * 100);
                  const isLinked = suggestion.isLinked;

                  return (
                    <div
                      key={suggestion.id}
                      className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                        isLinked
                          ? 'bg-emerald-950/15 border-emerald-500/20'
                          : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/10 hover:border-indigo-500/30'
                      }`}
                    >
                      {/* Top Row: Article Title & Badges */}
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-white">
                              {suggestion.targetArticle.title}
                            </span>
                            {suggestion.targetArticle.categoryType && (
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300 border border-white/10">
                                {suggestion.targetArticle.categoryType}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                            <span className="truncate max-w-[280px]">
                              {suggestion.targetUrl}
                            </span>
                          </div>
                        </div>

                        {/* Relevance Score Pill */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${
                              percentScore >= 95
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : percentScore >= 90
                                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                                : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                            }`}
                          >
                            {percentScore}% Match
                          </span>
                        </div>
                      </div>

                      {/* Anchor & Context Box */}
                      <div className="bg-black/30 p-2.5 rounded-lg border border-white/5 space-y-1.5 mb-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400 font-semibold">
                            Suggested Anchor:
                          </span>
                          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold text-xs">
                            "{suggestion.anchorText}"
                          </span>
                        </div>

                        {/* Context Sentence Snippet */}
                        {suggestion.occurrences[0] && (
                          <p className="text-[11px] text-slate-300 font-sans italic leading-relaxed">
                            <span className="text-slate-500 not-italic mr-1">In text:</span>
                            {suggestion.occurrences[0].contextSnippet}
                          </p>
                        )}
                      </div>

                      {/* SEO Strategic Reason */}
                      <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                        <span className="text-indigo-300 font-medium mr-1">SEO Strategy:</span>
                        {suggestion.reason}
                      </p>

                      {/* Action Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
                        <div className="text-[10px] text-slate-500 font-mono">
                          {suggestion.occurrences.length} occurrence
                          {suggestion.occurrences.length > 1 ? 's' : ''} found in draft
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDismiss(suggestion.id)}
                            className="px-2 py-1 text-slate-400 hover:text-slate-200 text-xs transition cursor-pointer"
                          >
                            Dismiss
                          </button>

                          {isLinked ? (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-medium">
                                <Check size={13} />
                                <span>Linked in Draft</span>
                              </span>
                              <button
                                onClick={() => handleRemoveLink(suggestion)}
                                className="px-2.5 py-1 bg-white/10 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 rounded-lg text-xs font-semibold transition border border-white/10 hover:border-rose-500/30 cursor-pointer"
                              >
                                Unlink
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleInsertLink(suggestion)}
                              id={`insert-link-${suggestion.id}`}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
                            >
                              <Link2 size={13} />
                              <span>Insert Link</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
