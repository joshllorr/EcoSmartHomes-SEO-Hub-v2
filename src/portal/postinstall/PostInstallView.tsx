/**
 * src/portal/postinstall/PostInstallView.tsx
 *
 * Phase 31 Homeowner Portal Post-Install BER & Grant Payment Tracker
 * Route: /portal/grants/postinstall
 */

import { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Clock,
  Calendar,
  FileText,
  DollarSign,
  Award,
  ShieldCheck,
  Upload,
  AlertCircle,
} from 'lucide-react';
import { apiGet, apiPost } from '../../hooks/useApi';

export function PostInstallBadge({ status }: { status: string }) {
  switch (status) {
    case 'scheduled':
      return (
        <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
          scheduled
        </span>
      );
    case 'pending':
      return (
        <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-slate-700 text-slate-300 border border-slate-600">
          pending
        </span>
      );
    case 'uploaded':
      return (
        <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
          uploaded
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
        <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-yellow-400 text-slate-950 shadow-md font-extrabold">
          paid (disbursed)
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

export function PostInstallTimeline({ timeline }: { timeline: any[] }) {
  if (!timeline || timeline.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 relative pl-6 border-l-2 border-slate-700/60 font-mono text-xs my-3 text-left">
      {timeline.map((entry, idx) => {
        const dateStr = new Date(entry.at).toLocaleString('en-IE', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        const eventLabels: Record<string, string> = {
          installation_complete: 'Retrofit Measure Installation Completed',
          ber_scheduled: 'Post-Install BER Assessment Scheduled',
          ber_uploaded: 'Final Post-Install BER Certificate Uploaded',
          seai_review: 'SEAI Audit & Review Dispatched',
          seai_approved: 'SEAI Grant Funding Fully Approved',
          seai_paid: 'Grant Payment Disbursed to Homeowner Account',
        };

        return (
          <div key={idx} className="relative flex flex-col gap-1">
            <div className="absolute -left-[31px] top-0.5 w-4.5 h-4.5 rounded-full bg-slate-900 border-2 border-emerald-400 flex items-center justify-center text-[10px] text-emerald-300 font-bold">
              ✓
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs">
                {eventLabels[entry.event] || entry.event}
              </span>
              <span className="text-slate-400 text-[11px]">{dateStr}</span>
            </div>
            {entry.notes && (
              <p className="text-slate-400 text-[11px] font-sans bg-slate-950/60 p-2 rounded border border-white/5">
                {entry.notes}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function PostInstallView({
  userId = 'user_2026_08_03_1412',
}: {
  userId?: string;
}) {
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingCert, setUploadingCert] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('2026-08-12');

  const fetchRecord = async () => {
    try {
      setLoading(true);
      const res = await apiGet(`/api/postinstall/${userId}`);
      if (res && res.record) {
        setRecord(res.record);
      }
    } catch (err) {
      console.error('Postinstall fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecord();
  }, [userId]);

  const handleUploadCert = async () => {
    try {
      setUploadingCert(true);
      const res = await apiPost('/api/postinstall/ber/upload', {
        user_id: userId,
        berRating: 'A',
      });
      if (res && res.record) {
        setRecord(res.record);
      }
    } catch (err) {
      console.error('BER upload error', err);
    } finally {
      setUploadingCert(false);
    }
  };

  const handleScheduleBER = async () => {
    try {
      const res = await apiPost('/api/postinstall/ber/schedule', {
        user_id: userId,
        scheduled: scheduledDate,
        assessor: "John O'Donnell",
      });
      if (res && res.record) {
        setRecord(res.record);
      }
    } catch (err) {
      console.error('BER schedule error', err);
    }
  };

  if (loading || !record) {
    return (
      <div className="p-8 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 text-slate-300 font-mono text-xs">
        <Clock size={20} className="animate-spin text-emerald-400" />
        <span>Loading Post-Install BER & SEAI Payment Tracker...</span>
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
              Phase 31 Final Mile Engine
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Post-Install BER & Grant Payment Status
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Post-Install ID:{' '}
            <strong className="text-sky-300">{record.postInstall_id}</strong>
          </p>
        </div>

        <PostInstallBadge
          status={
            record.seaiPayment?.status === 'paid'
              ? 'paid'
              : record.seaiApproval?.status === 'approved'
                ? 'approved'
                : 'under_review'
          }
        />
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        {/* BER Assessment Card */}
        <div className="p-5 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col justify-between gap-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2 text-sky-400">
              <Calendar size={18} />
              <span className="font-bold text-white">BER Assessment</span>
            </div>
            <PostInstallBadge
              status={record.berAssessment?.status || 'scheduled'}
            />
          </div>

          <div>
            <p className="text-[11px] text-slate-400">
              Assessor:{' '}
              <strong className="text-slate-200">
                {record.berAssessment?.assessor}
              </strong>
            </p>
            <p className="text-[11px] text-slate-400">
              Scheduled Date:{' '}
              <strong className="text-sky-300">
                {record.berAssessment?.scheduled}
              </strong>
            </p>
          </div>

          {record.berAssessment?.status === 'pending' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="bg-slate-950 border border-white/10 text-white rounded p-1.5 text-xs font-mono"
              />
              <button
                onClick={handleScheduleBER}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-bold transition cursor-pointer"
              >
                Schedule
              </button>
            </div>
          )}
        </div>

        {/* BER Cert Upload Card */}
        <div className="p-5 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col justify-between gap-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2 text-purple-400">
              <FileText size={18} />
              <span className="font-bold text-white">BER Certificate</span>
            </div>
            <PostInstallBadge
              status={record.berCert?.uploaded ? 'uploaded' : 'pending'}
            />
          </div>

          <div>
            <p className="text-[11px] text-slate-400">
              Rating Achieved:{' '}
              <strong className="text-emerald-400 text-sm">
                {record.berCert?.berRating || 'G ➔ A'}
              </strong>
            </p>
            <p className="text-[11px] text-slate-400">
              File:{' '}
              <strong className="text-slate-300">
                {record.berCert?.file || 'Pending upload'}
              </strong>
            </p>
          </div>

          {!record.berCert?.uploaded && (
            <button
              onClick={handleUploadCert}
              disabled={uploadingCert}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold transition flex items-center gap-1.5 cursor-pointer justify-center"
            >
              <Upload size={14} />
              <span>
                {uploadingCert ? 'Uploading...' : 'Upload BER Cert (Rating: A)'}
              </span>
            </button>
          )}
        </div>

        {/* SEAI Payment Card */}
        <div className="p-5 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col justify-between gap-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2 text-yellow-400">
              <DollarSign size={18} />
              <span className="font-bold text-white">SEAI Grant Payment</span>
            </div>
            <PostInstallBadge
              status={record.seaiPayment?.status || 'pending'}
            />
          </div>

          <div>
            <p className="text-[11px] text-slate-400">
              Disbursed Amount:{' '}
              <strong className="text-emerald-400 text-lg font-bold">
                €{(record.seaiPayment?.amount || 22100).toLocaleString()}
              </strong>
            </p>
            <p className="text-[11px] text-slate-400">
              Status:{' '}
              <strong className="text-yellow-300">
                {record.seaiPayment?.status === 'paid'
                  ? 'Funds Released to Homeowner'
                  : 'Under SEAI Audit'}
              </strong>
            </p>
          </div>

          <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-[10px] text-yellow-300">
            ✓ Grant funds transferred directly via SEAI EFT
          </div>
        </div>
      </div>

      {/* Post-Install Vertical Timeline */}
      <div className="p-6 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col gap-4 text-left">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
          <Clock size={16} className="text-emerald-400" />
          SEAI Post-Installation & Payment Lifecycle Timeline
        </h3>

        <PostInstallTimeline timeline={record.timeline} />
      </div>
    </div>
  );
}
