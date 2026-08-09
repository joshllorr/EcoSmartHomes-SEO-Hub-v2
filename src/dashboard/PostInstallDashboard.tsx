/**
 * src/dashboard/PostInstallDashboard.tsx
 *
 * Phase 31 SEO Hub Internal Post-Install BER & SEAI Payment Operator Console
 * Views:
 * - /dashboard/postinstall (p31_postinstall)
 * - /dashboard/postinstall/ber (p31_ber)
 * - /dashboard/postinstall/seai (p31_seai)
 * - /dashboard/postinstall/payments (p31_payments)
 */

import { useState, useEffect } from 'react';
import {
  Award,
  Calendar,
  FileText,
  DollarSign,
  Clock,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  Upload,
  AlertCircle,
} from 'lucide-react';
import { apiGet, apiPost } from '../hooks/useApi';
import {
  PostInstallBadge,
  PostInstallTimeline,
} from '../portal/postinstall/PostInstallView';

export default function PostInstallDashboard({
  initialSubView = 'overview',
}: {
  initialSubView?: 'overview' | 'ber' | 'seai' | 'payments';
}) {
  const [subView, setSubView] = useState<
    'overview' | 'ber' | 'seai' | 'payments'
  >(initialSubView);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<any[]>([]);

  const [metrics, setMetrics] = useState({
    totalPostInstall: 94,
    berScheduledCount: 18,
    berUploadedCount: 88,
    seaiReviewQueue: 6,
    seaiApprovalRate: '96.8%',
    seaiPaymentRate: '93.6%',
    averageTimeToPayment: '7.1 days',
    totalDisbursed: '€2,475,200',
    regionalPayments: [
      { county: 'Limerick', count: 34, amount: '€896,000' },
      { county: 'Cork', count: 28, amount: '€738,000' },
      { county: 'Clare', count: 18, amount: '€474,000' },
      { county: 'Kerry', count: 14, amount: '€367,200' },
    ],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiGet('/api/postinstall');
      if (res && res.records) {
        setRecords(res.records);
      }
    } catch (err) {
      console.error('Postinstall dashboard fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateEvent = async (postInstallId: string, event: string) => {
    try {
      await apiPost('/api/postinstall/update', {
        postInstall_id: postInstallId,
        event,
      });
      fetchData();
    } catch (err) {
      console.error('Update postinstall event error', err);
    }
  };

  return (
    <div className="flex flex-col gap-5 text-left font-sans">
      {/* Top Banner */}
      <div className="glass-card p-6 border border-emerald-500/20 rounded-2xl bg-slate-900/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold tracking-wider">
            Phase 31 Final Mile Management Engine
          </span>
          <h2 className="text-xl font-bold text-white mt-0.5">
            Post-Install BER & SEAI Payment Fulfillment
          </h2>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="px-4 py-2 bg-slate-950/80 border border-white/10 text-xs font-mono font-bold text-slate-300 hover:text-white rounded-xl transition flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Operations</span>
        </button>
      </div>

      {/* Navigation Bar */}
      <div className="flex items-center gap-2 font-mono text-xs border-b border-white/10 pb-3">
        <button
          onClick={() => setSubView('overview')}
          className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
            subView === 'overview'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Overview Queue
        </button>
        <button
          onClick={() => setSubView('ber')}
          className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
            subView === 'ber'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          BER Scheduling & Certs
        </button>
        <button
          onClick={() => setSubView('seai')}
          className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
            subView === 'seai'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          SEAI Audit Review
        </button>
        <button
          onClick={() => setSubView('payments')}
          className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
            subView === 'payments'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Grant Payment Disbursements
        </button>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-sky-400">
            <Calendar size={18} />
            <span className="font-bold text-slate-300">
              BER Scheduled Queue
            </span>
          </div>
          <span className="text-3xl font-bold text-sky-300 mt-3">
            {metrics.berScheduledCount}
          </span>
        </div>

        <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-purple-400">
            <FileText size={18} />
            <span className="font-bold text-slate-300">BER Certs Uploaded</span>
          </div>
          <span className="text-3xl font-bold text-purple-300 mt-3">
            {metrics.berUploadedCount}
          </span>
        </div>

        <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck size={18} />
            <span className="font-bold text-slate-300">SEAI Approval Rate</span>
          </div>
          <span className="text-3xl font-bold text-emerald-400 mt-3">
            {metrics.seaiApprovalRate}
          </span>
        </div>

        <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-yellow-400">
            <DollarSign size={18} />
            <span className="font-bold text-slate-300">
              Total Disbursed Funds
            </span>
          </div>
          <span className="text-3xl font-bold text-yellow-400 mt-3">
            {metrics.totalDisbursed}
          </span>
        </div>
      </div>

      {/* Main Queue View */}
      {(subView === 'overview' ||
        subView === 'ber' ||
        subView === 'seai' ||
        subView === 'payments') && (
        <div className="glass-card p-6 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-4 font-mono text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-400" />
            Post-Installation Fulfillment & Payment Queue
          </h3>

          <div className="flex flex-col gap-3">
            {records.map((rec, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-950/80 border border-white/5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">
                      {rec.postInstall_id}
                    </span>
                    <span className="text-sky-300 font-bold">
                      {rec.seaiReview?.reference || 'SEAI-2026-89412'}
                    </span>
                    <PostInstallBadge
                      status={
                        rec.seaiPayment?.status === 'paid'
                          ? 'paid'
                          : rec.seaiApproval?.status === 'approved'
                            ? 'approved'
                            : 'under_review'
                      }
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    BER Assessor: {rec.berAssessment?.assessor} | Scheduled:{' '}
                    {rec.berAssessment?.scheduled} | Rating Achieved:{' '}
                    <strong className="text-emerald-400">
                      {rec.berCert?.berRating || 'A'}
                    </strong>{' '}
                    | Amount:{' '}
                    <strong className="text-yellow-400">
                      €{(rec.seaiPayment?.amount || 22100).toLocaleString()}
                    </strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleUpdateEvent(rec.postInstall_id, 'ber_scheduled')
                    }
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-bold transition cursor-pointer"
                  >
                    Schedule BER
                  </button>
                  <button
                    onClick={() =>
                      handleUpdateEvent(rec.postInstall_id, 'ber_uploaded')
                    }
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold transition cursor-pointer"
                  >
                    Upload Cert
                  </button>
                  <button
                    onClick={() =>
                      handleUpdateEvent(rec.postInstall_id, 'seai_approved')
                    }
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition cursor-pointer"
                  >
                    Approve Grant
                  </button>
                  <button
                    onClick={() =>
                      handleUpdateEvent(rec.postInstall_id, 'seai_paid')
                    }
                    className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 rounded text-xs font-bold transition cursor-pointer"
                  >
                    Disburse €22,100
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regional Payment Distribution Card */}
      {subView === 'payments' && (
        <div className="glass-card p-6 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-4 font-mono text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <DollarSign size={18} className="text-yellow-400" />
            Regional SEAI Grant Payment Disbursements
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {metrics.regionalPayments.map((p, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-950/80 border border-white/5 rounded-xl flex justify-between items-center"
              >
                <div>
                  <span className="font-bold text-white text-sm">
                    County {p.county}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {p.count} Retrofits Disbursed
                  </p>
                </div>
                <span className="text-yellow-400 font-bold text-base">
                  {p.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
