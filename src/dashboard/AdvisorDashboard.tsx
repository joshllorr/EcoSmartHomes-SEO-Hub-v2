/**
 * src/dashboard/AdvisorDashboard.tsx
 *
 * Phase 25 SEO Hub Internal Advisor Booking Dashboard
 * Views:
 * - /dashboard/advisor (p25_advisor) -> Advisor Overview
 * - /dashboard/advisor/bookings (p25_advisor_bookings) -> Booking Logs
 * - /dashboard/advisor/calendar (p25_advisor_calendar) -> Advisor Calendar
 */

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Users, CheckCircle2, Clock, RefreshCw, FileText, MapPin, Phone, Mail, ShieldCheck } from "lucide-react";
import { apiGet, apiPost } from "../hooks/useApi";

interface AdvisorDashboardProps {
  view?: "overview" | "bookings" | "calendar";
}

interface BookingRecord {
  booking_id: string;
  grant_id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  eircode: string;
  status: "pending" | "confirmed" | "completed";
  createdAt: number;
}

export default function AdvisorDashboard({ view = "overview" }: AdvisorDashboardProps) {
  const [activeView, setActiveView] = useState<"overview" | "bookings" | "calendar">(view);
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [calendarSlots, setCalendarSlots] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    totalBookings: 42,
    pendingConfirmations: 8,
    completedConsultations: 34,
    conversionToRetrofitJobs: "68.2%"
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const bRes = await apiGet("/api/advisor/bookings");
      if (bRes && bRes.bookings) {
        setBookings(bRes.bookings);
      }
      const cRes = await apiGet("/api/advisor/calendar");
      if (cRes) {
        if (cRes.metrics) setMetrics(cRes.metrics);
        if (cRes.slots) setCalendarSlots(cRes.slots);
      }
    } catch (err) {
      console.error("Advisor dashboard fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConfirm = async (bookingId: string) => {
    try {
      await apiPost("/api/advisor/confirm", { booking_id: bookingId });
      setBookings(prev =>
        prev.map(b => (b.booking_id === bookingId ? { ...b, status: "confirmed" } : b))
      );
    } catch (err) {
      console.error("Confirm booking error", err);
    }
  };

  const handleToggleSlot = (idx: number) => {
    setCalendarSlots(prev =>
      prev.map((slot, i) =>
        i === idx ? { ...slot, status: slot.status === "available" ? "unavailable" : "available" } : slot
      )
    );
  };

  return (
    <div className="flex flex-col gap-5 text-left font-sans">
      {/* Header Banner */}
      <div className="glass-card p-6 border border-purple-500/20 rounded-2xl bg-slate-900/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono text-purple-400 font-bold tracking-wider">Phase 25 Advisor Booking Scheduler</span>
          <h2 className="text-xl font-bold text-white mt-0.5">Registered SEAI Advisor Operations & Calendar</h2>
        </div>

        {/* Navigation View Switcher */}
        <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-white/10 text-xs font-mono">
          <button
            onClick={() => setActiveView("overview")}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeView === "overview" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "text-slate-400 hover:text-white"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveView("bookings")}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeView === "bookings" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "text-slate-400 hover:text-white"
            }`}
          >
            Booking Logs
          </button>
          <button
            onClick={() => setActiveView("calendar")}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              activeView === "calendar" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "text-slate-400 hover:text-white"
            }`}
          >
            Advisor Calendar
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

      {/* VIEW 1: OVERVIEW */}
      {activeView === "overview" && (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-sky-400">
                <Users size={18} />
                <span className="font-bold text-slate-300">Total Consultations</span>
              </div>
              <span className="text-3xl font-bold text-sky-300 mt-3">{metrics.totalBookings}</span>
            </div>

            <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-amber-400">
                <Clock size={18} />
                <span className="font-bold text-slate-300">Pending Confirmations</span>
              </div>
              <span className="text-3xl font-bold text-amber-300 mt-3">{metrics.pendingConfirmations}</span>
            </div>

            <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 size={18} />
                <span className="font-bold text-slate-300">Completed Surveys</span>
              </div>
              <span className="text-3xl font-bold text-emerald-400 mt-3">{metrics.completedConsultations}</span>
            </div>

            <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-purple-400">
                <ShieldCheck size={18} />
                <span className="font-bold text-slate-300">Retrofit Job Conversion</span>
              </div>
              <span className="text-3xl font-bold text-purple-300 mt-3">{metrics.conversionToRetrofitJobs}</span>
            </div>
          </div>

          {/* Assigned SEAI Surveyor Card */}
          <div className="glass-card p-6 border border-purple-500/20 rounded-2xl bg-slate-900/60 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&q=80"
                alt="John O'Donnell"
                className="w-14 h-14 rounded-full object-cover border-2 border-purple-400 shrink-0"
              />
              <div>
                <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">Active SEAI Registered Surveyor</span>
                <h3 className="text-base font-bold text-white mt-0.5">John O'Donnell</h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Coverage: Munster & Leinster (Limerick / Cork / Dublin)</p>
              </div>
            </div>

            <div className="flex flex-col gap-1 text-xs font-mono text-slate-300">
              <span className="flex items-center gap-1.5"><Phone size={12} className="text-purple-400" /> Phone: 085-123-4567</span>
              <span className="flex items-center gap-1.5"><Mail size={12} className="text-purple-400" /> Email: advisor@ecosmart.ie</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: BOOKING LOGS */}
      {activeView === "bookings" && (
        <div className="glass-card p-6 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-4 font-mono text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users size={18} className="text-purple-400" />
            Homeowner Consultation Booking Queue
          </h3>

          <div className="flex flex-col gap-3">
            {bookings.map((rec, idx) => (
              <div key={idx} className="p-4 bg-slate-950/80 border border-white/5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{rec.name}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      rec.status === "confirmed" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                    }`}>
                      {rec.status}
                    </span>
                    <span className="text-[10px] text-purple-300 font-bold">Slot: {rec.date} @ {rec.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Phone: {rec.phone} | Email: {rec.email} | Eircode: {rec.eircode} | Grant Plan: {rec.grant_id}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`/api/grants/plan/${rec.grant_id}/pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/30 rounded-lg text-xs font-bold transition flex items-center gap-1"
                  >
                    <FileText size={12} />
                    <span>View PDF</span>
                  </a>

                  {rec.status === "pending" && (
                    <button
                      onClick={() => handleConfirm(rec.booking_id)}
                      className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      Confirm Booking
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: ADVISOR CALENDAR */}
      {activeView === "calendar" && (
        <div className="glass-card p-6 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-4 font-mono text-xs">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CalendarIcon size={18} className="text-purple-400" />
              Advisor Daily & Weekly Schedule (August 2026)
            </h3>
            <span className="text-xs text-slate-400">Time-Zone: IST (Dublin)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {calendarSlots.map((slot, idx) => (
              <div key={idx} className="p-4 bg-slate-950/80 border border-white/5 rounded-xl flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 font-bold">
                    <span className="text-white">{slot.time}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${
                      slot.status === "booked" ? "bg-purple-500/20 text-purple-300" :
                      slot.status === "available" ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                    }`}>
                      {slot.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {slot.homeowner ? `Assigned: ${slot.homeowner}` : "Open Consultation Slot"}
                  </p>
                </div>

                {slot.status !== "booked" && (
                  <button
                    onClick={() => handleToggleSlot(idx)}
                    className="px-3 py-1 bg-slate-900 border border-white/10 text-slate-300 hover:text-white rounded text-[10px] font-bold transition"
                  >
                    {slot.status === "available" ? "Mark Slot Unavailable" : "Make Available"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
