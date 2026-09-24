import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ExternalLink,
  Sparkles,
  Sun,
  Flame,
  FileText,
  MapPin,
  Check,
  Copy,
  TrendingDown,
  Award,
  Zap,
} from 'lucide-react';
import TargetAssetPage from '../pages/TargetAssetPage';

export interface TargetAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: {
    id: string;
    domain: string;
    domainAuthority: number;
    matchScore: string;
    targetPage: string;
    relevanceType: string;
    contactPerson?: string;
    outreachAngle: string;
    suggestedPitch: string;
    status: string;
  } | null;
  onNavigateToTab?: (tab: string) => void;
}

export default function TargetAssetModal({
  isOpen,
  onClose,
  opportunity,
  onNavigateToTab,
}: TargetAssetModalProps) {
  if (!isOpen || !opportunity) return null;

  // Extract slug from targetPage URL
  const slug =
    opportunity.targetPage.split('/').pop() || 'solar-pv-payback-estimator';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          className="bg-[#0b1120] border border-white/15 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] relative"
        >
          {/* Header Bar */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#0f172a]/90 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#34d399]/20 border border-[#34d399]/40 flex items-center justify-center text-[#34d399] font-bold text-xs font-mono">
                {opportunity.domain.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">
                    Live Target Asset Preview: {opportunity.domain}
                  </h3>
                  <span className="text-[10px] font-mono font-bold bg-[#34d399]/15 text-[#34d399] border border-[#34d399]/30 px-2 py-0.5 rounded">
                    Match {opportunity.matchScore}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-mono truncate max-w-md">
                  Target: {opportunity.targetPage}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Body: Embeds TargetAssetPage */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin scrollbar-thumb-slate-800">
            <TargetAssetPage
              initialSlug={slug}
              onNavigateToTab={(tab) => {
                onClose();
                if (onNavigateToTab) onNavigateToTab(tab);
              }}
              onBack={onClose}
            />
          </div>

          {/* Footer Info & Actions */}
          <div className="px-6 py-3 border-t border-white/10 bg-[#0f172a]/95 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
            <span className="text-slate-400 font-mono text-[11px]">
              Ready for client review · Zero broken external links · Live in-hub
              simulation
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-1.5 bg-white/10 hover:bg-white/15 text-slate-200 rounded-xl font-medium transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
