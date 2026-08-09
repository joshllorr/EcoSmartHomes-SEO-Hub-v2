/**
 * src/portal/grants/GrantStatusView.tsx
 *
 * Phase 30 Homeowner Portal Grant Submission Lifecycle & Timeline Component
 * Routes: /portal/grants, /portal/grants/submission, /portal/grants/timeline
 */

import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Wrench,
  Award,
  FileText,
  Download,
} from 'lucide-react';
import { apiGet } from '../../hooks/useApi';

export function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'draft':
      return (
        <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-slate-700 text-slate-300 border border-slate-600">
          draft
        </span>
      );
    case 'ready':
      return (
        <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
          ready
        </span>
      );
    case 'submitted':
      return (
        <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
          submitted
        </span>
      );
    case 'under_review':
      return (
        <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
          under review
        </span>
      );
    case 'approved':
      return (
        <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
          approved
        </span>
      );
    case 'paid':
      return (
        <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-yellow-400 text-slate-950 shadow-md">
          paid (disbursed)
        </span>
      );
    case 'rejected':
      return (
        <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
          rejected
        </span>
      );
    case 'cancelled':
      return (
        <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-slate-900 text-slate-400 border border-slate-800">
          cancelled
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-slate-800 text-slate-300">
          {status}
        </span>
      );
  }
}

