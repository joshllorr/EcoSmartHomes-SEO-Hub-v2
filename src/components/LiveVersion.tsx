import React from 'react';
import fingerprint from '../deployment/fingerprint.json';

export const LiveVersion: React.FC = () => (
  <div className="fixed bottom-2 right-2 text-[11px] font-mono opacity-80 bg-slate-900/90 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 rounded-lg z-50 pointer-events-none shadow-lg backdrop-blur-md flex items-center gap-1.5">
    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
    <span>v{fingerprint.version}</span>
    <span className="text-slate-500">•</span>
    <span>Phases {fingerprint.phases}</span>
  </div>
);

export default LiveVersion;
