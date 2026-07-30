import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import MainDashboard from "./components/MainDashboard";
import { CrawlerDashboard } from "./components/CrawlerDashboard";
import AIWriterTab from "./components/AIWriterTab";
import ContentIdeasTab from "./components/ContentIdeasTab";
import LinkBuilderTab from "./components/LinkBuilderTab";
import ContentLibraryTab from "./components/ContentLibraryTab";
import ContentAuditTab from "./components/ContentAuditTab";
import ContentMap from "./pages/ContentMap";
import KeywordResearchTab from "./components/KeywordResearchTab";
import SERPAnalyzerTab from "./components/SERPAnalyzerTab";
import SiteAuditTab from "./components/SiteAuditTab";
import EnergyEstimatorTab from "./components/EnergyEstimatorTab";
import AIVisibilityCard from "./components/AIVisibilityCard";
import RankingStabilityMap from "./components/RankingStabilityMap";
import { INITIAL_DASHBOARD_DATA } from "./data";
import { ArticleDraft, DashboardState } from "./types";
import { useDashboardStore } from "./store/useDashboardStore";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [dashboardState, setDashboardState] = useState<DashboardState>(INITIAL_DASHBOARD_DATA);
  const [writerSuggestion, setWriterSuggestion] = useState<string>("Raising BER rating from G to A: Step-by-Step Retrofit Sequence");
  const [currentSerp, setCurrentSerp] = useState<any | null>(null);
  const [discoveryCount, setDiscoveryCount] = useState<number>(1);
  const [isSiteScanned, setIsSiteScanned] = useState<boolean>(false);

  const isCMSConnected = dashboardState.tasks.find((t) => t.id === "connect_cms")?.completed || false;

  const handleXPUnlock = (amount: number) => {
    setDashboardState((prev) => ({
      ...prev,
      xp: {
        ...prev.xp,
        current: prev.xp.current + amount
      }
    }));
  };

  const handleOpenInWriter = (topic: string) => {
    setWriterSuggestion(topic);
    setActiveTab("writer");
  };

  const handleQuickAction = (actionId: string) => {
    if (actionId === "writer" || actionId === "write_article") {
      setActiveTab("writer");
    } else if (actionId === "crawler") {
      setActiveTab("crawler");
    } else if (actionId === "discover_ideas" || actionId === "content_ideas") {
      setActiveTab("content_ideas");
    } else if (actionId === "link_builder") {
      setActiveTab("link_builder");
    } else if (actionId === "keywords") {
      setActiveTab("keywords");
    } else if (actionId === "site_scan" || actionId === "audit") {
      setActiveTab("audit");
    }
  };

  const handleToggleTask = (taskId: string) => {
    setDashboardState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      )
    }));
  };

  const handleUpdateDraft = (updatedDraft: ArticleDraft) => {
    setDashboardState((prev) => ({
      ...prev,
      drafts: (prev.drafts || []).map((d) => (d.id === updatedDraft.id ? updatedDraft : d))
    }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <MainDashboard
            state={dashboardState}
            onConnectCMS={() => handleToggleTask("connect_cms")}
            onOpenInWriter={handleOpenInWriter}
            onAddSupportPage={() => setActiveTab("content_ideas")}
            onUpgradeLimit={() => {}}
            onToggleTask={handleToggleTask}
            onRetryScan={() => setActiveTab("audit")}
            onOptimizeAIVisibility={() => setActiveTab("writer")}
            onQuickAction={handleQuickAction}
          />
        );

      case "ranking_map":
        return <RankingStabilityMap />;

      case "crawler":
        return <CrawlerDashboard />;

      case "writer":
        return (
          <AIWriterTab
            site={dashboardState.site}
            isCMSConnected={isCMSConnected}
            onXPUnlock={handleXPUnlock}
            articlesUsed={(dashboardState.drafts || []).length}
            articlesLimit={10}
            aiSuggestion={writerSuggestion}
            drafts={dashboardState.drafts || []}
            onUpdateDraft={handleUpdateDraft}
            onDraftSuccess={(newDraft: ArticleDraft) => {
              setDashboardState((prev) => ({
                ...prev,
                drafts: [newDraft, ...(prev.drafts || [])]
              }));
              handleXPUnlock(30);
            }}
          />
        );

      case "content_ideas":
        return <ContentIdeasTab site={dashboardState.site} onOpenInWriter={handleOpenInWriter} />;

      case "link_builder":
        return <LinkBuilderTab site={dashboardState.site} onOpenInWriter={handleOpenInWriter} onXPUnlock={handleXPUnlock} />;

      case "library":
        return <ContentLibraryTab site={dashboardState.site} drafts={dashboardState.drafts || []} onOpenInWriter={handleOpenInWriter} />;

      case "content_audit":
        return (
          <ContentAuditTab
            drafts={dashboardState.drafts || []}
            onUpdateDraft={handleUpdateDraft}
            onXPUnlock={handleXPUnlock}
            onNavigateToTab={(tab: string) => setActiveTab(tab)}
          />
        );

      case "content_map":
        return <ContentMap />;

      case "keywords":
        return (
          <KeywordResearchTab
            site={dashboardState.site}
            discoveryCount={discoveryCount}
            onSessionComplete={() => {
              setDiscoveryCount((prev) => prev + 1);
              handleXPUnlock(20);
            }}
          />
        );

      case "serp":
        return (
          <SERPAnalyzerTab
            currentSerp={currentSerp}
            onSerpAnalyzed={(serp: any) => setCurrentSerp(serp)}
            onXPUnlock={handleXPUnlock}
            onSendToWriter={(outline: string[], title: string, topic: string) => {
              handleOpenInWriter(`${title}: ${topic}`);
            }}
          />
        );

      case "audit":
        return (
          <SiteAuditTab
            site={dashboardState.site}
            isScanned={isSiteScanned}
            onScanSuccess={() => {
              setIsSiteScanned(true);
              handleXPUnlock(15);
            }}
          />
        );

      case "estimator":
        return <EnergyEstimatorTab />;

      case "visibility":
        return (
          <div className="p-8 text-left max-w-4xl">
            <h1 className="text-3xl font-bold text-white mb-6">AI Answer & LLM Citation Visibility</h1>
            <AIVisibilityCard
              visits={dashboardState.ai_visibility.visits_last_30_days}
              onOptimizeClick={() => setActiveTab("writer")}
            />
          </div>
        );

      default:
        return <CrawlerDashboard />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Persistent Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        site={dashboardState.site}
      />

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Bar */}
        <Header
          streak={dashboardState.xp.streak_days}
          level={dashboardState.xp.level}
          onNavigateToTab={(tab) => setActiveTab(tab)}
        />

        {/* Dynamic Tab Body */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}
