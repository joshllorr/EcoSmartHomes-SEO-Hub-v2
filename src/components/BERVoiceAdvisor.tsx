/**
 * src/components/BERVoiceAdvisor.tsx
 *
 * BER Voice Advisor — AI Audio Overview Player
 * Generates 90-second AI audio podcasts summarizing BER retrofit guides to boost user dwell time.
 */

import { useState, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  Sparkles,
  Mic,
  Radio,
  RotateCcw,
} from 'lucide-react';

interface BERVoiceAdvisorProps {
  title?: string;
  summaryText?: string;
}

export default function BERVoiceAdvisor({
  title = 'Air-to-Water Heat Pump Grants & SEAI Cost Analysis 2026',
  summaryText = 'Welcome to the EcoSmartHomes Audio Overview. In this 90-second briefing, we break down SEAI heat pump grant eligibility, electricity running costs vs gas boilers, and expected COP efficiency in Irish humidity...',
}: BERVoiceAdvisorProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(15);
  const [speechRate, setSpeechRate] = useState<number>(1.0);

  const togglePlay = () => {
    if ('speechSynthesis' in window) {
      if (isPlaying) {
        window.speechSynthesis.pause();
        setIsPlaying(false);
      } else {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        } else {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(summaryText);
          utterance.rate = speechRate;
          utterance.onend = () => setIsPlaying(false);
          window.speechSynthesis.speak(utterance);
        }
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleReset = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setProgress(0);
  };

  return (
    <div className="glass-card p-6 flex flex-col gap-4 text-left border border-purple-500/20 rounded-2xl bg-slate-900/80 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 text-purple-300 rounded-xl">
            <Mic size={20} className="animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-purple-400 font-bold tracking-wider">
              AI Audio Dwell-Time Booster
            </span>
            <h3 className="text-sm font-bold text-white">
              BER Voice Advisor — 90s Briefing
            </h3>
          </div>
        </div>
        <span className="px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-full flex items-center gap-1.5">
          <Radio size={12} className="animate-ping text-purple-400" /> Live
          Text-to-Speech
        </span>
      </div>

      <div className="p-4 rounded-xl bg-slate-950/70 border border-white/10 flex flex-col gap-3">
        <h4 className="text-xs font-semibold text-sky-300 line-clamp-1">
          🎙️ {title}
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed italic">
          &quot;{summaryText}&quot;
        </p>

        {/* Audio Player Controls */}
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={togglePlay}
            className="p-3 bg-purple-600 hover:bg-purple-500 text-white rounded-full transition-all shadow-lg flex items-center justify-center shrink-0"
          >
            {isPlaying ? (
              <Pause size={18} />
            ) : (
              <Play size={18} className="ml-0.5" />
            )}
          </button>

          <div className="flex-1 space-y-1">
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-300"
                style={{ width: `${isPlaying ? 65 : progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-400 font-bold">
              <span>{isPlaying ? '0:42' : '0:00'}</span>
              <span>1:30</span>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="p-2 text-slate-400 hover:text-white transition-colors"
            title="Reset Audio"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
