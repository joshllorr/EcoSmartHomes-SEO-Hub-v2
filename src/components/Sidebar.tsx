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
  Lightbulb,
  BookOpen,
  Link2,
  Map,
  Activity
} from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  site: string;
}

export default function Sidebar({ activeTab, setActiveTab, site }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", name: "Dashboard", icon: LayoutDashboard },
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
  ];

  return (
    <div 
      className={`glass-sidebar text-slate-100 flex flex-col transition-all duration-300 border-r border-white/10 ${
        collapsed ? "w-16" : "w-64"
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
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
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
            : activeTab === item.id && location.pathname === "/";
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.path) {
                  navigate(item.path);
                } else {
                  if (location.pathname !== "/") {
                    navigate("/");
                  }
                  setActiveTab(item.id);
                }
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition group cursor-pointer ${
                isActive 
                  ? "bg-white/10 text-white border border-white/10" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
              id={`nav-${item.id}`}
            >
              <Icon 
                size={18} 
                className={`shrink-0 ${isActive ? "text-[#34d399]" : "text-slate-400 group-hover:text-[#34d399] transition"}`} 
              />
              {!collapsed && <span className="truncate">{item.name || item.label}</span>}
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
              <span className="text-xs font-bold uppercase tracking-wider">Active Workspace</span>
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
