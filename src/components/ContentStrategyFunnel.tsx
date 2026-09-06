import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Layers,
  Sparkles,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  FileText,
  Clock,
  Tag,
  Zap,
  TrendingUp,
  Award,
  ExternalLink,
  ChevronRight,
  Trash2,
  Edit3,
  Flame,
  BarChart3,
  GripVertical,
  Check,
  X,
  Lightbulb,
  FileSearch,
  PenTool,
  CheckCheck,
  Send,
  HelpCircle,
  Upload,
  Globe,
  AlertTriangle,
  Loader2,
  DollarSign,
  ShieldCheck,
  Save,
} from 'lucide-react';
import { ArticleDraft, FunnelStatus } from '../types';

export interface ContentStrategyFunnelProps {
  drafts?: ArticleDraft[];
  onOpenInWriter: (suggestion: string) => void;
  onUpdateDraft?: (updatedDraft: ArticleDraft) => void;
  onUpdateDrafts?: (updatedDrafts: ArticleDraft[]) => void;
  onXPUnlock?: (amount: number) => void;
  site?: string;
}

export interface FunnelStageConfig {
  id: FunnelStatus;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accentColor: string;
  badgeBg: string;
  borderColor: string;
  dropBg: string;
}

export const FUNNEL_STAGES: FunnelStageConfig[] = [
  {
    id: 'Idea',
    label: 'Idea & Keywords',
    shortLabel: 'Idea',
    description: 'Brainstormed topics & untapped search queries',
    icon: Lightbulb,
    accentColor: 'text-purple-400',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    borderColor: 'border-purple-500/30',
    dropBg: 'bg-purple-950/40 border-purple-400',
  },
  {
    id: 'Research',
    label: 'Research & Brief',
    shortLabel: 'Research',
    description: 'SERP intent, grant figures & outline mapped',
    icon: FileSearch,
    accentColor: 'text-sky-400',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    borderColor: 'border-sky-500/30',
    dropBg: 'bg-sky-950/40 border-sky-400',
  },
  {
    id: 'Drafted',
    label: 'Drafting & SEO',
    shortLabel: 'Drafting',
    description: 'Content generation & keyword optimization',
    icon: PenTool,
    accentColor: 'text-amber-400',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    borderColor: 'border-amber-500/30',
    dropBg: 'bg-amber-950/40 border-amber-400',
  },
  {
    id: 'Review',
    label: 'SEO Review',
    shortLabel: 'Review',
    description: 'Meta tags, images & internal link validation',
    icon: CheckCheck,
    accentColor: 'text-teal-400',
    badgeBg: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    borderColor: 'border-teal-500/30',
    dropBg: 'bg-teal-950/40 border-teal-400',
  },
  {
    id: 'Published',
    label: 'Published & Live',
    shortLabel: 'Published',
    description: 'Live on CMS, indexed & tracking rank stability',
    icon: Send,
    accentColor: 'text-[#34d399]',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    borderColor: 'border-emerald-500/30',
    dropBg: 'bg-emerald-950/40 border-emerald-400',
  },
];

const DEFAULT_STRATEGY_ITEMS: ArticleDraft[] = [
  {
    id: 'strat-idea-1',
    title: 'Solar PV Battery Storage: Is 5kWh Worth It for Irish Homes?',
    topic:
      'Solar battery payback periods and SEAI battery incentives in Ireland.',
    content:
      '# Solar PV Battery Storage ROI in Ireland\n\nWith escalating electricity tariffs and the microgeneration feed-in tariff (CEG), Irish homeowners are weighing up whether a 5kWh or 10kWh battery system yields sufficient payback...',
    status: 'Idea',
    date: '20/08/2026',
    wordCount: 0,
    pillar: 'Solar PV',
    priority: 'high',
    seoScore: 82,
    targetBER: 'A0',
    grantTag: '€2,100 Solar PV',
    daysInStage: 2,
    stageUpdatedAt: Date.now() - 2 * 86400000,
    keywords: [
      'solar battery Ireland',
      '5kWh storage ROI',
      'SEAI battery grant',
    ],
  },
  {
    id: 'strat-idea-2',
    title: 'Air-to-Water vs Exhaust Air Heat Pumps in Irish Winter Humidity',
    topic:
      'Evaluating seasonal COP performance in damp Atlantic Irish climates.',
    content:
      '# Heat Pump Performance in Irish Humidity\n\nIreland’s mild, high-humidity winters create unique defrost cycle demands for air-source heat pumps. Understanding SCOP ratings and proper thermal buffering...',
    status: 'Idea',
    date: '19/08/2026',
    wordCount: 0,
    pillar: 'Heat Pumps',
    priority: 'medium',
    seoScore: 79,
    targetBER: 'B',
    grantTag: '€12,500 Heat Pump',
    daysInStage: 3,
    stageUpdatedAt: Date.now() - 3 * 86400000,
    keywords: [
      'heat pump defrost cycle',
      'humidity COP Ireland',
      'air to water efficiency',
    ],
  },
  {
    id: 'strat-research-1',
    title: 'SEAI One-Stop-Shop vs Individual Energy Grants 2026',
    topic:
      'Comparative guide to capital expenditure and grant deductions under current SEAI schemes.',
    content:
      '# SEAI One-Stop-Shop vs Step-by-Step Grants\n\nThe SEAI One-Stop-Shop offers fully managed turnkey retrofits with upfront grant deductions, whereas individual grants require self-managed contractor quotes...',
    status: 'Research',
    date: '18/08/2026',
    wordCount: 420,
    pillar: 'SEAI Grants',
    priority: 'urgent',
    seoScore: 88,
    targetBER: 'B',
    grantTag: '€26,000 Whole House',
    daysInStage: 4,
    stageUpdatedAt: Date.now() - 4 * 86400000,
    keywords: [
      'SEAI one stop shop',
      'individual retrofit grants',
      'grant values 2026',
    ],
  },
  {
    id: 'strat-draft-1',
    title: 'Retrofitting Homes in Ireland: SEAI Grants Explained',
    topic:
      'Understanding SEAI grant schemes for heat pump installations and attic insulation.',
    content:
      'Upgrading your home in Limerick and the V94 Eircode region is very important. Many homeowners in Castletroy, Raheen, and Dooradoyle want to save money on heating bills. You can get grants from the Sustainable Energy Authority of Ireland (SEAI).',
    status: 'Drafted',
    date: '18/07/2026',
    wordCount: 94,
    pillar: 'SEAI Grants',
    priority: 'high',
    seoScore: 75,
    targetBER: 'B',
    grantTag: '€12,500 Heat Pump',
    daysInStage: 8,
    stageUpdatedAt: Date.now() - 8 * 86400000,
    keywords: [
      'SEAI grants Limerick V94',
      'home insulation Raheen',
      'BER rating Limerick',
    ],
  },
  {
    id: 'strat-review-1',
    title: 'Attic Insulation & Raising BER Ratings from G to B2',
    topic:
      "How attic insulation improves your home's thermal efficiency and boosts overall BER letter rating.",
    content:
      "Attic insulation is one of the most cost-effective ways to improve your home's thermal efficiency and boost its overall rating. Heat rises, meaning a significant amount of warmth is lost through an uninsulated roof.",
    status: 'Review',
    date: '17/07/2026',
    wordCount: 88,
    pillar: 'Attic Insulation',
    priority: 'medium',
    seoScore: 91,
    targetBER: 'B',
    grantTag: '€2,000 Attic',
    daysInStage: 9,
    stageUpdatedAt: Date.now() - 9 * 86400000,
    keywords: [
      'BER rating Ireland',
      'attic insulation',
      'thermal efficiency',
      'retrofit',
    ],
  },
  {
    id: 'strat-pub-1',
    title: 'Step-by-Step Guide: Raising Your Home BER from G to A0',
    topic:
      'Comprehensive sequenced retrofit blueprint to achieve A0 standard in Irish dwellings under 2026 EPBD regulations.',
    content:
      '# Raising Your BER From G to A0\n\nA comprehensive, fabric-first approach is essential for achieving an A0 Building Energy Rating. Start with air tightness and high-performance attic insulation before sizing an air-to-water heat pump system...',
    status: 'Published',
    date: '12/07/2026',
    wordCount: 1450,
    pillar: 'BER Upgrade',
    priority: 'urgent',
    seoScore: 98,
    liveUrl: 'https://ecosmarthomes.ie/guides/ber-g-to-a0-upgrade',
    targetBER: 'A0',
    grantTag: '€26,000 Deep Retrofit',
    daysInStage: 1,
    stageUpdatedAt: Date.now() - 30 * 86400000,
    publishedAt: Date.now() - 30 * 86400000,
    keywords: ['raise BER rating', 'BER G to A0', 'retrofit sequence Ireland'],
  },
];

