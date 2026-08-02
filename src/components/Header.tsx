import {
  Bell,
  Globe,
  Sun,
  Moon,
  Check,
  Edit2,
  Sparkles,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  X,
  ExternalLink,
  CheckCheck,
  MapPin,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useDashboardStore } from '../store/useDashboardStore';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  unread: boolean;
  type: 'ai' | 'xp' | 'audit' | 'system';
  targetTab?: string;
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'New LLM Citation Detected',
    description:
      "ChatGPT-4o cited your 'BER Upgrade Guide' in a top response (+20 XP).",
    time: '2m ago',
    unread: true,
    type: 'ai',
    targetTab: 'ai-visibility',
  },
  {
    id: 'notif-2',
    title: 'Core Web Vitals Pass',
    description: 'LCP performance on ecosmarthomes.ie scored 98/100 (+15 XP).',
    time: '15m ago',
    unread: true,
    type: 'audit',
    targetTab: 'site-audit',
  },
  {
    id: 'notif-3',
    title: 'Daily Streak Maintained!',
    description: 'You unlocked the 7-Day SEO Streak bonus milestone (+30 XP).',
    time: '1h ago',
    unread: true,
    type: 'xp',
    targetTab: 'dashboard',
  },
  {
    id: 'notif-4',
    title: 'JSON-LD Schema Validated',
    description: 'Organization & WebSite microdata indexed without warnings.',
    time: '4h ago',
    unread: false,
    type: 'system',
    targetTab: 'serp-analyzer',
  },
];

interface HeaderProps {
  streak: number;
  level: number;
  onNavigateToTab: (tab: string) => void;
}

