/**
 * src/portal/upgrades/HomeUpgradeRecommendationsView.tsx
 *
 * Phase 34 Homeowner Portal AI Home Upgrade Recommendation Component
 * Route: /portal/upgrades
 */

import { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  ArrowRight,
  Euro,
  Leaf,
  BatteryCharging,
  Flame,
  Layers,
  Clock,
} from 'lucide-react';
import { apiGet, apiPost } from '../../hooks/useApi';
import { HomeUpgradeRecommendation } from '../../logic/upgrades/homeUpgradeEngine';

export default function HomeUpgradeRecommendationsView({
  userId = 'user_2026_08_03_1412',
}: {
  userId?: string;
}) {
  const [recs, setRecs] = useState<HomeUpgradeRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await apiGet(
        `/api/upgrades/recommendations?user_id=${userId}`,
      );
      if (res && res.recommendations && res.recommendations.length > 0) {
        setRecs(res.recommendations);
      } else {
        // Fallback default demonstration recommendations
        const now = Date.now();
        setRecs([
          {
            id: `upgrade_battery_${now}`,
            user_id: userId,
            priority: 'high',
            category: 'storage',
            title: 'Add a 5kWh Smart Battery for Solar PV',
            description:
              'You already have Solar PV installed. Adding a smart battery lets you store daytime excess generation and power your home through evening peak tariff hours.',
            estimatedCost: 4500,
            estimatedSavings: 420,
            co2ImpactKgPerYear: 550,
            dependencies: [],
            createdAt: now,
            updatedAt: now,
          },
          {
            id: `upgrade_insulation_${now}`,
            user_id: userId,
            priority: 'high',
            category: 'insulation',
            title: 'Upgrade External Wall & Attic Thermal Fabric',
            description:
              'Your heat pump operates at peak seasonal COP efficiency when supported by low heat loss thermal fabric. Upgrading attic and wall insulation reduces heat demand.',
            estimatedCost: 6000,
            estimatedSavings: 650,
            co2ImpactKgPerYear: 820,
            dependencies: [],
            createdAt: now,
            updatedAt: now,
          },
          {
            id: `upgrade_controls_${now}`,
            user_id: userId,
            priority: 'medium',
            category: 'controls',
            title: 'Deploy Multi-Zone Smart Thermostatic Controls',
            description:
              'Automate room-by-room heating schedules with smartphone control and weather compensation logic, eligible for €1,000 SEAI grant funding.',
            estimatedCost: 1200,
            estimatedSavings: 280,
            co2ImpactKgPerYear: 310,
            dependencies: [],
            createdAt: now,
            updatedAt: now,
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch upgrade recommendations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReGenerate = async () => {
    try {
      setGenerating(true);
      const res = await apiPost('/api/upgrades/recommendations/generate', {
        user_id: userId,
      });
      if (res && res.recommendations) {
        setRecs(res.recommendations);
      }
    } catch (err) {
      console.error('Failed to generate upgrade recommendations', err);
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [userId]);

  if (loading) {
    return (
      <div className="p-8 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-300 font-mono text-xs">
        <Clock size={20} className="animate-spin text-emerald-400" />
        <span>Synthesizing Tailored AI Smart Home Upgrades...</span>
      </div>
    );
  }

  const categoryIcons: Record<string, any> = {
    storage: BatteryCharging,
    insulation: ShieldCheck,
    solar: Zap,
    heating: Flame,
    controls: Layers,
    fabric: Layers,
    ventilation: Sparkles,
  };

  return (
    <div className="flex flex-col gap-5 text-left font-sans">
      {/* Header Banner */}
      <div className="p-6 bg-slate-900/80 border border-emerald-500/20 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-emerald-400" />
            <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold tracking-wider">
              Phase 34 AI Recommendation Engine
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Next-Step Home Retrofit Upgrades
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Journey-aware AI recommendations tailored to your property&apos;s
            installed measures.
          </p>
        </div>

        <button
          onClick={handleReGenerate}
          disabled={generating}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg cursor-pointer"
        >
          <Sparkles size={14} className={generating ? 'animate-spin' : ''} />
          <span>Re-Run AI Analysis</span>
        </button>
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recs.map((r) => {
          const IconComp = categoryIcons[r.category] || Sparkles;
          const priorityColor =
            r.priority === 'high'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-sky-500/20 text-sky-300 border-sky-500/30';

          return (
            <div
              key={r.id}
              className="p-5 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col justify-between gap-4 font-mono text-xs hover:border-emerald-500/40 transition"
            >
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-bold border ${priorityColor}`}
                  >
                    {r.priority} Priority · {r.category}
                  </span>
                  <IconComp size={18} className="text-emerald-400" />
                </div>

                <h3 className="text-base font-bold text-white font-sans mt-1">
                  {r.title}
                </h3>
                <p className="text-slate-300 text-xs font-sans leading-relaxed">
                  {r.description}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase">
                    Est. Cost
                  </span>
                  <strong className="text-white text-sm">
                    {r.estimatedCost
                      ? `€${r.estimatedCost.toLocaleString()}`
                      : 'N/A'}
                  </strong>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase">
                    Annual Savings
                  </span>
                  <strong className="text-emerald-400 text-sm">
                    {r.estimatedSavings ? `€${r.estimatedSavings}/yr` : 'N/A'}
                  </strong>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase">
                    CO₂ Saved
                  </span>
                  <strong className="text-sky-300 text-sm">
                    {r.co2ImpactKgPerYear
                      ? `${r.co2ImpactKgPerYear} kg/yr`
                      : 'N/A'}
                  </strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
