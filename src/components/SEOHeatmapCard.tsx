import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Bar,
  ComposedChart,
  Line,
  ReferenceLine,
} from 'recharts';
import {
  Flame,
  Sparkles,
  TrendingUp,
  HelpCircle,
  Calendar,
  Info,
  Award,
} from 'lucide-react';
import { HeatmapDay } from '../types';

interface SEOHeatmapCardProps {
  data?: HeatmapDay[];
}

export default function SEOHeatmapCard({ data }: SEOHeatmapCardProps) {
  // Fallback default 7-day data if state does not have it yet
  const defaultHeatmap: HeatmapDay[] = [
    {
      day: 'Mon',
      visibility: 42,
      discovery_sessions: 1,
      ctr: 1.8,
      rankings: 12,
    },
    {
      day: 'Tue',
      visibility: 45,
      discovery_sessions: 2,
      ctr: 2.1,
      rankings: 14,
    },
    {
      day: 'Wed',
      visibility: 68,
      discovery_sessions: 4,
      ctr: 3.5,
      rankings: 25,
    },
    {
      day: 'Thu',
      visibility: 52,
      discovery_sessions: 1,
      ctr: 2.4,
      rankings: 18,
    },
    {
      day: 'Fri',
      visibility: 75,
      discovery_sessions: 3,
      ctr: 3.8,
      rankings: 29,
    },
    {
      day: 'Sat',
      visibility: 48,
      discovery_sessions: 0,
      ctr: 2.0,
      rankings: 16,
    },
    {
      day: 'Sun',
      visibility: 40,
      discovery_sessions: 1,
      ctr: 1.6,
      rankings: 11,
    },
  ];

  const heatmapData = data && data.length > 0 ? data : defaultHeatmap;

  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(4); // Default to "Fri"
  const [activeMetric, setActiveMetric] = useState<
    'visibility' | 'ctr' | 'rankings'
  >('visibility');

  const selectedDay = heatmapData[selectedDayIndex];

  // Helper to determine heat intensity styles for the 7-day blocks
  const getHeatIntensityStyle = (score: number) => {
    if (score >= 70) {
      return 'bg-[#34d399] border-[#34d399]/40 text-slate-950 shadow-[0_0_15px_rgba(52,211,153,0.35)]';
    }
    if (score >= 50) {
      return 'bg-[#34d399]/50 border-[#34d399]/30 text-emerald-100 shadow-[0_0_10px_rgba(52,211,153,0.15)]';
    }
    if (score >= 42) {
      return 'bg-[#34d399]/20 border-white/10 text-slate-200';
    }
    return 'bg-white/5 border-white/5 text-slate-400';
  };

  // Human friendly suggestions based on selected day performance
  const getAISuggestionForDay = (day: string) => {
    switch (day) {
      case 'Mon':
        return 'Early week search query volume is low. Great time to queue drafts & prepare SEAI grant checklists in the editor.';
      case 'Tue':
        return 'Visibility is crawling up. Schedule your newly generated blog drafts to go live by Tuesday midnight for maximum crawler indexation.';
      case 'Wed':
        return '🔥 High-Performing Midweek Discovery Day! Users are actively researching winter insulation standards. Push a new support page now.';
      case 'Thu':
        return 'Stable organic CTR. Focus on scanning sitemaps and fixing server crawl warnings in the Site Health panel.';
      case 'Fri':
        return '🌟 Peak Visibility Hotspot! Dublin search traffic surges around retrofitting grants. Ensure social links point back to your main pillar.';
      case 'Sat':
        return 'Weekend lull active. Excellent window to run deep keyword researches to top up your weekly challenges (+30 XP).';
      case 'Sun':
        return 'Search volumes are light. Take this day to plan your focus topics or audit local backlinks for the BER Rating Ireland pillar.';
      default:
        return 'Scan high-performing days to focus your active writer and scout sessions.';
    }
  };

  // Highlight high performing discovery days (Wednesday and Friday)
  const isHighPerformer = (day: string) => day === 'Wed' || day === 'Fri';

  // Recharts Custom Tooltip Styling
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-white/15 p-3 rounded-xl shadow-xl text-left font-sans text-xs">
          <p className="font-bold text-white mb-1.5 flex items-center gap-1.5">
            <Calendar size={12} className="text-[#34d399]" />
            <span>Day: {payload[0].payload.day}</span>
          </p>
          <div className="space-y-1 text-slate-300">
            <p className="flex justify-between gap-4">
              <span>Visibility Index:</span>
              <span className="font-mono text-[#34d399] font-bold">
                {payload[0].payload.visibility}%
              </span>
            </p>
            <p className="flex justify-between gap-4">
              <span>Click-Through Rate:</span>
              <span className="font-mono text-sky-400 font-bold">
                {payload[0].payload.ctr}%
              </span>
            </p>
            <p className="flex justify-between gap-4">
              <span>Top 10 Keywords:</span>
              <span className="font-mono text-purple-400 font-bold">
                {payload[0].payload.rankings}
              </span>
            </p>
            <p className="flex justify-between gap-4 border-t border-white/5 pt-1 mt-1 text-[10px]">
              <span>Scans Run:</span>
              <span className="font-mono text-amber-400 font-bold">
                {payload[0].payload.discovery_sessions}
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      className="glass-card p-6 flex flex-col gap-6 text-left"
      id="seo-heatmap-card"
    >
      {/* Header with quick stats */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-[#34d399] bg-[#34d399]/10 px-2.5 py-1 rounded-full border border-[#34d399]/20 flex items-center gap-1.5 w-fit">
            <Flame size={11} className="animate-pulse" />
            Live Search Visibility
          </span>
          <h3 className="text-sm font-semibold text-white mt-1.5">
            7-Day SEO Performance Heatmap
          </h3>
        </div>

        {/* Metric Selector Toggles */}
        <div className="flex bg-black/30 border border-white/10 rounded-lg p-1 text-[11px] font-semibold">
          <button
            onClick={() => setActiveMetric('visibility')}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
              activeMetric === 'visibility'
                ? 'bg-[#34d399] text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Visibility Index
          </button>
          <button
            onClick={() => setActiveMetric('ctr')}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
              activeMetric === 'ctr'
                ? 'bg-[#34d399] text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            CTR %
          </button>
          <button
            onClick={() => setActiveMetric('rankings')}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
              activeMetric === 'rankings'
                ? 'bg-[#34d399] text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Rankings
          </button>
        </div>
      </div>

      {/* Grid of 7 Heatmap blocks representing days */}
      <div className="grid grid-cols-7 gap-2.5">
        {heatmapData.map((dayData, idx) => {
          const isSelected = selectedDayIndex === idx;
          const score =
            activeMetric === 'visibility'
              ? dayData.visibility
              : activeMetric === 'ctr'
                ? Math.round(dayData.ctr * 20)
                : Math.round(dayData.rankings * 3);

          return (
            <button
              key={dayData.day}
              onClick={() => setSelectedDayIndex(idx)}
              className={`p-3 rounded-xl border text-center transition flex flex-col items-center justify-between gap-1.5 group cursor-pointer ${getHeatIntensityStyle(score)} ${
                isSelected
                  ? 'ring-2 ring-[#34d399] scale-[1.03]'
                  : 'hover:scale-[1.01]'
              }`}
            >
              <span className="text-[10px] font-mono font-bold tracking-wider opacity-70 uppercase">
                {dayData.day}
              </span>
              <div className="flex flex-col items-center justify-center">
                <span className="text-xs font-bold leading-none font-mono">
                  {activeMetric === 'visibility' && `${dayData.visibility}%`}
                  {activeMetric === 'ctr' && `${dayData.ctr}%`}
                  {activeMetric === 'rankings' && `${dayData.rankings}`}
                </span>
                {isHighPerformer(dayData.day) && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping mt-1"
                    title="High Performing Discovery Day"
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Trends Chart and Detailed Analytics Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Recharts Trend Chart Container (8 Columns) */}
        <div className="lg:col-span-8 bg-black/20 border border-white/10 rounded-2xl p-4 flex flex-col h-[230px] relative">
          <div className="flex justify-between items-center mb-2.5 px-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold flex items-center gap-1">
              <TrendingUp size={11} className="text-[#34d399]" />
              {activeMetric === 'visibility' &&
                'Weekly Visibility Curve & Scans'}
              {activeMetric === 'ctr' && 'Weekly Click-Through Rate Curve'}
              {activeMetric === 'rankings' && 'Weekly Top-10 Ranked Keywords'}
            </span>
            <div className="flex gap-3 text-[9px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-[#34d399]" />
                {activeMetric === 'visibility' && 'Visibility Index'}
                {activeMetric === 'ctr' && 'CTR %'}
                {activeMetric === 'rankings' && 'Top Keywords'}
              </span>
              {activeMetric === 'visibility' && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded bg-sky-400" />
                  Discovery Scans
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 min-h-[170px] select-none text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={heatmapData}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <XAxis
                  dataKey="day"
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  fontFamily="monospace"
                />
                <YAxis
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  fontFamily="monospace"
                />
                <Tooltip content={<CustomTooltip />} />

                {/* Visual Area plot for standard search visibility index */}
                <Area
                  type="monotone"
                  dataKey={activeMetric}
                  stroke="#34d399"
                  strokeWidth={2}
                  fillOpacity={0.12}
                  fill="url(#colorMetric)"
                  activeDot={{ r: 5, stroke: '#0f172a', strokeWidth: 1.5 }}
                />

                {/* Secondary Bar representing Discovery Sessions to show performance correlation */}
                {activeMetric === 'visibility' && (
                  <Bar
                    dataKey="discovery_sessions"
                    barSize={12}
                    fill="#38bdf8"
                    radius={[4, 4, 0, 0]}
                    opacity={0.65}
                  />
                )}

                {/* Draw reference lines on peak days to guide the user */}
                <ReferenceLine
                  x="Wed"
                  stroke="#fbbf24"
                  strokeDasharray="3 3"
                  opacity={0.3}
                />
                <ReferenceLine
                  x="Fri"
                  stroke="#fbbf24"
                  strokeDasharray="3 3"
                  opacity={0.3}
                />

                {/* Define gradient colors */}
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Selected Day Inspector (4 Columns) */}
        <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col justify-between text-left relative overflow-hidden">
          {/* Subtle glowing corner */}
          {isHighPerformer(selectedDay.day) && (
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl translate-x-8 -translate-y-8" />
          )}

          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-[#34d399]" />
                <span className="text-xs font-bold text-slate-200">
                  Insights for {selectedDay.day}
                </span>
              </div>
              {isHighPerformer(selectedDay.day) ? (
                <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold flex items-center gap-1">
                  <Award size={10} />
                  Peak Day
                </span>
              ) : (
                <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                  Standard Day
                </span>
              )}
            </div>

            {/* Micro stats grid */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-black/20 rounded-xl p-2.5 border border-white/5">
                <span className="text-[9px] font-mono text-slate-400 block leading-tight">
                  VISIBILITY INDEX
                </span>
                <span className="text-base font-bold font-mono text-[#34d399] mt-1 block">
                  {selectedDay.visibility}%
                </span>
              </div>
              <div className="bg-black/20 rounded-xl p-2.5 border border-white/5">
                <span className="text-[9px] font-mono text-slate-400 block leading-tight">
                  ORGANIC CTR
                </span>
                <span className="text-base font-bold font-mono text-sky-400 mt-1 block">
                  {selectedDay.ctr}%
                </span>
              </div>
              <div className="bg-black/20 rounded-xl p-2.5 border border-white/5">
                <span className="text-[9px] font-mono text-slate-400 block leading-tight">
                  TOP-10 RANKINGS
                </span>
                <span className="text-base font-bold font-mono text-purple-300 mt-1 block">
                  {selectedDay.rankings}
                </span>
              </div>
              <div className="bg-black/20 rounded-xl p-2.5 border border-white/5">
                <span className="text-[9px] font-mono text-slate-400 block leading-tight">
                  SCANS RUN
                </span>
                <span className="text-base font-bold font-mono text-amber-300 mt-1 block">
                  {selectedDay.discovery_sessions}
                </span>
              </div>
            </div>
          </div>

          {/* AI Advisor Prompt */}
          <div className="mt-4 pt-3.5 border-t border-white/5 flex gap-2.5">
            <div className="p-1.5 bg-[#34d399]/10 rounded-lg h-fit border border-[#34d399]/20 shrink-0">
              <Sparkles
                size={13}
                className="text-[#34d399] fill-[#34d399]/10"
              />
            </div>
            <div>
              <span className="text-[9px] font-bold text-[#34d399] uppercase font-mono tracking-wider block">
                AI SEO ADVISOR
              </span>
              <p className="text-[11px] text-slate-300 leading-snug mt-1">
                {getAISuggestionForDay(selectedDay.day)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info footer */}
      <div className="flex gap-2 p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-[10px] items-start">
        <Info size={14} className="text-[#34d399] shrink-0 mt-0.5" />
        <p className="leading-normal">
          <strong>How to read:</strong> The heatmap tracks daily organic SEO
          visibility based on Google search console impressions. High intensity
          days (Wednesday & Friday) highlight the highest search frequencies for
          Dublin energy upgrades, proving that content research and indexing
          yield peak organic click-throughs on these specific days.
        </p>
      </div>
    </div>
  );
}
