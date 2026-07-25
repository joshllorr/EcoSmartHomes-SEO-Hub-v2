import { useState } from "react";
import { Globe, RefreshCw, Sparkles, RotateCcw } from "lucide-react";
import { generateLinkBaitIdeas } from "../../utils/generateLinkBaitIdeas";
import { runBacklinkScanner } from "../../utils/runBacklinkScanner";
import { useDashboardStore } from "../../store/useDashboardStore";

export default function LinkerInput({
  websiteUrl: propUrl,
  onUrlChange,
  pillarTopic: propPillarTopic,
  onPillarTopicChange,
  previousSites = ["ecosmarthomes.ie", "retrofit-limerick.ie"],
  activeTab = "linker",
  loading = false,
  onSubmit,
  onReset
}) {
  const [internalPillarTopic, setInternalPillarTopic] = useState("");
  const [internalUrl, setInternalUrl] = useState("https://ecosmarthomes.ie");
  const [isScanning, setIsScanning] = useState(false);
  const [isBacklinkScanning, setIsBacklinkScanning] = useState(false);

  const pillarTopic = propPillarTopic !== undefined ? propPillarTopic : internalPillarTopic;

  const handlePillarTopicChange = (val) => {
    setInternalPillarTopic(val);
    if (onPillarTopicChange) onPillarTopicChange(val);
  };

  const linkBaitIdeas = useDashboardStore((s) => s.linkBaitIdeas);
  const setLinkBaitIdeas = useDashboardStore((s) => s.setLinkBaitIdeas);
  const setBacklinks = useDashboardStore((s) => s.setBacklinks);

  const currentUrl = propUrl !== undefined ? propUrl : internalUrl;

  const handleUrlChange = (val) => {
    setInternalUrl(val);
    if (onUrlChange) onUrlChange(val);
  };

  const handleReset = () => {
    setInternalUrl("https://ecosmarthomes.ie");
    if (onReset) onReset();
    else if (onUrlChange) onUrlChange("https://ecosmarthomes.ie");
  };

  const handleScanNewIdeas = async () => {
    setIsScanning(true);
    try {
      const ideas = await generateLinkBaitIdeas(currentUrl, pillarTopic);
      setLinkBaitIdeas(ideas);
    } catch (e) {
      console.error("Scan ideas error:", e);
    } finally {
      setIsScanning(false);
    }
  };

  const handleScanBacklinks = async () => {
    setIsBacklinkScanning(true);
    try {
      const results = await runBacklinkScanner(linkBaitIdeas);
      setBacklinks(results);
    } catch (e) {
      console.error("Scan backlinks error:", e);
    } finally {
      setIsBacklinkScanning(false);
    }
  };

  const buttonLabel = activeTab === "pillar_pages" 
    ? "Generate Pillar Page Ideas" 
    : activeTab === "link_bait" 
    ? "Generate Link Bait Ideas" 
    : "Find Link Opportunities";

  return (
    <div className="glass-card p-6 space-y-4 rounded-xl border border-white/10 bg-[#0f172a]/40 shadow-xl text-left" id="linker-input-card">
      {/* Pillar Topic Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1 text-slate-200">Pillar Topic</label>
        <input
          type="text"
          placeholder="Enter your pillar topic (e.g. Raising BER from G to A)"
          value={pillarTopic}
          onChange={(e) => handlePillarTopicChange(e.target.value)}
          className="border border-white/10 rounded-lg p-2.5 w-full bg-black/40 text-xs text-white outline-none focus:border-[#34d399]"
        />
      </div>

      <label className="block text-sm font-medium text-slate-200 flex items-center gap-1.5">
        <Globe size={14} className="text-[#34d399]" />
        <span>Website URL</span>
      </label>
      
      <input
        type="text"
        value={currentUrl}
        onChange={(e) => handleUrlChange(e.target.value)}
        placeholder="https://ecosmarthomes.ie"
        className="w-full p-3 bg-black/40 border border-white/10 rounded-lg text-xs font-mono text-white focus:ring-2 focus:ring-[#34d399]/20 focus:border-[#34d399] outline-none"
      />

      {previousSites && previousSites.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider shrink-0">Preset Domain:</span>
          {previousSites.map((site) => (
            <button
              key={site}
              type="button"
              onClick={() => handleUrlChange(`https://${site}`)}
              className="text-[10px] bg-white/5 hover:bg-white/10 text-slate-300 px-2 py-1 rounded border border-white/10 transition shrink-0 cursor-pointer"
            >
              {site}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSubmit || handleScanNewIdeas}
            disabled={loading || isScanning}
            className="btn-primary text-xs font-semibold flex items-center gap-2 px-4 py-2 bg-[#34d399] hover:bg-[#2bc48d] text-[#0f172a] rounded-lg transition disabled:opacity-50 cursor-pointer shadow-md"
          >
            {loading || isScanning ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Analyzing Domain...</span>
              </>
            ) : (
              <>
                <Sparkles size={14} />
                <span>{buttonLabel}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleScanBacklinks}
            disabled={isBacklinkScanning}
            className="text-xs font-semibold flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50 cursor-pointer shadow-md"
          >
            {isBacklinkScanning ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Scanning Web...</span>
              </>
            ) : (
              <>
                <Globe size={14} />
                <span>Scan Backlink Opportunities</span>
              </>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 transition cursor-pointer"
        >
          <RotateCcw size={12} />
          <span>Reset URL</span>
        </button>
      </div>
    </div>
  );
}
