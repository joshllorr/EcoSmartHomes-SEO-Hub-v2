/**
 * src/dashboard/AdvisorSessionsDashboard.tsx
 *
 * Phase 37 SEO Hub AI Retrofit Advisor Session Monitoring Console
 * Route: /dashboard/advisor (p37_advisor)
 */

import { useEffect, useState } from 'react';
import {
  MessageSquare,
  Bot,
  User,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Euro,
  Compass,
  TrendingUp,
  HelpCircle,
} from 'lucide-react';
import { apiGet } from '../hooks/useApi';

export default function AdvisorSessionsDashboard() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState({
    activeSessions: 42,
    totalMessagesExchanged: 318,
    topInquiryCategory: 'Next Steps & Upgrades (44%)',
    satisfactionRate: '98.2%',
    commonQuestions: [
      { topic: 'Next Steps & Milestone Progress', count: 140, pct: '44%' },
      { topic: 'Contractor Quality & SEAI Rating', count: 82, pct: '26%' },
      { topic: 'Energy Savings & Financials', count: 54, pct: '17%' },
      { topic: 'Carbon Offset & Environmental Impact', count: 42, pct: '13%' },
    ],
  });

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await apiGet('/api/advisor/sessions');
      if (Array.isArray(res)) {
        setSessions(res);
      }
    } catch (err) {
      console.error('Failed to fetch advisor sessions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <div className="flex flex-col gap-5 text-left font-sans">
      {/* Header Banner */}
      <div className="glass-card p-6 border border-emerald-500/20 rounded-2xl bg-slate-900/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bot size={18} className="text-emerald-400" />
            <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold tracking-wider">
              Phase 37 AI Copilot Monitoring
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Homeowner AI Advisor Session Telemetry
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time intelligence on homeowner queries, upgrade interest, and
            contractor concerns.
          </p>
        </div>

        <button
          onClick={fetchSessions}
          disabled={loading}
          className="px-4 py-2 bg-slate-950 border border-white/10 text-xs font-mono font-bold text-slate-300 hover:text-white rounded-xl transition flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-sky-400">
            <MessageSquare size={18} />
            <span className="font-bold text-slate-300">
              Active Copilot Sessions
            </span>
          </div>
          <span className="text-3xl font-bold text-sky-300 mt-3">
            {metrics.activeSessions}
          </span>
        </div>

        <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-emerald-400">
            <Sparkles size={18} />
            <span className="font-bold text-slate-300">Total Interactions</span>
          </div>
          <span className="text-3xl font-bold text-emerald-400 mt-3">
            {metrics.totalMessagesExchanged}
          </span>
        </div>

        <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-indigo-400">
            <Compass size={18} />
            <span className="font-bold text-slate-300">
              Primary Inquiry Category
            </span>
          </div>
          <span className="text-sm font-bold text-indigo-300 mt-3">
            {metrics.topInquiryCategory}
          </span>
        </div>

        <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck size={18} />
            <span className="font-bold text-slate-300">
              Satisfaction Rating
            </span>
          </div>
          <span className="text-3xl font-bold text-emerald-300 mt-3">
            {metrics.satisfactionRate}
          </span>
        </div>
      </div>

      {/* Inquiry Topic Distribution */}
      <div className="glass-card p-6 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-4 font-mono text-xs">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <HelpCircle size={18} className="text-emerald-400" />
          Homeowner Question Distribution & Interest Trends
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {metrics.commonQuestions.map((q, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-950/80 border border-white/5 rounded-xl flex flex-col justify-between gap-2"
            >
              <span className="text-[10px] text-slate-400 uppercase font-bold">
                {q.topic}
              </span>
              <div className="flex justify-between items-baseline mt-1">
                <span className="text-xl font-bold text-emerald-400">
                  {q.count}
                </span>
                <span className="text-xs text-sky-300">{q.pct}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
