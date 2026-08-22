import { useEffect, useState, useCallback } from 'react';

export interface ShortcutTab {
  key: string;
  id: string;
  name: string;
  description: string;
}

export const PRIMARY_DASHBOARD_SHORTCUTS: ShortcutTab[] = [
  {
    key: '1',
    id: 'dashboard',
    name: 'Overview',
    description: 'Main dashboard KPIs, quick actions & site status',
  },
  {
    key: '2',
    id: 'writer',
    name: 'AI Writer',
    description: 'Generate SEO articles, BER guides & structured drafts',
  },
  {
    key: '3',
    id: 'keywords',
    name: 'Keyword Research',
    description: 'Explore high-value search queries & intent clusters',
  },
  {
    key: '4',
    id: 'serp',
    name: 'SERP Analyzer',
    description: 'Analyze competitive Google search ranking results',
  },
  {
    key: '5',
    id: 'audit',
    name: 'Site Health Scan',
    description: 'Audit sitemaps, Core Web Vitals & technical SEO',
  },
  {
    key: '6',
    id: 'content_ideas',
    name: 'Discover Ideas',
    description: 'Brainstorm trending Irish retrofit topics & links',
  },
  {
    key: '7',
    id: 'link_builder',
    name: 'Link Builder',
    description: 'Outreach targets & interactive link-bait widgets',
  },
  {
    key: '8',
    id: 'library',
    name: 'Content Library',
    description: 'Manage saved drafts, published pages & history',
  },
  {
    key: '9',
    id: 'crawler',
    name: 'Crawler Feed',
    description: 'Live telemetry, indexation & system crawler log',
  },
];

interface UseDashboardShortcutsOptions {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenWriterWithTopic?: (topic: string) => void;
}

export function useDashboardShortcuts({
  activeTab,
  setActiveTab,
}: UseDashboardShortcutsOptions) {
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    tabName: string;
    shortcut: string;
  } | null>(null);

  const triggerTabSwitch = useCallback(
    (tabId: string, tabName: string, shortcutKey: string) => {
      setActiveTab(tabId);
      const isMac =
        typeof window !== 'undefined' &&
        navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const mod = isMac ? '⌘' : 'Ctrl';

      setToastMessage({
        tabName,
        shortcut: `${mod}+${shortcutKey}`,
      });
    },
    [setActiveTab],
  );

  // Auto-hide toast after 1.8 seconds
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 1800);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInputActive =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl instanceof HTMLSelectElement ||
        (activeEl instanceof HTMLElement && activeEl.isContentEditable);

      // Handle Escape: Close shortcut modal
      if (e.key === 'Escape') {
        if (isShortcutsModalOpen) {
          e.preventDefault();
          setIsShortcutsModalOpen(false);
          return;
        }
      }

      // Handle '?' or 'Ctrl+/' to toggle shortcuts cheat sheet
      if (
        (e.key === '?' && !isInputActive) ||
        (e.key === '/' && (e.ctrlKey || e.metaKey))
      ) {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
        return;
      }

      // Handle Ctrl+1..9, Cmd+1..9, and Alt+1..9
      const isModifier = e.ctrlKey || e.metaKey || e.altKey;
      if (isModifier) {
        const matchingShortcut = PRIMARY_DASHBOARD_SHORTCUTS.find(
          (s) => s.key === e.key,
        );

        if (matchingShortcut) {
          e.preventDefault();
          e.stopPropagation();
          triggerTabSwitch(
            matchingShortcut.id,
            matchingShortcut.name,
            matchingShortcut.key,
          );
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [triggerTabSwitch, isShortcutsModalOpen]);

  return {
    isShortcutsModalOpen,
    setIsShortcutsModalOpen,
    toastMessage,
    dismissToast: () => setToastMessage(null),
    shortcuts: PRIMARY_DASHBOARD_SHORTCUTS,
  };
}
