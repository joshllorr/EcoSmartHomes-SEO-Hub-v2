import React, { useEffect, useState, Suspense, lazy } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MainDashboard from './components/MainDashboard';
import TabLoadingSkeleton from './components/TabLoadingSkeleton';
import ErrorBoundary from './components/ErrorBoundary';
import { INITIAL_DASHBOARD_DATA } from './data';
import { ArticleDraft, DashboardState } from './types';
import { useDashboardStore } from './store/useDashboardStore';
import LiveVersion from './components/LiveVersion';
import { checkDeploymentDrift } from './utils/deploymentCheck';
import { useDashboardShortcuts } from './hooks/useDashboardShortcuts';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import SettingsModal from './components/SettingsModal';
import { Command } from 'lucide-react';

// Code-split / Lazy-loaded Secondary Dashboards & Sub-tabs
const CrawlerDashboard = lazy(() =>
  import('./components/CrawlerDashboard').then((m) => ({
    default: m.CrawlerDashboard,
  })),
);
const AIWriterTab = lazy(() => import('./components/AIWriterTab'));
const ContentIdeasTab = lazy(() => import('./components/ContentIdeasTab'));
const LinkBuilderTab = lazy(() => import('./components/LinkBuilderTab'));
const ContentLibraryTab = lazy(() => import('./components/ContentLibraryTab'));
const ContentAuditTab = lazy(() => import('./components/ContentAuditTab'));
const ContentMap = lazy(() => import('./pages/ContentMap'));
const KeywordResearchTab = lazy(() => import('./components/KeywordResearchTab'));
const SERPAnalyzerTab = lazy(() => import('./components/SERPAnalyzerTab'));
const SiteAuditTab = lazy(() => import('./components/SiteAuditTab'));
const EnergyEstimatorTab = lazy(() => import('./components/EnergyEstimatorTab'));
import AIVisibilityCard from './components/AIVisibilityCard';
import RankingStabilityMap from './components/RankingStabilityMap';

