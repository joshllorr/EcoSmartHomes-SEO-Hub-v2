/**
 * src/portal/journey/JourneyView.tsx
 *
 * Phase 32 Homeowner Portal Unified Journey Timeline Component
 * Route: /portal/journey
 */

import { useState, useEffect } from 'react';
import {
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Award,
  Compass,
} from 'lucide-react';
import { apiGet } from '../../hooks/useApi';
import {
  JOURNEY_EVENT_METADATA,
  JourneyEventType,
} from '../../../logic/journey/journeyEngine';

export function JourneyTimeline({ events }: { events: any[] }) {
  if (!events || events.length === 0) return null;

  return (
    <div className="flex flex-col gap-5 relative pl-8 border-l-2 border-slate-700/60 font-mono text-xs my-4 text-left">
      {events.map((entry, idx) => {
        const meta = JOURNEY_EVENT_METADATA[
          entry.event as JourneyEventType
        ] || {
          label: entry.event,
          icon: '📌',
          color: '#38bdf8',
          phase: 'Phase 32',
        };

        const dateStr = new Date(entry.at).toLocaleString('en-IE', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <div key={idx} className="relative flex flex-col gap-1.5 group">
            {/* Timeline Icon Badge */}
            <div
              style={{ backgroundColor: '#0f172a', borderColor: meta.color }}
              className="absolute -left-[45px] top-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm shadow-lg group-hover:scale-110 transition-transform"
            >
              {meta.icon}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span
                className="font-bold text-white text-sm"
                style={{ color: meta.color }}
              >
                {meta.label}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-slate-300 border border-slate-700">
                {meta.phase}
              </span>
              <span className="text-slate-400 text-[11px] font-mono">
                {dateStr}
              </span>
            </div>

            {entry.notes && (
              <p className="text-slate-300 text-xs font-sans bg-slate-950/80 p-3 rounded-xl border border-white/5 shadow-inner">
                {entry.notes}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function JourneyView({
  userId = 'user_2026_08_03_1412',
}: {
  userId?: string;
}) {
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchJourney = async () => {
    try {
      setLoading(true);
      const res = await apiGet(`/api/journey/${userId}`);
      if (res && res.record) {
        setRecord(res.record);
      }
    } catch (err) {
      console.error('Journey timeline fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJourney();
  }, [userId]);

  if (loading || !record) {
    return (
      <div className="p-8 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-300 font-mono text-xs">
        <Clock size={20} className="animate-spin text-sky-400" />
        <span>Loading Full Homeowner Journey Timeline...</span>
      </div>
    );
  }

  const completedCount = record.events?.length || 0;
  const progressPercent = Math.min(
    100,
    Math.round((completedCount / 13) * 100),
  );

  return (
    <div className="flex flex-col gap-5 text-left font-sans">
      {/* Top Banner */}
      <div className="p-6 bg-slate-900/80 border border-emerald-500/20 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass size={18} className="text-emerald-400" />
            <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold tracking-wider">
              Phase 32 Master Journey Timeline
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Your End-to-End Retrofit Journey
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Timeline ID:{' '}
            <strong className="text-sky-300">{record.timeline_id}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-bold">
              Journey Completion
            </div>
            <div className="text-2xl font-bold text-emerald-400">
              {progressPercent}%
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500/30 border-t-emerald-400 flex items-center justify-center text-xs font-bold text-white">
            {completedCount}/13
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="p-4 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col gap-2 font-mono text-xs">
        <div className="flex justify-between items-center text-slate-300">
          <span>Overall Retrofit & Grant Execution Progress</span>
          <span className="text-emerald-400 font-bold">
            {progressPercent}% Completed
          </span>
        </div>
        <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-white/5">
          <div
            className="bg-gradient-to-r from-sky-500 via-teal-400 to-emerald-400 h-full transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Master Unified Vertical Timeline */}
      <div className="p-6 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col gap-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
          <ShieldCheck size={18} className="text-emerald-400" />
          Transparent Unified Journey Milestone Audit
        </h3>

        <JourneyTimeline events={record.events} />
      </div>
    </div>
  );
}
