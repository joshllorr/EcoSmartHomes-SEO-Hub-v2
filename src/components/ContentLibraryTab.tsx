import { useState, useMemo } from "react";
import { 
  BookOpen, 
  Search, 
  Filter, 
  ChevronRight, 
  CheckCircle2, 
  Link, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Copy, 
  Check, 
  X, 
  Send, 
  Download, 
  FileText, 
  Sparkles, 
  Zap, 
  Layers, 
  Clock, 
  Eye, 
  Globe,
  Share2,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ArticleDraft } from "../types";

export interface LibraryItem extends Omit<ArticleDraft, "status"> {
  categoryType?: "Article" | "Landing Page" | "Link Bait" | "Idea";
  status: "Drafted" | "Published" | "Ready to Publish" | "In Progress";
  liveUrl?: string;
  subtitle?: string;
}

interface ContentLibraryTabProps {
  drafts?: ArticleDraft[];
  onOpenInWriter: (suggestion: string) => void;
  onUpdateDrafts?: (drafts: ArticleDraft[]) => void;
  site: string;
}

const INITIAL_LIBRARY_ITEMS: LibraryItem[] = [
  {
    id: "lib-1",
    title: "Air-to-Water vs Ireland's humidity: performance realities you should know",
    topic: "Heat Pumps & Humidity",
    content: "# Air-to-Water vs Ireland's Humidity\n\nIreland's high ambient humidity levels present unique operational challenges for air-to-water heat pump systems, particularly during frost cycles in mid-winter...",
    status: "Drafted",
    date: "Jul 18, 2026",
    wordCount: 840,
    categoryType: "Idea",
    subtitle: "Air-to-Water vs Ir...",
    metaTitle: "Air-to-Water Heat Pumps in Damp Irish Climates | EcoSmart Guide",
    metaDescription: "An in-depth guide explaining how relative humidity impacts heat pump COP and defrost cycles in Irish homes."
  },
  {
    id: "lib-2",
    title: "Leakiness, Airtightness & Building Health",
    topic: "Airtightness & Ventilation",
    content: "# Leakiness, Airtightness & Building Health\n\nWhen retrofitting a traditional Irish home, achieving airtightness without adequate mechanical ventilation (MVHR) can lead to indoor air quality decay and condensation risk...",
    status: "Drafted",
    date: "Jul 18, 2026",
    wordCount: 620,
    categoryType: "Idea",
    subtitle: "Leakiness, Airtigh...",
    metaTitle: "Airtightness Testing & Moisture Mitigation | EcoSmart",
    metaDescription: "Learn how air leakiness impacts energy efficiency and why controlled ventilation is vital."
  },
  {
    id: "lib-3",
    title: "The technical reason your heat pump cycles too frequently",
    topic: "Heat Pump Diagnostics",
    content: "# Why Heat Pumps Short Cycle in Cold Weather\n\nShort cycling occurs when the heat pump turns on and off rapidly due to improper buffer tank sizing, mismatched compressor output, or restricted flow rates...",
    status: "Drafted",
    date: "Jul 18, 2026",
    wordCount: 910,
    categoryType: "Idea",
    subtitle: "The technical reas...",
    metaTitle: "Heat Pump Short Cycling Solutions & Flow Rates | EcoSmart",
    metaDescription: "Diagnose short cycling causes and fix efficiency loss in residential heat pump setups."
  },
  {
    id: "lib-4",
    title: "The 2026 SEAI Grant Eligibility & Value Assessment",
    topic: "SEAI Retrofit Grants",
    content: "# The 2026 SEAI Grant Eligibility & Value Assessment Tool\n\nEverything you need to know about claiming up to €12,500 in heat pump grants, €2,000 for attic insulation, and additional solar PV support under the 2026 SEAI scheme...",
    status: "Ready to Publish",
    date: "18/07/2026",
    wordCount: 1246,
    categoryType: "Landing Page",
    subtitle: "The 2026 SEAI Grant Eligibility & Value Assessment · quiz",
    metaTitle: "2026 SEAI Grant Eligibility Quiz & Calculator | EcoSmart Homes",
    metaDescription: "Calculate exact grant values available for your home retrofitting project in Ireland."
  },
  {
    id: "lib-5",
    title: "The New 8-Category BER Scale: 2026 Official Conversion Guide",
    topic: "BER Rating Systems",
    content: "# The New 8-Category BER Scale: 2026 Official Conversion Guide\n\nDetailed breakdown of the revised BER scale categories A1 to G, kWh/m²/yr primary energy thresholds, and compliance requirements for Irish landlords...",
    status: "Ready to Publish",
    date: "18/07/2026",
    wordCount: 800,
    categoryType: "Article",
    subtitle: "The New 8-Category BER Scale: 2026 Official Conversion Guide · chart",
    metaTitle: "BER Scale Conversion Guide 2026 | EcoSmart Ireland",
    metaDescription: "Official guide to BER energy rating conversions and compliance targets."
  }
];

