import { useState } from "react";
import { 
  CheckCircle2, 
  ExternalLink, 
  Mail, 
  Copy, 
  Check, 
  FileText, 
  Zap, 
  Code2, 
  Sparkles, 
  MapPin 
} from "lucide-react";
import { LinkerTabType } from "./LinkerTabs";
import { useDashboardStore } from "../../store/useDashboardStore";
import { buildLinkBaitPage } from "../../utils/buildLinkBaitPage";

export interface LinkBaitIdeaItem {
  icon: string;
  title: string;
  desc: string;
  area?: string;
  type?: string;
  value?: string;
  location?: string;
}

export interface PillarPageItem {
  id: string;
  title: string;
  summary: string;
  targetQuery: string;
  estimatedVolume: string;
  authorityScore: number;
  difficulty?: string;
  difficultyScore?: number;
  subtopicClusters: string[];
  linkBaitAngle?: string;
}

export interface LinkOpportunityItem {
  id: string;
  domain: string;
  domainAuthority: number;
  matchScore: string;
  targetPage: string;
  relevanceType: string;
  contactPerson?: string;
  outreachAngle: string;
  suggestedPitch: string;
  status: "Uncontacted" | "Pitch Sent" | "Connected";
}

export interface LinkBaitAssetItem {
  id: string;
  title: string;
  type: string;
  summary: string;
  whyItAttractsLinks: string;
  targetBacklinkSources: string[];
  estimatedBacklinkPotential: string;
  embedSnippet: string;
  keyFeatures?: string[];
}

interface LinkerIdeasGridProps {
  activeTab?: LinkerTabType;
  fallbackIdeas?: LinkBaitIdeaItem[];
  ideas?: LinkBaitIdeaItem[];
  pillars?: PillarPageItem[];
  opportunities?: LinkOpportunityItem[];
  baitAssets?: LinkBaitAssetItem[];
  onOpenInWriter?: (title: string) => void;
  onStatusToggle?: (id: string) => void;
}

export const DEFAULT_LINK_BAIT_IDEAS: LinkBaitIdeaItem[] = [
  {
    icon: "🎨",
    title: "The 2026 Report: How BER Ratings Impact Irish Property Values",
    desc: "A visual data representation showing the correlation between energy ratings and sale prices in the 2026 Irish property market.",
    area: "Limerick",
    type: "Infographic",
    value: "Attracts citations from Irish property portals, green mortgage advisors, and housing market journalists."
  },
  {
    icon: "❓",
    title: "Heat Pump Readiness Assessment: Will You Qualify for the 2026 Grant?",
    desc: "A quiz evaluating if a home meets the Heat Loss Indicator requirement and is heat pump ready.",
    area: "Dooradoyle",
    type: "Quiz",
    value: "High social share rate among homeowners evaluating heat pump retrofits."
  },
  {
    icon: "⚖️",
    title: "Comparison Guide: One-Stop-Shop vs Individual Grant Measures",
    desc: "A side-by-side breakdown of Ireland’s two main retrofit pathways.",
    area: "Castletroy",
    type: "Comparison",
    value: "Consistently referenced by trade publications and contractor directories."
  },
  {
    icon: "🧮",
    title: "2026 SEAI Grant & Retrofit Investment Calculator",
    desc: "An interactive tool estimating retrofit costs, grants, and savings.",
    area: "Raheen",
    type: "Calculator",
    value: "Embeddable widget linked by financial columnists and local mortgage brokers."
  },
  {
    icon: "📖",
    title: "The 2026 Irish Homeowner’s Retrofit Glossary",
    desc: "A dictionary explaining retrofit jargon in plain English.",
    area: "Corbally",
    type: "Glossary",
    value: "Ranks naturally for definition terms and earns contextual Wikipedia-style links."
  },
  {
    icon: "📊",
    title: "SEAI Grant Limits & U-Value Requirements (2026)",
    desc: "A reference chart listing all 2026 SEAI grants and required U-values.",
    area: "Adare",
    type: "Reference Chart",
    value: "Essential cheat-sheet bookmarked and linked by architects & energy auditors."
  },
  {
    icon: "📍",
    title: "Independent Home Energy Retrofit Advisory: Dublin",
    desc: "A location page targeting Dublin homeowners and local housing archetypes.",
    area: "Dublin",
    type: "Location Page",
    location: "Dublin",
    value: "Local authority citations and regional business index backlinks."
  },
  {
    icon: "📍",
    title: "Retrofit Roadmaps & Energy Consulting: Cork",
    desc: "A location page tailored to Cork’s climate and housing stock.",
    area: "Cork",
    type: "Location Page",
    location: "Cork",
    value: "Regional directory citations and local eco-initiative links."
  }
];

