import { useState } from "react";
import { Globe, RefreshCw, Sparkles, RotateCcw, Search } from "lucide-react";
import { LinkerTabType } from "./LinkerTabs";
import { generateLinkBaitIdeas } from "../../utils/generateLinkBaitIdeas";
import { runBacklinkScanner } from "../../utils/runBacklinkScanner";
import { useDashboardStore } from "../../store/useDashboardStore";

interface LinkerInputProps {
  websiteUrl?: string;
  onUrlChange?: (url: string) => void;
  pillarTopic?: string;
  onPillarTopicChange?: (topic: string) => void;
  previousSites?: string[];
  activeTab?: LinkerTabType;
  loading?: boolean;
  onSubmit?: () => void;
  onReset?: () => void;
}

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
}: LinkerInputProps) {
  const [internalPillarTopic, setInternalPillarTopic] = useState("");
  const [internalUrl, setInternalUrl] = useState("https://ecosmarthomes.ie");
  const [isScanning, setIsScanning] = useState(false);
  const [isBacklinkScanning, setIsBacklinkScanning] = useState(false);

  const pillarTopic = propPillarTopic !== undefined ? propPillarTopic : internalPillarTopic;

  const handlePillarTopicChange = (val: string) => {
    setInternalPillarTopic(val);
    if (onPillarTopicChange) onPillarTopicChange(val);
  };

  const linkBaitIdeas = useDashboardStore((s) => s.linkBaitIdeas);
  const setLinkBaitIdeas = useDashboardStore((s) => s.setLinkBaitIdeas);
  const setBacklinks = useDashboardStore((s) => s.setBacklinks);

  const currentUrl = propUrl !== undefined ? propUrl : internalUrl;

  const handleUrlChange = (val: string) => {
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
        className="w-full p-3 bg-black/40 border border-white/10 rounded-lg text-xs font-mono text-white focus:ring-2 focus:ring-[#34d399]/20 focus:border-[#34d399] outline-hidden"
      />

      <div className="flex flex-wrap gap-3 pt-1">
        <button
          onClick={onSubmit}
          disabled={loading || !currentUrl.trim()}
          className="bg-[#34d399] hover:bg-[#2bc48d] disabled:opacity-50 text-[#0f172a] px-5 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-[#34d399]/20"
          id="generate-link-bait-btn"
        >
          {loading ? (
            <>
              <RefreshCw size={14} className="animate-spin" />
              <span>Generating Ideas...</span>
            </>
          ) : (
            <>
              <Sparkles size={14} />
              <span>{buttonLabel}</span>
            </>
          )}
        </button>

        <button
          onClick={handleScanNewIdeas}
          disabled={isScanning}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-600/20"
          id="scan-new-ideas-btn"
        >
          {isScanning ? (
            <>
              <RefreshCw size={13} className="animate-spin" />
              <span>Scanning...</span>
            </>
          ) : (
            <>
              <Sparkles size={13} />
              <span>Scan for New Ideas</span>
            </>
          )}
        </button>

        <button
          onClick={handleScanBacklinks}
          disabled={isBacklinkScanning}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/20"
          id="scan-backlink-opps-btn"
        >
          {isBacklinkScanning ? (
            <>
              <RefreshCw size={13} className="animate-spin" />
              <span>Scanning Backlinks...</span>
            </>
          ) : (
            <>
              <Search size={13} />
              <span>Scan Backlink Opportunities</span>
            </>
          )}
        </button>

        <button
          onClick={handleReset}
          className="bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white px-4 py-2.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border border-white/10"
          id="linker-reset-btn"
        >
          <RotateCcw size={13} />
          <span>Reset</span>
        </button>
      </div>

      {previousSites.length > 0 && (
        <div className="flex items-center gap-2 pt-2 border-t border-white/5 text-xs">
          <span className="text-slate-400 font-mono text-[10px] uppercase font-bold">Previous Sites:</span>
          <div className="flex flex-wrap gap-1.5">
            {previousSites.map((domain, i) => (
              <button
                key={i}
                onClick={() => handleUrlChange(`https://${domain}`)}
                className={`text-[11px] font-mono px-2.5 py-0.5 rounded-md transition cursor-pointer border ${
                  currentUrl.includes(domain)
                    ? "bg-[#34d399]/20 text-[#34d399] border-[#34d399]/40 font-semibold"
                    : "bg-white/5 hover:bg-white/10 text-slate-300 border-white/5"
                }`}
              >
                {domain}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
