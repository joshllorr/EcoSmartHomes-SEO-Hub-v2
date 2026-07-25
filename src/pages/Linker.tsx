import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LinkerTabs, { LinkerTabType } from "../components/Linker/LinkerTabs";
import LinkerInput from "../components/Linker/LinkerInput";
import LinkerIdeasGrid, { PillarPageItem, LinkOpportunityItem, LinkBaitAssetItem } from "../components/Linker/LinkerIdeasGrid";
import LinkerFooter from "../components/Linker/LinkerFooter";
import BacklinkResults from "../components/Linker/BacklinkResults";
import InternalLinks from "../components/Linker/InternalLinks";
import { useDashboardStore } from "../store/useDashboardStore";

export default function Linker() {
  const navigate = useNavigate();
  const location = useLocation();
  const targetDomain = useDashboardStore((s) => s.targetDomain);
  const generateArticle = useDashboardStore((s) => s.generateArticle);

  const activeTab: LinkerTabType = location.pathname === "/pillar-pages" 
    ? "pillar_pages" 
    : location.pathname === "/link-bait" 
    ? "link_bait" 
    : "linker";
  const [pillarTopic, setPillarTopic] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState(`https://${targetDomain || "ecosmarthomes.ie"}/`);
  const [previousSites] = useState<string[]>([
    targetDomain || "ecosmarthomes.ie",
    "ecosmarthomes.ie",
    "retrofit-limerick.ie"
  ]);

  const [loading, setLoading] = useState(false);

  // Link Opportunities State
  const [opportunities, setOpportunities] = useState<LinkOpportunityItem[]>([
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
    },
    {
      id: "link-op-3",
      domain: "selfbuild.ie",
      domainAuthority: 52,
      matchScore: "89%",
      targetPage: `https://${targetDomain || "ecosmarthomes.ie"}/solar-pv-payback-estimator`,
      relevanceType: "Self Build & Home Extension Magazine",
      contactPerson: "Ruth Brennan (features@selfbuild.ie)",
      outreachAngle: "Calculators & Tools Showcase",
      suggestedPitch: "Hi Ruth, your readers often ask about battery storage ROI with solar PV installations in Ireland. We built an interactive payback calculator with live CEG feed-in rates. Would your editorial team consider linking it as an practical tool for home builders?",
      status: "Uncontacted"
    },
    {
      id: "link-op-4",
      domain: "limerickleader.ie",
      domainAuthority: 61,
      matchScore: "85%",
      targetPage: `https://${targetDomain || "ecosmarthomes.ie"}/limerick-v94-retrofit-grants`,
      relevanceType: "Regional News & Mid-West Property Section",
      contactPerson: "Property Desk (news@limerickleader.ie)",
      outreachAngle: "Local V94 Eircode News & Community Impact",
      suggestedPitch: "Hi Property Desk, we analyzed SEAI grant uptake across Limerick postcodes (Raheen, Castletroy, Dooradoyle). The data shows V94 homeowners cut energy bills by 42% after deep retrofits. Happy to provide localized infographics for a regional feature.",
      status: "Uncontacted"
    }
  ]);

  // Pillar Page Ideas State
  const [pillars, setPillars] = useState<PillarPageItem[]>([
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
    },
    {
      id: "pillar-2",
      title: "Heat Pump vs Gas Boiler Life-Cycle Cost & ROI Masterclass",
      summary: "A comprehensive financial and technical breakdown comparing air-to-water heat pump operating costs against natural gas and kerosene boilers in Irish homes under 2026 carbon tax levels.",
      targetQuery: "heat pump vs gas boiler cost ireland",
      estimatedVolume: "12.2K/mo",
      authorityScore: 94,
      difficulty: "LOW",
      difficultyScore: 32,
      subtopicClusters: [
        "Smart Meter Night-Rate Tariff Savings with Heat Pumps",
        "SEAI Heat Pump Grant (€6,500) Application Rules",
        "Coefficient of Performance (COP) in Irish Winter Temps",
        "Underfloor Heating vs Low-Temperature Radiator Retrofits"
      ],
      linkBaitAngle: "Includes dynamic 10-year running cost simulator and SEAI grant deduction estimator."
    },
    {
      id: "pillar-3",
      title: "Solar PV, Battery Storage & Grid Microgeneration Authority Hub",
      summary: "Definitive guide to domestic Solar PV sizing, battery storage payback periods, and earning microgeneration feed-in tariffs (CEG) across Irish energy providers.",
      targetQuery: "solar pv battery storage payback ireland",
      estimatedVolume: "15.4K/mo",
      authorityScore: 91,
      difficulty: "MEDIUM",
      difficultyScore: 44,
      subtopicClusters: [
        "SEAI Solar PV Grant Sizing Caps (€2,100)",
        "Export Tariff Rates: Electric Ireland vs Bord Gáis vs Energia",
        "Inverter Sizing & Battery Storage Capacity Math",
        "BER Rating Impact of 4kW Solar PV System"
      ],
      linkBaitAngle: "Includes live feed-in tariff rate comparison matrix and annual KwH yield map."
    }
  ]);

  // Link Bait Assets State
  const [baitAssets, setBaitAssets] = useState<LinkBaitAssetItem[]>([
    {
      id: "bait-1",
      title: "2026 Irish Home BER Letter Rating Upgrade Calculator",
      type: "Interactive Calculator",
      summary: "An embeddable JS widget that takes home age, current heating system, and insulation level to output projected BER grade (G to A2) and SEAI grant eligibility.",
      whyItAttractsLinks: "Home improvement blogs, mortgage advisors (green mortgages), and estate agents link to this calculator to show clients upgrade potentials.",
      targetBacklinkSources: ["Irish Property Portals", "Green Mortgage Brokers", "SEAI Registered Assessors"],
      estimatedBacklinkPotential: "15–25 High-DA Backlinks / Mo",
      embedSnippet: `<iframe src="${websiteUrl}widgets/ber-calculator" width="100%" height="450" frameborder="0"></iframe>`,
      keyFeatures: ["Instant SEAI grant calculation", "BER letter jump projection", "Downloadable PDF report for banks"]
    },
    {
      id: "bait-2",
      title: "SEAI Grant Breakdown & Contractor Compliance Matrix (2026 Edition)",
      type: "Reference Chart",
      summary: "A clean, visual cheat-sheet matrix comparing all 12 SEAI grant categories, maximum payout caps, required insulation values (R-values), and post-works sign-off steps.",
      whyItAttractsLinks: "Industry journalists, architects, and energy consultants reference this chart as an authoritative citation in articles.",
      targetBacklinkSources: ["Architecture Blogs", "Construction Trade Publications", "Home Renovator Forums"],
      estimatedBacklinkPotential: "20+ Editorial Citations",
      embedSnippet: `<div class="seai-matrix-embed" data-domain="${targetDomain || "ecosmarthomes.ie"}" data-accent="#34d399"></div>`,
      keyFeatures: ["Always updated with SEAI rules", "Printable high-res PDF infographic", "Embeddable interactive table"]
    },
    {
      id: "bait-3",
      title: "Heat Pump vs Kerosene vs Gas Running Cost Simulator",
      type: "Comparison Tool",
      summary: "A dynamic comparison tool comparing monthly fuel costs under legislative carbon tax increases reaching €100/tonne by 2030.",
      whyItAttractsLinks: "Financial columnists, sustainability influencers, and climate journalists link to this tool when reporting on energy price inflation.",
      targetBacklinkSources: ["National News Outlets", "Personal Finance Blogs", "Environmental Policy Hubs"],
      estimatedBacklinkPotential: "30+ High-Authority Links",
      embedSnippet: `<iframe src="${websiteUrl}tools/heat-pump-simulator" width="100%" height="520" frameborder="0"></iframe>`,
      keyFeatures: ["Carbon tax trajectory modeling", "Smart meter night-rate toggles", "Side-by-side fuel comparison"]
    }
  ]);

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

  const handleOpenInWriter = (title: string) => {
    generateArticle({
      title,
      content: "",
      tone: "Professional"
    });
    navigate("/");
  };

  const handleStatusToggle = (id: string) => {
    setOpportunities(prev => prev.map(op => op.id === id ? {
      ...op,
      status: op.status === "Uncontacted" ? "Pitch Sent" : op.status === "Pitch Sent" ? "Connected" : "Uncontacted"
    } : op));
  };

  return (
    <div className="p-6 md:p-8 space-y-8 text-left" id="linker-page-view">
      {/* Header */}
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
