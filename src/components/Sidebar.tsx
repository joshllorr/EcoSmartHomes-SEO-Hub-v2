import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  site: string;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  site,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<
    'all' | 'p29_40' | 'p15_28' | 'p1_14' | 'tools'
  >('all');
  const navigate = useNavigate();
  const location = useLocation();

  const menuSections = [
    {
      id: 'p29_40',
      title: '🔥 Phases 29–40 Master Suite',
      items: [
        {
          id: 'p29_pdf',
          name: 'Retrofit Blueprint PDF',
          label: 'Phase 29 PDF Analytics',
          icon: LucideIcons.FileText,
        },
        {
          id: 'p30_submissions',
          name: 'Grant Submissions',
          label: 'Phase 30 Grant Submissions',
          icon: LucideIcons.FileCheck,
        },
        {
          id: 'p31_postinstall',
          name: 'Post-Install BER & Payment',
          label: 'Phase 31 Post-Install',
          path: '/post-install',
          icon: LucideIcons.Award,
        },
        {
          id: 'p32_journey',
          name: 'Master Journey Timeline',
          label: 'Phase 32 Master Journey',
          path: '/journey',
          icon: LucideIcons.Compass,
        },
        {
          id: 'p33_contractor_scores',
          name: 'Contractor Quality Scores',
          label: 'Phase 33 Quality Scores',
          icon: LucideIcons.ShieldCheck,
        },
        {
          id: 'p33_contractor_insights',
          name: 'Contractor Score Insights',
          label: 'Phase 33 Insights',
          icon: LucideIcons.TrendingUp,
        },
        {
          id: 'p34_upgrades',
          name: 'AI Home Upgrades',
          label: 'Phase 34 Recommendations',
          icon: LucideIcons.Sparkles,
        },
        {
          id: 'p35_national',
          name: 'National Market Insights',
          label: 'Phase 35 National Market',
          path: '/national-insights',
          icon: LucideIcons.Globe,
        },
        {
          id: 'p36_forecasting',
          name: 'Predictive Forecasting',
          label: 'Phase 36 Predictive Forecasting',
          path: '/forecasting',
          icon: LucideIcons.TrendingUp,
        },
        {
          id: 'p37_advisor',
          name: 'AI Advisor Monitoring',
          label: 'Phase 37 Advisor Sessions',
          icon: LucideIcons.MessageSquare,
        },
        {
          id: 'p38_sentiment',
          name: 'Sentiment Intelligence',
          label: 'Phase 38 Sentiment Intelligence',
          icon: LucideIcons.Smile,
        },
        {
          id: 'p39_coach',
          name: 'Proactive Coaching',
          label: 'Phase 39 Proactive Coaching',
          path: '/coach',
          icon: LucideIcons.Sparkles,
        },
        {
          id: 'p40_orchestrator',
          name: 'Master Orchestrator',
          label: 'Phase 40 Master Orchestrator',
          icon: LucideIcons.Cpu,
        },
      ],
    },
    {
      id: 'p15_28',
      title: '🏡 Strategy & Retrofit (Phases 15–28)',
      items: [
        {
          id: 'p15_negotiation',
          name: 'Multi-Agent Negotiation',
          icon: LucideIcons.Users,
        },
        {
          id: 'p16_budget',
          name: 'Budget Allocation',
          icon: LucideIcons.DollarSign,
        },
        {
          id: 'p17_watchdog',
          name: 'Competitor Watchdog',
          icon: LucideIcons.Eye,
        },
        {
          id: 'p18_landing',
          name: 'Landing Optimizer',
          icon: LucideIcons.Layout,
        },
        {
          id: 'p19_ecosystem',
          name: 'Ecosystem Intelligence',
          icon: LucideIcons.Globe,
        },
        {
          id: 'p20_evolution',
          name: 'Strategy Evolution',
          icon: LucideIcons.Dna,
        },
        {
          id: 'p21_content',
          name: 'Content Engine',
          icon: LucideIcons.FileText,
        },
        {
          id: 'p22_conflict',
          name: 'Conflict Resolution',
          icon: LucideIcons.Scale,
        },
        {
          id: 'p23_grants',
          name: 'SEAI Grant Intelligence',
          icon: LucideIcons.Award,
        },
        {
          id: 'p24_pdf',
          name: 'SEAI PDF Analytics',
          icon: LucideIcons.FileText,
        },
        {
          id: 'p25_advisor',
          name: 'Advisor Scheduler',
          path: '/advisor',
          icon: LucideIcons.Calendar,
        },
        {
          id: 'p26_homeowners',
          name: 'Homeowner Accounts',
          icon: LucideIcons.Users,
        },
        {
          id: 'p27_retrofit',
          name: 'AI Retrofit Analytics',
          icon: LucideIcons.Sparkles,
        },
        {
          id: 'p28_contractors',
          name: 'Contractor Coordination',
          path: '/contractor-engine',
          icon: LucideIcons.Wrench,
        },
      ],
    },
    {
      id: 'p1_14',
      title: '📊 Core Intelligence (Phases 1–14)',
      items: [
        {
          id: 'dashboard',
          name: 'Dashboard Overview',
          path: '/dashboard',
          icon: LucideIcons.LayoutDashboard,
        },
        {
          id: 'p7_overview',
          name: 'Intelligence Console',
          icon: LucideIcons.LayoutDashboard,
        },
        {
          id: 'p7_backlinks',
          name: 'Backlink AI Engine',
          icon: LucideIcons.Link2,
        },
        {
          id: 'p7_competitors',
          name: 'Competitor SERP Diff',
          icon: LucideIcons.TrendingUp,
        },
        {
          id: 'p7_heatmap',
          name: 'Regional Demand Map',
          icon: LucideIcons.Map,
        },
        {
          id: 'p7_marl',
          name: 'MARL Safety Loop',
          path: '/marl',
          icon: LucideIcons.Sparkles,
        },
        {
          id: 'p9_autonomy',
          name: 'Autonomy Campaign Console',
          icon: LucideIcons.Zap,
        },
        {
          id: 'p11_fusion',
          name: 'SEO + Ads Fusion Engine',
          icon: LucideIcons.Layers,
        },
        {
          id: 'p12_growth',
          name: 'Predictive Growth Console',
          icon: LucideIcons.TrendingUp,
        },
        {
          id: 'p13_strategy',
          name: 'Strategic Planning Console',
          icon: LucideIcons.Compass,
        },
        {
          id: 'p14_simulation',
          name: 'Autonomous Market Simulator',
          icon: LucideIcons.Cpu,
        },
      ],
    },
    {
      id: 'tools',
      title: '🛠️ SEO & Content Tools',
      items: [
        {
          id: 'ranking_map',
          name: 'Ranking Stability',
          icon: LucideIcons.Activity,
        },
        { id: 'crawler', name: 'Crawler Feed', icon: LucideIcons.Zap },
        {
          id: 'content_ideas',
          name: 'Discover Ideas',
          icon: LucideIcons.Lightbulb,
        },
        { id: 'link_builder', name: 'Link Builder', icon: LucideIcons.Link2 },
        { id: 'writer', name: 'AI Writer', icon: LucideIcons.FileText },
        { id: 'library', name: 'Content Library', icon: LucideIcons.BookOpen },
        {
          id: 'content_audit',
          name: 'Content Audit',
          icon: LucideIcons.FileCheck,
        },
        {
          id: 'content_map',
          name: 'Content Map',
          path: '/content-map',
          icon: LucideIcons.Map,
        },
        { id: 'keywords', name: 'Keyword Research', icon: LucideIcons.Search },
        { id: 'serp', name: 'SERP Analyzer', icon: LucideIcons.TrendingUp },
        { id: 'audit', name: 'Site Health Scan', icon: LucideIcons.Globe },
        {
          id: 'estimator',
          name: 'Energy Estimator',
          icon: LucideIcons.Thermometer,
        },
        {
          id: 'visibility',
          name: 'AI Answer Visibility',
          icon: LucideIcons.Sparkles,
        },
      ],
    },
  ];

  const handleTabClick = (item: { id: string; path?: string }) => {
    if (item.path) {
      navigate(item.path);
    } else {
      if (location.pathname !== '/') {
        navigate('/');
      }
    }
    setActiveTab(item.id);
  };

  return (
    <div
      className={`glass-sidebar text-slate-100 flex flex-col transition-all duration-300 border-r border-white/10 ${
        collapsed ? 'w-16' : 'w-64 sm:w-72'
      } h-screen max-h-screen relative overflow-hidden shrink-0 z-30`}
      id="sidebar-container"
    >
      {/* Top Brand Block */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg text-[#34d399] tracking-tight whitespace-nowrap">
              EcoSmart SEO
            </span>
            <span className="text-xs text-slate-400 font-mono tracking-tight font-medium">
              {site}
            </span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-[#34d399] transition cursor-pointer"
          id="toggle-sidebar"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <LucideIcons.Menu size={20} />
          ) : (
            <LucideIcons.X size={20} />
          )}
        </button>
      </div>

      {!collapsed && (
        <div className="p-3 border-b border-white/10 space-y-2 shrink-0 bg-black/20">
          {/* Live Search Input */}
          <div className="relative">
            <LucideIcons.Search
              size={14}
              className="absolute left-2.5 top-2.5 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 40+ phases & engines..."
              className="w-full bg-slate-900/90 text-xs text-white pl-8 pr-7 py-1.5 rounded-lg border border-white/10 focus:border-[#34d399] focus:outline-hidden font-sans placeholder:text-slate-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-white"
              >
                <LucideIcons.X size={12} />
              </button>
            )}
          </div>

          {/* Category Quick Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[11px] font-medium">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-2 py-0.5 rounded-md transition shrink-0 cursor-pointer ${
                activeCategory === 'all'
                  ? 'bg-[#34d399]/20 text-[#34d399] border border-[#34d399]/40 font-bold'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveCategory('p29_40')}
              className={`px-2 py-0.5 rounded-md transition shrink-0 cursor-pointer ${
                activeCategory === 'p29_40'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              Phases 29–40 🔥
            </button>
            <button
              onClick={() => setActiveCategory('p15_28')}
              className={`px-2 py-0.5 rounded-md transition shrink-0 cursor-pointer ${
                activeCategory === 'p15_28'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              15–28
            </button>
            <button
              onClick={() => setActiveCategory('p1_14')}
              className={`px-2 py-0.5 rounded-md transition shrink-0 cursor-pointer ${
                activeCategory === 'p1_14'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              1–14
            </button>
          </div>
        </div>
      )}

      {/* Nav Menu Items */}
      <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {menuSections
          .filter(
            (section) =>
              activeCategory === 'all' || activeCategory === section.id,
          )
          .map((section) => {
            const matchingItems = section.items.filter((item) =>
              searchQuery === ''
                ? true
                : item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  item.id.toLowerCase().includes(searchQuery.toLowerCase()),
            );

            if (matchingItems.length === 0) return null;

            return (
              <div key={section.id} className="space-y-1">
                {!collapsed && (
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-white/5 flex items-center justify-between">
                    <span>{section.title}</span>
                    <span className="bg-white/10 px-1.5 py-0.2 rounded-full text-[9px]">
                      {matchingItems.length}
                    </span>
                  </div>
                )}

                {matchingItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.path
                    ? location.pathname === item.path || activeTab === item.id
                    : activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabClick(item)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition group cursor-pointer ${
                        isActive
                          ? 'bg-white/10 text-white border border-white/15 shadow-xs font-semibold'
                          : 'text-slate-400 hover:bg-white/5 hover:text-white'
                      }`}
                      id={`nav-${item.id}`}
                    >
                      <Icon
                        size={16}
                        className={`shrink-0 ${
                          isActive
                            ? 'text-[#34d399]'
                            : 'text-slate-400 group-hover:text-[#34d399] transition'
                        }`}
                      />
                      {!collapsed && (
                        <span className="truncate text-left">{item.name}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
      </nav>

      {/* Footer Branding Info */}
      <div className="p-3 border-t border-white/10 space-y-2 shrink-0 bg-black/30">
        {!collapsed && (
          <div className="bg-white/5 p-2.5 rounded-lg border border-white/10 text-center">
            <div className="flex items-center gap-1.5 justify-center mb-0.5 text-[#34d399]">
              <LucideIcons.Zap size={13} className="fill-[#34d399]/20" />
              <span className="text-[11px] font-bold uppercase tracking-wider">
                Full 40-Phase Engine Active
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Phases 1–40 SEO & Retrofit Suite
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