const Overview = lazy(() => import('./dashboard/Overview'));
const Backlinks = lazy(() => import('./dashboard/Backlinks'));
const Competitors = lazy(() => import('./dashboard/Competitors'));
const Heatmap = lazy(() => import('./dashboard/Heatmap'));
const MARL = lazy(() => import('./dashboard/MARL'));
const Autonomy = lazy(() => import('./dashboard/Autonomy'));
const Fusion = lazy(() => import('./dashboard/Fusion'));
const Growth = lazy(() => import('./dashboard/Growth'));
const Strategy = lazy(() => import('./dashboard/Strategy'));
const Simulation = lazy(() => import('./dashboard/Simulation'));
const Negotiation = lazy(() => import('./dashboard/Negotiation'));
const Budget = lazy(() => import('./dashboard/Budget'));
const Watchdog = lazy(() => import('./dashboard/Watchdog'));
const Landing = lazy(() => import('./dashboard/Landing'));
const Ecosystem = lazy(() => import('./dashboard/Ecosystem'));
const Evolution = lazy(() => import('./dashboard/Evolution'));
const Content = lazy(() => import('./dashboard/Content'));
const Conflict = lazy(() => import('./dashboard/Conflict'));
const GrantIntelligence = lazy(() => import('./dashboard/GrantIntelligence'));
const GrantPdfAnalytics = lazy(() => import('./dashboard/GrantPdfAnalytics'));
const AdvisorDashboard = lazy(() => import('./dashboard/AdvisorDashboard'));
const HomeownerAnalytics = lazy(() => import('./dashboard/HomeownerAnalytics'));
const RetrofitAnalytics = lazy(() => import('./dashboard/RetrofitAnalytics'));
const ContractorDashboard = lazy(() => import('./dashboard/ContractorDashboard'));
const RetrofitPdfAnalytics = lazy(() => import('./dashboard/RetrofitPdfAnalytics'));
const GrantSubmissionsDashboard = lazy(() => import('./dashboard/GrantSubmissionsDashboard'));
const PostInstallDashboard = lazy(() => import('./dashboard/PostInstallDashboard'));
const JourneyDashboard = lazy(() => import('./dashboard/JourneyDashboard'));
const ContractorQualityDashboard = lazy(() => import('./dashboard/ContractorQualityDashboard'));
const ContractorScoreInsightsDashboard = lazy(() => import('./dashboard/ContractorScoreInsightsDashboard'));
const HomeUpgradeInsightsDashboard = lazy(() => import('./dashboard/HomeUpgradeInsightsDashboard'));
const NationalInsightsDashboard = lazy(() => import('./dashboard/NationalInsightsDashboard'));
const RetrofitForecastDashboard = lazy(() => import('./dashboard/RetrofitForecastDashboard'));
const AdvisorSessionsDashboard = lazy(() => import('./dashboard/AdvisorSessionsDashboard'));
const SentimentIntelligenceDashboard = lazy(() => import('./dashboard/SentimentIntelligenceDashboard'));
const CoachIntelligenceDashboard = lazy(() => import('./dashboard/CoachIntelligenceDashboard'));
const OrchestratorConsole = lazy(() => import('./dashboard/OrchestratorConsole'));
const HomeownerGrantFlow = lazy(() => import('./pages/HomeownerGrantFlow'));
const HomeownerPortal = lazy(() => import('./portal/HomeownerPortal'));

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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const {
    isShortcutsModalOpen,
    setIsShortcutsModalOpen,
    toastMessage,
    dismissToast,
  } = useDashboardShortcuts({
    activeTab,
    setActiveTab,
  });

  const [dashboardState, setDashboardState] = useState<DashboardState>(
    INITIAL_DASHBOARD_DATA,
  );
  const [writerSuggestion, setWriterSuggestion] = useState<string>(
    'Raising BER rating from G to A: Step-by-Step Retrofit Sequence',
  );

  const [currentSerp, setCurrentSerp] = useState<any | null>(null);
  const [serpKeyword, setSerpKeyword] = useState<string>('SEAI grants Limerick V94');
  const [discoveryCount, setDiscoveryCount] = useState<number>(1);
  const [isSiteScanned, setIsSiteScanned] = useState<boolean>(false);

  const handleNavigateToSERP = (keyword: string) => {
    if (keyword && keyword.trim()) {
      setSerpKeyword(keyword.trim());
    }
    setActiveTab('serp');
  };

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
    } else if (actionId === 'site_scan') {
      handleSiteHealthScan();
      setActiveTab('audit');
    } else if (actionId === 'audit') {
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

  const handleSiteHealthScan = async (sitemapPath?: string) => {
    const pathToScan = sitemapPath || '/sitemap.xml';
    try {
      const res = await fetch('/api/seo/sitemap-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: dashboardState.site || 'ecosmarthomes.ie',
          customSitemapPath: pathToScan,
        }),
      });
      const data = await res.json();
      if (data.status === 'success' || data.success) {
        setDashboardState((prev) => ({
          ...prev,
          site_health: {
            status: 'success',
            error: null,
            last_scanned: data.last_scanned || new Date().toISOString(),
          },
          tasks: prev.tasks.map((t) =>
            t.id === 'site_scan' ? { ...t, completed: true } : t,
          ),
        }));
        setIsSiteScanned(true);
        handleXPUnlock(15);
      } else {
        setDashboardState((prev) => ({
          ...prev,
          site_health: {
            status: 'failed',
            error: data.error || 'No sitemap found',
            last_scanned: new Date().toISOString(),
          },
        }));
      }
    } catch {
      // Local fallback for offline/preview
      setDashboardState((prev) => ({
        ...prev,
        site_health: {
          status: 'success',
          error: null,
          last_scanned: new Date().toISOString(),
        },
        tasks: prev.tasks.map((t) =>
          t.id === 'site_scan' ? { ...t, completed: true } : t,
        ),
      }));
      setIsSiteScanned(true);
      handleXPUnlock(15);
    }
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
    return (
      <Suspense fallback={<TabLoadingSkeleton title="Loading SEAI Grant Flow..." />}>
        <HomeownerGrantFlow />
      </Suspense>
    );
  }

  if (isPortalRoute) {
    return (
      <Suspense fallback={<TabLoadingSkeleton title="Loading Homeowner Portal..." />}>
        <HomeownerPortal />
      </Suspense>
    );
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
            onRetryScan={handleSiteHealthScan}
            onOptimizeAIVisibility={() => setActiveTab('writer')}
            onQuickAction={handleQuickAction}
            onNavigateToSERP={handleNavigateToSERP}
            onUpdateDraft={handleUpdateDraft}
            onUpdateDrafts={(updatedDrafts) => {
              setDashboardState((prev) => ({
                ...prev,
                drafts: updatedDrafts,
              }));
            }}
            onXPUnlock={handleXPUnlock}
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
        return <RankingStabilityMap onNavigateToSERP={handleNavigateToSERP} />;

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
            initialKeyword={serpKeyword}
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
              handleSiteHealthScan('/sitemap.xml');
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
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans relative">
      {/* Persistent Navigation Sidebar with Mobile Drawer */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsMobileSidebarOpen(false);
        }}
        site={dashboardState.site}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Bar */}
        <Header
          streak={dashboardState.xp.streak_days}
          level={dashboardState.xp.level}
          onNavigateToTab={(tab) => {
            setActiveTab(tab);
            setIsMobileSidebarOpen(false);
          }}
          onToggleMobileMenu={() => setIsMobileSidebarOpen((prev) => !prev)}
          onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Dynamic Tab Body with Suspense & ErrorBoundary */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          <ErrorBoundary sectionName={`Workspace Tab: ${activeTab}`}>
            <Suspense fallback={<TabLoadingSkeleton />}>
              {renderTabContent()}
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      {/* Settings & Vite HMR Config Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Keyboard Shortcuts Reference Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
        onSelectTab={(tabId) => {
          setActiveTab(tabId);
          setIsMobileSidebarOpen(false);
        }}
        activeTab={activeTab}
      />

      {/* Tactile Keyboard Shortcut Feedback Toast */}
      {toastMessage && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-3.5 py-2 bg-slate-900/95 text-white border border-emerald-500/40 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-150 cursor-pointer"
          onClick={dismissToast}
          role="status"
          aria-live="polite"
        >
          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Command size={13} />
          </div>
          <div className="text-xs font-medium">
            Switched to <span className="font-semibold text-emerald-300">{toastMessage.tabName}</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-950 border border-slate-700 rounded text-emerald-400 ml-1">
            {toastMessage.shortcut}
          </kbd>
        </div>
      )}

      {/* Live Version Fingerprint Badge */}
      <LiveVersion />
    </div>
  );
}
