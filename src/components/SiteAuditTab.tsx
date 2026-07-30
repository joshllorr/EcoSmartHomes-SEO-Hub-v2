import { Globe, RefreshCw, CheckCircle2, AlertTriangle, FileText, ArrowRight, Server, Search } from "lucide-react";
import { useState } from "react";

interface SiteAuditTabProps {
  onScanSuccess: () => void;
  site: string;
  isScanned: boolean;
}

export default function SiteAuditTab({
  onScanSuccess,
  site,
  isScanned
}: SiteAuditTabProps) {
  const [urlInput, setUrlInput] = useState(`https://${site}`);
  const [sitemapPath, setSitemapPath] = useState("/sitemap.xml");
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(isScanned);

  const triggerAudit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setShowResults(true);
      onScanSuccess();
    }, 1800);
  };

  const auditIssues = [
    { severity: "High", title: "Sitemap Configuration", desc: "Sitemap referenced correctly at /sitemap.xml", status: "Resolved" },
    { severity: "Medium", title: "Local Business Schema Markup", desc: "LocalBusiness & ProfessionalService JSON-LD Schema markup active on homepage <head>", status: "Resolved" },
    { severity: "Low", title: "Heat Pump Image Alt Text", desc: "All 4 heat pump images updated with descriptive SEAI-optimized alt tags", status: "Resolved" }
  ];

  return (
    <div className="space-y-6 text-left" id="site-audit-tab">
      <div>
        <h2 className="text-xl md:text-2xl font-display font-semibold text-white tracking-tight flex items-center gap-2">
          <Globe className="text-[#34d399]" />
          <span>Site Health & Sitemap Crawler</span>
        </h2>
        <p className="text-slate-400 text-xs mt-1">
          Perform high-precision diagnostics audits on URLs to confirm index accessibility for search indexing.
        </p>
      </div>

      <div className="glass-card p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5 flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Target Website URL
            </label>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="px-3.5 py-2.5 bg-black/30 border border-white/10 rounded-xl text-xs font-mono text-white focus:ring-2 focus:ring-[#34d399]/20 focus:border-[#34d399] outline-hidden"
              placeholder="https://ecosmarthomes.ie"
            />
          </div>

          <div className="md:col-span-4 flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              XML Sitemap Path
            </label>
            <input
              type="text"
              value={sitemapPath}
              onChange={(e) => setSitemapPath(e.target.value)}
              className="px-3.5 py-2.5 bg-black/30 border border-white/10 rounded-xl text-xs font-mono text-[#34d399] font-bold focus:ring-2 focus:ring-[#34d399]/20 focus:border-[#34d399] outline-hidden"
              placeholder="/sitemap.xml"
            />
          </div>

          <div className="md:col-span-3 flex items-end">
            <button
              onClick={triggerAudit}
              disabled={loading}
              className="w-full bg-[#34d399] hover:bg-[#2bc48d] text-[#0f172a] disabled:bg-white/5 disabled:text-slate-500 py-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer border border-transparent"
            >
              {loading ? (
                <>
                  <RefreshCw size={13} className="animate-spin text-[#0f172a]" />
                  <span>Crawling URL...</span>
                </>
              ) : (
                <>
                  <Server size={13} />
                  <span>Execute Crawl Scan</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {showResults ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-300">
          {/* Audit Metrics */}
          <div className="lg:col-span-4 space-y-4">
            <div className="glass-card p-5 text-center flex flex-col items-center justify-center border border-emerald-500/20">
              <span className="text-xs uppercase font-mono text-[#34d399] font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Optimal Health
              </span>
              <span className="text-5xl font-bold font-mono text-white mt-3">100<span className="text-lg text-slate-400">/100</span></span>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Site health optimal! Schema markup & image alt text fully optimized. Index crawlers parse all 12 energy routes seamlessly.
              </p>
            </div>

            <div className="glass-card p-5 space-y-3.5">
              <h4 className="font-semibold text-white text-xs">Technical Indicators</h4>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">HTTPS Status</span>
                <span className="text-[#34d399] font-bold font-mono">Secure (200)</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-white/10 pt-2">
                <span className="text-slate-400">Robot.txt</span>
                <span className="text-[#34d399] font-bold font-mono">Valid</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-white/10 pt-2">
                <span className="text-slate-400">Page Load Index</span>
                <span className="text-[#34d399] font-bold font-mono">0.4s (Excellent)</span>
              </div>
            </div>
          </div>

          {/* Issue List */}
          <div className="lg:col-span-8 glass-card p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <h4 className="font-semibold text-white text-sm">Diagnostic Audit Log</h4>
              <span className="text-[10px] bg-white/10 text-slate-300 border border-white/5 px-2 py-0.5 rounded">
                3 crawl records found
              </span>
            </div>

            <div className="space-y-3">
              {auditIssues.map((issue, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-white/10 flex items-start gap-3.5 justify-between bg-white/5 hover:bg-white/10 transition">
                  <div className="flex gap-2.5 items-start text-left">
                    <span className={`text-[9px] font-bold font-mono uppercase px-1.5 py-0.5 rounded mt-0.5 shrink-0 ${
                      issue.severity === "High"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : issue.severity === "Medium"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                    }`}>
                      {issue.severity}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold text-white">{issue.title}</span>
                      <span className="text-[11px] text-slate-400 mt-0.5">{issue.desc}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    issue.status === "Resolved"
                      ? "bg-emerald-500/20 text-[#34d399] border border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  }`}>
                    {issue.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white/5 border-2 border-dashed border-white/10 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[220px]">
          <div className="w-12 h-12 rounded-full bg-white/5 text-slate-400 flex items-center justify-center mb-3 border border-white/10">
            <Search size={18} />
          </div>
          <h4 className="font-display font-semibold text-slate-200 text-sm">Ready for Technical Audit</h4>
          <p className="text-xs text-slate-400 max-w-sm mt-1 leading-normal">
            Execute the crawl diagnostics to search ecosmarthomes.ie for critical tags and site index sitemaps. Point to a valid .xml file to resolve indexation fails.
          </p>
        </div>
      )}
    </div>
  );
}
