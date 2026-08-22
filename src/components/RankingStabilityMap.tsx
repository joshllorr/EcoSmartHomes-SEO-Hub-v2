// RankingStabilityMap.tsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Plus,
  Search,
  ExternalLink,
  ShieldCheck,
  Flame,
  Zap,
  Target,
  RefreshCw,
  Award,
  SlidersHorizontal,
} from 'lucide-react';
import './RankingStabilityMap.css';
import {
  StabilityZone,
  KeywordPriority,
  calculateSlope,
  calculateVolatility,
  classifyStabilityZone,
  getStabilityZoneMessage,
  calculateKeywordHealthScore,
  evaluateKeywordPriority,
  KeywordEntry,
  globalKeywordRegistry,
} from '../logic/keywordIntelligence';

export {
  classifyStabilityZone as getColor,
};

export function getMessage(
  zoneOrSlope: StabilityZone | number,
  volatility?: number,
): string {
  if (typeof zoneOrSlope === 'number' && volatility !== undefined) {
    const zone = classifyStabilityZone(zoneOrSlope, volatility);
    return getStabilityZoneMessage(zone);
  }
  return getStabilityZoneMessage(zoneOrSlope as StabilityZone);
}

export interface StabilityItem {
  id?: string;
  keyword: string;
  rank: number;
  slope: number;
  volatility: number;
  category?: string;
  healthScore?: number;
  priority?: KeywordPriority;
  actionTrigger?: string;
  recommendedAction?: string;
  searchVolume?: number;
}

export interface RankingStabilityMapProps {
  onNavigateToSERP?: (keyword: string) => void;
  trackedKeywords?: StabilityItem[];
}

