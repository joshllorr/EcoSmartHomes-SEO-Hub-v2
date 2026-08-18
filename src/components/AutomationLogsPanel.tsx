import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  RefreshCw,
  Zap,
  Terminal,
  Shield,
  Layers,
} from 'lucide-react';
import { AutomationLog } from '../logic/automationEngine';

export default function AutomationLogsPanel() {
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'success' | 'warning' | 'error'>('all');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/automation/logs?limit=30');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.logs)) {
          setLogs(data.logs);
        }
      }
    } catch (err) {
      // offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 8000);
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter(
    (l) => filter === 'all' || l.status === filter,
  );

  return (
    <div
      className="glass-card p-5 text-left border border-white/10 rounded-2xl bg-slate-900/60 space-y-4"
      id="automation-logs-panel"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Terminal size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Automation Engine Logs
              </h3>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                Phase 16–27 Live
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Live execution stream: Link Reinforcer, Entity Booster, Schema Validator & Crawl Scheduler
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-black/40 p-0.5 rounded-lg border border-white/10 text-[10px] font-mono">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-1 rounded transition cursor-pointer ${
                filter === 'all' ? 'bg-white/20 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({logs.length})
            </button>
            <button
              onClick={() => setFilter('success')}
              className={`px-2 py-1 rounded transition cursor-pointer ${
                filter === 'success' ? 'bg-emerald-500/30 text-emerald-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Success
            </button>
            <button
              onClick={() => setFilter('error')}
              className={`px-2 py-1 rounded transition cursor-pointer ${
                filter === 'error' ? 'bg-rose-500/30 text-rose-300 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Errors
            </button>
          </div>

          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition cursor-pointer"
            title="Refresh logs"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-emerald-400' : ''} />
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 font-mono">
            No automation logs found for filter “{filter}”.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-black/30 border border-white/5 hover:border-white/15 transition text-xs flex items-start gap-3"
            >
              <div className="shrink-0 mt-0.5">
                {log.status === 'success' && <CheckCircle2 size={15} className="text-emerald-400" />}
                {log.status === 'warning' && <AlertTriangle size={15} className="text-amber-400" />}
                {log.status === 'error' && <AlertCircle size={15} className="text-rose-400" />}
                {log.status === 'info' && <Info size={15} className="text-sky-400" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-white font-mono text-[11px] truncate">
                    [Phase {log.phase}] {log.phaseName}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-slate-300 text-[11px] mt-0.5 leading-relaxed break-words">
                  {log.details}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-1 flex items-center gap-2">
                  <span>Action: <strong>{log.action}</strong></span>
                  {log.target && <span>Target: <strong>{log.target}</strong></span>}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
