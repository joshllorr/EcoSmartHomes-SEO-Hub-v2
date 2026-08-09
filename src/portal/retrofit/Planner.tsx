/**
 * src/portal/retrofit/Planner.tsx
 *
 * Phase 27 AI Retrofit Planner Dashboard Component
 */

import { useState, useEffect } from 'react';
import {
  Sparkles,
  Euro,
  Award,
  TrendingUp,
  Calendar,
  Layers,
  Wrench,
  Package,
  FileText,
  Loader2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { RetrofitPlan, aiPlanner } from '../../../logic/retrofit/aiPlanner';

interface PlannerProps {
  grantId?: string;
  userId?: string;
}

export default function Planner({
  grantId = 'grant_2026_08_03_1207',
  userId = 'user_2026_08_03_1412',
}: PlannerProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'costs' | 'timeline' | 'materials' | 'contractors'
  >('overview');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<RetrofitPlan | null>(null);

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/retrofit/plan/${grantId}`);
      const data = await res.json();
      if (data && data.recommendedUpgrades) {
        setPlan(data);
      } else {
        setPlan(aiPlanner({ id: grantId }, { user_id: userId }));
      }
    } catch {
      setPlan(aiPlanner({ id: grantId }, { user_id: userId }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [grantId]);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/retrofit/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grant_id: grantId, user_id: userId }),
      });
      const data = await res.json();
      if (data && data.recommendedUpgrades) {
        setPlan(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !plan) {
    return (
      <div className="p-8 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-300 font-mono text-xs">
        <Loader2 size={24} className="animate-spin text-emerald-400" />
        <span>Synthesizing AI Retrofit Optimization Plan...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 text-left font-sans">
      {/* Top Banner */}
      <div className="p-6 bg-slate-900/80 border border-emerald-500/20 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-emerald-400" />
            <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold tracking-wider">
              AI Retrofit Optimization Engine
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Your Customized SEAI Retrofit Execution Plan
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Plan ID:{' '}
            <strong className="text-emerald-300">{plan.plan_id}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`/api/retrofit/plan/${plan.plan_id}/pdf`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-mono font-bold rounded-xl transition flex items-center gap-2 shadow-lg"
          >
            <FileText size={14} />
            <span>Download Full Blueprint (PDF)</span>
          </a>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-mono font-bold rounded-xl transition flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Sparkles size={14} />
            <span>Re-Generate AI Plan</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-white/10 text-xs font-mono">
        {[
          { id: 'overview', label: 'Overview', icon: Sparkles },
          { id: 'costs', label: 'Cost Breakdown', icon: Euro },
          { id: 'timeline', label: 'Timeline', icon: Calendar },
          { id: 'materials', label: 'Bill of Materials', icon: Package },
          { id: 'contractors', label: 'Contractors Needed', icon: Wrench },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-5 font-mono text-xs">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900/80 border border-white/10 rounded-xl flex flex-col justify-between">
              <span className="text-slate-400">Total Investment:</span>
              <span className="text-2xl font-extrabold text-white mt-2">
                €{plan.costEstimate.total.toLocaleString()}
              </span>
            </div>

            <div className="p-4 bg-slate-900/80 border border-emerald-500/30 rounded-xl flex flex-col justify-between">
              <span className="text-slate-400">SEAI Grant Offset:</span>
              <span className="text-2xl font-extrabold text-emerald-400 mt-2">
                €{plan.grantOffsets.total.toLocaleString()}
              </span>
            </div>

            <div className="p-4 bg-slate-900/80 border border-sky-500/30 rounded-xl flex flex-col justify-between">
              <span className="text-slate-400">Net Out-of-Pocket:</span>
              <span className="text-2xl font-extrabold text-sky-400 mt-2">
                €{plan.netCost.toLocaleString()}
              </span>
            </div>

            <div className="p-4 bg-slate-900/80 border border-purple-500/30 rounded-xl flex flex-col justify-between">
              <span className="text-slate-400">BER Rating Uplift:</span>
              <span className="text-2xl font-extrabold text-purple-300 mt-2">
                {plan.berImpact}
              </span>
            </div>
          </div>

          {/* Recommended Upgrades List */}
          <div className="p-5 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col gap-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              Recommended SEAI Energy Efficiency Upgrades
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {plan.recommendedUpgrades.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-950/80 border border-white/5 rounded-xl flex items-center justify-between"
                >
                  <span className="font-bold text-white">{item}</span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] uppercase font-bold">
                    Recommended
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COSTS */}
      {activeTab === 'costs' && (
        <div className="p-5 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col gap-4 font-mono text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Euro size={16} className="text-emerald-400" />
            Detailed Financial & SEAI Grant Breakdown
          </h3>

          <div className="flex flex-col gap-3">
            {[
              {
                measure: 'Attic Insulation',
                gross: plan.costEstimate.attic,
                grant: plan.grantOffsets.attic,
              },
              {
                measure: 'Smart Heating Controls',
                gross: plan.costEstimate.controls,
                grant: plan.grantOffsets.controls,
              },
              {
                measure: 'Air-to-Water Heat Pump',
                gross: plan.costEstimate.heatPump,
                grant: plan.grantOffsets.heatPump,
              },
              {
                measure: 'Rooftop Solar PV',
                gross: plan.costEstimate.solar,
                grant: plan.grantOffsets.solar,
              },
            ].map((row, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-950/80 border border-white/5 rounded-xl flex justify-between items-center"
              >
                <div>
                  <span className="font-bold text-white">{row.measure}</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Gross: €{row.gross.toLocaleString()} | Grant: €
                    {row.grant.toLocaleString()}
                  </p>
                </div>
                <span className="text-sky-300 font-bold">
                  Net: €{(row.gross - row.grant).toLocaleString()}
                </span>
              </div>
            ))}

            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex justify-between items-center text-sm font-bold mt-2">
              <span className="text-white">
                Total Net Investment Out-of-Pocket:
              </span>
              <span className="text-emerald-400">
                €{plan.netCost.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="p-5 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col gap-4 font-mono text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Calendar size={16} className="text-sky-400" />
            Optimized Execution Timeline & Sequence
          </h3>

          <div className="flex flex-col gap-3">
            {plan.timeline.map((t, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-950/80 border border-white/5 rounded-xl flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[11px]">
                    {t.sequence}
                  </span>
                  <span className="font-bold text-white">{t.task}</span>
                </div>
                <span className="px-2.5 py-1 bg-slate-900 text-slate-300 border border-white/10 rounded text-[11px] font-bold">
                  Duration: {t.duration}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MATERIALS */}
      {activeTab === 'materials' && (
        <div className="p-5 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col gap-4 font-mono text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Package size={16} className="text-indigo-400" />
            SEAI-Approved Bill of Materials (BOM)
          </h3>

          <div className="flex flex-col gap-2.5">
            {plan.materials.map((m, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-950/80 border border-white/5 rounded-xl flex items-center gap-3"
              >
                <Package size={14} className="text-indigo-400 shrink-0" />
                <span className="text-slate-200">{m}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: CONTRACTORS */}
      {activeTab === 'contractors' && (
        <div className="p-5 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col gap-4 font-mono text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Wrench size={16} className="text-purple-400" />
            Required SEAI-Registered Trades & Technicians
          </h3>

          <div className="flex flex-col gap-2.5">
            {plan.contractorsNeeded.map((c, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-950/80 border border-white/5 rounded-xl flex justify-between items-center"
              >
                <span className="font-bold text-white">{c}</span>
                <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded text-[10px] uppercase font-bold">
                  SEAI Registered
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
