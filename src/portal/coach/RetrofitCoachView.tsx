/**
 * src/portal/coach/RetrofitCoachView.tsx
 *
 * Phase 39 Homeowner Portal AI Retrofit Coach Component
 * - LLM-powered Site Visit Preparation for SEAI Technical Assessments & Pre-Install Surveys
 * - Irish Building Regulations Part L & NZEB Standards Compliance Verification
 * - Proactive Behavioral Guidance, Stress Alleviation, and Interactive Consultation
 * Route: /portal/coach
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Heart,
  PartyPopper,
  CheckCircle2,
  Clock,
  ClipboardCheck,
  FileText,
  HelpCircle,
  Home,
  CheckSquare,
  Square,
  Send,
  Zap,
  Gauge,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import { apiGet, apiPost } from '../../hooks/useApi';
import {
  CoachMessage,
  SiteVisitType,
  SiteVisitPrepPlan,
  NZEBComplianceReport,
  NZEBPropertyProfile,
} from '../../logic/coach/retrofitCoachEngine';

interface RetrofitCoachViewProps {
  userId?: string;
}

export default function RetrofitCoachView({
  userId = 'user_2026_08_03_1412',
}: RetrofitCoachViewProps) {
  // Navigation
  const [activeCoachTab, setActiveCoachTab] = useState<
    'site_visit' | 'nzeb_audit' | 'chat' | 'proactive'
  >('site_visit');

  // Proactive Messages State
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [refreshingGuidance, setRefreshingGuidance] = useState(false);

  // Site Visit Preparation State
  const [selectedVisitType, setSelectedVisitType] =
    useState<SiteVisitType>('technical_assessment');
  const [siteVisitPlan, setSiteVisitPlan] = useState<SiteVisitPrepPlan | null>(
    null,
  );
  const [loadingSiteVisit, setLoadingSiteVisit] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>(
    {},
  );

  // NZEB Compliance State
  const [nzebReport, setNzebReport] = useState<NZEBComplianceReport | null>(
    null,
  );
  const [loadingNzeb, setLoadingNzeb] = useState(false);
  const [propertyProfile, setPropertyProfile] = useState<NZEBPropertyProfile>({
    propertyType: '3-Bed Semi-Detached',
    yearBuilt: 1988,
    currentBER: 'D1',
    targetBER: 'A2 (NZEB Standard)',
    roofUValue: 0.14,
    wallUValue: 0.18,
    windowUValue: 1.1,
    airtightnessQ50: 3.8,
    heatingSystem: 'Air-to-Water Heat Pump',
    heatPumpCOP: 3.6,
    solarPVKwp: 3.2,
    ventilationType: 'Demand Controlled Ventilation (DCV)',
  });

  // Interactive Chat State
  const [chatQuery, setChatQuery] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<
    Array<{
      role: 'user' | 'coach';
      text: string;
      tips?: string[];
      insights?: string[];
      time: number;
    }>
  >([
    {
      role: 'coach',
      text: 'Hello! I am your AI Retrofit Coach & NZEB Standards Specialist. How can I help you prepare for your technical assessment site visit, verify Heat Loss Indicators (HLI), or ensure your property meets Irish Part L NZEB thresholds?',
      tips: [
        'Clear attic hatch for insulation depth measurement',
        'Have 11-digit MPRN electricity bill ready',
        'Ask assessor for calculated HLI (target <= 2.0 W/K/m2)',
      ],
      insights: [
        'Part L NZEB requires primary energy <= 45 kWh/m2/yr',
        'Heat pump grants require radiator flow temp <= 45°C compatibility',
      ],
      time: Date.now() - 60000,
    },
  ]);

  // Initial Data Fetching
  const fetchMessages = async () => {
    try {
      setLoadingMessages(true);
      const res = await apiGet(`/api/coach/messages?user_id=${userId}`);
      if (res && res.bundle && res.bundle.messages) {
        setMessages(res.bundle.messages);
      } else if (res && res.messages) {
        setMessages(res.messages);
      }
    } catch (err) {
      console.warn('Failed to load coach messages', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchSiteVisitPlan = async (visitType: SiteVisitType) => {
    try {
      setLoadingSiteVisit(true);
      const res = await apiPost('/api/coach/site-visit-prep', {
        user_id: userId,
        visitType,
        propertyContext: propertyProfile,
      });
      if (res && res.plan) {
        setSiteVisitPlan(res.plan);
        const taskMap: Record<string, boolean> = {};
        res.plan.checklist.forEach((item: any) => {
          taskMap[item.id] = item.completed;
        });
        setCompletedTasks(taskMap);
      }
    } catch (err) {
      console.warn('Failed to load site visit plan', err);
    } finally {
      setLoadingSiteVisit(false);
    }
  };

  const fetchNzebCompliance = async (profileData = propertyProfile) => {
    try {
      setLoadingNzeb(true);
      const res = await apiPost('/api/coach/nzeb-compliance', {
        user_id: userId,
        propertyData: profileData,
      });
      if (res && res.report) {
        setNzebReport(res.report);
      }
    } catch (err) {
      console.warn('Failed to load NZEB compliance report', err);
    } finally {
      setLoadingNzeb(false);
    }
  };

  const handleRefreshProactive = async () => {
    try {
      setRefreshingGuidance(true);
      const res = await apiPost('/api/coach/generate', { user_id: userId });
      if (res && res.bundle && res.bundle.messages) {
        setMessages(res.bundle.messages);
      }
    } catch (err) {
      console.warn('Failed to refresh coach bundle', err);
    } finally {
      setRefreshingGuidance(false);
    }
  };

  const handleSendChat = async (queryText?: string) => {
    const textToSend = queryText || chatQuery;
    if (!textToSend.trim() || chatLoading) return;

    const userEntry = {
      role: 'user' as const,
      text: textToSend,
      time: Date.now(),
    };

    setChatHistory((prev) => [...prev, userEntry]);
    setChatQuery('');
    setChatLoading(true);

    try {
      const res = await apiPost('/api/coach/consult', {
        user_id: userId,
        query: textToSend,
        context: {
          visitType: selectedVisitType,
          propertyProfile,
        },
      });

      if (res && res.consultation) {
        setChatHistory((prev) => [
          ...prev,
          {
            role: 'coach',
            text: res.consultation.answer,
            tips: res.consultation.siteVisitTips,
            insights: res.consultation.nzebComplianceInsights,
            time: Date.now(),
          },
        ]);
      }
    } catch (err) {
      console.warn('Chat consultation failed', err);
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'coach',
          text: 'For your site visit, prioritize clearing your attic hatch and ensuring your electricity meter is accessible. To meet NZEB (A2) compliance under Irish Part L, target an air permeability under 5 m³/(hr·m²) and a primary energy demand under 45 kWh/m²/yr.',
          tips: ['Ensure attic hatch is unobstructed', 'Have MPRN ready'],
          insights: ['Part L NZEB mandates RER >= 20%'],
          time: Date.now(),
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => {
      const updated = { ...prev, [taskId]: !prev[taskId] };
      if (siteVisitPlan) {
        const total = siteVisitPlan.checklist.length;
        const done = Object.values(updated).filter(Boolean).length;
        setSiteVisitPlan({
          ...siteVisitPlan,
          readinessScore: Math.round((done / total) * 100),
        });
      }
      return updated;
    });
  };

  useEffect(() => {
    fetchMessages();
    fetchSiteVisitPlan(selectedVisitType);
    fetchNzebCompliance(propertyProfile);
  }, [userId]);

  const toneStyles: Record<string, string> = {
    friendly: 'bg-sky-500/10 border-sky-500/30 text-sky-300',
    celebratory: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    reassuring: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
    urgent: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
  };

  const toneIcons: Record<string, any> = {
    friendly: Sparkles,
    celebratory: PartyPopper,
    reassuring: Heart,
    urgent: ShieldCheck,
  };

  return (
    <div className="flex flex-col gap-5 text-left font-sans max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 bg-slate-900/90 border border-emerald-500/20 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-emerald-400" />
            <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold tracking-wider">
              Phase 39 AI Retrofit Coach Engine
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1">
            Site Visit Preparation & NZEB Standards Coach
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            LLM-driven preparation for technical assessments, SEAI grant audits, and Irish Part L NZEB compliance.
          </p>
        </div>

        {/* Global Action */}
        <button
          onClick={handleRefreshProactive}
          disabled={refreshingGuidance}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg cursor-pointer shrink-0"
        >
          <RefreshCw size={14} className={refreshingGuidance ? 'animate-spin' : ''} />
          <span>Refresh AI Guidance</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-white/10 font-mono text-xs">
        <button
          onClick={() => {
            setActiveCoachTab('site_visit');
            fetchSiteVisitPlan(selectedVisitType);
          }}
          className={`px-3 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeCoachTab === 'site_visit'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ClipboardCheck size={16} />
          <span>Site Visit Prep</span>
        </button>

        <button
          onClick={() => {
            setActiveCoachTab('nzeb_audit');
            fetchNzebCompliance(propertyProfile);
          }}
          className={`px-3 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeCoachTab === 'nzeb_audit'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Gauge size={16} />
          <span>NZEB Compliance</span>
        </button>

        <button
          onClick={() => setActiveCoachTab('chat')}
          className={`px-3 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeCoachTab === 'chat'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles size={16} />
          <span>Ask AI Coach</span>
        </button>

        <button
          onClick={() => setActiveCoachTab('proactive')}
          className={`px-3 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeCoachTab === 'proactive'
              ? 'bg-emerald-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Zap size={16} />
          <span>Proactive Stream</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SITE VISIT PREPARATION STUDIO                                      */}
      {/* ========================================================================= */}
      {activeCoachTab === 'site_visit' && (
        <div className="flex flex-col gap-5">
          {/* Visit Type Selector Bar */}
          <div className="p-5 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase font-mono text-slate-400 font-bold tracking-wider">
                Select Upcoming Site Visit Type
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'technical_assessment', label: 'SEAI Technical Assessment' },
                  { id: 'heat_pump_sizing', label: 'Heat Pump & Radiator Sizing' },
                  { id: 'airtightness_test', label: 'Blower Door Air Test' },
                  { id: 'pre_install_survey', label: 'Contractor Pre-Survey' },
                  { id: 'post_install_ber', label: 'Post-Works BER Sign-Off' },
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      setSelectedVisitType(v.id as SiteVisitType);
                      fetchSiteVisitPlan(v.id as SiteVisitType);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition cursor-pointer ${
                      selectedVisitType === v.id
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-950 border border-white/10 text-slate-300 hover:border-emerald-500/50'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Readiness Meter */}
            {siteVisitPlan && (
              <div className="bg-slate-950/80 border border-white/10 p-3.5 rounded-xl flex items-center gap-4 shrink-0">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    Readiness Score
                  </span>
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    {siteVisitPlan.readinessScore}%
                  </span>
                </div>
                <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${siteVisitPlan.readinessScore}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {loadingSiteVisit ? (
            <div className="p-12 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-300 font-mono text-xs">
              <Clock size={24} className="animate-spin text-emerald-400" />
              <span>Generating LLM Site Visit Preparation Protocol...</span>
            </div>
          ) : siteVisitPlan ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {/* Left Column: Interactive Tasks & Access Clearance */}
              <div className="lg:col-span-2 flex flex-col gap-5">
                {/* AI Executive Guidance Note */}
                <div className="p-5 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl">
                  <div className="flex items-center gap-2 text-emerald-400 mb-2">
                    <Sparkles size={16} />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider">
                      AI Coach Guidance Note ({siteVisitPlan.inspectorRole})
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-200 whitespace-pre-line font-sans">
                    {siteVisitPlan.llmGuidanceNotes}
                  </p>
                </div>

                {/* Site Visit Task Checklist */}
                <div className="p-5 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      Preparation Checklist ({siteVisitPlan.checklist.length} items)
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">
                      Click to mark completed
                    </span>
                  </div>

                  <div className="flex flex-col gap-2.5 mt-1">
                    {siteVisitPlan.checklist.map((task) => {
                      const isDone = !!completedTasks[task.id];
                      return (
                        <div
                          key={task.id}
                          onClick={() => toggleTask(task.id)}
                          className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                            isDone
                              ? 'bg-emerald-500/5 border-emerald-500/30 text-slate-200'
                              : 'bg-slate-950/60 border-white/5 text-slate-300 hover:border-white/20'
                          }`}
                        >
                          <button className="mt-0.5 text-emerald-400 shrink-0">
                            {isDone ? (
                              <CheckSquare size={18} className="text-emerald-400" />
                            ) : (
                              <Square size={18} className="text-slate-500" />
                            )}
                          </button>
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs font-bold ${
                                  isDone ? 'line-through text-slate-400' : 'text-white'
                                }`}
                              >
                                {task.task}
                              </span>
                              {task.requiredForNZEB && (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                                  NZEB Mandatory
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 leading-snug">
                              {task.tip}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Crucial Questions to Ask */}
                <div className="p-5 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <HelpCircle size={16} className="text-indigo-400" />
                    Essential Questions for Your Surveyor / Assessor
                  </h3>
                  <div className="flex flex-col gap-3 mt-1">
                    {siteVisitPlan.crucialQuestionsToAsk.map((q, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-slate-950/80 border border-white/5 rounded-xl flex flex-col gap-1.5"
                      >
                        <span className="text-xs font-bold text-indigo-200">
                          &ldquo;{q.question}&rdquo;
                        </span>
                        <p className="text-[11px] text-slate-400 font-mono">
                          <strong className="text-slate-300">Why ask:</strong> {q.reason}
                        </p>
                        <p className="text-[11px] text-emerald-400/90 font-mono">
                          <strong className="text-emerald-300">Expected answer:</strong>{' '}
                          {q.expectedAnswerHint}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Required Documents & Access Clearance */}
              <div className="flex flex-col gap-5">
                {/* Required Documents Packet */}
                <div className="p-5 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText size={16} className="text-sky-400" />
                    Mandatory Document Packet
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    {siteVisitPlan.requiredDocuments.map((doc, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-950/80 border border-white/5 rounded-xl flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200">
                            {doc.name}
                          </span>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                              doc.ready
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {doc.ready ? 'Ready' : 'Gather'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">{doc.description}</p>
                        <span className="text-[9px] font-mono text-slate-500">
                          Source: {doc.whereToFind}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Room-by-Room Access Tracker */}
                <div className="p-5 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col gap-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Home size={16} className="text-amber-400" />
                    Physical Access Clearance
                  </h3>
                  <div className="flex flex-col gap-2.5">
                    {siteVisitPlan.accessAreas.map((area, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-950/80 border border-white/5 rounded-xl flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{area.area}</span>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                              area.status === 'accessible'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {area.status === 'accessible' ? 'Clear' : 'Check Access'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-snug">
                          {area.instructions}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: NZEB STANDARDS COMPLIANCE EVALUATOR                                */}
      {/* ========================================================================= */}
      {activeCoachTab === 'nzeb_audit' && (
        <div className="flex flex-col gap-5">
          {/* Interactive Property & Metric Config */}
          <div className="p-5 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Gauge size={16} className="text-emerald-400" />
                  Building Envelope & Renewable Energy Parameters
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Irish Part L (Dwellings) NZEB Thresholds: EPC ≤ 0.30, Primary Energy ≤ 45 kWh/m²/yr, RER ≥ 20%.
                </p>
              </div>
              <button
                onClick={() => fetchNzebCompliance(propertyProfile)}
                disabled={loadingNzeb}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={12} className={loadingNzeb ? 'animate-spin' : ''} />
                <span>Re-Audit Compliance</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
              <div className="p-2.5 bg-slate-950 border border-white/10 rounded-xl flex flex-col gap-1">
                <span className="text-[10px] text-slate-400">Roof U-Value</span>
                <input
                  type="number"
                  step="0.01"
                  value={propertyProfile.roofUValue}
                  onChange={(e) =>
                    setPropertyProfile({
                      ...propertyProfile,
                      roofUValue: parseFloat(e.target.value) || 0.14,
                    })
                  }
                  className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-white font-bold"
                />
                <span className="text-[9px] text-emerald-400">Target ≤ 0.16</span>
              </div>

              <div className="p-2.5 bg-slate-950 border border-white/10 rounded-xl flex flex-col gap-1">
                <span className="text-[10px] text-slate-400">Wall U-Value</span>
                <input
                  type="number"
                  step="0.01"
                  value={propertyProfile.wallUValue}
                  onChange={(e) =>
                    setPropertyProfile({
                      ...propertyProfile,
                      wallUValue: parseFloat(e.target.value) || 0.18,
                    })
                  }
                  className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-white font-bold"
                />
                <span className="text-[9px] text-emerald-400">Target ≤ 0.18</span>
              </div>

              <div className="p-2.5 bg-slate-950 border border-white/10 rounded-xl flex flex-col gap-1">
                <span className="text-[10px] text-slate-400">Window U-Value</span>
                <input
                  type="number"
                  step="0.1"
                  value={propertyProfile.windowUValue}
                  onChange={(e) =>
                    setPropertyProfile({
                      ...propertyProfile,
                      windowUValue: parseFloat(e.target.value) || 1.1,
                    })
                  }
                  className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-white font-bold"
                />
                <span className="text-[9px] text-emerald-400">Target ≤ 1.20</span>
              </div>

              <div className="p-2.5 bg-slate-950 border border-white/10 rounded-xl flex flex-col gap-1">
                <span className="text-[10px] text-slate-400">Airtightness (q50)</span>
                <input
                  type="number"
                  step="0.1"
                  value={propertyProfile.airtightnessQ50}
                  onChange={(e) =>
                    setPropertyProfile({
                      ...propertyProfile,
                      airtightnessQ50: parseFloat(e.target.value) || 3.8,
                    })
                  }
                  className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-white font-bold"
                />
                <span className="text-[9px] text-emerald-400">Target ≤ 5.0</span>
              </div>

              <div className="p-2.5 bg-slate-950 border border-white/10 rounded-xl flex flex-col gap-1">
                <span className="text-[10px] text-slate-400">Heat Pump COP</span>
                <input
                  type="number"
                  step="0.1"
                  value={propertyProfile.heatPumpCOP}
                  onChange={(e) =>
                    setPropertyProfile({
                      ...propertyProfile,
                      heatPumpCOP: parseFloat(e.target.value) || 3.6,
                    })
                  }
                  className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-white font-bold"
                />
                <span className="text-[9px] text-emerald-400">Target ≥ 3.2</span>
              </div>

              <div className="p-2.5 bg-slate-950 border border-white/10 rounded-xl flex flex-col gap-1">
                <span className="text-[10px] text-slate-400">Solar PV (kWp)</span>
                <input
                  type="number"
                  step="0.5"
                  value={propertyProfile.solarPVKwp}
                  onChange={(e) =>
                    setPropertyProfile({
                      ...propertyProfile,
                      solarPVKwp: parseFloat(e.target.value) || 3.2,
                    })
                  }
                  className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-white font-bold"
                />
                <span className="text-[9px] text-emerald-400">Target ≥ 2.5</span>
              </div>
            </div>
          </div>

          {loadingNzeb ? (
            <div className="p-12 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-300 font-mono text-xs">
              <Clock size={24} className="animate-spin text-emerald-400" />
              <span>Auditing NZEB Part L Compliance Metrics...</span>
            </div>
          ) : nzebReport ? (
            <div className="flex flex-col gap-5">
              {/* Compliance Summary Card */}
              <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-bold">
                      {nzebReport.targetBER}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Evaluated against Irish TGD Part L 2019
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mt-1">
                    Overall Compliance Index: {nzebReport.complianceScore}/100
                  </h3>
                  <p className="text-xs text-slate-300 font-sans max-w-2xl mt-1 leading-relaxed">
                    {nzebReport.llmExecutiveSummary}
                  </p>
                </div>

                <div className="flex items-center gap-4 font-mono text-center shrink-0">
                  <div className="p-3 bg-slate-950/80 border border-white/10 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Primary Energy</span>
                    <span className="text-lg font-bold text-emerald-400">
                      {nzebReport.estimatedPrimaryEnergyKWhM2}
                    </span>
                    <span className="text-[9px] text-slate-500 block">kWh/m²/yr</span>
                  </div>
                  <div className="p-3 bg-slate-950/80 border border-white/10 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">EPC</span>
                    <span className="text-lg font-bold text-emerald-400">
                      {nzebReport.epc}
                    </span>
                    <span className="text-[9px] text-slate-500 block">Limit ≤ 0.30</span>
                  </div>
                  <div className="p-3 bg-slate-950/80 border border-white/10 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">RER</span>
                    <span className="text-lg font-bold text-emerald-400">
                      {nzebReport.rerPercentage}%
                    </span>
                    <span className="text-[9px] text-slate-500 block">Min ≥ 20%</span>
                  </div>
                </div>
              </div>

              {/* 5 NZEB Pillars Evaluation */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {nzebReport.pillars.map((pillar, idx) => {
                  const isPass = pillar.status === 'pass';
                  const isWarn = pillar.status === 'warning';
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${
                        isPass
                          ? 'bg-slate-900/90 border-emerald-500/30'
                          : isWarn
                            ? 'bg-slate-900/90 border-amber-500/30'
                            : 'bg-slate-900/90 border-rose-500/30'
                      }`}
                    >
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">
                            {pillar.pillar}
                          </span>
                          <span
                            className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                              isPass
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : isWarn
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {pillar.status} ({pillar.complianceScore}%)
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-300">
                          Current: <strong>{pillar.currentValue}</strong>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          Target: {pillar.target}
                        </div>
                        <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
                          {pillar.recommendation}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-slate-500">
                        <span>{pillar.nzeMandateReference}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Remedial Actions Plan */}
              {nzebReport.remedialActions.length > 0 && (
                <div className="p-5 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col gap-2.5">
                  <h4 className="text-xs font-bold text-white uppercase font-mono flex items-center gap-2">
                    <AlertCircle size={14} className="text-amber-400" />
                    Recommended Remedial Actions for Part L Approval
                  </h4>
                  <ul className="flex flex-col gap-1.5 text-xs text-slate-300 list-disc list-inside">
                    {nzebReport.remedialActions.map((action, i) => (
                      <li key={i} className="leading-relaxed">
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: INTERACTIVE ASK AI RETROFIT COACH                                  */}
      {/* ========================================================================= */}
      {activeCoachTab === 'chat' && (
        <div className="p-5 bg-slate-900/90 border border-white/10 rounded-2xl flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles size={16} className="text-emerald-400" />
              Live Consultation with AI Retrofit Coach
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Ask about site visit logistics, required SEAI documents, heat pump radiator sizing, or NZEB regulations.
            </p>
          </div>

          {/* Quick Prompt Starters */}
          <div className="flex flex-wrap gap-2">
            {[
              'What should I prepare for my heat pump site visit?',
              'How is my Heat Loss Indicator (HLI) calculated for the grant?',
              'What are the mandatory NZEB U-values for walls and roof?',
              'Do I need mechanical ventilation (DCV) for my A2 retrofit?',
              'What questions should I ask my BER technical assessor?',
            ].map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendChat(q)}
                className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-white/10 hover:border-emerald-500/40 rounded-lg text-[11px] font-mono text-slate-300 transition cursor-pointer text-left"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div className="flex flex-col gap-3.5 max-h-[420px] overflow-y-auto p-3 bg-slate-950/80 rounded-xl border border-white/5">
            {chatHistory.map((entry, idx) => (
              <div
                key={idx}
                className={`flex flex-col gap-1 p-3.5 rounded-xl text-xs ${
                  entry.role === 'user'
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 ml-auto max-w-[85%]'
                    : 'bg-slate-900 border border-white/10 text-slate-200 mr-auto max-w-[90%]'
                }`}
              >
                <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
                  <span className="font-bold uppercase">
                    {entry.role === 'user' ? 'You (Homeowner)' : 'AI Retrofit Coach'}
                  </span>
                  <span>{new Date(entry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="leading-relaxed whitespace-pre-line font-sans mt-0.5">
                  {entry.text}
                </p>

                {/* Structured Tips */}
                {entry.tips && entry.tips.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/10 flex flex-col gap-1">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                      <Lightbulb size={12} /> Key Preparation Tips:
                    </span>
                    <ul className="list-disc list-inside text-[11px] text-slate-300">
                      {entry.tips.map((t, i) => (
                        <li key={i}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}

            {chatLoading && (
              <div className="flex items-center gap-2 p-3 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-400 font-mono mr-auto">
                <Clock size={14} className="animate-spin text-emerald-400" />
                <span>AI Retrofit Coach is synthesizing technical advice...</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={chatQuery}
              onChange={(e) => setChatQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendChat();
              }}
              placeholder="Ask anything about site visits, SEAI grants, HLI <= 2.0, or Part L NZEB..."
              className="flex-1 px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={() => handleSendChat()}
              disabled={chatLoading || !chatQuery.trim()}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-mono text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Send size={14} />
              <span>Ask</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: PROACTIVE COACHING STREAM & ALERTS                                 */}
      {/* ========================================================================= */}
      {activeCoachTab === 'proactive' && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-400">
              Proactive Behavioral Guidance Stream
            </h3>
            <span className="text-[10px] font-mono text-emerald-400">
              Auto-monitors journey milestones & NZEB risks
            </span>
          </div>

          {loadingMessages ? (
            <div className="p-8 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-300 font-mono text-xs">
              <Clock size={20} className="animate-spin text-emerald-400" />
              <span>Loading Proactive Behavioral Retrofit Guidance...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="p-6 bg-slate-900/80 border border-white/10 rounded-2xl text-center text-xs text-slate-400 font-mono">
              No proactive coaching alerts at this time.
            </div>
          ) : (
            messages.map((m) => {
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
                      {m.category && (
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-900/80 rounded text-slate-300 border border-white/5">
                          {m.category.replace('_', ' ')}
                        </span>
                      )}
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
            })
          )}
        </div>
      )}
    </div>
  );
}
