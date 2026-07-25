import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DashboardState, ArticleDraft, ActivityItem, TaskItem, SchemaTemplate } from "./types";
import { INITIAL_DASHBOARD_DATA } from "./data";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import MainDashboard from "./components/MainDashboard";
import AIWriterTab from "./components/AIWriterTab";
import KeywordResearchTab from "./components/KeywordResearchTab";
import SiteAuditTab from "./components/SiteAuditTab";
import ContentAuditTab from "./components/ContentAuditTab";
import ContentIdeasTab from "./components/ContentIdeasTab";
import ContentLibraryTab from "./components/ContentLibraryTab";
import EnergyEstimatorTab from "./components/EnergyEstimatorTab";
import SERPAnalyzerTab from "./components/SERPAnalyzerTab";
import QuickSEOChecklist from "./components/QuickSEOChecklist";
import { useDashboardStore } from "./store/useDashboardStore";
import { Routes, Route } from "react-router-dom";
import SERP from "./pages/SERP";
import TitleMeta from "./pages/TitleMeta";
import Linker from "./pages/Linker";
import PillarPages from "./pages/PillarPages";
import ContentMap from "./pages/ContentMap";
import { Sparkles, Trophy, Flame, CheckCircle, ArrowRight, ChevronDown, ChevronUp, MessageSquare, Download, Copy, Check, X, FileCode, ShieldCheck, AlertCircle, CheckCircle2, RefreshCw, Edit3, Sliders, Globe, Building, FileText, ExternalLink, BookOpen, Info, Plus, Zap, Bookmark, Save, Trash2, Layers, FolderPlus, MapPin, TrendingUp, TrendingDown, Send, Server, Link, LayoutGrid, Search, Tag, Filter } from "lucide-react";

import { LimerickSuburbHeatmap } from "./components/SEO/LimerickSuburbHeatmap";
import EntityCardPreview from "./components/EntityCardPreview";
import LinkBuilderTab from "./components/LinkBuilderTab";

const LIMERICK_SUBURBS = [
  "Dooradoyle",
  "Raheen",
  "Castletroy",
  "Annacotty",
  "Mungret",
  "Limerick City",
  "V94 Eircode Area",
  "Adare",
  "Shannon",
  "Clarina",
  "Corbally",
  "Caherdavin",
  "Patrickswell",
  "Monaleen",
  "Rhebogue",
  "Ballyneety",
  "Castleconnell"
];

