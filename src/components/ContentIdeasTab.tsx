import { useState, useMemo } from 'react';
import {
  Sparkles,
  Search,
  TrendingUp,
  Layers,
  FileText,
  Zap,
  ArrowRight,
  ChevronRight,
  DollarSign,
  BarChart3,
  Calendar,
  CheckCircle2,
  Filter,
  BookOpen,
  RefreshCw,
  Lightbulb,
  ExternalLink,
  Target,
  Flame,
  PieChart,
  HelpCircle,
  X,
  Bookmark,
  BookmarkCheck,
  Download,
  Globe,
  ShieldAlert,
  ArrowUpRight,
  SlidersHorizontal,
  Share2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface ContentIdea {
  id: string;
  type: 'Content Gaps' | 'Topics' | 'Trending' | 'Pillar Pages';
  age: string;
  title: string;
  summary: string;
  tags: string[];
  monthlyVolume: string;
  oppScore: string;
  difficulty: 'LOW' | 'MEDIUM' | 'HIGH';
  difficultyScore?: number;
  cpcRange?: string;
  trend: 'rising' | 'falling' | 'stable';
  peakMonth?: string;
  matchScore?: string;
  subtopics: { name: string; vol: string }[];
  targetQuery: string;
  demandStatus: 'strong demand' | 'niche' | 'moderate demand';
  clusterInfo?: string;
  isBookmarked?: boolean;
}

interface ContentIdeasTabProps {
  onOpenInWriter: (suggestion: string) => void;
  site: string;
}

const INITIAL_IDEAS: ContentIdea[] = [
  {
    id: 'gap-1',
    type: 'Content Gaps',
    age: '5d ago',
    title: 'Identifying thermal bypass: Where your attic insulation is failing',
    summary:
      'How air moving through insulation can render 300mm of glass wool completely useless without airtight membranes.',
    tags: [
      'attic insulation',
      'seai attic insulation contractors',
      'seai attic insulation',
      'pumping insulation into walls',
    ],
    monthlyVolume: '2.9K',
    oppScore: '435',
    difficulty: 'HIGH',
    difficultyScore: 100,
    cpcRange: '$1.27–$7.04',
    trend: 'rising',
    peakMonth: 'NOV',
    subtopics: [
      { name: 'attic insulation', vol: '2.9K' },
      { name: 'seai attic insulation contractors', vol: '140' },
      { name: 'seai attic insulation', vol: '110' },
      { name: 'pumping insulation into walls', vol: '70' },
    ],
    targetQuery: 'attic insulation',
    demandStatus: 'strong demand',
  },
  {
    id: 'gap-2',
    type: 'Content Gaps',
    age: '5d ago',
    title: 'The 2026 Carbon Tax Cliff: Predicting your home heating costs',
    summary:
      'Analyzing the specific financial impact of the legislated 2026-2030 carbon tax increases on Irish households using fossil fuel heating.',
    tags: [
      'home heating oil prices',
      'home oil prices',
      'home fuel oil prices',
    ],
    monthlyVolume: '6.6K',
    oppScore: '6.4K',
    difficulty: 'LOW',
    difficultyScore: 4,
    cpcRange: '$0.35–$1.30',
    trend: 'rising',
    peakMonth: 'MAR',
    subtopics: [
      { name: 'home heating oil prices', vol: '6.6K' },
      { name: 'home oil prices', vol: '6.6K' },
      { name: 'home fuel oil prices', vol: '6.6K' },
      { name: 'cost of home heating oil', vol: '6.6K' },
      { name: 'household heating oil prices', vol: '6.6K' },
    ],
    targetQuery: 'home heating oil prices',
    demandStatus: 'strong demand',
  },
  {
    id: 'pillar-1',
    type: 'Pillar Pages',
    age: '6d ago',
    title: 'The 2026 SEAI Grant Eligibility & Value Assessment',
    summary:
      'An interactive quiz & master guide that filters the complex 2026 SEAI grant landscape (including the €12,500 heat pump grant and €2,000 attic grants) to tell users exactly what they can claim.',
    tags: ['seai grants', 'seai ie grants', 'seai ireland grants'],
    monthlyVolume: '14.8K',
    oppScore: '7.9K',
    difficulty: 'MEDIUM',
    difficultyScore: 55,
    cpcRange: '$0.05–$1.28',
    trend: 'rising',
    peakMonth: 'FEB',
    subtopics: [
      { name: 'seai grants', vol: '14.8K' },
      { name: 'seai ie grants', vol: '2.4K' },
      { name: 'seai ireland grants', vol: '2.4K' },
      { name: 'seai grants ie', vol: '2.4K' },
      { name: 'seai windows grant', vol: '1.9K' },
    ],
    targetQuery: 'seai grants',
    demandStatus: 'strong demand',
  },
  {
    id: 'trend-1',
    type: 'Trending',
    age: '6d ago',
    title:
      'Beyond the Smoke: Why Indoor Air Quality is the Next Frontier in Irish Home Retrofitting',
    summary:
      'Explains how modern retrofits, specifically MVHR (Mechanical Ventilation with Heat Recovery), protect homes from outdoor pollutants, hay fever, and smoke while maintaining thermal efficiency.',
    tags: [
      'why is the air quality so bad today',
      'mechanical ventilation heat recovery ireland',
      'indoor air quality sensors',
    ],
    monthlyVolume: '2.4K',
    oppScore: '360',
    difficulty: 'HIGH',
    difficultyScore: 100,
    cpcRange: '$0.29–$0.94',
    trend: 'rising',
    peakMonth: 'JUL',
    matchScore: '93%',
    subtopics: [
      { name: 'air quality monitor for home', vol: '2.4K' },
      { name: 'home indoor air quality monitor', vol: '2.4K' },
      { name: 'home air pollution monitor', vol: '2.4K' },
      { name: 'air quality sensor for home', vol: '480' },
      { name: 'best air quality monitor for home', vol: '210' },
    ],
    targetQuery: 'air quality monitor for home',
    demandStatus: 'strong demand',
  },
  {
    id: 'topic-1',
    type: 'Topics',
    age: '6d ago',
    title: 'Leakiness, Airtightness & Building Health',
    summary:
      'Identifying energy loss points and preventing moisture issues during the retrofit journey.',
    tags: [
      'air tightness test',
      'building air tightness test',
      'airtightness test',
    ],
    monthlyVolume: '640',
    oppScore: '144',
    difficulty: 'MEDIUM',
    difficultyScore: 42,
    trend: 'rising',
    peakMonth: 'JAN',
    clusterInfo: '🗂 cluster demand 640/mo · 4 subtopics',
    subtopics: [
      { name: 'air tightness test', vol: '210' },
      { name: 'building air tightness test', vol: '210' },
      { name: 'airtightness test', vol: '50' },
      { name: 'air tightness test results', vol: '20' },
      { name: 'air tightness test cost', vol: '20' },
    ],
    targetQuery: 'air tightness test',
    demandStatus: 'niche',
  },
  {
    id: 'gap-3',
    type: 'Content Gaps',
    age: '5d ago',
    title: 'The technical reason your heat pump cycles too frequently',
    summary:
      'Diagnosing common control and flow issues that lead to equipment wear and inefficiency.',
    tags: ['heat pump', 'heat pump heat', 'heat pump heat pump'],
    monthlyVolume: '5.4K',
    oppScore: '994',
    difficulty: 'HIGH',
    difficultyScore: 96,
    cpcRange: '$0.51–$2.11',
    trend: 'rising',
    peakMonth: 'APR',
    subtopics: [
      { name: 'heat pump', vol: '5.4K' },
      { name: 'heat pump heat', vol: '5.4K' },
      { name: 'heat pump heat pump', vol: '5.4K' },
      { name: 'energy efficient electric heat', vol: '720' },
      { name: 'heat pump heating costs', vol: '480' },
    ],
    targetQuery: 'heat pump',
    demandStatus: 'strong demand',
  },
  {
    id: 'pillar-2',
    type: 'Pillar Pages',
    age: '6d ago',
    title: '2026-2030 Irish Carbon Tax & Fuel Cost Impact Calculator',
    summary:
      'An interactive tool that allows Irish homeowners to input their current fuel usage (Kerosene, Gas, or Diesel) and see exactly how legislated carbon tax increases (reaching €100/tonne by 2030) will impact their annual bills.',
    tags: [
      'carbon tax ireland',
      'carbon tax calculator ireland',
      'carbon tax increase ireland',
    ],
    monthlyVolume: '590',
    oppScore: '590',
    difficulty: 'LOW',
    difficultyScore: 0,
    trend: 'rising',
    peakMonth: 'APR',
    subtopics: [
      { name: 'carbon tax ireland', vol: '590' },
      { name: 'carbon tax calculator ireland', vol: '10' },
      { name: 'carbon tax increase ireland', vol: '10' },
      { name: 'carbon tax on coal ireland', vol: '10' },
      { name: 'new carbon tax ireland', vol: '10' },
    ],
    targetQuery: 'carbon tax ireland',
    demandStatus: 'strong demand',
  },
];

export default function ContentIdeasTab({
  onOpenInWriter,
  site,
}: ContentIdeasTabProps) {
  const [ideas, setIdeas] = useState<ContentIdea[]>(INITIAL_IDEAS);
  const [targetSite, setTargetSite] = useState<string>(
    site || 'ecosmarthomes.ie',
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [aiGuidance, setAiGuidance] = useState<string>(
    'home retrofitting, BER ratings, SEAI grants, insulation, heat pumps',
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [selectedModalIdea, setSelectedModalIdea] =
    useState<ContentIdea | null>(null);

  // Sorting & Quick Filter states
  const [sortBy, setSortBy] = useState<
    'oppScore' | 'monthlyVolume' | 'difficulty' | 'fresh'
  >('oppScore');
  const [quickFilter, setQuickFilter] = useState<
    'all' | 'quickWins' | 'risingTrends' | 'bookmarked'
  >('all');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // Grounding Search Info State
  const [groundingQueries, setGroundingQueries] = useState<string[]>([]);
  const [groundingSources, setGroundingSources] = useState<
    { title: string; uri: string }[]
  >([]);
  const [isGrounded, setIsGrounded] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      All: ideas.length,
      'Content Gaps': ideas.filter((i) => i.type === 'Content Gaps').length,
      Topics: ideas.filter((i) => i.type === 'Topics').length,
      Trending: ideas.filter((i) => i.type === 'Trending').length,
      'Pillar Pages': ideas.filter((i) => i.type === 'Pillar Pages').length,
    };
  }, [ideas]);

  // Filtered & Sorted Ideas
  const filteredIdeas = useMemo(() => {
    return ideas
      .filter((idea) => {
        const categoryMatch =
          selectedCategory === 'All' || idea.type === selectedCategory;
        const searchMatch =
          !searchQuery.trim() ||
          idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          idea.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          idea.targetQuery.toLowerCase().includes(searchQuery.toLowerCase()) ||
          idea.tags.some((t) =>
            t.toLowerCase().includes(searchQuery.toLowerCase()),
          );

        let quickMatch = true;
        if (quickFilter === 'quickWins') {
          quickMatch = idea.difficulty === 'LOW';
        } else if (quickFilter === 'risingTrends') {
          quickMatch = idea.trend === 'rising' || idea.type === 'Trending';
        } else if (quickFilter === 'bookmarked') {
          quickMatch = bookmarkedIds.has(idea.id);
        }

        return categoryMatch && searchMatch && quickMatch;
      })
      .sort((a, b) => {
        if (sortBy === 'monthlyVolume') {
          const numA =
            parseFloat(a.monthlyVolume.replace(/[^0-9.]/g, '')) *
            (a.monthlyVolume.includes('K') ? 1000 : 1);
          const numB =
            parseFloat(b.monthlyVolume.replace(/[^0-9.]/g, '')) *
            (b.monthlyVolume.includes('K') ? 1000 : 1);
          return numB - numA;
        }
        if (sortBy === 'difficulty') {
          const diffA =
            a.difficultyScore ??
            (a.difficulty === 'LOW' ? 10 : a.difficulty === 'MEDIUM' ? 50 : 90);
          const diffB =
            b.difficultyScore ??
            (b.difficulty === 'LOW' ? 10 : b.difficulty === 'MEDIUM' ? 50 : 90);
          return diffA - diffB; // Ascending difficulty (quick wins first)
        }
        if (sortBy === 'fresh') {
          return a.age === 'Just now' ? -1 : 1;
        }
        // Default: oppScore
        const oppA =
          parseFloat(a.oppScore.replace(/[^0-9.]/g, '')) *
          (a.oppScore.includes('K') ? 1000 : 1);
        const oppB =
          parseFloat(b.oppScore.replace(/[^0-9.]/g, '')) *
          (b.oppScore.includes('K') ? 1000 : 1);
        return oppB - oppA;
      });
  }, [
    ideas,
    selectedCategory,
    searchQuery,
    quickFilter,
    bookmarkedIds,
    sortBy,
  ]);

  const handleRunAIGeneration = async () => {
    setIsGenerating(true);
    setNotification(null);
    try {
      const res = await fetch('/api/seo/discover-content-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site: targetSite || site,
          guidance: aiGuidance || 'SEAI home retrofit grants BER ratings',
          category: selectedCategory,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.ideas && data.ideas.length > 0) {
          setIdeas((prev) => {
            const existingTitles = new Set(
              prev.map((i) => i.title.toLowerCase()),
            );
            const newFresh = data.ideas.filter(
              (i: ContentIdea) => !existingTitles.has(i.title.toLowerCase()),
            );
            return [...newFresh, ...prev];
          });
          if (data.groundingQueries && data.groundingQueries.length > 0) {
            setGroundingQueries(data.groundingQueries);
            setGroundingSources(data.sources || []);
            setIsGrounded(true);
          }
          setNotification(
            `Discovered ${data.ideas.length} fresh content opportunities for ${targetSite || site} using Google Search AI!`,
          );
          setTimeout(() => setNotification(null), 5000);
        }
      }
    } catch (e) {
      console.error('AI Idea discovery error:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSendToWriter = (idea: ContentIdea) => {
    const promptText = `Title: ${idea.title}\nFocus Topic: ${idea.targetQuery}\nContent Type: ${idea.type}\nTarget Keywords: ${idea.tags.join(', ')}\nSummary Brief: ${idea.summary}`;
    onOpenInWriter(promptText);
  };

  const handleExportCSV = () => {
    const headers = [
      'Title',
      'Type',
      'Target Query',
      'Monthly Volume',
      'Opportunity Score',
      'Difficulty',
      'CPC Range',
      'Trend',
      'Tags',
      'Summary',
    ];
    const rows = filteredIdeas.map((i) => [
      `"${i.title.replace(/"/g, '""')}"`,
      `"${i.type}"`,
      `"${i.targetQuery}"`,
      `"${i.monthlyVolume}"`,
      `"${i.oppScore}"`,
      `"${i.difficulty}"`,
      `"${i.cpcRange || ''}"`,
      `"${i.trend}"`,
      `"${i.tags.join('; ')}"`,
      `"${i.summary.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `content_ideas_${targetSite || 'site'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getDifficultyBadge = (
    diff: 'LOW' | 'MEDIUM' | 'HIGH',
    score?: number,
  ) => {
    if (diff === 'LOW') {
      return (
        <span className="bg-emerald-500/15 text-[#34d399] border border-emerald-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
          <span>LOW</span>
          {score !== undefined && <span>({score})</span>}
        </span>
      );
    }
    if (diff === 'MEDIUM') {
      return (
        <span className="bg-sky-500/15 text-sky-300 border border-sky-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
          <span>MEDIUM</span>
          {score !== undefined && <span>({score})</span>}
        </span>
      );
    }
    return (
      <span className="bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
        <span>HIGH</span>
        {score !== undefined && <span>({score})</span>}
      </span>
    );
  };

  return (
    <div className="space-y-6 text-left" id="discover-content-ideas-tab">
      {/* Top Notification Toast */}
      {notification && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center justify-between shadow-lg animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#34d399] shrink-0" />
            <span>{notification}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="bg-[#34d399]/20 text-[#34d399] border border-[#34d399]/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={11} className="animate-spin text-[#34d399]" />
              <span>Google Search Engine AI</span>
            </span>
            <span className="text-xs font-mono text-slate-400">
              {ideas.length} Content Opportunities Identified
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-display font-bold text-white tracking-tight flex items-center gap-2">
            <span>Discover Content Ideas</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Uncover competitor content gaps, breakout search trends, and topical
            clusters tailored for{' '}
            <strong className="text-slate-200 font-mono">{targetSite}</strong>.
          </p>
        </div>

        {/* Workflow Progress Indicator Bar */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 flex items-center gap-2 self-start md:self-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 text-[#34d399] border border-emerald-500/30 rounded-lg text-xs font-bold font-mono">
            <span>Step 1</span>
            <span className="text-[10px] uppercase font-semibold text-emerald-300">
              Discover
            </span>
          </div>
          <ChevronRight size={14} className="text-slate-500" />
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 text-slate-400 rounded-lg text-xs font-mono">
            <span>Step 2:</span>
            <span className="text-[10px] uppercase">Write</span>
          </div>
          <ChevronRight size={14} className="text-slate-500" />
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 text-slate-400 rounded-lg text-xs font-mono">
            <span>Step 3:</span>
            <span className="text-[10px] uppercase">Publish</span>
          </div>
        </div>
      </div>

      {/* Google Search Engine AI Discovery Bar */}
      <div className="bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-slate-900/95 border border-white/10 hover:border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4 transition">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-[#34d399]" />
            <label className="text-xs font-bold font-mono text-slate-200">
              Target Domain & SEO Niche Focus
            </label>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Real-Time Google Search Grounding Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Target Site / Brand
            </span>
            <div className="relative">
              <Globe
                size={14}
                className="absolute left-3 top-3 text-slate-500"
              />
              <input
                type="text"
                value={targetSite}
                onChange={(e) => setTargetSite(e.target.value)}
                placeholder="e.g. ecosmarthomes.ie"
                className="w-full bg-black/60 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#34d399] font-mono"
              />
            </div>
          </div>

          <div className="md:col-span-5 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Focus Topics & Niche Keywords
            </span>
            <div className="relative">
              <Lightbulb
                size={14}
                className="absolute left-3 top-3 text-slate-500"
              />
              <input
                type="text"
                value={aiGuidance}
                onChange={(e) => setAiGuidance(e.target.value)}
                placeholder='e.g. "home retrofitting, BER ratings, SEAI grants, heat pumps..."'
                className="w-full bg-black/60 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#34d399] font-mono"
              />
            </div>
          </div>

          <div className="md:col-span-3 flex items-end">
            <button
              onClick={handleRunAIGeneration}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-[#34d399] to-emerald-400 hover:from-emerald-400 hover:to-[#34d399] text-[#0f172a] font-bold text-xs px-4 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shrink-0 shadow-lg"
            >
              {isGenerating ? (
                <>
                  <RefreshCw
                    size={14}
                    className="animate-spin text-[#0f172a]"
                  />
                  <span>Scanning Google AI...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} fill="currentColor" />
                  <span>Discover Ideas</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Search Grounding Queries & Sources Banner */}
        {isGrounded && (
          <div className="bg-black/40 border border-emerald-500/20 rounded-xl p-3 space-y-2 text-xs font-mono">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-1.5">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 size={12} />
                <span>Google Search Engine Grounding Metadata</span>
              </span>
              <span className="text-[10px] text-slate-400">
                {groundingQueries.length} Search queries executed
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {groundingQueries.map((q, idx) => (
                <span
                  key={idx}
                  className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1"
                >
                  <Search size={10} />
                  <span>{q}</span>
                </span>
              ))}
            </div>

            {groundingSources.length > 0 && (
              <div className="pt-1 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">
                <span className="text-slate-500 font-semibold">
                  Live Sources:
                </span>
                {groundingSources.slice(0, 3).map((s, idx) => (
                  <a
                    key={idx}
                    href={s.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-emerald-300 underline flex items-center gap-0.5 truncate max-w-[180px]"
                  >
                    <span>{s.title}</span>
                    <ExternalLink size={9} />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Featured Opportunity Banner */}
      {ideas.length > 0 && (
        <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900/90 to-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden space-y-4">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-[#34d399] border border-emerald-500/30 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Flame size={11} className="text-amber-400" />
                <span>Featured High-Impact Gap</span>
              </span>
              <span className="text-xs font-mono text-slate-400">
                Priority Opportunity #1
              </span>
            </div>
            <button
              onClick={(e) => toggleBookmark(ideas[0].id, e)}
              className="p-1.5 bg-black/40 hover:bg-black/60 rounded-lg text-slate-400 hover:text-amber-300 transition cursor-pointer border border-white/10"
              title="Bookmark this opportunity"
            >
              {bookmarkedIds.has(ideas[0].id) ? (
                <BookmarkCheck
                  size={16}
                  className="text-amber-400 fill-amber-400/20"
                />
              ) : (
                <Bookmark size={16} />
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <h3
                className="text-lg sm:text-xl font-display font-bold text-white tracking-tight hover:text-[#34d399] transition cursor-pointer"
                onClick={() => setSelectedModalIdea(ideas[0])}
              >
                {ideas[0].title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {ideas[0].summary}
              </p>

              {/* Metrics row */}
              <div className="flex flex-wrap items-center gap-4 pt-1 font-mono text-xs">
                <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
                  <BarChart3 size={13} className="text-[#34d399]" />
                  <span className="text-slate-400">Volume:</span>
                  <strong className="text-white font-bold">
                    {ideas[0].monthlyVolume}
                  </strong>
                  <span className="text-[10px] text-slate-500">/mo</span>
                </div>

                <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
                  <Target size={13} className="text-sky-400" />
                  <span className="text-slate-400">Opp Score:</span>
                  <strong className="text-sky-300 font-bold">
                    {ideas[0].oppScore}
                  </strong>
                </div>

                <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
                  <span className="text-slate-400">Difficulty:</span>
                  {getDifficultyBadge(
                    ideas[0].difficulty,
                    ideas[0].difficultyScore,
                  )}
                </div>

                {ideas[0].cpcRange && (
                  <div className="flex items-center gap-1 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 text-amber-300">
                    <DollarSign size={13} />
                    <span>{ideas[0].cpcRange}</span>
                  </div>
                )}
              </div>

              {/* Target Query & Demand Status */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                <span className="font-mono text-slate-400">
                  targets{' '}
                  <strong className="text-white bg-white/10 px-2 py-0.5 rounded font-mono">
                    “{ideas[0].targetQuery}”
                  </strong>
                </span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle2 size={12} />
                  <span>{ideas[0].demandStatus}</span>
                </span>
              </div>
            </div>

            {/* Subtopics box */}
            <div className="lg:col-span-4 bg-black/50 border border-white/10 rounded-xl p-4 space-y-2 font-mono text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b border-white/10 pb-1.5">
                Subtopic Keyword Breakdown
              </span>
              <div className="space-y-1.5 divide-y divide-white/5">
                {ideas[0].subtopics.map((sub, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between pt-1 text-[11px]"
                  >
                    <span className="text-slate-300 truncate max-w-[170px]">
                      {sub.name}
                    </span>
                    <span className="text-[#34d399] font-bold">{sub.vol}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => handleSendToWriter(ideas[0])}
                className="w-full mt-3 bg-[#34d399] hover:bg-[#2bc48d] text-[#0f172a] font-bold text-xs py-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow"
              >
                <span>Write This in AI Writer</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs, Search & Sort Control Bar */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-white text-base">
              Discovered Opportunities
            </span>
            <span className="bg-emerald-500/10 text-emerald-300 font-mono text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">
              {filteredIdeas.length} RESULTS
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search
                size={14}
                className="absolute left-3.5 top-2.5 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ideas or keywords..."
                className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#34d399] font-mono"
              />
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-1 bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 font-mono">
              <SlidersHorizontal size={13} className="text-slate-400" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs font-mono"
              >
                <option value="oppScore" className="bg-slate-900 text-white">
                  Sort: Opp Score
                </option>
                <option
                  value="monthlyVolume"
                  className="bg-slate-900 text-white"
                >
                  Sort: Search Volume
                </option>
                <option value="difficulty" className="bg-slate-900 text-white">
                  Sort: Quick Wins (Low Diff)
                </option>
                <option value="fresh" className="bg-slate-900 text-white">
                  Sort: Fresh First
                </option>
              </select>
            </div>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Export ideas to CSV"
            >
              <Download size={13} />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Category Tabs & Quick Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
            {(
              [
                'All',
                'Content Gaps',
                'Topics',
                'Trending',
                'Pillar Pages',
              ] as const
            ).map((cat) => {
              const count = categoryCounts[cat];
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium font-mono whitespace-nowrap transition cursor-pointer flex items-center gap-2 border ${
                    isActive
                      ? 'bg-[#34d399] text-[#0f172a] border-[#34d399] font-bold shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                  }`}
                >
                  <span>{cat}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-black/20 text-[#0f172a]'
                        : 'bg-black/30 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs">
            <button
              onClick={() =>
                setQuickFilter(
                  quickFilter === 'quickWins' ? 'all' : 'quickWins',
                )
              }
              className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                quickFilter === 'quickWins'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-black/30 text-slate-400 border-white/10 hover:text-slate-200'
              }`}
            >
              <Zap size={11} className="text-emerald-400" />
              <span>Low Difficulty</span>
            </button>

            <button
              onClick={() =>
                setQuickFilter(
                  quickFilter === 'risingTrends' ? 'all' : 'risingTrends',
                )
              }
              className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                quickFilter === 'risingTrends'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-black/30 text-slate-400 border-white/10 hover:text-slate-200'
              }`}
            >
              <Flame size={11} className="text-rose-400" />
              <span>Rising Trends</span>
            </button>

            <button
              onClick={() =>
                setQuickFilter(
                  quickFilter === 'bookmarked' ? 'all' : 'bookmarked',
                )
              }
              className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                quickFilter === 'bookmarked'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-black/30 text-slate-400 border-white/10 hover:text-slate-200'
              }`}
            >
              <Bookmark size={11} className="text-amber-400" />
              <span>Saved ({bookmarkedIds.size})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ideas Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredIdeas.map((idea) => {
          const isBookmarked = bookmarkedIds.has(idea.id);
          return (
            <div
              key={idea.id}
              className="bg-slate-900/80 border border-white/10 hover:border-emerald-500/40 rounded-2xl p-5 space-y-4 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-emerald-950/20 group relative"
            >
              <div className="space-y-3">
                {/* Card Header Category + Bookmark */}
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                        idea.type === 'Content Gaps'
                          ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          : idea.type === 'Pillar Pages'
                            ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                            : idea.type === 'Trending'
                              ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {idea.type}
                    </span>
                    {idea.matchScore && (
                      <span className="bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-bold text-[9px]">
                        {idea.matchScore}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500">{idea.age}</span>
                    <button
                      onClick={(e) => toggleBookmark(idea.id, e)}
                      className="p-1 hover:text-amber-300 text-slate-500 transition cursor-pointer"
                    >
                      {isBookmarked ? (
                        <BookmarkCheck
                          size={14}
                          className="text-amber-400 fill-amber-400/20"
                        />
                      ) : (
                        <Bookmark size={14} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3
                  onClick={() => setSelectedModalIdea(idea)}
                  className="font-display font-semibold text-white text-base leading-snug group-hover:text-[#34d399] transition cursor-pointer"
                >
                  {idea.title}
                </h3>

                {/* Summary */}
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {idea.summary}
                </p>

                {/* Tags preview */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {idea.tags.slice(0, 3).map((tag, i) => (
                    <span
                      key={i}
                      className="bg-black/30 border border-white/5 text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded truncate max-w-[150px]"
                    >
                      {tag}
                    </span>
                  ))}
                  {idea.tags.length > 3 && (
                    <span className="text-[10px] font-mono text-slate-500">
                      +{idea.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Metrics Bar */}
              <div className="space-y-3 pt-3 border-t border-white/10 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <div className="flex items-center gap-1">
                    <BarChart3 size={13} className="text-[#34d399]" />
                    <span className="font-bold text-white">
                      {idea.monthlyVolume}
                    </span>
                    <span className="text-[10px] text-slate-500">/mo</span>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400">
                    <span>opp</span>
                    <strong className="text-sky-300">{idea.oppScore}</strong>
                  </div>

                  {getDifficultyBadge(idea.difficulty, idea.difficultyScore)}
                </div>

                {/* CPC & Trend peaks */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
                  <span>{idea.cpcRange || '$0.10–$1.50'}</span>
                  <div className="flex items-center gap-1 text-emerald-400">
                    <span>↗ rising</span>
                    {idea.peakMonth && (
                      <span className="text-slate-500">
                        · peaks {idea.peakMonth}
                      </span>
                    )}
                  </div>
                </div>

                {/* Subtopic Volume breakdown sample */}
                <div className="bg-black/40 border border-white/5 rounded-lg p-2.5 space-y-1">
                  {idea.clusterInfo && (
                    <div className="text-[10px] text-emerald-300 font-bold mb-1 border-b border-white/10 pb-1">
                      {idea.clusterInfo}
                    </div>
                  )}
                  {idea.subtopics.slice(0, 3).map((sub, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-[10px] text-slate-300"
                    >
                      <span className="truncate max-w-[160px]">{sub.name}</span>
                      <span className="text-[#34d399] font-bold">
                        {sub.vol}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Target & Demand Footer */}
                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <span className="text-slate-400">
                    targets{' '}
                    <strong className="text-slate-200">
                      “{idea.targetQuery}”
                    </strong>
                  </span>
                  <span
                    className={`font-bold flex items-center gap-1 ${
                      idea.demandStatus === 'strong demand'
                        ? 'text-emerald-400'
                        : 'text-amber-300'
                    }`}
                  >
                    {idea.demandStatus === 'strong demand'
                      ? '✅ strong demand'
                      : '◑ niche'}
                  </span>
                </div>

                {/* Card Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setSelectedModalIdea(idea)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 text-xs py-2 rounded-xl transition cursor-pointer font-bold border border-white/10 text-center"
                  >
                    Explore Cluster
                  </button>
                  <button
                    onClick={() => handleSendToWriter(idea)}
                    className="flex-1 bg-[#34d399] hover:bg-[#2bc48d] text-[#0f172a] text-xs py-2 rounded-xl transition cursor-pointer font-bold flex items-center justify-center gap-1 shadow"
                  >
                    <span>Write with AI</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep Detail & Cluster Map Modal */}
      <AnimatePresence>
        {selectedModalIdea && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-white/15 rounded-2xl max-w-2xl w-full p-6 space-y-5 relative shadow-2xl overflow-y-auto max-h-[90vh] text-left"
            >
              <button
                onClick={() => setSelectedModalIdea(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded font-mono font-bold uppercase text-[10px] bg-emerald-500/20 text-[#34d399] border border-emerald-500/30">
                    {selectedModalIdea.type} Brief
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Targeting {targetSite}
                  </span>
                </div>
                <h3 className="text-xl font-display font-bold text-white">
                  {selectedModalIdea.title}
                </h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-black/40 p-3.5 rounded-xl border border-white/5">
                {selectedModalIdea.summary}
              </p>

              {/* Cluster Map Visual Diagram */}
              <div className="bg-black/60 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs font-mono font-bold text-emerald-300 flex items-center gap-1.5">
                    <Layers size={14} />
                    <span>Topic Cluster Architect Map</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Pillar & Spoke Internal Linking
                  </span>
                </div>

                {/* Diagram graphic */}
                <div className="relative p-4 bg-slate-950/80 rounded-xl border border-white/5 flex flex-col items-center justify-center space-y-4">
                  {/* Pillar Center Hub */}
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-mono text-xs font-bold px-4 py-2 rounded-xl shadow-lg border border-emerald-300/40 text-center max-w-sm">
                    <div className="text-[9px] uppercase tracking-wider text-emerald-200">
                      Main Hub Page
                    </div>
                    <div>
                      {selectedModalIdea.targetQuery} (
                      {selectedModalIdea.monthlyVolume}/mo)
                    </div>
                  </div>

                  {/* Connecting spokes */}
                  <div className="w-0.5 h-4 bg-emerald-500/40" />

                  {/* Subtopic spokes */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full font-mono text-[11px]">
                    {selectedModalIdea.subtopics.map((sub, i) => (
                      <div
                        key={i}
                        className="bg-slate-900 border border-emerald-500/20 hover:border-emerald-500/50 p-2.5 rounded-xl text-center space-y-1"
                      >
                        <span className="text-slate-300 font-semibold block truncate">
                          {sub.name}
                        </span>
                        <span className="text-[#34d399] font-bold text-[10px] block">
                          {sub.vol} /mo
                        </span>
                        <span className="text-[9px] text-slate-500 block border-t border-white/5 pt-1">
                          Anchor: link to hub
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="bg-black/50 p-3 rounded-xl border border-white/5 space-y-0.5">
                  <span className="text-[10px] text-slate-400">
                    Monthly Vol
                  </span>
                  <p className="text-base font-bold text-white">
                    {selectedModalIdea.monthlyVolume}
                  </p>
                </div>
                <div className="bg-black/50 p-3 rounded-xl border border-white/5 space-y-0.5">
                  <span className="text-[10px] text-slate-400">
                    Opportunity
                  </span>
                  <p className="text-base font-bold text-sky-300">
                    {selectedModalIdea.oppScore}
                  </p>
                </div>
                <div className="bg-black/50 p-3 rounded-xl border border-white/5 space-y-0.5">
                  <span className="text-[10px] text-slate-400">CPC Est.</span>
                  <p className="text-xs font-bold text-amber-300 mt-1">
                    {selectedModalIdea.cpcRange || 'N/A'}
                  </p>
                </div>
                <div className="bg-black/50 p-3 rounded-xl border border-white/5 space-y-0.5">
                  <span className="text-[10px] text-slate-400">Difficulty</span>
                  <div className="mt-1">
                    {getDifficultyBadge(
                      selectedModalIdea.difficulty,
                      selectedModalIdea.difficultyScore,
                    )}
                  </div>
                </div>
              </div>

              {/* Keywords Tag List */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                  Target Long-Tail Keywords:
                </h4>
                <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                  {selectedModalIdea.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-slate-200"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  onClick={() => setSelectedModalIdea(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleSendToWriter(selectedModalIdea);
                    setSelectedModalIdea(null);
                  }}
                  className="bg-[#34d399] hover:bg-[#2bc48d] text-[#0f172a] px-5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow"
                >
                  <span>Open in AI Writer</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
