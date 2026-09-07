import { ArticleDraft } from '../types';

export type SearchCategory = 'all' | 'draft' | 'keyword' | 'audit' | 'nav';

export interface SearchMetric {
  label: string;
  value: string | number;
}

export interface GlobalSearchResult {
  id: string;
  category: 'draft' | 'keyword' | 'audit' | 'nav';
  title: string;
  subtitle?: string;
  snippet?: string;
  targetTab: string;
  actionPayload?: {
    topic?: string;
    keyword?: string;
    tab?: string;
    filter?: string;
    item?: unknown;
  };
  badge: {
    label: string;
    variant: 'emerald' | 'amber' | 'indigo' | 'sky' | 'rose' | 'slate';
  };
  metrics?: SearchMetric[];
  score?: number;
  isSuggested?: boolean;
  suggestedSection?: 'recent_draft' | 'frequent_nav';
}

// ─────────────────────────────────────────────────────────────────────────────
// Seed Data: Keyword Research Results
// ─────────────────────────────────────────────────────────────────────────────
const SEED_KEYWORDS: Array<{
  keyword: string;
  volume: number;
  difficulty: number;
  intent: string;
  relevance: string;
  cluster: string;
}> = [
  {
    keyword: 'SEAI grants Limerick V94',
    volume: 2400,
    difficulty: 34,
    intent: 'Commercial',
    relevance: 'High',
    cluster: 'Grants & Subsidies',
  },
  {
    keyword: 'BER rating Ireland A0 to G',
    volume: 5400,
    difficulty: 42,
    intent: 'Informational',
    relevance: 'High',
    cluster: 'BER Scale 2026',
  },
  {
    keyword: 'Air to water heat pump grant 2026',
    volume: 3600,
    difficulty: 48,
    intent: 'Transactional',
    relevance: 'High',
    cluster: 'Heat Pumps',
  },
  {
    keyword: 'Home insulation grant Raheen',
    volume: 880,
    difficulty: 22,
    intent: 'Local SEO',
    relevance: 'High',
    cluster: 'Limerick V94',
  },
  {
    keyword: 'Attic insulation costs Dublin',
    volume: 1900,
    difficulty: 38,
    intent: 'Commercial',
    relevance: 'Medium',
    cluster: 'Insulation',
  },
  {
    keyword: 'Solar PV grants Ireland 2026',
    volume: 4100,
    difficulty: 45,
    intent: 'Commercial',
    relevance: 'High',
    cluster: 'Solar Energy',
  },
  {
    keyword: 'One Stop Shop deep retrofit grant',
    volume: 2900,
    difficulty: 51,
    intent: 'Commercial',
    relevance: 'High',
    cluster: 'Deep Retrofit',
  },
  {
    keyword: 'Heat pump electricity tariff Ireland',
    volume: 1650,
    difficulty: 29,
    intent: 'Informational',
    relevance: 'Medium',
    cluster: 'Energy Tariffs',
  },
  {
    keyword: 'Cavity wall insulation Cork',
    volume: 720,
    difficulty: 19,
    intent: 'Local SEO',
    relevance: 'Medium',
    cluster: 'Munster Retrofit',
  },
  {
    keyword: 'Ventilation MVHR building regulations Ireland',
    volume: 1100,
    difficulty: 36,
    intent: 'Informational',
    relevance: 'Medium',
    cluster: 'Indoor Air Quality',
  },
  {
    keyword: 'External wall insulation SEAI subsidy',
    volume: 2100,
    difficulty: 44,
    intent: 'Commercial',
    relevance: 'High',
    cluster: 'Wall Insulation',
  },
  {
    keyword: 'Heat pump running costs winter Ireland',
    volume: 2800,
    difficulty: 39,
    intent: 'Informational',
    relevance: 'High',
    cluster: 'Heating Economics',
  },
  {
    keyword: 'Budget 2026 €558m SEAI energy package',
    volume: 1450,
    difficulty: 31,
    intent: 'Informational',
    relevance: 'High',
    cluster: 'Policy Updates',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Seed Data: Site Audit Logs & Diagnostics
// ─────────────────────────────────────────────────────────────────────────────
const SEED_AUDIT_LOGS: Array<{
  id: string;
  title: string;
  severity: 'High' | 'Medium' | 'Low';
  status: 'Resolved' | 'Passed' | 'Active' | 'Validated' | 'Warning';
  desc: string;
  category: string;
  targetTab: string;
}> = [
  {
    id: 'audit-1',
    title: 'XML Sitemap Configuration (/sitemap.xml)',
    severity: 'High',
    status: 'Resolved',
    desc: 'Sitemap referenced correctly at /sitemap.xml with 24 valid canonical URLs.',
    category: 'Crawlability',
    targetTab: 'audit',
  },
  {
    id: 'audit-2',
    title: 'LocalBusiness & ProfessionalService JSON-LD Schema',
    severity: 'Medium',
    status: 'Validated',
    desc: 'Organization, LocalBusiness, and FAQPage schemas active in index head with V94 coordinates.',
    category: 'Structured Data',
    targetTab: 'audit',
  },
  {
    id: 'audit-3',
    title: 'Heat Pump Image Alt Text & Accessibility',
    severity: 'Low',
    status: 'Resolved',
    desc: 'All 4 heat pump and solar PV diagram images updated with descriptive SEAI-optimized alt tags.',
    category: 'Accessibility',
    targetTab: 'audit',
  },
  {
    id: 'audit-4',
    title: 'Core Web Vitals - LCP 0.4s & INP 28ms',
    severity: 'High',
    status: 'Passed',
    desc: 'Largest Contentful Paint scored 98/100, well under the 2.5s threshold with zero layout shift (CLS: 0.01).',
    category: 'Performance',
    targetTab: 'audit',
  },
  {
    id: 'audit-5',
    title: 'Robots.txt Directive & Crawl Budget Verification',
    severity: 'High',
    status: 'Validated',
    desc: 'Robots.txt allows Googlebot and Bingbot indexing; no unintended disallow rules on article paths.',
    category: 'Indexation',
    targetTab: 'audit',
  },
  {
    id: 'audit-6',
    title: 'Broken Links & 404/301 Redirect Loop Scan',
    severity: 'Medium',
    status: 'Resolved',
    desc: '0 broken internal links and 0 redirect chains found across 24 crawled assets on ecosmarthomes.ie.',
    category: 'Link Health',
    targetTab: 'audit',
  },
  {
    id: 'audit-7',
    title: 'Self-Referencing rel="canonical" Tag Verification',
    severity: 'Medium',
    status: 'Active',
    desc: 'Canonical tags properly declared on all 5 pillar articles to prevent duplicate content penalties.',
    category: 'SEO Hygiene',
    targetTab: 'audit',
  },
  {
    id: 'audit-8',
    title: 'OpenGraph & Twitter Card Metadata',
    severity: 'Low',
    status: 'Passed',
    desc: 'og:title, og:description, and og:image present for rich SERP snippet generation.',
    category: 'Social Signals',
    targetTab: 'audit',
  },
  {
    id: 'audit-9',
    title: 'Mobile Viewport & 44px Touch Target Compliance',
    severity: 'Medium',
    status: 'Passed',
    desc: 'Responsive viewport meta tag validated; all interactive buttons meet WCAG 44px touch targets.',
    category: 'Mobile UX',
    targetTab: 'audit',
  },
  {
    id: 'audit-10',
    title: 'SSL/TLS Security Certificate & HSTS Headers',
    severity: 'High',
    status: 'Resolved',
    desc: 'Full HTTPS enforcement with Strict-Transport-Security (HSTS max-age=31536000) and TLS 1.3 encryption.',
    category: 'Security',
    targetTab: 'audit',
  },
  {
    id: 'audit-11',
    title: 'Live Googlebot-Mobile Crawl Heartbeat',
    severity: 'Low',
    status: 'Active',
    desc: 'Googlebot-Mobile crawler accessed article schemas with 200 OK status code.',
    category: 'Live Crawler',
    targetTab: 'crawler',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Seed Data: Dashboard Navigation Targets
// ─────────────────────────────────────────────────────────────────────────────
const DASHBOARD_NAV_TARGETS: Array<{
  id: string;
  title: string;
  subtitle: string;
  snippet: string;
  targetTab: string;
  badgeLabel: string;
  isFrequent?: boolean;
}> = [
  {
    id: 'nav-overview',
    title: 'SEO Dashboard & Pillar Health',
    subtitle: 'Main Executive Overview',
    snippet: 'Pillar readiness score, weekly challenge progress, and SEO heatmap.',
    targetTab: 'dashboard',
    badgeLabel: 'Main View',
    isFrequent: true,
  },
  {
    id: 'nav-writer',
    title: 'AI Writer & Content Generator',
    subtitle: 'Studio Content Engine',
    snippet: 'Draft, optimize, and polish SEAI & BER energy upgrade articles with AI.',
    targetTab: 'writer',
    badgeLabel: 'AI Studio',
    isFrequent: true,
  },
  {
    id: 'nav-keywords',
    title: 'Keyword Research & SERP Explorer',
    subtitle: 'Search Intent Intelligence',
    snippet: 'Explore volume, difficulty, and competitive clusters across Ireland & Munster.',
    targetTab: 'keywords',
    badgeLabel: 'SEO Tool',
    isFrequent: true,
  },
  {
    id: 'nav-serp',
    title: 'SERP Analyzer & Competitor Diff',
    subtitle: 'Rank Tracking & Competitor Analysis',
    snippet: 'Analyze top 10 search ranking snippets and identify competitive content gaps.',
    targetTab: 'serp',
    badgeLabel: 'Analytics',
  },
  {
    id: 'nav-audit',
    title: 'Site Health & Sitemap Crawler',
    subtitle: 'Technical Audit & Diagnostics',
    snippet: 'Scan XML sitemaps, inspect Core Web Vitals, and verify technical SEO integrity.',
    targetTab: 'audit',
    badgeLabel: 'Technical',
    isFrequent: true,
  },
  {
    id: 'nav-library',
    title: 'Content Library & Repository',
    subtitle: 'Drafts, Articles & Bait Assets',
    snippet: 'Manage your portfolio of drafted, published, and scheduled retrofit articles.',
    targetTab: 'content_library',
    badgeLabel: 'Repository',
    isFrequent: true,
  },
  {
    id: 'nav-ideas',
    title: 'Content Ideas Discovery',
    subtitle: 'Topic Modeling & Gap Analysis',
    snippet: 'Generate high-intent content topics based on seasonal SEAI retrofit trends.',
    targetTab: 'content_ideas',
    badgeLabel: 'Ideation',
  },
  {
    id: 'nav-links',
    title: 'Internal & External Link Builder',
    subtitle: 'Link Graph & Authority Meshing',
    snippet: 'Build structured internal linking clusters to funnel link equity to pillar pages.',
    targetTab: 'link_builder',
    badgeLabel: 'Authority',
  },
  {
    id: 'nav-crawler',
    title: 'Live Crawler & Harbor Sync',
    subtitle: 'Autonomous Agent Telemetry',
    snippet: 'Real-time telemetry, automated publishing queue, and crawler event streams.',
    targetTab: 'crawler',
    badgeLabel: 'Live Sync',
    isFrequent: true,
  },
  {
    id: 'nav-marl',
    title: 'MARL Multi-Agent Reinforcement Learning',
    subtitle: 'Autonomous Consensus Engine',
    snippet: 'Multi-agent RL policies, genome evolution, and negotiation cycles.',
    targetTab: 'p7_marl',
    badgeLabel: 'AI Engine',
  },
  {
    id: 'nav-grants',
    title: 'SEAI Grant Planner & Eligibility Flow',
    subtitle: 'Grant Estimator (Budget 2026)',
    snippet: 'Calculate €50,000 deep retrofit grants and heat pump subsidies for Irish homes.',
    targetTab: 'p23_grants',
    badgeLabel: 'Grants Flow',
    isFrequent: true,
  },
  {
    id: 'nav-portal',
    title: 'Homeowner Retrofit Journey Portal',
    subtitle: 'Interactive Homeowner Experience',
    snippet: 'Step-by-step guidance from G rating to A-rated energy positive living.',
    targetTab: 'p32_journey',
    badgeLabel: 'Portal',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Default Content Drafts Fallback
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_CONTENT_DRAFTS: ArticleDraft[] = [
  {
    id: 'draft_init_1',
    title: 'Retrofitting Homes in Ireland: SEAI Grants Explained',
    topic: 'Understanding SEAI grant schemes for heat pump installations and attic insulation.',
    keywords: [
      'SEAI grants Limerick V94',
      'home insulation Raheen',
      'BER rating Limerick',
      'heat pump installation Castletroy',
    ],
    content:
      'Upgrading your home in Limerick and the V94 Eircode region is very important. Many homeowners in Castletroy, Raheen, and Dooradoyle want to save money on heating bills...',
    status: 'Drafted',
    date: '18/07/2026',
    wordCount: 94,
    tone: 'Authoritative',
  },
  {
    id: 'draft_init_2',
    title: 'Attic Insulation & Raising BER Ratings',
    topic: "How attic insulation improves your home's thermal efficiency and boosts its overall BER letter rating.",
    keywords: [
      'BER rating Ireland',
      'attic insulation',
      'thermal efficiency',
      'retrofit',
    ],
    metaTitle: 'Attic Insulation Guide',
    metaDescription: 'An attic insulation guide.',
    content:
      "Attic insulation is one of the most cost-effective ways to improve your home's thermal efficiency and boost its overall rating...",
    status: 'Drafted',
    date: '17/07/2026',
    wordCount: 88,
    tone: 'Educational',
  },
  {
    id: 'lib-1',
    title: "Air-to-Water vs Ireland's humidity: performance realities you should know",
    topic: 'Heat Pumps & Humidity',
    content:
      "Ireland's high ambient humidity levels present unique operational challenges for air-to-water heat pump systems, particularly during frost cycles in mid-winter...",
    status: 'Drafted',
    date: 'Jul 18, 2026',
    wordCount: 840,
    keywords: ['air to water heat pump', 'humidity cop', 'defrost cycles'],
  },
  {
    id: 'lib-2',
    title: 'Leakiness, Airtightness & Building Health',
    topic: 'Airtightness & Ventilation',
    content:
      'When retrofitting a traditional Irish home, achieving airtightness without adequate mechanical ventilation (MVHR) can lead to indoor air quality decay...',
    status: 'Drafted',
    date: 'Jul 18, 2026',
    wordCount: 620,
    keywords: ['airtightness test', 'mvhr ventilation', 'indoor air quality'],
  },
  {
    id: 'lib-3',
    title: 'The technical reason your heat pump cycles too frequently',
    topic: 'Heat Pump Diagnostics',
    content:
      'Short cycling in residential heat pump installations typically indicates oversized compressor capacity, poor radiator emitter balancing, or inadequate buffer tank volume...',
    status: 'Drafted',
    date: 'Jul 19, 2026',
    wordCount: 910,
    keywords: ['heat pump short cycling', 'buffer tank', 'radiator balancing'],
  },
  {
    id: 'lib-4',
    title: 'Solar PV + Battery Storage: Payback Economics in Munster (2026)',
    topic: 'Solar Economics',
    content:
      'With the Clean Export Guarantee (CEG) tariff rates and SEAI solar PV grants up to €1,800, adding a 5kWh battery storage unit dramatically accelerates payback...',
    status: 'Published',
    date: 'Jul 20, 2026',
    wordCount: 1150,
    keywords: ['solar pv grant 2026', 'battery storage payback', 'ceg export tariff'],
  },
  {
    id: 'lib-5',
    title: 'External Wall Insulation vs Cavity Fill: Cost-Benefit Analysis',
    topic: 'Wall Insulation',
    content:
      'External Wall Insulation (EWI) wraps the building envelope in continuous EPS or mineral wool insulation, eliminating thermal bridges completely...',
    status: 'Drafted',
    date: 'Jul 20, 2026',
    wordCount: 760,
    keywords: ['external wall insulation', 'cavity fill', 'thermal bridging'],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Search Scoring & Index Search Function
// ─────────────────────────────────────────────────────────────────────────────
export function searchGlobalIndex(
  query: string,
  category: SearchCategory = 'all',
  customDrafts?: ArticleDraft[],
): GlobalSearchResult[] {
  const normalized = query.trim().toLowerCase();
  const results: GlobalSearchResult[] = [];

  // 1. Index Content Drafts
  const draftsToIndex =
    customDrafts && customDrafts.length > 0
      ? customDrafts
      : DEFAULT_CONTENT_DRAFTS;

  if (category === 'all' || category === 'draft') {
    draftsToIndex.forEach((draft, index) => {
      const titleMatch = draft.title.toLowerCase().includes(normalized);
      const topicMatch = draft.topic?.toLowerCase().includes(normalized);
      const keywordMatch = draft.keywords?.some((k) =>
        k.toLowerCase().includes(normalized),
      );
      const contentMatch = draft.content?.toLowerCase().includes(normalized);

      if (!normalized || titleMatch || topicMatch || keywordMatch || contentMatch) {
        let score = 0;
        let isSuggested = false;
        let suggestedSection: 'recent_draft' | 'frequent_nav' | undefined = undefined;

        if (!normalized) {
          // Prioritize recent drafts at the top of Suggested items
          score = 300 - Math.min(index * 5, 100);
          isSuggested = true;
          suggestedSection = 'recent_draft';
        } else {
          if (titleMatch) score += 50;
          if (topicMatch) score += 30;
          if (keywordMatch) score += 25;
          if (contentMatch) score += 10;
        }

        results.push({
          id: `draft-${draft.id}`,
          category: 'draft',
          title: draft.title,
          subtitle: draft.topic || 'Article Draft',
          snippet: draft.content
            ? draft.content.replace(/[#*`_]/g, '').slice(0, 140) + '...'
            : undefined,
          targetTab: 'writer',
          actionPayload: {
            topic: draft.title,
            tab: 'writer',
            item: draft,
          },
          badge: {
            label: draft.status === 'Published' ? 'Published' : !normalized ? 'Recent Draft' : 'Draft',
            variant: draft.status === 'Published' ? 'sky' : 'emerald',
          },
          metrics: [
            { label: 'Words', value: draft.wordCount || 0 },
            { label: 'Date', value: draft.date || 'Recent' },
            ...(draft.keywords && draft.keywords.length > 0
              ? [{ label: 'Keywords', value: draft.keywords.length }]
              : []),
          ],
          score,
          isSuggested,
          suggestedSection,
        });
      }
    });
  }

  // 2. Index Keyword Research Results
  if (category === 'all' || category === 'keyword') {
    SEED_KEYWORDS.forEach((kw, index) => {
      const kwMatch = kw.keyword.toLowerCase().includes(normalized);
      const clusterMatch = kw.cluster.toLowerCase().includes(normalized);
      const intentMatch = kw.intent.toLowerCase().includes(normalized);

      if (!normalized || kwMatch || clusterMatch || intentMatch) {
        let score = 0;
        if (!normalized) {
          score = 30 - index;
        } else {
          if (kwMatch) score += 50;
          if (clusterMatch) score += 20;
          if (intentMatch) score += 15;
        }

        results.push({
          id: `keyword-${index}`,
          category: 'keyword',
          title: kw.keyword,
          subtitle: `Cluster: ${kw.cluster} • Intent: ${kw.intent}`,
          snippet: `Monthly Search Volume: ${kw.volume.toLocaleString()} searches/mo • Ranking Difficulty: ${kw.difficulty}% (${kw.difficulty < 30 ? 'Easy' : kw.difficulty < 45 ? 'Moderate' : 'Competitive'})`,
          targetTab: 'keywords',
          actionPayload: {
            keyword: kw.keyword,
            tab: 'keywords',
          },
          badge: {
            label: kw.intent,
            variant:
              kw.intent === 'Commercial'
                ? 'amber'
                : kw.intent === 'Transactional'
                  ? 'emerald'
                  : kw.intent === 'Local SEO'
                    ? 'indigo'
                    : 'sky',
          },
          metrics: [
            { label: 'Vol/mo', value: kw.volume.toLocaleString() },
            { label: 'Difficulty', value: `${kw.difficulty}%` },
            { label: 'Relevance', value: kw.relevance },
          ],
          score,
        });
      }
    });
  }

  // 3. Index Site Audit Logs
  if (category === 'all' || category === 'audit') {
    SEED_AUDIT_LOGS.forEach((audit, index) => {
      const titleMatch = audit.title.toLowerCase().includes(normalized);
      const descMatch = audit.desc.toLowerCase().includes(normalized);
      const catMatch = audit.category.toLowerCase().includes(normalized);
      const statusMatch = audit.status.toLowerCase().includes(normalized);

      if (!normalized || titleMatch || descMatch || catMatch || statusMatch) {
        let score = 0;
        if (!normalized) {
          score = 20 - index;
        } else {
          if (titleMatch) score += 50;
          if (descMatch) score += 30;
          if (catMatch) score += 20;
          if (statusMatch) score += 15;
        }

        results.push({
          id: `audit-${audit.id}`,
          category: 'audit',
          title: audit.title,
          subtitle: `Category: ${audit.category} • Severity: ${audit.severity}`,
          snippet: audit.desc,
          targetTab: audit.targetTab,
          actionPayload: {
            tab: audit.targetTab,
            filter: audit.title,
          },
          badge: {
            label: audit.status,
            variant:
              audit.status === 'Resolved' || audit.status === 'Passed'
                ? 'emerald'
                : audit.status === 'Validated'
                  ? 'sky'
                  : 'amber',
          },
          metrics: [
            { label: 'Severity', value: audit.severity },
            { label: 'Domain', value: 'ecosmarthomes.ie' },
          ],
          score,
        });
      }
    });
  }

  // 4. Index Dashboard Navigations
  if (category === 'all' || category === 'nav') {
    DASHBOARD_NAV_TARGETS.forEach((nav, index) => {
      const titleMatch = nav.title.toLowerCase().includes(normalized);
      const subtitleMatch = nav.subtitle.toLowerCase().includes(normalized);
      const snippetMatch = nav.snippet.toLowerCase().includes(normalized);

      if (!normalized || titleMatch || subtitleMatch || snippetMatch) {
        let score = 0;
        let isSuggested = false;
        let suggestedSection: 'recent_draft' | 'frequent_nav' | undefined = undefined;

        if (!normalized) {
          if (nav.isFrequent) {
            // Prioritize frequent navigation destinations
            score = 200 - Math.min(index * 3, 50);
            isSuggested = true;
            suggestedSection = 'frequent_nav';
          } else {
            score = 70 - index;
          }
        } else {
          if (titleMatch) score += 40;
          if (subtitleMatch) score += 25;
          if (snippetMatch) score += 15;
        }

        results.push({
          id: `nav-${nav.id}`,
          category: 'nav',
          title: nav.title,
          subtitle: nav.subtitle,
          snippet: nav.snippet,
          targetTab: nav.targetTab,
          actionPayload: {
            tab: nav.targetTab,
          },
          badge: {
            label: nav.badgeLabel,
            variant: 'indigo',
          },
          metrics: [{ label: 'Action', value: 'Jump to View ↵' }],
          score,
          isSuggested,
          suggestedSection,
        });
      }
    });
  }

  // Sort by relevance score descending
  return results.sort((a, b) => (b.score || 0) - (a.score || 0));
}

// ─────────────────────────────────────────────────────────────────────────────
// Suggested Items Extraction Helper
// ─────────────────────────────────────────────────────────────────────────────
export function getSuggestedItems(customDrafts?: ArticleDraft[]): {
  recentDrafts: GlobalSearchResult[];
  frequentDestinations: GlobalSearchResult[];
  allSuggested: GlobalSearchResult[];
} {
  const allResults = searchGlobalIndex('', 'all', customDrafts);
  const recentDrafts = allResults.filter(
    (r) => r.suggestedSection === 'recent_draft',
  );
  const frequentDestinations = allResults.filter(
    (r) => r.suggestedSection === 'frequent_nav',
  );
  return {
    recentDrafts,
    frequentDestinations,
    allSuggested: [...recentDrafts, ...frequentDestinations],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Index Statistics Helper
// ─────────────────────────────────────────────────────────────────────────────
export function getSearchIndexStats(customDrafts?: ArticleDraft[]): {
  total: number;
  drafts: number;
  keywords: number;
  audits: number;
  navs: number;
} {
  const draftsCount =
    customDrafts && customDrafts.length > 0
      ? customDrafts.length
      : DEFAULT_CONTENT_DRAFTS.length;

  return {
    total:
      draftsCount +
      SEED_KEYWORDS.length +
      SEED_AUDIT_LOGS.length +
      DASHBOARD_NAV_TARGETS.length,
    drafts: draftsCount,
    keywords: SEED_KEYWORDS.length,
    audits: SEED_AUDIT_LOGS.length,
    navs: DASHBOARD_NAV_TARGETS.length,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Recent Search Queries Storage
// ─────────────────────────────────────────────────────────────────────────────
const RECENT_SEARCHES_KEY = 'ecosmart_recent_global_searches_v1';

export function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) {
      return [
        'SEAI grants Limerick',
        'heat pump',
        'BER rating',
        'Sitemap Configuration',
      ];
    }
    return JSON.parse(raw);
  } catch {
    return ['SEAI grants Limerick', 'heat pump', 'BER rating'];
  }
}

export function addRecentSearch(query: string): void {
  const trimmed = query.trim();
  if (!trimmed) return;
  try {
    const current = getRecentSearches().filter(
      (q) => q.toLowerCase() !== trimmed.toLowerCase(),
    );
    const updated = [trimmed, ...current].slice(0, 6);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage issues
  }
}

export function clearRecentSearches(): void {
  try {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify([]));
  } catch {
    // Ignore storage issues
  }
}
