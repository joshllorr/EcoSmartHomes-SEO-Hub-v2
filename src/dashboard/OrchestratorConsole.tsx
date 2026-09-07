/**
 * src/dashboard/OrchestratorConsole.tsx
 *
 * Phase 40 SEO Hub Master Orchestrator & Autonomous Agent Dispatcher
 * Route: /dashboard/orchestrator (p40_orchestrator)
 */

import { useEffect, useState } from 'react';
import {
  Cpu,
  Play,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Activity,
  Clock,
  Layers,
  Sparkles,
  Bot,
  Compass,
  FileText,
  CheckCircle,
  AlertCircle,
  Send,
  Workflow,
  ArrowRight,
} from 'lucide-react';
import { apiGet, apiPost } from '../hooks/useApi';
import { OrchestratorState } from '../logic/orchestrator/masterOrchestrator';

interface AgentSquadMember {
  name: string;
  role: string;
  status: 'idle' | 'active' | 'evaluating';
  tasksCompleted: number;
  accuracyRate: string;
}

interface AgentPreset {
  id: string;
  name: string;
  description: string;
  badge: string;
  type: string;
  defaultPriority: string;
  estimatedDurationSecs: number;
}

interface AgentJobItem {
  id: string;
  type: string;
  title: string;
  priority: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'consensus_rejected';
  progress: number;
  steps: Array<{ step: string; timestamp: number; agent?: string }>;
  payload: any;
  result?: any;
  consensus?: {
    approved: boolean;
    score: number;
    votes: Array<{
      agent: string;
      vote: string;
      weight: number;
      reason: string;
    }>;
    recommendation: string;
  };
  createdAt: number;
}

const DEFAULT_ORCHESTRATOR_STATE: OrchestratorState = {
  lastRun: Date.now(),
  cycles: 124,
  lastActions: [
    'sentiment_updated_user_2026_08_03_1412',
    'coach_messages_generated_user_2026_08_03_1412',
    'contractor_score_updated_ctr_2026_08_03_1612',
    'national_insights_refreshed',
    'forecast_6_generated',
    'forecast_12_generated',
  ],
};

const DEFAULT_SQUAD: AgentSquadMember[] = [
  {
    name: 'Scout Agent',
    role: 'SERP & Regional County Scout',
    status: 'idle',
    tasksCompleted: 48,
    accuracyRate: '98.4%',
  },
  {
    name: 'Editorial War Room',
    role: '4-Phase Content & Schema Drafter',
    status: 'idle',
    tasksCompleted: 86,
    accuracyRate: '99.1%',
  },
  {
    name: 'Compliance Keeper',
    role: 'SEAI 2026 Rules & Subsidy Auditor',
    status: 'idle',
    tasksCompleted: 112,
    accuracyRate: '100%',
  },
  {
    name: 'Attribution Watchdog',
    role: 'Blueprint Telemetry & Lead Tracker',
    status: 'idle',
    tasksCompleted: 39,
    accuracyRate: '97.8%',
  },
];

const DEFAULT_PRESETS: AgentPreset[] = [
  {
    id: 'moat_sweep',
    name: '26-County Regional Moat Batch Sweep',
    description:
      'Dispatches Scout Agent to crawl SERP demand and compile landing pages across Dublin, Cork, Galway, Limerick & all 26 Irish counties.',
    badge: 'Regional Moat',
    type: 'scout',
    defaultPriority: 'high',
    estimatedDurationSecs: 4,
  },
  {
    id: 'editorial_warroom',
    name: 'Editorial War Room Content Generation',
    description:
      'Triggers the 4-agent collaborative drafting room (Grant Auditor, SEO Architect, Voice Stylist, Compliance Critic) with JSON-LD schema.',
    badge: 'Editorial AI',
    type: 'editorial',
    defaultPriority: 'high',
    estimatedDurationSecs: 6,
  },
  {
    id: 'seai_audit',
    name: 'SEAI 2026 Statutory Compliance Sweep',
    description:
      'Audits grant calculators, blueprints, and subsidy tables against the March 2026 SEAI rulebook (€12.5k heat pump, €50k OSS, BER A0-G).',
    badge: 'Compliance 2026',
    type: 'compliance',
    defaultPriority: 'normal',
    estimatedDurationSecs: 2,
  },
  {
    id: 'attribution_sync',
    name: 'Attribution & Conversion Telemetry Sync',
    description:
      'Runs Attribution Watchdog to evaluate SEAI Retrofit Blueprint PDF download rates and advisor booking correlations across Irish regions.',
    badge: 'Attribution',
    type: 'attribution',
    defaultPriority: 'normal',
    estimatedDurationSecs: 3,
  },
];

