import { useDashboardStore } from "../../store/useDashboardStore";

export default function BacklinkResults() {
  const backlinks = useDashboardStore((s) => s.backlinks);

  if (!backlinks.length) {
    return <p className="text-slate-400 text-sm italic">No backlink opportunities yet.</p>;
  }

  return (
    <div className="space-y-6 text-left">
      <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
        <span>🔗 Scanned Backlink Opportunities ({backlinks.length})</span>
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        {backlinks.map((b: any, i: number) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-lg space-y-3 text-slate-800 border border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900">{b.site}</h3>
            <p className="text-blue-600 font-mono text-sm break-all">{b.url}</p>

            <p className="text-gray-700 text-sm">
              <strong className="text-slate-900">Reason:</strong> {b.reason}
            </p>

            <p className="text-gray-700 text-sm">
              <strong className="text-slate-900">Matches:</strong> {b.match}
            </p>

            <p className="text-gray-700 text-sm">
              <strong className="text-slate-900">Contact:</strong> {b.contact}
            </p>

            <p className="text-emerald-600 font-semibold text-sm">
              Warm Score: {b.warm_score}/100
            </p>

            <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer">
              Add to Outreach Queue
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
