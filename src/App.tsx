import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MainDashboard from './components/MainDashboard';
import { CrawlerDashboard } from './components/CrawlerDashboard';
import AIWriterTab from './components/AIWriterTab';
import ContentIdeasTab from './components/ContentIdeasTab';
import LinkBuilderTab from './components/LinkBuilderTab';
import ContentLibraryTab from './components/ContentLibraryTab';
import ContentAuditTab from './components/ContentAuditTab';
import ContentMap from './pages/ContentMap';
import KeywordResearchTab from './components/KeywordResearchTab';
import SERPAnalyzerTab from './components/SERPAnalyzerTab';
import SiteAuditTab from './components/SiteAuditTab';
import EnergyEstimatorTab from './components/EnergyEstimatorTab';
import AIVisibilityCard from './components/AIVisibilityCard';
import RankingStabilityMap from './components/RankingStabilityMap';
import Overview from './dashboard/Overview';
import Backlinks from './dashboard/Backlinks';
import Competitors from './dashboard/Competitors';
import Heatmap from './dashboard/Heatmap';
import MARL from './dashboard/MARL';
import Autonomy from './dashboard/Autonomy';
import Fusion from './dashboard/Fusion';
import Growth from './dashboard/Growth';
import Strategy from './dashboard/Strategy';
import Simulation from './dashboard/Simulation';
import Negotiation from './dashboard/Negotiation';
import Budget from './dashboard/Budget';
import Watchdog from './dashboard/Watchdog';
import Landing from './dashboard/Landing';
import Ecosystem from './dashboard/Ecosystem';
import Evolution from './dashboard/Evolution';
import Content from './dashboard/Content';
import Conflict from './dashboard/Conflict';
import GrantIntelligence from './dashboard/GrantIntelligence';
import GrantPdfAnalytics from './dashboard/GrantPdfAnalytics';
import AdvisorDashboard from './dashboard/AdvisorDashboard';
import HomeownerAnalytics from './dashboard/HomeownerAnalytics';
import RetrofitAnalytics from './dashboard/RetrofitAnalytics';
import ContractorDashboard from './dashboard/ContractorDashboard';
import RetrofitPdfAnalytics from './dashboard/RetrofitPdfAnalytics';
import GrantSubmissionsDashboard from './dashboard/GrantSubmissionsDashboard';
import PostInstallDashboard from './dashboard/PostInstallDashboard';
import JourneyDashboard from './dashboard/JourneyDashboard';
import ContractorQualityDashboard from './dashboard/ContractorQualityDashboard';
import ContractorScoreInsightsDashboard from './dashboard/ContractorScoreInsightsDashboard';
import HomeUpgradeInsightsDashboard from './dashboard/HomeUpgradeInsightsDashboard';
import NationalInsightsDashboard from './dashboard/NationalInsightsDashboard';
import RetrofitForecastDashboard from './dashboard/RetrofitForecastDashboard';
import AdvisorSessionsDashboard from './dashboard/AdvisorSessionsDashboard';
import SentimentIntelligenceDashboard from './dashboard/SentimentIntelligenceDashboard';
import CoachIntelligenceDashboard from './dashboard/CoachIntelligenceDashboard';
import OrchestratorConsole from './dashboard/OrchestratorConsole';
import HomeownerGrantFlow from './pages/HomeownerGrantFlow';
import HomeownerPortal from './portal/HomeownerPortal';
import { INITIAL_DASHBOARD_DATA } from './data';
import { ArticleDraft, DashboardState } from './types';
import { useDashboardStore } from './store/useDashboardStore';
import LiveVersion from './components/LiveVersion';
import { checkDeploymentDrift } from './utils/deploymentCheck';

