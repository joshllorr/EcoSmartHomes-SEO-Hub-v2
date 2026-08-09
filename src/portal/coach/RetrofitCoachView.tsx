/**
 * src/portal/coach/RetrofitCoachView.tsx
 *
 * Phase 39 Homeowner Portal AI Retrofit Coach Component
 * Route: /portal/coach
 */

import { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  Compass,
  ShieldCheck,
  Heart,
  PartyPopper,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { apiGet, apiPost } from '../../hooks/useApi';
import { CoachMessage } from '../../logic/coach/retrofitCoachEngine';

export default function RetrofitCoachView({
  userId = 'user_2026_08_03_1412',
}: {
  userId?: string;
}) {
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await apiGet(`/api/coach/messages?user_id=${userId}`);
      if (res && res.messages && res.messages.length > 0) {
        setMessages(res.messages);
      } else {
        // Fallback demonstration coaching guidance messages
        const now = Date.now();
        setMessages([
          {
            id: `coach_${now}_1`,
            user_id: userId,
            text: 'Your SEAI grant is currently under review! This is a great time to explore Smart Upgrades (such as Solar PV batteries) to maximize your long-term energy savings.',
            tone: 'friendly',
            createdAt: now,
            read: false,
          },
          {
            id: `coach_${now}_2`,
            user_id: userId,
            text: 'Congratulations! Your retrofit installation is complete! The final step is your post-install BER cert assessment — this unlocks your SEAI grant payment.',
            tone: 'celebratory',
            createdAt: now,
            read: false,
          },
          {
            id: `coach_${now}_3`,
            user_id: userId,
            text: "We know retrofit paperwork and scheduling can feel complex. You're doing great — your assigned contractor holds a 94/100 Quality Rating and our AI Copilot is here 24/7.",
            tone: 'reassuring',
            createdAt: now,
            read: false,
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch coach messages', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReGenerate = async () => {
    try {
      setGenerating(true);
      const res = await apiPost('/api/coach/generate', { user_id: userId });
      if (res && res.messages) {
        setMessages(res.messages);
      }
    } catch (err) {
      console.error('Failed to generate coach messages', err);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [userId]);

  if (loading && messages.length === 0) {
    return (
      <div className="p-8 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-300 font-mono text-xs">
        <Clock size={20} className="animate-spin text-emerald-400" />
        <span>Evaluating Proactive Behavioral Retrofit Guidance...</span>
      </div>
    );
  }

  const toneIcons: Record<string, any> = {
    friendly: Sparkles,
    celebratory: PartyPopper,
    reassuring: Heart,
    urgent: ShieldCheck,
  };

  const toneStyles: Record<string, string> = {
    friendly: 'bg-sky-500/10 border-sky-500/30 text-sky-300',
    celebratory: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    reassuring: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
    urgent: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
  };

  return (
    <div className="flex flex-col gap-5 text-left font-sans max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 bg-slate-900/80 border border-emerald-500/20 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-emerald-400" />
            <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold tracking-wider">
              Phase 39 Behavioral Automation Layer
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Your Proactive AI Retrofit Coach
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Automated progress monitoring, stall prevention, and
            sentiment-adapted guidance.
          </p>
        </div>

        <button
          onClick={handleReGenerate}
          disabled={generating}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg cursor-pointer"
        >
          <RefreshCw size={14} className={generating ? 'animate-spin' : ''} />
          <span>Refresh Proactive Guidance</span>
        </button>
      </div>

      {/* Proactive Messages List */}
      <div className="flex flex-col gap-3">
        {messages.map((m) => {
          const IconComp = toneIcons[m.tone] || Sparkles;
          const toneClass =
            toneStyles[m.tone] || 'bg-slate-900 border-white/10 text-white';

          return (
            <div
              key={m.id}
              className={`p-5 border rounded-2xl flex items-start gap-4 transition ${toneClass}`}
            >
              <div className="p-2.5 bg-slate-950/80 rounded-xl border border-white/10 shrink-0 mt-0.5">
                <IconComp size={20} />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 bg-slate-950/60 rounded border border-white/10">
                    {m.tone} Guidance
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(m.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-sm font-sans leading-relaxed text-slate-100 font-medium mt-1">
                  {m.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
