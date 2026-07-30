import React, { useEffect, useState } from "react";
import { 
  Brain, 
  Zap, 
  RefreshCw, 
  TrendingUp, 
  ShieldCheck, 
  Sliders, 
  Database, 
  Sparkles,
  Play,
  Users,
  Award,
  BarChart2,
  CheckCircle2,
  Cpu
} from "lucide-react";
import AgentSquadPanel from "./AgentSquadPanel";
import AgentEvolutionDashboard from "./AgentEvolutionDashboard";

export type AgentId = "heat-pumps" | "solar" | "insulation" | "grants" | "default";

export interface PolicyState {
  agentId: AgentId;
  ctrTrendWeight: number;
  serpVolatilityWeight: number;
  backlinkGapWeight: number;
  pillarWeaknessWeight: number;
  contentVelocityWeight: number;
  learningRate: number;
  decayFactor: number;
  totalEvaluations: number;
  lastUpdated: number;
}

export interface AgentPerformance {
  agentId: AgentId;
  totalEvaluations: number;
  averageReward: number;
  efficiencyScore: number;
  smartnessLevel: string;
  topAction: string;
}

export interface ExperienceRecord {
  id: string;
  agentId: AgentId;
  siteId: string;
  slug: string;
  action: string;
  reward: number;
  beforeMetrics: { ctr: number; serpPosition: number; backlinks: number; impressions: number };
  afterMetrics: { ctr: number; serpPosition: number; backlinks: number; impressions: number };
  timestamp: number;
}

const AGENT_LABELS: Record<AgentId, { label: string; icon: string; focus: string; lr: number }> = {
  "heat-pumps": { label: "Heat Pumps Agent", icon: "🔥", focus: "CTR & High-Intent Conversions", lr: 0.05 },
  "solar": { label: "Solar PV Agent", icon: "☀️", focus: "Backlink Growth & Impressions", lr: 0.06 },
  "insulation": { label: "Insulation Agent", icon: "🧱", focus: "SERP Stability & Long-Tail Volume", lr: 0.04 },
  "grants": { label: "Grants Agent", icon: "💶", focus: "CTR to SEAI Explainer Routes", lr: 0.03 },
  "default": { label: "Fleet Default Agent", icon: "🌐", focus: "Balanced Autopilot Policy", lr: 0.05 }
};

