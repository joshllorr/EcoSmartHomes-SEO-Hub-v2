import { Zap, Globe, Sparkles, Download, CheckCircle2 } from 'lucide-react';

export default function LinkerFooter() {
  return (
    <div
      className="space-y-6 pt-4 border-t border-white/10 text-left"
      id="linker-footer-container"
    >
      {/* How Link Bait Works Block */}
      <div className="glass-card p-6 md:p-8 rounded-2xl border border-white/10 bg-[#0f172a]/40 shadow-xl space-y-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#34d399]/20 text-[#34d399] flex items-center justify-center font-bold">
            <Zap size={18} />
          </div>
          <h2 className="text-xl font-display font-bold text-white tracking-tight">
            How Link Bait Works
          </h2>
        </div>

        <ol className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <li className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-2 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[#34d399] font-bold font-mono text-sm">
                <span className="w-6 h-6 rounded-full bg-[#34d399]/20 flex items-center justify-center text-xs">
                  1
                </span>
                <span>Enter Your Site</span>
              </div>
              <p className="text-slate-300 leading-relaxed pl-8">
                We analyze your niche, BER patterns, and target audience in
                Ireland.
              </p>
            </div>
            <div className="pl-8 text-[10px] font-mono text-slate-500 flex items-center gap-1">
              <Globe size={11} className="text-[#34d399]" />
              <span>Target domain scanning</span>
            </div>
          </li>

          <li className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-2 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[#34d399] font-bold font-mono text-sm">
                <span className="w-6 h-6 rounded-full bg-[#34d399]/20 flex items-center justify-center text-xs">
                  2
                </span>
                <span>Choose an Idea</span>
              </div>
              <p className="text-slate-300 leading-relaxed pl-8">
                AI-generated link bait concepts tailored to your industry &
                local search intent.
              </p>
            </div>
            <div className="pl-8 text-[10px] font-mono text-slate-500 flex items-center gap-1">
              <Sparkles size={11} className="text-emerald-400" />
              <span>Gemini 2.5 Flash ideas</span>
            </div>
          </li>

          <li className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-2 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[#34d399] font-bold font-mono text-sm">
                <span className="w-6 h-6 rounded-full bg-[#34d399]/20 flex items-center justify-center text-xs">
                  3
                </span>
                <span>Download & Publish</span>
              </div>
              <p className="text-slate-300 leading-relaxed pl-8">
                Get ready-to-use content & embeddable widgets that attract
                backlinks naturally.
              </p>
            </div>
            <div className="pl-8 text-[10px] font-mono text-slate-500 flex items-center gap-1">
              <Download size={11} className="text-purple-400" />
              <span>Instant embed code snippets</span>
            </div>
          </li>
        </ol>
      </div>

      {/* Educational Link Bait Callout Banner */}
      <div className="bg-linear-to-r from-[#34d399]/15 via-emerald-500/10 to-teal-500/10 border border-[#34d399]/30 p-5 rounded-xl flex items-start gap-3">
        <span className="text-xl select-none">⚡</span>
        <div className="space-y-1 text-xs">
          <span className="font-bold text-[#34d399] block font-display">
            What is Link Bait?
          </span>
          <p className="text-slate-200 leading-relaxed">
            Content designed to be so useful that other websites naturally link
            to it. Think reference charts, calculators, and comparison tools
            that solve real problems.
          </p>
        </div>
      </div>
    </div>
  );
}
