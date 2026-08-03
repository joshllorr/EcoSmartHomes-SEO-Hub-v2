import { ArrowRight, Link, Check, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';

interface WelcomeCardProps {
  onConnectCMS: () => void;
  isCMSConnected: boolean;
}

export default function WelcomeCard({
  onConnectCMS,
  isCMSConnected,
}: WelcomeCardProps) {
  const targetDomain = useDashboardStore((s) => s.targetDomain);
  const [showCMSModal, setShowCMSModal] = useState(false);
  const [selectedCMS, setSelectedCMS] = useState<
    'wordpress' | 'webflow' | 'custom' | null
  >(null);
  const [connecting, setConnecting] = useState(false);

  const handleConnect = () => {
    if (!selectedCMS) return;
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      onConnectCMS();
      setShowCMSModal(false);
    }, 1500);
  };

  return (
    <div className="glass-card p-6 relative overflow-hidden" id="welcome-card">
      {/* Decorative top green glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#34d399]/5 rounded-full blur-2xl"></div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-semibold text-white tracking-tight flex items-center gap-2">
            Welcome back, Joe{' '}
            <span className="text-emerald-500 text-lg">👋</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            You are managing SEO for{' '}
            <span className="font-semibold text-white">{targetDomain}</span>.
            Target energy-efficiency pillars to boost organic search rank and AI
            answers presence.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {isCMSConnected ? (
            <div className="flex items-center gap-2 bg-emerald-500/10 text-[#34d399] px-4 py-2.5 rounded-xl border border-emerald-500/20 text-xs font-semibold">
              <Check size={14} className="stroke-[3]" />
              <span>WordPress CMS Connected</span>
            </div>
          ) : (
            <button
              onClick={() => setShowCMSModal(true)}
              className="bg-[#34d399] text-[#0f172a] hover:bg-[#2bc48d] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
              id="connect-cms-welcome"
            >
              <Link size={14} />
              <span>Connect WordPress CMS</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>

      {/* CMS Connection Modal */}
      {showCMSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass-card max-w-md w-full p-6 shadow-xl animate-in fade-in duration-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-display font-bold text-white text-lg">
                Connect CMS Integration
              </h3>
              <button
                onClick={() => setShowCMSModal(false)}
                className="text-slate-400 hover:text-white font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Synchronize AI-generated content directly with your publishing
              pipeline to save manual export time.
            </p>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => setSelectedCMS('wordpress')}
                className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                  selectedCMS === 'wordpress'
                    ? 'border-[#34d399] bg-[#34d399]/10 text-white font-semibold'
                    : 'border-white/10 hover:border-white/20 bg-white/5 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-sm">
                    W
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs">WordPress Integration</span>
                    <span className="text-[10px] text-slate-400">
                      Push drafts directly to post index
                    </span>
                  </div>
                </div>
                {selectedCMS === 'wordpress' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#34d399]"></div>
                )}
              </button>

              <button
                onClick={() => setSelectedCMS('webflow')}
                className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                  selectedCMS === 'webflow'
                    ? 'border-[#34d399] bg-[#34d399]/10 text-white font-semibold'
                    : 'border-white/10 hover:border-white/20 bg-white/5 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-sm">
                    F
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs">Webflow CMS API</span>
                    <span className="text-[10px] text-slate-400">
                      Sync with collection tables
                    </span>
                  </div>
                </div>
                {selectedCMS === 'webflow' && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#34d399]"></div>
                )}
              </button>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCMSModal(false)}
                className="px-4 py-2 text-slate-400 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConnect}
                disabled={!selectedCMS || connecting}
                className="bg-[#34d399] hover:bg-[#2bc48d] disabled:opacity-50 text-[#0f172a] px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
              >
                {connecting ? (
                  <>
                    <span className="w-3 h-3 border-2 border-[#0f172a] border-t-transparent rounded-full animate-spin"></span>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={12} />
                    <span>Authorize & Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