export default function ContentLibraryTab({ 
  drafts = [], 
  onOpenInWriter, 
  onUpdateDrafts,
  site 
}: ContentLibraryTabProps) {
  // Merge prop drafts with default initial items
  const [items, setItems] = useState<LibraryItem[]>(() => {
    if (drafts && drafts.length > 0) {
      const formattedPropDrafts: LibraryItem[] = drafts.map((d, idx) => ({
        ...d,
        categoryType: "Article",
        status: d.status === "Published" ? "Published" : "Ready to Publish",
        subtitle: `${d.title.substring(0, 25)}...`
      }));
      // Merge unique by title
      const existingTitles = new Set(formattedPropDrafts.map(f => f.title.toLowerCase()));
      const filteredInitial = INITIAL_LIBRARY_ITEMS.filter(i => !existingTitles.has(i.title.toLowerCase()));
      return [...formattedPropDrafts, ...filteredInitial];
    }
    return INITIAL_LIBRARY_ITEMS;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showNoticeBanner, setShowNoticeBanner] = useState(true);
  
  // Modals state
  const [editingItem, setEditingItem] = useState<LibraryItem | null>(null);
  const [linkModalItem, setLinkModalItem] = useState<LibraryItem | null>(null);
  const [liveUrlInput, setLiveUrlInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  // Computed Statistics
  const stats = useMemo(() => {
    const total = items.length;
    const readyToPublish = items.filter(i => i.status === "Ready to Publish").length;
    const draftsCount = items.filter(i => i.status === "Drafted").length;
    const inProgress = items.filter(i => i.status === "In Progress").length;
    const linkBaits = items.filter(i => i.categoryType === "Link Bait").length;
    const landingPages = items.filter(i => i.categoryType === "Landing Page").length;
    const totalWords = items.reduce((acc, i) => acc + (i.wordCount || 0), 0);

    return {
      total,
      readyToPublish,
      draftsCount,
      inProgress,
      linkBaits,
      landingPages,
      totalWords
    };
  }, [items]);

  // Filtered List
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const queryMatch = !searchQuery.trim() || 
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()));

      let filterMatch = true;
      if (selectedCategoryFilter === "Ready to Publish") {
        filterMatch = item.status === "Ready to Publish";
      } else if (selectedCategoryFilter === "Drafts") {
        filterMatch = item.status === "Drafted";
      } else if (selectedCategoryFilter === "Landing Pages") {
        filterMatch = item.categoryType === "Landing Page";
      } else if (selectedCategoryFilter === "Published") {
        filterMatch = item.status === "Published" || !!item.liveUrl;
      }

      return queryMatch && filterMatch;
    });
  }, [items, searchQuery, selectedCategoryFilter]);

  const allSelected = filteredItems.length > 0 && selectedIds.length === filteredItems.length;

  const handleToggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(i => i.id));
    }
  };

  const handleToggleSelectItem = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setSelectedIds(prev => prev.filter(i => i !== id));
  };

  const handleDeleteSelected = () => {
    setItems(prev => prev.filter(i => !selectedIds.includes(i.id)));
    setSelectedIds([]);
  };

  const handleSaveLiveUrl = () => {
    if (!linkModalItem) return;
    setItems(prev => prev.map(item => {
      if (item.id === linkModalItem.id) {
        return {
          ...item,
          liveUrl: liveUrlInput || `https://${site}/articles/${item.id}`,
          status: "Published"
        };
      }
      return item;
    }));
    setLinkModalItem(null);
    setLiveUrlInput("");
  };

  const handlePublishNow = async (item: LibraryItem) => {
    setPublishingId(item.id);
    try {
      const slug = item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const res = await fetch("/api/cms/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId: site,
          slug,
          title: item.title,
          content: item.content || `# ${item.title}\n\nArticle content for ${item.topic}`,
          platform: "wordpress"
        })
      });
      const data = await res.json();
      setItems(prev => prev.map(i => {
        if (i.id === item.id) {
          return {
            ...i,
            status: "Published",
            liveUrl: data.result?.url || `https://${site}/articles/${slug}`
          };
        }
        return i;
      }));
    } catch (err) {
      console.error("CMS Publishing error:", err);
    } finally {
      setPublishingId(null);
    }
  };

  const handleCopyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 text-left" id="content-library-tab">
      
      {/* Top Main Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-[#34d399]/20 text-[#34d399] border border-[#34d399]/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <BookOpen size={11} className="text-[#34d399]" />
              <span>Library</span>
            </span>
            <span className="text-xs font-mono text-slate-400">{items.length} Total Saved Items</span>
          </div>
          <h2 className="text-xl md:text-2xl font-display font-bold text-white tracking-tight">
            Content Library
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Manage, export, and publish your generated content for <strong className="text-slate-200 font-mono">{site}</strong>.
          </p>
        </div>

        {/* Workflow Progress Step Indicator */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 flex items-center gap-2 self-start md:self-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 text-slate-400 rounded-lg text-xs font-mono">
            <span>Step 1:</span>
            <span className="text-[10px] uppercase">Discover</span>
          </div>
          <ChevronRight size={14} className="text-slate-500" />
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 text-slate-400 rounded-lg text-xs font-mono">
            <span>Step 2:</span>
            <span className="text-[10px] uppercase">Write</span>
          </div>
          <ChevronRight size={14} className="text-slate-500" />
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 text-[#34d399] border border-emerald-500/30 rounded-lg text-xs font-bold font-mono">
            <span>Step 3</span>
            <span className="text-[10px] uppercase text-emerald-300">Publish</span>
          </div>
          <span className="ml-2 font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
            9/9
          </span>
        </div>
      </div>

      {/* Top Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/90 border border-white/10 p-3 rounded-2xl">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or keyword..."
            className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#34d399] font-mono"
          />
        </div>

        <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
          <label className="flex items-center gap-2 cursor-pointer font-mono text-xs text-slate-300 bg-black/40 px-3 py-2 rounded-xl border border-white/10 hover:border-white/20 transition">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={handleToggleSelectAll}
              className="accent-[#34d399] rounded cursor-pointer"
            />
            <span>Select all</span>
          </label>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="bg-black/60 text-emerald-300 border border-emerald-500/40 rounded-xl px-3 py-2 text-xs font-mono font-bold appearance-none pr-8 cursor-pointer focus:outline-none"
              >
                <option value="All">All ({items.length})</option>
                <option value="Ready to Publish">Ready to Publish ({stats.readyToPublish})</option>
                <option value="Drafts">Drafts ({stats.draftsCount})</option>
                <option value="Landing Pages">Landing Pages ({stats.landingPages})</option>
                <option value="Published">Published</option>
              </select>
              <Filter size={12} className="absolute right-2.5 top-3 text-emerald-400 pointer-events-none" />
            </div>

            {selectedIds.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 px-3 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Delete ({selectedIds.length})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* OVERVIEW "Library at a glance" Grid */}
      <div className="space-y-3">
        <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
          OVERVIEW
        </div>
        <h3 className="text-2xl font-display font-bold text-white tracking-tight">
          Library at a glance
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="bg-slate-900/90 border border-white/10 rounded-xl p-3.5 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              TOTAL ARTICLES
            </span>
            <p className="text-2xl font-display font-bold text-white">
              {stats.total}
            </p>
          </div>

          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-3.5 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              READY TO PUBLISH
            </span>
            <p className="text-2xl font-display font-bold text-[#34d399]">
              {stats.readyToPublish}
            </p>
          </div>

          <div className="bg-slate-900/90 border border-sky-500/30 rounded-xl p-3.5 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              DRAFTS
            </span>
            <p className="text-2xl font-display font-bold text-sky-400">
              {stats.draftsCount}
            </p>
          </div>

          <div className="bg-slate-900/90 border border-white/10 rounded-xl p-3.5 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              IN PROGRESS
            </span>
            <p className="text-2xl font-display font-bold text-amber-400">
              {stats.inProgress}
            </p>
          </div>

          <div className="bg-slate-900/90 border border-white/10 rounded-xl p-3.5 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              LINK BAITS
            </span>
            <p className="text-2xl font-display font-bold text-slate-300">
              {stats.linkBaits}
            </p>
          </div>

          <div className="bg-slate-900/90 border border-white/10 rounded-xl p-3.5 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              LANDING PAGES
            </span>
            <p className="text-2xl font-display font-bold text-amber-300">
              {stats.landingPages}
            </p>
          </div>

          <div className="bg-slate-900/90 border border-white/10 rounded-xl p-3.5 space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              TOTAL WORDS
            </span>
            <p className="text-2xl font-display font-bold text-white font-mono">
              {stats.totalWords.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Notice Banner */}
      <AnimatePresence>
        {showNoticeBanner && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-sky-950/40 border border-sky-500/30 text-sky-200 rounded-xl p-3.5 flex items-center justify-between text-xs font-sans shadow-md"
          >
            <div className="flex items-center gap-2.5">
              <Link size={15} className="text-sky-400 shrink-0" />
              <span>
                <strong>Published articles elsewhere?</strong> Click the <code className="bg-sky-900/60 px-1.5 py-0.5 rounded text-sky-300 font-mono">🔗</code> icon on any completed article to link its live URL and track SEO performance in Results.
              </span>
            </div>
            <button
              onClick={() => setShowNoticeBanner(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
            >
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table / List of Saved Articles */}
      <div className="bg-slate-900/80 border border-white/10 rounded-2xl overflow-hidden shadow-xl divide-y divide-white/5">
        {filteredItems.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <BookOpen size={32} className="mx-auto text-slate-600" />
            <p className="text-sm font-mono text-slate-400">No content items match your criteria.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategoryFilter("All");
              }}
              className="text-xs font-mono font-bold text-[#34d399] hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            const isPublished = item.status === "Published" || !!item.liveUrl;
            const isReady = item.status === "Ready to Publish";

            return (
              <div
                key={item.id}
                className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:bg-white/[0.02] ${
                  isSelected ? "bg-emerald-950/20" : ""
                }`}
              >
                {/* Left checkbox & title & sublabel */}
                <div className="flex items-start md:items-center gap-3.5 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleSelectItem(item.id)}
                    className="accent-[#34d399] rounded mt-1 md:mt-0 cursor-pointer shrink-0"
                  />

                  {/* Status Indicator Dot */}
                  <span className={`w-2 h-2 rounded-full shrink-0 mt-2 md:mt-0 ${
                    isPublished
                      ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                      : isReady
                      ? "bg-emerald-400"
                      : "bg-sky-400"
                  }`} />

                  <div className="space-y-0.5 min-w-0 flex-1">
                    <h4 
                      onClick={() => setEditingItem(item)}
                      className="font-display font-semibold text-white text-sm hover:text-[#34d399] transition cursor-pointer truncate"
                    >
                      {item.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
                      {item.subtitle && (
                        <span className="truncate max-w-[280px] text-slate-400">
                          {item.subtitle}
                        </span>
                      )}
                      {item.categoryType && (
                        <span className="bg-black/40 text-slate-300 px-2 py-0.2 rounded border border-white/10 text-[10px]">
                          {item.categoryType}
                        </span>
                      )}
                      {item.liveUrl && (
                        <a 
                          href={item.liveUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[#34d399] hover:underline flex items-center gap-1 text-[10px]"
                        >
                          <Globe size={11} />
                          <span>Live</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side metadata & action buttons */}
                <div className="flex items-center gap-3 justify-between md:justify-end shrink-0 font-mono text-xs">
                  <span className="text-slate-400 text-[11px] min-w-[80px]">
                    {item.date}
                  </span>

                  {/* Status badge */}
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isPublished
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : isReady
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                      : "bg-sky-500/15 text-sky-300 border border-sky-500/30"
                  }`}>
                    {item.categoryType === "Idea" ? "Idea" : item.status}
                  </span>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    {item.status === "Drafted" || item.categoryType === "Idea" ? (
                      <button
                        onClick={() => {
                          const prompt = `Title: ${item.title}\nTopic: ${item.topic}\nDraft Content:\n${item.content}`;
                          onOpenInWriter(prompt);
                        }}
                        className="bg-[#34d399] hover:bg-[#2bc48d] text-[#0f172a] font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow text-xs"
                      >
                        <Edit3 size={13} />
                        <span>Write</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePublishNow(item)}
                        disabled={publishingId === item.id}
                        className="bg-[#34d399] hover:bg-[#2bc48d] text-[#0f172a] font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow text-xs"
                      >
                        {publishingId === item.id ? (
                          <span>Publishing...</span>
                        ) : (
                          <>
                            <Send size={13} />
                            <span>{isPublished ? "Republish" : "Publish"}</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Link URL Icon */}
                    <button
                      onClick={() => {
                        setLinkModalItem(item);
                        setLiveUrlInput(item.liveUrl || "");
                      }}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-sky-300 transition cursor-pointer"
                      title="Link live published URL"
                    >
                      <Link size={15} />
                    </button>

                    {/* Preview / Edit Modal Button */}
                    <button
                      onClick={() => setEditingItem(item)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
                      title="View Article Details & Schema"
                    >
                      <Eye size={15} />
                    </button>

                    {/* Trash / Delete */}
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                      title="Delete item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Article Detail / Edit Modal */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/15 rounded-2xl max-w-3xl w-full p-6 space-y-5 relative shadow-2xl overflow-y-auto max-h-[90vh] text-left"
            >
              <button
                onClick={() => setEditingItem(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded font-mono font-bold uppercase text-[10px] bg-emerald-500/20 text-[#34d399] border border-emerald-500/30">
                    {editingItem.categoryType || "Article"}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{editingItem.wordCount} Words</span>
                </div>
                <h3 className="text-xl font-display font-bold text-white">
                  {editingItem.title}
                </h3>
              </div>

              {/* Meta details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/40 p-3.5 rounded-xl border border-white/5 font-mono text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">SEO Meta Title</span>
                  <p className="text-slate-200 mt-0.5 font-sans">{editingItem.metaTitle || editingItem.title}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">SEO Meta Description</span>
                  <p className="text-slate-200 mt-0.5 font-sans">{editingItem.metaDescription || "No description set"}</p>
                </div>
              </div>

              {/* Markdown Content Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                  <span>Generated Markdown Content</span>
                  <button
                    onClick={() => handleCopyToClipboard(editingItem.content, editingItem.id)}
                    className="text-[#34d399] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === editingItem.id ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedId === editingItem.id ? "Copied" : "Copy All"}</span>
                  </button>
                </div>
                <div className="bg-black/60 border border-white/10 rounded-xl p-4 font-mono text-xs text-slate-300 max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {editingItem.content}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
                <button
                  onClick={() => {
                    const prompt = `Title: ${editingItem.title}\nTopic: ${editingItem.topic}\nContent:\n${editingItem.content}`;
                    onOpenInWriter(prompt);
                    setEditingItem(null);
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                >
                  <Edit3 size={14} />
                  <span>Open in AI Writer</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handlePublishNow(editingItem);
                      setEditingItem(null);
                    }}
                    className="bg-[#34d399] hover:bg-[#2bc48d] text-[#0f172a] px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow"
                  >
                    <Send size={14} />
                    <span>Publish to CMS</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Link Live URL Modal */}
      <AnimatePresence>
        {linkModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-4 relative shadow-2xl text-left"
            >
              <button
                onClick={() => setLinkModalItem(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="space-y-1">
                <span className="text-[10px] font-mono text-sky-400 uppercase tracking-wider font-bold">
                  SEO Live Tracker Link
                </span>
                <h3 className="text-lg font-display font-bold text-white">
                  Link Live Article URL
                </h3>
                <p className="text-xs text-slate-400">
                  Enter the URL where <strong>{linkModalItem.title}</strong> is published to track rankings and search traffic.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-slate-300">
                  Live Published URL
                </label>
                <input
                  type="url"
                  value={liveUrlInput}
                  onChange={(e) => setLiveUrlInput(e.target.value)}
                  placeholder={`https://${site}/blog/article-slug`}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#34d399] font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  onClick={() => setLinkModalItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveLiveUrl}
                  className="bg-[#34d399] hover:bg-[#2bc48d] text-[#0f172a] px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <CheckCircle2 size={14} />
                  <span>Save & Link</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
