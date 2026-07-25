import { useDashboardStore } from "../../store/useDashboardStore";

export default function InternalLinks() {
  const links = useDashboardStore((s) => s.internalLinks);

  if (!links.length) {
    return <p className="text-gray-500">No internal link suggestions yet.</p>;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4 text-slate-900 text-left border border-slate-200">
      <h2 className="text-xl font-bold text-slate-900">Suggested Internal Links</h2>

      {links.map((l, i) => (
        <div key={i} className="border-b border-slate-200 pb-3 last:border-b-0 space-y-1">
          <p><strong className="text-slate-900">Source:</strong> {l.source}</p>
          <p><strong className="text-slate-900">Target:</strong> {l.target}</p>
          <p><strong className="text-slate-900">Anchor:</strong> <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono text-xs font-semibold">{l.anchor}</span></p>
          <p><strong className="text-slate-900">Reason:</strong> {l.reason}</p>
          <p><strong className="text-slate-900">Placement:</strong> {l.placement}</p>
        </div>
      ))}
    </div>
  );
}
