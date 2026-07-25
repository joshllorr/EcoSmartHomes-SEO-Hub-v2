import { useDashboardStore } from "../../store/useDashboardStore";

export interface InternalLinkItem {
  source: string;
  target: string;
  anchor: string;
  reason: string;
  placement: string;
}

export default function InternalLinks() {
  const links = useDashboardStore((s) => s.internalLinks);

  if (!links || !links.length) {
    return <p className="text-slate-400 text-sm italic">No internal link suggestions yet.</p>;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg space-y-4 text-slate-900 text-left border border-slate-200" id="internal-links-container">
      <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
        <span>🔗 Suggested Internal Links ({links.length})</span>
      </h2>

      {links.map((l: InternalLinkItem, i: number) => (
        <div key={i} className="border-b border-slate-200 pb-3.5 last:border-b-0 space-y-1 text-sm">
          <p><strong className="text-slate-900 font-semibold">Source:</strong> <span className="text-slate-700">{l.source}</span></p>
          <p><strong className="text-slate-900 font-semibold">Target:</strong> <span className="text-blue-600 font-medium">{l.target}</span></p>
          <p>
            <strong className="text-slate-900 font-semibold">Anchor:</strong>{" "}
            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-md font-mono text-xs font-semibold">
              {l.anchor}
            </span>
          </p>
          <p><strong className="text-slate-900 font-semibold">Reason:</strong> <span className="text-slate-700">{l.reason}</span></p>
          <p><strong className="text-slate-900 font-semibold">Placement:</strong> <span className="text-indigo-600 font-medium">{l.placement}</span></p>
        </div>
      ))}
    </div>
  );
}
