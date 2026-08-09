/**
 * src/grants/BookingConfirm.tsx
 * Phase 25 Advisor Consultation Booking Confirmation Screen
 */

import {
  CheckCircle2,
  Calendar,
  FileText,
  PhoneCall,
  Mail,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';

interface BookingConfirmProps {
  bookingRecord: {
    booking_id: string;
    grant_id: string;
    name: string;
    email: string;
    phone: string;
    date: string;
    time: string;
    eircode: string;
    status: string;
    advisor?: {
      name: string;
      email: string;
      phone: string;
    };
    pdfLink?: string;
  };
  onReturnHome: () => void;
}

export default function BookingConfirm({
  bookingRecord,
  onReturnHome,
}: BookingConfirmProps) {
  const advisor = bookingRecord.advisor || {
    name: "John O'Donnell",
    email: 'advisor@ecosmart.ie',
    phone: '085-123-4567',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-5 text-center font-sans">
      <div className="w-16 h-16 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center border border-purple-500/30">
        <CheckCircle2 size={36} />
      </div>

      <div>
        <h2 className="text-xl font-bold text-white">
          Your Advisor Appointment Is Requested!
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Booking ID:{' '}
          <strong className="text-purple-300">
            {bookingRecord.booking_id}
          </strong>
        </p>
      </div>

      <div className="w-full max-w-md p-4 bg-slate-950/80 border border-white/10 rounded-xl flex flex-col gap-3 font-mono text-xs text-left">
        <div className="flex justify-between items-center border-b border-white/10 pb-2">
          <span className="text-slate-400">Status:</span>
          <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-bold uppercase">
            {bookingRecord.status || 'Pending Confirmation'}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-400">Requested Date & Time:</span>
          <span className="text-white font-bold">
            {bookingRecord.date} @ {bookingRecord.time}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-400">Property Eircode:</span>
          <span className="text-white font-bold">{bookingRecord.eircode}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-400">SEAI Grant Plan ID:</span>
          <span className="text-emerald-300 font-bold">
            {bookingRecord.grant_id}
          </span>
        </div>
      </div>

      {/* Confirmation Notification Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-md font-mono text-[11px] text-left">
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-emerald-300">
          <MessageSquare size={16} className="shrink-0 text-emerald-400" />
          <span>SMS Confirmation dispatched to {bookingRecord.phone}</span>
        </div>

        <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl flex items-center gap-2 text-sky-300">
          <Mail size={16} className="shrink-0 text-sky-400" />
          <span>Email Summary sent to {bookingRecord.email}</span>
        </div>
      </div>

      {/* Assigned SEAI Advisor Details */}
      <div className="w-full max-w-md p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl text-left font-mono text-xs">
        <div className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">
          Your Assigned Registered SEAI Advisor
        </div>
        <div className="text-sm font-bold text-white mt-1">{advisor.name}</div>
        <div className="text-[11px] text-slate-300 mt-1 flex flex-col gap-1">
          <span className="flex items-center gap-1.5">
            <PhoneCall size={12} className="text-purple-400" /> Phone:{' '}
            {advisor.phone}
          </span>
          <span className="flex items-center gap-1.5">
            <Mail size={12} className="text-purple-400" /> Email:{' '}
            {advisor.email}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 justify-center items-center mt-2">
        <a
          href={`/api/grants/plan/${bookingRecord.grant_id}/pdf`}
          target="_blank"
          rel="noreferrer"
          className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-mono text-xs font-bold rounded-xl transition inline-flex items-center gap-2 shadow-lg"
        >
          <FileText size={14} />
          <span>Download My SEAI Grant Plan (PDF)</span>
        </a>

        <button
          onClick={onReturnHome}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold rounded-xl transition inline-flex items-center gap-2"
        >
          <span>Return to EcoSmartHomes</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}
