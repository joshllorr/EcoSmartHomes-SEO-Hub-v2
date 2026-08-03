import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useDashboardStore } from '../store/useDashboardStore';
import TitleMetaViewer from '../components/SEO/TitleMetaViewer';

export default function TitleMeta() {
  const navigate = useNavigate();
  const data = useDashboardStore((s) => s.titleMeta);

  return (
    <div className="space-y-6 text-left" id="title-meta-page">
      {/* Navigation and breadcrumb bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 px-3.5 py-2 rounded-xl transition cursor-pointer"
          id="title-meta-back-btn"
        >
          <ArrowLeft size={14} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/10 bg-[#0f172a]/40 shadow-xl space-y-6">
        <TitleMetaViewer data={data} />
      </div>
    </div>
  );
}
