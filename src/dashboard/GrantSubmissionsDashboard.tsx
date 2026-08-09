/**
 * src/dashboard/GrantSubmissionsDashboard.tsx
 *
 * Phase 30 SEO Hub Internal Grant Submission Operations & Intelligence Console
 * Views:
 * - Submissions Table (/dashboard/grants/submissions)
 * - Submission Inspector (/dashboard/grants/submissions/:id)
 * - Status Insights (/dashboard/grants/status)
 * - Global Timeline (/dashboard/grants/timeline)
 */

import { useState, useEffect } from 'react';
import {
  FileCheck,
  Award,
  TrendingUp,
  Clock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Eye,
  Filter,
  ArrowUpDown,
  DollarSign,
} from 'lucide-react';
import { apiGet, apiPost } from '../hooks/useApi';
import {
  StatusBadge,
  SubmissionTimeline,
} from '../portal/grants/GrantStatusView';

export default function GrantSubmissionsDashboard() {
  const [navTab, setNavTab] = useState<
    'table' | 'inspector' | 'insights' | 'timeline'
  >('table');
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const [metrics, setMetrics] = useState({
    totalSubmissions: 112,
    approvalRate: '96.8%',
    paymentRate: '93.6%',
    averageApprovalDays: '4.2 days',
    averagePaymentDays: '7.1 days',
    totalGrantPayout: '€2,475,200',
    pendingReview: 8,
    approvedCount: 94,
    paidCount: 88,
    rejectedCount: 4,
    rejectionReasons: [
      { reason: 'Missing NC6 Solar Form', count: 2 },
      { reason: 'Incomplete MPRN Utility Bill', count: 1 },
      { reason: 'Post-install BER cert discrepancy', count: 1 },
    ],
    funnel: [
      { stage: 'Draft Created', count: 120, avgDuration: '2.1h' },
      { stage: 'Ready for SEAI', count: 116, avgDuration: '1.4h' },
      { stage: 'Submitted', count: 112, avgDuration: '3.2h' },
      { stage: 'Under Review', count: 104, avgDuration: '4.2 days' },
      { stage: 'Approved', count: 94, avgDuration: '2.9 days' },
      { stage: 'Paid (Disbursed)', count: 88, avgDuration: '7.1 days' },
    ],
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiGet('/api/grants/submissions');
      if (res && res.submissions) {
        setSubmissions(res.submissions);
        if (!selectedSub && res.submissions.length > 0) {
          setSelectedSub(res.submissions[0]);
        }
      }
      const iRes = await apiGet('/api/grants/status/insights');
      if (iRes && iRes.metrics) {
        setMetrics((prev) => ({ ...prev, ...iRes.metrics }));
      }
    } catch (err) {
      console.error('Submissions dashboard fetch error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (
    submissionId: string,
    newStatus: string,
    reason?: string,
  ) => {
    try {
      const res = await apiPost('/api/grants/submission/update', {
        submission_id: submissionId,
        status: newStatus,
        rejectionReason: reason,
      });

      if (res && res.record) {
        setSubmissions((prev) =>
          prev.map((s) => (s.submission_id === submissionId ? res.record : s)),
        );
        if (selectedSub?.submission_id === submissionId) {
          setSelectedSub(res.record);
        }
      } else {
        fetchData();
      }
      setShowRejectModal(false);
      setRejectionReasonInput('');
    } catch (err) {
      console.error('Update submission status error', err);
    }
  };

  const filteredSubmissions = submissions.filter((s) => {
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-5 text-left font-sans">
      {/* Top Banner */}
      <div className="glass-card p-6 border border-emerald-500/20 rounded-2xl bg-slate-900/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold tracking-wider">
            Phase 30 SEAI Grant Submission Intelligence Engine
          </span>
          <h2 className="text-xl font-bold text-white mt-0.5">
            SEAI Submissions Operations & Analytics
          </h2>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="px-4 py-2 bg-slate-950/80 border border-white/10 text-xs font-mono font-bold text-slate-300 hover:text-white rounded-xl transition flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 font-mono text-xs border-b border-white/10 pb-3">
        <button
          onClick={() => setNavTab('table')}
          className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
            navTab === 'table'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Submissions Queue
        </button>
        <button
          onClick={() => setNavTab('inspector')}
          className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
            navTab === 'inspector'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Payload Inspector
        </button>
        <button
          onClick={() => setNavTab('insights')}
          className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
            navTab === 'insights'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Status Insights & Funnel
        </button>
        <button
          onClick={() => setNavTab('timeline')}
          className={`px-4 py-2 rounded-xl font-bold transition cursor-pointer ${
            navTab === 'timeline'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Global Lifecycle Funnel
        </button>
      </div>

      {/* VIEW 1: SUBMISSIONS QUEUE TABLE */}
      {navTab === 'table' && (
        <div className="flex flex-col gap-4">
          {/* Summary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
            <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-sky-400">
                <FileCheck size={18} />
                <span className="font-bold text-slate-300">
                  Total Submissions
                </span>
              </div>
              <span className="text-3xl font-bold text-sky-300 mt-3">
                {metrics.totalSubmissions}
              </span>
            </div>

            <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 size={18} />
                <span className="font-bold text-slate-300">Approval Rate</span>
              </div>
              <span className="text-3xl font-bold text-emerald-400 mt-3">
                {metrics.approvalRate}
              </span>
            </div>

            <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-indigo-400">
                <Clock size={18} />
                <span className="font-bold text-slate-300">
                  Avg Approval Time
                </span>
              </div>
              <span className="text-3xl font-bold text-indigo-300 mt-3">
                {metrics.averageApprovalDays}
              </span>
            </div>

            <div className="glass-card p-5 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-purple-400">
                <Award size={18} />
                <span className="font-bold text-slate-300">
                  Disbursed Funds
                </span>
              </div>
              <span className="text-3xl font-bold text-purple-300 mt-3">
                {metrics.totalGrantPayout}
              </span>
            </div>
          </div>

          {/* Queue Filter Bar */}
          <div className="glass-card p-4 border border-white/10 rounded-2xl bg-slate-900/60 flex justify-between items-center font-mono text-xs">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-sky-400" />
              <span className="text-slate-300 font-bold">
                Filter by Status:
              </span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-950 border border-white/10 text-white rounded px-2.5 py-1 font-mono text-xs focus:outline-none focus:border-sky-500"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="ready">Ready</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="glass-card p-6 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-4 font-mono text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400" />
              Auditable SEAI Applications Queue
            </h3>

            <div className="flex flex-col gap-3">
              {filteredSubmissions.map((sub, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-slate-950/80 border border-white/5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">
                        {sub.homeowner?.name || 'Homeowner'}
                      </span>
                      <span className="text-sky-300 font-bold">
                        {sub.seaiReference}
                      </span>
                      <StatusBadge status={sub.status} />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Eircode: {sub.homeowner?.eircode} | Total Grant:{' '}
                      <strong className="text-emerald-400">
                        €
                        {(
                          sub.totals?.totalGrant ||
                          sub.totalGrant ||
                          22100
                        ).toLocaleString()}
                      </strong>{' '}
                      | Contractor: {sub.contractor?.name || sub.contractor}
                    </p>

                    {sub.statusHistory && sub.statusHistory.length > 0 && (
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                        <span className="text-slate-500 font-bold">
                          Audit Trail:
                        </span>
                        {sub.statusHistory.map((h: any, hIdx: number) => (
                          <span key={hIdx} className="flex items-center gap-1">
                            <span className="text-sky-400 font-bold">
                              {h.status}
                            </span>
                            {hIdx < sub.statusHistory.length - 1 && (
                              <span className="text-slate-600">➔</span>
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedSub(sub);
                        setNavTab('inspector');
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye size={13} />
                      Inspect Payload
                    </button>

                    {sub.status === 'draft' && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(sub.submission_id, 'ready')
                        }
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded text-xs font-bold transition cursor-pointer"
                      >
                        Mark Ready
                      </button>
                    )}
                    {(sub.status === 'ready' || sub.status === 'draft') && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(sub.submission_id, 'submitted')
                        }
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold transition cursor-pointer"
                      >
                        Submit Payload
                      </button>
                    )}
                    {sub.status === 'submitted' && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(sub.submission_id, 'under_review')
                        }
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-bold transition cursor-pointer"
                      >
                        Move to Review
                      </button>
                    )}
                    {sub.status === 'under_review' && (
                      <>
                        <button
                          onClick={() =>
                            handleUpdateStatus(sub.submission_id, 'approved')
                          }
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold transition cursor-pointer"
                        >
                          Approve Application
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSub(sub);
                            setShowRejectModal(true);
                          }}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded text-xs font-bold transition cursor-pointer"
                        >
                          Reject Application
                        </button>
                      </>
                    )}
                    {sub.status === 'approved' && (
                      <button
                        onClick={() =>
                          handleUpdateStatus(sub.submission_id, 'paid')
                        }
                        className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 rounded text-xs font-bold transition cursor-pointer"
                      >
                        Mark Funds Disbursed
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: SUBMISSION INSPECTOR */}
      {navTab === 'inspector' && selectedSub && (
        <div className="flex flex-col gap-5 text-left font-mono text-xs">
          <div className="p-6 bg-slate-900/80 border border-white/10 rounded-2xl flex justify-between items-center">
            <div>
              <span className="text-[10px] text-sky-400 uppercase font-bold">
                Inspect Application Payload
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {selectedSub.submission_id}
              </h3>
              <p className="text-xs text-slate-400">
                Homeowner: {selectedSub.homeowner?.name} | Reference:{' '}
                {selectedSub.seaiReference}
              </p>
            </div>
            <StatusBadge status={selectedSub.status} />
          </div>

          <div className="p-5 bg-slate-950/80 border border-white/10 rounded-2xl overflow-x-auto">
            <h4 className="text-xs font-bold text-slate-400 mb-2">
              Raw JSON Payload (GRANT_SUBMISSIONS KV Format)
            </h4>
            <pre className="text-[11px] text-emerald-300 font-mono leading-relaxed">
              {JSON.stringify(selectedSub, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* VIEW 3: STATUS INSIGHTS */}
      {navTab === 'insights' && (
        <div className="flex flex-col gap-5 text-left font-mono text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col gap-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-400" />
                SEAI Application Performance Metrics
              </h3>
              <div className="flex justify-between items-center p-3 bg-slate-950/80 rounded-xl border border-white/5">
                <span className="text-slate-400">Overall Approval Rate:</span>
                <span className="text-emerald-400 font-bold text-sm">
                  {metrics.approvalRate}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-950/80 rounded-xl border border-white/5">
                <span className="text-slate-400">
                  Payment Disbursement Rate:
                </span>
                <span className="text-yellow-400 font-bold text-sm">
                  {metrics.paymentRate}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-950/80 rounded-xl border border-white/5">
                <span className="text-slate-400">
                  Average Approval Duration:
                </span>
                <span className="text-indigo-300 font-bold text-sm">
                  {metrics.averageApprovalDays}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-950/80 rounded-xl border border-white/5">
                <span className="text-slate-400">
                  Average Payment Duration:
                </span>
                <span className="text-purple-300 font-bold text-sm">
                  {metrics.averagePaymentDays}
                </span>
              </div>
            </div>

            <div className="p-5 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col gap-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-400" />
                SEAI Rejection Reasons Analysis
              </h3>
              {metrics.rejectionReasons.map((r, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-950/80 rounded-xl border border-white/5 flex justify-between items-center"
                >
                  <span className="text-slate-300">{r.reason}</span>
                  <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-[10px] font-bold">
                    {r.count} cases
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: GLOBAL LIFECYCLE FUNNEL */}
      {navTab === 'timeline' && (
        <div className="p-6 bg-slate-900/80 border border-white/10 rounded-2xl flex flex-col gap-4 font-mono text-xs text-left">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock size={16} className="text-sky-400" />
            Global SEAI Grant Submission Lifecycle Funnel
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
            {metrics.funnel.map((stage, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-950/80 border border-white/5 rounded-xl flex flex-col justify-between text-center"
              >
                <span className="text-[10px] text-slate-400 uppercase font-bold">
                  {stage.stage}
                </span>
                <span className="text-xl font-bold text-emerald-400 my-2">
                  {stage.count}
                </span>
                <span className="text-[10px] text-sky-300">
                  Avg: {stage.avgDuration}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {showRejectModal && selectedSub && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-card p-6 border border-rose-500/30 rounded-2xl bg-slate-900 w-full max-w-md flex flex-col gap-4 font-mono text-xs text-left">
            <h3 className="text-sm font-bold text-rose-400">
              Reject Application ({selectedSub.submission_id})
            </h3>
            <p className="text-slate-300">
              Specify SEAI rejection reason to append to the status history
              audit trail:
            </p>
            <input
              type="text"
              placeholder="e.g. Missing NC6 Solar Form"
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              className="bg-slate-950 border border-white/10 text-white rounded p-2.5 font-mono text-xs focus:outline-none focus:border-rose-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleUpdateStatus(
                    selectedSub.submission_id,
                    'rejected',
                    rejectionReasonInput || 'SEAI Documentation Discrepancy',
                  )
                }
                className="px-3 py-1.5 bg-rose-600 text-white rounded font-bold hover:bg-rose-500 cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
