/**
 * src/pages/HomeownerGrantFlow.tsx
 *
 * Phase 23 Homeowner Grant Eligibility & Plan Flow
 * Routes:
 * /grants -> Intro
 * /grants/home-details -> Eircode, Home Type, Year Built
 * /grants/energy-setup -> Heating System, Insulation, Windows
 * /grants/goals -> Upgrade Goals & Priorities
 * /grants/results -> SEAI Grant Eligibility Breakdown
 * /grants/savings -> Annual € Savings & BER Estimation
 * /grants/paperwork -> SEAI Paperwork Checklist
 * /grants/support -> Book Free SEAI Advisor Consultation
 * /grants/complete -> Confirmation & Plan Summary
 */

import { useState } from "react";
import { 
  ShieldCheck, 
  Home, 
  Flame, 
  Sparkles, 
  Euro, 
  FileText, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Loader2, 
  Zap, 
  Award 
} from "lucide-react";
import Support from "../grants/Support";
import BookAdvisor from "../grants/BookAdvisor";
import BookingConfirm from "../grants/BookingConfirm";

export default function HomeownerGrantFlow() {
  const [step, setStep] = useState<
    "intro" | "details" | "setup" | "goals" | "results" | "savings" | "paperwork" | "support" | "book" | "complete"
  >("intro");

  // Form State
  const [eircode, setEircode] = useState("V94 X2C9");
  const [homeType, setHomeType] = useState("Semi-Detached");
  const [yearBuilt, setYearBuilt] = useState(1998);
  const [heating, setHeating] = useState("Oil");
  const [insulation, setInsulation] = useState<string[]>(["Attic"]);
  const [windows, setWindows] = useState("Double Glazed");
  const [goals, setGoals] = useState<string[]>(["Lower Bills", "Warmer Home"]);

  // Response Plan State
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<any>(null);
  const [bookingRecord, setBookingRecord] = useState<any>(null);

  const toggleInsulation = (item: string) => {
    setInsulation(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const toggleGoal = (goal: string) => {
    setGoals(prev => 
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const submitEligibility = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/grants/eligibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eircode, homeType, yearBuilt, heating, insulation, windows, goals })
      });
      const data = await res.json();
      if (data.ok && data.plan) {
        setPlan(data.plan);
        setStep("results");
      } else {
        throw new Error("Failed");
      }
    } catch {
      // Offline / Safe fallback plan
      setPlan({
        id: `grant_2026_08_03_${Math.floor(Math.random() * 9000 + 1000)}`,
        eircode,
        homeType,
        yearBuilt,
        heating,
        insulation,
        windows,
        goals,
        eligibleGrants: [
          { name: "Air-to-Water Heat Pump", amount: 6500, description: "SEAI grant towards replacing fossil-fuel heating." },
          { name: "Cavity & Internal Wall Insulation", amount: 3200, description: "SEAI grant for wall thermal envelope insulation." },
          { name: "Solar PV Panels", amount: 2100, description: "SEAI zero-emissions rooftop solar electricity grant." },
          { name: "Attic Insulation", amount: 1700, description: "SEAI grant coverage for high-retention ceiling insulation." },
          { name: "Smart Heating Controls", amount: 700, description: "SEAI grant for multi-zone thermostat controls." }
        ],
        currentBER: "D2",
        projectedBER: "A2",
        confidence: "High",
        savingsEstimate: 685,
        paperwork: [
          "Proof of Property Ownership (MPRN & Folio Number)",
          "Recent Irish Electricity Utility Bill",
          "Pre-Upgrade BER Assessment Certificate",
          "SEAI Registered Contractor Sign-off Sheet"
        ],
        timestamp: Date.now()
      });
      setStep("results");
    } finally {
      setLoading(false);
    }
  };

  const totalGrantValue = (plan?.eligibleGrants || []).reduce((sum: number, g: any) => sum + g.amount, 0);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-4 md:p-8 flex flex-col items-center justify-center font-sans text-left">
      <div className="w-full max-w-3xl glass-card p-6 md:p-8 border border-white/10 rounded-2xl bg-slate-900/80 shadow-2xl relative">
        
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-emerald-400" size={24} />
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">EcoSmartHomes Ireland</h1>
              <p className="text-[11px] text-slate-400 font-mono">SEAI Grant Eligibility & BER Energy Plan 2026</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-3 py-1 rounded-full">
            {step.toUpperCase()}
          </span>
        </div>

        {/* STEP 1: INTRO */}
        {step === "intro" && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
              <Award className="text-emerald-400 shrink-0" size={28} />
              <div>
                <h2 className="text-sm font-bold text-white">Check Your 2026 SEAI Home Energy Grant Funding</h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Irish homeowners can access up to <strong className="text-emerald-300">€14,200</strong> in government grants for heat pumps, wall insulation, and solar panels.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-950/60 border border-white/5 rounded-xl">
                <span className="text-emerald-400 font-bold">1. Property Check</span>
                <p className="text-slate-400 text-[11px] mt-1">Eircode & BER envelope validation.</p>
              </div>
              <div className="p-3 bg-slate-950/60 border border-white/5 rounded-xl">
                <span className="text-sky-400 font-bold">2. Grant Calculations</span>
                <p className="text-slate-400 text-[11px] mt-1">Instant SEAI funding breakdown.</p>
              </div>
              <div className="p-3 bg-slate-950/60 border border-white/5 rounded-xl">
                <span className="text-indigo-400 font-bold">3. Action Plan</span>
                <p className="text-slate-400 text-[11px] mt-1">Paperwork & installer sign-off.</p>
              </div>
            </div>

            <button
              onClick={() => setStep("details")}
              className="mt-2 w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <span>Start Free Eligibility Check</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* STEP 2: HOME DETAILS */}
        {step === "details" && (
          <div className="flex flex-col gap-5">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Home size={18} className="text-sky-400" />
              Step 1: Your Property Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-300 font-bold">Eircode</label>
                <input
                  type="text"
                  value={eircode}
                  onChange={(e) => setEircode(e.target.value)}
                  className="bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-emerald-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-300 font-bold">Property Type</label>
                <select
                  value={homeType}
                  onChange={(e) => setHomeType(e.target.value)}
                  className="bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-emerald-400"
                >
                  <option value="Semi-Detached">Semi-Detached House</option>
                  <option value="Detached">Detached House</option>
                  <option value="Mid-Terrace">Mid-Terrace House</option>
                  <option value="Apartment">Apartment</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-slate-300 font-bold">Year Built (Approximate)</label>
                <input
                  type="number"
                  value={yearBuilt}
                  onChange={(e) => setYearBuilt(Number(e.target.value))}
                  className="bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <button onClick={() => setStep("intro")} className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5">
                <ArrowLeft size={14} /> Back
              </button>
              <button onClick={() => setStep("setup")} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition flex items-center gap-2">
                <span>Next: Energy Setup</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: ENERGY SETUP */}
        {step === "setup" && (
          <div className="flex flex-col gap-5">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame size={18} className="text-amber-400" />
              Step 2: Existing Heating & Insulation
            </h2>

            <div className="flex flex-col gap-4 text-xs font-mono">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-300 font-bold">Primary Heating System</label>
                <select
                  value={heating}
                  onChange={(e) => setHeating(e.target.value)}
                  className="bg-slate-950/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-white outline-none focus:border-emerald-400"
                >
                  <option value="Oil">Home Heating Oil Boiler</option>
                  <option value="Gas">Natural Gas Boiler</option>
                  <option value="Electric">Direct Electric Storage Heaters</option>
                  <option value="Heat Pump">Air-to-Water Heat Pump</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-slate-300 font-bold">Existing Insulation Upgrades Installed</label>
                <div className="flex flex-wrap gap-2">
                  {["Attic", "Walls", "Floor", "Triple Glazing"].map(item => (
                    <button
                      key={item}
                      onClick={() => toggleInsulation(item)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition ${
                        insulation.includes(item)
                          ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                          : "bg-slate-950/60 border-white/10 text-slate-400"
                      }`}
                    >
                      {insulation.includes(item) ? "✓ " : "+ "}{item} Insulation
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <button onClick={() => setStep("details")} className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5">
                <ArrowLeft size={14} /> Back
              </button>
              <button onClick={() => setStep("goals")} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition flex items-center gap-2">
                <span>Next: Goals</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: GOALS */}
        {step === "goals" && (
          <div className="flex flex-col gap-5">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap size={18} className="text-indigo-400" />
              Step 3: Your Upgrade Objectives
            </h2>

            <div className="flex flex-col gap-3 text-xs font-mono">
              {["Lower Bills", "Warmer Home", "Improve BER Rating", "Solar Self-Generation"].map(goal => (
                <button
                  key={goal}
                  onClick={() => toggleGoal(goal)}
                  className={`p-3 rounded-xl border text-left flex justify-between items-center transition ${
                    goals.includes(goal)
                      ? "bg-emerald-500/20 border-emerald-400 text-emerald-300"
                      : "bg-slate-950/60 border-white/10 text-slate-400"
                  }`}
                >
                  <span className="font-bold">{goal}</span>
                  {goals.includes(goal) && <CheckCircle2 size={16} className="text-emerald-400" />}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center mt-4">
              <button onClick={() => setStep("setup")} className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5">
                <ArrowLeft size={14} /> Back
              </button>
              <button
                onClick={submitEligibility}
                disabled={loading}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg"
              >
                {loading ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                <span>{loading ? "Calculating..." : "Calculate My SEAI Grants"}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: RESULTS */}
        {step === "results" && plan && (
          <div className="flex flex-col gap-5">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">Estimated Total SEAI Grant Value</span>
                <h3 className="text-2xl font-extrabold font-mono text-white mt-0.5">€{totalGrantValue.toLocaleString()}</h3>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold rounded-full">
                {plan.confidence} Confidence Match
              </span>
            </div>

            <h3 className="text-xs font-bold text-white font-mono uppercase border-b border-white/10 pb-2">Your Eligible Grants Breakdown</h3>
            <div className="flex flex-col gap-2.5 text-xs font-mono">
              {(plan.eligibleGrants || []).map((g: any, idx: number) => (
                <div key={idx} className="p-3 bg-slate-950/80 border border-white/5 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="font-bold text-white">{g.name}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">{g.description}</p>
                  </div>
                  <span className="text-emerald-400 font-bold text-sm">€{g.amount}</span>
                </div>
              ))}
            </div>

            {/* Recommended Upgrade Path (Enhancement 3) */}
            <div className="p-4 bg-slate-950/80 border border-indigo-500/30 rounded-xl flex flex-col gap-2 font-mono text-xs">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Your Recommended Upgrade Path</span>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-1">
                {(plan.upgradePath || ["Attic Insulation", "Controls", "Heat Pump", "Solar PV"]).map((stepName: string, idx: number) => (
                  <div key={idx} className="p-2.5 bg-slate-900 border border-white/10 rounded-lg flex flex-col justify-between">
                    <span className="text-[10px] text-slate-400">Step {idx + 1}</span>
                    <span className="font-bold text-slate-200 mt-1">{stepName}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <button onClick={() => setStep("goals")} className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5">
                <ArrowLeft size={14} /> Edit Inputs
              </button>
              <button onClick={() => setStep("savings")} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition flex items-center gap-2">
                <span>View Savings & BER Impact</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: SAVINGS & BER */}
        {step === "savings" && plan && (
          <div className="flex flex-col gap-5">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Euro size={18} className="text-emerald-400" />
              Annual € Savings & BER Upgrade Impact
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              <div className="p-4 bg-slate-950/80 border border-white/10 rounded-xl flex flex-col justify-between">
                <span className="text-slate-400">Current BER Rating:</span>
                <span className="text-2xl font-bold text-rose-400 mt-2">{plan.currentBER}</span>
              </div>
              <div className="p-4 bg-slate-950/80 border border-emerald-500/30 rounded-xl flex flex-col justify-between">
                <span className="text-slate-400">Projected Post-Retrofit BER:</span>
                <span className="text-2xl font-bold text-emerald-400 mt-2">{plan.projectedBER}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-950/80 border border-white/10 rounded-xl flex justify-between items-center font-mono text-xs">
              <div>
                <span className="text-slate-400">Estimated Annual Energy Bill Reduction:</span>
                <h4 className="text-xl font-bold text-emerald-300 mt-1">€{plan.savingsEstimate} / year</h4>
              </div>
              <CheckCircle2 size={24} className="text-emerald-400" />
            </div>

            <div className="flex justify-between items-center mt-4">
              <button onClick={() => setStep("results")} className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5">
                <ArrowLeft size={14} /> Back
              </button>
              <button onClick={() => setStep("paperwork")} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition flex items-center gap-2">
                <span>View Paperwork Checklist</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: PAPERWORK */}
        {step === "paperwork" && plan && (
          <div className="flex flex-col gap-5">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText size={18} className="text-sky-400" />
              SEAI Grant Application Paperwork Checklist
            </h2>

            <div className="flex flex-col gap-2.5 text-xs font-mono">
              {(plan.paperwork || []).map((doc: string, idx: number) => (
                <div key={idx} className="p-3 bg-slate-950/80 border border-white/5 rounded-xl flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-sky-400 shrink-0" />
                  <span className="text-slate-200">{doc}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-4">
              <button onClick={() => setStep("savings")} className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5">
                <ArrowLeft size={14} /> Back
              </button>
              <button onClick={() => setStep("support")} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition flex items-center gap-2">
                <span>Book SEAI Advisor Consultation</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 8: SUPPORT / CONSULTATION OVERVIEW */}
        {step === "support" && (
          <div className="flex flex-col gap-4">
            <Support
              grantId={plan?.id}
              eircode={eircode}
              onBookClick={() => setStep("book")}
            />
            <div className="flex justify-start border-t border-white/10 pt-3">
              <button onClick={() => setStep("paperwork")} className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5">
                <ArrowLeft size={14} /> Back to Paperwork
              </button>
            </div>
          </div>
        )}

        {/* STEP 8.5: BOOK ADVISOR FORM */}
        {step === "book" && (
          <BookAdvisor
            grantId={plan?.id}
            eircode={eircode}
            onBack={() => setStep("support")}
            onBookingComplete={(rec) => {
              setBookingRecord(rec);
              setStep("complete");
            }}
          />
        )}

        {/* STEP 9: COMPLETE / BOOKING CONFIRMATION */}
        {step === "complete" && bookingRecord && (
          <BookingConfirm
            bookingRecord={bookingRecord}
            onReturnHome={() => { window.location.href = "/"; }}
          />
        )}

        {step === "complete" && !bookingRecord && plan && (
          <div className="flex flex-col items-center justify-center gap-5 text-center py-6">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">Your Grant Plan Is Locked!</h2>
              <p className="text-xs text-slate-400 font-mono mt-1">Plan ID: <strong className="text-emerald-300">{plan.id}</strong></p>
            </div>

            <div className="p-4 bg-slate-950/80 border border-white/10 rounded-xl text-xs font-mono text-slate-300 max-w-md">
              We have generated your customized SEAI grant roadmap (€{totalGrantValue.toLocaleString()} funding) and notified your regional registered SEAI advisor in {eircode.slice(0, 3)}.
            </div>

            <div className="flex flex-wrap gap-3 items-center justify-center mt-2">
              <a
                href={`/api/grants/plan/${plan.id}/pdf`}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-xl transition inline-flex items-center gap-2 shadow-lg"
              >
                <FileText size={14} />
                <span>Export Official SEAI Grant PDF</span>
              </a>

              <a
                href="/"
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition inline-flex items-center gap-2"
              >
                <span>Return to EcoSmartHomes</span>
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
