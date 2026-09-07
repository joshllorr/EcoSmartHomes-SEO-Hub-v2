import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Search,
  X,
  FileText,
  TrendingUp,
  ShieldCheck,
  LayoutDashboard,
  CornerDownLeft,
  ArrowUpDown,
  Sparkles,
  Clock,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Filter,
  Mic,
  MicOff,
  AudioLines,
  HelpCircle,
  Keyboard,
} from 'lucide-react';
import {
  GlobalSearchResult,
  SearchCategory,
  searchGlobalIndex,
  getSearchIndexStats,
  getRecentSearches,
  addRecentSearch,
  clearRecentSearches,
} from '../services/globalSearchIndex';
import {
  VOICE_COMMAND_EXAMPLES,
  VoiceCommandResult,
} from '../services/voiceSearch';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import { ArticleDraft } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (result: GlobalSearchResult) => void;
  drafts?: ArticleDraft[];
}

export default function GlobalSearchModal({
  isOpen,
  onClose,
  onNavigate,
  drafts = [],
}: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [voiceFeedback, setVoiceFeedback] = useState<{
    text: string;
    type: 'search' | 'command';
  } | null>(null);
  const [showVoiceHelp, setShowVoiceHelp] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Load recent searches when opened
  useEffect(() => {
    if (isOpen) {
      setRecentSearches(getRecentSearches());
      setQuery('');
      setActiveCategory('all');
      setSelectedIndex(0);
      setVoiceFeedback(null);
      setShowVoiceHelp(false);
      // Auto-focus input on next frame
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Compute live search results
  const searchResults = useMemo(() => {
    return searchGlobalIndex(query, activeCategory, drafts);
  }, [query, activeCategory, drafts]);

  const handleSelectResult = useCallback(
    (result: GlobalSearchResult) => {
      if (query.trim()) {
        addRecentSearch(query);
        setRecentSearches(getRecentSearches());
      }
      onNavigate(result);
      onClose();
    },
    [query, onNavigate, onClose],
  );

  const handleQuickJump = useCallback(
    (tab: string) => {
      const matched = searchResults.find((r) => r.targetTab === tab);
      if (matched) {
        handleSelectResult(matched);
      } else {
        onNavigate({
          id: `quick-${tab}`,
          category: 'nav',
          title: tab,
          targetTab: tab,
          actionPayload: { tab },
          badge: { label: 'Quick Nav', variant: 'indigo' },
        });
        onClose();
      }
    },
    [searchResults, handleSelectResult, onNavigate, onClose],
  );

  // Voice Command Handler
  const handleVoiceCommand = useCallback(
    (cmd: VoiceCommandResult) => {
      setVoiceFeedback({
        text: cmd.feedback,
        type: cmd.action.type === 'search' ? 'search' : 'command',
      });

      switch (cmd.action.type) {
        case 'search':
          setQuery(cmd.action.query);
          inputRef.current?.focus();
          break;
        case 'filter':
          setActiveCategory(cmd.action.category);
          break;
        case 'navigate':
          handleQuickJump(cmd.action.tab);
          break;
        case 'select_first':
          if (searchResults.length > 0) {
            handleSelectResult(searchResults[0]);
          }
          break;
        case 'clear':
          setQuery('');
          setActiveCategory('all');
          inputRef.current?.focus();
          break;
        case 'close':
          onClose();
          break;
      }
    },
    [searchResults, handleSelectResult, handleQuickJump, onClose],
  );

  // Voice Search Hook Integration
  const {
    isSupported: isVoiceSupported,
    isListening,
    interimTranscript,
    error: voiceError,
    startListening,
    stopListening,
    resetError: resetVoiceError,
  } = useVoiceSearch({
    onCommand: handleVoiceCommand,
  });

  // Stop listening when modal closes
  useEffect(() => {
    if (!isOpen && isListening) {
      stopListening();
    }
  }, [isOpen, isListening, stopListening]);

  // Auto-dismiss voice feedback toast after 3.5s
  useEffect(() => {
    if (voiceFeedback) {
      const timer = setTimeout(() => {
        setVoiceFeedback(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [voiceFeedback]);

  // Keyboard shortcut listener: Cmd+K / Ctrl+K, Escape, Alt+V
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.altKey && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault();
        if (isListening) {
          stopListening();
        } else {
          startListening();
        }
      } else if (e.altKey && e.key === '1') {
        e.preventDefault();
        setActiveCategory('all');
      } else if (e.altKey && e.key === '2') {
        e.preventDefault();
        setActiveCategory('draft');
      } else if (e.altKey && e.key === '3') {
        e.preventDefault();
        setActiveCategory('audit');
      } else if (e.altKey && e.key === '4') {
        e.preventDefault();
        setActiveCategory('keyword');
      } else if (e.altKey && e.key === '5') {
        e.preventDefault();
        setActiveCategory('nav');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose();
      } else if (
        e.key === '/' &&
        document.activeElement !== inputRef.current
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < searchResults.length - 1 ? prev + 1 : prev,
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (searchResults[selectedIndex]) {
          handleSelectResult(searchResults[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isOpen,
    selectedIndex,
    searchResults,
    handleSelectResult,
    onClose,
    isListening,
    startListening,
    stopListening,
  ]);

  // Keep selected item visible in scroll view
  useEffect(() => {
    if (resultsContainerRef.current) {
      const activeEl = resultsContainerRef.current.querySelector(
        `[data-result-index="${selectedIndex}"]`,
      );
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Reset selected index when query or category changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeCategory]);

  const stats = useMemo(() => {
    return getSearchIndexStats(drafts);
  }, [drafts]);

  // Live match counts per category (reflects query if searching, else overall index totals)
  const categoryCounts = useMemo(() => {
    if (!query.trim()) {
      return {
        all: stats.total,
        draft: stats.drafts,
        audit: stats.audits,
        keyword: stats.keywords,
        nav: stats.navs,
      };
    }
    const allMatches = searchGlobalIndex(query, 'all', drafts);
    return {
      all: allMatches.length,
      draft: allMatches.filter((r) => r.category === 'draft').length,
      audit: allMatches.filter((r) => r.category === 'audit').length,
      keyword: allMatches.filter((r) => r.category === 'keyword').length,
      nav: allMatches.filter((r) => r.category === 'nav').length,
    };
  }, [query, stats, drafts]);

  const CATEGORY_TABS: Array<{
    id: SearchCategory;
    label: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    activeClass: string;
    hoverClass: string;
    iconColor: string;
    tooltip: string;
    btnId: string;
    shortcutNumber: string;
  }> = useMemo(
    () => [
      {
        id: 'all',
        label: 'All Items',
        icon: Sparkles,
        activeClass: 'bg-white/15 text-white border-white/30 font-semibold shadow-xs',
        hoverClass: 'hover:bg-white/10 hover:text-white',
        iconColor: 'text-emerald-400',
        tooltip: 'Show all items across drafts, audits, research & navigation (Alt+1)',
        btnId: 'category-filter-all',
        shortcutNumber: '1',
      },
      {
        id: 'draft',
        label: 'Drafts',
        icon: FileText,
        activeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold shadow-xs',
        hoverClass: 'hover:bg-emerald-500/10 hover:text-emerald-200',
        iconColor: 'text-emerald-400',
        tooltip: 'Filter content drafts and pillar articles (Alt+2)',
        btnId: 'category-filter-drafts',
        shortcutNumber: '2',
      },
      {
        id: 'audit',
        label: 'Audits',
        icon: ShieldCheck,
        activeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-semibold shadow-xs',
        hoverClass: 'hover:bg-sky-500/10 hover:text-sky-200',
        iconColor: 'text-sky-400',
        tooltip: 'Filter site health audits, Core Web Vitals & crawl telemetry (Alt+3)',
        btnId: 'category-filter-audits',
        shortcutNumber: '3',
      },
      {
        id: 'keyword',
        label: 'Research',
        icon: TrendingUp,
        activeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold shadow-xs',
        hoverClass: 'hover:bg-amber-500/10 hover:text-amber-200',
        iconColor: 'text-amber-400',
        tooltip: 'Filter keyword research, search volume, difficulty & clusters (Alt+4)',
        btnId: 'category-filter-research',
        shortcutNumber: '4',
      },
      {
        id: 'nav',
        label: 'Navigation',
        icon: LayoutDashboard,
        activeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-semibold shadow-xs',
        hoverClass: 'hover:bg-indigo-500/10 hover:text-indigo-200',
        iconColor: 'text-indigo-400',
        tooltip: 'Filter workspaces, dashboards & homeowner tools (Alt+5)',
        btnId: 'category-filter-nav',
        shortcutNumber: '5',
      },
    ],
    [],
  );

  const handleRecentClick = (recentText: string) => {
    setQuery(recentText);
    inputRef.current?.focus();
  };

  const handleClearRecents = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  if (!isOpen) return null;

  const renderCategoryIcon = (category: GlobalSearchResult['category']) => {
    switch (category) {
      case 'draft':
        return <FileText size={16} className="text-emerald-400 shrink-0" />;
      case 'keyword':
        return <TrendingUp size={16} className="text-amber-400 shrink-0" />;
      case 'audit':
        return <ShieldCheck size={16} className="text-sky-400 shrink-0" />;
      case 'nav':
        return <LayoutDashboard size={16} className="text-indigo-400 shrink-0" />;
    }
  };

  const renderBadgeVariant = (variant: GlobalSearchResult['badge']['variant']) => {
    switch (variant) {
      case 'emerald':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'amber':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'indigo':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      case 'sky':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      case 'rose':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      default:
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-20 px-3 sm:px-4 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-150"
      onClick={onClose}
      id="global-search-modal-backdrop"
    >
      <div
        className="w-full max-w-3xl bg-[#0f172a] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-left relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        id="global-search-modal"
      >
        {/* Top Search Input Box */}
        <div className="p-3.5 sm:p-4 border-b border-white/10 flex items-center gap-2 sm:gap-3 bg-black/40">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
            <Search size={18} />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search content drafts, keywords, audit logs, views..."
            className="flex-1 bg-transparent text-sm sm:text-base text-white placeholder:text-slate-500 outline-hidden font-medium"
            id="global-search-input"
          />

          {/* Voice Search Toggle Button */}
          {isVoiceSupported ? (
            <button
              id="voice-search-mic-btn"
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`p-2 rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-mono shrink-0 ${
                isListening
                  ? 'bg-rose-500/25 text-rose-300 border border-rose-500/50 shadow-lg shadow-rose-500/20 animate-pulse'
                  : 'text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/30'
              }`}
              title={
                isListening
                  ? 'Listening... Click to stop (Alt+V)'
                  : 'Search by voice or say commands (Alt+V)'
              }
              aria-label="Voice Search"
            >
              {isListening ? (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                  <Mic size={16} className="text-rose-400" />
                  <span className="hidden sm:inline font-sans text-rose-200 text-xs font-medium">
                    Listening
                  </span>
                </>
              ) : (
                <>
                  <Mic size={16} />
                  <span className="hidden md:inline font-mono text-[10px] text-slate-500">
                    Alt+V
                  </span>
                </>
              )}
            </button>
          ) : (
            <button
              id="voice-search-mic-btn"
              type="button"
              disabled
              className="p-2 rounded-xl text-slate-600 border border-transparent cursor-not-allowed opacity-40 shrink-0"
              title="Voice search is not supported in this browser"
              aria-label="Voice Search Not Supported"
            >
              <MicOff size={16} />
            </button>
          )}

          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0"
              title="Clear search input"
            >
              <X size={15} />
            </button>
          )}

          <button
            onClick={onClose}
            className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg transition cursor-pointer shrink-0"
            title="Close Search Dialog (Esc)"
          >
            <span>ESC</span>
          </button>
        </div>

        {/* Live Voice Search Listening Banner */}
        {isListening && (
          <div
            id="voice-search-listening-banner"
            className="px-3.5 sm:px-4 py-2.5 bg-gradient-to-r from-rose-950/60 via-slate-900/90 to-emerald-950/40 border-b border-rose-500/30 flex items-center justify-between gap-3 text-xs shrink-0 animate-in fade-in duration-150"
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="flex items-end gap-0.5 h-4 px-1 shrink-0">
                <span className="w-1 bg-rose-400 rounded-full animate-bounce [animation-delay:-0.3s] h-3"></span>
                <span className="w-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s] h-4"></span>
                <span className="w-1 bg-rose-400 rounded-full animate-bounce [animation-delay:-0.45s] h-2"></span>
                <span className="w-1 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.2s] h-3.5"></span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-rose-300 font-mono text-[10px] uppercase tracking-wider bg-rose-500/20 px-1.5 py-0.5 rounded border border-rose-500/30">
                    Voice Active
                  </span>
                  <span className="text-slate-300 text-xs truncate">
                    {interimTranscript ? (
                      <span className="text-white font-medium italic">
                        &ldquo;{interimTranscript}&rdquo;
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        Speak a search topic or command (e.g. &ldquo;heat pump grants&rdquo;, &ldquo;open writer&rdquo;, &ldquo;filter drafts&rdquo;)...
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={stopListening}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Voice Feedback Toast Banner */}
        {voiceFeedback && (
          <div
            id="voice-search-feedback-banner"
            className="px-3.5 sm:px-4 py-2 bg-emerald-500/15 border-b border-emerald-500/30 flex items-center justify-between gap-2 text-xs text-emerald-300 shrink-0 animate-in fade-in duration-150"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              <span className="font-medium">{voiceFeedback.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setVoiceFeedback(null)}
              className="p-1 rounded text-emerald-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Dismiss"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Voice Error Banner */}
        {voiceError && (
          <div
            id="voice-search-error-banner"
            className="px-3.5 sm:px-4 py-2 bg-amber-500/15 border-b border-amber-500/30 flex items-center justify-between gap-2 text-xs text-amber-200 shrink-0 animate-in fade-in duration-150"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-400 shrink-0" />
              <span>{voiceError}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  resetVoiceError();
                  startListening();
                }}
                className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 transition cursor-pointer text-[11px] font-medium"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={resetVoiceError}
                className="p-1 rounded text-amber-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Dismiss"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Category Filters Bar */}
        <div
          id="global-search-category-filter-bar"
          role="tablist"
          aria-label="Filter search results by category"
          className="px-3 sm:px-4 py-2 border-b border-white/10 bg-slate-950/70 flex items-center justify-between gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none text-xs shrink-0"
        >
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mr-1 flex items-center gap-1 select-none shrink-0">
              <Filter size={11} className="text-emerald-400" />
              <span>Filter:</span>
            </span>

            {CATEGORY_TABS.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              const count = categoryCounts[cat.id];

              return (
                <button
                  key={cat.id}
                  id={cat.btnId}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveCategory(cat.id)}
                  title={cat.tooltip}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs transition cursor-pointer flex items-center gap-1.5 shrink-0 select-none ${
                    isActive
                      ? cat.activeClass
                      : `text-slate-400 ${cat.hoverClass} border-transparent bg-white/5`
                  }`}
                >
                  <Icon size={12} className={isActive ? 'opacity-100' : cat.iconColor} />
                  <span className="font-medium">{cat.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full transition ${
                      isActive
                        ? 'bg-white/20 text-white font-bold'
                        : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {activeCategory !== 'all' && (
            <button
              onClick={() => setActiveCategory('all')}
              className="text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-white/5 transition cursor-pointer font-mono shrink-0 ml-auto flex items-center gap-1"
              title="Reset category filter to show all items"
              id="category-filter-reset-btn"
            >
              <X size={11} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>

        {/* Results Container */}
        <div
          ref={resultsContainerRef}
          className="flex-1 overflow-y-auto p-2 sm:p-3 divide-y divide-white/5 scrollbar-thin scrollbar-thumb-white/10 min-h-[220px]"
          id="global-search-results-list"
        >
          {/* Recent Searches Pills (when query is empty) */}
          {!query && recentSearches.length > 0 && (
            <div className="p-3 mb-2 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 font-semibold">
                  <Clock size={12} className="text-emerald-400" />
                  Recent Searches
                </span>
                <button
                  onClick={handleClearRecents}
                  className="text-[10px] font-mono text-slate-500 hover:text-rose-400 transition cursor-pointer flex items-center gap-1"
                >
                  <Trash2 size={10} />
                  <span>Clear</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {recentSearches.map((term, i) => (
                  <button
                    key={i}
                    onClick={() => handleRecentClick(term)}
                    className="text-xs bg-black/40 hover:bg-emerald-500/10 border border-white/10 hover:border-emerald-500/30 text-slate-300 hover:text-emerald-300 px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 font-sans"
                  >
                    <Search size={10} className="text-slate-500" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Quick Jumps & Frequent Destinations (when query is empty) */}
          {!query && (
            <div className="p-3 mb-2.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-slate-800/40 to-indigo-500/10 border border-emerald-500/25">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
                    <Sparkles size={13} className="text-emerald-400 animate-pulse" />
                  </div>
                  <span className="text-xs font-bold font-mono tracking-wider uppercase text-emerald-300">
                    Suggested
                  </span>
                  <span className="text-[11px] text-slate-400 font-sans hidden sm:inline">
                    Prioritizing recent drafts & frequent navigation destinations
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  Instant Jump
                </span>
              </div>

              {/* Frequent destination quick jump chips */}
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                <span className="text-[10px] font-mono text-slate-400 mr-1">Frequent:</span>
                {[
                  { id: 'dashboard', label: 'SEO Overview', icon: LayoutDashboard, tab: 'dashboard', color: 'text-indigo-400' },
                  { id: 'writer', label: 'AI Writer', icon: FileText, tab: 'writer', color: 'text-emerald-400' },
                  { id: 'keywords', label: 'Keywords', icon: TrendingUp, tab: 'keywords', color: 'text-amber-400' },
                  { id: 'audit', label: 'Site Health', icon: ShieldCheck, tab: 'audit', color: 'text-sky-400' },
                  { id: 'crawler', label: 'Live Crawler', icon: Sparkles, tab: 'crawler', color: 'text-rose-400' },
                  { id: 'p23_grants', label: 'SEAI Grants', icon: ExternalLink, tab: 'p23_grants', color: 'text-emerald-400' },
                ].map((dest) => (
                  <button
                    key={dest.id}
                    onClick={() => handleQuickJump(dest.tab)}
                    className="text-[11px] bg-black/50 hover:bg-emerald-500/15 text-slate-300 hover:text-emerald-200 border border-white/10 hover:border-emerald-500/30 px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 font-medium"
                  >
                    <dest.icon size={11} className={dest.color} />
                    <span>{dest.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results List */}
          {searchResults.length > 0 ? (
            searchResults.map((item, index) => {
              const isSelected = index === selectedIndex;
              const isFirstRecentDraft =
                !query &&
                item.suggestedSection === 'recent_draft' &&
                (index === 0 ||
                  searchResults[index - 1]?.suggestedSection !== 'recent_draft');
              const isFirstFrequentNav =
                !query &&
                item.suggestedSection === 'frequent_nav' &&
                (index === 0 ||
                  searchResults[index - 1]?.suggestedSection !== 'frequent_nav');
              const isFirstOtherItem =
                !query &&
                !item.isSuggested &&
                (index === 0 || searchResults[index - 1]?.isSuggested);

              return (
                <React.Fragment key={item.id}>
                  {/* Suggested Recent Drafts Section Divider */}
                  {isFirstRecentDraft && (
                    <div className="flex items-center justify-between px-2 pt-2.5 pb-1 text-slate-400 font-mono text-[11px] border-b border-white/5 mb-1 mt-1">
                      <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-emerald-400">
                        <FileText size={12} />
                        <span>Suggested • Recent Drafts</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-sans hidden sm:inline">
                        Latest working content drafts
                      </span>
                    </div>
                  )}

                  {/* Suggested Frequent Destinations Section Divider */}
                  {isFirstFrequentNav && (
                    <div className="flex items-center justify-between px-2 pt-3 pb-1 text-slate-400 font-mono text-[11px] border-b border-white/5 mb-1 mt-2">
                      <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-indigo-400">
                        <LayoutDashboard size={12} />
                        <span>Suggested • Frequent Destinations</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-sans hidden sm:inline">
                        Primary dashboard views
                      </span>
                    </div>
                  )}

                  {/* Other Search Items Section Divider */}
                  {isFirstOtherItem && (
                    <div className="flex items-center justify-between px-2 pt-3 pb-1 text-slate-400 font-mono text-[11px] border-b border-white/5 mb-1 mt-2">
                      <div className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-slate-400">
                        <Filter size={12} />
                        <span>Additional Index Items</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-sans hidden sm:inline">
                        Keywords & Audit diagnostics
                      </span>
                    </div>
                  )}

                  <div
                    data-result-index={index}
                    onClick={() => handleSelectResult(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`p-3 rounded-xl transition cursor-pointer flex items-start gap-3 my-0.5 group ${
                      isSelected
                        ? 'bg-emerald-500/10 border border-emerald-500/30'
                        : item.isSuggested
                          ? 'bg-white/[0.02] hover:bg-white/5 border border-white/5'
                          : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    {/* Category Icon Container */}
                    <div
                      className={`p-2 rounded-xl border shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-black/50 border-emerald-500/40 shadow-xs'
                          : 'bg-black/30 border-white/10'
                      }`}
                    >
                      {renderCategoryIcon(item.category)}
                    </div>

                    {/* Main Item Body */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs sm:text-sm font-semibold truncate ${
                            isSelected ? 'text-emerald-300' : 'text-white'
                          }`}
                        >
                          {item.title}
                        </span>

                        {item.isSuggested && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-semibold">
                            <Sparkles size={9} className="text-emerald-400" />
                            {item.suggestedSection === 'recent_draft'
                              ? 'Recent Draft'
                              : 'Frequent Nav'}
                          </span>
                        )}

                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${renderBadgeVariant(
                            item.badge.variant,
                          )}`}
                        >
                          {item.badge.label}
                        </span>
                      </div>

                      {item.subtitle && (
                        <p className="text-[11px] text-slate-400 font-sans truncate">
                          {item.subtitle}
                        </p>
                      )}

                      {item.snippet && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {item.snippet}
                        </p>
                      )}

                      {/* Metric Pills */}
                      {item.metrics && item.metrics.length > 0 && (
                        <div className="flex items-center gap-2 pt-1 flex-wrap">
                          {item.metrics.map((metric, mi) => (
                            <span
                              key={mi}
                              className="text-[10px] font-mono bg-black/40 text-slate-300 border border-white/10 px-2 py-0.5 rounded-md flex items-center gap-1"
                            >
                              <span className="text-slate-500">{metric.label}:</span>
                              <span className="font-bold text-slate-200">
                                {metric.value}
                              </span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right Navigation Arrow & Enter Hint */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0 pl-2">
                      <div
                        className={`p-1.5 rounded-lg border transition ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                            : 'bg-white/5 text-slate-400 border-white/10 opacity-60 group-hover:opacity-100'
                        }`}
                      >
                        <CornerDownLeft size={13} />
                      </div>
                      <span className="text-[9px] font-mono text-slate-500 hidden sm:inline">
                        {item.targetTab}
                      </span>
                    </div>
                  </div>
                </React.Fragment>
              );
            })
          ) : (
            <div className="py-12 px-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-slate-400 flex items-center justify-center mx-auto">
                <Search size={22} className="text-slate-500" />
              </div>
              <h4 className="text-sm font-semibold text-white">
                No matching results found for &ldquo;{query}&rdquo;
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try searching for broader retrofit terms like &ldquo;SEAI
                grants&rdquo;, &ldquo;heat pump&rdquo;, &ldquo;BER&rdquo;, or
                &ldquo;sitemap&rdquo;.
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={() => setQuery('heat pump')}
                  className="text-xs text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-lg transition cursor-pointer"
                >
                  Search &ldquo;heat pump&rdquo;
                </button>
                <button
                  onClick={() => setQuery('SEAI')}
                  className="text-xs text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 px-2.5 py-1 rounded-lg transition cursor-pointer"
                >
                  Search &ldquo;SEAI&rdquo;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Voice Commands Guide Drawer (Collapsible) */}
        {showVoiceHelp && (
          <div
            id="voice-commands-help-panel"
            className="p-4 border-t border-white/10 bg-slate-950/95 max-h-56 overflow-y-auto shrink-0 animate-in slide-in-from-bottom-2 duration-150 text-xs"
          >
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Mic size={14} className="text-emerald-400" />
                <span className="font-semibold text-white font-mono text-xs uppercase tracking-wider">
                  Voice Commands Reference
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Web Speech API
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowVoiceHelp(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Close Voice Guide"
              >
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 font-mono text-[11px]">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-emerald-400 font-bold block mb-1">🔍 Search Queries</span>
                <p className="text-slate-400 text-[10px] mb-2 font-sans">Speak any retrofit query directly:</p>
                <ul className="space-y-1 text-slate-300">
                  <li>&ldquo;heat pump grants&rdquo;</li>
                  <li>&ldquo;solar PV Limerick&rdquo;</li>
                  <li>&ldquo;BER B2 requirements&rdquo;</li>
                </ul>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-indigo-400 font-bold block mb-1">🚀 Navigation</span>
                <p className="text-slate-400 text-[10px] mb-2 font-sans">Switch views instantly:</p>
                <ul className="space-y-1 text-slate-300">
                  <li>&ldquo;open writer&rdquo;</li>
                  <li>&ldquo;go to overview&rdquo;</li>
                  <li>&ldquo;go to site health&rdquo;</li>
                </ul>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-amber-400 font-bold block mb-1">📂 Category Filters</span>
                <p className="text-slate-400 text-[10px] mb-2 font-sans">Filter active results list:</p>
                <ul className="space-y-1 text-slate-300">
                  <li>&ldquo;filter drafts&rdquo;</li>
                  <li>&ldquo;filter audits&rdquo;</li>
                  <li>&ldquo;filter research&rdquo; / &ldquo;show all&rdquo;</li>
                </ul>
              </div>

              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-rose-400 font-bold block mb-1">⚡ Instant Actions</span>
                <p className="text-slate-400 text-[10px] mb-2 font-sans">Trigger dialog actions:</p>
                <ul className="space-y-1 text-slate-300">
                  <li>&ldquo;open first&rdquo; (selects result #1)</li>
                  <li>&ldquo;clear search&rdquo;</li>
                  <li>&ldquo;close modal&rdquo; / &ldquo;cancel&rdquo;</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Modal Help Footer with Keyboard Shortcuts */}
        <div
          id="global-search-help-footer"
          className="px-3.5 py-2.5 sm:px-4 sm:py-3 border-t border-white/10 bg-black/50 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4 text-[11px] text-slate-400 shrink-0 font-mono"
        >
          {/* Keyboard Shortcuts List */}
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
            <span className="flex items-center gap-1.5 text-slate-300 font-sans font-medium text-xs">
              <Keyboard size={13} className="text-emerald-400 shrink-0" />
              <span>Shortcuts:</span>
            </span>

            <span
              className="inline-flex items-center gap-1"
              title="Press Cmd+K (Mac) or Ctrl+K (Windows/Linux) to toggle search"
            >
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/15 text-slate-200 font-mono text-[10px] shadow-xs">
                Cmd/Ctrl+K
              </kbd>
              <span className="text-slate-400 text-[10px] font-sans">toggle</span>
            </span>

            <span
              className="inline-flex items-center gap-1"
              title="Press '/' to quick-search or refocus input"
            >
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/15 text-slate-200 font-mono text-[10px] shadow-xs">
                /
              </kbd>
              <span className="text-slate-400 text-[10px] font-sans">search</span>
            </span>

            <span
              className="inline-flex items-center gap-1"
              title="Press Escape to close modal"
            >
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/15 text-slate-200 font-mono text-[10px] shadow-xs">
                Escape
              </kbd>
              <span className="text-slate-400 text-[10px] font-sans">to close</span>
            </span>

            <span className="hidden md:inline-flex text-white/20">|</span>

            <span
              className="hidden md:inline-flex items-center gap-1"
              title="Press Alt+1-5 to switch category filter (All, Drafts, Audits, Research, Navigation)"
            >
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/15 text-slate-300 font-mono text-[10px]">
                Alt+1-5
              </kbd>
              <span className="text-slate-400 text-[10px] font-sans">filter type</span>
            </span>

            <span className="hidden md:inline-flex text-white/20">|</span>

            <span className="hidden md:inline-flex items-center gap-1" title="Navigate results with Up/Down arrows">
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/15 text-slate-300 font-mono text-[10px]">
                ↑↓
              </kbd>
              <span className="text-slate-400 text-[10px] font-sans">navigate</span>
            </span>

            <span className="hidden md:inline-flex items-center gap-1" title="Press Enter to open result">
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/15 text-slate-300 font-mono text-[10px]">
                ↵
              </kbd>
              <span className="text-slate-400 text-[10px] font-sans">open</span>
            </span>

            {isVoiceSupported && (
              <span className="hidden lg:inline-flex items-center gap-1 text-emerald-400/90" title="Alt+V for Voice Search">
                <kbd className="px-1.5 py-0.5 bg-emerald-500/15 rounded border border-emerald-500/30 text-emerald-300 font-mono text-[10px]">
                  Alt+V
                </kbd>
                <span className="text-emerald-400/90 text-[10px] font-sans">voice</span>
              </span>
            )}
          </div>

          {/* Voice Guide & Index Indicator */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              id="voice-commands-guide-toggle-btn"
              onClick={() => setShowVoiceHelp((prev) => !prev)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition cursor-pointer text-[11px] font-mono ${
                showVoiceHelp
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 border-white/10'
              }`}
              title="Toggle Voice Commands Help"
            >
              <Mic size={12} className={showVoiceHelp ? 'text-emerald-400' : 'text-slate-400'} />
              <span>Voice Guide</span>
            </button>

            <div className="flex items-center gap-1.5 text-emerald-400 hidden sm:flex text-[10px]">
              <CheckCircle2 size={12} />
              <span>Universal Index Live</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
