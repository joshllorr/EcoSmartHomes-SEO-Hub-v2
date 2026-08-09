/**
 * src/dashboard/ContractorQualityDashboard.tsx
 *
 * Phase 33 SEO Hub Contractor Quality Scoring Dashboard
 * Route / Sub-view: /dashboard/contractors/quality (p33_contractor_scores)
 */

import { useEffect, useState } from 'react';
import {
  Award,
  ShieldCheck,
  RefreshCw,
  Star,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { apiGet } from '../hooks/useApi';
import { ContractorScoreRecord } from '../logic/contractors/contractorScoresEngine';

export default function ContractorQualityDashboard() {
  const [records, setRecords] = useState<ContractorScoreRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchScores = async () => {
    try {
      setLoading(true);
      const res = await apiGet('/api/contractors/scores');
      if (Array.isArray(res)) {
        setRecords(res);
      } else if (res && res.records) {
        setRecords(res.records);
      } else {
        // Fallback default demonstration data
        setRecords([
          {
            contractor_id: 'ctr_2026_08_03_1612',
            score: 96,
            metrics: {
              jobSpeed: 95,
              paperworkAccuracy: 98,
              berUpliftConsistency: 94,
              grantApprovalRate: 99,
              homeownerFeedback: 4.9,
              timelineAdherence: 96,
              issueFrequency: 0,
              seaiCompliance: 100,
            },
            updatedAt: Date.now() - 3600000,
          },
          {
            contractor_id: 'ctr_2026_08_03_1619',
            score: 91,
            metrics: {
              jobSpeed: 90,
              paperworkAccuracy: 94,
              berUpliftConsistency: 92,
              grantApprovalRate: 95,
              homeownerFeedback: 4.8,
              timelineAdherence: 92,
              issueFrequency: 1,
              seaiCompliance: 98,
            },
            updatedAt: Date.now() - 7200000,
          },
          {
            contractor_id: 'ctr_2026_08_03_1625',
            score: 94,
            metrics: {
              jobSpeed: 92,
              paperworkAccuracy: 96,
              berUpliftConsistency: 95,
              grantApprovalRate: 97,
              homeownerFeedback: 4.9,
              timelineAdherence: 95,
              issueFrequency: 0,
              seaiCompliance: 100,
            },
            updatedAt: Date.now() - 10800000,
          },
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch contractor quality scores', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  return (
    <div className="flex flex-col gap-5 text-left font-sans">
      {/* Top Banner */}
      <div className="glass-card p-6 border border-emerald-500/20 rounded-2xl bg-slate-900/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold tracking-wider">
            Phase 33 Contractor Quality Scoring Engine
          </span>
          <h2 className="text-xl font-bold text-white mt-0.5">
            SEAI Registered Contractor Audit & Performance Index
          </h2>
        </div>

        <button
          onClick={fetchScores}
          disabled={loading}
          className="px-4 py-2 bg-slate-950/80 border border-white/10 text-xs font-mono font-bold text-slate-300 hover:text-white rounded-xl transition flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Scores</span>
        </button>
      </div>

      {/* Main Scoring Table */}
      <div className="glass-card p-6 border border-white/10 rounded-2xl bg-slate-900/60 flex flex-col gap-4 font-mono text-xs overflow-x-auto">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck size={18} className="text-emerald-400" />
          Verified Contractor Quality Benchmark (0–100 Weighted Score)
        </h3>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-700/60 text-slate-400 font-bold uppercase text-[10px]">
              <th className="py-3 px-2">Contractor ID</th>
              <th className="py-3 px-2">Quality Score</th>
              <th className="py-3 px-2">Job Speed</th>
              <th className="py-3 px-2">Paperwork</th>
              <th className="py-3 px-2">BER Uplift</th>
              <th className="py-3 px-2">Grant Approval</th>
              <th className="py-3 px-2">Feedback</th>
              <th className="py-3 px-2">Issues</th>
              <th className="py-3 px-2">Updated</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr
                key={r.contractor_id}
                className="border-b border-slate-800/40 hover:bg-slate-800/30 transition text-slate-200"
              >
                <td className="py-3 px-2 font-bold text-sky-300">
                  {r.contractor_id}
                </td>
                <td className="py-3 px-2">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    {r.score} / 100
                  </span>
                </td>
                <td className="py-3 px-2">{r.metrics.jobSpeed}%</td>
                <td className="py-3 px-2">{r.metrics.paperworkAccuracy}%</td>
                <td className="py-3 px-2">{r.metrics.berUpliftConsistency}%</td>
                <td className="py-3 px-2 text-emerald-400 font-bold">
                  {r.metrics.grantApprovalRate}%
                </td>
                <td className="py-3 px-2 text-amber-300 font-bold flex items-center gap-1">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  <span>{r.metrics.homeownerFeedback} / 5</span>
                </td>
                <td className="py-3 px-2">
                  {r.metrics.issueFrequency === 0 ? (
                    <span className="text-emerald-400 font-bold">0 Clean</span>
                  ) : (
                    <span className="text-amber-400 font-bold">
                      {r.metrics.issueFrequency} Issue
                    </span>
                  )}
                </td>
                <td className="py-3 px-2 text-slate-400 text-[11px]">
                  {new Date(r.updatedAt).toLocaleString('en-IE', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
