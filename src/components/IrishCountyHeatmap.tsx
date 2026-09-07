/**
 * src/components/IrishCountyHeatmap.tsx
 *
 * Multi-County Irish Regional SERP Heatmap
 * Displays live search volume, SERP position, and grant demand across all 26 Irish counties & Eircode zones.
 */

import { useState, useMemo } from 'react';
import {
  MapPin,
  Search,
  Globe,
  ChevronRight,
  Sparkles,
  Building,
} from 'lucide-react';
import {
  IRISH_COUNTIES_DATA,
  IrishCountyInfo,
  getCountiesByProvince,
  searchCountiesByEircodeOrName,
} from '../data/irishCountiesData';

export interface CountyHeatmapData {
  county: string;
  eircode: string;
  monthlySearches: number;
  avgRank: number;
  grantDemand: 'High' | 'Very High' | 'Moderate';
  topKeyword: string;
  color: string;
}

export default function IrishCountyHeatmap() {
  const [selectedSlug, setSelectedSlug] = useState<string>('limerick');
  const [provinceFilter, setProvinceFilter] = useState<
    'All' | 'Munster' | 'Leinster' | 'Connacht' | 'Ulster'
  >('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCounties = useMemo(() => {
    let list = IRISH_COUNTIES_DATA;
    if (provinceFilter !== 'All') {
      list = getCountiesByProvince(provinceFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.county.toLowerCase().includes(q) ||
          c.irishName.toLowerCase().includes(q) ||
          c.eircode.toLowerCase().includes(q) ||
          (c.secondaryEircodes &&
            c.secondaryEircodes.some((sec) => sec.toLowerCase().includes(q))) ||
          c.majorTowns.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [provinceFilter, searchQuery]);

  const selectedCounty = useMemo(() => {
    return (
      IRISH_COUNTIES_DATA.find((c) => c.slug === selectedSlug) ||
      filteredCounties[0] ||
      IRISH_COUNTIES_DATA[0]
    );
  }, [selectedSlug, filteredCounties]);

  const getColorForRank = (rank: number) => {
    if (rank <= 2.2) return '#34d399'; // Emerald
    if (rank <= 3.0) return '#60a5fa'; // Blue
    return '#fbbf24'; // Amber
  };

  return (
    <div
      className="glass-card p-6 flex flex-col gap-5 text-left border border-white/10 rounded-2xl bg-slate-900/60"
      id="irish-county-heatmap"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <MapPin size={20} />
          </div>
          <div>
            <span className="text-xs uppercase font-mono text-slate-400 font-bold">
              National SERP Coverage
            </span>
            <h3 className="text-base font-bold text-white">
              Multi-County Irish SERP Heatmap
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30 flex items-center gap-1.5">
            <Globe size={12} />
            <span>🇮🇪 All 26 Counties Supported</span>
          </span>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-black/40 p-2 rounded-xl border border-white/5">
        {/* Province Tabs */}
        <div className="flex flex-wrap items-center gap-1">
          {(['All', 'Munster', 'Leinster', 'Connacht', 'Ulster'] as const).map(
            (prov) => (
              <button
                key={prov}
                onClick={() => setProvinceFilter(prov)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  provinceFilter === prov
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {prov} {prov === 'All' ? '(26)' : ''}
              </button>
            ),
          )}
        </div>

        {/* Search by Eircode / Town */}
        <div className="relative min-w-[200px]">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Eircode, town, or county..."
            className="w-full bg-slate-900/90 border border-white/10 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder:text-slate-500 outline-none focus:border-emerald-400 font-mono"
          />
        </div>
      </div>

      {/* County Selector Pills (Grid of all 26 or filtered) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 max-h-56 overflow-y-auto pr-1">
        {filteredCounties.map((c) => {
          const isSelected = selectedCounty.slug === c.slug;
          const rankColor = getColorForRank(c.avgRank);
          return (
            <button
              key={c.slug}
              onClick={() => setSelectedSlug(c.slug)}
              className={`px-3 py-2 rounded-xl text-left border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-500/20 border-emerald-500/60 text-white shadow-lg ring-1 ring-emerald-500/30'
                  : 'bg-slate-800/40 border-white/5 text-slate-300 hover:bg-slate-800/80 hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold truncate">{c.county}</span>
                <span className="font-mono text-[10px] text-slate-400 ml-1">
                  {c.eircode}
                </span>
              </div>
              <div
                className="text-[11px] font-semibold mt-1 flex items-center justify-between"
                style={{ color: rankColor }}
              >
                <span>Rank #{c.avgRank}</span>
                <span className="text-[9px] font-mono text-slate-400">
                  {c.monthlySearches.toLocaleString()}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected County Deep Detail Card */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-500/25 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1.5 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-bold text-white">
              {selectedCounty.county} ({selectedCounty.eircode}) Regional
              Snapshot
            </h4>
            <span className="text-xs text-slate-400 italic">
              Contae {selectedCounty.irishName}
            </span>
            <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded-md font-mono">
              Province: {selectedCounty.province}
            </span>
            <span
              className={`px-2 py-0.5 text-[10px] font-bold rounded-md font-mono ${
                selectedCounty.grantDemand === 'Very High'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : selectedCounty.grantDemand === 'High'
                    ? 'bg-sky-500/20 text-sky-300'
                    : 'bg-amber-500/20 text-amber-300'
              }`}
            >
              Demand: {selectedCounty.grantDemand}
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Top Searched Query:{' '}
            <strong className="text-emerald-300 font-mono">
              &quot;{selectedCounty.topKeywords[0]}&quot;
            </strong>
            <span className="text-slate-500 mx-1.5">•</span>
            Key Hubs:{' '}
            <span className="text-slate-300 font-medium">
              {selectedCounty.majorTowns.slice(0, 4).join(', ')}
            </span>
          </p>

          <p className="text-[11px] text-slate-400 line-clamp-1">
            <Building size={11} className="inline mr-1 text-slate-500" />
            <span className="text-slate-300 font-mono text-[10px]">
              Housing:
            </span>{' '}
            {selectedCounty.housingStock}
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <span className="text-[10px] uppercase text-slate-400 font-bold block font-mono">
              Grant Allocation
            </span>
            <span className="text-base font-bold font-mono text-emerald-400">
              {selectedCounty.seaiGrantAllocation}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase text-slate-400 font-bold block font-mono">
              Monthly Searches
            </span>
            <span className="text-base font-bold font-mono text-white">
              {selectedCounty.monthlySearches.toLocaleString()}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase text-slate-400 font-bold block font-mono">
              SERP Rank
            </span>
            <span className="text-base font-bold font-mono text-emerald-400">
              #{selectedCounty.avgRank}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