export default function Header({
  streak,
  level,
  onNavigateToTab,
}: HeaderProps) {
  const targetDomain = useDashboardStore((s) => s.targetDomain);
  const setTargetDomain = useDashboardStore((s) => s.setTargetDomain);

  const [inputDomain, setInputDomain] = useState(targetDomain);
  const [isEditing, setIsEditing] = useState(false);

  // Live Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('ecosmart_live_notifications_v1');
      return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  });

  const [isOpenNotifs, setIsOpenNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(
        'ecosmart_live_notifications_v1',
        JSON.stringify(notifications),
      );
    } catch (e) {
      console.error('Failed to save notifications:', e);
    }
  }, [notifications]);

  // Click outside listener for notifications popover
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setIsOpenNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    );
  };

  const dismissNotification = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (item: NotificationItem) => {
    markAsRead(item.id);
    if (item.targetTab) {
      onNavigateToTab(item.targetTab);
    }
    setIsOpenNotifs(false);
  };

  const addSimulatedAlert = () => {
    const alerts: NotificationItem[] = [
      {
        id: `notif-${Date.now()}`,
        title: 'Perplexity Citation Updated',
        description: `Perplexity AI indexed your new SEAI Heat Pump Grant Calculator on ${targetDomain}.`,
        time: 'Just now',
        unread: true,
        type: 'ai',
        targetTab: 'ai-visibility',
      },
      {
        id: `notif-${Date.now()}`,
        title: 'Sitemap Audit Complete',
        description: `0 broken links detected across 24 crawled URLs on ${targetDomain}.`,
        time: 'Just now',
        unread: true,
        type: 'audit',
        targetTab: 'site-audit',
      },
      {
        id: `notif-${Date.now()}`,
        title: 'XP Bonus Awarded!',
        description: 'SEO Quick Checklist item completed (+15 XP).',
        time: 'Just now',
        unread: true,
        type: 'xp',
        targetTab: 'dashboard',
      },
    ];

    const randomAlert = alerts[Math.floor(Math.random() * alerts.length)];
    setNotifications((prev) => [randomAlert, ...prev]);
  };

  useEffect(() => {
    setInputDomain(targetDomain);
  }, [targetDomain]);

  const handleSaveDomain = () => {
    if (inputDomain.trim()) {
      setTargetDomain(inputDomain);
    }
    setIsEditing(false);
  };

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('ecosmart_seo_theme');
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    return 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
    localStorage.setItem('ecosmart_seo_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const renderNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'ai':
        return <Sparkles size={14} className="text-[#34d399]" />;
      case 'xp':
        return <Zap size={14} className="text-amber-400" />;
      case 'audit':
        return <ShieldCheck size={14} className="text-indigo-400" />;
      default:
        return <CheckCircle2 size={14} className="text-sky-400" />;
    }
  };

  return (
    <header className="glass-header sticky top-0 z-40 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10">
      {/* Interactive Active SEO Target Input */}
      <div className="flex items-center gap-2.5 bg-emerald-500/10 px-3.5 py-2 rounded-xl border border-emerald-500/25 text-emerald-400 font-medium text-xs">
        <Globe size={15} className="text-emerald-400 shrink-0" />
        <span className="shrink-0 font-semibold text-slate-300">
          Active SEO Target:
        </span>
        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={inputDomain}
              onChange={(e) => setInputDomain(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveDomain()}
              placeholder="e.g. mywebsite.com"
              className="bg-black/50 text-emerald-300 font-mono text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-500/40 focus:border-emerald-400 focus:outline-hidden transition w-44 sm:w-60"
              autoFocus
              id="header-target-domain-input"
            />
            <button
              onClick={handleSaveDomain}
              className="bg-emerald-500 text-slate-950 font-bold px-2.5 py-1 rounded-lg text-[11px] hover:bg-emerald-400 cursor-pointer flex items-center gap-1 transition shrink-0"
              title="Save Target Domain"
              id="save-target-domain-btn"
            >
              <Check size={12} />
              <span>Save</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-emerald-300 bg-black/30 px-2 py-0.5 rounded border border-emerald-500/20">
              {targetDomain}
            </span>
            <div className="flex items-center gap-1 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shadow-xs">
              <MapPin size={11} className="text-emerald-400 shrink-0" />
              <span>Limerick (V94 Eircode Zone)</span>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="text-slate-400 hover:text-emerald-300 text-[11px] font-mono flex items-center gap-1 hover:underline cursor-pointer transition"
              title="Change target website domain"
              id="edit-target-domain-btn"
            >
              <Edit2 size={11} />
              <span>Change</span>
            </button>
          </div>
        )}
      </div>

      {/* Right User Actions */}
      <div className="flex items-center gap-4 shrink-0 justify-end">
        {/* Light/Dark Mode Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-400 hover:text-[#34d399] hover:bg-white/5 rounded-xl transition cursor-pointer flex items-center justify-center border border-transparent hover:border-white/10"
          title={
            theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'
          }
          id="theme-toggle-btn"
        >
          {theme === 'light' ? (
            <Moon size={18} className="text-slate-500 fill-slate-500/20" />
          ) : (
            <Sun
              size={18}
              className="text-amber-400 fill-amber-400/20 animate-[spin_10s_linear_infinite]"
            />
          )}
        </button>

        {/* Live Interactive Notification Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsOpenNotifs(!isOpenNotifs)}
            className={`relative p-2 rounded-xl border transition cursor-pointer flex items-center justify-center ${
              isOpenNotifs
                ? 'bg-white/10 text-emerald-400 border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-transparent'
            }`}
            title="Live Notifications"
            id="header-notifications"
            aria-expanded={isOpenNotifs}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold font-mono rounded-full flex items-center justify-center shadow-md animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Popover Menu */}
          {isOpenNotifs && (
            <div
              className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#0f172a] border border-white/15 rounded-2xl shadow-2xl z-50 overflow-hidden text-left animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-xl"
              id="notifications-popover"
            >
              {/* Popover Header */}
              <div className="p-3.5 border-b border-white/10 flex items-center justify-between bg-black/30">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Bell size={15} />
                  </div>
                  <h4 className="font-bold text-white text-xs tracking-tight">
                    Notifications
                  </h4>
                  {unreadCount > 0 ? (
                    <span className="text-[10px] font-mono bg-rose-500/15 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold">
                      {unreadCount} new
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                      All caught up
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1 cursor-pointer hover:underline"
                      title="Mark all as read"
                    >
                      <CheckCheck size={12} />
                      <span>Read all</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpenNotifs(false)}
                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div className="max-h-[320px] overflow-y-auto divide-y divide-white/5 scrollbar-thin scrollbar-thumb-white/10">
                {notifications.length > 0 ? (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleNotificationClick(item)}
                      className={`p-3.5 transition cursor-pointer flex items-start gap-3 hover:bg-white/5 relative group ${
                        item.unread ? 'bg-emerald-950/20' : 'opacity-80'
                      }`}
                    >
                      {/* Unread Indicator Bar */}
                      {item.unread && (
                        <div className="absolute left-0 top-3 bottom-3 w-1 bg-emerald-400 rounded-r-full" />
                      )}

                      <div className="p-2 rounded-xl bg-black/40 border border-white/10 shrink-0 mt-0.5">
                        {renderNotifIcon(item.type)}
                      </div>

                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-xs font-semibold ${item.unread ? 'text-white' : 'text-slate-300'}`}
                          >
                            {item.title}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500 shrink-0">
                            {item.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                          {item.description}
                        </p>
                        {item.targetTab && (
                          <div className="pt-1 flex items-center gap-1 text-[10px] font-mono text-indigo-400 group-hover:text-indigo-300 font-medium">
                            <span>View in tab</span>
                            <ExternalLink size={10} />
                          </div>
                        )}
                      </div>

                      <button
                        onClick={(e) => dismissNotification(item.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition cursor-pointer shrink-0"
                        title="Dismiss notification"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center space-y-2">
                    <p className="text-xs text-slate-400">
                      No notifications available.
                    </p>
                  </div>
                )}
              </div>

              {/* Popover Footer */}
              <div className="p-2.5 bg-black/40 border-t border-white/10 flex items-center justify-between text-[11px]">
                <button
                  onClick={addSimulatedAlert}
                  className="text-xs font-mono text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1 cursor-pointer font-bold px-2 py-1 rounded hover:bg-emerald-500/10"
                  title="Simulate a live incoming notification alert"
                >
                  <Sparkles size={12} />
                  <span>+ Trigger Test Alert</span>
                </button>

                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-slate-500 hover:text-rose-400 transition flex items-center gap-1 cursor-pointer px-2 py-1"
                    title="Clear all notifications"
                  >
                    <Trash2 size={12} />
                    <span>Clear all</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Card Profile */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-white/10">
          <div className="w-9 h-9 rounded-full bg-white/10 text-[#34d399] flex items-center justify-center border border-white/10 shadow-sm font-bold">
            J
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-sm font-semibold text-slate-100">Joe</span>
            <span className="text-[10px] text-slate-400 font-mono">
              joehr4838@gmail.com
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