export const RankingStabilityMap: React.FC<RankingStabilityMapProps> = ({
  onNavigateToSERP,
  trackedKeywords,
}) => {
  const [items, setItems] = useState<StabilityItem[]>(() => {
    if (trackedKeywords && trackedKeywords.length > 0) {
      return trackedKeywords;
    }
    // Pull default initialized items from Keyword Intelligence Registry
    return globalKeywordRegistry.getAll().map((k) => ({
      id: k.id,
      keyword: k.keyword,
      rank: k.currentRank,
      slope: k.slope,
      volatility: k.volatility,
      category: k.category,
      healthScore: k.healthScore,
      priority: k.priority,
      actionTrigger: k.actionTrigger,
      recommendedAction: k.recommendedAction,
      searchVolume: k.searchVolume,
    }));
  });

  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'green' | 'yellow' | 'red'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [recordingRankKeyword, setRecordingRankKeyword] = useState<string | null>(null);
  const [selectedDrawerKeyword, setSelectedDrawerKeyword] = useState<string | null>(null);
  const [newCheckpointRank, setNewCheckpointRank] = useState<number>(1);
  const [loadingSync, setLoadingSync] = useState(false);

  // New item form state
  const [newKeyword, setNewKeyword] = useState('');
  const [newCategory, setNewCategory] = useState('Heat Pumps');
  const [newRank, setNewRank] = useState(5);
  const [newSlope, setNewSlope] = useState(-0.2);
  const [newVolatility, setNewVolatility] = useState(0.25);
  const [newSearchVolume, setNewSearchVolume] = useState(3600);

  // Sync with backend API on mount
  useEffect(() => {
    const fetchStabilityData = async () => {
      try {
        setLoadingSync(true);
        const res = await fetch('/api/keywords/stability-map');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.stabilityMap) {
            const allKeywords: KeywordEntry[] = [
              ...data.stabilityMap.zones.green.items,
              ...data.stabilityMap.zones.yellow.items,
              ...data.stabilityMap.zones.red.items,
            ];
            if (allKeywords.length > 0) {
              setItems(
                allKeywords.map((k) => ({
                  id: k.id,
                  keyword: k.keyword,
                  rank: k.currentRank,
                  slope: k.slope,
                  volatility: k.volatility,
                  category: k.category,
                  healthScore: k.healthScore,
                  priority: k.priority,
                  actionTrigger: k.actionTrigger,
                  recommendedAction: k.recommendedAction,
                  searchVolume: k.searchVolume,
                })),
              );
            }
          }
        }
      } catch (err) {
        // Safe offline local fallback
      } finally {
        setLoadingSync(false);
      }
    };

    fetchStabilityData();
  }, []);

  const handleAuditClick = (keyword: string) => {
    setNotice(`Launching SERP Analyzer intelligence for "${keyword}"...`);
    if (onNavigateToSERP) {
      setTimeout(() => {
        onNavigateToSERP(keyword);
      }, 300);
    } else {
      setTimeout(() => setNotice(null), 4000);
    }
  };

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;

    const cleanKw = newKeyword.trim().toLowerCase();
    const computedZone = classifyStabilityZone(newSlope, newVolatility);
    const computedHealth = calculateKeywordHealthScore(newRank, newSlope, newVolatility);
    const { priority, trigger, recommendation } = evaluateKeywordPriority(
      newRank,
      newSlope,
      newVolatility,
      newSearchVolume,
      computedZone,
    );

    const newItem: StabilityItem = {
      id: cleanKw.replace(/[^a-z0-9]+/g, '-'),
      keyword: cleanKw,
      category: newCategory,
      rank: Number(newRank),
      slope: Number(newSlope),
      volatility: Number(newVolatility),
      searchVolume: Number(newSearchVolume),
      healthScore: computedHealth,
      priority,
      actionTrigger: trigger,
      recommendedAction: recommendation,
    };

    // Update local registry
    globalKeywordRegistry.register({
      keyword: cleanKw,
      category: newCategory,
      currentRank: Number(newRank),
      slope: Number(newSlope),
      volatility: Number(newVolatility),
      searchVolume: Number(newSearchVolume),
    });

    setItems((prev) => [newItem, ...prev.filter((i) => i.keyword !== cleanKw)]);
    setNewKeyword('');
    setShowAddModal(false);
    setNotice(`Registered "${newItem.keyword}" in Keyword Intelligence Core (${computedZone.toUpperCase()} Zone, Health: ${computedHealth}/100).`);
    setTimeout(() => setNotice(null), 4000);

    // Sync to backend
    try {
      await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: cleanKw,
          category: newCategory,
          currentRank: newRank,
          searchVolume: newSearchVolume,
        }),
      });
    } catch {
      // safe offline fallback
    }
  };

  const handleRecordCheckpoint = async (keyword: string, rank: number) => {
    const updated = globalKeywordRegistry.recordRank(keyword, rank);
    if (updated) {
      setItems((prev) =>
        prev.map((item) =>
          item.keyword.toLowerCase() === keyword.toLowerCase()
            ? {
                ...item,
                rank: updated.currentRank,
                slope: updated.slope,
                volatility: updated.volatility,
                healthScore: updated.healthScore,
                priority: updated.priority,
                actionTrigger: updated.actionTrigger,
                recommendedAction: updated.recommendedAction,
              }
            : item,
        ),
      );
      setNotice(`Recorded rank #${rank} for "${keyword}". Recalculated slope: ${updated.slope}, zone: ${updated.zone.toUpperCase()}.`);
      setTimeout(() => setNotice(null), 4000);
      setRecordingRankKeyword(null);

      // Backend sync
      try {
        await fetch(`/api/keywords/${updated.id}/rank-history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rank }),
        });
      } catch {
        // safe offline fallback
      }
    }
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const color = classifyStabilityZone(item.slope, item.volatility);
      const matchesFilter =
        selectedFilter === 'all' || color === selectedFilter;
      const matchesSearch =
        !searchQuery ||
        item.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category &&
          item.category.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFilter && matchesSearch;
    });
  }, [items, selectedFilter, searchQuery]);

  const zoneCounts = useMemo(() => {
    return {
      all: items.length,
      green: items.filter(
        (i) => classifyStabilityZone(i.slope, i.volatility) === 'green',
      ).length,
      yellow: items.filter(
        (i) => classifyStabilityZone(i.slope, i.volatility) === 'yellow',
      ).length,
      red: items.filter(
        (i) => classifyStabilityZone(i.slope, i.volatility) === 'red',
      ).length,
    };
  }, [items]);

  const avgHealth = useMemo(() => {
    if (items.length === 0) return 0;
    const sum = items.reduce(
      (acc, item) =>
        acc +
        (item.healthScore ??
          calculateKeywordHealthScore(item.rank, item.slope, item.volatility)),
      0,
    );
    return Math.round(sum / items.length);
  }, [items]);

  return (
    <div className="ranking-stability-map" id="ranking-stability-map">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2>Ranking Stability Map</h2>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider">
              Phase 1–7 Core
            </span>
          </div>
          <p className="subtitle">
            Slope + volatility → green/yellow/red stability zones for each keyword.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-mono text-slate-300">
            <Award size={13} className="text-emerald-400" />
            <span>Avg Health: <strong>{avgHealth}/100</strong></span>
          </div>
          <button
            onClick={() => setShowAddModal(!showAddModal)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer shadow-sm"
          >
            <Plus size={13} />
            <span>Track Keyword</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="mb-4 p-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono rounded-lg flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5">
            <Flame size={14} className="text-emerald-400 shrink-0" /> {notice}
          </span>
          <button
            onClick={() => setNotice(null)}
            className="text-emerald-400 hover:text-white text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Add Keyword Form Drawer */}
      {showAddModal && (
        <form
          onSubmit={handleAddKeyword}
          className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 animate-in fade-in duration-200"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              Register Keyword in Intelligence Registry (Phase 1–7)
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">
              Zone = f(Slope, Volatility)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Target Keyword
              </label>
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="e.g. solar pv grants ireland"
                className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white outline-hidden focus:border-emerald-400"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white outline-hidden focus:border-emerald-400"
              >
                <option value="Solar PV">Solar PV</option>
                <option value="Heat Pumps">Heat Pumps</option>
                <option value="Grants">Grants</option>
                <option value="Insulation">Insulation</option>
                <option value="BER">BER</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Rank Position (#{newRank})
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={newRank}
                onChange={(e) => setNewRank(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white outline-hidden focus:border-emerald-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Slope ({newSlope > 0 ? `+${newSlope}` : newSlope})
              </label>
              <input
                type="number"
                step="0.1"
                min="-2"
                max="2"
                value={newSlope}
                onChange={(e) => setNewSlope(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white outline-hidden focus:border-emerald-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Volatility ({(newVolatility * 100).toFixed(0)}%)
              </label>
              <input
                type="range"
                min="0.05"
                max="0.95"
                step="0.05"
                value={newVolatility}
                onChange={(e) => setNewVolatility(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer mt-1"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                Est. Monthly Volume
              </label>
              <input
                type="number"
                min="100"
                step="100"
                value={newSearchVolume}
                onChange={(e) => setNewSearchVolume(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white outline-hidden focus:border-emerald-400 font-mono"
              />
            </div>

            <div className="sm:col-span-4 flex items-center justify-between pt-2 border-t border-white/10">
              <div className="text-[11px] text-slate-300 flex items-center gap-2">
                <span>Predicted:</span>
                <span
                  className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] uppercase ${
                    classifyStabilityZone(newSlope, newVolatility) === 'green'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : classifyStabilityZone(newSlope, newVolatility) === 'red'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {classifyStabilityZone(newSlope, newVolatility)} Zone
                </span>
                <span className="text-slate-400 font-mono">
                  Health: {calculateKeywordHealthScore(newRank, newSlope, newVolatility)}/100
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition cursor-pointer"
                >
                  Register Keyword
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Record Rank Modal */}
      {recordingRankKeyword && (
        <div className="mb-4 p-4 rounded-xl bg-sky-950/40 border border-sky-500/30 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-sky-300 font-mono flex items-center gap-2">
              <Activity size={14} />
              <span>Record Rank Observation (Phase 2 Collector) — “{recordingRankKeyword}”</span>
            </h4>
            <button
              onClick={() => setRecordingRankKeyword(null)}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-[10px] text-slate-300 font-mono mb-1">
                Enter New Verified SERP Rank (#1 - #100):
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={newCheckpointRank}
                onChange={(e) => setNewCheckpointRank(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-sm text-white font-mono"
              />
            </div>
            <button
              onClick={() => handleRecordCheckpoint(recordingRankKeyword, newCheckpointRank)}
              className="mt-4 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs font-mono transition cursor-pointer shrink-0"
            >
              Update History & Recalculate Models
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({zoneCounts.all})
          </button>
          <button
            onClick={() => setSelectedFilter('green')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer ${
              selectedFilter === 'green'
                ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                : 'bg-emerald-950/20 text-emerald-400/80 hover:text-emerald-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Green ({zoneCounts.green})</span>
          </button>
          <button
            onClick={() => setSelectedFilter('yellow')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer ${
              selectedFilter === 'yellow'
                ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                : 'bg-amber-950/20 text-amber-400/80 hover:text-amber-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Yellow ({zoneCounts.yellow})</span>
          </button>
          <button
            onClick={() => setSelectedFilter('red')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer ${
              selectedFilter === 'red'
                ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
                : 'bg-rose-950/20 text-rose-400/80 hover:text-rose-300'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <span>Red ({zoneCounts.red})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-56">
          <Search
            size={13}
            className="absolute left-2.5 top-2.5 text-slate-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords or topics..."
            className="w-full pl-7 pr-2.5 py-1.5 bg-black/30 border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 outline-hidden focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Grid of Stability Cards */}
      <div className="stability-grid">
        {filteredItems.map((item) => {
          const color = classifyStabilityZone(item.slope, item.volatility);
          const message = getStabilityZoneMessage(color);
          const isImproving = item.slope < 0;
          const isDegrading = item.slope > 0;
          const slopeArrow = isImproving ? '↑' : isDegrading ? '↓' : '→';
          const health =
            item.healthScore ??
            calculateKeywordHealthScore(item.rank, item.slope, item.volatility);
          const priority =
            item.priority ||
            evaluateKeywordPriority(
              item.rank,
              item.slope,
              item.volatility,
              item.searchVolume || 2000,
              color,
            ).priority;

          return (
            <div
              key={item.keyword}
              className={`stability-card ${color}`}
              data-zone={color}
            >
              <div className="card-header">
                <div className="flex flex-col">
                  <span className="keyword font-bold">{item.keyword}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    {item.category && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.category}
                      </span>
                    )}
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                        priority === 'critical'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : priority === 'high'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {priority}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="rank">#{item.rank}</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Health: <strong className="text-white">{health}</strong>
                  </span>
                </div>
              </div>

              <div className="metrics-row">
                <div className="metric">
                  <span className="label">Slope (Velocity)</span>
                  <span
                    className={`value flex items-center gap-1 font-mono font-bold ${
                      isImproving
                        ? 'text-emerald-400'
                        : isDegrading
                          ? 'text-rose-400'
                          : 'text-slate-300'
                    }`}
                  >
                    {item.slope > 0 ? `+${item.slope.toFixed(2)}` : item.slope.toFixed(2)}{' '}
                    <span>{slopeArrow}</span>
                  </span>
                </div>
                <div className="metric">
                  <span className="label">Volatility Factor</span>
                  <span className="value font-mono font-bold">
                    {(item.volatility * 100).toFixed(0)}%
                  </span>
                  <div className="vol-bar">
                    <div
                      className="vol-fill"
                      style={{ width: `${Math.min(item.volatility * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="status-row">
                <span className="status-pill">{color.toUpperCase()} ZONE</span>
                <span className="status-text">{message}</span>
              </div>

              <div className="actions-row">
                {color === 'red' ? (
                  <button
                    onClick={() => handleAuditClick(item.keyword)}
                    className="btn audit flex items-center justify-center gap-1.5 w-full cursor-pointer"
                  >
                    <AlertTriangle size={12} />
                    <span>Audit Now (SERP Analyzer)</span>
                  </button>
                ) : (
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => {
                        setRecordingRankKeyword(item.keyword);
                        setNewCheckpointRank(item.rank);
                      }}
                      className="px-2 py-1 rounded text-[10px] bg-white/10 hover:bg-white/15 text-slate-200 transition cursor-pointer flex items-center justify-center gap-1 flex-1 font-mono"
                      title="Record Rank Checkpoint"
                    >
                      <Activity size={10} className="text-sky-400" />
                      <span>Log Rank</span>
                    </button>
                    <button
                      onClick={() => handleAuditClick(item.keyword)}
                      className="px-2 py-1 rounded text-[10px] bg-white/10 hover:bg-white/15 text-slate-300 transition cursor-pointer flex items-center gap-1"
                      title="Inspect in SERP Analyzer"
                    >
                      <ExternalLink size={10} />
                      <span>SERP</span>
                    </button>
                    <button
                      onClick={() => setSelectedDrawerKeyword(item.keyword)}
                      className="px-2 py-1 rounded text-[10px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition cursor-pointer flex items-center gap-1 font-mono"
                      title="Open Keyword Inspection Drawer"
                    >
                      <SlidersHorizontal size={10} />
                      <span>Drawer</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* PHASE 39 — KEYWORD DRAWER MODAL */}
      {selectedDrawerKeyword && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-white/15 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-emerald-400" />
                <h3 className="text-base font-bold text-white font-mono">
                  Keyword Intelligence Drawer (Phase 39)
                </h3>
              </div>
              <button
                onClick={() => setSelectedDrawerKeyword(null)}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Target Keyword:</span>
              <h4 className="text-lg font-bold text-emerald-400 font-mono">“{selectedDrawerKeyword}”</h4>
            </div>

            {/* Quick 30d / 60d / 90d Trajectory Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase">30-Day Rank</span>
                <div className="text-base font-bold text-sky-400 font-mono mt-1">
                  #{Math.max(1, (items.find((i) => i.keyword === selectedDrawerKeyword)?.rank || 5) - 1)}
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">+18% Traffic</span>
              </div>
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase">60-Day Rank</span>
                <div className="text-base font-bold text-emerald-400 font-mono mt-1">
                  #{Math.max(1, (items.find((i) => i.keyword === selectedDrawerKeyword)?.rank || 5) - 2)}
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">+35% Traffic</span>
              </div>
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase">90-Day Rank</span>
                <div className="text-base font-bold text-purple-400 font-mono mt-1">
                  #{Math.max(1, (items.find((i) => i.keyword === selectedDrawerKeyword)?.rank || 5) - 3)}
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">+52% Traffic</span>
              </div>
            </div>

            {/* Action Trigger Buttons */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <span className="text-[10px] uppercase font-mono font-bold text-slate-400">
                1-Click Autonomous Action Triggers:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={async () => {
                    const kw = selectedDrawerKeyword;
                    try {
                      await fetch('/api/automation/refresh-queue', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ keyword: kw, currentRank: 4, slope: 0.6, volatility: 0.55 }),
                      });
                      setNotice(`Enqueued "${kw}" into Autonomous Content Refresh Queue.`);
                      setSelectedDrawerKeyword(null);
                      setTimeout(() => setNotice(null), 4000);
                    } catch {
                      // ignore network errors in drawer preview
                    }
                  }}
                  className="py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg font-mono flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Zap size={13} />
                  <span>Queue Content Refresh</span>
                </button>

                <button
                  onClick={() => {
                    handleAuditClick(selectedDrawerKeyword);
                    setSelectedDrawerKeyword(null);
                  }}
                  className="py-2 px-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-lg font-mono flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <ExternalLink size={13} />
                  <span>Open SERP Analyzer</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RankingStabilityMap;