export function SubmissionTimeline({ history }: { history: any[] }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 relative pl-6 border-l-2 border-slate-700/60 font-mono text-xs my-3">
      {history.map((entry, idx) => {
        const dateStr = new Date(entry.at).toLocaleString('en-IE', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <div key={idx} className="relative flex flex-col gap-1">
            <div className="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full bg-slate-900 border-2 border-sky-400 flex items-center justify-center text-[10px] text-sky-300 font-bold">
              ✓
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={entry.status} />
              <span className="text-slate-400 text-[11px]">{dateStr}</span>
            </div>
            {entry.rejectionReason && (
              <p className="text-rose-400 text-[11px] mt-0.5 font-sans bg-rose-950/40 p-2 rounded border border-rose-500/20">
                Reason: {entry.rejectionReason}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function GrantStatusView({
  userId = 'user_2026_08_03_1412',
}: {
  userId?: string;
}) {
  const [subView, setSubView] = useState<'overview' | 'timeline' | 'details'>(
    'overview',
  );
  const [submission, setSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      const res = await apiGet(`/api/grants/submissions/${userId}`);
      if (res && res.submissions && res.submissions.length > 0) {
        setSubmission(res.submissions[0]);
      }
    } catch (err) {
      console.error('Portal grant submission fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmission();
  }, [userId]);

  if (loading || !submission) {
    return (
      <div className="p-8 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-300 font-mono text-xs">
        <Clock size={20} className="animate-spin text-sky-400" />
        <span>Loading SEAI Grant Application Lifecycle Data...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 text-left font-sans">
      {/* Top Banner */}
      <div className="p-6 bg-slate-900/80 border border-emerald-500/20 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-400" />
            <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold tracking-wider">
              SEAI Grant Application Tracker
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            SEAI Grant Application Lifecycle
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Reference:{' '}
            <strong className="text-sky-300">
              {submission.seaiReference || 'SEAI-2026-89412'}
            </strong>
          </p>
        </div>

        <StatusBadge status={submission.status} />
      </div>

      {/* Sub Navigation Bar */}
      <div className="flex items-center gap-2 font-mono text-xs border-b border-white/10 pb-3">
        <button
          onClick={() => setSubView('overview')}
          className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
            subView === 'overview'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Submission Overview
        </button>
        <button
          onClick={() => setSubView('timeline')}
          className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
            subView === 'timeline'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Lifecycle Timeline
        </button>
        <button
          onClick={() => setSubView('details')}
          className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
            subView === 'details'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Measures & Paperwork Details
        </button>
      </div>

      {/* VIEW 1: OVERVIEW */}
      {subView === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Financial Summary Card */}
          <div className="p-5 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col gap-4 font-mono text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award size={16} className="text-emerald-400" />
              2026 SEAI Financial Grant Summary
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-950/80 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase">
                  Total SEAI Grant
                </span>
                <div className="text-2xl font-bold text-emerald-400 mt-1">
                  €{(submission.totals?.totalGrant || 22100).toLocaleString()}
                </div>
              </div>
              <div className="p-3 bg-slate-950/80 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase">
                  Net Out-of-Pocket
                </span>
                <div className="text-2xl font-bold text-sky-300 mt-1">
                  €{(submission.totals?.netCost || 8000).toLocaleString()}
                </div>
              </div>
              <div className="p-3 bg-slate-950/80 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase">
                  Annual Savings
                </span>
                <div className="text-2xl font-bold text-purple-300 mt-1">
                  €{(submission.totals?.annualSavings || 1450).toLocaleString()}
                  /yr
                </div>
              </div>
              <div className="p-3 bg-slate-950/80 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase">
                  BER Rating Uplift
                </span>
                <div className="text-2xl font-bold text-amber-300 mt-1">
                  {submission.property?.berBefore || 'G'} ➔{' '}
                  {submission.property?.berAfter || 'A'}
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Professionals Card */}
          <div className="p-5 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col gap-4 font-mono text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Wrench size={16} className="text-indigo-400" />
              Assigned SEAI Registered Professionals
            </h3>

            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-white/5 flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-indigo-400">
                SEAI Registered Contractor
              </span>
              <div className="text-sm font-bold text-white">
                {submission.contractor?.name || 'GreenHeat Solutions Ireland'}
              </div>
              <div className="text-[11px] text-slate-400">
                SEAI Registration:{' '}
                <strong>
                  {submission.contractor?.seaiNumber || 'SEAI-12345'}
                </strong>
              </div>
              <div className="text-[11px] text-slate-400">
                Contact: {submission.contractor?.phone || '085-987-6543'} |{' '}
                {submission.contractor?.email || 'info@greenheat.ie'}
              </div>
            </div>

            <div className="p-3.5 bg-slate-950/80 rounded-xl border border-white/5 flex flex-col gap-1">
              <span className="text-[10px] uppercase font-bold text-purple-400">
                SEAI BER Assessor
              </span>
              <div className="text-sm font-bold text-white">
                {submission.berAssessor?.name || "John O'Donnell"}
              </div>
              <div className="text-[11px] text-slate-400">
                SEAI Assessor #:{' '}
                <strong>
                  {submission.berAssessor?.seaiNumber || 'BER-67890'}
                </strong>
              </div>
              <div className="text-[11px] text-slate-400">
                Email: {submission.berAssessor?.email || 'advisor@ecosmart.ie'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: TIMELINE */}
      {subView === 'timeline' && (
        <div className="p-6 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col gap-4 text-left">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
            <Clock size={16} className="text-sky-400" />
            SEAI Grant Lifecycle Audit Trail
          </h3>

          <SubmissionTimeline history={submission.statusHistory} />
        </div>
      )}

      {/* VIEW 3: DETAILS */}
      {subView === 'details' && (
        <div className="flex flex-col gap-5 text-left font-mono text-xs">
          {/* Measures Table */}
          <div className="p-5 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col gap-3">
            <h3 className="text-sm font-bold text-white">
              Eligible 2026 SEAI Measures & Out-of-Pocket Breakdown
            </h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400">
                  <th className="py-2">Measure</th>
                  <th className="py-2">Gross Cost</th>
                  <th className="py-2">SEAI Grant</th>
                  <th className="py-2">Net Cost</th>
                </tr>
              </thead>
              <tbody>
                {(submission.measures || []).map((m: any, idx: number) => (
                  <tr
                    key={idx}
                    className="border-b border-white/5 text-slate-200"
                  >
                    <td className="py-2.5 font-bold text-white">{m.name}</td>
                    <td className="py-2.5">€{m.cost?.toLocaleString()}</td>
                    <td className="py-2.5 text-emerald-400 font-bold">
                      €{m.grantAmount?.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-sky-300 font-bold">
                      €{m.netCost?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paperwork Status Table */}
          <div className="p-5 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col gap-3">
            <h3 className="text-sm font-bold text-white">
              Required SEAI Verification Documents Checklist
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(submission.paperwork || {}).map(
                ([docKey, statusVal], idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950/80 rounded-xl border border-white/5 flex justify-between items-center"
                  >
                    <span className="text-slate-300 capitalize">
                      {docKey.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded text-[10px] font-bold uppercase">
                      {String(statusVal)}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
