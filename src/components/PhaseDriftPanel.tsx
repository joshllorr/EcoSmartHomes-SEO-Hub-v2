import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  RefreshCw,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { PhaseDriftReport, AutoRepairResult } from '../logic/phaseDriftDetector';

export default function PhaseDriftPanel() {
  const [report, setReport] = useState<PhaseDriftReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [repairing, setRepairing] = useState(false);
  const [repairNotice, setRepairNotice] = useState<string | null>(null);

  const fetchDriftReport = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/drift/report');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.report) {
          setReport(data.report);
        }
      }
    } catch {
      // offline fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDriftReport();
    const interval = setInterval(fetchDriftReport, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleAutoRepair = async () => {
    try {
      setRepairing(true);
      const res = await fetch('/api/drift/auto-repair', {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setRepairNotice(
            `Auto-repaired ${data.result.repairsSuccessful} phase(s). Stability restored to ${data.result.postRepairStabilityScore}/100!`,
          );
          await fetchDriftReport();
          setTimeout(() => setRepairNotice(null), 5000);
        }
      }
    } catch {
      setRepairNotice('Failed to trigger auto-repair.');
    } finally {
      setRepairing(false);
    }
  };

  if (!report) return null;

  const isPerfect = report.overallStabilityScore >= 95 && report.driftingPhasesCount === 0;

  return (
    <div
      className={`glass-card p-5 text-left border rounded-2xl transition-all ${
        isPerfect
          ? 'bg-emerald-950/20 border-emerald-500/30'
          : 'bg-amber-950/20 border-amber-500/40'
      } space-y-4`}
      id="phase-drift-detector-panel"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl ${
              isPerfect
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-amber-500/20 text-amber-400'
            }`}
          >
            {isPerfect ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Phase Drift Detector & Stability Sentinel
              </h3>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  isPerfect
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}
              >
                {report.status}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Continuously monitors slope, volatility, SERP, prediction & telemetry drift across all 49 phases
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block">
              Stability Score
            </span>
            <span
              className={`text-lg font-bold font-mono ${
                isPerfect ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              {report.overallStabilityScore}/100
            </span>
          </div>

          <button
            onClick={fetchDriftReport}
            disabled={loading}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition cursor-pointer"
            title="Scan Phase Drift"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-emerald-400' : ''} />
          </button>
        </div>
      </div>

      {/* Repair Notice Alert */}
      {repairNotice && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 size={15} />
          <span>{repairNotice}</span>
        </div>
      )}

      {/* Grid of Phase Drift Monitors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {report.phases.map((p) => {
          const isPhaseCalibrated = p.status === 'CALIBRATED';
          return (
            <div
              key={p.phase}
              className={`p-3 rounded-xl border text-xs flex flex-col justify-between gap-2 ${
                isPhaseCalibrated
                  ? 'bg-black/30 border-white/5'
                  : 'bg-amber-950/40 border-amber-500/40 shadow-lg'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>{p.phaseGroup}</span>
                  <span
                    className={`font-bold uppercase ${
                      isPhaseCalibrated ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white font-mono mt-1 truncate">
                  {p.phase}
                </h4>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-white/5 font-mono text-[10px]">
                <span className="text-slate-400">Drift Index:</span>
                <span
                  className={`font-bold ${
                    p.drift === 0 ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {p.drift.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Auto-Repair Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/10">
        <span className="text-[11px] text-slate-400 font-mono">
          {report.calibratedPhasesCount}/{report.phases.length} Phase Engines Operating in Nominal State
        </span>

        {report.driftingPhasesCount > 0 ? (
          <button
            onClick={handleAutoRepair}
            disabled={repairing}
            className="w-full sm:w-auto py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono flex items-center justify-center gap-1.5 transition cursor-pointer shadow-lg"
          >
            <Zap size={14} className={repairing ? 'animate-spin' : ''} />
            <span>Trigger Autonomous Multi-Phase Repair</span>
          </button>
        ) : (
          <div className="flex items-center gap-1 text-xs text-emerald-400 font-mono">
            <CheckCircle2 size={14} />
            <span>All 49 Phases Calibrated (100/100 Stability)</span>
          </div>
        )}
      </div>
    </div>
  );
}