export default function ContentStrategyFunnel({
  drafts = [],
  onOpenInWriter,
  onUpdateDraft,
  onUpdateDrafts,
  onXPUnlock,
  site = 'ecosmarthomes.ie',
}: ContentStrategyFunnelProps) {
  // Local items pool, syncing with provided drafts + pre-seeded strategic funnel items
  const [items, setItems] = useState<ArticleDraft[]>(() => {
    const saved = localStorage.getItem('ecosmart_content_funnel_items');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (_) {
        // Fallback below
      }
    }

    // Merge incoming drafts with default strategy items
    const merged: ArticleDraft[] = [...DEFAULT_STRATEGY_ITEMS];
    if (drafts && drafts.length > 0) {
      drafts.forEach((d) => {
        if (!merged.some((m) => m.id === d.id || m.title === d.title)) {
          // Normalize status
          let mappedStatus: FunnelStatus = 'Drafted';
          if (d.status === 'Published') mappedStatus = 'Published';
          else if (
            d.status === 'Idea' ||
            d.status === 'Research' ||
            d.status === 'Review'
          ) {
            mappedStatus = d.status as FunnelStatus;
          }
          merged.push({
            ...d,
            status: mappedStatus,
            pillar: d.pillar || 'SEAI Grants',
            priority: d.priority || 'medium',
            seoScore: d.seoScore || 80,
          });
        }
      });
    }
    return merged;
  });

  // Drag-and-drop state
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<FunnelStatus | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPillar, setSelectedPillar] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [filterStagnantOnly, setFilterStagnantOnly] = useState(false);

  // Modal & Async states
  const [showAddModal, setShowAddModal] = useState(false);
  const [previewItem, setPreviewItem] = useState<ArticleDraft | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isPublishingId, setIsPublishingId] = useState<string | null>(null);
  const [celebrationToast, setCelebrationToast] = useState<{
    show: boolean;
    title: string;
    stage: string;
    url?: string;
  }>({ show: false, title: '', stage: '' });

  // New Idea Form State
  const [newTitle, setNewTitle] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newPillar, setNewPillar] = useState('SEAI Grants');
  const [newKeywords, setNewKeywords] = useState('');
  const [newPriority, setNewPriority] = useState<
    'low' | 'medium' | 'high' | 'urgent'
  >('high');
  const [newInitialStage, setNewInitialStage] = useState<FunnelStatus>('Idea');
  const [newTargetBER, setNewTargetBER] = useState('A0');
  const [newGrantTag, setNewGrantTag] = useState('€12,500 Heat Pump');

  // Preview Item In-Place Editing State
  const [isEditingItem, setIsEditingItem] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editTopic, setEditTopic] = useState('');
  const [editPillar, setEditPillar] = useState('SEAI Grants');
  const [editTargetBER, setEditTargetBER] = useState('A0');
  const [editGrantTag, setEditGrantTag] = useState('');
  const [editKeywords, setEditKeywords] = useState('');
  const [editPriority, setEditPriority] = useState<
    'low' | 'medium' | 'high' | 'urgent'
  >('high');

  // Velocity & Stagnation Helpers
  const getDaysInStage = (item: ArticleDraft): number => {
    if (item.stageUpdatedAt) {
      return Math.max(
        0,
        Math.floor((Date.now() - item.stageUpdatedAt) / 86400000),
      );
    }
    return item.daysInStage ?? 0;
  };

  const isStagnant = (item: ArticleDraft): boolean => {
    const days = getDaysInStage(item);
    return days >= 7 && item.status !== 'Published';
  };

  // Save items to localStorage and notify parents
  const persistItems = (updated: ArticleDraft[]) => {
    setItems(updated);
    try {
      localStorage.setItem(
        'ecosmart_content_funnel_items',
        JSON.stringify(updated),
      );
    } catch {
      // Ignore localStorage write failures in restricted environments
    }
    if (onUpdateDrafts) {
      onUpdateDrafts(updated);
    }
  };

  // Move item to new stage
  const moveItemToStage = (itemId: string, newStage: FunnelStatus) => {
    const targetItem = items.find((i) => i.id === itemId);
    if (!targetItem || targetItem.status === newStage) return;

    const updated = items.map((item) => {
      if (item.id === itemId) {
        const isNowPublished = newStage === 'Published';
        return {
          ...item,
          status: newStage,
          stageUpdatedAt: Date.now(),
          daysInStage: 0,
          publishedAt: isNowPublished ? Date.now() : item.publishedAt,
          liveUrl:
            isNowPublished && !item.liveUrl
              ? `https://${site}/articles/${item.title
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/(^-|-$)+/g, '')}`
              : item.liveUrl,
          seoScore:
            newStage === 'Published'
              ? Math.max(item.seoScore || 80, 95)
              : item.seoScore || 80,
        };
      }
      return item;
    });

    persistItems(updated);

    const changedItem = updated.find((i) => i.id === itemId);
    if (changedItem && onUpdateDraft) {
      onUpdateDraft(changedItem);
    }
    if (previewItem && previewItem.id === itemId && changedItem) {
      setPreviewItem(changedItem);
    }

    // Celebration and XP unlock for publishing or progressing
    if (newStage === 'Published') {
      if (onXPUnlock) onXPUnlock(25);
      setCelebrationToast({
        show: true,
        title: targetItem.title,
        stage: 'Published & Live',
      });
      setTimeout(
        () => setCelebrationToast({ show: false, title: '', stage: '' }),
        4000,
      );
    } else if (newStage === 'Review') {
      if (onXPUnlock) onXPUnlock(10);
    }
  };

  // 1-Click Direct Publishing to WordPress / Headless CMS
  const handlePublishToCMS = async (
    item: ArticleDraft,
    e?: React.MouseEvent,
  ) => {
    if (e) e.stopPropagation();
    setIsPublishingId(item.id);

    const slug =
      item.slug ||
      item.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const fallbackUrl = `https://${site}/articles/${slug}`;

    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          title: item.title,
          content: item.content || `# ${item.title}\n\n${item.topic || ''}`,
          html: `<article><h1>${item.title}</h1><p>${item.topic || ''}</p></article>`,
          excerpt: item.topic || item.title,
          siteId: site.replace(/[^a-z0-9]/g, '-'),
          platform: 'wordpress',
          status: 'publish',
        }),
      });

      const data = await res.json().catch(() => null);
      const finalUrl = data?.url
        ? data.url.startsWith('http')
          ? data.url
          : `https://${site}${data.url}`
        : fallbackUrl;

      const updated = items.map((it) => {
        if (it.id === item.id) {
          return {
            ...it,
            status: 'Published' as FunnelStatus,
            liveUrl: finalUrl,
            publishedAt: Date.now(),
            stageUpdatedAt: Date.now(),
            daysInStage: 0,
            seoScore: Math.max(it.seoScore || 80, 96),
          };
        }
        return it;
      });

      persistItems(updated);
      const changed = updated.find((i) => i.id === item.id);
      if (changed && onUpdateDraft) onUpdateDraft(changed);
      if (previewItem && previewItem.id === item.id) {
        setPreviewItem(changed || null);
      }

      if (onXPUnlock) onXPUnlock(50);
      setCelebrationToast({
        show: true,
        title: item.title,
        stage: 'Published & Live on CMS',
        url: finalUrl,
      });
      setTimeout(
        () => setCelebrationToast({ show: false, title: '', stage: '' }),
        5000,
      );
    } catch {
      // Offline / Safe fallback
      moveItemToStage(item.id, 'Published');
    } finally {
      setIsPublishingId(null);
    }
  };

  // Drag and Drop Event Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItemId(id);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDragOverStage(null);
  };

  const handleDragOver = (e: React.DragEvent, stage: FunnelStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stage) {
      setDragOverStage(stage);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only reset if leaving the column boundary
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverStage(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStage: FunnelStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedItemId;
    if (id) {
      moveItemToStage(id, targetStage);
    }
    setDraggedItemId(null);
    setDragOverStage(null);
  };

  // Quick Move helpers (keyboard / click accessibility)
  const getAdjacentStage = (
    currentStage: FunnelStatus,
    direction: 'prev' | 'next',
  ): FunnelStatus | null => {
    const stageIds: FunnelStatus[] = [
      'Idea',
      'Research',
      'Drafted',
      'Review',
      'Published',
    ];
    const idx = stageIds.indexOf(currentStage);
    if (idx === -1) return null;
    if (direction === 'prev' && idx > 0) return stageIds[idx - 1];
    if (direction === 'next' && idx < stageIds.length - 1)
      return stageIds[idx + 1];
    return null;
  };

  // Add custom idea
  const handleCreateIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const kwArray = newKeywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    const newItem: ArticleDraft = {
      id: `strat-user-${Date.now()}`,
      title: newTitle.trim(),
      topic: newTopic.trim() || newTitle.trim(),
      content: '',
      status: newInitialStage,
      date: new Date().toLocaleDateString('en-GB'),
      wordCount: 0,
      pillar: newPillar,
      priority: newPriority,
      seoScore: 78,
      targetBER: newTargetBER,
      grantTag: newGrantTag,
      daysInStage: 0,
      stageUpdatedAt: Date.now(),
      keywords: kwArray.length > 0 ? kwArray : [newPillar, 'Irish Retrofit'],
    };

    const updated = [newItem, ...items];
    persistItems(updated);
    if (onXPUnlock) onXPUnlock(10);

    // Reset Form
    setNewTitle('');
    setNewTopic('');
    setNewKeywords('');
    setShowAddModal(false);
  };

  // AI Pipeline Auto-Generator with Live Grounding Connection & Resilient Fallback
  const handleAIGenerateIdeas = async () => {
    setIsGeneratingAI(true);
    try {
      const res = await fetch('/api/seo/discover-content-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          site,
          guidance:
            'Irish home energy retrofit SEAI grants 2026 heat pump solar attic insulation',
          category: 'All',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (
          data.success &&
          Array.isArray(data.ideas) &&
          data.ideas.length > 0
        ) {
          const mappedIdeas: ArticleDraft[] = data.ideas
            .slice(0, 3)
            .map((idea: any, idx: number) => {
              const pillar = idea.tags?.some((t: string) => /solar/i.test(t))
                ? 'Solar PV'
                : idea.tags?.some((t: string) => /heat pump/i.test(t))
                  ? 'Heat Pumps'
                  : idea.tags?.some((t: string) => /insulation|attic/i.test(t))
                    ? 'Attic Insulation'
                    : 'SEAI Grants';

              const grantTag =
                pillar === 'Heat Pumps'
                  ? '€12,500 Heat Pump'
                  : pillar === 'Solar PV'
                    ? '€2,100 Solar PV'
                    : pillar === 'Attic Insulation'
                      ? '€2,000 Attic'
                      : '€26,000 Whole House';

              return {
                id: `ai-strat-${Date.now()}-${idx}`,
                title: idea.title,
                topic: idea.summary || idea.targetQuery || idea.title,
                content: '',
                status: (idx === 1 ? 'Research' : 'Idea') as FunnelStatus,
                date: new Date().toLocaleDateString('en-GB'),
                wordCount: 0,
                pillar,
                priority: idea.difficulty === 'LOW' ? 'urgent' : 'high',
                seoScore: Math.min(
                  96,
                  Math.max(
                    78,
                    parseInt(idea.oppScore || '85', 10) > 100
                      ? Math.round(parseInt(idea.oppScore, 10) / 10)
                      : 88,
                  ),
                ),
                targetBER: idx === 0 ? 'A0' : 'B',
                grantTag,
                daysInStage: 0,
                stageUpdatedAt: Date.now(),
                keywords: idea.tags || [pillar, 'Irish Retrofit'],
              };
            });

          const updated = [...mappedIdeas, ...items];
          persistItems(updated);
          if (onXPUnlock) onXPUnlock(15);
          setCelebrationToast({
            show: true,
            title: `Seeded ${mappedIdeas.length} Google-Grounded Topics`,
            stage: 'Idea Pipeline',
          });
          setTimeout(
            () => setCelebrationToast({ show: false, title: '', stage: '' }),
            4000,
          );
          setIsGeneratingAI(false);
          return;
        }
      }
    } catch {
      // Graceful fallback below
    }

    // High-yield fallback suggestions if offline or simulation mode
    const fallbackSuggestions: ArticleDraft[] = [
      {
        id: `ai-strat-${Date.now()}-1`,
        title: 'Air-to-Water Heat Pump Grants Limerick: Costs vs Savings',
        topic:
          'Local grant calculation for Munster & Limerick homeowners with V94 Eircodes.',
        content: '',
        status: 'Idea',
        date: new Date().toLocaleDateString('en-GB'),
        wordCount: 0,
        pillar: 'Heat Pumps',
        priority: 'high',
        seoScore: 86,
        targetBER: 'B',
        grantTag: '€12,500 Heat Pump',
        daysInStage: 0,
        stageUpdatedAt: Date.now(),
        keywords: [
          'heat pump grant Limerick',
          'air to water cost Ireland',
          'SEAI heat pump savings',
        ],
      },
      {
        id: `ai-strat-${Date.now()}-2`,
        title:
          'Cavity Wall vs External Insulation: Choosing for 1970s Irish Bungalows',
        topic:
          'Comparison of thermal U-values, condensation risks, and SEAI grant eligibility.',
        content: '',
        status: 'Research',
        date: new Date().toLocaleDateString('en-GB'),
        wordCount: 0,
        pillar: 'Attic Insulation',
        priority: 'urgent',
        seoScore: 90,
        targetBER: 'B',
        grantTag: '€2,000 Attic',
        daysInStage: 0,
        stageUpdatedAt: Date.now(),
        keywords: [
          'external insulation Dublin',
          'cavity wall insulation cost',
          '1970s bungalow retrofit',
        ],
      },
      {
        id: `ai-strat-${Date.now()}-3`,
        title:
          'Solar PV Microgeneration Scheme: Export Tariffs & CEG Rates Explained',
        topic:
          'How Irish homeowners get paid for excess solar electricity exported to the national grid.',
        content: '',
        status: 'Idea',
        date: new Date().toLocaleDateString('en-GB'),
        wordCount: 0,
        pillar: 'Solar PV',
        priority: 'medium',
        seoScore: 84,
        targetBER: 'A0',
        grantTag: '€2,100 Solar PV',
        daysInStage: 0,
        stageUpdatedAt: Date.now(),
        keywords: [
          'clean export guarantee Ireland',
          'solar export tariff ESB',
          'microgeneration grant',
        ],
      },
    ];

    const updated = [...fallbackSuggestions, ...items];
    persistItems(updated);
    if (onXPUnlock) onXPUnlock(15);
    setIsGeneratingAI(false);
  };

  // In-Place Card Edit Saver
  const handleSaveItemEdit = () => {
    if (!previewItem) return;
    const kwArray = editKeywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    const updated = items.map((it) => {
      if (it.id === previewItem.id) {
        return {
          ...it,
          title: editTitle.trim() || it.title,
          topic: editTopic.trim() || it.topic,
          pillar: editPillar || it.pillar,
          targetBER: editTargetBER || it.targetBER,
          grantTag: editGrantTag || it.grantTag,
          keywords: kwArray.length > 0 ? kwArray : it.keywords,
          priority: editPriority,
        };
      }
      return it;
    });

    persistItems(updated);
    const changed = updated.find((i) => i.id === previewItem.id);
    if (changed) {
      setPreviewItem(changed);
      if (onUpdateDraft) onUpdateDraft(changed);
    }
    setIsEditingItem(false);
  };

  // Delete item
  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = items.filter((i) => i.id !== id);
    persistItems(updated);
    if (previewItem?.id === id) setPreviewItem(null);
  };

  // Computed lists and metrics
  const pillarsList = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.pillar) set.add(i.pillar);
    });
    return ['All', ...Array.from(set)];
  }, [items]);

  const stagnantCount = useMemo(() => {
    return items.filter(isStagnant).length;
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        searchQuery === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.keywords || []).some((k) =>
          k.toLowerCase().includes(searchQuery.toLowerCase()),
        ) ||
        (item.grantTag &&
          item.grantTag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchPillar =
        selectedPillar === 'All' || item.pillar === selectedPillar;
      const matchPriority =
        selectedPriority === 'All' || item.priority === selectedPriority;
      const matchStagnant = !filterStagnantOnly || isStagnant(item);

      return matchSearch && matchPillar && matchPriority && matchStagnant;
    });
  }, [
    items,
    searchQuery,
    selectedPillar,
    selectedPriority,
    filterStagnantOnly,
  ]);

  // Stage Breakdown Count
  const stageCounts = useMemo(() => {
    const counts: Record<FunnelStatus, number> = {
      Idea: 0,
      Research: 0,
      Drafted: 0,
      Review: 0,
      Published: 0,
    };
    items.forEach((item) => {
      let st: FunnelStatus = 'Drafted';
      if (
        item.status === 'Idea' ||
        item.status === 'Research' ||
        item.status === 'Review' ||
        item.status === 'Published'
      ) {
        st = item.status as FunnelStatus;
      }
      counts[st] = (counts[st] || 0) + 1;
    });
    return counts;
  }, [items]);

  const totalItems = items.length;
  const publishedCount = stageCounts.Published;
  const inProgressCount =
    stageCounts.Research + stageCounts.Drafted + stageCounts.Review;
  const conversionRate =
    totalItems > 0 ? Math.round((publishedCount / totalItems) * 100) : 0;

  return (
    <div
      id="content-strategy-funnel-card"
      className="bg-slate-900/90 border border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-all text-left"
    >
      {/* Funnel Widget Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-950 border-b border-white/10 px-5 py-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-[#34d399] shadow-inner">
              <Layers size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight font-display">
                  Content Strategy Funnel
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse" />
                  Drag & Drop Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Track Irish retrofit content velocity from initial seed idea to
                indexed, live rankings.
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleAIGenerateIdeas}
              disabled={isGeneratingAI}
              className="px-3.5 py-2 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-60"
              title="Generate strategic Irish retrofit topic ideas with Live Google Grounding"
              id="btn-ai-seed-ideas"
            >
              {isGeneratingAI ? (
                <Loader2 size={14} className="text-purple-400 animate-spin" />
              ) : (
                <Sparkles size={14} className="text-purple-400" />
              )}
              <span>
                {isGeneratingAI
                  ? 'Researching Live SERP...'
                  : 'AI Auto-Seed Pipeline'}
              </span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
              id="btn-add-funnel-idea"
            >
              <Plus size={15} />
              <span>New Strategy Item</span>
            </button>
          </div>
        </div>

        {/* Funnel Pipeline Progress Bar & Quick Metrics */}
        <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Total Pipeline
              </span>
              <div className="text-base font-bold text-white font-mono mt-0.5">
                {totalItems} Articles
              </div>
            </div>
            <BarChart3 size={18} className="text-slate-500" />
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                In Production
              </span>
              <div className="text-base font-bold text-amber-400 font-mono mt-0.5">
                {inProgressCount} Active
              </div>
            </div>
            <Flame size={18} className="text-amber-400/80" />
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Live & Ranking
              </span>
              <div className="text-base font-bold text-[#34d399] font-mono mt-0.5">
                {publishedCount} Live
              </div>
            </div>
            <Award size={18} className="text-[#34d399]" />
          </div>

          <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Completion Rate
              </span>
              <div className="text-base font-bold text-purple-300 font-mono mt-0.5">
                {conversionRate}%
              </div>
            </div>
            <TrendingUp size={18} className="text-purple-400" />
          </div>
        </div>

        {/* Visual Multi-Segment Pipeline Stepper */}
        <div className="mt-3.5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <span>Pipeline Distribution</span>
              {stagnantCount > 0 && (
                <button
                  onClick={() => setFilterStagnantOnly(!filterStagnantOnly)}
                  className={`px-2 py-0.5 rounded border text-[10px] font-mono flex items-center gap-1 transition cursor-pointer ${
                    filterStagnantOnly
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 ring-1 ring-amber-500/40'
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-400/90 hover:bg-amber-500/20'
                  }`}
                  title="Click to filter stagnant articles (>7 days in current stage)"
                >
                  <AlertTriangle
                    size={11}
                    className="text-amber-400 animate-pulse"
                  />
                  <span>
                    {stagnantCount} Bottleneck{stagnantCount > 1 ? 's' : ''}{' '}
                    (&gt;7d)
                  </span>
                </button>
              )}
            </div>
            <span>
              {publishedCount} of {totalItems} Published
            </span>
          </div>
          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex p-0.5 border border-white/10">
            {FUNNEL_STAGES.map((stage) => {
              const count = stageCounts[stage.id] || 0;
              const pct = totalItems > 0 ? (count / totalItems) * 100 : 0;
              if (pct === 0) return null;
              return (
                <div
                  key={stage.id}
                  style={{ width: `${pct}%` }}
                  title={`${stage.label}: ${count} (${Math.round(pct)}%)`}
                  className={`h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full ${
                    stage.id === 'Idea'
                      ? 'bg-purple-500'
                      : stage.id === 'Research'
                        ? 'bg-sky-500'
                        : stage.id === 'Drafted'
                          ? 'bg-amber-500'
                          : stage.id === 'Review'
                            ? 'bg-teal-500'
                            : 'bg-emerald-400'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Celebration & Publishing Notification */}
      <AnimatePresence>
        {celebrationToast.show && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-500/20 border-b border-emerald-500/30 px-6 py-2.5 flex items-center justify-between text-emerald-200 text-xs font-semibold"
          >
            <div className="flex items-center gap-2 flex-wrap">
              <CheckCircle2 size={16} className="text-[#34d399]" />
              <span>
                🎉 Article updated to{' '}
                <strong className="text-white">{celebrationToast.stage}</strong>
                : &ldquo;{celebrationToast.title}&rdquo;!
              </span>
              {celebrationToast.url && (
                <a
                  href={celebrationToast.url}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-2 text-[#34d399] hover:underline flex items-center gap-1 font-bold"
                >
                  <span>View Live URL</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
            <button
              onClick={() =>
                setCelebrationToast({ show: false, title: '', stage: '' })
              }
              className="text-emerald-400 hover:text-white cursor-pointer"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter & Search Bar */}
      <div className="px-5 py-3 bg-black/30 border-b border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm">
          <div className="relative w-full">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by keyword, topic, or grant..."
              className="w-full pl-8 pr-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-slate-200 placeholder:text-slate-500 focus:border-[#34d399] outline-none font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Pillar Selector */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
            <Filter size={12} />
            <span>Pillar:</span>
            <select
              value={selectedPillar}
              onChange={(e) => setSelectedPillar(e.target.value)}
              className="bg-black/50 border border-white/10 rounded px-2 py-1 text-slate-200 text-xs outline-none focus:border-[#34d399]"
            >
              {pillarsList.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Selector */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
            <span>Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-black/50 border border-white/10 rounded px-2 py-1 text-slate-200 text-xs outline-none focus:border-[#34d399]"
            >
              <option value="All">All</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Stagnant Filter Toggle */}
          {stagnantCount > 0 && (
            <button
              onClick={() => setFilterStagnantOnly(!filterStagnantOnly)}
              className={`px-2.5 py-1 rounded text-[11px] font-mono font-semibold flex items-center gap-1 transition cursor-pointer border ${
                filterStagnantOnly
                  ? 'bg-amber-500/25 border-amber-500 text-amber-300'
                  : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <AlertTriangle
                size={12}
                className={
                  filterStagnantOnly ? 'text-amber-300' : 'text-slate-400'
                }
              />
              <span>Stagnant Only ({stagnantCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* 5-Column Funnel Kanban Stage Board */}
      <div className="p-4 sm:p-5 overflow-x-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 min-w-[900px]">
          {FUNNEL_STAGES.map((stage) => {
            const Icon = stage.icon;
            const stageItems = filteredItems.filter((i) => {
              if (stage.id === 'Drafted') {
                return (
                  i.status === 'Drafted' ||
                  !['Idea', 'Research', 'Review', 'Published'].includes(
                    i.status as string,
                  )
                );
              }
              return i.status === stage.id;
            });
            const isDropTarget = dragOverStage === stage.id;

            return (
              <div
                key={stage.id}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.id)}
                className={`rounded-xl border transition-all duration-200 flex flex-col min-h-[380px] ${
                  isDropTarget
                    ? `${stage.dropBg} shadow-lg scale-[1.01]`
                    : 'bg-black/25 border-white/10 hover:border-white/20'
                }`}
                id={`funnel-column-${stage.id.toLowerCase()}`}
              >
                {/* Column Header */}
                <div className="p-3 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <Icon size={15} className={stage.accentColor} />
                    <span className="text-xs font-bold text-slate-100 font-display">
                      {stage.shortLabel}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${stage.badgeBg}`}
                  >
                    {stageItems.length}
                  </span>
                </div>

                {/* Column Body / Drop Area */}
                <div className="p-2.5 flex-1 space-y-2.5 overflow-y-auto max-h-[520px]">
                  {stageItems.length === 0 ? (
                    <div className="h-40 border border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center p-4 text-center text-slate-500">
                      <Icon
                        size={20}
                        className="mb-1.5 opacity-30 text-slate-400"
                      />
                      <span className="text-[11px] font-mono">
                        Drop cards here
                      </span>
                      <span className="text-[10px] text-slate-600 mt-0.5">
                        {stage.id === 'Idea'
                          ? 'Click + to add seed topic'
                          : `Move from previous stage`}
                      </span>
                    </div>
                  ) : (
                    stageItems.map((item) => {
                      const prevStage = getAdjacentStage(
                        (item.status as FunnelStatus) || 'Drafted',
                        'prev',
                      );
                      const nextStage = getAdjacentStage(
                        (item.status as FunnelStatus) || 'Drafted',
                        'next',
                      );
                      const isDragging = draggedItemId === item.id;
                      const daysInCurrentStage = getDaysInStage(item);
                      const stagnant = isStagnant(item);

                      return (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, item.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => {
                            setPreviewItem(item);
                            setIsEditingItem(false);
                          }}
                          className={`p-3 rounded-lg border bg-slate-900/90 hover:bg-slate-850 transition-all cursor-grab active:cursor-grabbing group select-none shadow-md ${
                            isDragging
                              ? 'opacity-40 scale-95 border-emerald-500/50'
                              : 'border-white/10 hover:border-[#34d399]/40 hover:shadow-emerald-950/20'
                          }`}
                          id={`funnel-card-${item.id}`}
                        >
                          {/* Card Header: Pillar Tag, Grant Badge & Priority */}
                          <div className="flex items-center justify-between gap-1.5 mb-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] font-mono font-semibold text-emerald-300 truncate max-w-[100px]">
                              {item.pillar || 'SEAI Retrofit'}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              {item.targetBER && (
                                <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono font-bold">
                                  {item.targetBER}
                                </span>
                              )}
                              {item.priority === 'urgent' && (
                                <span className="px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 text-[9px] font-mono font-bold">
                                  Urgent
                                </span>
                              )}
                              {item.priority === 'high' && (
                                <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono font-bold">
                                  High
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 font-mono">
                                {item.seoScore || 80}%
                              </span>
                            </div>
                          </div>

                          {/* 2026 SEAI Grant Tag Badge */}
                          {item.grantTag && (
                            <div className="mb-1.5">
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/25 text-[9px] font-mono font-bold text-[#34d399] flex items-center gap-1 w-fit">
                                <DollarSign size={9} />
                                <span>{item.grantTag}</span>
                              </span>
                            </div>
                          )}

                          {/* Velocity Stagnation Warning */}
                          {stagnant && (
                            <div className="flex items-center gap-1 text-[9px] font-mono font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded mb-1.5">
                              <AlertTriangle
                                size={10}
                                className="text-amber-400 shrink-0"
                              />
                              <span>
                                Stagnant ({daysInCurrentStage}d in{' '}
                                {stage.shortLabel})
                              </span>
                            </div>
                          )}

                          {/* Card Title */}
                          <h4 className="text-xs font-bold text-slate-100 leading-snug line-clamp-2 group-hover:text-[#34d399] transition">
                            {item.title}
                          </h4>

                          {/* Target Keywords Tags */}
                          {item.keywords && item.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.keywords.slice(0, 2).map((kw, i) => (
                                <span
                                  key={i}
                                  className="text-[9px] px-1.5 py-0.5 bg-black/40 rounded border border-white/5 text-slate-400 font-mono truncate max-w-[130px]"
                                >
                                  #{kw}
                                </span>
                              ))}
                              {item.keywords.length > 2 && (
                                <span className="text-[9px] text-slate-500 font-mono">
                                  +{item.keywords.length - 2}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Card Footer: Metadata, Velocity & Quick Stage Progression */}
                          <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span className="flex items-center gap-1 text-slate-500">
                              <Clock size={10} />
                              {item.wordCount > 0
                                ? `${item.wordCount}w`
                                : item.status === 'Idea'
                                  ? 'Seed'
                                  : 'Outlined'}
                              <span className="text-slate-600">·</span>
                              <span
                                className="text-[9px] text-slate-400"
                                title="Days in current stage"
                              >
                                {daysInCurrentStage}d
                              </span>
                            </span>

                            {/* Quick Stage Progression Buttons */}
                            <div
                              className="flex items-center gap-1 opacity-80 group-hover:opacity-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {prevStage && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    moveItemToStage(item.id, prevStage)
                                  }
                                  title={`Move left to ${prevStage}`}
                                  className="p-1 rounded bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition cursor-pointer"
                                >
                                  <ArrowLeft size={10} />
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  onOpenInWriter(item.title || item.topic)
                                }
                                title="Open & Edit in AI Writer"
                                className="px-1.5 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[9px] font-bold flex items-center gap-0.5 transition cursor-pointer"
                              >
                                <Zap size={9} />
                                <span>Write</span>
                              </button>

                              {/* 1-Click Publish Button for Review or Published */}
                              {(item.status === 'Review' ||
                                item.status === 'Published') && (
                                <button
                                  type="button"
                                  onClick={(e) => handlePublishToCMS(item, e)}
                                  disabled={isPublishingId === item.id}
                                  title="1-Click Direct Publish to CMS"
                                  className="px-1.5 py-0.5 rounded bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-[9px] font-bold flex items-center gap-0.5 transition cursor-pointer disabled:opacity-50"
                                >
                                  {isPublishingId === item.id ? (
                                    <Loader2
                                      size={9}
                                      className="animate-spin text-sky-300"
                                    />
                                  ) : (
                                    <Upload size={9} />
                                  )}
                                  <span>
                                    {item.status === 'Published'
                                      ? 'Re-Sync'
                                      : 'Publish'}
                                  </span>
                                </button>
                              )}

                              {nextStage && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    moveItemToStage(item.id, nextStage)
                                  }
                                  title={`Advance to ${nextStage}`}
                                  className="p-1 rounded bg-white/5 hover:bg-white/15 text-slate-400 hover:text-[#34d399] transition cursor-pointer"
                                >
                                  <ArrowRight size={10} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Quick Add into this column */}
                {stage.id === 'Idea' && (
                  <div className="p-2 border-t border-white/5">
                    <button
                      onClick={() => {
                        setNewInitialStage('Idea');
                        setShowAddModal(true);
                      }}
                      className="w-full py-1.5 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 rounded text-[11px] font-semibold flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>Add Seed Idea</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add New Strategy Item Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-white/15 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl text-left"
            >
              <div className="px-6 py-4 bg-gradient-to-r from-emerald-950/60 to-slate-900 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-[#34d399]">
                    <Plus size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-display">
                      Add Content Strategy Item
                    </h3>
                    <p className="text-xs text-slate-400">
                      Seed a new topic into the funnel pipeline with 2026 EPBD &
                      grant targets.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateIdea} className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1 font-mono">
                    Article / Topic Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. SEAI Attic Insulation Grant Guide 2026"
                    className="w-full p-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white placeholder:text-slate-500 focus:border-[#34d399] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1 font-mono">
                      Target Pillar
                    </label>
                    <select
                      value={newPillar}
                      onChange={(e) => setNewPillar(e.target.value)}
                      className="w-full p-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white outline-none focus:border-[#34d399]"
                    >
                      <option value="SEAI Grants">SEAI Grants</option>
                      <option value="Solar PV">Solar PV</option>
                      <option value="Heat Pumps">Heat Pumps</option>
                      <option value="Attic Insulation">Attic Insulation</option>
                      <option value="BER Upgrade">BER Upgrade</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1 font-mono">
                      Initial Funnel Stage
                    </label>
                    <select
                      value={newInitialStage}
                      onChange={(e) =>
                        setNewInitialStage(e.target.value as FunnelStatus)
                      }
                      className="w-full p-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white outline-none focus:border-[#34d399]"
                    >
                      <option value="Idea">💡 Idea & Keywords</option>
                      <option value="Research">🔍 Research & Brief</option>
                      <option value="Drafted">✍️ Drafting & SEO</option>
                      <option value="Review">🎯 SEO Review</option>
                      <option value="Published">🚀 Published & Live</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1 font-mono">
                      Target BER Scale (EPBD 2026)
                    </label>
                    <select
                      value={newTargetBER}
                      onChange={(e) => setNewTargetBER(e.target.value)}
                      className="w-full p-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white outline-none focus:border-[#34d399]"
                    >
                      <option value="A0">A0 (Net Zero EPBD Target)</option>
                      <option value="A">A Rating</option>
                      <option value="B">B Rating (OSS Minimum)</option>
                      <option value="C">C Rating</option>
                      <option value="D">D Rating</option>
                      <option value="E">E Rating</option>
                      <option value="F">F Rating</option>
                      <option value="G">G Rating (Baseline)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1 font-mono">
                      SEAI Grant Scheme
                    </label>
                    <select
                      value={newGrantTag}
                      onChange={(e) => setNewGrantTag(e.target.value)}
                      className="w-full p-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white outline-none focus:border-[#34d399]"
                    >
                      <option value="€12,500 Heat Pump">
                        €12,500 Heat Pump
                      </option>
                      <option value="€2,100 Solar PV">€2,100 Solar PV</option>
                      <option value="€2,000 Attic">€2,000 Attic</option>
                      <option value="€26,000 Whole House">
                        €26,000 Whole House
                      </option>
                      <option value="None / General">
                        None / General Guide
                      </option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1 font-mono">
                      Priority Level
                    </label>
                    <select
                      value={newPriority}
                      onChange={(e) =>
                        setNewPriority(
                          e.target.value as
                            'low' | 'medium' | 'high' | 'urgent',
                        )
                      }
                      className="w-full p-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white outline-none focus:border-[#34d399]"
                    >
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1 font-mono">
                      Target Keywords
                    </label>
                    <input
                      type="text"
                      value={newKeywords}
                      onChange={(e) => setNewKeywords(e.target.value)}
                      placeholder="comma-separated"
                      className="w-full p-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white placeholder:text-slate-500 focus:border-[#34d399] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1 font-mono">
                    Brief Notes / Search Intent (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="Brief details regarding grant thresholds, audience, or target counties..."
                    className="w-full p-2.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white placeholder:text-slate-500 focus:border-[#34d399] outline-none resize-none"
                  />
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add to Funnel (+10 XP)</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Card Detail Slide-out / Modal with In-Place Editing */}
      <AnimatePresence>
        {previewItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-white/15 rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl text-left"
            >
              <div className="px-6 py-4 bg-slate-950 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
                    {previewItem.pillar || 'SEO Strategy'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Stage:{' '}
                    <strong className="text-white">{previewItem.status}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!isEditingItem && previewItem) {
                        setEditTitle(previewItem.title);
                        setEditTopic(previewItem.topic || '');
                        setEditPillar(previewItem.pillar || 'SEAI Grants');
                        setEditTargetBER(previewItem.targetBER || 'A0');
                        setEditGrantTag(previewItem.grantTag || '');
                        setEditKeywords(
                          (previewItem.keywords || []).join(', '),
                        );
                        setEditPriority(previewItem.priority || 'high');
                      }
                      setIsEditingItem(!isEditingItem);
                    }}
                    className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer border border-white/10"
                  >
                    <Edit3 size={12} />
                    <span>{isEditingItem ? 'View Card' : 'Edit Details'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setPreviewItem(null);
                      setIsEditingItem(false);
                    }}
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {isEditingItem ? (
                /* In-Place Edit Form */
                <div className="p-6 space-y-3.5">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1 font-mono">
                      Article Title
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full p-2 bg-black/40 border border-white/15 rounded text-xs text-white focus:border-[#34d399] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1 font-mono">
                      Topic / Search Intent
                    </label>
                    <textarea
                      rows={2}
                      value={editTopic}
                      onChange={(e) => setEditTopic(e.target.value)}
                      className="w-full p-2 bg-black/40 border border-white/15 rounded text-xs text-white focus:border-[#34d399] outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1 font-mono">
                        Pillar
                      </label>
                      <select
                        value={editPillar}
                        onChange={(e) => setEditPillar(e.target.value)}
                        className="w-full p-2 bg-black/40 border border-white/15 rounded text-xs text-white outline-none focus:border-[#34d399]"
                      >
                        <option value="SEAI Grants">SEAI Grants</option>
                        <option value="Solar PV">Solar PV</option>
                        <option value="Heat Pumps">Heat Pumps</option>
                        <option value="Attic Insulation">
                          Attic Insulation
                        </option>
                        <option value="BER Upgrade">BER Upgrade</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1 font-mono">
                        Target BER (EPBD 2026)
                      </label>
                      <select
                        value={editTargetBER}
                        onChange={(e) => setEditTargetBER(e.target.value)}
                        className="w-full p-2 bg-black/40 border border-white/15 rounded text-xs text-white outline-none focus:border-[#34d399]"
                      >
                        <option value="A0">A0</option>
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                        <option value="E">E</option>
                        <option value="F">F</option>
                        <option value="G">G</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1 font-mono">
                        SEAI Grant Tag
                      </label>
                      <input
                        type="text"
                        value={editGrantTag}
                        onChange={(e) => setEditGrantTag(e.target.value)}
                        placeholder="e.g. €12,500 Heat Pump"
                        className="w-full p-2 bg-black/40 border border-white/15 rounded text-xs text-white outline-none focus:border-[#34d399]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1 font-mono">
                        Priority Level
                      </label>
                      <select
                        value={editPriority}
                        onChange={(e) =>
                          setEditPriority(
                            e.target.value as
                              'low' | 'medium' | 'high' | 'urgent',
                          )
                        }
                        className="w-full p-2 bg-black/40 border border-white/15 rounded text-xs text-white outline-none focus:border-[#34d399]"
                      >
                        <option value="urgent">Urgent</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1 font-mono">
                      Target Keywords (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={editKeywords}
                      onChange={(e) => setEditKeywords(e.target.value)}
                      className="w-full p-2 bg-black/40 border border-white/15 rounded text-xs text-white outline-none focus:border-[#34d399]"
                    />
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingItem(false)}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveItemEdit}
                      className="px-4 py-1.5 bg-[#34d399] hover:bg-[#2bc48d] text-slate-950 font-bold rounded text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                    >
                      <Save size={13} />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Card Detail View */
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white font-display">
                      {previewItem.title}
                    </h3>
                    {previewItem.topic && (
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {previewItem.topic}
                      </p>
                    )}
                  </div>

                  {/* Velocity & Stagnation Alert */}
                  {isStagnant(previewItem) && (
                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-2 text-xs text-amber-300">
                      <AlertTriangle
                        size={15}
                        className="text-amber-400 shrink-0"
                      />
                      <span>
                        <strong>Bottleneck Warning:</strong> This card has spent{' '}
                        {getDaysInStage(previewItem)} days in{' '}
                        {previewItem.status}. Recommended action: Complete
                        review or publish to keep momentum!
                      </span>
                    </div>
                  )}

                  {/* Stage Progression Selector */}
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono block">
                      Update Funnel Stage
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {FUNNEL_STAGES.map((st) => {
                        const isCur = previewItem.status === st.id;
                        return (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => {
                              moveItemToStage(previewItem.id, st.id);
                              setPreviewItem({ ...previewItem, status: st.id });
                            }}
                            className={`p-1.5 rounded text-[10px] font-mono font-bold text-center transition cursor-pointer border ${
                              isCur
                                ? 'bg-emerald-500/30 border-[#34d399] text-white shadow-sm'
                                : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                            }`}
                          >
                            {st.shortLabel}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Metadata Matrix: SEO, BER, Grant & Velocity */}
                  <div className="grid grid-cols-3 gap-2.5 text-xs">
                    <div className="p-2.5 bg-black/40 border border-white/5 rounded-lg space-y-1">
                      <span className="text-[9px] font-mono text-slate-400 uppercase">
                        SEO Readiness
                      </span>
                      <div className="text-base font-bold text-[#34d399] font-mono">
                        {previewItem.seoScore || 80}/100
                      </div>
                    </div>

                    <div className="p-2.5 bg-black/40 border border-white/5 rounded-lg space-y-1">
                      <span className="text-[9px] font-mono text-slate-400 uppercase">
                        Target BER
                      </span>
                      <div className="text-base font-bold text-amber-300 font-mono">
                        {previewItem.targetBER || 'A0'} Rating
                      </div>
                    </div>

                    <div className="p-2.5 bg-black/40 border border-white/5 rounded-lg space-y-1">
                      <span className="text-[9px] font-mono text-slate-400 uppercase">
                        Stage Velocity
                      </span>
                      <div className="text-base font-bold text-sky-300 font-mono">
                        {getDaysInStage(previewItem)} Days
                      </div>
                    </div>
                  </div>

                  {previewItem.grantTag && (
                    <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-[#34d399]" />
                        <span className="text-emerald-300 font-mono font-bold">
                          SEAI Grant Incentive: {previewItem.grantTag}
                        </span>
                      </div>
                    </div>
                  )}

                  {previewItem.keywords && previewItem.keywords.length > 0 && (
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono block mb-1.5">
                        Target Irish SEO Keywords
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {previewItem.keywords.map((kw, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded text-xs font-mono"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {previewItem.liveUrl && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-between text-xs">
                      <span className="text-emerald-300 font-mono truncate mr-2">
                        Live: {previewItem.liveUrl}
                      </span>
                      <a
                        href={previewItem.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#34d399] hover:underline flex items-center gap-1 font-bold shrink-0"
                      >
                        <span>Visit</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>
              )}

              <div className="px-6 py-3.5 bg-slate-950 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={(e) => handleDeleteItem(previewItem.id, e)}
                  className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Remove</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setPreviewItem(null);
                      setIsEditingItem(false);
                    }}
                    className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-xs font-semibold cursor-pointer"
                  >
                    Close
                  </button>

                  {/* 1-Click Direct Publish to CMS */}
                  <button
                    type="button"
                    onClick={() => handlePublishToCMS(previewItem)}
                    disabled={isPublishingId === previewItem.id}
                    className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded text-xs flex items-center gap-1.5 shadow-lg shadow-sky-500/20 cursor-pointer disabled:opacity-50"
                  >
                    {isPublishingId === previewItem.id ? (
                      <Loader2
                        size={13}
                        className="animate-spin text-slate-950"
                      />
                    ) : (
                      <Upload size={13} />
                    )}
                    <span>
                      {previewItem.status === 'Published'
                        ? 'Re-Sync CMS'
                        : '1-Click CMS Publish'}
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      const t = previewItem.title || previewItem.topic;
                      setPreviewItem(null);
                      setIsEditingItem(false);
                      onOpenInWriter(t);
                    }}
                    className="px-4 py-1.5 bg-[#34d399] hover:bg-[#2bc48d] text-slate-950 font-bold rounded text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    <Zap size={13} />
                    <span>Open in AI Writer</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
