import {
  LayoutDashboard,
  Search,
  FileText,
  Globe,
  Sparkles,
  Layers,
  Settings,
  Zap,
  CheckCircle,
  HelpCircle,
  Menu,
  X,
  FileCheck,
  Thermometer,
  TrendingUp,
  MessageSquare,
  Smile,
  Cpu,
  Lightbulb,
  BookOpen,
  Link2,
  Map,
  Activity,
<<<<<<< HEAD
  Compass,
  Users,
  ShieldCheck,
  DollarSign,
  Eye,
  Layout,
  Dna,
  Scale,
  Award,
  Calendar,
  Wrench
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
=======
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
>>>>>>> origin/main

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
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
<<<<<<< HEAD
    { id: "dashboard", label: "Dashboard", name: "Dashboard", icon: LayoutDashboard },
    { id: "p7_overview", label: "Intelligence Console", name: "Intelligence Console", icon: LayoutDashboard },
    { id: "p7_backlinks", label: "Backlink AI Engine", name: "Backlink AI Engine", icon: Link2 },
    { id: "p7_competitors", label: "Competitor SERP Diff", name: "Competitor SERP Diff", icon: TrendingUp },
    { id: "p7_heatmap", label: "Regional Demand Map", name: "Regional Demand Map", icon: Map },
    { id: "p7_marl", label: "MARL Safety Loop", name: "MARL Safety Loop", icon: Sparkles },
    { id: "p9_autonomy", label: "Autonomy Campaign Console", name: "Autonomy Campaign Console", icon: Zap },
    { id: "p11_fusion", label: "SEO + Ads Fusion Engine", name: "SEO + Ads Fusion Engine", icon: Layers },
    { id: "p12_growth", label: "Predictive Growth Console", name: "Predictive Growth Console", icon: TrendingUp },
    { id: "p13_strategy", label: "Strategic Planning Console", name: "Strategic Planning Console", icon: Compass },
    { id: "p14_simulation", label: "Autonomous Market Simulator", name: "Autonomous Market Simulator", icon: Cpu },
    { id: "p15_negotiation", label: "Multi-Agent Negotiation", name: "Multi-Agent Negotiation", icon: Users },
    { id: "p16_budget", label: "Budget Allocation", name: "Budget Allocation", icon: DollarSign },
    { id: "p17_watchdog", label: "Competitor Watchdog", name: "Competitor Watchdog", icon: Eye },
    { id: "p18_landing", label: "Landing Optimizer", name: "Landing Optimizer", icon: Layout },
    { id: "p19_ecosystem", label: "Ecosystem Intelligence", name: "Ecosystem Intelligence", icon: Globe },
    { id: "p20_evolution", label: "Strategy Evolution", name: "Strategy Evolution", icon: Dna },
    { id: "p21_content", label: "Content Engine", name: "Content Engine", icon: FileText },
    { id: "p22_conflict", label: "Conflict Resolution", name: "Conflict Resolution", icon: Scale },
    { id: "p23_grants", label: "SEAI Grant Intelligence", name: "SEAI Grant Intelligence", icon: Award },
    { id: "p24_pdf", label: "SEAI PDF Analytics", name: "SEAI PDF Analytics", icon: FileText },
    { id: "p25_advisor", label: "Advisor Scheduler", name: "Advisor Scheduler", icon: Calendar },
    { id: "p26_homeowners", label: "Homeowner Accounts", name: "Homeowner Accounts", icon: Users },
    { id: "p27_retrofit", label: "AI Retrofit Analytics", name: "AI Retrofit Analytics", icon: Sparkles },
    { id: "p28_contractors", label: "Contractor Coordination", name: "Contractor Coordination", icon: Wrench },
    { id: "p29_pdf", label: "Retrofit Blueprint PDF", name: "Retrofit Blueprint PDF", icon: FileText },
    { id: "p30_submissions", label: "Grant Submissions", name: "Grant Submissions", icon: FileCheck },
    { id: "p31_postinstall", label: "Post-Install BER & Payment", name: "Post-Install BER & Payment", icon: Award },
    { id: "p32_journey", label: "Master Journey Timeline", name: "Master Journey Timeline", icon: Compass },
    { id: "p33_contractor_scores", label: "Contractor Quality Scores", name: "Contractor Quality Scores", icon: ShieldCheck },
    { id: "p33_contractor_insights", label: "Contractor Score Insights", name: "Contractor Score Insights", icon: TrendingUp },
    { id: "p34_upgrades", label: "AI Home Upgrades", name: "AI Home Upgrades", icon: Sparkles },
    { id: "p35_national", label: "National Market Insights", name: "National Market Insights", icon: Globe },
    { id: "p36_forecasting", label: "Predictive Forecasting", name: "Predictive Forecasting", icon: TrendingUp },
    { id: "p37_advisor", label: "AI Advisor Monitoring", name: "AI Advisor Monitoring", icon: MessageSquare },
    { id: "p38_sentiment", label: "Sentiment Intelligence", name: "Sentiment Intelligence", icon: Smile },
    { id: "p39_coach", label: "Proactive Coaching", name: "Proactive Coaching", icon: Sparkles },
    { id: "p40_orchestrator", label: "Master Orchestrator", name: "Master Orchestrator", icon: Cpu },
    { id: "ranking_map", label: "Ranking Stability", name: "Ranking Stability", icon: Activity },
    { id: "crawler", label: "Crawler Feed", name: "Crawler Feed", icon: Zap },
    { id: "content_ideas", label: "Discover Ideas", name: "Discover Ideas", icon: Lightbulb },
    { id: "link_builder", label: "Link Builder", name: "Link Builder", icon: Link2 },
    { id: "writer", label: "AI Writer", name: "AI Writer", icon: FileText },
    { id: "library", label: "Content Library", name: "Content Library", icon: BookOpen },
    { id: "content_audit", label: "Content Audit", name: "Content Audit", icon: FileCheck },
    { id: "content_map", label: "Content Map", name: "Content Map", path: "/content-map", icon: Map },
    { id: "keywords", label: "Keyword Research", name: "Keyword Research", icon: Search },
    { id: "serp", label: "SERP Analyzer", name: "SERP Analyzer", icon: TrendingUp },
    { id: "audit", label: "Site Health Scan", name: "Site Health Scan", icon: Globe },
    { id: "estimator", label: "Energy Estimator", name: "Energy Estimator", icon: Thermometer },
    { id: "visibility", label: "AI Answer Visibility", name: "AI Answer Visibility", icon: Sparkles },
=======
    {
      id: 'dashboard',
      label: 'Dashboard',
      name: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'ranking_map',
      label: 'Ranking Stability',
      name: 'Ranking Stability',
      icon: Activity,
    },
    { id: 'crawler', label: 'Crawler Feed', name: 'Crawler Feed', icon: Zap },
    {
      id: 'content_ideas',
      label: 'Discover Ideas',
      name: 'Discover Ideas',
      icon: Lightbulb,
    },
    {
      id: 'link_builder',
      label: 'Link Builder',
      name: 'Link Builder',
      icon: Link2,
    },
    { id: 'writer', label: 'AI Writer', name: 'AI Writer', icon: FileText },
    {
      id: 'library',
      label: 'Content Library',
      name: 'Content Library',
      icon: BookOpen,
    },
    {
      id: 'content_audit',
      label: 'Content Audit',
      name: 'Content Audit',
      icon: FileCheck,
    },
    {
      id: 'content_map',
      label: 'Content Map',
      name: 'Content Map',
      path: '/content-map',
      icon: Map,
    },
    {
      id: 'keywords',
      label: 'Keyword Research',
      name: 'Keyword Research',
      icon: Search,
    },
    {
      id: 'serp',
      label: 'SERP Analyzer',
      name: 'SERP Analyzer',
      icon: TrendingUp,
    },
    {
      id: 'audit',
      label: 'Site Health Scan',
      name: 'Site Health Scan',
      icon: Globe,
    },
    {
      id: 'estimator',
      label: 'Energy Estimator',
      name: 'Energy Estimator',
      icon: Thermometer,
    },
    {
      id: 'visibility',
      label: 'AI Answer Visibility',
      name: 'AI Answer Visibility',
      icon: Sparkles,
    },
>>>>>>> origin/main
  ];

  return (
    <div
      className={`glass-sidebar text-slate-100 flex flex-col transition-all duration-300 border-r border-white/10 ${
        collapsed ? 'w-16' : 'w-64'
      } min-h-screen relative`}
      id="sidebar-container"
    >
      {/* Top Brand Block */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
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
          className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-[#34d399] transition cursor-pointer"
          id="toggle-sidebar"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <Menu size={20} /> : <X size={20} />}
        </button>
      </div>

      {/* Nav Menu Items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path
            ? location.pathname === item.path
            : activeTab === item.id && location.pathname === '/';
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.path) {
                  navigate(item.path);
                } else {
                  if (location.pathname !== '/') {
                    navigate('/');
                  }
                  setActiveTab(item.id);
                }
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition group cursor-pointer ${
                isActive
                  ? 'bg-white/10 text-white border border-white/10'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
              id={`nav-${item.id}`}
            >
              <Icon
                size={18}
                className={`shrink-0 ${isActive ? 'text-[#34d399]' : 'text-slate-400 group-hover:text-[#34d399] transition'}`}
              />
              {!collapsed && (
                <span className="truncate">{item.name || item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Branding Info */}
      <div className="p-4 border-t border-white/10 space-y-3">
        {!collapsed && (
          <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-center">
            <div className="flex items-center gap-2 justify-center mb-1 text-[#34d399]">
              <Zap size={14} className="fill-[#34d399]/20" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Active Workspace
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              SEO & AI Visibility Suite
            </p>
          </div>
        )}
        <div className="flex justify-center text-slate-500 hover:text-slate-400 cursor-help transition">
          <HelpCircle size={16} />
        </div>
      </div>
    </div>
  );
}