export default function LinkerIdeasGrid({
  activeTab = "linker",
  fallbackIdeas = DEFAULT_LINK_BAIT_IDEAS,
  ideas: propIdeas,
  pillars = [],
  opportunities = [],
  baitAssets = [],
  onOpenInWriter,
  onStatusToggle
}: LinkerIdeasGridProps) {
  const storeIdeas = useDashboardStore((s) => s.linkBaitIdeas);

  const displayIdeas = (storeIdeas && storeIdeas.length > 0)
    ? storeIdeas
    : (propIdeas && propIdeas.length > 0)
    ? propIdeas
    : fallbackIdeas;

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [buildingTitle, setBuildingTitle] = useState<string | null>(null);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleBuildPage = async (idea: LinkBaitIdeaItem) => {
    setBuildingTitle(idea.title);
    try {
      const output = await buildLinkBaitPage(idea);
      console.log("Generated Link Bait Page Output:", output);
      if (onOpenInWriter) {
        onOpenInWriter(idea.title);
      }
    } catch (err) {
      console.error("Build page error:", err);
      if (onOpenInWriter) {
        onOpenInWriter(idea.title);
      }
    } finally {
      setBuildingTitle(null);
    }
  };

  // 8 Dynamic Link Bait Grid View
  return (
    <div className="space-y-6 text-left" id="linker-ideas-grid-container">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayIdeas.map((idea) => (
          <div
            key={idea.title}
            className="glass-card p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all bg-[#0f172a]/40 space-y-3 shadow-lg hover:shadow-2xl flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-3xl">{idea.icon}</div>
                {idea.area && (
                  <span className="text-[10px] font-mono font-bold bg-[#34d399]/15 text-[#34d399] border border-[#34d399]/30 px-2 py-0.5 rounded flex items-center gap-1">
                    <MapPin size={10} />
                    <span>Area: {idea.area}</span>
                  </span>
                )}
              </div>

              <h3 className="text-xl font-display font-semibold text-white hover:text-[#34d399] transition">
                {idea.title}
              </h3>

              <p className="text-slate-300 text-xs leading-relaxed">
                {idea.desc}
              </p>

              <div className="flex flex-wrap gap-2 text-xs pt-1">
                {idea.area && (
                  <p className="text-xs font-semibold text-[#34d399]">
                    Area: {idea.area}
                  </p>
                )}
                {idea.type && (
                  <p className="text-xs text-slate-400 font-mono">
                    Type: {idea.type}
                  </p>
                )}
              </div>

              {idea.value && (
                <p className="text-[11px] font-sans italic text-emerald-400/90 bg-black/20 p-2.5 rounded-lg border border-white/5">
                  💡 <strong>Backlink Value:</strong> {idea.value}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
              {idea.type ? (
                <span className="text-[10px] font-mono font-bold bg-white/5 text-[#34d399] border border-white/10 px-2.5 py-1 rounded-md uppercase">
                  {idea.type}
                </span>
              ) : <div />}
              
              <button
                onClick={() => handleBuildPage(idea)}
                disabled={buildingTitle === idea.title}
                className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Sparkles size={13} className={buildingTitle === idea.title ? "animate-spin text-purple-400" : "text-[#34d399]"} />
                <span>{buildingTitle === idea.title ? "Building Page..." : "Build This Page"}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
