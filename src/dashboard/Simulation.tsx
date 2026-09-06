/**
 * src/dashboard/Simulation.tsx
 *
 * Autonomous Market Simulator Console & Generative Competitor War-Room
 * Visualizes Monte Carlo stochastic stress-testing, Value-at-Risk (VaR) organic traffic & pipeline revenue impact,
 * Irish market wargame scenarios, and automated defensive playbooks.
 */

import { useState, useEffect } from 'react';
import {
  Cpu,
  Activity,
  RefreshCw,
  Zap,
  TrendingUp,
  ShieldAlert,
  BarChart2,
  CheckCircle,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Compass,
  DollarSign,
  ArrowDownRight,
  TrendingDown,
  Layers,
} from 'lucide-react';
import { apiGet, apiPost } from '../hooks/useApi';

export interface WarRoomScenario {
  id: string;
  name: string;
  description: string;
  adversary: string;
  affectedRegions: string[];
  intensity: number;
  displacementBias: number;
  volatilityMultiplier: number;
}

export interface KeywordSimulationResult {
  keyword: string;
  category: string;
  baselineRank: number;
  meanSimulatedRank: number;
  medianSimulatedRank: number;
  confidenceInterval95: [number, number];
  dropProbability: number;
  page1DropProbability: number;
  baselineMonthlyTraffic: number;
  simulatedMonthlyTraffic: number;
  trafficAtRisk: number;
  pipelineValueAtRisk: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
}

export interface DefensiveActionItem {
  id: string;
  priority: 'critical' | 'high' | 'medium';
  actionType:
    | 'internal_link_mesh'
    | 'technical_advisor_signoff'
    | 'position_zero_hijack'
    | 'county_landing_refresh'
    | 'faq_schema_boost';
  targetKeyword: string;
  targetPage: string;
  tacticalRecommendation: string;
  estimatedRiskReduction: number;
  status: 'recommended' | 'queued' | 'executed';
}

export interface PortfolioStressReport {
  scenario: WarRoomScenario;
  simulationTimestamp: number;
  iterations: number;
  totalKeywordsEvaluated: number;
  totalTrafficAtRisk: number;
  totalPipelineValueAtRisk: number;
  averageRankDisplacement: number;
  fragileKeywordsCount: number;
  convergenceConfidence: string;
  keywordResults: KeywordSimulationResult[];
  defensivePlaybook: DefensiveActionItem[];
}

interface SimulationData {
  timestamp: number;
  simState: {
    competitorAggression: number;
    cpcVolatility: number;
    backlinkGrowth: number;
    regionalDemandShock: number;
    serpTurbulence: number;
  };
  plan: { type: string; reason: string }[];
  longReward: number;
  simulatedReward: number;
  warRoomResult?: PortfolioStressReport;
}

