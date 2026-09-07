import { useEffect, useState } from 'react';
import { generateRetrofitPdfHtml } from '../engines/logic/pdf/retrofitPdf';

export default function PdfViewer() {
  const [html, setHtml] = useState<string>('');

  useEffect(() => {
    let id = 'grant_2026_08_03_1207';
    if (typeof window !== 'undefined') {
      const match =
        window.location.pathname.match(/\/plan\/([^/]+)\/pdf/) ||
        window.location.hash.match(/\/plan\/([^/]+)\/pdf/);
      if (match && match[1]) {
        id = match[1];
      }
    }

    const plan = {
      plan_id: id.startsWith('plan_') ? id : `plan_${id}`,
      grant_id: id,
    };
    const user = {
      name: "Sarah O'Connor",
      eircode: id.includes('1142') ? 'T12 Y5R8' : 'V94 X2C9',
    };

    setHtml(generateRetrofitPdfHtml(plan, user));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <div className="no-print p-4 bg-slate-900 border-b border-white/10 flex items-center justify-between">
        <span className="font-mono text-xs text-emerald-400 font-bold uppercase tracking-wider">
          SEAI Official Retrofit Blueprint · Client Preview
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold font-mono text-xs rounded-lg shadow cursor-pointer"
          >
            🖨️ Print / Save as PDF
          </button>
          <a
            href="/"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs rounded-lg"
          >
            ← Back to Hub
          </a>
        </div>
      </div>
      <iframe
        srcDoc={html}
        title="SEAI Retrofit Blueprint PDF"
        className="w-full flex-1 border-0 min-h-[90vh] bg-white"
      />
    </div>
  );
}
