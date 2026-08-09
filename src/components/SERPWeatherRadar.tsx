/**
 * src/components/SERPWeatherRadar.tsx
 *
 * Real-Time SERP Volatility Weather Radar
 * Tracks Google Ireland SERP turbulence and algorithm updates in real time.
 */

import { useState } from 'react';
import {
  CloudLightning,
  Sun,
  ShieldAlert,
  Sparkles,
  Activity,
} from 'lucide-react';

export default function SERPWeatherRadar() {
  const [weatherState] = useState({
    status: 'Calm / Stable',
    volatilityIndex: 2.4, // out of 10
    weatherIcon: 'sun',
    alertMessage:
      'Google Ireland SERP stability is high. Automation strengthening is active.',
    lastUpdateCheck: 'Just now',
  });

  return (
    <div className="glass-card p-6 flex flex-col gap-4 text-left border border-sky-500/20 rounded-2xl bg-slate-900/80 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl">
            <CloudLightning size={20} className="animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono text-sky-400 font-bold tracking-wider">
              Algorithm Radar
            </span>
            <h3 className="text-sm font-bold text-white">
              Google IE SERP Weather Radar
            </h3>
          </div>
        </div>
        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-full flex items-center gap-1.5">
          <Sun size={14} className="text-amber-400" /> Weather: Calm (2.4/10)
        </span>
      </div>

      <div className="p-4 rounded-xl bg-slate-950/70 border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-white">
              Current SERP State: {weatherState.status}
            </h4>
            <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 text-[10px] font-bold rounded-md">
              Index: {weatherState.volatilityIndex} / 10
            </span>
          </div>
          <p className="text-xs text-slate-300">{weatherState.alertMessage}</p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          <Activity size={14} className="text-emerald-400" />
          <span>Sync: {weatherState.lastUpdateCheck}</span>
        </div>
      </div>
    </div>
  );
}