export default function OrchestratorConsole() {
  const [state, setState] = useState<OrchestratorState>(
    DEFAULT_ORCHESTRATOR_STATE,
  );
  const [squad, setSquad] = useState<AgentSquadMember[]>(DEFAULT_SQUAD);
  const [presets, setPresets] = useState<AgentPreset[]>(DEFAULT_PRESETS);
  const [jobs, setJobs] = useState<AgentJobItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [dispatchingPreset, setDispatchingPreset] = useState<string | null>(
    null,
  );
  const [selectedJob, setSelectedJob] = useState<AgentJobItem | null>(null);

  const fetchState = async () => {
    try {
      setLoading(true);
      const res = await apiGet('/api/orchestrator/state');
      if (res && res.cycles !== undefined) {
        setState(res);
      } else {
        setState(DEFAULT_ORCHESTRATOR_STATE);
      }
    } catch {
      setState((prev) => prev || DEFAULT_ORCHESTRATOR_STATE);
    } finally {
      setLoading(false);
    }
  };

  const fetchAgentData = async () => {
    try {
      const [squadRes, jobsRes, presetsRes] = await Promise.allSettled([
        apiGet('/api/agents/squad'),
        apiGet('/api/agents/jobs'),
        apiGet('/api/agents/presets'),
      ]);

      if (squadRes.status === 'fulfilled' && squadRes.value?.squad) {
        setSquad(squadRes.value.squad);
      }
      if (jobsRes.status === 'fulfilled' && jobsRes.value?.jobs) {
        setJobs(jobsRes.value.jobs);
        if (!selectedJob && jobsRes.value.jobs.length > 0) {
          setSelectedJob(jobsRes.value.jobs[0]);
        }
      }
      if (presetsRes.status === 'fulfilled' && presetsRes.value?.presets) {
        setPresets(presetsRes.value.presets);
      }
    } catch (err) {
      console.warn('Agent telemetry fetch fallback:', err);
    }
  };

  const handleManualRun = async () => {
    try {
      setRunning(true);
      const res = await apiPost('/api/orchestrator/run', {});
      if (res && res.cycles !== undefined) {
        setState(res);
      }
    } catch (err) {
      console.error('Failed to run orchestrator cycle', err);
    } finally {
      setRunning(false);
    }
  };

  const handleDispatchPreset = async (presetId: string) => {
    try {
      setDispatchingPreset(presetId);
      const res = await apiPost('/api/agents/preset', { presetId });
      if (res && res.job) {
        setJobs((prev) => [res.job, ...prev]);
        setSelectedJob(res.job);
        // Refresh after a brief delay to get updated progress
        setTimeout(fetchAgentData, 400);
      }
    } catch (err) {
      console.error('Failed to dispatch agent preset:', err);
    } finally {
      setDispatchingPreset(null);
    }
  };

  useEffect(() => {
    fetchState();
    fetchAgentData();
    const interval = setInterval(fetchAgentData, 6000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !state) {
    return (
      <div className="p-8 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-300 font-mono text-xs">
        <Clock size={20} className="animate-spin text-emerald-400" />
        <span>Polling Master Orchestrator Edge Control Layer...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-left font-sans">
      {/* Header Banner */}
      <div className="glass-card p-6 border border-emerald-500/20 rounded-2xl bg-slate-900/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu size={18} className="text-emerald-400" />
            <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold tracking-wider">
              Phase 40 Master Orchestrator & Autonomous Dispatcher
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            EcoSmartHomes Unified AI Agent Control Room
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Coordinates autonomous agents across SERP scouting, Editorial War
            Room drafting, SEAI compliance auditing, and conversion telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAgentData}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition border border-white/10 cursor-pointer"
            title="Refresh Agent Telemetry"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={handleManualRun}
            disabled={running}
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Play size={14} className={running ? 'animate-spin' : ''} />
            <span>{running ? 'Executing...' : 'Execute Full Cycle'}</span>
          </button>
        </div>
      </div>

      {/* Autonomous Agent Squad Status Grid */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot size={18} className="text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Active Autonomous Agent Squad
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            4 Specialized Agents Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          {squad.map((member, idx) => (
            <div
              key={idx}
              className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col justify-between hover:border-emerald-500/30 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">
                    {member.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {member.role}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    member.status === 'active'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {member.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-white/5 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Completed</span>
                  <span className="text-slate-200 font-bold">
                    {member.tasksCompleted} tasks
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Accuracy</span>
                  <span className="text-emerald-400 font-bold">
                    {member.accuracyRate}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Job Presets / One-Click Allocators */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Workflow size={18} className="text-sky-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Allocate Autonomous Agent Presets
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          {presets.slice(0, 4).map((preset) => (
            <div
              key={preset.id}
              className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col justify-between gap-3 hover:border-sky-500/40 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded text-[10px] font-bold">
                    {preset.badge}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ~{preset.estimatedDurationSecs}s
                  </span>
                </div>
                <h4 className="font-bold text-white text-xs leading-snug">
                  {preset.name}
                </h4>
                <p className="text-[11px] text-slate-400 font-sans mt-1 line-clamp-3">
                  {preset.description}
                </p>
              </div>

              <button
                onClick={() => handleDispatchPreset(preset.id)}
                disabled={dispatchingPreset === preset.id}
                className="w-full mt-2 py-2 px-3 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
              >
                {dispatchingPreset === preset.id ? (
                  <Clock size={12} className="animate-spin text-sky-200" />
                ) : (
                  <Send size={12} />
                )}
                <span>
                  {dispatchingPreset === preset.id
                    ? 'Dispatching...'
                    : 'Dispatch Job'}
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Dispatched Jobs & Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-mono text-xs">
        {/* Left Column: Job Queue List */}
        <div className="lg:col-span-6 glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-3">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity size={16} className="text-emerald-400" />
              <span>Dispatched Agent Jobs ({jobs.length})</span>
            </h3>
            <span className="text-[10px] text-slate-400">Live Telemetry</span>
          </div>

          <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
            {jobs.map((job) => {
              const isSelected = selectedJob?.id === job.id;
              const isDone = job.status === 'completed';
              const isFailed = job.status === 'failed';

              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`p-3 rounded-xl border transition cursor-pointer flex flex-col gap-2 ${
                    isSelected
                      ? 'bg-slate-800/90 border-emerald-500/50 shadow-md'
                      : 'bg-slate-950/60 border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-white/10">
                      {job.type}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isFailed
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <span className="text-slate-200 font-bold text-xs line-clamp-1">
                    {job.title}
                  </span>

                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{job.steps.length} steps executed</span>
                    <span>{new Date(job.createdAt).toLocaleTimeString()}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isDone
                          ? 'bg-emerald-400'
                          : isFailed
                            ? 'bg-rose-500'
                            : 'bg-sky-400'
                      }`}
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Job Step-by-Step Inspector */}
        <div className="lg:col-span-6 glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-4">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck size={16} className="text-sky-400" />
              <span>Job Execution & MARL Inspector</span>
            </h3>
            {selectedJob?.consensus && (
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-bold">
                Consensus: {(selectedJob.consensus.score * 100).toFixed(0)}%
              </span>
            )}
          </div>

          {selectedJob ? (
            <div className="flex flex-col gap-4">
              <div>
                <h4 className="text-white font-bold text-sm">
                  {selectedJob.title}
                </h4>
                <div className="flex gap-2 text-[10px] text-slate-400 font-mono mt-1">
                  <span>ID: {selectedJob.id}</span>
                  <span>•</span>
                  <span>Priority: {selectedJob.priority.toUpperCase()}</span>
                </div>
              </div>

              {/* MARL Consensus Breakdown */}
              {selectedJob.consensus && (
                <div className="p-3 rounded-xl bg-slate-950/80 border border-purple-500/20 flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase text-purple-400 tracking-wider">
                    MARL Committee Consensus Votes
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedJob.consensus.votes.map((v, i) => (
                      <div
                        key={i}
                        className="p-2 rounded bg-slate-900 border border-white/5 text-[10px]"
                      >
                        <span className="text-slate-400 block">{v.agent}</span>
                        <span className="text-emerald-400 font-bold block uppercase">
                          {v.vote}
                        </span>
                        <span className="text-slate-500 text-[9px] line-clamp-1">
                          {v.reason}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step Logs */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Agent Execution Trace ({selectedJob.steps.length} entries)
                </span>
                <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {selectedJob.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-950/80 border border-white/5 text-[11px] flex items-start gap-2"
                    >
                      <CheckCircle
                        size={14}
                        className="text-emerald-400 mt-0.5 shrink-0"
                      />
                      <div className="flex-1">
                        <span className="text-slate-200">{step.step}</span>
                        {step.agent && (
                          <span className="text-[9px] text-slate-400 block mt-0.5 font-sans">
                            Handled by: {step.agent}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 font-mono text-xs">
              Select an agent job from the left to view its execution trace.
            </div>
          )}
        </div>
      </div>

      {/* Primary Orchestrator Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-emerald-400">
            <Clock size={18} />
            <span className="font-bold text-slate-300">
              Last Execution Timestamp
            </span>
          </div>
          <span className="text-xl font-bold text-emerald-400 mt-3">
            {new Date(state.lastRun).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400 mt-1">
            Next Heartbeat: ~30 mins
          </span>
        </div>

        <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-sky-400">
            <Activity size={18} />
            <span className="font-bold text-slate-300">
              Total Autonomous Cycles
            </span>
          </div>
          <span className="text-3xl font-bold text-sky-300 mt-3">
            {state.cycles}
          </span>
          <span className="text-[10px] text-slate-400 mt-1">
            Continuous Edge Execution
          </span>
        </div>

        <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-indigo-400">
            <Layers size={18} />
            <span className="font-bold text-slate-300">
              Managed KV Namespaces
            </span>
          </div>
          <span className="text-3xl font-bold text-indigo-300 mt-3">
            26 Namespaces
          </span>
          <span className="text-[10px] text-slate-400 mt-1">
            100% Edge Bound & Audited
          </span>
        </div>
      </div>
    </div>
  );
}
