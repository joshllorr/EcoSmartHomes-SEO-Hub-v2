/**
 * src/portal/sentiment/HomeownerConfidenceView.tsx
 *
 * Phase 38 Homeowner Portal Confidence & Sentiment Telemetry Component
 * Route: /portal/confidence
 */

import { useState, useEffect } from 'react';
import {
  Smile,
  Heart,
  ShieldCheck,
  Zap,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { apiGet, apiPost } from '../../hooks/useApi';
import { HomeownerSentiment } from '../../logic/sentiment/homeownerSentimentEngine';

export default function HomeownerConfidenceView({
  userId = 'user_2026_08_03_1412',
}: {
  userId?: string;
}) {
  const [sentiment, setSentiment] = useState<HomeownerSentiment | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchSentiment = async () => {
    try {
      setLoading(true);
      const res = await apiGet(`/api/sentiment?user_id=${userId}`);
      if (res && res.confidence !== undefined) {
        setSentiment(res);
      } else {
        // Fallback demonstration sentiment metrics
        setSentiment({
          user_id: userId,
          confidence: 85,
          clarity: 88,
          stress: 20,
          satisfaction: 92,
          trust: 94,
          updatedAt: Date.now(),
        });
      }
    } catch (err) {
      console.error('Failed to fetch sentiment', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      const res = await apiPost('/api/sentiment/update', { user_id: userId });
      if (res && res.confidence !== undefined) {
        setSentiment(res);
      }
    } catch (err) {
      console.error('Failed to update sentiment', err);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchSentiment();
  }, [userId]);

  if (loading && !sentiment) {
    return (
      <div className="p-8 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-300 font-mono text-xs">
        <Clock size={20} className="animate-spin text-emerald-400" />
        <span>Evaluating Psychological Retrofit Telemetry...</span>
      </div>
    );
  }

  if (!sentiment) return null;

  return (
    <div className="flex flex-col gap-5 text-left font-sans max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 bg-slate-900/80 border border-emerald-500/20 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Smile size={18} className="text-emerald-400" />
            <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold tracking-wider">
              Phase 38 Psychological Telemetry Engine
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Your Retrofit Journey Confidence Index
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time analysis of your peace of mind, clarity, trust, and stress
            levels.
          </p>
        </div>

        <button
          onClick={handleUpdate}
          disabled={updating}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg cursor-pointer"
        >
          <RefreshCw size={14} className={updating ? 'animate-spin' : ''} />
          <span>Recalculate Index</span>
        </button>
      </div>

      {/* Primary Telemetry Meters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        {/* Confidence Meter */}
        <div className="p-5 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <Zap size={16} className="text-emerald-400" />
              Overall Confidence
            </span>
            <strong className="text-emerald-400 text-xl font-sans">
              {sentiment.confidence}%
            </strong>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full"
              style={{ width: `${sentiment.confidence}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-slate-400">
            High readiness for next-step installation milestones.
          </span>
        </div>

        {/* Clarity Meter */}
        <div className="p-5 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <Sparkles size={16} className="text-sky-400" />
              Process Clarity
            </span>
            <strong className="text-sky-300 text-xl font-sans">
              {sentiment.clarity}%
            </strong>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-sky-400 h-full rounded-full"
              style={{ width: `${sentiment.clarity}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-slate-400">
            Clear understanding of grant terms and scope.
          </span>
        </div>

        {/* Stress Level Meter */}
        <div className="p-5 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <AlertTriangle size={16} className="text-amber-400" />
              Stress Level
            </span>
            <strong className="text-amber-300 text-xl font-sans">
              {sentiment.stress}%
            </strong>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full"
              style={{ width: `${sentiment.stress}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-slate-400">
            Minimal friction during paperwork sign-off.
          </span>
        </div>
      </div>

      {/* Secondary Telemetry: Trust & Satisfaction */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        <div className="p-5 bg-slate-900/80 border border-white/10 rounded-2xl flex justify-between items-center">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">
              Satisfaction Score
            </span>
            <strong className="text-white text-lg font-sans">
              Projected SEAI Satisfaction: {sentiment.satisfaction}%
            </strong>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <Heart size={20} />
          </div>
        </div>

        <div className="p-5 bg-slate-900/80 border border-white/10 rounded-2xl flex justify-between items-center">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">
              Platform Trust Index
            </span>
            <strong className="text-white text-lg font-sans">
              Contractor & Advisor Trust: {sentiment.trust}%
            </strong>
          </div>
          <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400">
            <ShieldCheck size={20} />
          </div>
        </div>
      </div>
    </div>
  );
}
