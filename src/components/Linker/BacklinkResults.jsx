import { useDashboardStore } from "../../store/useDashboardStore";

export default function BacklinkResults() {
  const backlinks = useDashboardStore((s) => s.backlinks);

  if (!backlinks.length) {
    return <p className="text-gray-500">No backlink opportunities yet.</p>;
  }

  return (
    <div className="space-y-6">
      {backlinks.map((b, i) => (
        <div key={i} className="bg-white p-6 rounded-xl shadow space-y-3">
          <h3 className="text-xl font-semibold">{b.site}</h3>
          <p className="text-blue-600">{b.url}</p>

          <p className="text-gray-700">
            <strong>Reason:</strong> {b.reason}
          </p>

          <p className="text-gray-700">
            <strong>Matches:</strong> {b.match}
          </p>

          <p className="text-gray-700">
            <strong>Contact:</strong> {b.contact}
          </p>

          <p className="text-emerald-600 font-semibold">
            Warm Score: {b.warm_score}/100
          </p>

          <button className="bg-slate-800 text-white px-4 py-2 rounded-lg">
            Add to Outreach Queue
          </button>
        </div>
      ))}
    </div>
  );
}