export default function App() {
  const routeToTab: Record<string, string> = {
    '/dashboard': 'dashboard',
    '#/dashboard': 'dashboard',
    '/intelligence-console': 'dashboard',
    '#/intelligence-console': 'dashboard',
    '/backlink-ai-engine': 'dashboard',
    '#/backlink-ai-engine': 'dashboard',
    '/grant-planner': 'p23_grants',
    '#/grant-planner': 'p23_grants',
    '/contractor-engine': 'p28_contractors',
    '#/contractor-engine': 'p28_contractors',
    '/advisor': 'p25_advisor',
    '#/advisor': 'p25_advisor',
    '/coach': 'p39_coach',
    '#/coach': 'p39_coach',
    '/marl': 'p7_marl',
    '#/marl': 'p7_marl',
    '/forecasting': 'p36_forecasting',
    '#/forecasting': 'p36_forecasting',
    '/national-insights': 'p35_national',
    '#/national-insights': 'p35_national',
    '/journey': 'p32_journey',
    '#/journey': 'p32_journey',
    '/post-install': 'p31_postinstall',
    '#/post-install': 'p31_postinstall',
    '/harbor-sync': 'dashboard',
    '#/harbor-sync': 'dashboard',
    '/live': 'dashboard',
    '#/live': 'dashboard',
    '/': 'dashboard',
    '': 'dashboard',
  };

  const isGrantRoute =
    typeof window !== 'undefined' &&
    (window.location.pathname.startsWith('/grants') ||
      window.location.hash === '#/grant-planner');
  const isPortalRoute =
    typeof window !== 'undefined' &&
    (window.location.pathname.startsWith('/portal') ||
      window.location.hash === '#/portal');

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [dashboardState, setDashboardState] = useState<DashboardState>(
    INITIAL_DASHBOARD_DATA,
  );
  const [writerSuggestion, setWriterSuggestion] = useState<string>(
    'Raising BER rating from G to A: Step-by-Step Retrofit Sequence',
  );

  const [currentSerp, setCurrentSerp] = useState<any | null>(null);
  const [discoveryCount, setDiscoveryCount] = useState<number>(1);
  const [isSiteScanned, setIsSiteScanned] = useState<boolean>(false);

  const isCMSConnected =
    dashboardState.tasks.find((t) => t.id === 'connect_cms')?.completed ||
    false;

  const handleXPUnlock = (amount: number) => {
    setDashboardState((prev) => ({
      ...prev,
      xp: {
        ...prev.xp,
        current: prev.xp.current + amount,
      },
    }));
  };

  const handleOpenInWriter = (topic: string) => {
    setWriterSuggestion(topic);
    setActiveTab('writer');
  };

  const handleQuickAction = (actionId: string) => {
    if (actionId === 'writer' || actionId === 'write_article') {
      setActiveTab('writer');
    } else if (actionId === 'crawler') {
      setActiveTab('crawler');
    } else if (actionId === 'discover_ideas' || actionId === 'content_ideas') {
      setActiveTab('content_ideas');
    } else if (actionId === 'link_builder') {
      setActiveTab('link_builder');
    } else if (actionId === 'keywords') {
      setActiveTab('keywords');
    } else if (actionId === 'site_scan' || actionId === 'audit') {
      setActiveTab('audit');
    }
  };

  const handleToggleTask = (taskId: string) => {
    setDashboardState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !t.completed } : t,
      ),
    }));
  };

  const handleUpdateDraft = (updatedDraft: ArticleDraft) => {
    setDashboardState((prev) => ({
      ...prev,
      drafts: (prev.drafts || []).map((d) =>
        d.id === updatedDraft.id ? updatedDraft : d,
      ),
    }));
  };

  useEffect(() => {
    checkDeploymentDrift();
    if (typeof window === 'undefined') return;

    const syncActiveTabFromHash = () => {
      const hashPath = window.location.hash.startsWith('#/')
        ? window.location.hash.slice(1)
        : window.location.pathname;
      const matchedTab = routeToTab[hashPath];
      setActiveTab(matchedTab ?? 'dashboard');
    };

    syncActiveTabFromHash();
    window.addEventListener('hashchange', syncActiveTabFromHash);
    window.addEventListener('popstate', syncActiveTabFromHash);

    return () => {
      window.removeEventListener('hashchange', syncActiveTabFromHash);
      window.removeEventListener('popstate', syncActiveTabFromHash);
    };
  }, []);

  if (isGrantRoute) {
    return <HomeownerGrantFlow />;
  }

  if (isPortalRoute) {
    return <HomeownerPortal />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <MainDashboard
            state={dashboardState}
            onConnectCMS={() => handleToggleTask('connect_cms')}
            onOpenInWriter={handleOpenInWriter}
            onAddSupportPage={() => setActiveTab('content_ideas')}
            onUpgradeLimit={() => {}}
            onToggleTask={handleToggleTask}
            onRetryScan={() => setActiveTab('audit')}
            onOptimizeAIVisibility={() => setActiveTab('writer')}
            onQuickAction={handleQuickAction}
          />
        );

      case 'p7_overview':
        return <Overview />;

      case 'p7_backlinks':
        return <Backlinks />;

      case 'p7_competitors':
        return <Competitors />;

      case 'p7_heatmap':
        return <Heatmap />;

      case 'p7_marl':
        return <MARL />;

      case 'p9_autonomy':
        return <Autonomy />;

      case 'p11_fusion':
        return <Fusion />;

      case 'p12_growth':
        return <Growth />;

      case 'p13_strategy':
        return <Strategy />;

      case 'p14_simulation':
        return <Simulation />;

      case 'p15_negotiation':
        return <Negotiation />;

      case 'p16_budget':
        return <Budget />;

      case 'p17_watchdog':
        return <Watchdog />;

      case 'p18_landing':
        return <Landing />;

      case 'p19_ecosystem':
        return <Ecosystem />;

      case 'p20_evolution':
        return <Evolution />;

      case 'p21_content':
        return <Content />;

      case 'p22_conflict':
        return <Conflict />;

      case 'p23_grants':
        return <GrantIntelligence view="funnel" />;

      case 'p23_grants_logs':
        return <GrantIntelligence view="logs" />;

      case 'p23_grants_insights':
        return <GrantIntelligence view="insights" />;

      case 'p24_pdf':
        return <GrantPdfAnalytics />;

      case 'p25_advisor':
        return <AdvisorDashboard view="overview" />;

      case 'p25_advisor_bookings':
        return <AdvisorDashboard view="bookings" />;

      case 'p25_advisor_calendar':
        return <AdvisorDashboard view="calendar" />;

      case 'p26_homeowners':
      case 'p26_homeowners_logs':
      case 'p26_homeowners_insights':
        return <HomeownerAnalytics />;

      case 'p27_retrofit':
      case 'p27_retrofit_plans':
      case 'p27_retrofit_insights':
        return <RetrofitAnalytics />;

      case 'p28_contractors':
        return <ContractorDashboard view="contractors" />;

      case 'p28_jobs':
        return <ContractorDashboard view="jobs" />;

      case 'p28_jobs_calendar':
        return <ContractorDashboard view="calendar" />;

      case 'p29_pdf':
        return <RetrofitPdfAnalytics />;

      case 'p30_submissions':
      case 'p30_submissions_logs':
      case 'p30_submissions_insights':
        return <GrantSubmissionsDashboard />;

      case 'p31_postinstall':
        return <PostInstallDashboard initialSubView="overview" />;
      case 'p31_ber':
        return <PostInstallDashboard initialSubView="ber" />;
      case 'p31_seai':
        return <PostInstallDashboard initialSubView="seai" />;
      case 'p31_payments':
        return <PostInstallDashboard initialSubView="payments" />;

      case 'p32_journey':
        return <JourneyDashboard />;

      case 'p33_contractor_scores':
        return <ContractorQualityDashboard />;

      case 'p33_contractor_insights':
        return <ContractorScoreInsightsDashboard />;

      case 'p34_upgrades':
        return <HomeUpgradeInsightsDashboard />;

      case 'p35_national':
        return <NationalInsightsDashboard />;

      case 'p36_forecasting':
        return <RetrofitForecastDashboard />;

      case 'p37_advisor':
        return <AdvisorSessionsDashboard />;

      case 'p38_sentiment':
        return <SentimentIntelligenceDashboard />;

      case 'p39_coach':
        return <CoachIntelligenceDashboard />;

      case 'p40_orchestrator':
        return <OrchestratorConsole />;

      case 'ranking_map':
        return <RankingStabilityMap />;

      case 'crawler':
        return <CrawlerDashboard />;

      case 'writer':
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
                drafts: [newDraft, ...(prev.drafts || [])],
              }));
              handleXPUnlock(30);
            }}
          />
        );

      case 'content_ideas':
        return (
          <ContentIdeasTab
            site={dashboardState.site}
            onOpenInWriter={handleOpenInWriter}
          />
        );

      case 'link_builder':
        return (
          <LinkBuilderTab
            site={dashboardState.site}
            onOpenInWriter={handleOpenInWriter}
            onXPUnlock={handleXPUnlock}
          />
        );

      case 'library':
        return (
          <ContentLibraryTab
            site={dashboardState.site}
            drafts={dashboardState.drafts || []}
            onOpenInWriter={handleOpenInWriter}
          />
        );

      case 'content_audit':
        return (
          <ContentAuditTab
            drafts={dashboardState.drafts || []}
            onUpdateDraft={handleUpdateDraft}
            onXPUnlock={handleXPUnlock}
            onNavigateToTab={(tab: string) => setActiveTab(tab)}
          />
        );

      case 'content_map':
        return <ContentMap />;

      case 'keywords':
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

      case 'serp':
        return (
          <SERPAnalyzerTab
            currentSerp={currentSerp}
            onSerpAnalyzed={(serp: any) => setCurrentSerp(serp)}
            onXPUnlock={handleXPUnlock}
            onSendToWriter={(
              outline: string[],
              title: string,
              topic: string,
            ) => {
              handleOpenInWriter(`${title}: ${topic}`);
            }}
          />
        );

      case 'audit':
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

      case 'estimator':
        return <EnergyEstimatorTab />;

      case 'visibility':
        return (
          <div className="p-8 text-left max-w-4xl">
            <h1 className="text-3xl font-bold text-white mb-6">
              AI Answer & LLM Citation Visibility
            </h1>
            <AIVisibilityCard
              visits={dashboardState.ai_visibility.visits_last_30_days}
              onOptimizeClick={() => setActiveTab('writer')}
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

      {/* Live Version Fingerprint Badge */}
      <LiveVersion />
    </div>
  );
}