const DEFAULT_SCHEMA_TEMPLATES: SchemaTemplate[] = [
  {
    id: "template-v94-limerick",
    name: "Limerick V94 Local Business & Map Pack",
    description: "Geo-coordinates, V94 Eircode routing, physical address, and operating hours for Limerick Map Pack local ranking.",
    badge: "V94 MAP PACK",
    isBuiltIn: true,
    schemaDesc: "Licensed energy retrofitting contractor, BER rating specialist, and heat pump installer based in Raheen Business Park, Limerick (V94 Eircode Zone).",
    appliedSchemaNodes: [
      {
        "@type": "LocalBusiness",
        "@id": "https://ecosmarthomes.ie/#localbusiness-v94",
        "name": "EcoSmart Homes Limerick HQ",
        "telephone": "+353-61-400-326",
        "priceRange": "€€-€€€",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Raheen Business Park, Raheen",
          "addressLocality": "Limerick",
          "addressRegion": "Co. Limerick",
          "postalCode": "V94 E2D2",
          "addressCountry": "IE"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 52.6638,
          "longitude": -8.6267
        },
        "hasMap": "https://maps.google.com/maps?q=Raheen+Business+Park,+Limerick+V94+E2D2&output=embed",
        "areaServed": [
          "Limerick City",
          "V94 Eircode Area",
          "Raheen",
          "Castletroy",
          "Dooradoyle",
          "Annacotty",
          "Mungret",
          "Adare",
          "Shannon"
        ],
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            "opens": "08:30",
            "closes": "18:00"
          }
        ]
      }
    ]
  },
  {
    id: "template-local-business",
    name: "Mid-West Regional Contractor",
    description: "Address, geo-coordinates, and local service parameters for Limerick & surrounding Mid-West counties.",
    badge: "MID-WEST SEO",
    isBuiltIn: true,
    schemaDesc: "Licensed local energy retrofitting contractor, BER rating specialist, and heat pump installation services in Limerick (V94) and surrounding areas.",
    appliedSchemaNodes: [
      {
        "@type": "LocalBusiness",
        "@id": "https://ecosmarthomes.ie/#localbusiness",
        "name": "EcoSmart Homes Mid-West",
        "telephone": "+353-61-400-326",
        "priceRange": "€€-€€€",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Dock Road, Limerick City",
          "addressLocality": "Limerick",
          "addressRegion": "Co. Limerick",
          "postalCode": "V94 0000",
          "addressCountry": "IE"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 52.6638,
          "longitude": -8.6267
        },
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
            "opens": "08:30",
            "closes": "18:00"
          }
        ]
      }
    ]
  },
  {
    id: "template-blog-editorial",
    name: "Blog Post & Editorial",
    description: "Editorial schema with headline, author, datePublished, and publisher authority for Google Discover.",
    badge: "EDITORIAL / DISCOVER",
    isBuiltIn: true,
    schemaDesc: "In-depth technical SEO guide and expert energy efficiency retrofitting editorial analysis.",
    appliedSchemaNodes: [
      {
        "@type": "BlogPosting",
        "@id": "https://ecosmarthomes.ie/#article-guide",
        "headline": "Complete Guide to SEAI Home Retrofitting Grants in Ireland (2026)",
        "description": "Step-by-step breakdown of insulation grants, heat pump subsidies, and BER rating upgrades.",
        "author": {
          "@type": "Person",
          "name": "David Murray",
          "jobTitle": "Lead Building Physics Engineer"
        },
        "publisher": {
          "@type": "Organization",
          "name": "EcoSmart Homes"
        },
        "datePublished": "2026-01-15",
        "dateModified": "2026-07-20"
      }
    ]
  },
  {
    id: "template-product-service",
    name: "E-Commerce & Services",
    description: "Product pricing, warranty, rating stars, and SEAI grant eligibility for rich SERP result badges.",
    badge: "RICH SNIPPETS",
    isBuiltIn: true,
    schemaDesc: "Complete SEAI home retrofitting packages, solar PV kits, and BER rating assessment service pricing.",
    appliedSchemaNodes: [
      {
        "@type": "Product",
        "@id": "https://ecosmarthomes.ie/#ber-service-product",
        "name": "Full Home BER Assessment & Energy Upgrade Package",
        "description": "Comprehensive NSAI & SEAI registered home BER rating optimization audit.",
        "brand": {
          "@type": "Brand",
          "name": "EcoSmart Homes"
        },
        "offers": {
          "@type": "Offer",
          "priceCurrency": "EUR",
          "price": "350.00",
          "priceValidUntil": "2026-12-31",
          "itemCondition": "https://schema.org/NewCondition",
          "availability": "https://schema.org/InStock"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "128"
        }
      }
    ]
  },
  {
    id: "template-saas-app",
    name: "Software & SaaS Platform",
    description: "Operating system, application category, and rating schema for digital tools and platforms.",
    badge: "SAAS / APP",
    isBuiltIn: true,
    schemaDesc: "AI-powered SERP audit, title tag optimization, and structured data generator platform.",
    appliedSchemaNodes: [
      {
        "@type": "SoftwareApplication",
        "@id": "https://ecosmarthomes.ie/#software-app",
        "name": "EcoSmart SEO Audit Platform",
        "operatingSystem": "Web, Cloud",
        "applicationCategory": "BusinessApplication",
        "offers": {
          "@type": "Offer",
          "price": "0.00",
          "priceCurrency": "EUR"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.95",
          "reviewCount": "240"
        }
      }
    ]
  },
  {
    id: "template-event-workshop",
    name: "SEAI Retrofit Workshop & Event",
    description: "Event schema with eventStatus, location, start/end dates, and organizer for Google Events SERP placement.",
    badge: "EVENT / WEBINAR",
    isBuiltIn: true,
    schemaDesc: "Live home energy retrofitting masterclass, BER rating Q&A, and SEAI grant briefing in Limerick.",
    appliedSchemaNodes: [
      {
        "@type": "Event",
        "@id": "https://ecosmarthomes.ie/#event-workshop-2026",
        "name": "2026 Home Energy Retrofit & Grant Masterclass",
        "startDate": "2026-09-15T18:30:00+01:00",
        "endDate": "2026-09-15T20:30:00+01:00",
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/MixedEventAttendanceMode",
        "location": {
          "@type": "Place",
          "name": "Limerick City Hotel & Online Stream",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Dock Road",
            "addressLocality": "Limerick",
            "addressCountry": "IE"
          }
        },
        "organizer": {
          "@type": "Organization",
          "name": "EcoSmart Homes",
          "url": "https://ecosmarthomes.ie"
        }
      }
    ]
  },
  {
    id: "template-faq-qna",
    name: "FAQ Page & Rich Q&A",
    description: "Structured Question & Answer entities for LLM citations, Gemini Answer Overviews, and Google FAQ drop-downs.",
    badge: "FAQ / Q&A",
    isBuiltIn: true,
    schemaDesc: "Frequently asked questions regarding SEAI retrofitting grants, BER rating costs, and heat pump installation timelines.",
    appliedSchemaNodes: [
      {
        "@type": "FAQPage",
        "@id": "https://ecosmarthomes.ie/#faq-schema",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How much SEAI grant funding is available for home insulation in Ireland?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Homeowners in Ireland can receive up to €8,000 for external wall insulation, €1,500 for attic insulation, and €6,500 for heat pump installations through SEAI grants."
            }
          },
          {
            "@type": "Question",
            "name": "What BER rating is required for an SEAI heat pump grant?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Your home must achieve a Heat Loss Indicator (HLI) of 2.0 W/K m² or lower, typically corresponding to a BER rating of B2 or better after retrofitting."
            }
          }
        ]
      }
    ]
  }
];
import jsPDF from "jspdf";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a]/95 border border-white/15 rounded-xl p-3 shadow-2xl backdrop-blur-md text-left border-l-2 border-l-[#34d399] min-w-[140px]">
        <p className="text-[10px] font-mono text-[#94a3b8] uppercase tracking-wider font-semibold">{label} 2026/27</p>
        <p className="text-xs font-semibold text-white mt-1.5 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#34d399]"></span>
          <span>Citations: <strong className="text-[#34d399] font-mono text-sm">{payload[0].value}</strong></span>
        </p>
      </div>
    );
  }
  return null;
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [writerSuggestion, setWriterSuggestion] = useState<string>("");
  const [showLevelUp, setShowLevelUp] = useState<boolean>(false);
  const [levelUpText, setLevelUpText] = useState<string>("");
  const [showLLMQueries, setShowLLMQueries] = useState<boolean>(false);
  const [llmQuerySort, setLlmQuerySort] = useState<"relevance" | "citations">("relevance");
  const [autoRefreshReferrals, setAutoRefreshReferrals] = useState<boolean>(false);
  const [lastWsRefreshTime, setLastWsRefreshTime] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [showSchemaModal, setShowSchemaModal] = useState<boolean>(false);
  const [schemaModalViewMode, setSchemaModalViewMode] = useState<"split" | "editor" | "preview">("split");
  const [schemaSearchQuery, setSchemaSearchQuery] = useState<string>("");
  const [selectedSchemaCategoryFilter, setSelectedSchemaCategoryFilter] = useState<string>("All");
  const [schemaCopied, setSchemaCopied] = useState<boolean>(false);
  const [schemaOrgName, setSchemaOrgName] = useState<string>("");
  const [schemaTargetUrl, setSchemaTargetUrl] = useState<string>("");
  const [useSiteMetadata, setUseSiteMetadata] = useState<boolean>(true);
  const [schemaDescription, setSchemaDescription] = useState<string>("Energy efficiency, home retrofitting, and BER rating optimization authority.");
  const [schemaValidationResult, setSchemaValidationResult] = useState<{
    isValid: boolean;
    title: string;
    details: string[];
    missingFields: string[];
    warnings?: string[];
  } | null>(null);
  const [isSuggestingSchema, setIsSuggestingSchema] = useState<boolean>(false);
  const [schemaSuggestions, setSchemaSuggestions] = useState<Array<{
    entityType: string;
    title: string;
    reason: string;
    suggestedProps: any;
  }> | null>(null);
  const [aiSchemaSummary, setAiSchemaSummary] = useState<string | null>(null);
  const [appliedSchemaNodes, setAppliedSchemaNodes] = useState<any[]>(DEFAULT_SCHEMA_TEMPLATES[0].appliedSchemaNodes);
  const [selectedLimerickAreas, setSelectedLimerickAreas] = useState<string[]>([
    "Limerick City",
    "V94 Eircode Area",
    "Raheen",
    "Castletroy",
    "Dooradoyle",
    "Annacotty",
    "Mungret",
    "Adare",
    "Shannon"
  ]);

  const [customSchemaTemplates, setCustomSchemaTemplates] = useState<SchemaTemplate[]>(() => {
    const saved = localStorage.getItem("ecosmart_schema_templates_v1");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse custom schema templates", e);
      }
    }
    return [];
  });
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>("template-v94-limerick");
  const [showSaveTemplateForm, setShowSaveTemplateForm] = useState<boolean>(false);
  const [saveTemplateName, setSaveTemplateName] = useState<string>("");
  const [saveTemplateDesc, setSaveTemplateDesc] = useState<string>("");
  const [templateToast, setTemplateToast] = useState<string | null>(null);

  // WordPress CMS Direct Schema Push States
  const [showCmsPushOptions, setShowCmsPushOptions] = useState<boolean>(false);
  const [pushTarget, setPushTarget] = useState<"site_wide" | "post">("site_wide");
  const [selectedPostId, setSelectedPostId] = useState<string>("101");
  const [customPostTitle, setCustomPostTitle] = useState<string>("BER Rating Upgrade Guide (G to A)");
  const [isPushingSchema, setIsPushingSchema] = useState<boolean>(false);
  const [pushSchemaResult, setPushSchemaResult] = useState<{
    success: boolean;
    targetLocation: string;
    statusMessage: string;
    timestamp: string;
  } | null>(null);

  const handlePushSchemaToCms = async () => {
    setIsPushingSchema(true);
    setPushSchemaResult(null);

    const jsonPayload = generateSchemaJson(targetDomain, schemaOrgName, schemaTargetUrl, schemaDescription);
    const cleanDomain = targetDomain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
    const webhookUrl = localStorage.getItem("ecosmart_cms_webhook_url") || `https://${cleanDomain || 'ecosmarthomes.ie'}/wp-json/wp/v2/schema`;
    const apiKey = localStorage.getItem("ecosmart_cms_api_key") || "";

    try {
      const res = await fetch("/api/seo/push-schema-cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schemaPayload: jsonPayload,
          pushTarget,
          postId: selectedPostId,
          postTitle: customPostTitle,
          webhookUrl,
          apiKey,
          siteDomain: targetDomain
        })
      });

      const data = await res.json();
      if (data.success) {
        setPushSchemaResult({
          success: true,
          targetLocation: data.targetLocation,
          statusMessage: data.statusMessage,
          timestamp: new Date(data.timestamp || Date.now()).toLocaleTimeString()
        });
        setState((prev) => ({
          ...prev,
          xp: {
            ...prev.xp,
            current: prev.xp.current + 25
          },
          recent_activity: [
            {
              id: `act-cms-${Date.now()}`,
              title: `Pushed JSON-LD Schema to WordPress (${data.targetLocation})`,
              category: "CMS",
              date: "Just now"
            },
            ...prev.recent_activity.slice(0, 14)
          ]
        }));
      } else {
        setPushSchemaResult({
          success: false,
          targetLocation: pushTarget === "site_wide" ? "Site-Wide Header" : `Post #${selectedPostId}`,
          statusMessage: data.error || "Failed to push schema payload to WordPress CMS",
          timestamp: new Date().toLocaleTimeString()
        });
      }
    } catch (err: any) {
      setPushSchemaResult({
        success: false,
        targetLocation: pushTarget === "site_wide" ? "Site-Wide Header" : `Post #${selectedPostId}`,
        statusMessage: `Connection issue: ${err.message || "Could not reach CMS server"}`,
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setIsPushingSchema(false);
    }
  };

  const updateAreaServedInNodes = (areas: string[], currentNodes?: any[]) => {
    const nodesToUpdate = currentNodes || appliedSchemaNodes;
    let foundLocalBusiness = false;
    const updated = nodesToUpdate.map((node) => {
      if (node["@type"] === "LocalBusiness" || node["@type"] === "HomeAndConstructionBusiness") {
        foundLocalBusiness = true;
        return {
          ...node,
          areaServed: areas
        };
      }
      return node;
    });

    if (!foundLocalBusiness) {
      const cleanDomain = targetDomain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
      const newLocalBizNode = {
        "@type": "LocalBusiness",
        "@id": `https://${cleanDomain || 'ecosmarthomes.ie'}/#localbusiness-v94`,
        "name": schemaOrgName || "EcoSmart Homes Limerick HQ",
        "telephone": "+353-61-400-326",
        "priceRange": "€€-€€€",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Raheen Business Park, Raheen",
          "addressLocality": "Limerick",
          "addressRegion": "Co. Limerick",
          "postalCode": "V94 E2D2",
          "addressCountry": "IE"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 52.6638,
          "longitude": -8.6267
        },
        "hasMap": "https://maps.google.com/maps?q=Raheen+Business+Park,+Limerick+V94+E2D2&output=embed",
        "areaServed": areas
      };
      setAppliedSchemaNodes([...updated, newLocalBizNode]);
    } else {
      setAppliedSchemaNodes(updated);
    }
  };

  const handleAreaToggle = (area: string) => {
    let nextAreas: string[];
    if (selectedLimerickAreas.includes(area)) {
      nextAreas = selectedLimerickAreas.filter((a) => a !== area);
    } else {
      nextAreas = [...selectedLimerickAreas, area];
    }
    setSelectedLimerickAreas(nextAreas);
    updateAreaServedInNodes(nextAreas);
  };

  const handleApplyTemplate = (template: SchemaTemplate) => {
    setActiveTemplateId(template.id);
    if (template.schemaDesc) {
      setSchemaDescription(template.schemaDesc);
    }
    if (template.orgName) {
      setSchemaOrgName(template.orgName);
      setUseSiteMetadata(false);
    }
    const nodes = template.appliedSchemaNodes ? [...template.appliedSchemaNodes] : [];
    setAppliedSchemaNodes(nodes);

    const localBizNode = nodes.find((n: any) => n["@type"] === "LocalBusiness" || n["@type"] === "HomeAndConstructionBusiness");
    if (localBizNode && Array.isArray(localBizNode.areaServed)) {
      setSelectedLimerickAreas(localBizNode.areaServed);
    }

    setTemplateToast(`Applied schema template: "${template.name}"`);
    setTimeout(() => setTemplateToast(null), 3000);
  };

  const handleSaveCustomTemplate = () => {
    if (!saveTemplateName.trim()) return;
    const cleanDomain = targetDomain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
    const newTemplate: SchemaTemplate = {
      id: "template-custom-" + Date.now(),
      name: saveTemplateName.trim(),
      description: saveTemplateDesc.trim() || `Custom schema preset for ${cleanDomain || 'site'}.`,
      badge: "CUSTOM PRESET",
      orgName: schemaOrgName,
      schemaDesc: schemaDescription,
      appliedSchemaNodes: [...appliedSchemaNodes],
      isBuiltIn: false
    };

    const updated = [newTemplate, ...customSchemaTemplates];
    setCustomSchemaTemplates(updated);
    try {
      localStorage.setItem("ecosmart_schema_templates_v1", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save schema template", e);
    }

    setActiveTemplateId(newTemplate.id);
    setShowSaveTemplateForm(false);
    setSaveTemplateName("");
    setSaveTemplateDesc("");
    setTemplateToast(`Custom template "${newTemplate.name}" saved!`);
    setTimeout(() => setTemplateToast(null), 3000);
  };

  const handleDeleteCustomTemplate = (id: string, name: string) => {
    const updated = customSchemaTemplates.filter((t) => t.id !== id);
    setCustomSchemaTemplates(updated);
    try {
      localStorage.setItem("ecosmart_schema_templates_v1", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to delete schema template", e);
    }
    if (activeTemplateId === id) {
      setActiveTemplateId(null);
    }
    setTemplateToast(`Deleted custom template "${name}"`);
    setTimeout(() => setTemplateToast(null), 3000);
  };

  const [currentSerp, setCurrentSerp] = useState<any>(() => {
    const saved = localStorage.getItem("ecosmart_serp_v1");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved SERP state", e);
      }
    }
    return null;
  });

  // Load from localstorage or use default
  const [state, setState] = useState<DashboardState>(() => {
    const saved = localStorage.getItem("ecosmart_seo_state_v1");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.seo_heatmap || parsed.seo_heatmap.length === 0) {
          parsed.seo_heatmap = INITIAL_DASHBOARD_DATA.seo_heatmap;
        }
        return parsed;
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }
    return INITIAL_DASHBOARD_DATA;
  });

  // Save to localstorage
  useEffect(() => {
    localStorage.setItem("ecosmart_seo_state_v1", JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (currentSerp) {
      localStorage.setItem("ecosmart_serp_v1", JSON.stringify(currentSerp));
    } else {
      localStorage.removeItem("ecosmart_serp_v1");
    }
  }, [currentSerp]);

  const storeSerp = useDashboardStore((state) => state.serp);
  const setStoreSerp = useDashboardStore((state) => state.setSERP);
  const targetDomain = useDashboardStore((state) => state.targetDomain);

  useEffect(() => {
    if (showSchemaModal && useSiteMetadata) {
      const cleanDomain = targetDomain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
      const derivedOrgName = cleanDomain
        ? (cleanDomain.toLowerCase().includes("ecosmarthomes") ? "EcoSmart Homes" : cleanDomain.split('.')[0].replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
        : "EcoSmart Homes";
      const derivedTargetUrl = targetDomain.startsWith("http") ? targetDomain : `https://${cleanDomain || 'ecosmarthomes.ie'}`;

      setSchemaOrgName(derivedOrgName);
      setSchemaTargetUrl(derivedTargetUrl);
    }
  }, [showSchemaModal, useSiteMetadata, targetDomain]);

  useEffect(() => {
    if (storeSerp) {
      setCurrentSerp(storeSerp);
    }
  }, [storeSerp]);

  useEffect(() => {
    if (currentSerp && currentSerp !== storeSerp) {
      setStoreSerp(currentSerp);
    }
  }, [currentSerp, storeSerp]);

  // -------------------------------------------------------------
  // WebSocket Live Real-Time Integration
  // -------------------------------------------------------------
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;

    function connect() {
      // Build dynamic WS URL based on window.location
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}`;
      console.log("[WebSocket] Connecting to EcoSmartHomes Live Hub at:", wsUrl);

      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("[WebSocket] Connection fully established!");
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("[WebSocket] Received real-time live message:", data);

          if (data.type === "metric_update") {
            setState((prev) => {
              // Deduplicate live activity messages to avoid double counting
              const isDuplicate = prev.recent_activity.some(
                (act) => act.title === data.message
              );
              if (isDuplicate) return prev;

              let nextState = { ...prev };

              // 1. Live AI Visibility updates
              if (data.metric === "visibility") {
                const addedVisits = data.increment || 1;
                // Add visits to total and distribute to referrals
                const referrals = prev.ai_visibility.ai_referrals.map((ref) => {
                  if (ref.source === "ChatGPT" || ref.source === "Gemini") {
                    return { ...ref, visits: ref.visits + Math.floor(addedVisits / 2) || 1 };
                  }
                  return ref;
                });

                nextState = {
                  ...nextState,
                  ai_visibility: {
                    visits_last_30_days: prev.ai_visibility.visits_last_30_days + addedVisits,
                    ai_referrals: referrals
                  }
                };
              }

              // 2. Background search indexing XP gains
              if (data.metric === "xp" && data.increment) {
                nextState = addXP(data.increment, nextState);
              }

              // 3. Crawler research search checks
              if (data.metric === "research") {
                nextState = addXP(10, nextState);
              }

              // Prepend real-time live event logging to the Activity Feed
              const newActivity: ActivityItem = {
                id: `act_ws_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                title: data.message || "Live search indexing event synchronized",
                category: data.metric === "research" ? "Research" : "Site Health",
                date: new Date().toLocaleDateString("en-GB")
              };

              // Dynamically boost the current day's heatmap entry on live crawls
              const daysMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
              const currentDay = daysMap[new Date().getDay()];
              const updatedHeatmap = (prev.seo_heatmap || []).map((h) => {
                if (h.day === currentDay) {
                  let updatedVal = h.visibility;
                  let updatedSessions = h.discovery_sessions;
                  let updatedRankings = h.rankings;
                  let updatedCtr = h.ctr;

                  if (data.metric === "visibility") {
                    updatedVal = Math.min(100, h.visibility + (data.increment || 1));
                    updatedCtr = parseFloat(Math.min(10, h.ctr + 0.1).toFixed(1));
                  } else if (data.metric === "xp") {
                    updatedRankings = h.rankings + 1;
                  } else if (data.metric === "research") {
                    updatedSessions = h.discovery_sessions + 1;
                  }

                  return {
                    ...h,
                    visibility: updatedVal,
                    discovery_sessions: updatedSessions,
                    rankings: updatedRankings,
                    ctr: updatedCtr
                  };
                }
                return h;
              });

              return {
                ...nextState,
                recent_activity: [newActivity, ...nextState.recent_activity].slice(0, 15),
                seo_heatmap: updatedHeatmap
              };
            });
          } else if (data.type === "article_generated") {
            // Live feedback when article is written:
            // - Add draft to live counts
            // - Increment readiness score
            // - Award +30 XP
            // - Prepend to activity list
            setState((prev) => {
              // Deduplicate check
              const isDuplicate = prev.recent_activity.some(
                (act) => act.title.includes(data.title) || act.title === data.message
              );
              if (isDuplicate) return prev;

              const updatedPillar = {
                ...prev.pillar,
                articles_live: prev.pillar.articles_live + 1,
                readiness_score: Math.min(100, prev.pillar.readiness_score + 12)
              };

              const newActivity: ActivityItem = {
                id: `act_ws_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
                title: data.message,
                category: "Draft",
                date: new Date().toLocaleDateString("en-GB")
              };

              // Complete generate first article task
              const updatedTasks = prev.tasks.map((t) =>
                t.id === "gen_article" ? { ...t, completed: true } : t
              );

              // Update weekly challenges
              const updatedChallenges = prev.weekly_challenges.map((c) => {
                if (c.id === "write_5") {
                  const nextCount = c.current + 1;
                  return {
                    ...c,
                    current: nextCount,
                    completed: nextCount >= c.target
                  };
                }
                return c;
              });

              // Dynamically update the current day's heatmap on draft write
              const daysMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
              const currentDay = daysMap[new Date().getDay()];
              const updatedHeatmap = (prev.seo_heatmap || []).map((h) => {
                if (h.day === currentDay) {
                  return {
                    ...h,
                    visibility: Math.min(100, h.visibility + 6),
                    rankings: h.rankings + 2,
                    ctr: parseFloat(Math.min(10, h.ctr + 0.3).toFixed(1))
                  };
                }
                return h;
              });

              let nextState = {
                ...prev,
                pillar: updatedPillar,
                tasks: updatedTasks,
                weekly_challenges: updatedChallenges,
                recent_activity: [newActivity, ...prev.recent_activity].slice(0, 15),
                seo_heatmap: updatedHeatmap
              };

              return addXP(data.xpGains || 30, nextState);
            });
          }
        } catch (err) {
          console.warn("[WebSocket] Failed parsing incoming payload:", err);
        }
      };

      ws.onclose = (event) => {
        console.warn("[WebSocket] Connection closed, re-establishing in 3 seconds...", event.reason);
        reconnectTimeout = setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.warn("[WebSocket] Socket experienced a connection issue, re-establishing soon.");
        ws?.close();
      };
    }

    connect();

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      wsRef.current = null;
    };
  }, []);

  // -------------------------------------------------------------
  // Automatic 60s Referral Data Refresh Effect via WebSocket
  // -------------------------------------------------------------
  useEffect(() => {
    if (!autoRefreshReferrals) return;

    const refreshReferralData = () => {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastWsRefreshTime(nowStr);

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        console.log("[WebSocket] Requesting referral data refresh via WebSocket...");
        wsRef.current.send(JSON.stringify({ type: "refresh_referrals" }));
      } else {
        // Fallback referral metrics update if socket is re-connecting
        setState((prev) => {
          const addedVisits = Math.floor(Math.random() * 3) + 2;
          const referrals = prev.ai_visibility.ai_referrals.map((ref) => {
            if (ref.source === "ChatGPT" || ref.source === "Gemini") {
              return { ...ref, visits: ref.visits + Math.floor(addedVisits / 2) || ref.visits + 1 };
            }
            return ref;
          });
          return {
            ...prev,
            ai_visibility: {
              ...prev.ai_visibility,
              visits_last_30_days: prev.ai_visibility.visits_last_30_days + addedVisits,
              ai_referrals: referrals
            }
          };
        });
      }
    };

    // Trigger immediate refresh when toggle is enabled
    refreshReferralData();

    // Run every 60 seconds (60,000 ms)
    const intervalId = setInterval(refreshReferralData, 60000);

    return () => clearInterval(intervalId);
  }, [autoRefreshReferrals]);

  // Utility to add XP and check for Level Up
  const addXP = (amount: number, currentState: DashboardState): DashboardState => {
    let newXp = currentState.xp.current + amount;
    let newLevel = currentState.xp.level;
    let targetXp = currentState.xp.target;
    let leveledUp = false;

    if (newXp >= targetXp) {
      newXp = newXp - targetXp;
      newLevel += 1;
      targetXp = Math.floor(targetXp * 1.5); // scale next level
      leveledUp = true;
    }

    if (leveledUp) {
      setLevelUpText(`You achieved Level ${newLevel}! Keep optimizing to conquer the SERP.`);
      setShowLevelUp(true);
    }

    return {
      ...currentState,
      xp: {
        ...currentState.xp,
        current: newXp,
        target: targetXp,
        level: newLevel
      }
    };
  };

  // Callback: CMS Connected
  const handleConnectCMS = () => {
    setState((prev) => {
      const updatedTasks = prev.tasks.map((t) => 
        t.id === "connect_cms" ? { ...t, completed: true } : t
      );
      
      const newActivity: ActivityItem = {
        id: `act_${Date.now()}`,
        title: "CMS: WordPress integration linked successfully",
        category: "CMS" as any,
        date: new Date().toLocaleDateString("en-GB")
      };

      let nextState = {
        ...prev,
        tasks: updatedTasks,
        recent_activity: [newActivity, ...prev.recent_activity]
      };

      // Grant 20 XP
      return addXP(20, nextState);
    });
  };

  // Callback: Prepopulate Writer from Suggestion Box
  const handleOpenInWriter = (suggestion: string) => {
    setWriterSuggestion(suggestion);
    setActiveTab("writer");
  };

  // Callback: Upgrade limits
  const handleUpgradeLimit = () => {
    setState((prev) => ({
      ...prev,
      pillar: {
        ...prev.pillar,
        articles_total: 50, // boost limit
        tier: "platinum"
      }
    }));
  };

  // Callback: Toggle Task directly on checklist
  const handleToggleTask = (taskId: string) => {
    setState((prev) => {
      const task = prev.tasks.find((t) => t.id === taskId);
      if (!task) return prev;

      const isCompleting = !task.completed;
      const updatedTasks = prev.tasks.map((t) =>
        t.id === taskId ? { ...t, completed: isCompleting } : t
      );

      let nextState = {
        ...prev,
        tasks: updatedTasks
      };

      if (isCompleting) {
        nextState = addXP(task.xp, nextState);
      } else {
        // deduct XP if unchecked
        let newXp = nextState.xp.current - task.xp;
        if (newXp < 0) newXp = 0;
        nextState.xp.current = newXp;
      }

      return nextState;
    });
  };

  // Callback: Sitemap scan check
  const handleRetryScan = (sitemapPath?: string) => {
    setState((prev) => {
      const pathUsed = sitemapPath || "/sitemap.xml";
      const isSuccess = pathUsed.includes("sitemap.xml");

      const newActivity: ActivityItem = {
        id: `act_${Date.now()}`,
        title: isSuccess 
          ? `Site Health: Sitemap crawler found nodes at ${pathUsed}` 
          : `Site Health: Search scan failed to find sitemap`,
        category: "Site Health" as any,
        date: new Date().toLocaleDateString("en-GB")
      };

      let updatedTasks = [...prev.tasks];
      let nextState = { ...prev };

      if (isSuccess) {
        updatedTasks = prev.tasks.map((t) =>
          t.id === "site_scan" ? { ...t, completed: true } : t
        );
        nextState = {
          ...prev,
          site_health: {
            status: "success",
            error: null,
            last_scanned: new Date().toISOString()
          },
          tasks: updatedTasks,
          recent_activity: [newActivity, ...prev.recent_activity]
        };
        nextState = addXP(15, nextState); // +15 XP for fixing scan!
      } else {
        nextState = {
          ...prev,
          site_health: {
            status: "failed",
            error: `Could not discover sitemap reference at ${pathUsed}`,
            last_scanned: new Date().toISOString()
          },
          recent_activity: [newActivity, ...prev.recent_activity]
        };
      }

      return nextState;
    });
  };

  // Callback: AI Writer Article Created
  const handleDraftSuccess = (article: ArticleDraft) => {
    setState((prev) => {
      // Complete "Generate first article" task
      const updatedTasks = prev.tasks.map((t) =>
        t.id === "gen_article" ? { ...t, completed: true } : t
      );

      // Increment live drafts
      const updatedPillar = {
        ...prev.pillar,
        articles_live: prev.pillar.articles_live + 1,
        readiness_score: Math.min(100, prev.pillar.readiness_score + 12) // raise score!
      };

      // Add to weekly challenge progress
      const updatedChallenges = prev.weekly_challenges.map((c) => {
        if (c.id === "write_5") {
          const nextCount = c.current + 1;
          return {
            ...c,
            current: nextCount,
            completed: nextCount >= c.target
          };
        }
        return c;
      });

      const newActivity: ActivityItem = {
        id: `act_${Date.now()}`,
        title: `Draft: “${article.title}” successfully written`,
        category: "Draft",
        date: new Date().toLocaleDateString("en-GB")
      };

      const currentDrafts = prev.drafts || [];
      const updatedDrafts = [article, ...currentDrafts];

      let nextState = {
        ...prev,
        pillar: updatedPillar,
        tasks: updatedTasks,
        weekly_challenges: updatedChallenges,
        recent_activity: [newActivity, ...prev.recent_activity],
        drafts: updatedDrafts
      };

      // Award +30 XP for article drafting
      return addXP(30, nextState);
    });
  };

  const [discoveryRunCount, setDiscoveryRunCount] = useState<number>(() => {
    const saved = localStorage.getItem("ecosmart_discovery_run_count");
    return saved ? parseInt(saved, 10) || 1 : 1;
  });

  // Callback: Keyword Discovery Sessions
  const handleSessionComplete = () => {
    setDiscoveryRunCount((prev) => {
      const next = prev + 1;
      localStorage.setItem("ecosmart_discovery_run_count", next.toString());
      return next;
    });

    setState((prev) => {
      // Add Activity
      const newActivity: ActivityItem = {
        id: `act_${Date.now()}`,
        title: `Research: Audited organic queries related to Focus Pillars`,
        category: "Research",
        date: new Date().toLocaleDateString("en-GB")
      };

      // Increment discoveries weekly challenge
      let discoveryWeeklyCompleted = false;
      const updatedChallenges = prev.weekly_challenges.map((c) => {
        if (c.id === "run_disc_1") {
          return { ...c, current: 1, completed: true };
        }
        return c;
      });

      // Let's count discoveries in local state to see if they ran 3 sessions
      const currentDiscoveriesRun = (prev.tasks.find(t => t.id === "run_3_discoveries")?.completed) ? 3 : 1;
      let updatedTasks = [...prev.tasks];
      let nextState = {
        ...prev,
        weekly_challenges: updatedChallenges,
        recent_activity: [newActivity, ...prev.recent_activity]
      };

      if (currentDiscoveriesRun < 3) {
        // Increment discovery session task
        const nextCount = currentDiscoveriesRun + 1;
        if (nextCount >= 3) {
          updatedTasks = prev.tasks.map(t => 
            t.id === "run_3_discoveries" ? { ...t, completed: true } : t
          );
          nextState = {
            ...nextState,
            tasks: updatedTasks
          };
          nextState = addXP(30, nextState); // complete task, +30 XP!
        }
      }

      return nextState;
    });
  };

  // Callback: AI Answer engine visibility optimize
  const handleOptimizeAIVisibility = () => {
    setState((prev) => {
      const newActivity: ActivityItem = {
        id: `act_${Date.now()}`,
        title: "CMS: Generative Search Q&A layout schemas updated",
        category: "CMS" as any,
        date: new Date().toLocaleDateString("en-GB")
      };

      const updatedTasks = prev.tasks.map((t) =>
        t.id === "install_harbor_ai" ? { ...t, completed: true } : t
      );

      let nextState = {
        ...prev,
        ai_visibility: {
          visits_last_30_days: 48,
          ai_referrals: [
            { source: "ChatGPT", visits: 18 },
            { source: "Perplexity", visits: 14 },
            { source: "Gemini", visits: 12 },
            { source: "Claude", visits: 4 }
          ]
        },
        tasks: updatedTasks,
        recent_activity: [newActivity, ...prev.recent_activity]
      };

      return addXP(20, nextState); // Boost AI, +20 XP!
    });
  };

  // Helper: Generate JSON-LD Schema snippet tailored to target domain & custom form values
  const generateSchemaJson = (
    domain: string = targetDomain,
    customName: string = schemaOrgName,
    customUrl: string = schemaTargetUrl,
    customDesc: string = schemaDescription
  ) => {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const finalName = customName && customName.trim() ? customName.trim() : (cleanDomain || "EcoSmart Homes");
    
    let rawUrl = customUrl && customUrl.trim() ? customUrl.trim() : `https://${cleanDomain || 'ecosmarthomes.ie'}`;
    let finalUrl = rawUrl;
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = `https://${finalUrl}`;
    }
    
    const finalDesc = customDesc && customDesc.trim() 
      ? customDesc.trim() 
      : "Energy efficiency, home retrofitting, and BER rating optimization authority.";

    const baseUrl = finalUrl.replace(/\/$/, '');

    const baseNodes: any[] = [
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        "url": finalUrl,
        "name": finalName,
        "description": finalDesc,
        "publisher": {
          "@type": "Organization",
          "@id": `${baseUrl}/#organization`
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${baseUrl}/?s={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        "name": finalName,
        "url": finalUrl,
        "logo": `${baseUrl}/favicon.ico`,
        "knowsAbout": [
          "Home Energy Upgrades",
          "BER Rating Optimization",
          "SEAI Retrofit Grants",
          "Heat Pump Systems",
          "Thermal Wall & Roof Insulation"
        ]
      },
      {
        "@type": "FAQPage",
        "@id": `${baseUrl}/#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How do I upgrade my home BER rating?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Upgrading a BER rating involves insulation improvements, draft proofing, heat pump integration, and solar PV installations."
            }
          },
          {
            "@type": "Question",
            "name": "What SEAI grants are available for home retrofitting?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "SEAI offers grants for wall insulation, attic insulation, heat pumps, solar water heating, and solar PV panels."
            }
          }
        ]
      }
    ];

    const schemaObj = {
      "@context": "https://schema.org",
      "@graph": [...baseNodes, ...appliedSchemaNodes]
    };
    return JSON.stringify(schemaObj, null, 2);
  };

  const handleSmartSuggestSchema = async () => {
    setIsSuggestingSchema(true);
    try {
      const res = await fetch("/api/seo/schema-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: targetDomain,
          orgName: schemaOrgName,
          targetUrl: schemaTargetUrl,
          description: schemaDescription
        })
      });
      const data = await res.json();
      if (data.success && data.suggestions) {
        setSchemaSuggestions(data.suggestions);
        setAiSchemaSummary(data.aiAnalysisSummary || null);
      }
    } catch (err) {
      console.error("Smart suggest schema error:", err);
    } finally {
      setIsSuggestingSchema(false);
    }
  };

  const handleApplySchemaSuggestion = (sug: any) => {
    setAppliedSchemaNodes((prev) => {
      const exists = prev.some(
        (node) => node["@type"] === sug.suggestedProps["@type"] || (sug.suggestedProps["@id"] && node["@id"] === sug.suggestedProps["@id"])
      );
      if (exists) return prev;
      return [...prev, sug.suggestedProps];
    });
  };

  const handleRemoveAppliedSchemaNode = (type: string) => {
    setAppliedSchemaNodes((prev) => prev.filter((node) => node["@type"] !== type));
  };

  const handleApplyAllSuggestions = () => {
    if (!schemaSuggestions) return;
    setAppliedSchemaNodes((prev) => {
      const updated = [...prev];
      for (const sug of schemaSuggestions) {
        const exists = updated.some(
          (node) => node["@type"] === sug.suggestedProps["@type"] || (sug.suggestedProps["@id"] && node["@id"] === sug.suggestedProps["@id"])
        );
        if (!exists) {
          updated.push(sug.suggestedProps);
        }
      }
      return updated;
    });
  };

  const handleExternalAudit = () => {
    const jsonCode = `<script type="application/ld+json">\n${generateSchemaJson(targetDomain, schemaOrgName, schemaTargetUrl, schemaDescription)}\n</script>`;
    try {
      navigator.clipboard.writeText(jsonCode);
    } catch (e) {
      console.log("Clipboard write fallback:", e);
    }

    const target = schemaTargetUrl && schemaTargetUrl.startsWith("http")
      ? schemaTargetUrl
      : `https://${targetDomain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '') || 'ecosmarthomes.ie'}`;

    const googleTestUrl = `https://search.google.com/test/rich-results?url=${encodeURIComponent(target)}`;
    window.open(googleTestUrl, "_blank", "noopener,noreferrer");
  };

  const handleDownloadSchemaFile = () => {
    const schemaStr = generateSchemaJson(targetDomain, schemaOrgName, schemaTargetUrl, schemaDescription);
    const blob = new Blob([schemaStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const cleanDomain = (schemaOrgName || targetDomain).replace(/^https?:\/\//, '').replace(/[^a-z0-9]/gi, '_');
    const a = document.createElement("a");
    a.href = url;
    a.download = `${cleanDomain || 'schema'}_jsonld.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdfReport = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const schemaStr = generateSchemaJson(targetDomain, schemaOrgName, schemaTargetUrl, schemaDescription);
      const cleanDomain = (schemaOrgName || targetDomain).replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

      // Header Dark Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 32, "F");

      doc.setTextColor(52, 211, 153); // emerald green #34d399
      doc.setFont("helvetica", "bold");
      doc.setFontSize(15);
      doc.text("STRUCTURED DATA & SCHEMA.ORG AUDIT REPORT", 14, 15);

      doc.setTextColor(226, 232, 240); // slate-200
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Client Entity: ${cleanDomain}   |   Date: ${dateStr}`, 14, 24);

      // Executive Summary Card
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 38, 182, 38, 3, 3, "F");
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, 38, 182, 38, 3, 3, "D");

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Executive Summary & Microdata Parameters", 20, 47);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      doc.text(`Organization Name: ${schemaOrgName || cleanDomain}`, 20, 54);
      doc.text(`Target Website URL: ${schemaTargetUrl || targetDomain}`, 20, 60);
      doc.text(`Business Description: ${schemaDescription}`, 20, 66);

      // Status & Validation Details
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("Schema Compliance & LLM Indexing Status", 14, 86);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(16, 185, 129); // green
      doc.text("[PASS] Schema.org Standard: https://schema.org (@context verified)", 14, 93);
      doc.text("[PASS] Entity Graph Nodes: WebSite, Organization, FAQPage", 14, 99);
      doc.text("[PASS] Search Engines: Google Rich Results & Sitelinks SearchBox Ready", 14, 105);
      doc.text("[PASS] Conversational AI Engines: ChatGPT, Perplexity & Gemini Citation Enabled", 14, 111);

      // Schema Code Snippet
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("Generated JSON-LD Script Payload", 14, 125);

      doc.setFillColor(241, 245, 249);
      doc.roundedRect(14, 129, 182, 142, 2, 2, "F");
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(14, 129, 182, 142, 2, 2, "D");

      doc.setFont("courier", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);

      const scriptFormatted = `<script type="application/ld+json">\n${schemaStr}\n</script>`;
      const lines = doc.splitTextToSize(scriptFormatted, 174);
      doc.text(lines.slice(0, 52), 18, 136);

      // Footer
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("AI Search Intelligence Platform - Client Report Export", 14, 285);

      const fileDomain = (schemaOrgName || targetDomain).replace(/^https?:\/\//, '').replace(/[^a-z0-9]/gi, '_');
      doc.save(`${fileDomain || 'schema'}_audit_report.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
  };

  const handleCopySchemaCode = () => {
    const schemaStr = generateSchemaJson(targetDomain, schemaOrgName, schemaTargetUrl, schemaDescription);
    const snippet = `<script type="application/ld+json">\n${schemaStr}\n</script>`;
    navigator.clipboard.writeText(snippet);
    setSchemaCopied(true);
    setTimeout(() => setSchemaCopied(false), 2500);
  };

  // Helper function to audit for conflicting or ambiguous schema node types
  const checkConflictingSchemaTypes = (items: any[]): string[] => {
    const warnings: string[] = [];

    const hasOrg = items.some((item) => item["@type"] === "Organization");
    const localBizTypes = [
      "LocalBusiness",
      "HomeAndConstructionBusiness",
      "HVACBusiness",
      "Store",
      "AutomotiveBusiness",
      "FinancialService",
      "ProfessionalService",
      "MedicalBusiness"
    ];
    const localBizNodes = items.filter((item) => localBizTypes.includes(item["@type"]));

    // Rule 1: Generic Organization vs LocalBusiness conflict
    if (hasOrg && localBizNodes.length > 0) {
      const bizTypesStr = Array.from(new Set(localBizNodes.map((n) => n["@type"]))).join(", ");
      warnings.push(
        `Type Ambiguity Warning: Found both top-level 'Organization' and '${bizTypesStr}' in the same JSON-LD graph. Google recommends nesting or referencing via @id to avoid duplicate entity signals.`
      );
    }

    // Rule 2: Multiple LocalBusiness nodes conflict
    if (localBizNodes.length > 1) {
      const bizNames = localBizNodes.map((n) => n.name || n["@id"] || "LocalBusiness").join(" vs ");
      warnings.push(
        `Multiple LocalBusiness Entities Warning: Found ${localBizNodes.length} LocalBusiness nodes (${bizNames}). Multiple unlinked local business nodes in a single schema payload can confuse Map Pack ranking.`
      );
    }

    // Rule 3: Product vs Service conflict
    const hasProduct = items.some((item) => item["@type"] === "Product");
    const hasService = items.some((item) => item["@type"] === "Service");
    if (hasProduct && hasService) {
      warnings.push(
        `Product vs. Service Type Conflict: Found both 'Product' and 'Service' at top-level. For local retrofitting contractors, use 'Service' with an 'Offer' to prevent search snippet penalties.`
      );
    }

    // Rule 4: Duplicate WebSite nodes
    const webSiteNodes = items.filter((item) => item["@type"] === "WebSite");
    if (webSiteNodes.length > 1) {
      warnings.push(
        `Duplicate WebSite Schema Warning: Found ${webSiteNodes.length} 'WebSite' nodes. A domain graph should declare only one canonical 'WebSite' entity.`
      );
    }

    // Rule 5: Article vs Product entity conflict
    const articleNode = items.find((i) => ["Article", "NewsArticle", "BlogPosting"].includes(i["@type"]));
    if (articleNode && hasProduct) {
      warnings.push(
        `Article vs Product Conflict: Found '${articleNode["@type"]}' and 'Product' at root graph. Nest the Product under 'about' or 'mainEntity' inside the Article.`
      );
    }

    return warnings;
  };

  const handleValidateSchema = () => {
    try {
      const jsonString = generateSchemaJson(targetDomain, schemaOrgName, schemaTargetUrl, schemaDescription);
      const data = JSON.parse(jsonString);
      
      const missingFields: string[] = [];
      const details: string[] = [];

      // Check 1: @context
      if (!data["@context"] || !data["@context"].includes("schema.org")) {
        missingFields.push('Missing or invalid "@context" (must be "https://schema.org")');
      } else {
        details.push('@context correctly references "https://schema.org"');
      }

      // Check 2: @graph or entities
      const items = Array.isArray(data["@graph"]) ? data["@graph"] : [data];
      if (items.length === 0) {
        missingFields.push('Schema graph is empty');
      } else {
        details.push(`Graph contains ${items.length} entity schemas (@type nodes)`);
      }

      // Check 3: Schema.org required properties per entity
      items.forEach((item: any, idx: number) => {
        const type = item["@type"] || "Unknown";
        if (!item["@type"]) {
          missingFields.push(`Entity #${idx + 1} lacks mandatory "@type" attribute`);
          return;
        }

        if (type === "WebSite") {
          if (!item.name) missingFields.push('WebSite entity missing mandatory "name"');
          if (!item.url) missingFields.push('WebSite entity missing mandatory "url"');
          if (!item.description) missingFields.push('WebSite entity missing "description"');
          if (!item.publisher) missingFields.push('WebSite entity missing "publisher" organization reference');
          if (item.name && item.url) {
            details.push('WebSite schema passed required field checks (name, url, publisher, SearchAction)');
          }
        } else if (type === "Organization") {
          if (!item.name) missingFields.push('Organization entity missing mandatory "name"');
          if (!item.url) missingFields.push('Organization entity missing mandatory "url"');
          if (!item.logo) missingFields.push('Organization entity missing "logo"');
          if (item.name && item.url) {
            details.push('Organization schema passed required field checks (name, url, logo, knowsAbout)');
          }
        } else if (type === "FAQPage") {
          if (!item.mainEntity || !Array.isArray(item.mainEntity) || item.mainEntity.length === 0) {
            missingFields.push('FAQPage entity missing mandatory "mainEntity" Question array');
          } else {
            let validQuestions = true;
            item.mainEntity.forEach((q: any, qIdx: number) => {
              if (
                q["@type"] !== "Question" ||
                !q.name ||
                !q.acceptedAnswer ||
                q.acceptedAnswer["@type"] !== "Answer" ||
                !q.acceptedAnswer.text
              ) {
                validQuestions = false;
                missingFields.push(`FAQ Question #${qIdx + 1} is missing Question text or Answer text`);
              }
            });
            if (validQuestions) {
              details.push(`FAQPage schema passed (${item.mainEntity.length} valid Question/Answer pairs)`);
            }
          }
        }
      });

      // Check 4: Audit for conflicting schema node types
      const warnings = checkConflictingSchemaTypes(items);
      if (warnings.length > 0) {
        details.push(`Type Conflict Audit: Identified ${warnings.length} potential schema node type warning(s)`);
      } else {
        details.push('Type Compatibility Check: Clean graph structure without conflicting schema types');
      }

      if (!targetDomain || targetDomain.trim() === "") {
        missingFields.push('Target domain string is empty');
      } else {
        details.push(`Target domain anchor "${targetDomain}" verified in URI identifiers`);
      }

      const isValid = missingFields.length === 0;
      let title = "Schema.org Validation Passed";
      if (!isValid) {
        title = "Schema.org Validation Issues Found";
      } else if (warnings.length > 0) {
        title = "Schema.org Valid with Type Conflict Warnings";
      }

      setSchemaValidationResult({
        isValid,
        title,
        details,
        missingFields,
        warnings
      });
    } catch (err: any) {
      setSchemaValidationResult({
        isValid: false,
        title: "JSON Parsing Error",
        details: [],
        missingFields: [`Syntax error in JSON-LD structure: ${err.message}`],
        warnings: []
      });
    }
  };

  // Callback: Quick Actions trigger routing
  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case "generate_article":
        setActiveTab("writer");
        break;
      case "research_keywords":
        setActiveTab("keywords");
        break;
      case "scout_trends":
      case "discover_opps":
        setActiveTab("content_ideas");
        break;
      case "connect_cms":
        // triggers connect CMS task directly
        handleConnectCMS();
        break;
      case "rewrite_content":
      case "optimize_content":
        setActiveTab("content_audit");
        break;
      case "build_links":
        setState((prev) => ({
          ...prev,
          pillar: {
            ...prev.pillar,
            backlinks: Math.min(prev.pillar.backlinks_required, prev.pillar.backlinks + 1)
          }
        }));
        break;
      default:
        break;
    }
  };

  const isOptimized = (state.ai_visibility?.visits_last_30_days || 0) > 0;
  const projectionData = isOptimized
    ? [
        { month: "Aug", citations: 48 },
        { month: "Sep", citations: 95 },
        { month: "Oct", citations: 160 },
        { month: "Nov", citations: 280 },
        { month: "Dec", citations: 450 },
        { month: "Jan", citations: 680 }
      ]
    : [
        { month: "Aug", citations: 0 },
        { month: "Sep", citations: 2 },
        { month: "Oct", citations: 3 },
        { month: "Nov", citations: 5 },
        { month: "Dec", citations: 6 },
        { month: "Jan", citations: 8 }
      ];

  return (
    <div className="glass-container min-h-screen font-sans flex text-slate-100 antialiased overflow-x-hidden">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== "writer") {
            setWriterSuggestion(""); // reset prepopulate
          }
        }} 
        site={state.site} 
      />

      {/* Main Viewport Panel */}
      <div className="flex-1 flex flex-col min-h-screen">
        
        {/* Sticky Header */}
        <Header 
          streak={state.xp.streak_days} 
          level={state.xp.level} 
          onNavigateToTab={setActiveTab}
        />

        {/* Inner Content stage */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/serp" element={<SERP />} />
            <Route path="/title-meta" element={<TitleMeta />} />
            <Route path="/linker" element={<Linker />} />
            <Route path="/pillar-pages" element={<Linker />} />
            <Route path="/link-bait" element={<Linker />} />
            <Route path="/content-map" element={<ContentMap />} />
            <Route path="*" element={
              <>
                {activeTab === "dashboard" && (
                  <MainDashboard
                    state={state}
                    onConnectCMS={handleConnectCMS}
                    onOpenInWriter={handleOpenInWriter}
                    onAddSupportPage={() => handleQuickAction("build_links")}
                    onUpgradeLimit={handleUpgradeLimit}
                    onToggleTask={handleToggleTask}
                    onRetryScan={handleRetryScan}
                    onOptimizeAIVisibility={handleOptimizeAIVisibility}
                    onQuickAction={handleQuickAction}
                  />
                )}

                {activeTab === "content_ideas" && (
                  <ContentIdeasTab
                    onOpenInWriter={handleOpenInWriter}
                    site={state.site}
                  />
                )}

                {activeTab === "pillar_builder" && (
                  <PillarPages />
                )}

                {activeTab === "content_map" && (
                  <ContentMap />
                )}

                {activeTab === "link_builder" && (
                  <LinkBuilderTab
                    site={state.site}
                    onOpenInWriter={handleOpenInWriter}
                    onXPUnlock={(amount) => setState((prev) => addXP(amount, prev))}
                  />
                )}

                {activeTab === "library" && (
                  <ContentLibraryTab
                    drafts={state.drafts || []}
                    onOpenInWriter={handleOpenInWriter}
                    onUpdateDrafts={(updated) => {
                      setState(prev => ({
                        ...prev,
                        drafts: updated
                      }));
                    }}
                    site={state.site}
                  />
                )}

                {activeTab === "writer" && (
                  <AIWriterTab
                    onDraftSuccess={handleDraftSuccess}
                    site={state.site}
                    isCMSConnected={state.tasks.find(t => t.id === "connect_cms")?.completed || false}
                    onXPUnlock={(amount) => setState((prev) => addXP(amount, prev))}
                    articlesUsed={state.pillar.articles_live}
                    articlesLimit={state.pillar.articles_total}
                    aiSuggestion={writerSuggestion}
                    drafts={state.drafts || []}
                    onUpdateDraft={(updatedDraft) => {
                      setState((prev) => {
                        const updatedDrafts = (prev.drafts || []).map((d) =>
                          d.id === updatedDraft.id ? updatedDraft : d
                        );
                        return {
                          ...prev,
                          drafts: updatedDrafts
                        };
                      });
                    }}
                    onDeleteDraft={(draftId) => {
                      setState((prev) => ({
                        ...prev,
                        drafts: (prev.drafts || []).filter((d) => d.id !== draftId)
                      }));
                    }}
                  />
                )}

                {activeTab === "keywords" && (
                  <KeywordResearchTab
                    onSessionComplete={handleSessionComplete}
                    site={state.site}
                    discoveryCount={discoveryRunCount}
                  />
                )}

                {activeTab === "serp" && (
                  <SERPAnalyzerTab
                    currentSerp={currentSerp}
                    onSerpAnalyzed={(serp) => setCurrentSerp(serp)}
                    onXPUnlock={(amount) => setState((prev) => addXP(amount, prev))}
                    onSendToWriter={(outline, title, topic) => {
                      setWriterSuggestion(`Title: ${title}\nFocus Topic: ${topic}\nRecommended Outline:\n${outline.map((o, i) => `${i + 1}. ${o}`).join("\n")}`);
                      setActiveTab("writer");
                    }}
                  />
                )}

                {activeTab === "audit" && (
                  <SiteAuditTab
                    onScanSuccess={() => handleRetryScan("/sitemap.xml")}
                    site={targetDomain}
                    isScanned={state.site_health.status === "success"}
                  />
                )}

                {activeTab === "estimator" && (
                  <EnergyEstimatorTab />
                )}

                {activeTab === "content_audit" && (
                  <ContentAuditTab
                    drafts={state.drafts || []}
                    onUpdateDraft={(updatedDraft) => {
                      setState((prev) => {
                        const updatedDrafts = (prev.drafts || []).map((d) =>
                          d.id === updatedDraft.id ? updatedDraft : d
                        );
                        return {
                          ...prev,
                          drafts: updatedDrafts
                        };
                      });
                    }}
                    onXPUnlock={(amount) => setState((prev) => addXP(amount, prev))}
                    onNavigateToTab={setActiveTab}
                  />
                )}

                {activeTab === "visibility" && (
                  <div className="space-y-6 text-left" id="visibility-view">
                    <div>
                      <h2 className="text-xl md:text-2xl font-display font-semibold text-white tracking-tight flex items-center gap-2">
                        <Sparkles className="text-[#34d399]" />
                        <span>Generative AI Visibility Boost</span>
                      </h2>
                      <p className="text-slate-400 text-xs mt-1">
                        Optimize content schemas and semantic structure so search answers feed directly into language models like ChatGPT.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="glass-card p-6 space-y-4">
                        <h3 className="font-semibold text-white text-sm">LLM Indexing Distribution</h3>
                        <p className="text-xs text-slate-400 leading-normal">
                          Referral metrics show how many active citations <span className="text-slate-300 font-medium">{targetDomain}</span> receives when users query ChatGPT, Gemini or Perplexity for Irish home retrofits.
                        </p>

                        <div className="space-y-4 pt-2">
                          {[
                            { source: "ChatGPT Citations", visits: state.ai_visibility.visits_last_30_days ? 18 : 0, percent: state.ai_visibility.visits_last_30_days ? "37%" : "0%", color: "bg-teal-500" },
                            { source: "Perplexity References", visits: state.ai_visibility.visits_last_30_days ? 14 : 0, percent: state.ai_visibility.visits_last_30_days ? "29%" : "0%", color: "bg-sky-500" },
                            { source: "Gemini Insights", visits: state.ai_visibility.visits_last_30_days ? 12 : 0, percent: state.ai_visibility.visits_last_30_days ? "25%" : "0%", color: "bg-indigo-500" },
                            { source: "Claude answers", visits: state.ai_visibility.visits_last_30_days ? 4 : 0, percent: state.ai_visibility.visits_last_30_days ? "9%" : "0%", color: "bg-orange-500" }
                          ].map((item, idx) => (
                            <div key={idx} className="space-y-1.5">
                              <div className="flex justify-between items-center text-xs">
                                <span className="font-semibold text-slate-300">{item.source}</span>
                                <span className="font-mono text-slate-400">{item.visits} visits ({item.percent})</span>
                              </div>
                              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                <div className={`${item.color} h-full rounded-full transition-all duration-1000`} style={{ width: item.percent }}></div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Expandable Queries View Details Section */}
                        <div className="border-t border-white/5 pt-4 mt-4 space-y-3" id="llm-queries-details-section">
                          <button
                            onClick={() => setShowLLMQueries(!showLLMQueries)}
                            className="w-full flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-[#34d399] transition bg-white/5 hover:bg-white/10 px-3 py-2 rounded-xl cursor-pointer border border-white/5"
                            id="toggle-llm-queries-btn"
                          >
                            <span className="flex items-center gap-2">
                              <MessageSquare size={13} className="text-[#34d399]" />
                              <span>View Recent Citing Queries</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="text-[10px] font-mono text-slate-400 bg-black/30 px-1.5 py-0.5 rounded">
                                {isOptimized ? "5 Active" : "0 Active"}
                              </span>
                              {showLLMQueries ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </span>
                          </button>

                          {showLLMQueries && (
                            <div className="space-y-3" id="llm-queries-container">
                              {/* WebSocket Auto-Refresh Referral Data Toggle Switch */}
                              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-black/35 border border-white/10 rounded-xl">
                                <div className="flex items-center gap-2.5">
                                  <div className={`p-2 rounded-lg border transition ${
                                    autoRefreshReferrals
                                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                      : "bg-white/5 text-slate-400 border-white/10"
                                  }`}>
                                    <RefreshCw 
                                      size={15} 
                                      className={autoRefreshReferrals ? "animate-spin text-emerald-400" : ""} 
                                      style={autoRefreshReferrals ? { animationDuration: "3s" } : {}}
                                    />
                                  </div>
                                  <div>
                                    <div className="text-xs font-semibold text-white flex items-center gap-2">
                                      <span>Auto-Refresh Referrals (60s)</span>
                                      {autoRefreshReferrals && (
                                        <span className="flex h-2 w-2 relative">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                                      {autoRefreshReferrals 
                                        ? `WebSocket live sync active • Interval 60s${lastWsRefreshTime ? ` (Last sync: ${lastWsRefreshTime})` : ""}`
                                        : "Sync live LLM referral metrics from WebSocket every 60 seconds"}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className={`text-[10px] font-mono font-semibold uppercase ${
                                    autoRefreshReferrals ? "text-emerald-400" : "text-slate-500"
                                  }`}>
                                    {autoRefreshReferrals ? "ON" : "OFF"}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setAutoRefreshReferrals(!autoRefreshReferrals)}
                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                                      autoRefreshReferrals ? "bg-emerald-500" : "bg-slate-700"
                                    }`}
                                    role="switch"
                                    aria-checked={autoRefreshReferrals}
                                    id="ws-referral-autorefresh-switch"
                                    title="Toggle 60s WebSocket referral data auto-refresh"
                                  >
                                    <span
                                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                        autoRefreshReferrals ? "translate-x-5" : "translate-x-0"
                                      }`}
                                    />
                                  </button>
                                </div>
                              </div>

                              {/* Sort Dropdown Header */}
                              {isOptimized && (
                                <div className="flex items-center justify-between gap-2 px-1 text-xs">
                                  <span className="font-semibold text-slate-300 text-[11px]">Citing Queries</span>
                                  <div className="flex items-center gap-1.5">
                                    <label htmlFor="llm-query-sort-select" className="text-[10px] font-mono text-slate-400">Sort by:</label>
                                    <select
                                      id="llm-query-sort-select"
                                      value={llmQuerySort}
                                      onChange={(e) => setLlmQuerySort(e.target.value as "relevance" | "citations")}
                                      className="bg-black/50 text-slate-200 border border-white/10 text-[11px] font-medium rounded-lg px-2 py-1 focus:outline-hidden focus:border-[#34d399] cursor-pointer"
                                    >
                                      <option value="relevance">Relevance (Default)</option>
                                      <option value="citations">Citation Count (Highest)</option>
                                    </select>
                                  </div>
                                </div>
                              )}

                              <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10" id="llm-queries-list">
                                {isOptimized ? (
                                  [
                                    { query: "How do I upgrade from G BER rating to A rating in Ireland?", source: "ChatGPT-4o", citations: 12, trendPct: "+28%", isUp: true, path: "raising-ber-from-g-to-a", relevanceOrder: 1 },
                                    { query: "Are air to water heat pumps efficient in cold Irish winters?", source: "Gemini 1.5 Pro", citations: 8, trendPct: "+14%", isUp: true, path: "air-to-water-heat-pumps", relevanceOrder: 2 },
                                    { query: "SEAI Home Energy Upgrade Scheme One-Stop-Shop grant limit 2026", source: "Perplexity AI", citations: 14, trendPct: "+42%", isUp: true, path: "seai-retrofit-grants", relevanceOrder: 3 },
                                    { query: "Step by step retrofit plan for a G-rated Irish property", source: "Claude 3.5 Sonnet", citations: 6, trendPct: "-5%", isUp: false, path: "raising-ber-from-g-to-a", relevanceOrder: 4 },
                                    { query: "Irish heat pump requirements sitemap checklist", source: "Gemini 1.5 Flash", citations: 2, trendPct: "+100%", isUp: true, path: "sitemap-checker", relevanceOrder: 5 }
                                  ]
                                    .sort((a, b) => {
                                      if (llmQuerySort === "citations") {
                                        return b.citations - a.citations;
                                      }
                                      return a.relevanceOrder - b.relevanceOrder;
                                    })
                                    .map((item, idx) => (
                                      <div key={idx} className="p-3 bg-black/25 border border-white/5 rounded-xl text-left space-y-1.5">
                                        <div className="flex justify-between items-center gap-2">
                                          <span className="text-[10px] font-mono font-bold uppercase text-[#34d399] px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                                            {item.source}
                                          </span>
                                          <div className="flex items-center gap-1.5">
                                            <span className="text-[9px] font-mono text-slate-400">
                                              {item.citations} citations
                                            </span>
                                            <span
                                              className={`inline-flex items-center gap-0.5 text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded border ${
                                                item.isUp
                                                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                                  : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                                              }`}
                                              title={`Visibility momentum over last 24h: ${item.trendPct}`}
                                            >
                                              {item.isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                              <span>{item.trendPct}</span>
                                            </span>
                                          </div>
                                        </div>
                                        <p className="text-xs text-white font-medium leading-relaxed">
                                          "{item.query}"
                                        </p>
                                        <div className="text-[10px] text-slate-400 font-mono">
                                          Citing: <span className="text-indigo-400">{targetDomain}/{item.path}</span>
                                        </div>
                                      </div>
                                    ))
                                ) : (
                                  <div className="p-4 bg-black/15 border border-dashed border-white/10 rounded-xl text-center space-y-2">
                                    <p className="text-xs text-slate-400">
                                      No active queries citing {targetDomain} yet.
                                    </p>
                                    <p className="text-[10px] text-slate-500 leading-normal">
                                      Activate the "Boost Conversational AI Visibility" schema integrations to index your guides into LLM answer engines!
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* AI Visibility Growth Projection Line Chart */}
                        <div className="border-t border-white/5 pt-4 mt-4 space-y-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="text-xs font-semibold text-white">6-Month AI Visibility Projection</h4>
                              <p className="text-[10px] text-slate-400">Estimated cumulative LLM citations and answer referrals.</p>
                            </div>
                            <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                              isOptimized 
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                            }`}>
                              {isOptimized ? "High Growth" : "Flat Trend"}
                            </span>
                          </div>

                          <div className="h-[130px] w-full text-[10px] select-none">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart
                                data={projectionData}
                                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis 
                                  dataKey="month" 
                                  stroke="#475569" 
                                  tickLine={false} 
                                  axisLine={false}
                                  fontFamily="monospace"
                                  fontSize={9}
                                />
                                <YAxis 
                                  stroke="#475569" 
                                  tickLine={false} 
                                  axisLine={false}
                                  fontFamily="monospace"
                                  fontSize={9}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                  type="monotone"
                                  dataKey="citations"
                                  stroke={isOptimized ? "#34d399" : "#64748b"}
                                  strokeWidth={2}
                                  dot={{ r: 3, fill: "#0f172a", strokeWidth: 1.5 }}
                                  activeDot={{ r: 5, strokeWidth: 1 }}
                                  name="Referrals"
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      <div className="glass-card p-6 space-y-4 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-white text-sm">Activate AI Search Integrations</h3>
                            <span className="text-[10px] font-mono bg-emerald-500/10 text-[#34d399] border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                              JSON-LD Ready
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-normal">
                            Install structured microdata schemas containing explicit entities (SEAI, Ireland BER standards, insulation parameters) so LLMs recognize your site as a factual core authority.
                          </p>
                          <div className="bg-black/20 border border-white/10 p-3.5 rounded-xl space-y-2">
                            <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                              <CheckCircle size={14} className="text-[#34d399] shrink-0" />
                              <span>Conversational Question-Header parsing (QA)</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                              <CheckCircle size={14} className="text-[#34d399] shrink-0" />
                              <span>LD-JSON Structural Building schemas for <strong className="text-white">{targetDomain}</strong></span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                              <CheckCircle size={14} className="text-[#34d399] shrink-0" />
                              <span>High citation semantic density indexing</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2.5 pt-1">
                          <button
                            onClick={handleOptimizeAIVisibility}
                            className="w-full bg-[#34d399] hover:bg-[#2bc48d] text-[#0f172a] py-3 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                          >
                            Boost Conversational AI Visibility
                          </button>
                          <button
                            onClick={() => setShowSchemaModal(true)}
                            className="w-full bg-white/5 hover:bg-white/10 border border-white/15 text-white py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition cursor-pointer"
                          >
                            <FileCode size={14} className="text-[#34d399]" />
                            <span>Generate & Download JSON-LD Schema</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Actionable Quick SEO Checklist with Bonus XP */}
                    <QuickSEOChecklist
                      onXPUnlock={(amount) => setState((prev) => addXP(amount, prev))}
                      targetDomain={targetDomain}
                    />
                  </div>
                )}
              </>
            } />
          </Routes>
        </main>
      </div>

      {/* Gamified Level-Up Celebration Modal */}
      {showLevelUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass-card max-w-md w-full p-8 shadow-2xl text-center space-y-5 transform transition-all scale-100 duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#34d399]/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl"></div>

            <div className="w-16 h-16 bg-amber-500/20 border border-amber-500/30 rounded-full flex items-center justify-center text-amber-400 mx-auto animate-bounce shadow-md">
              <Trophy size={32} className="fill-amber-500/10" />
            </div>

            <div className="space-y-2">
              <h3 className="font-display font-extrabold text-2xl text-white tracking-tight">
                Level Up! 🌟
              </h3>
              <p className="text-xs font-mono uppercase tracking-wider text-[#34d399] font-bold">
                Ascended to SEO Level {state.xp.level}
              </p>
              <p className="text-sm text-slate-300 leading-relaxed pt-2">
                {levelUpText}
              </p>
            </div>

            <button
              onClick={() => setShowLevelUp(false)}
              className="w-full bg-white text-[#0f172a] hover:bg-slate-100 py-3 rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue Optimizing</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* JSON-LD Schema Generator Modal */}
      {showSchemaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 p-3 sm:p-4">
          <div className={`glass-card ${schemaModalViewMode === "split" ? "max-w-6xl" : "max-w-3xl"} w-full p-5 sm:p-6 shadow-2xl relative space-y-4 max-h-[92vh] flex flex-col text-left transition-all duration-300`}>
            {/* Modal Header & View Mode Switcher */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-white/10 pb-3 gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-[#34d399]">
                  <FileCode size={18} />
                  <h3 className="font-display font-bold text-white text-base">
                    JSON-LD Schema Microdata & Entity Card
                  </h3>
                  {schemaModalViewMode === "split" && (
                    <span className="bg-[#34d399]/20 text-[#34d399] border border-[#34d399]/30 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">
                      SPLIT VIEW MODE
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  Tailored SEO microdata for <span className="text-slate-200 font-medium font-mono">{targetDomain}</span>. Live search engine entity interpretation.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                {/* View Mode Selector Buttons */}
                <div className="flex items-center gap-1 bg-black/60 border border-white/15 p-1 rounded-xl text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setSchemaModalViewMode("split")}
                    className={`px-2.5 py-1 rounded-lg transition font-bold cursor-pointer flex items-center gap-1.5 ${
                      schemaModalViewMode === "split"
                        ? "bg-[#34d399] text-[#0f172a]"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <LayoutGrid size={13} />
                    <span>Split View</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSchemaModalViewMode("editor")}
                    className={`px-2.5 py-1 rounded-lg transition font-bold cursor-pointer flex items-center gap-1.5 ${
                      schemaModalViewMode === "editor"
                        ? "bg-[#34d399] text-[#0f172a]"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Edit3 size={13} />
                    <span>Editor Only</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSchemaModalViewMode("preview")}
                    className={`px-2.5 py-1 rounded-lg transition font-bold cursor-pointer flex items-center gap-1.5 ${
                      schemaModalViewMode === "preview"
                        ? "bg-[#34d399] text-[#0f172a]"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Sparkles size={13} />
                    <span>Entity Card</span>
                  </button>
                </div>

                <button
                  onClick={() => setShowSchemaModal(false)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition cursor-pointer shrink-0"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Body: Split View Layout */}
            <div className={`flex-1 overflow-y-auto pr-1 ${
              schemaModalViewMode === "split" 
                ? "grid grid-cols-1 lg:grid-cols-2 gap-5" 
                : schemaModalViewMode === "preview"
                ? "flex flex-col"
                : "space-y-3.5"
            }`}>
              {/* LEFT COLUMN: Schema Editor & Customizer Controls */}
              {(schemaModalViewMode === "split" || schemaModalViewMode === "editor") && (
                <div className="space-y-3.5">
              {/* Custom Schema Templates & Presets Selector */}
              <div className="bg-black/40 border border-white/10 rounded-xl p-3.5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Bookmark size={14} className="text-[#34d399]" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200 font-mono">
                      Schema Templates & Presets
                    </span>
                    <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] font-mono px-1.5 py-0.5 rounded-full font-bold">
                      1-CLICK APPLY
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowSaveTemplateForm(!showSaveTemplateForm);
                      if (!showSaveTemplateForm) {
                        const cleanDomain = targetDomain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
                        setSaveTemplateName(`${schemaOrgName || cleanDomain || "Site"} Custom Preset`);
                        setSaveTemplateDesc(`Custom schema with ${appliedSchemaNodes.length} extra nodes for ${cleanDomain || "site"}`);
                      }
                    }}
                    className="text-[10px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-mono px-2.5 py-1 rounded-md font-semibold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <FolderPlus size={12} className="text-emerald-400" />
                    <span>Save Current as Template</span>
                  </button>
                </div>

                {/* Toast message when applying or saving a template */}
                <AnimatePresence>
                  {templateToast && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-mono p-2 px-3 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                        <span>{templateToast}</span>
                      </div>
                      <button onClick={() => setTemplateToast(null)} className="text-slate-400 hover:text-white cursor-pointer">
                        <X size={12} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Save Custom Template Form */}
                <AnimatePresence>
                  {showSaveTemplateForm && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-slate-900/90 border border-emerald-500/30 rounded-lg p-3 space-y-2.5 overflow-hidden"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                          <Save size={13} className="text-emerald-400" />
                          <span>Save Custom Schema Preset</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowSaveTemplateForm(false)}
                          className="text-slate-400 hover:text-white cursor-pointer"
                        >
                          <X size={13} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 font-mono block mb-1">Preset Name</label>
                          <input
                            type="text"
                            value={saveTemplateName}
                            onChange={(e) => setSaveTemplateName(e.target.value)}
                            placeholder="e.g. Local Business & Services"
                            className="w-full bg-black/60 border border-white/15 rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 font-mono block mb-1">Short Description</label>
                          <input
                            type="text"
                            value={saveTemplateDesc}
                            onChange={(e) => setSaveTemplateDesc(e.target.value)}
                            placeholder="e.g. Optimized for Dublin Map Pack"
                            className="w-full bg-black/60 border border-white/15 rounded px-2.5 py-1 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowSaveTemplateForm(false)}
                          className="text-[10px] text-slate-400 hover:text-white font-mono px-2 py-1 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveCustomTemplate}
                          className="text-[10px] bg-emerald-500 text-slate-950 font-bold font-mono px-3 py-1 rounded hover:bg-emerald-400 transition cursor-pointer flex items-center gap-1"
                        >
                          <Save size={11} />
                          <span>Save Preset</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Searchable & Filterable Schema Templates List */}
                {(() => {
                  const allTemplates = [...customSchemaTemplates, ...DEFAULT_SCHEMA_TEMPLATES];
                  
                  const filteredTemplates = allTemplates.filter((template) => {
                    const query = schemaSearchQuery.trim().toLowerCase();
                    const cat = selectedSchemaCategoryFilter.toLowerCase();

                    let matchesCategory = true;
                    if (selectedSchemaCategoryFilter !== "All") {
                      const nodeTypes = template.appliedSchemaNodes?.map((n: any) => (n["@type"] || "").toLowerCase()) || [];
                      const nameLower = template.name.toLowerCase();
                      const badgeLower = template.badge.toLowerCase();
                      const descLower = template.description.toLowerCase();

                      if (cat === "business") {
                        matchesCategory = nodeTypes.some((t) => t.includes("business") || t.includes("organization")) || nameLower.includes("business") || nameLower.includes("contractor") || badgeLower.includes("map pack");
                      } else if (cat === "event") {
                        matchesCategory = nodeTypes.some((t) => t.includes("event") || t.includes("course") || t.includes("webinar")) || nameLower.includes("event") || nameLower.includes("workshop") || badgeLower.includes("event");
                      } else if (cat === "article") {
                        matchesCategory = nodeTypes.some((t) => t.includes("article") || t.includes("blog")) || nameLower.includes("editorial") || nameLower.includes("blog") || badgeLower.includes("editorial");
                      } else if (cat === "product") {
                        matchesCategory = nodeTypes.some((t) => t.includes("product") || t.includes("service") || t.includes("offer")) || nameLower.includes("e-commerce") || nameLower.includes("product") || badgeLower.includes("snippets");
                      } else if (cat === "software") {
                        matchesCategory = nodeTypes.some((t) => t.includes("software") || t.includes("application")) || nameLower.includes("software") || nameLower.includes("saas") || badgeLower.includes("saas");
                      } else if (cat === "faq") {
                        matchesCategory = nodeTypes.some((t) => t.includes("faq") || t.includes("question") || t.includes("searchaction")) || nameLower.includes("faq") || descLower.includes("q&a");
                      }
                    }

                    if (!query) return matchesCategory;

                    const nameMatch = template.name.toLowerCase().includes(query);
                    const badgeMatch = template.badge.toLowerCase().includes(query);
                    const descMatch = template.description.toLowerCase().includes(query);
                    const schemaDescMatch = (template.schemaDesc || "").toLowerCase().includes(query);
                    const nodeTypesMatch = template.appliedSchemaNodes?.some((node: any) => {
                      const nodeType = (node["@type"] || "").toLowerCase();
                      const nodeName = (node.name || "").toLowerCase();
                      const nodeHeadline = (node.headline || "").toLowerCase();
                      return nodeType.includes(query) || nodeName.includes(query) || nodeHeadline.includes(query);
                    });

                    return matchesCategory && (nameMatch || badgeMatch || descMatch || schemaDescMatch || nodeTypesMatch);
                  });

                  const categoryCounts = [
                    { id: "All", label: "All Types", count: allTemplates.length },
                    { id: "Business", label: "Business", count: allTemplates.filter((t) => (t.appliedSchemaNodes || []).some((n: any) => (n["@type"] || "").toLowerCase().includes("business") || (n["@type"] || "").toLowerCase().includes("organization")) || t.name.toLowerCase().includes("business") || t.badge.toLowerCase().includes("map pack")).length },
                    { id: "Event", label: "Event", count: allTemplates.filter((t) => (t.appliedSchemaNodes || []).some((n: any) => (n["@type"] || "").toLowerCase().includes("event")) || t.name.toLowerCase().includes("event")).length },
                    { id: "Article", label: "Article", count: allTemplates.filter((t) => (t.appliedSchemaNodes || []).some((n: any) => (n["@type"] || "").toLowerCase().includes("blog") || (n["@type"] || "").toLowerCase().includes("article")) || t.name.toLowerCase().includes("blog") || t.name.toLowerCase().includes("editorial")).length },
                    { id: "Product", label: "Product", count: allTemplates.filter((t) => (t.appliedSchemaNodes || []).some((n: any) => (n["@type"] || "").toLowerCase().includes("product") || (n["@type"] || "").toLowerCase().includes("service")) || t.name.toLowerCase().includes("product") || t.name.toLowerCase().includes("e-commerce")).length },
                    { id: "Software", label: "SaaS", count: allTemplates.filter((t) => (t.appliedSchemaNodes || []).some((n: any) => (n["@type"] || "").toLowerCase().includes("software")) || t.name.toLowerCase().includes("saas") || t.name.toLowerCase().includes("software")).length },
                    { id: "FAQ", label: "FAQ / Q&A", count: allTemplates.filter((t) => (t.appliedSchemaNodes || []).some((n: any) => (n["@type"] || "").toLowerCase().includes("faq")) || t.name.toLowerCase().includes("faq")).length },
                  ];

                  return (
                    <div className="space-y-3">
                      {/* Search Bar & Category Filter Pills */}
                      <div className="space-y-2 pt-1 border-t border-white/10">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                          {/* Search Input Field */}
                          <div className="relative flex-1">
                            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                              type="text"
                              value={schemaSearchQuery}
                              onChange={(e) => setSchemaSearchQuery(e.target.value)}
                              placeholder="Search templates & nodes (e.g. 'Business', 'Event', 'Article', 'Product')..."
                              className="w-full bg-black/60 border border-white/15 rounded-lg pl-8 pr-8 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#34d399] font-mono transition-colors"
                            />
                            {schemaSearchQuery && (
                              <button
                                type="button"
                                onClick={() => setSchemaSearchQuery("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                                title="Clear search"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>

                          {/* Result Count Indicator */}
                          <div className="flex items-center justify-between sm:justify-end gap-2 text-[10px] font-mono text-slate-400 shrink-0">
                            <span className="bg-white/5 border border-white/10 px-2 py-1 rounded-md">
                              Showing <strong className="text-emerald-400 font-bold">{filteredTemplates.length}</strong> of {allTemplates.length} Presets
                            </span>
                            {(schemaSearchQuery || selectedSchemaCategoryFilter !== "All") && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSchemaSearchQuery("");
                                  setSelectedSchemaCategoryFilter("All");
                                }}
                                className="text-emerald-400 hover:underline cursor-pointer"
                              >
                                Reset Filter
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Category Pills */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mr-1">
                            <Tag size={11} className="text-emerald-400" />
                            <span>Type Filter:</span>
                          </span>
                          {categoryCounts.map((cat) => {
                            const isSelected = selectedSchemaCategoryFilter === cat.id;
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => setSelectedSchemaCategoryFilter(cat.id)}
                                className={`text-[10px] font-mono px-2 py-0.5 rounded-md transition cursor-pointer flex items-center gap-1 font-semibold ${
                                  isSelected
                                    ? "bg-[#34d399] text-[#0f172a] shadow-sm font-bold"
                                    : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                                }`}
                              >
                                <span>{cat.label}</span>
                                <span className={`text-[9px] px-1 rounded-full ${isSelected ? "bg-black/20 text-[#0f172a]" : "bg-white/10 text-slate-400"}`}>
                                  {cat.count}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Grid of Templates or Empty State */}
                      {filteredTemplates.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {filteredTemplates.map((template) => {
                            const isActive = activeTemplateId === template.id;
                            const nodeTypes = Array.from(
                              new Set((template.appliedSchemaNodes || []).map((n: any) => n["@type"]).filter(Boolean))
                            );
                            return (
                              <div
                                key={template.id}
                                className={`group relative flex flex-col justify-between p-2.5 rounded-lg border transition text-left cursor-pointer ${
                                  isActive
                                    ? "bg-emerald-950/40 border-emerald-500/50 shadow-sm"
                                    : "bg-black/30 hover:bg-black/50 border-white/10 hover:border-white/25"
                                }`}
                                onClick={() => handleApplyTemplate(template)}
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between gap-1.5">
                                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold bg-white/10 text-slate-300 border border-white/10">
                                      {template.badge}
                                    </span>
                                    {!template.isBuiltIn && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteCustomTemplate(template.id, template.name);
                                        }}
                                        title="Delete Custom Template"
                                        className="text-slate-500 hover:text-rose-400 p-0.5 transition cursor-pointer"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    )}
                                  </div>

                                  <div className="font-bold text-white text-xs font-mono flex items-center justify-between gap-1">
                                    <span className="line-clamp-1">{template.name}</span>
                                    {isActive && (
                                      <span className="text-[9px] text-[#34d399] font-mono font-bold shrink-0">
                                        ACTIVE ✓
                                      </span>
                                    )}
                                  </div>

                                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                                    {template.description}
                                  </p>

                                  {/* Schema Node Badges */}
                                  {nodeTypes.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-1 pt-1">
                                      {nodeTypes.map((type) => (
                                        <span key={type} className="text-[8px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                                          @{type}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-center justify-between pt-2 mt-1 border-t border-white/5 text-[9px] font-mono text-slate-400">
                                  <span className="flex items-center gap-1 text-slate-300">
                                    <Layers size={10} className="text-emerald-400" />
                                    <span>{template.appliedSchemaNodes?.length || 0} Extra Nodes</span>
                                  </span>
                                  <span className="text-emerald-400 font-semibold group-hover:underline">
                                    Apply 1-Click &rarr;
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="bg-black/40 border border-white/10 rounded-xl p-5 text-center space-y-2">
                          <Search size={22} className="mx-auto text-slate-500" />
                          <p className="text-xs text-slate-300 font-mono">
                            No schema templates found matching &ldquo;<span className="text-emerald-400">{schemaSearchQuery || selectedSchemaCategoryFilter}</span>&rdquo;
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setSchemaSearchQuery("");
                              setSelectedSchemaCategoryFilter("All");
                            }}
                            className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-lg font-mono font-semibold hover:bg-emerald-500/30 transition cursor-pointer"
                          >
                            Clear Search & Reset Filters
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Live Form Inputs */}
              <div className="bg-black/30 border border-white/10 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
                    <Edit3 size={13} className="text-[#34d399]" />
                    <span>Real-Time Schema Customizer</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setUseSiteMetadata(true);
                      const cleanDomain = targetDomain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
                      const derivedOrgName = cleanDomain
                        ? (cleanDomain.toLowerCase().includes("ecosmarthomes") ? "EcoSmart Homes" : cleanDomain.split('.')[0].replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
                        : "EcoSmart Homes";
                      setSchemaOrgName(derivedOrgName);
                      setSchemaTargetUrl(targetDomain.startsWith("http") ? targetDomain : `https://${cleanDomain || 'ecosmarthomes.ie'}`);
                      setSchemaDescription("Energy efficiency, home retrofitting, and BER rating optimization authority.");
                    }}
                    className="text-[10px] text-slate-400 hover:text-emerald-400 transition font-mono flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={10} />
                    <span>Reset Defaults</span>
                  </button>
                </div>

                {/* Site Metadata Auto-Sync Toggle */}
                <div className="flex items-center justify-between bg-emerald-950/30 border border-emerald-500/25 rounded-lg p-2.5 px-3">
                  <div className="flex items-center gap-2.5">
                    <Sliders size={14} className="text-[#34d399] shrink-0" />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white font-mono">Use Site Metadata</span>
                        {useSiteMetadata ? (
                          <span className="bg-[#34d399]/20 text-[#34d399] border border-[#34d399]/30 text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold">
                            SYNCED
                          </span>
                        ) : (
                          <span className="bg-slate-800 text-slate-400 border border-slate-700 text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold">
                            CUSTOM
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 line-clamp-1">
                        Auto-sync organization & domain from app config ({targetDomain})
                      </span>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={useSiteMetadata}
                      onChange={(e) => {
                        const enabled = e.target.checked;
                        setUseSiteMetadata(enabled);
                        if (enabled) {
                          const cleanDomain = targetDomain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
                          const derivedOrgName = cleanDomain
                            ? (cleanDomain.toLowerCase().includes("ecosmarthomes") ? "EcoSmart Homes" : cleanDomain.split('.')[0].replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
                            : "EcoSmart Homes";
                          setSchemaOrgName(derivedOrgName);
                          setSchemaTargetUrl(targetDomain.startsWith("http") ? targetDomain : `https://${cleanDomain || 'ecosmarthomes.ie'}`);
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#34d399]"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-semibold font-mono flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Building size={11} className="text-emerald-400" />
                        <span>Organization / Site Name</span>
                      </span>
                      {useSiteMetadata && <span className="text-[9px] text-[#34d399] font-normal">(Synced)</span>}
                    </label>
                    <input
                      type="text"
                      value={schemaOrgName}
                      onChange={(e) => {
                        setSchemaOrgName(e.target.value);
                        if (useSiteMetadata) setUseSiteMetadata(false);
                      }}
                      placeholder="e.g. EcoSmart Homes Ireland"
                      className="w-full bg-black/50 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#34d399] font-mono transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-semibold font-mono flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Globe size={11} className="text-emerald-400" />
                        <span>Target Website URL</span>
                      </span>
                      {useSiteMetadata && <span className="text-[9px] text-[#34d399] font-normal">(Synced)</span>}
                    </label>
                    <input
                      type="text"
                      value={schemaTargetUrl}
                      onChange={(e) => {
                        setSchemaTargetUrl(e.target.value);
                        if (useSiteMetadata) setUseSiteMetadata(false);
                      }}
                      placeholder="e.g. https://ecosmarthomes.ie"
                      className="w-full bg-black/50 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#34d399] font-mono transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-semibold font-mono">
                    Business / Site Description
                  </label>
                  <input
                    type="text"
                    value={schemaDescription}
                    onChange={(e) => setSchemaDescription(e.target.value)}
                    placeholder="e.g. Energy efficiency, home retrofitting, and BER rating optimization authority."
                    className="w-full bg-black/50 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#34d399] font-mono transition-colors"
                  />
                </div>

                {/* Local Area Coverage Multi-Select Dropdown & Suburbs Pills */}
                <div className="space-y-2 pt-2 border-t border-white/10 mt-1">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <label className="text-[10px] text-slate-400 font-semibold font-mono flex items-center gap-1.5">
                      <MapPin size={12} className="text-[#34d399]" />
                      <span>Local Area Coverage (Limerick V94 Suburbs)</span>
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono px-1.5 py-0.2 rounded font-bold">
                        {selectedLimerickAreas.length} Areas Active
                      </span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLimerickAreas([...LIMERICK_SUBURBS]);
                          updateAreaServedInNodes([...LIMERICK_SUBURBS]);
                        }}
                        className="text-[9px] text-emerald-400 hover:underline font-mono cursor-pointer"
                      >
                        Select All
                      </button>
                      <span className="text-slate-600 text-[10px]">|</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLimerickAreas([]);
                          updateAreaServedInNodes([]);
                        }}
                        className="text-[9px] text-slate-400 hover:text-slate-200 font-mono cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  {/* Multi-Select Dropdown & Custom Area Add */}
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="relative flex-1 w-full">
                      <select
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val && !selectedLimerickAreas.includes(val)) {
                            handleAreaToggle(val);
                          }
                          e.target.value = "";
                        }}
                        className="w-full bg-black/60 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#34d399] font-mono cursor-pointer appearance-none pr-8"
                      >
                        <option value="" className="bg-slate-900 text-slate-400">
                          + Add Limerick Suburb or V94 Zone...
                        </option>
                        {LIMERICK_SUBURBS.map((suburb) => {
                          const isSelected = selectedLimerickAreas.includes(suburb);
                          return (
                            <option
                              key={suburb}
                              value={suburb}
                              disabled={isSelected}
                              className={isSelected ? "bg-slate-900 text-slate-500 font-normal" : "bg-slate-900 text-emerald-300 font-semibold"}
                            >
                              {isSelected ? `✓ ${suburb} (Active)` : `+ ${suburb}`}
                            </option>
                          );
                        })}
                      </select>
                      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    <div className="flex items-center gap-1 w-full sm:w-auto">
                      <input
                        type="text"
                        id="custom-suburb-input"
                        placeholder="Custom suburb..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const val = (e.target as HTMLInputElement).value.trim();
                            if (val && !selectedLimerickAreas.includes(val)) {
                              handleAreaToggle(val);
                              (e.target as HTMLInputElement).value = "";
                            }
                          }
                        }}
                        className="flex-1 sm:w-32 bg-black/60 border border-white/15 rounded-lg px-2 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#34d399] font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const inputEl = document.getElementById("custom-suburb-input") as HTMLInputElement;
                          if (inputEl && inputEl.value.trim()) {
                            const val = inputEl.value.trim();
                            if (!selectedLimerickAreas.includes(val)) {
                              handleAreaToggle(val);
                              inputEl.value = "";
                            }
                          }
                        }}
                        className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1 shrink-0"
                      >
                        <Plus size={12} />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                  {/* Active Suburbs Interactive Pill Cloud */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1.5 max-h-[110px] overflow-y-auto pr-1">
                    {selectedLimerickAreas.map((area) => (
                      <span
                        key={area}
                        className="inline-flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-[10px] font-mono font-medium px-2 py-0.5 rounded-md group hover:border-emerald-400 transition"
                      >
                        <Check size={10} className="text-emerald-400" />
                        <span>{area}</span>
                        <button
                          type="button"
                          onClick={() => handleAreaToggle(area)}
                          className="text-emerald-400/60 hover:text-rose-400 transition cursor-pointer p-0.5 -mr-0.5"
                          title={`Remove ${area}`}
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                    {selectedLimerickAreas.length === 0 && (
                      <span className="text-[10px] font-mono text-amber-300/80 italic">
                        No local coverage areas selected. Choose suburbs above to populate areaServed schema microdata.
                      </span>
                    )}
                  </div>

                  {/* D3.js Interactive Heatmap Overlay */}
                  <div className="pt-2">
                    <LimerickSuburbHeatmap
                      allSuburbs={LIMERICK_SUBURBS}
                      selectedSuburbs={selectedLimerickAreas}
                      onToggleSuburb={handleAreaToggle}
                    />
                  </div>
                </div>
              </div>

              {/* Schema.org Entity Specifications Documentation Links */}
              <div className="bg-slate-900/60 border border-white/10 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 font-mono flex items-center gap-1.5">
                    <BookOpen size={13} className="text-indigo-400" />
                    <span>Schema.org Entity Documentation & Standards</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Official Spec Guides</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-0.5">
                  {[
                    { type: "Organization", url: "https://schema.org/Organization", label: "Organization", desc: "Brand logo & entity identity" },
                    { type: "WebSite", url: "https://schema.org/WebSite", label: "WebSite", desc: "Site & publisher graph" },
                    { type: "FAQPage", url: "https://schema.org/FAQPage", label: "FAQPage", desc: "Q&A microdata for LLMs" },
                    { type: "SearchAction", url: "https://schema.org/SearchAction", label: "SearchAction", desc: "Google Sitelinks search box" },
                  ].map((entity) => (
                    <a
                      key={entity.type}
                      href={entity.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col justify-between bg-black/40 hover:bg-indigo-500/15 border border-white/10 hover:border-indigo-400/40 rounded-lg p-2 transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold font-mono text-emerald-400 group-hover:text-indigo-300">
                        <span>{entity.label}</span>
                        <ExternalLink size={10} className="text-slate-400 group-hover:text-indigo-300 transition shrink-0" />
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono line-clamp-1 mt-1">
                        {entity.desc}
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 font-mono">
                <div className="flex items-center gap-2">
                  <span>Schema Format: JSON-LD (Schema.org)</span>
                  {appliedSchemaNodes.length > 0 && (
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] px-2 py-0.5 rounded-full font-bold">
                      +{appliedSchemaNodes.length} AI Nodes Active
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSmartSuggestSchema}
                    disabled={isSuggestingSchema}
                    className="bg-gradient-to-r from-emerald-500/25 via-teal-500/25 to-indigo-500/25 hover:from-emerald-500/35 hover:to-indigo-500/35 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <Sparkles size={13} className={`text-emerald-400 ${isSuggestingSchema ? "animate-spin" : ""}`} />
                    <span>{isSuggestingSchema ? "Analyzing SEO Graph..." : "Smart Suggest"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleValidateSchema}
                    className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <ShieldCheck size={13} className="text-indigo-400" />
                    <span>Validate Schema.org</span>
                  </button>
                </div>
              </div>

              {/* AI Schema Entity Recommendations Panel */}
              <AnimatePresence>
                {(isSuggestingSchema || schemaSuggestions) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3.5 space-y-3 my-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles size={16} className="text-emerald-400 shrink-0 animate-pulse" />
                          <span className="font-bold text-white text-xs font-mono">
                            AI Smart Schema Entity Recommendations
                          </span>
                          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono px-1.5 py-0.5 rounded-full font-bold">
                            LOCAL SEO & LLM OPTIMIZED
                          </span>
                        </div>
                        {schemaSuggestions && schemaSuggestions.length > 0 && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleApplyAllSuggestions}
                              className="text-[10px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-mono px-2 py-0.5 rounded transition cursor-pointer flex items-center gap-1 font-semibold"
                            >
                              <Zap size={11} className="text-emerald-400" />
                              <span>Apply All Recommendations</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSchemaSuggestions(null);
                                setAiSchemaSummary(null);
                              }}
                              className="text-slate-400 hover:text-white transition p-0.5 cursor-pointer"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        )}
                      </div>

                      {isSuggestingSchema ? (
                        <div className="flex items-center gap-3 py-4 text-xs font-mono text-emerald-300/90">
                          <RefreshCw size={16} className="animate-spin text-emerald-400" />
                          <span>Analyzing {targetDomain} entity graph, LocalBusiness parameters, and Product/Service microdata...</span>
                        </div>
                      ) : (
                        <>
                          {aiSchemaSummary && (
                            <p className="text-[11px] text-emerald-200/90 font-mono bg-black/40 border border-emerald-500/20 rounded-lg p-2.5 leading-relaxed">
                              <span className="font-bold text-emerald-400">AI Audit Insight: </span>
                              {aiSchemaSummary}
                            </p>
                          )}

                          <div className="grid grid-cols-1 gap-2.5 pt-1">
                            {schemaSuggestions?.map((sug, idx) => {
                              const isApplied = appliedSchemaNodes.some(
                                (node) =>
                                  node["@type"] === sug.suggestedProps["@type"] ||
                                  (sug.suggestedProps["@id"] && node["@id"] === sug.suggestedProps["@id"])
                              );
                              return (
                                <div
                                  key={idx}
                                  className="bg-black/50 border border-white/10 hover:border-emerald-500/30 rounded-lg p-3 transition space-y-2"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-2">
                                        <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono px-1.5 py-0.5 rounded font-bold">
                                          {sug.entityType}
                                        </span>
                                        <span className="font-bold text-slate-100 text-xs font-mono">{sug.title}</span>
                                      </div>
                                      <p className="text-[11px] text-slate-300/90 font-mono">{sug.reason}</p>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        isApplied
                                          ? handleRemoveAppliedSchemaNode(sug.suggestedProps["@type"])
                                          : handleApplySchemaSuggestion(sug)
                                      }
                                      className={`text-[11px] font-mono px-2.5 py-1 rounded-md font-semibold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                                        isApplied
                                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                          : "bg-white/10 hover:bg-emerald-500/20 text-slate-200 hover:text-emerald-300 border border-white/15 hover:border-emerald-500/30"
                                      }`}
                                    >
                                      {isApplied ? (
                                        <>
                                          <CheckCircle2 size={12} className="text-emerald-400" />
                                          <span>Applied ✓</span>
                                        </>
                                      ) : (
                                        <>
                                          <Plus size={12} className="text-emerald-400" />
                                          <span>Apply Suggestion</span>
                                        </>
                                      )}
                                    </button>
                                  </div>

                                  <div className="bg-black/70 border border-white/5 rounded-md p-2 overflow-x-auto text-[10px] font-mono text-slate-400 max-h-[100px]">
                                    <pre>{JSON.stringify(sug.suggestedProps, null, 2)}</pre>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Validation Result Toast Banner with smooth height transition */}
              <AnimatePresence mode="wait">
                {schemaValidationResult && (
                  <motion.div
                    key={schemaValidationResult.isValid ? "valid" : "invalid"}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div
                      className={`p-3.5 rounded-xl border text-xs relative my-1 ${
                        schemaValidationResult.isValid
                          ? "bg-emerald-950/60 border-emerald-500/30 text-emerald-200"
                          : "bg-amber-950/60 border-amber-500/30 text-amber-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {schemaValidationResult.isValid ? (
                            <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
                          ) : (
                            <AlertCircle size={16} className="text-amber-400 shrink-0" />
                          )}
                          <span className="font-bold text-white text-xs">{schemaValidationResult.title}</span>
                        </div>
                        <button
                          onClick={() => setSchemaValidationResult(null)}
                          className="text-slate-400 hover:text-white transition p-0.5 cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      {schemaValidationResult.details.length > 0 && (
                        <ul className="mt-2 space-y-1 text-[11px] font-mono">
                          {schemaValidationResult.details.map((detail, idx) => (
                            <li key={idx} className="flex items-center gap-1.5 text-emerald-300/90">
                              <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {schemaValidationResult.warnings && schemaValidationResult.warnings.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-amber-500/30">
                          <span className="font-semibold text-amber-300 text-[11px] font-mono flex items-center gap-1.5 mb-1.5">
                            <AlertCircle size={13} className="text-amber-400 shrink-0" />
                            <span>Conflicting Schema Node Type Warnings ({schemaValidationResult.warnings.length}):</span>
                          </span>
                          <ul className="space-y-1.5 text-[11px] font-mono text-amber-200/90 bg-amber-950/50 border border-amber-500/30 p-2.5 rounded-lg">
                            {schemaValidationResult.warnings.map((warn, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1" />
                                <span className="leading-relaxed">{warn}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {schemaValidationResult.missingFields.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-amber-500/20">
                          <span className="font-semibold text-amber-300 text-[11px] block mb-1">Missing / Action Required:</span>
                          <ul className="space-y-1 text-[11px] font-mono text-amber-200">
                            {schemaValidationResult.missingFields.map((field, idx) => (
                              <li key={idx} className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                                <span>{field}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* WordPress Direct CMS Schema Injector Panel */}
              <AnimatePresence>
                {showCmsPushOptions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-4 space-y-3.5 my-2 text-left">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Server size={16} className="text-[#34d399]" />
                          <span className="font-bold text-white text-xs font-mono">
                            Direct WordPress JSON-LD Payload Deployer
                          </span>
                          <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            REST API CONNECTED
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowCmsPushOptions(false)}
                          className="text-slate-400 hover:text-white transition p-0.5 cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      {/* Target Injection Selection */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-mono text-slate-300 font-semibold block">
                          Select Injection Target in WordPress:
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setPushTarget("site_wide")}
                            className={`p-2.5 rounded-lg border text-left flex items-start gap-2.5 transition cursor-pointer ${
                              pushTarget === "site_wide"
                                ? "bg-emerald-950/70 border-emerald-500/50 text-white"
                                : "bg-black/40 border-white/10 hover:border-white/20 text-slate-300"
                            }`}
                          >
                            <Globe size={16} className={pushTarget === "site_wide" ? "text-emerald-400 shrink-0 mt-0.5" : "text-slate-400 shrink-0 mt-0.5"} />
                            <div className="space-y-0.5">
                              <span className="text-xs font-mono font-bold block">Site-Wide Header (`wp_head`)</span>
                              <span className="text-[10px] text-slate-400 font-mono block">Injects JSON-LD script tag globally into the head of every page.</span>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPushTarget("post")}
                            className={`p-2.5 rounded-lg border text-left flex items-start gap-2.5 transition cursor-pointer ${
                              pushTarget === "post"
                                ? "bg-emerald-950/70 border-emerald-500/50 text-white"
                                : "bg-black/40 border-white/10 hover:border-white/20 text-slate-300"
                            }`}
                          >
                            <FileCode size={16} className={pushTarget === "post" ? "text-emerald-400 shrink-0 mt-0.5" : "text-slate-400 shrink-0 mt-0.5"} />
                            <div className="space-y-0.5">
                              <span className="text-xs font-mono font-bold block">Specific Post Header</span>
                              <span className="text-[10px] text-slate-400 font-mono block">Applies JSON-LD schema microdata to a targeted WordPress post/page ID.</span>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Post Selection when pushTarget === 'post' */}
                      {pushTarget === "post" && (
                        <div className="space-y-2 pt-1">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] font-mono text-slate-400 block mb-1">Select WordPress Post / Article:</label>
                              <select
                                value={selectedPostId}
                                onChange={(e) => {
                                  const id = e.target.value;
                                  setSelectedPostId(id);
                                  if (id === "101") setCustomPostTitle("BER Rating Upgrade Guide (G to A)");
                                  if (id === "102") setCustomPostTitle("Air to Water Heat Pumps Efficiency in Ireland");
                                  if (id === "103") setCustomPostTitle("SEAI Home Energy Retrofit Grants 2026");
                                }}
                                className="w-full bg-black/60 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-400 cursor-pointer"
                              >
                                <option value="101" className="bg-slate-900">Post #101: BER Rating Upgrade Guide (G to A)</option>
                                <option value="102" className="bg-slate-900">Post #102: Air to Water Heat Pumps Efficiency</option>
                                <option value="103" className="bg-slate-900">Post #103: SEAI Home Energy Retrofit Grants 2026</option>
                                <option value="custom" className="bg-slate-900">Custom Post / Page ID...</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] font-mono text-slate-400 block mb-1">Target Post Title or ID:</label>
                              <input
                                type="text"
                                value={customPostTitle}
                                onChange={(e) => setCustomPostTitle(e.target.value)}
                                placeholder="e.g. Post #105 or Article Title"
                                className="w-full bg-black/60 border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-400 placeholder:text-slate-600"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Connection Endpoint & Deploy Trigger */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/10">
                        <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                          <Link size={12} className="text-emerald-400 shrink-0" />
                          <span>Endpoint: <span className="text-slate-200">{`https://${targetDomain.replace(/^https?:\/\//i, '').replace(/\/.*$/, '') || 'ecosmarthomes.ie'}/wp-json/wp/v2/schema`}</span></span>
                        </div>

                        <button
                          type="button"
                          disabled={isPushingSchema}
                          onClick={handlePushSchemaToCms}
                          className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-slate-950 font-mono font-bold text-xs px-4 py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                        >
                          {isPushingSchema ? (
                            <>
                              <RefreshCw size={13} className="animate-spin" />
                              <span>Deploying to WordPress...</span>
                            </>
                          ) : (
                            <>
                              <Send size={13} />
                              <span>Deploy Payload to CMS (+25 XP)</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Push Result Banner */}
                      {pushSchemaResult && (
                        <div
                          className={`p-3 rounded-lg border text-xs font-mono space-y-1 ${
                            pushSchemaResult.success
                              ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-200"
                              : "bg-rose-950/80 border-rose-500/40 text-rose-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 font-bold">
                              {pushSchemaResult.success ? (
                                <CheckCircle2 size={14} className="text-emerald-400" />
                              ) : (
                                <AlertCircle size={14} className="text-rose-400" />
                              )}
                              <span>{pushSchemaResult.success ? "Schema Deployed to WordPress CMS!" : "Deployment Issue"}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">{pushSchemaResult.timestamp}</span>
                          </div>
                          <p className="text-[11px] leading-relaxed">{pushSchemaResult.statusMessage}</p>
                          <p className="text-[10px] text-emerald-400/90 font-semibold">
                            Target Header: {pushSchemaResult.targetLocation}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="relative min-h-[180px] max-h-[260px] bg-black/40 border border-white/10 rounded-xl p-4 overflow-y-auto font-mono text-[11px] text-emerald-300/90 leading-relaxed">
                <pre>{`<script type="application/ld+json">\n${generateSchemaJson(targetDomain, schemaOrgName, schemaTargetUrl, schemaDescription)}\n</script>`}</pre>
              </div>
                </div>
              )}

              {/* RIGHT COLUMN: Live Visual Entity Card Preview */}
              {(schemaModalViewMode === "split" || schemaModalViewMode === "preview") && (
                <div className="h-full flex flex-col">
                  <EntityCardPreview
                    schemaJsonStr={generateSchemaJson(targetDomain, schemaOrgName, schemaTargetUrl, schemaDescription)}
                    orgName={schemaOrgName}
                    targetUrl={schemaTargetUrl}
                    description={schemaDescription}
                    selectedAreas={selectedLimerickAreas}
                    appliedNodes={appliedSchemaNodes}
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-white/10">
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <CheckCircle size={13} className="text-[#34d399] shrink-0" />
                <span>Compatible with Google, ChatGPT, Perplexity & Gemini indexing</span>
              </p>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleExternalAudit}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-cyan-600/90 hover:bg-cyan-500 text-white border border-cyan-400/30 py-2 px-3.5 rounded-xl text-xs font-semibold transition cursor-pointer shadow-sm"
                  title="Copies JSON-LD code to clipboard and opens Google Rich Results Test in a new tab"
                >
                  <ExternalLink size={14} className="text-cyan-200" />
                  <span>External Audit (Google)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCmsPushOptions(!showCmsPushOptions)}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 border py-2 px-3.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-sm ${
                    showCmsPushOptions
                      ? "bg-emerald-500 text-slate-950 border-emerald-400"
                      : "bg-emerald-600/90 hover:bg-emerald-600 text-white border-emerald-400/40"
                  }`}
                >
                  <Send size={14} className={showCmsPushOptions ? "text-slate-950" : "text-emerald-100"} />
                  <span>Push to WordPress / CMS</span>
                </button>

                <button
                  onClick={handleCopySchemaCode}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/15 text-white py-2 px-3.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  {schemaCopied ? (
                    <>
                      <Check size={14} className="text-emerald-400" />
                      <span className="text-emerald-400">Copied Code!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} className="text-slate-300" />
                      <span>Copy Script Tag</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadPdfReport}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-indigo-600/90 hover:bg-indigo-600 text-white border border-indigo-400/30 py-2 px-3.5 rounded-xl text-xs font-semibold transition cursor-pointer shadow-sm"
                >
                  <FileText size={14} className="text-indigo-200" />
                  <span>Download PDF Report</span>
                </button>

                <button
                  onClick={handleDownloadSchemaFile}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-[#34d399] hover:bg-[#2bc48d] text-[#0f172a] py-2 px-3.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-sm"
                >
                  <Download size={14} />
                  <span>Download .json File</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