export const RLPolicyDashboard: React.FC = () => {
  const [selectedAgentId, setSelectedAgentId] = useState<AgentId>("heat-pumps");
  const [policies, setPolicies] = useState<Record<AgentId, PolicyState> | null>(null);
  const [performances, setPerformances] = useState<Record<AgentId, AgentPerformance> | null>(null);
  const [experiences, setExperiences] = useState<ExperienceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const fetchRLData = async () => {
    try {
      const res = await fetch(`/api/rl/policy?agentId=${encodeURIComponent(selectedAgentId)}`);
      const data = await res.json();
      if (data.ok) {
        setPolicies(data.policies || null);
        setPerformances(data.performances || null);
        setExperiences(data.memorySummary || []);
      }
    } catch (err) {
      console.error("Failed to fetch Multi-Agent RL Policy:", err);
    }
  };

  useEffect(() => {
    fetchRLData();
    const interval = setInterval(fetchRLData, 10000);
    return () => clearInterval(interval);
  }, [selectedAgentId]);

  const currentPolicy = policies ? policies[selectedAgentId] : null;
  const currentPerf = performances ? performances[selectedAgentId] : null;

  const triggerRewardSim = async (agentTarget: AgentId) => {
    setLoading(true);
    setStatusMsg(`Simulating closed-loop outcome measurement for [Agent: ${agentTarget.toUpperCase()}]...`);
    try {
      let payload = {};
      if (agentTarget === "heat-pumps") {
        payload = {
          siteId: "ecosmarthomes.ie",
          slug: "heat-pump-costs",
          action: "rewrite_article",
          beforeMetrics: { ctr: 0.032, serpPosition: 14, backlinks: 3, impressions: 1200 },
          afterMetrics: { ctr: 0.075, serpPosition: 4, backlinks: 5, impressions: 2400 }
        };
      } else if (agentTarget === "solar") {
        payload = {
          siteId: "future-site-1.ie",
          slug: "solar-pv-grants-ireland",
          action: "link_bait",
          beforeMetrics: { ctr: 0.040, serpPosition: 8, backlinks: 2, impressions: 1500 },
          afterMetrics: { ctr: 0.048, serpPosition: 6, backlinks: 11, impressions: 2500 }
        };
      } else if (agentTarget === "insulation") {
        payload = {
          siteId: "ecosmarthomes.ie",
          slug: "attic-insulation-guide",
          action: "queue_expansion",
          beforeMetrics: { ctr: 0.025, serpPosition: 18, backlinks: 1, impressions: 800 },
          afterMetrics: { ctr: 0.048, serpPosition: 9, backlinks: 2, impressions: 2600 }
        };
      } else {
        payload = {
          siteId: "ecosmarthomes.ie",
          slug: "seai-grant-checker",
          action: "publish",
          beforeMetrics: { ctr: 0.030, serpPosition: 12, backlinks: 2, impressions: 1000 },
          afterMetrics: { ctr: 0.068, serpPosition: 6, backlinks: 3, impressions: 2100 }
        };
      }

      const res = await fetch("/api/rl/evaluate-reward", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.ok) {
        setStatusMsg(`Reward Calculated for [Agent: ${data.agentId}]: ${data.record.reward > 0 ? "+" : ""}${data.record.reward}! Agent policy updated.`);
        fetchRLData();
      }
    } catch (err) {
      setStatusMsg("Failed to simulate reward evaluation.");
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  const triggerExperienceReplay = async () => {
    setLoading(true);
    setStatusMsg(`Executing Segmented Experience Replay for [Agent: ${selectedAgentId.toUpperCase()}]...`);
    try {
      const res = await fetch("/api/rl/experience-replay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: selectedAgentId })
      });
      const data = await res.json();
      if (data.ok) {
        setStatusMsg(`Multi-Agent Experience Replay completed on ${data.replayCount} memories!`);
        fetchRLData();
      }
    } catch (err) {
      setStatusMsg("Failed to run Multi-Agent Experience Replay.");
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-left space-y-6 shadow-xl" id="marl-dashboard-panel">
      {/* Panel Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="text-emerald-400" size={24} />
            <span>Multi-Agent Reinforcement Learning (MARL) Platform</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Segmented RL Agents per Pillar & Domain: tuned learning rates, independent policy factor weights, per-agent experience replay, and smartness telemetry.
          </p>
        </div>

        {/* Agent Selector Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-mono font-bold text-slate-400">Select Active Agent:</label>
          <select
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value as AgentId)}
            className="bg-slate-950 border border-slate-700 text-white font-mono text-xs px-3 py-1.5 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-hidden cursor-pointer"
          >
            <option value="heat-pumps">🔥 Heat Pumps Agent</option>
            <option value="solar">☀️ Solar PV Agent</option>
            <option value="insulation">🧱 Insulation Agent</option>
            <option value="grants">💶 Grants Agent</option>
            <option value="default">🌐 Fleet Default Agent</option>
          </select>
          <button
            onClick={fetchRLData}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-lg text-xs font-mono flex items-center gap-2">
          <Zap size={14} className="animate-pulse text-emerald-400" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Multi-Agent Orchestra Conductor Squad Panel */}
      <AgentSquadPanel performances={performances} onRefresh={fetchRLData} />

      {/* Agent Personality Evolution Dashboard */}
      <AgentEvolutionDashboard performances={performances} onRefresh={fetchRLData} />

      {/* Active Agent Banner */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{AGENT_LABELS[selectedAgentId].icon}</span>
          <div>
            <h3 className="text-sm font-bold text-white font-mono">{AGENT_LABELS[selectedAgentId].label}</h3>
            <p className="text-xs text-slate-400 font-sans">Objective: {AGENT_LABELS[selectedAgentId].focus}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
          <div>Evaluations: <span className="text-emerald-400 font-bold">{currentPolicy?.totalEvaluations ?? 0}</span></div>
          <div>Learning Rate ($\alpha$): <span className="text-cyan-400 font-bold">{currentPolicy?.learningRate ?? 0.05}</span></div>
          <div>Smartness Rank: <span className="text-amber-400 font-bold">{currentPerf?.smartnessLevel ?? "Baseline"}</span></div>
        </div>
      </div>

      {/* Multi-Agent Smartness Leaderboard Cards */}
      <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 font-mono">
          <Award size={16} className="text-amber-400" />
          <span>Pillar Agent Smartness & Efficiency Comparison</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(["heat-pumps", "solar", "insulation", "grants"] as AgentId[]).map((aid) => {
            const perf = performances ? performances[aid] : null;
            const isSelected = selectedAgentId === aid;
            return (
              <div 
                key={aid} 
                onClick={() => setSelectedAgentId(aid)}
                className={`p-3.5 rounded-xl border transition cursor-pointer ${
                  isSelected 
                    ? "bg-slate-900 border-emerald-500 shadow-md" 
                    : "bg-slate-900/60 border-slate-800 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{AGENT_LABELS[aid].icon}</span>
                  <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                    $\alpha$ = {AGENT_LABELS[aid].lr}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white font-mono">{AGENT_LABELS[aid].label}</h4>
                <p className="text-[11px] text-emerald-400 font-bold mt-1">{perf?.smartnessLevel || "Novice Strategy"}</p>
                <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between text-[10px] font-mono text-slate-400">
                  <span>Avg Reward: <strong className={perf && perf.averageReward > 0 ? "text-emerald-400" : "text-slate-300"}>{perf ? (perf.averageReward > 0 ? `+${perf.averageReward}` : perf.averageReward) : "0.0"}</strong></span>
                  <span>Evals: <strong className="text-white">{perf?.totalEvaluations || 0}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Policy Factor Weights & Agent Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Policy Weights (7 cols) */}
        <div className="md:col-span-7 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 font-mono">
              <Sliders size={16} className="text-indigo-400" />
              <span>{AGENT_LABELS[selectedAgentId].label} Policy Weights</span>
            </h3>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {/* CTR Trend Weight */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>CTR Trend Weight</span>
                <span className="text-emerald-400 font-bold">{((currentPolicy?.ctrTrendWeight ?? 0.3) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-400 h-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, ((currentPolicy?.ctrTrendWeight ?? 0.3) / 0.95) * 100)}%` }} 
                />
              </div>
            </div>

            {/* SERP Volatility Weight */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>SERP Volatility Weight</span>
                <span className="text-cyan-400 font-bold">{((currentPolicy?.serpVolatilityWeight ?? 0.25) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-cyan-400 h-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, ((currentPolicy?.serpVolatilityWeight ?? 0.25) / 0.95) * 100)}%` }} 
                />
              </div>
            </div>

            {/* Backlink Gap Weight */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Backlink Gap Weight</span>
                <span className="text-purple-400 font-bold">{((currentPolicy?.backlinkGapWeight ?? 0.20) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-purple-400 h-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, ((currentPolicy?.backlinkGapWeight ?? 0.20) / 0.95) * 100)}%` }} 
                />
              </div>
            </div>

            {/* Content Velocity Weight */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Content Velocity Weight</span>
                <span className="text-amber-400 font-bold">{((currentPolicy?.contentVelocityWeight ?? 0.10) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-400 h-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, ((currentPolicy?.contentVelocityWeight ?? 0.10) / 0.95) * 100)}%` }} 
                />
              </div>
            </div>

            {/* Pillar Weakness Weight */}
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Pillar Weakness Weight</span>
                <span className="text-rose-400 font-bold">{((currentPolicy?.pillarWeaknessWeight ?? 0.15) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-rose-400 h-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, ((currentPolicy?.pillarWeaknessWeight ?? 0.15) / 0.95) * 100)}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Simulators & Replay (5 cols) */}
        <div className="md:col-span-5 bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 font-mono mb-3">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>Segmented Action Simulators</span>
            </h3>

            <p className="text-[11px] text-slate-400 font-sans leading-tight mb-3">
              Trigger feedback cycles for individual Pillar Agents to test dedicated reward functions and per-agent policy adaptation:
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => triggerRewardSim("heat-pumps")}
              disabled={loading}
              className="w-full py-2 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-50 flex items-center justify-between px-3"
            >
              <span>🔥 Sim Heat Pumps (+CTR)</span>
              <span className="font-mono text-[10px] bg-black/30 px-1.5 py-0.5 rounded">$\alpha$ = 0.05</span>
            </button>

            <button
              onClick={() => triggerRewardSim("solar")}
              disabled={loading}
              className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-50 flex items-center justify-between px-3"
            >
              <span>☀️ Sim Solar PV (+Backlinks)</span>
              <span className="font-mono text-[10px] bg-black/30 px-1.5 py-0.5 rounded">$\alpha$ = 0.06</span>
            </button>

            <button
              onClick={() => triggerRewardSim("insulation")}
              disabled={loading}
              className="w-full py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-50 flex items-center justify-between px-3"
            >
              <span>🧱 Sim Insulation (+SERP Volatility)</span>
              <span className="font-mono text-[10px] bg-black/30 px-1.5 py-0.5 rounded">$\alpha$ = 0.04</span>
            </button>

            <button
              onClick={triggerExperienceReplay}
              disabled={loading}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Play size={12} />
              <span>Run Agent Experience Replay</span>
            </button>
          </div>
        </div>
      </div>

      {/* MARL Experience Ledger */}
      <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2 font-mono">
          <Database size={16} className="text-amber-400" />
          <span>MARL Segmented Memory Ledger ({experiences.length} Experiences)</span>
        </h3>

        {experiences.length === 0 ? (
          <p className="text-xs font-mono text-slate-500 italic">No experience records logged for this agent yet. Run a simulation above.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono text-left text-slate-300">
              <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-2">Timestamp</th>
                  <th className="p-2">Agent ID</th>
                  <th className="p-2">Domain / Slug</th>
                  <th className="p-2">Action</th>
                  <th className="p-2">Reward Signal</th>
                  <th className="p-2">CTR Shift</th>
                  <th className="p-2">SERP Shift</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {experiences.slice(0, 8).map((e) => {
                  const ctrShift = ((e.afterMetrics.ctr - e.beforeMetrics.ctr) * 100).toFixed(1);
                  const serpShift = e.beforeMetrics.serpPosition - e.afterMetrics.serpPosition;
                  return (
                    <tr key={e.id} className="hover:bg-slate-900/50 transition">
                      <td className="p-2 text-slate-500">{new Date(e.timestamp).toLocaleTimeString()}</td>
                      <td className="p-2">
                        <span className="bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-indigo-800">
                          {e.agentId || "default"}
                        </span>
                      </td>
                      <td className="p-2 font-semibold text-white">{e.siteId} / <span className="text-slate-400">{e.slug}</span></td>
                      <td className="p-2">
                        <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-emerald-300">
                          {e.action}
                        </span>
                      </td>
                      <td className="p-2">
                        <span className={`font-bold ${e.reward > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                          {e.reward > 0 ? `+${e.reward}` : e.reward}
                        </span>
                      </td>
                      <td className="p-2 text-slate-300">{ctrShift}%</td>
                      <td className="p-2 text-slate-300">{serpShift > 0 ? `+${serpShift} pos` : `${serpShift} pos`}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RLPolicyDashboard;
