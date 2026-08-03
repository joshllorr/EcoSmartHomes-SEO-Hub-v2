import { DashboardState } from './types';

export const INITIAL_DASHBOARD_DATA: DashboardState = {
  site: 'ecosmarthomes.ie',
  pillar: {
    name: 'BER Rating Ireland',
    readiness_score: 28,
    tier: 'silver',
    articles_live: 0,
    articles_total: 5,
    backlinks: 0,
    backlinks_required: 1,
    bait_assets: {
      live: 1,
      drafted: 0,
      remaining: 4,
    },
  },
  ai_suggestion: 'Raising BER from G to A: Step-by-Step Retrofit Sequence',
  xp: {
    level: 3,
    current: 185,
    target: 300,
    streak_days: 2,
  },
  tasks: [
    {
      id: 'add_site',
      title: 'Add your website (+10 XP)',
      xp: 10,
      completed: true,
    },
    {
      id: 'check_discovery',
      title: 'Check first discovery (+20 XP)',
      xp: 20,
      completed: true,
    },
    {
      id: 'site_scan',
      title: 'Run site health scan (+15 XP)',
      xp: 15,
      completed: false,
    },
    {
      id: 'gen_article',
      title: 'Generate first article (+30 XP)',
      xp: 30,
      completed: false,
    },
    {
      id: 'connect_cms',
      title: 'Connect CMS (+20 XP)',
      xp: 20,
      completed: false,
    },
    {
      id: 'connect_gsc',
      title: 'Connect Google Search Console (+20 XP)',
      xp: 20,
      completed: false,
    },
    {
      id: 'install_harbor_ai',
      title: 'Install Harbor AI (+20 XP)',
      xp: 20,
      completed: false,
    },
    {
      id: 'publish_article',
      title: 'Publish first article (+25 XP)',
      xp: 25,
      completed: false,
    },
    {
      id: 'write_second_article',
      title: 'Write second article (+25 XP)',
      xp: 25,
      completed: false,
    },
    {
      id: 'run_3_discoveries',
      title: 'Run 3 discovery sessions (+30 XP)',
      xp: 30,
      completed: false,
    },
  ],
  weekly_challenges: [
    {
      id: 'write_2',
      title: 'Write 2 articles',
      current: 2,
      target: 2,
      completed: true,
    },
    {
      id: 'run_disc_1',
      title: 'Run a discovery session',
      current: 1,
      target: 1,
      completed: true,
    },
    {
      id: 'write_5',
      title: 'Write 5 articles',
      current: 2,
      target: 5,
      completed: false,
    },
  ],
  recent_activity: [
    {
      id: 'act_1',
      title: 'Research: The 2026 Carbon Tax Cliff',
      category: 'Research',
      date: '2026-07-18',
    },
    {
      id: 'act_2',
      title: 'Draft: Raising BER from G to A',
      category: 'Draft',
      date: '2026-07-17',
    },
    {
      id: 'act_3',
      title: 'Research: Indoor Air Quality & Retrofitting',
      category: 'Research',
      date: '2026-07-17',
    },
    {
      id: 'act_4',
      title: 'Scout: ecosmarthomes.ie',
      category: 'Scout',
      date: '2026-07-17',
    },
    {
      id: 'act_5',
      title: 'Research: SEAI grants vs One-Stop-Shop',
      category: 'Research',
      date: '2026-07-17',
    },
  ],
  site_health: {
    status: 'failed',
    error: 'No sitemap found for https://ecosmarthomes.ie',
    last_scanned: '2026-07-19T14:30:00Z',
  },
  ai_visibility: {
    visits_last_30_days: 0,
    ai_referrals: [
      { source: 'ChatGPT', visits: 0 },
      { source: 'Perplexity', visits: 0 },
      { source: 'Gemini', visits: 0 },
      { source: 'Claude', visits: 0 },
    ],
  },
  seo_heatmap: [
    {
      day: 'Mon',
      visibility: 42,
      discovery_sessions: 1,
      ctr: 1.8,
      rankings: 12,
    },
    {
      day: 'Tue',
      visibility: 45,
      discovery_sessions: 2,
      ctr: 2.1,
      rankings: 14,
    },
    {
      day: 'Wed',
      visibility: 68,
      discovery_sessions: 4,
      ctr: 3.5,
      rankings: 25,
    }, // High-performing day!
    {
      day: 'Thu',
      visibility: 52,
      discovery_sessions: 1,
      ctr: 2.4,
      rankings: 18,
    },
    {
      day: 'Fri',
      visibility: 75,
      discovery_sessions: 3,
      ctr: 3.8,
      rankings: 29,
    }, // Another high-performing day!
    {
      day: 'Sat',
      visibility: 48,
      discovery_sessions: 0,
      ctr: 2.0,
      rankings: 16,
    },
    {
      day: 'Sun',
      visibility: 40,
      discovery_sessions: 1,
      ctr: 1.6,
      rankings: 11,
    },
  ],
  drafts: [
    {
      id: 'draft_init_1',
      title: 'Retrofitting Homes in Ireland: SEAI Grants Explained',
      topic:
        'Understanding SEAI grant schemes for heat pump installations and attic insulation.',
      keywords: [
        'SEAI grants Limerick V94',
        'home insulation Raheen',
        'BER rating Limerick',
        'heat pump installation Castletroy',
      ],
      content:
        'Upgrading your home in Limerick and the V94 Eircode region is very important. Many homeowners in Castletroy, Raheen, and Dooradoyle want to save money on heating bills. You can get grants from the Sustainable Energy Authority of Ireland (SEAI). These grants help pay for solar panels, air-to-water heat pumps, and wall insulation. Wall insulation makes your Limerick home warm. It is very simple to apply. First, find an SEAI registered contractor in Limerick V94. They will evaluate your home and advise you. Then, submit the application online before any work starts.',
      status: 'Drafted',
      date: '18/07/2026',
      wordCount: 94,
    },
    {
      id: 'draft_init_2',
      title: 'Attic Insulation & Raising BER Ratings',
      topic:
        "How attic insulation improves your home's thermal efficiency and boosts its overall BER letter rating.",
      keywords: [
        'BER rating Ireland',
        'attic insulation',
        'thermal efficiency',
        'retrofit',
      ],
      metaTitle: 'Attic Insulation Guide',
      metaDescription: 'An attic insulation guide.',
      content:
        "Attic insulation is one of the most cost-effective ways to improve your home's thermal efficiency and boost its overall rating. Heat rises, meaning a significant amount of warmth is lost through an uninsulated roof. By installing high-quality glass wool or cellulose insulation, you create a robust barrier that traps heat. In Ireland, homes are rated on a BER scale from A to G. Upgrading your roof insulation can immediately lift your rating, reducing carbon emissions and cutting down on your heating expenses.",
      status: 'Drafted',
      date: '17/07/2026',
      wordCount: 88,
    },
  ],
};
