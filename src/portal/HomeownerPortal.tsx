/**
 * src/portal/HomeownerPortal.tsx
 *
 * Phase 26 Homeowner Portal ("My Account")
 * Routes / Sub-views:
 * - /portal/dashboard -> Overview of Grant Plan, Paperwork, Appointments, PDF Download
 * - /portal/grant-plan -> Detailed Grant Breakdown & Upgrade Path
 * - /portal/paperwork -> Document Uploads (MPRN, Utility Bill, BER Cert, Sign-off)
 * - /portal/appointments -> Advisor Appointments (Reschedule & Cancel)
 * - /portal/timeline -> Upgrade Timeline & Milestones
 * - /portal/settings -> Account Details
 * - /portal/login & /portal/register -> Authentication
 */

import { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  User, 
  FileText, 
  Calendar, 
  Upload, 
  CheckCircle2, 
  Clock, 
  Euro, 
  Award, 
  Settings as SettingsIcon, 
  LogOut, 
  ArrowRight, 
  Layers, 
  Loader2,
  Compass,
  Lock,
  Mail,
  Sparkles,
  Bot
} from "lucide-react";
import Planner from "./retrofit/Planner";
import GrantStatusView from "./grants/GrantStatusView";
import PostInstallView from "./postinstall/PostInstallView";
import JourneyView from "./journey/JourneyView";
import HomeUpgradeRecommendationsView from "./upgrades/HomeUpgradeRecommendationsView";
import RetrofitAdvisorChat from "./advisor/RetrofitAdvisorChat";
import HomeownerConfidenceView from "./sentiment/HomeownerConfidenceView";
import RetrofitCoachView from "./coach/RetrofitCoachView";

