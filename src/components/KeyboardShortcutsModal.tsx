import React from 'react';
import {
  X,
  Keyboard,
  Sparkles,
  LayoutDashboard,
  FileText,
  Search,
  TrendingUp,
  Globe,
  Lightbulb,
  Link2,
  BookOpen,
  Zap,
} from 'lucide-react';
import { PRIMARY_DASHBOARD_SHORTCUTS } from '../hooks/useDashboardShortcuts';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tabId: string) => void;
  activeTab: string;
}

const TAB_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  dashboard: LayoutDashboard,
  writer: FileText,
  keywords: Search,
  serp: TrendingUp,
  audit: Globe,
  content_ideas: Lightbulb,
  link_builder: Link2,
  library: BookOpen,
  crawler: Zap,
};

export default function KeyboardShortcutsModal({
  isOpen,
  onClose,
  onSelectTab,
  activeTab,
}: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const isMac =
    typeof window !== 'undefined' &&
    navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? '⌘' : 'Ctrl';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-modal-title"
    >
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Keyboard size={18} />
            </div>
            <div>
              <h2
                id="shortcuts-modal-title"
                className="text-base font-semibold text-white tracking-tight"
              >
                Keyboard Shortcuts
              </h2>
              <p className="text-xs text-slate-400">
                Quickly jump between primary dashboard workspaces
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close shortcuts dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body: Shortcut Grid */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Primary Dashboard Navigation</span>
            <span className="text-[11px] font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {modKey} + 1..9 or Alt + 1..9
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {PRIMARY_DASHBOARD_SHORTCUTS.map((item) => {
              const Icon = TAB_ICONS[item.id] || Sparkles;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition group cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-xs'
                      : 'bg-slate-800/40 hover:bg-slate-800 border-slate-700/50 hover:border-slate-600 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-800 text-slate-400 group-hover:text-emerald-400'
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold truncate text-white">
                        {item.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {item.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <kbd className="px-2 py-1 text-[10px] font-mono font-semibold bg-slate-950 border border-slate-700 rounded-md text-slate-300 shadow-inner">
                      {modKey}+{item.key}
                    </kbd>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Additional helpful shortcuts */}
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              General Controls
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/30 border border-slate-800 text-xs">
                <span className="text-slate-300">Toggle Keyboard Shortcuts</span>
                <kbd className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-slate-950 border border-slate-700 rounded text-slate-300">
                  ? or {modKey}+/
                </kbd>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/30 border border-slate-800 text-xs">
                <span className="text-slate-300">Close Modals / Overlays</span>
                <kbd className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-slate-950 border border-slate-700 rounded text-slate-300">
                  Esc
                </kbd>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Press any number combination to jump immediately</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
