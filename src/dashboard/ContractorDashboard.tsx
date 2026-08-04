/**
 * src/dashboard/ContractorDashboard.tsx
 *
 * Phase 28 SEO Hub Internal Contractor & Job Coordination Dashboard
 * Views:
 * - /dashboard/contractors (p28_contractors) -> SEAI Registered Contractor Pool
 * - /dashboard/jobs (p28_jobs) -> Retrofit Installation Job Queue
 * - /dashboard/jobs/calendar (p28_jobs_calendar) -> Trade Schedule & Compliance Workflow
 */

import { useState, useEffect } from "react";
import { Wrench, Calendar, CheckCircle2, Clock, Users, RefreshCw, FileCheck, ShieldCheck, MapPin, Phone, Mail } from "lucide-react";
import { apiGet, apiPost } from "../hooks/useApi";

interface ContractorDashboardProps {
  view?: "contractors" | "jobs" | "calendar";
}

export default function ContractorDashboard({ view = "contractors" }: ContractorDashboardProps) {
  const [activeView, setActiveView] = useState<"contractors" | "jobs" | "calendar">(view);
  const [loading, setLoading] = useState(false);
  const [contractors, setContractors] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const cRes = await apiGet("/api/contractors");
      if (cRes && cRes.contractors) setContractors(cRes.contractors);

      const jRes = await apiGet("/api/jobs");
      if (jRes && jRes.jobs) setJobs(jRes.jobs);
    } catch (err) {
      console.error("Contractor dashboard fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateJobStatus = async (jobId: string, newStatus: string) => {
    try {
      await apiPost("/api/jobs/update", { job_id: jobId, status: newStatus });
      setJobs(prev =>
        prev.map(j => (j.job_id === jobId ? { ...j, status: newStatus } : j))
      );
    } catch (err) {
      console.error("Update job status error", err);
    }
  };

  return (
    <div className="flex flex-col gap-5 text-left font-sans">
      {/* Header Banner */}
      <div className="glass-card p-6 border border-purple-500/20 rounded-2xl bg-slate-900/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono text-purple-400 font-bold tracking-wider">Phase 28 Contractor Coordination Engine</span>
          <h2 className="text-xl font-bold text-white mt-0.5">SEAI Contractor Pool & Retrofit Job Execution</h2>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-white/10 text-xs font-mono">
          <button
            onClick={() => setActiveView("contractors")}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeView === "contractors" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "text-slate-400 hover:text-white"
            }`}
          >
            Contractor Pool
          </button>
          <button
            onClick={() => setActiveView("jobs")}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeView === "jobs" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "text-slate-400 hover:text-white"
            }`}
          >
            Job Queue
          </button>
          <button
            onClick={() => setActiveView("calendar")}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeView === "calendar" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "text-slate-400 hover:text-white"
            }`}
          >
            Trade Schedule
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-white transition"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* VIEW 1: CONTRACTORS POOL */}
      {activeView === "contractors" && (
        <div className="glass-card p-6 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-4 font-mono text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users size={18} className="text-purple-400" />
            Registered SEAI Trade Network Pool
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contractors.map((c, idx) => (
              <div key={idx} className="p-4 bg-slate-950/80 border border-white/5 rounded-xl flex flex-col gap-2.5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-bold text-white text-sm">{c.name}</span>
                    <div className="flex items-center gap-2 text-[10px] text-amber-400 mt-0.5">
                      <span>{c.rating} ★ Rating</span>
                      <span className="text-slate-400">• {c.jobsCompleted} Jobs Completed</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px] uppercase font-bold">
                    SEAI Verified
                  </span>
                </div>

                <div className="flex flex-wrap gap-1 mt-1">
                  {c.type.map((t: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded text-[10px]">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-400 border-t border-white/5 pt-2 mt-1">
                  <span className="flex items-center gap-1"><MapPin size={12} className="text-purple-400" /> Regions: {c.region.join(", ")}</span>
                  <span className="flex items-center gap-1"><Phone size={12} className="text-purple-400" /> {c.contact.phone}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: JOB QUEUE */}
      {activeView === "jobs" && (
        <div className="glass-card p-6 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-4 font-mono text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Wrench size={18} className="text-purple-400" />
            Active Retrofit Installation Job Queue
          </h3>

          <div className="flex flex-col gap-3">
            {jobs.map((j, idx) => (
              <div key={idx} className="p-4 bg-slate-950/80 border border-white/5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{j.task}</span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                      j.status === "completed" ? "bg-emerald-500/20 text-emerald-300" :
                      j.status === "in_progress" ? "bg-sky-500/20 text-sky-300" : "bg-amber-500/20 text-amber-300"
                    }`}>
                      {j.status}
                    </span>
                    <span className="text-[10px] text-purple-300">Target: {j.scheduledDate} @ {j.scheduledTime}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Contractor: <strong className="text-slate-200">{j.contractorName}</strong> | Homeowner: <strong className="text-slate-200">{j.homeowner_id}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {j.status === "scheduled" && (
                    <button
                      onClick={() => handleUpdateJobStatus(j.job_id, "in_progress")}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-bold transition"
                    >
                      Start Job
                    </button>
                  )}
                  {j.status === "in_progress" && (
                    <button
                      onClick={() => handleUpdateJobStatus(j.job_id, "completed")}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: TRADE SCHEDULE */}
      {activeView === "calendar" && (
        <div className="glass-card p-6 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-4 font-mono text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Calendar size={18} className="text-purple-400" />
            Trade Schedule & SEAI Sign-off Compliance Workflow
          </h3>

          <div className="flex flex-col gap-3">
            {[
              { measure: "Air-to-Water Heat Pump Installation", contractor: "GreenHeat Solutions", status: "Sign-off Uploaded", step: "SEAI Grant Submission Ready" },
              { measure: "Rooftop Solar PV Array", contractor: "EcoSolar & Electric", status: "Scheduled", step: "Awaiting Installation Date" },
              { measure: "Attic Insulation Upgrade", contractor: "Munster Retrofit", status: "Completed", step: "BER Cert Verified" }
            ].map((row, idx) => (
              <div key={idx} className="p-4 bg-slate-950/80 border border-white/5 rounded-xl flex justify-between items-center">
                <div>
                  <span className="font-bold text-white">{row.measure}</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">Assigned: {row.contractor} | Compliance: {row.step}</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-bold uppercase">
                  {row.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