export default function HomeownerPortal() {
  const [authed, setAuthed] = useState(true);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [activeTab, setActiveTab] = useState<"dashboard" | "journey" | "upgrades" | "advisor" | "confidence" | "coach" | "retrofit" | "plan" | "grants" | "postinstall" | "paperwork" | "appointments" | "timeline" | "settings">("coach");

  // User State
  const [user, setUser] = useState({
    user_id: "user_2026_08_03_1412",
    name: "Sarah O'Connor",
    email: "sarah@example.com",
    eircode: "V94 X2C9",
    grant_id: "grant_2026_08_03_1207"
  });

  // Paperwork State
  const [documents, setDocuments] = useState([
    { docName: "Proof of Property Ownership (MPRN)", status: "verified", uploadedAt: Date.now() - 7200000 },
    { docName: "Recent Electricity Utility Bill", status: "verified", uploadedAt: Date.now() - 3600000 },
    { docName: "Pre-Upgrade BER Assessment Cert", status: "pending", uploadedAt: null },
    { docName: "SEAI Contractor Sign-off Sheet", status: "pending", uploadedAt: null }
  ]);

  // Appointment State
  const [appointment, setAppointment] = useState<any>({
    booking_id: "book_2026_08_03_1312",
    date: "2026-08-06",
    time: "14:00",
    status: "confirmed",
    advisor: "John O'Donnell (085-123-4567)"
  });

  const [uploading, setUploading] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.ok && data.user) {
        setUser(data.user);
      }
    } catch {
      // Keep default
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleUpload = async (docName: string) => {
    setUploading(docName);
    try {
      await fetch("/api/paperwork/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentName: docName, user_id: user.user_id })
      });
      setDocuments(prev =>
        prev.map(d => (d.docName === docName ? { ...d, status: "verified", uploadedAt: Date.now() } : d))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(null);
    }
  };

  const handleReschedule = async () => {
    const newDate = prompt("Enter new preferred date (YYYY-MM-DD):", "2026-08-10");
    if (!newDate) return;
    try {
      await fetch("/api/advisor/reschedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: appointment.booking_id, date: newDate, time: "14:00" })
      });
      setAppointment((prev: any) => ({ ...prev, date: newDate, status: "rescheduled" }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your appointment?")) return;
    try {
      await fetch("/api/advisor/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: appointment.booking_id })
      });
      setAppointment((prev: any) => ({ ...prev, status: "cancelled" }));
    } catch (err) {
      console.error(err);
    }
  };

  // Auth Screen
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-slate-100 p-4 flex items-center justify-center font-sans text-left">
        <div className="w-full max-w-md p-8 bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-emerald-400" size={28} />
            <div>
              <h1 className="text-lg font-bold text-white">EcoSmartHomes Portal</h1>
              <p className="text-xs text-slate-400 font-mono">Sign in to manage your SEAI Grant Plan</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 font-mono text-xs">
            {authMode === "register" && (
              <div className="flex flex-col gap-1">
                <label className="text-slate-300 font-bold">Full Name</label>
                <input
                  type="text"
                  defaultValue="Sarah O'Connor"
                  className="bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-emerald-400"
                />
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-slate-300 font-bold">Email Address</label>
              <input
                type="email"
                defaultValue="sarah@example.com"
                className="bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-emerald-400"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-slate-300 font-bold">Password</label>
              <input
                type="password"
                defaultValue="password123"
                className="bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-emerald-400"
              />
            </div>

            <button
              onClick={() => setAuthed(true)}
              className="mt-2 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <span>{authMode === "login" ? "Sign In to Portal" : "Create Homeowner Account"}</span>
              <ArrowRight size={14} />
            </button>

            <button
              onClick={() => setAuthMode(prev => (prev === "login" ? "register" : "login"))}
              className="text-[11px] text-slate-400 hover:text-white underline text-center cursor-pointer mt-1"
            >
              {authMode === "login" ? "Need an account? Register here" : "Already registered? Sign in"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-4 md:p-8 flex flex-col items-center justify-start font-sans text-left">
      <div className="w-full max-w-5xl flex flex-col gap-6">
        
        {/* Top Header Bar */}
        <div className="glass-card p-6 border border-white/10 rounded-2xl bg-slate-900/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <User size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Welcome, {user.name}</h1>
              <p className="text-xs text-slate-400 font-mono">
                Eircode: <strong className="text-emerald-300">{user.eircode}</strong> | Grant Plan: <strong className="text-emerald-300">{user.grant_id}</strong>
              </p>
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-950/80 p-1.5 rounded-xl border border-white/10 text-xs font-mono">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeTab === "dashboard" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-slate-400 hover:text-white"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("journey")}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                activeTab === "journey" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-slate-400 hover:text-white"
              }`}
            >
              <Compass size={12} className="text-emerald-400" />
              <span>Full Journey</span>
            </button>
            <button
              onClick={() => setActiveTab("upgrades")}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                activeTab === "upgrades" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles size={12} className="text-emerald-400" />
              <span>Smart Upgrades</span>
            </button>
            <button
              onClick={() => setActiveTab("advisor")}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                activeTab === "advisor" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-slate-400 hover:text-white"
              }`}
            >
              <Bot size={12} className="text-emerald-400" />
              <span>AI Advisor</span>
            </button>
            <button
              onClick={() => setActiveTab("confidence")}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                activeTab === "confidence" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-slate-400 hover:text-white"
              }`}
            >
              <ShieldCheck size={12} className="text-emerald-400" />
              <span>Confidence Index</span>
            </button>
            <button
              onClick={() => setActiveTab("coach")}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                activeTab === "coach" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles size={12} className="text-emerald-400" />
              <span>Retrofit Coach</span>
            </button>
            <button
              onClick={() => setActiveTab("retrofit")}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                activeTab === "retrofit" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-slate-400 hover:text-white"
              }`}
            >
              <Sparkles size={12} className="text-emerald-400" />
              <span>AI Retrofit Planner</span>
            </button>
            <button
              onClick={() => setActiveTab("plan")}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeTab === "plan" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-slate-400 hover:text-white"
              }`}
            >
              My Grant Plan
            </button>
            <button
              onClick={() => setActiveTab("grants")}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeTab === "grants" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-slate-400 hover:text-white"
              }`}
            >
              SEAI Submissions
            </button>
            <button
              onClick={() => setActiveTab("postinstall")}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeTab === "postinstall" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-slate-400 hover:text-white"
              }`}
            >
              Post-Install & Payment
            </button>
            <button
              onClick={() => setActiveTab("paperwork")}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeTab === "paperwork" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-slate-400 hover:text-white"
              }`}
            >
              Paperwork
            </button>
            <button
              onClick={() => setActiveTab("appointments")}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeTab === "appointments" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-slate-400 hover:text-white"
              }`}
            >
              Appointments
            </button>
            <button
              onClick={() => setActiveTab("timeline")}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                activeTab === "timeline" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "text-slate-400 hover:text-white"
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setAuthed(false)}
              className="p-1.5 text-rose-400 hover:text-rose-300 transition ml-2"
              title="Sign Out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === "dashboard" && (
          <div className="flex flex-col gap-5">
            {/* Quick Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
              <div className="p-4 bg-slate-900/80 border border-emerald-500/30 rounded-xl flex flex-col justify-between">
                <span className="text-slate-400">Total SEAI Grant Value:</span>
                <span className="text-2xl font-extrabold text-emerald-400 mt-2">€14,200</span>
              </div>

              <div className="p-4 bg-slate-900/80 border border-white/10 rounded-xl flex flex-col justify-between">
                <span className="text-slate-400">BER Impact:</span>
                <span className="text-2xl font-extrabold text-sky-400 mt-2">D2 → A2</span>
              </div>

              <div className="p-4 bg-slate-900/80 border border-white/10 rounded-xl flex flex-col justify-between">
                <span className="text-slate-400">Annual Savings:</span>
                <span className="text-2xl font-extrabold text-indigo-400 mt-2">€685 / yr</span>
              </div>

              <div className="p-4 bg-slate-900/80 border border-white/10 rounded-xl flex flex-col justify-between">
                <span className="text-slate-400">Match Confidence:</span>
                <span className="text-2xl font-extrabold text-purple-400 mt-2">High</span>
              </div>
            </div>

            {/* Main Action Banner */}
            <div className="p-6 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Official SEAI Documentation</span>
                <h3 className="text-base font-bold text-white mt-0.5">Download Your Custom Grant Plan PDF</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Includes BER uplift breakdown, 5-year savings projection, and surveyor sign-off.</p>
              </div>

              <a
                href={`/api/grants/plan/${user.grant_id}/pdf`}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg"
              >
                <FileText size={14} />
                <span>Export PDF Report</span>
              </a>
            </div>
          </div>
        )}

        {/* TAB 1.2: FULL JOURNEY TIMELINE */}
        {activeTab === "journey" && (
          <JourneyView userId={user.user_id} />
        )}

        {/* TAB 1.3: AI SMART UPGRADE RECOMMENDATIONS */}
        {activeTab === "upgrades" && (
          <HomeUpgradeRecommendationsView userId={user.user_id} />
        )}

        {/* TAB 1.4: AI RETROFIT ADVISOR COPILOT */}
        {activeTab === "advisor" && (
          <RetrofitAdvisorChat userId={user.user_id} />
        )}

        {/* TAB 1.5: HOMEOWNER CONFIDENCE METER */}
        {activeTab === "confidence" && (
          <HomeownerConfidenceView userId={user.user_id} />
        )}

        {/* TAB 1.6: PROACTIVE AI RETROFIT COACH */}
        {activeTab === "coach" && (
          <RetrofitCoachView userId={user.user_id} />
        )}

        {/* TAB 1.5: AI RETROFIT PLANNER */}
        {activeTab === "retrofit" && (
          <Planner grantId={user.grant_id} userId={user.user_id} />
        )}

        {/* TAB 2: GRANT PLAN */}
        {activeTab === "plan" && (
          <div className="p-6 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col gap-4 font-mono text-xs">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Award size={18} className="text-emerald-400" />
              Eligible SEAI Grant Breakdown
            </h2>

            <div className="flex flex-col gap-2.5">
              {[
                { name: "Air-to-Water Heat Pump", amount: 8000, desc: "Fossil-fuel heating replacement grant." },
                { name: "Cavity & Internal Wall Insulation", amount: 4000, desc: "Thermal envelope insulation grant." },
                { name: "Solar PV Panels", amount: 3000, desc: "Rooftop zero-emissions micro-generation grant." },
                { name: "Attic Insulation", amount: 2000, desc: "High-retention ceiling insulation grant." },
                { name: "Smart Heating Controls", amount: 1000, desc: "Multi-zone thermostat controls grant." },
                { name: "Full Retrofit + Combo Bonuses", amount: 4100, desc: "Bonus for completing all measures + heat pump combo." }
              ].map((g, idx) => (
                <div key={idx} className="p-3.5 bg-slate-950/80 border border-white/5 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white">{g.name}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">{g.desc}</p>
                  </div>
                  <span className="text-emerald-400 font-bold text-sm">€{g.amount}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2.5: SEAI SUBMISSIONS */}
        {activeTab === "grants" && (
          <GrantStatusView userId={user.user_id} />
        )}

        {/* TAB 2.7: POST-INSTALL BER & PAYMENT */}
        {activeTab === "postinstall" && (
          <PostInstallView userId={user.user_id} />
        )}

        {/* TAB 3: PAPERWORK UPLOAD */}
        {activeTab === "paperwork" && (
          <div className="p-6 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col gap-4 font-mono text-xs">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Upload size={18} className="text-sky-400" />
              SEAI Grant Documentation Upload Checklist
            </h2>

            <div className="flex flex-col gap-3">
              {documents.map((doc, idx) => (
                <div key={idx} className="p-4 bg-slate-950/80 border border-white/5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{doc.docName}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        doc.status === "verified" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                      }`}>
                        {doc.status}
                      </span>
                    </div>
                    {doc.uploadedAt && (
                      <p className="text-[10px] text-slate-400 mt-1">Uploaded: {new Date(doc.uploadedAt).toLocaleString()}</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleUpload(doc.docName)}
                    disabled={uploading === doc.docName}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-white/10 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                  >
                    {uploading === doc.docName ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                    <span>{doc.status === "verified" ? "Re-upload File" : "Upload File"}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: APPOINTMENTS */}
        {activeTab === "appointments" && (
          <div className="p-6 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col gap-4 font-mono text-xs">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar size={18} className="text-purple-400" />
              Your SEAI Advisor Appointment
            </h2>

            <div className="p-4 bg-slate-950/80 border border-white/5 rounded-xl flex flex-col gap-3">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
                <span className="text-slate-400">Appointment Status:</span>
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded text-[10px] uppercase font-bold">
                  {appointment.status}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Date & Time:</span>
                <span className="text-white font-bold">{appointment.date} @ {appointment.time}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Surveyor:</span>
                <span className="text-purple-300 font-bold">{appointment.advisor}</span>
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button
                  onClick={handleReschedule}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-white/10 text-white rounded-lg transition"
                >
                  Reschedule
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3.5 py-1.5 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: UPGRADE TIMELINE */}
        {activeTab === "timeline" && (
          <div className="p-6 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col gap-4 font-mono text-xs">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers size={18} className="text-indigo-400" />
              SEAI Upgrade Sequence Timeline
            </h2>

            <div className="flex flex-col gap-3">
              {[
                { step: "Step 1: Attic Insulation", status: "Completed", date: "August 2026", grant: "€2,000" },
                { step: "Step 2: Smart Heating Controls", status: "Scheduled", date: "September 2026", grant: "€700" },
                { step: "Step 3: Air-to-Water Heat Pump", status: "Pending", date: "October 2026", grant: "€12,500" },
                { step: "Step 4: Solar PV Panels", status: "Pending", date: "November 2026", grant: "€1,800" }
              ].map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-950/80 border border-white/5 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white">{item.step}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">Target: {item.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400 font-bold">{item.grant}</span>
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                      item.status === "Completed" ? "bg-emerald-500/20 text-emerald-300" :
                      item.status === "Scheduled" ? "bg-sky-500/20 text-sky-300" : "bg-slate-800 text-slate-400"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
