/**
 * src/grants/Support.tsx
 * Phase 25 Advisor Support Overview
 */

import { Calendar, ShieldCheck, PhoneCall, Mail, CheckCircle2, ArrowRight } from "lucide-react";

interface SupportProps {
  onBookClick: () => void;
  grantId?: string;
  eircode?: string;
}

export default function Support({ onBookClick, grantId = "grant_2026_08_03_1207", eircode = "V94 X2C9" }: SupportProps) {
  return (
    <div className="flex flex-col gap-6 text-left font-sans">
      <div className="p-5 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/30">
          <Calendar size={24} />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Free SEAI Registered Advisor Consultation</h3>
          <p className="text-xs text-slate-300 mt-1 font-mono">
            Connect with a local registered Irish building energy surveyor to review your property Grant Plan (ID: <strong className="text-purple-300">{grantId}</strong>) for Eircode region <strong className="text-purple-300">{eircode.slice(0, 3)}</strong>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
        <div className="p-4 bg-slate-950/80 border border-white/10 rounded-xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <CheckCircle2 size={16} />
            <span>Zero-Pressure Guidance</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            No pressure — just friendly, professional guidance on SEAI grant paperwork and contractor installation quotes.
          </p>
        </div>

        <div className="p-4 bg-slate-950/80 border border-white/10 rounded-xl flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sky-400 font-bold">
            <ShieldCheck size={16} />
            <span>Registered SEAI Surveyor</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            Your advisor John O'Donnell is registered with SEAI Ireland for grant sign-offs and BER assessments.
          </p>
        </div>
      </div>

      <div className="p-4 bg-slate-950/80 border border-purple-500/30 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="text-xs font-bold text-purple-300 font-mono">Local SEAI Advisor Contact</div>
          <div className="text-sm font-bold text-white mt-1">John O'Donnell</div>
          <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex flex-wrap gap-3">
            <span className="flex items-center gap-1"><PhoneCall size={12} className="text-purple-400" /> 085-123-4567</span>
            <span className="flex items-center gap-1"><Mail size={12} className="text-purple-400" /> advisor@ecosmart.ie</span>
          </div>
        </div>

        <button
          onClick={onBookClick}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg"
        >
          <span>Schedule Free Consultation</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
