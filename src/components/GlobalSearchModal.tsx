import React, { useState, useEffect, useRef, useMemo } from 'react';
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

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Load recent searches when opened
  useEffect(() => {
    if (isOpen) {
      setRecentSearches(getRecentSearches());
      setQuery('');
      setActiveCategory('all');
      setSelectedIndex(0);
      // Auto-focus input on next frame
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Keyboard shortcut listener: Cmd+K / Ctrl+K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
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
  }, [isOpen, selectedIndex]);

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

  // Compute live search results
  const searchResults = useMemo(() => {
    return searchGlobalIndex(query, activeCategory, drafts);
  }, [query, activeCategory, drafts]);

  // Reset selected index when query or category changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeCategory]);

  const stats = useMemo(() => {
    return getSearchIndexStats(drafts);
  }, [drafts]);

  const handleSelectResult = (result: GlobalSearchResult) => {
    if (query.trim()) {
      addRecentSearch(query);
      setRecentSearches(getRecentSearches());
    }
    onNavigate(result);
    onClose();
  };

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
        <div className="p-3.5 sm:p-4 border-b border-white/10 flex items-center gap-3 bg-black/40">
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

          {query && (
            <button
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Clear search input"
            >
              <X size={15} />
            </button>
          )}

          <button
            onClick={onClose}
            className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg transition cursor-pointer"
            title="Close Search Dialog (Esc)"
          >
            <span>ESC</span>
          </button>
        </div>

        {/* Category Filters Bar */}
        <div className="px-3 sm:px-4 py-2 border-b border-white/10 bg-slate-950/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs font-medium shrink-0">
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 mr-1 flex items-center gap-1">
            <Filter size={10} />
            Filter:
          </span>

          <button
            onClick={() => setActiveCategory('all')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeCategory === 'all'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            <span>All Items</span>
            <span className="text-[10px] font-mono bg-white/10 px-1.5 py-0.2 rounded-full">
              {stats.total}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('draft')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeCategory === 'draft'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            <FileText size={12} className="text-emerald-400" />
            <span>Drafts</span>
            <span className="text-[10px] font-mono bg-white/10 px-1.5 py-0.2 rounded-full">
              {stats.drafts}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('keyword')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeCategory === 'keyword'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            <TrendingUp size={12} className="text-amber-400" />
            <span>Keywords</span>
            <span className="text-[10px] font-mono bg-white/10 px-1.5 py-0.2 rounded-full">
              {stats.keywords}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('audit')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeCategory === 'audit'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            <ShieldCheck size={12} className="text-sky-400" />
            <span>Audit Logs</span>
            <span className="text-[10px] font-mono bg-white/10 px-1.5 py-0.2 rounded-full">
              {stats.audits}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory('nav')}
            className={`px-2.5 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeCategory === 'nav'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            <LayoutDashboard size={12} className="text-indigo-400" />
            <span>Navigation</span>
            <span className="text-[10px] font-mono bg-white/10 px-1.5 py-0.2 rounded-full">
              {stats.navs}
            </span>
          </button>
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

          {/* Results List */}
          {searchResults.length > 0 ? (
            searchResults.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  data-result-index={index}
                  onClick={() => handleSelectResult(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`p-3 rounded-xl transition cursor-pointer flex items-start gap-3 my-0.5 group ${
                    isSelected
                      ? 'bg-emerald-500/10 border border-emerald-500/30'
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

        {/* Modal Footer Controls */}
        <div className="p-3 border-t border-white/10 bg-black/40 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 shrink-0 font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/10 text-slate-300">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/10 text-slate-300">
                ↓
              </kbd>
              <span>navigate</span>
            </span>

            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/10 text-slate-300">
                ↵
              </kbd>
              <span>open</span>
            </span>

            <span className="flex items-center gap-1 hidden sm:inline-flex">
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded border border-white/10 text-slate-300">
                ESC
              </kbd>
              <span>close</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 size={12} />
            <span>Universal Index Live (Ctrl+K)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
