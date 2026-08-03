import { useDashboardStore } from '../store/useDashboardStore';

export default function ContentMap() {
  const graph = useDashboardStore((s) => s.contentGraph);

  return (
    <div className="p-8 space-y-10 text-left" id="content-map-view">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          EcoSmartHomes Content Universe
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-3xl">
          A live map of all pillar pages, link bait, articles, backlinks, and
          internal links.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Pillars */}
        <div className="bg-white p-6 rounded-xl shadow-lg space-y-3 text-slate-900 border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 border-b border-slate-200 pb-2">
            Pillar Pages
          </h2>
          {graph.pillars.length === 0 ? (
            <p className="text-slate-400 text-xs italic">
              No pillar pages created yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {graph.pillars.map((p: any, i: number) => (
                <li key={i} className="text-slate-700 text-sm font-medium">
                  {p.pillar_topic || p.title}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Link Bait */}
        <div className="bg-white p-6 rounded-xl shadow-lg space-y-3 text-slate-900 border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 border-b border-slate-200 pb-2">
            Link Bait
          </h2>
          {graph.linkBait.length === 0 ? (
            <p className="text-slate-400 text-xs italic">
              No link bait ideas scanned yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {graph.linkBait.map((l: any, i: number) => (
                <li key={i} className="text-slate-700 text-sm font-medium">
                  {l.title}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Articles */}
        <div className="bg-white p-6 rounded-xl shadow-lg space-y-3 text-slate-900 border border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900 border-b border-slate-200 pb-2">
            Articles
          </h2>
          {graph.articles.length === 0 ? (
            <p className="text-slate-400 text-xs italic">
              No articles generated yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {graph.articles.map((a: any) => (
                <li key={a.id} className="text-slate-700 text-sm font-medium">
                  {a.title}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Backlinks */}
      <div className="bg-white p-6 rounded-xl shadow-lg space-y-3 text-slate-900 border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900 border-b border-slate-200 pb-2">
          Backlink Opportunities
        </h2>
        {graph.backlinks.length === 0 ? (
          <p className="text-slate-400 text-xs italic">
            No backlink opportunities scanned yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {graph.backlinks.map((b: any, i: number) => (
              <li key={i} className="text-slate-700 text-sm font-medium">
                <span className="text-indigo-600 font-bold">{b.site}</span> →{' '}
                {b.match}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Internal Links */}
      <div className="bg-white p-6 rounded-xl shadow-lg space-y-3 text-slate-900 border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900 border-b border-slate-200 pb-2">
          Internal Links
        </h2>
        {graph.internalLinks.length === 0 ? (
          <p className="text-slate-400 text-xs italic">
            No internal link suggestions generated yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {graph.internalLinks.map((l: any, i: number) => (
              <li key={i} className="text-slate-700 text-sm font-medium">
                <span className="font-semibold text-slate-900">{l.source}</span>{' '}
                →{' '}
                <span className="text-blue-600 font-semibold">{l.target}</span>{' '}
                (
                <span className="bg-emerald-100 text-emerald-800 font-mono text-xs px-1.5 py-0.5 rounded">
                  {l.anchor}
                </span>
                )
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
