import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LinkerTabs from "../components/Linker/LinkerTabs";
import LinkerInput from "../components/Linker/LinkerInput";
import LinkerIdeasGrid from "../components/Linker/LinkerIdeasGrid";
import LinkerFooter from "../components/Linker/LinkerFooter";
import BacklinkResults from "../components/Linker/BacklinkResults";
import InternalLinks from "../components/Linker/InternalLinks";
import { useDashboardStore } from "../store/useDashboardStore";

export default function Linker() {
  const navigate = useNavigate();
  const location = useLocation();
  const targetDomain = useDashboardStore((s) => s.targetDomain);
  const generateArticle = useDashboardStore((s) => s.generateArticle);

  const activeTab = location.pathname === "/pillar-pages" 
    ? "pillar_pages" 
    : location.pathname === "/link-bait" 
    ? "link_bait" 
    : "linker";

  const [pillarTopic, setPillarTopic] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState(`https://${targetDomain || "ecosmarthomes.ie"}/`);
  const [previousSites] = useState([
    targetDomain || "ecosmarthomes.ie",
    "ecosmarthomes.ie",
    "retrofit-limerick.ie"
  ]);

  const [loading, setLoading] = useState(false);

  const [opportunities, setOpportunities] = useState([
    {
      id: "link-op-1",
      domain: "constructireland.ie",
      domainAuthority: 58,
      matchScore: "96%",
      targetPage: `https://${targetDomain || "ecosmarthomes.ie"}/ber-rating-upgrade-guide`,
      relevanceType: "Irish Construction & Sustainable Building Portal",
      contactPerson: "Editorial Team (info@constructireland.ie)",
      outreachAngle: "Resource Page Link",
      suggestedPitch: "Hi Editors, noticed your round-up of Irish retrofitting standards. We published an interactive 2026 SEAI grant breakdown and BER rating calculator for homeowners. Thought it would be a valuable addition to your contractor resource guide.",
      status: "Uncontacted"
    },
    {
      id: "link-op-2",
      domain: "energyperformancedatabase.ie",
      domainAuthority: 64,
      matchScore: "92%",
      targetPage: `https://${targetDomain || "ecosmarthomes.ie"}/heat-pump-cost-calculator`,
      relevanceType: "BER & Energy Advisory Directory",
      contactPerson: "Seán O'Connor (editor@energyperformancedatabase.ie)",
      outreachAngle: "Guest Expert / Data Reference",
      suggestedPitch: "Hi Seán, loved your recent article on heat pump COP ratings in Irish climates. We released a comprehensive 10-year running cost comparison model between gas boilers and air-to-water heat pumps. Would love to contribute dynamic data points or be referenced.",
      status: "Uncontacted"
    }
  ]);

  const [pillars, setPillars] = useState([
    {
      id: "pillar-1",
      title: "The Ultimate 2026 Irish Home Retrofit & BER Rating Upgrade Bible",
      summary: "A 5,000-word authoritative master guide detailing the exact sequence for upgrading home energy ratings from G to A2, SEAI grant claiming rules, heat pump integration, and airtightness standards.",
      targetQuery: "complete home retrofit guide ireland",
      estimatedVolume: "18.5K/mo",
      authorityScore: 98,
      difficulty: "MEDIUM",
      difficultyScore: 48,
      subtopicClusters: [
        "SEAI One-Stop-Shop vs Individual Contractor Grants",
        "Heat Pump Installation & Radiator Sizing Checklist",
        "External Wall Insulation (EWI) vs Cavity Pumping",
        "Attic & Roof Insulation Airtightness Membranes"
      ],
      linkBaitAngle: "Includes interactive BER letter improvement score calculator & grant payout sequence flowchart."
    }
  ]);

  const [baitAssets, setBaitAssets] = useState([]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === "pillar_pages" 
        ? "/api/generatePillarIdeas" 
        : activeTab === "link_bait" 
        ? "/api/seo/generate-link-bait" 
        : "/api/seo/link-opportunities";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteUrl, pillarTopic, topic: pillarTopic })
      });

      if (response.ok) {
        const data = await response.json();
        const newPillars = data.pillars || data.ideas || [];
        if (newPillars.length > 0) {
          setPillars(newPillars);
          useDashboardStore.getState().updateContentGraph({ pillars: newPillars });
        }
        if (data.opportunities) setOpportunities(data.opportunities);
        if (data.assets) setBaitAssets(data.assets);
      }
    } catch (err) {
      console.error("Linker API error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInWriter = (title) => {
    generateArticle({
      title,
      content: "",
      tone: "Professional"
    });
    navigate("/");
  };

  const handleStatusToggle = (id) => {
    setOpportunities(prev => prev.map(op => op.id === id ? {
      ...op,
      status: op.status === "Uncontacted" ? "Pitch Sent" : op.status === "Pitch Sent" ? "Connected" : "Uncontacted"
    } : op));
  };

  return (
    <div className="p-6 md:p-8 space-y-8 text-left" id="linker-page-view">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">
          Find backlink opportunities for your content
        </h1>
        <p className="text-slate-400 mt-2 text-xs md:text-sm leading-relaxed max-w-3xl">
          EcoSmartHomes scans relevant sites, matches them to your best pages,
          and hands you a warm outreach queue.
        </p>
      </div>

      <LinkerTabs activeTab={activeTab} />

      <LinkerInput
        websiteUrl={websiteUrl}
        onUrlChange={setWebsiteUrl}
        pillarTopic={pillarTopic}
        onPillarTopicChange={setPillarTopic}
        previousSites={previousSites}
        activeTab={activeTab}
        loading={loading}
        onSubmit={handleSubmit}
      />

      <LinkerIdeasGrid
        activeTab={activeTab}
        pillars={pillars}
        opportunities={opportunities}
        baitAssets={baitAssets}
        onOpenInWriter={handleOpenInWriter}
        onStatusToggle={handleStatusToggle}
      />

      <InternalLinks />

      <BacklinkResults />

      <LinkerFooter />
    </div>
  );
}