export default function Simulation() {
  const [loading, setLoading] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string>(
    'activ8_munster_offensive',
  );
  const [iterations, setIterations] = useState<number>(500);
  const [availableScenarios, setAvailableScenarios] = useState<
    WarRoomScenario[]
  >([]);
  const [warRoomResult, setWarRoomResult] =
    useState<PortfolioStressReport | null>(null);

  const [data, setData] = useState<SimulationData>({
    timestamp: Date.now(),
    simState: {
      competitorAggression: 0.65,
      cpcVolatility: -0.12,
      backlinkGrowth: 8,
      regionalDemandShock: 0.18,
      serpTurbulence: 0.05,
    },
    plan: [
      {
        type: 'adjust-keywords',
        reason: 'Long-horizon growth push: high reward trajectory',
      },
      {
        type: 'adjust-regions',
        reason: 'Expand high-performing Irish counties',
      },
    ],
    longReward: 0.88,
    simulatedReward: 0.84,
  });

  // Load scenarios on mount
  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const res = await apiGet<{
          success: boolean;
          scenarios: WarRoomScenario[];
        }>('/api/war-room/scenarios');
        if (res.success && res.scenarios?.length > 0) {
          setAvailableScenarios(res.scenarios);
        }
      } catch (err) {
        console.error('Failed to fetch scenarios:', err);
      }
    };
    fetchScenarios();
  }, []);

  const fetchSimulation = async () => {
    try {
      setLoading(true);
      const res = await apiGet<SimulationData & { ok?: boolean }>(
        '/api/simulation/latest',
      );
      if (res && res.simState) {
        setData(res);
        if (res.warRoomResult) {
          setWarRoomResult(res.warRoomResult);
        }
      }
    } catch (err) {
      console.error('Simulation fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunWargame = async () => {
    try {
      setLoading(true);
      const res = await apiPost<{
        success: boolean;
        result: PortfolioStressReport;
      }>('/api/war-room/simulate', {
        scenarioId: selectedScenario,
        iterations,
      });
      if (res.success && res.result) {
        setWarRoomResult(res.result);
        setData((prev) => ({
          ...prev,
          timestamp: res.result.simulationTimestamp,
          simState: {
            competitorAggression: res.result.scenario.intensity,
            cpcVolatility: -0.12,
            backlinkGrowth: 8,
            regionalDemandShock: 0.18,
            serpTurbulence: Number(
              (res.result.scenario.volatilityMultiplier * 0.05).toFixed(2),
            ),
          },
          plan: res.result.defensivePlaybook.map((a) => ({
            type: a.actionType,
            reason: `${a.tacticalRecommendation} (Target: ${a.targetKeyword})`,
          })),
          simulatedReward: Math.max(
            0.1,
            Number(
              (0.88 - res.result.totalPipelineValueAtRisk / 50000).toFixed(2),
            ),
          ),
        }));
      }
    } catch (err) {
      console.error('Failed to run war-room stress test:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSimulation();
  }, []);

  const { simState, plan, longReward, simulatedReward, timestamp } = data;

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Header & Controls Panel */}
      <div className="glass-card p-6 border border-pink-500/30 rounded-2xl bg-slate-900/90 shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-pink-500/20 text-pink-400 font-bold tracking-wider border border-pink-500/30">
              Phase 14 & Epic War-Room Engine
            </span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold tracking-wider border border-emerald-500/30">
              Monte Carlo Box-Muller (N={iterations})
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Flame size={20} className="text-pink-500 animate-pulse" />
            Competitor War-Room & Monte Carlo Rank Stress-Tester
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Simulate competitor link blasts, SEAI policy adjustments, and Google
            Core Updates across Munster counties. Evaluates Rank Displacement,
            95% Confidence Intervals, and Value at Risk (VaR).
          </p>
        </div>

        {/* Interactive Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex flex-col gap-1 text-left">
            <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">
              Stress Scenario:
            </label>
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-pink-500"
            >
              {availableScenarios.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name}
                </option>
              ))}
              {availableScenarios.length === 0 && (
                <>
                  <option value="activ8_munster_offensive">
                    Activ8 Solar Munster Offensive
                  </option>
                  <option value="seai_policy_overhaul">
                    SEAI 2026 Part L Policy Overhaul
                  </option>
                  <option value="google_core_update">
                    Google Helpful Content Core Update
                  </option>
                  <option value="cpc_bidding_surge">
                    Black-Friday Munster CPC Surge
                  </option>
                </>
              )}
            </select>
          </div>

          <div className="flex flex-col gap-1 text-left">
            <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">
              Iterations (N):
            </label>
            <select
              value={iterations}
              onChange={(e) => setIterations(Number(e.target.value))}
              className="bg-slate-950 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 font-medium focus:outline-none focus:border-pink-500"
            >
              <option value={100}>100 Runs (Rapid)</option>
              <option value={500}>500 Runs (Standard)</option>
              <option value={1000}>1,000 Runs (Rigorous)</option>
            </select>
          </div>

          <button
            onClick={handleRunWargame}
            disabled={loading}
            className="self-end px-5 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Stress-Testing...' : 'Execute Wargame'}
          </button>
        </div>
      </div>

      {/* Value at Risk (VaR) Executive Overview Cards */}
      {warRoomResult && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 glass-card border border-rose-500/30 rounded-2xl bg-gradient-to-br from-rose-950/40 to-slate-900/80 flex flex-col gap-1 shadow-md">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-mono uppercase font-bold text-rose-300">
                Pipeline Value at Risk (VaR)
              </span>
              <DollarSign size={16} className="text-rose-400" />
            </div>
            <span className="text-2xl font-mono font-extrabold text-white">
              €{warRoomResult.totalPipelineValueAtRisk.toLocaleString()}
            </span>
            <span className="text-[10px] text-rose-300/80 font-medium">
              Potential 30-day pipeline deficit (€120 avg enquiry)
            </span>
          </div>

          <div className="p-4 glass-card border border-amber-500/30 rounded-2xl bg-gradient-to-br from-amber-950/40 to-slate-900/80 flex flex-col gap-1 shadow-md">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-mono uppercase font-bold text-amber-300">
                Organic Traffic at Risk
              </span>
              <TrendingDown size={16} className="text-amber-400" />
            </div>
            <span className="text-2xl font-mono font-extrabold text-amber-400">
              -{warRoomResult.totalTrafficAtRisk.toLocaleString()} visits/mo
            </span>
            <span className="text-[10px] text-slate-400">
              Mean rank displacement: +{warRoomResult.averageRankDisplacement}{' '}
              ranks
            </span>
          </div>

          <div className="p-4 glass-card border border-purple-500/30 rounded-2xl bg-gradient-to-br from-purple-950/40 to-slate-900/80 flex flex-col gap-1 shadow-md">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-mono uppercase font-bold text-purple-300">
                Fragile Target Keywords
              </span>
              <AlertTriangle size={16} className="text-purple-400" />
            </div>
            <span className="text-2xl font-mono font-extrabold text-purple-300">
              {warRoomResult.fragileKeywordsCount} Keywords
            </span>
            <span className="text-[10px] text-slate-400">
              Drop Probability &gt; 35% in Munster
            </span>
          </div>

          <div className="p-4 glass-card border border-emerald-500/30 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900/80 flex flex-col gap-1 shadow-md">
            <div className="flex justify-between items-center">
              <span className="text-[11px] font-mono uppercase font-bold text-emerald-300">
                Convergence & Confidence
              </span>
              <ShieldCheck size={16} className="text-emerald-400" />
            </div>
            <span className="text-2xl font-mono font-extrabold text-emerald-400">
              {warRoomResult.convergenceConfidence}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Variance stabilized across {warRoomResult.iterations} iterations
            </span>
          </div>
        </div>
      )}

      {/* Simulated Market Grid Parameters */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 glass-card border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-1">
          <span className="text-[11px] font-bold text-slate-400">
            Competitor Aggression
          </span>
          <span className="text-lg font-mono font-bold text-rose-400">
            {(simState.competitorAggression * 100).toFixed(0)}%
          </span>
          <span className="text-[10px] text-slate-400">
            Simulated SERP pressure
          </span>
        </div>

        <div className="p-4 glass-card border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-1">
          <span className="text-[11px] font-bold text-slate-400">
            CPC Volatility
          </span>
          <span className="text-lg font-mono font-bold text-amber-400">
            {(simState.cpcVolatility * 100).toFixed(0)}%
          </span>
          <span className="text-[10px] text-slate-400">
            Bid price fluctuation
          </span>
        </div>

        <div className="p-4 glass-card border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-1">
          <span className="text-[11px] font-bold text-slate-400">
            Backlink Growth / Shock
          </span>
          <span className="text-lg font-mono font-bold text-emerald-400">
            +{simState.backlinkGrowth} Links
          </span>
          <span className="text-[10px] text-slate-400">
            Authority displacement
          </span>
        </div>

        <div className="p-4 glass-card border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-1">
          <span className="text-[11px] font-bold text-slate-400">
            Demand Shock
          </span>
          <span className="text-lg font-mono font-bold text-sky-400">
            {(simState.regionalDemandShock * 100).toFixed(0)}%
          </span>
          <span className="text-[10px] text-slate-400">
            Munster county shift
          </span>
        </div>

        <div className="p-4 glass-card border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-1 col-span-2 md:col-span-1">
          <span className="text-[11px] font-bold text-slate-400">
            SERP Turbulence
          </span>
          <span className="text-lg font-mono font-bold text-purple-400">
            {(simState.serpTurbulence * 100).toFixed(0)}%
          </span>
          <span className="text-[10px] text-slate-400">
            Algorithm volatility
          </span>
        </div>
      </div>

      {/* Keyword Stress Distribution Table */}
      {warRoomResult &&
        warRoomResult.keywordResults &&
        warRoomResult.keywordResults.length > 0 && (
          <div className="glass-card p-6 border border-white/10 rounded-2xl bg-slate-900/80 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-pink-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Monte Carlo Keyword Stress & Displacement Distribution
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                95% Confidence Interval [p5, p95] Rank Distribution
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[10px] uppercase font-mono text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Keyword</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Baseline Rank</th>
                    <th className="py-2.5 px-3">Simulated Mean</th>
                    <th className="py-2.5 px-3">95% CI Range</th>
                    <th className="py-2.5 px-3">Drop Prob</th>
                    <th className="py-2.5 px-3">Traffic at Risk</th>
                    <th className="py-2.5 px-3">Pipeline at Risk</th>
                    <th className="py-2.5 px-3">Risk Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {warRoomResult.keywordResults.map((kw, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-white">
                        {kw.keyword}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {kw.category}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        #{kw.baselineRank}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-amber-400">
                        #{kw.meanSimulatedRank.toFixed(1)}
                      </td>
                      <td className="py-2.5 px-3 text-sky-400">
                        [#{kw.confidenceInterval95[0]}, #
                        {kw.confidenceInterval95[1]}]
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                            kw.dropProbability >= 50
                              ? 'bg-rose-500/20 text-rose-400'
                              : kw.dropProbability >= 25
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {kw.dropProbability}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-rose-400">
                        -{kw.trafficAtRisk} visits
                      </td>
                      <td className="py-2.5 px-3 font-bold text-rose-300">
                        €{kw.pipelineValueAtRisk.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            kw.riskLevel === 'critical'
                              ? 'bg-rose-600 text-white'
                              : kw.riskLevel === 'high'
                                ? 'bg-amber-600 text-white'
                                : 'bg-sky-700 text-white'
                          }`}
                        >
                          {kw.riskLevel.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      {/* Defensive Playbook & Tactical Countermeasures */}
      {warRoomResult &&
        warRoomResult.defensivePlaybook &&
        warRoomResult.defensivePlaybook.length > 0 && (
          <div className="glass-card p-6 border border-emerald-500/30 rounded-2xl bg-slate-900/80 flex flex-col gap-4 shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <ShieldAlert size={18} className="text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Automated Defensive Playbook: Counter-Adversary Response
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Targeted mitigation against{' '}
                    {warRoomResult.scenario.adversary} across{' '}
                    {warRoomResult.scenario.affectedRegions.join(', ')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30 font-bold">
                  {warRoomResult.defensivePlaybook.length} Preemptive Actions
                  Formulated
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
              {warRoomResult.defensivePlaybook.map((action, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col justify-between gap-2.5 hover:border-emerald-500/40 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                          action.priority === 'critical'
                            ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50'
                            : action.priority === 'high'
                              ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                              : 'bg-sky-500/30 text-sky-300 border border-sky-500/50'
                        }`}
                      >
                        {action.priority}
                      </span>
                      <span className="text-xs font-mono font-bold text-white uppercase">
                        {action.actionType.replace(/_/g, ' ')}
                      </span>
                    </div>
                    {action.targetKeyword && (
                      <span className="text-[10px] font-mono text-slate-400 truncate max-w-[140px]">
                        {action.targetKeyword}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-200 font-medium">
                    {action.tacticalRecommendation}
                  </p>

                  <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-1 text-[11px] text-slate-400">
                    <span className="text-emerald-400/90 font-medium">
                      🛡️ Target Page: {action.targetPage}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Estimated Risk Reduction:{' '}
                      {(action.estimatedRiskReduction * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Real vs Simulated Reward & Fallback Plan Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-6 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Cpu size={18} className="text-pink-400" />
            <h3 className="text-sm font-bold text-white">
              Reward Model Calibration
            </h3>
          </div>

          <div className="flex flex-col gap-3 mt-1">
            <div className="flex justify-between items-center p-3 bg-slate-950/80 border border-white/5 rounded-xl">
              <span className="text-xs text-slate-300 font-medium">
                Real Long-Horizon Reward:
              </span>
              <span className="text-sm font-mono font-bold text-emerald-400">
                {(longReward * 100).toFixed(0)}%
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-slate-950/80 border border-white/5 rounded-xl">
              <span className="text-xs text-slate-300 font-medium">
                Simulated Stress Reward:
              </span>
              <span className="text-sm font-mono font-bold text-pink-400">
                {(simulatedReward * 100).toFixed(0)}%
              </span>
            </div>

            <span className="text-[10px] font-mono text-slate-400">
              Last Simulation Cycle: {new Date(timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>

        <div className="glass-card p-6 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-sky-400" />
            <h3 className="text-sm font-bold text-white">
              Active Countermeasure Pipeline
            </h3>
          </div>

          <div className="flex flex-col gap-2 mt-1 max-h-48 overflow-y-auto pr-1">
            {plan.map((p, i) => (
              <div
                key={i}
                className="p-3 bg-slate-950/80 border border-white/5 rounded-xl flex items-start gap-2.5"
              >
                <CheckCircle
                  size={14}
                  className="text-pink-400 shrink-0 mt-0.5"
                />
                <div>
                  <span className="text-xs font-mono font-bold text-white uppercase">
                    {p.type}
                  </span>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {p.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
