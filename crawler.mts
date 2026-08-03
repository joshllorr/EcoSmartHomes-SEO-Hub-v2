import WebSocket, { WebSocketServer } from 'ws';
import axios from 'axios';
import * as cheerio from 'cheerio'; // HTML parsing
import crypto from 'crypto';
import schedule from 'node-schedule';
import fs from 'fs';
import path from 'path';
import {
  FullJsonLdSchema,
  FAQPageSchema,
  ArticleSchema,
  ServiceSchema,
  BreadcrumbListSchema,
  RawJsonLdSchema,
  BaseJsonLdSchema,
  PageType,
} from './schemaTypes.js';
import { publishPageToGitHub, injectInternalLinks } from './publisher.js';

// -------------------------------
// CONFIG & WEBSOCKET SERVER
// -------------------------------
const WS_URL = 'ws://localhost:3000';

let wss: WebSocketServer | null = null;
try {
  wss = new WebSocketServer({ port: 3000 });
  wss.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.log(
        'WebSocket server port 3000 is active via main server process.',
      );
    } else {
      console.error('WebSocket server error:', err);
    }
  });
  console.log('Crawler WebSocket server running on ws://localhost:3000');

  wss.on('connection', (socket) => {
    console.log('Dashboard connected to crawler');
  });
} catch (err) {
  console.log('Port 3000 handled by main server');
}

setInterval(() => {
  if (wss && wss.clients) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            type: 'heartbeat',
            status: 'alive',
            timestamp: Date.now(),
          }),
        );
      }
    });
  }
}, 5000);

const MAX_RETRIES = 3;
const DOMAIN_DELAY = 2500; // 2.5s throttle per domain
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

let xp = 0;
let visibility = 0;

export interface QueuedPage {
  slug: string;
  html: string;
  keywords: string[];
  createdAt: number;
}

export const publishingQueue: QueuedPage[] = [];

export interface QueuedRewrite {
  slug: string;
  articleDraft: string;
  seoBrief: any;
  outline: any;
  schemaBundle: any;
  createdAt: number;
}

export const rewriteQueue: QueuedRewrite[] = [];

export function rewriteContent(
  articleDraft: string,
  seoBrief: any,
  outline: any = [],
) {
  let improved = articleDraft;

  // Strengthen intro
  improved = improved.replace(
    /<p>(.*?)<\/p>/,
    `<p><strong>${seoBrief?.topic || 'Home Retrofitting'}</strong> is essential for Irish homeowners. ${seoBrief?.description || ''}</p>`,
  );

  // Expand sections
  if (Array.isArray(outline)) {
    outline.forEach((sec: any) => {
      const sectionName = typeof sec === 'string' ? sec : sec?.section || '';
      if (!sectionName) return;

      const regex = new RegExp(`<h2>${sectionName}</h2>[\\s\\S]*?(?=<h2>|$)`);
      const match = improved.match(regex);

      if (match) {
        const expanded = `${match[0]}\n<p>${seoBrief?.topic || 'Energy retrofitting'} plays a key role in ${sectionName.toLowerCase()} for Irish homes.</p>`;
        improved = improved.replace(match[0], expanded);
      }
    });
  }

  // Add CTA if missing
  if (!improved.includes('cta-section')) {
    improved += `
      <section class="cta-section">
        <h2>${seoBrief?.cta?.heading || 'Upgrade Your Home Energy Efficiency'}</h2>
        <p>${seoBrief?.cta?.body || 'Contact EcoSmartHomes today for SEAI grant advice and retrofit planning.'}</p>
      </section>
    `;
  }

  return improved;
}

export function broadcastQueueUpdate() {
  const payload = JSON.stringify({
    type: 'queue_update',
    queueLength: publishingQueue.length,
    nextSlug: publishingQueue[0]?.slug || null,
    message: `Queue update: ${publishingQueue.length} page(s) queued. Next: ${publishingQueue[0]?.slug || 'none'}`,
    timestamp: Date.now(),
  });

  if (wss && wss.clients) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }
}

// -------------------------------
// PHASE 5 — SERP COMPETITOR DIFF ENGINE
// -------------------------------
export async function fetchCompetitorContent(url: string) {
  try {
    const { data } = await axios.get(url, {
      timeout: 8000,
      headers: { 'User-Agent': USER_AGENT },
    });
    const $ = cheerio.load(data);

    const headings: string[] = [];
    $('h1, h2, h3').each((_, el) => {
      const txt = $(el).text().trim();
      if (txt) headings.push(txt);
    });

    const faqs: string[] = [];
    $('details').each((_, el) => {
      const txt = $(el).find('summary').text().trim();
      if (txt) faqs.push(txt);
    });

    return { url, headings, faqs };
  } catch (err) {
    console.log('Competitor fetch failed:', url);
    return null;
  }
}

export async function getTopCompetitors(keyword: string) {
  if (process.env.SERPSTACK_KEY) {
    try {
      const serpApi = `https://api.serpstack.com/search?access_key=${process.env.SERPSTACK_KEY}&query=${encodeURIComponent(keyword)}`;
      const { data } = await axios.get(serpApi, { timeout: 8000 });
      const urls: string[] =
        data?.organic_results?.slice(0, 10).map((r: any) => r.url) || [];
      const competitors = [];
      for (const url of urls) {
        const content = await fetchCompetitorContent(url);
        if (content) competitors.push(content);
      }
      if (competitors.length > 0) return competitors;
    } catch (err) {
      console.log(
        'SerpStack fetch failed, using fallback competitor benchmarks',
      );
    }
  }

  // Robust fallback competitor benchmark data
  return [
    {
      url: 'https://www.seai.ie/grants/home-energy-grants/',
      headings: [
        `${keyword} SEAI Grant Criteria`,
        `SEAI Grant Amounts for ${keyword}`,
        'BER Rating Requirement',
      ],
      faqs: [
        'How much SEAI grant can I get?',
        'Do I need a BER assessment before applying?',
      ],
    },
    {
      url: 'https://www.electricireland.ie/retrofitting',
      headings: [
        `Professional Installation for ${keyword}`,
        'Energy Savings & Efficiency',
      ],
      faqs: ['How long does installation take?', 'What is payback time?'],
    },
  ];
}

export function diffCompetitors(
  competitors: Array<{ url: string; headings: string[]; faqs: string[] }>,
  yourOutline: any = [],
) {
  const competitorTopics = new Set<string>();

  competitors.forEach((c) => {
    c.headings?.forEach((h) => competitorTopics.add(h.trim()));
    c.faqs?.forEach((f) => competitorTopics.add(f.trim()));
  });

  const outlineStrings: string[] = Array.isArray(yourOutline)
    ? yourOutline.map((sec: any) =>
        typeof sec === 'string'
          ? sec.toLowerCase()
          : (sec?.section || '').toLowerCase(),
      )
    : [];

  const missing: string[] = [];

  competitorTopics.forEach((topic) => {
    const topicLower = topic.toLowerCase();
    const exists = outlineStrings.some(
      (section) => section.includes(topicLower) || topicLower.includes(section),
    );
    if (!exists && topic.length > 5 && topic.length < 80) {
      missing.push(topic);
    }
  });

  return missing.slice(0, 10);
}

export function patchContent(articleDraft: string, missingTopics: string[]) {
  let patched = articleDraft;

  missingTopics.forEach((topic) => {
    patched += `
      <section class="serp-patched-section">
        <h2>${topic}</h2>
        <p>${topic} is an essential factor for Irish homeowners considering retrofit energy upgrades.</p>
      </section>
    `;
  });

  return patched;
}

// -------------------------------
// PHASE 6 — TOPIC CLUSTER BUILDER
// -------------------------------
export interface ClusterInfo {
  pillar: string | null;
  clusters: string[];
}

export const topicClusters: Record<string, ClusterInfo> = {};

export function extractCoreTopic(seoBrief: any): string {
  if (!seoBrief || !seoBrief.topic) return 'home-energy';
  return seoBrief.topic.toLowerCase().split(' ').slice(0, 2).join('-');
}

export function updatePillar(core: string) {
  if (!topicClusters[core] || !topicClusters[core].pillar) return;

  const pillarSlug = topicClusters[core].pillar!;
  const clusters = topicClusters[core].clusters;

  const contentDir = path.resolve('./content');
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
  }

  const pillarPath = path.join(contentDir, `${pillarSlug}.html`);
  if (!fs.existsSync(pillarPath)) return;

  let pillarHtml = fs.readFileSync(pillarPath, 'utf-8');

  const links = clusters
    .map(
      (c) =>
        `<li><a href="/content/${c}.html">${c.replace(/-/g, ' ')}</a></li>`,
    )
    .join('');

  if (pillarHtml.includes('<section id="cluster-links">')) {
    pillarHtml = pillarHtml.replace(
      /<section id="cluster-links">[\s\S]*?<\/section>/,
      `<section id="cluster-links"><h2>Cluster Articles</h2><ul>${links}</ul></section>`,
    );
  } else {
    pillarHtml = pillarHtml.replace(
      '</body>',
      `<section id="cluster-links"><h2>Cluster Articles</h2><ul>${links}</ul></section></body>`,
    );
  }

  fs.writeFileSync(pillarPath, pillarHtml, 'utf-8');
  console.log(
    `Topic Cluster Builder: Updated pillar page '${pillarSlug}' with ${clusters.length} cluster link(s).`,
  );
}

// -------------------------------
// PHASE 7 — SEMANTIC ENTITY ENRICHMENT ENGINE
// -------------------------------
export const entityLibrary = {
  agencies: [
    'SEAI (Sustainable Energy Authority of Ireland)',
    'NSAI (National Standards Authority of Ireland)',
    'CRU (Commission for Regulation of Utilities)',
  ],
  standards: [
    'BER (Building Energy Rating)',
    'NZEB (Nearly Zero Energy Building)',
    'Part L Building Regulations',
    'Part F Ventilation Standards',
  ],
  heatPumpTypes: [
    'Air-to-water heat pump',
    'Ground-source heat pump',
    'Hybrid heat pump',
  ],
  grants: [
    'SEAI Heat Pump System Grant',
    'Better Energy Homes Scheme',
    'Solar PV Grant',
  ],
  metrics: [
    'COP (Coefficient of Performance)',
    'SCOP (Seasonal Coefficient of Performance)',
    'U-value',
    'kWh consumption',
  ],
  manufacturers: [
    'Daikin',
    'Mitsubishi Electric',
    'Panasonic',
    'Samsung Climate Solutions',
  ],
};

export function findRelevantEntities(
  articleDraft: string,
  seoBrief: any,
): string[] {
  const text = (
    articleDraft +
    ' ' +
    (seoBrief?.topic || '') +
    ' ' +
    (seoBrief?.description || '')
  ).toLowerCase();
  const matched: string[] = [];

  Object.values(entityLibrary).forEach((group) => {
    group.forEach((entity) => {
      const keyword = entity.split(' ')[0].toLowerCase();
      if (text.includes(keyword) || text.includes(entity.toLowerCase())) {
        matched.push(entity);
      }
    });
  });

  return Array.from(new Set(matched)).slice(0, 10);
}

export function injectEntities(
  articleDraft: string,
  entities: string[],
): string {
  let enriched = articleDraft;

  enriched += `
    <section class="semantic-entities">
      <h2>Key Irish Retrofit Entities</h2>
      <ul>
        ${entities.map((e) => `<li>${e}</li>`).join('')}
      </ul>
    </section>
  `;

  return enriched;
}

// -------------------------------
// PHASE 8 — AUTHORITY GRAPH ENGINE
// -------------------------------
export interface GraphNode {
  id: string;
  type: 'page' | 'entity' | 'cluster' | 'pillar';
  score?: number;
  label?: string;
  cluster?: string;
  entities?: string[];
  updatedAt?: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  type: string;
}

export interface AuthorityGraph {
  nodes: Record<string, GraphNode>;
  edges: GraphEdge[];
}

export const authorityGraph: AuthorityGraph = {
  nodes: {},
  edges: [],
};

export function findWeakNodes(): string[] {
  return Object.entries(authorityGraph.nodes)
    .filter(([_, node]) => (node.score ?? 0) < 60)
    .map(([slug]) => slug);
}

// -------------------------------
// PHASE 9 — REAL-TIME SERP VOLATILITY MONITOR
// -------------------------------
export interface SerpResult {
  rank: number;
  url: string;
  title: string;
}

export interface SerpHistoryEntry {
  timestamp: number;
  snapshot: SerpResult[];
}

export const serpHistory: Record<string, SerpHistoryEntry[]> = {};

// -------------------------------
// PHASE 12 — PREDICTIVE RANKING ENGINE
// -------------------------------
export interface RankingTrendEntry {
  timestamp: number;
  snapshot: SerpResult[];
}

export const rankingHistory: Record<string, RankingTrendEntry[]> = {};

export async function getSerpSnapshot(keyword: string): Promise<SerpResult[]> {
  let snapshot: SerpResult[] = [];
  if (process.env.SERPSTACK_KEY) {
    try {
      const serpApi = `https://api.serpstack.com/search?access_key=${process.env.SERPSTACK_KEY}&query=${encodeURIComponent(keyword)}`;
      const { data } = await axios.get(serpApi, { timeout: 8000 });
      if (data?.organic_results) {
        snapshot = data.organic_results
          .slice(0, 10)
          .map((r: any, i: number) => ({
            rank: i + 1,
            url: r.url,
            title: r.title || '',
          }));
      }
    } catch (err) {
      console.log(
        'SerpStack API fetch error in getSerpSnapshot, falling back to simulated benchmark',
      );
    }
  }

  if (snapshot.length === 0) {
    snapshot = [
      {
        rank: 1,
        url: 'https://ecosmarthomes.ie',
        title: `EcoSmartHomes — ${keyword} Advisory Ireland`,
      },
      {
        rank: 2,
        url: 'https://www.seai.ie/grants',
        title: `SEAI ${keyword} Home Energy Upgrades`,
      },
      {
        rank: 3,
        url: 'https://www.electricireland.ie',
        title: `Electric Ireland ${keyword} Solutions`,
      },
      {
        rank: 4,
        url: 'https://www.citizensinformation.ie',
        title: `Home Energy Retrofitting Grants`,
      },
    ];
  }

  serpHistory[keyword] = serpHistory[keyword] || [];
  serpHistory[keyword].push({
    timestamp: Date.now(),
    snapshot,
  });

  if (serpHistory[keyword].length > 50) {
    serpHistory[keyword].shift();
  }

  rankingHistory[keyword] = rankingHistory[keyword] || [];
  rankingHistory[keyword].push({
    timestamp: Date.now(),
    snapshot,
  });

  if (rankingHistory[keyword].length > 50) {
    rankingHistory[keyword].shift();
  }

  return snapshot;
}

export function analyseRankingTrend(
  keyword: string,
): Array<number | null> | null {
  const history = rankingHistory[keyword];
  if (!history || history.length < 4) return null;

  const lastFour = history.slice(-4).map((h) => h.snapshot);

  const trend = lastFour.map((snap) => {
    const ourResult = snap.find((r) => r.url.includes('ecosmarthomes'));
    return ourResult ? ourResult.rank : null;
  });

  return trend;
}

export function predictMovement(
  trend: Array<number | null> | null,
): 'likely_drop' | 'likely_rise' | 'stable' | null {
  if (!trend || trend.some((t) => t === null)) return null;

  const [r1, _r2, _r3, r4] = trend as number[];

  const slope = (r4 - r1) / 3; // simple linear regression

  if (slope > 0.5) return 'likely_drop';
  if (slope < -0.5) return 'likely_rise';

  return 'stable';
}

// -------------------------------
// PHASE 13 — AUTONOMOUS CONTENT EXPANSION ENGINE
// -------------------------------
export function detectClusterContentGaps(
  coreTopic: string,
  competitors: Array<{ headings: string[] }>,
): string[] {
  const competitorTopics = new Set<string>();
  competitors.forEach((c) =>
    c.headings.forEach((h) => competitorTopics.add(h.toLowerCase())),
  );

  const existingPages = topicClusters[coreTopic]?.clusters || [];
  const existingTopics = existingPages.map((p) => p.replace(/-/g, ' '));

  const gaps = [...competitorTopics].filter(
    (t) => !existingTopics.some((et) => et.includes(t)),
  );

  return gaps.slice(0, 5); // limit to 5 new pages
}

export function generateAutonomousSeoBrief(topic: string) {
  return {
    topic,
    description: `Comprehensive guide to ${topic} for Irish homeowners.`,
    keywords: [topic, 'retrofit', 'Ireland', 'EcoSmartHomes'],
    primaryKeyword: topic,
  };
}

export function createAutonomousArticleDraft(seoBrief: any): string {
  return `
    <h1>${seoBrief.topic}</h1>
    <p>${seoBrief.description}</p>
    <section>
      <h2>Why ${seoBrief.topic} matters</h2>
      <p>Understanding ${seoBrief.topic} helps improve energy efficiency and comfort.</p>
    </section>
    <section>
      <h2>Irish homeowner insights</h2>
      <p>EcoSmartHomes explains how ${seoBrief.topic} fits into retrofit goals.</p>
    </section>
  `;
}

// -------------------------------
// PHASE 14 — CROSS-DOMAIN KNOWLEDGE FUSION ENGINE
// -------------------------------
export const fusionSources: Record<string, string> = {
  seai: 'https://data.gov.ie/dataset/seai-energy-statistics',
  cru: 'https://www.cru.ie/publications/',
  nsai: 'https://standards.ie/',
  ber: 'https://ndber.seai.ie/',
};

export async function fetchFusionData(
  sourceUrl: string,
): Promise<Array<{ title?: string; description?: string }>> {
  try {
    const { data } = await axios.get(sourceUrl, { timeout: 8000 });
    if (Array.isArray(data)) {
      return data.slice(0, 10);
    }
    return [
      {
        title: 'Official SEAI Energy Data',
        description:
          'Verified SEAI Irish retrofit grants, Part L U-value specifications, and BER rating benchmarks.',
      },
    ];
  } catch (err) {
    console.log('Fusion fetch info (fallback active):', sourceUrl);
    return [
      {
        title: 'Official SEAI Energy Standards',
        description:
          'Verified SEAI Irish retrofit grants, Part L U-value specifications, and BER rating benchmarks.',
      },
    ];
  }
}

export function fuseKnowledge(
  articleDraft: string,
  fusionData: Array<{ title?: string; description?: string }>,
): string {
  let enriched = articleDraft;

  fusionData.forEach((item) => {
    if (item.title && item.description && !enriched.includes(item.title)) {
      enriched += `
        <section class="fusion-data">
          <h2>${item.title}</h2>
          <p>${item.description}</p>
        </section>
      `;
    }
  });

  return enriched;
}

// -------------------------------
// PHASE 15 — CONVERSATIONAL KNOWLEDGE INTERFACE
// -------------------------------
export function buildKnowledgeCorpus(): Array<{ slug: string; text: string }> {
  const corpus: Array<{ slug: string; text: string }> = [];

  // Add published pages
  for (const slug of Object.keys(authorityGraph.nodes)) {
    if (authorityGraph.nodes[slug].type === 'page') {
      try {
        const filePath = `./content/${slug}.html`;
        if (fs.existsSync(filePath)) {
          const html = fs.readFileSync(filePath, 'utf-8');
          corpus.push({ slug, text: html });
        }
      } catch (e) {
        // file reading fallback
      }
    }
  }

  // Add fused external data
  corpus.push({ slug: 'external-data', text: JSON.stringify(fusionSources) });

  // Add semantic entities
  corpus.push({ slug: 'entities', text: JSON.stringify(entityLibrary) });

  return corpus;
}

export function detectQuestionIntent(question: string): string {
  const q = question.toLowerCase();

  if (q.includes('grant')) return 'grants';
  if (q.includes('cost') || q.includes('price') || q.includes('payback'))
    return 'costs';
  if (q.includes('solar') || q.includes('pv')) return 'solar';
  if (q.includes('insulation') || q.includes('attic') || q.includes('wall'))
    return 'insulation';
  if (q.includes('heat pump') || q.includes('air-to-water')) return 'heatPumps';

  return 'general';
}

export function retrieveKnowledge(
  question: string,
  corpus: Array<{ slug: string; text: string }>,
): Array<{ slug: string; text: string }> {
  const q = question.toLowerCase();
  const matches: Array<{ slug: string; text: string }> = [];

  corpus.forEach((entry) => {
    if (
      entry.text.toLowerCase().includes(q) ||
      q
        .split(' ')
        .some((w) => w.length > 3 && entry.text.toLowerCase().includes(w))
    ) {
      matches.push(entry);
    }
  });

  return matches.slice(0, 5); // top 5 relevant sources
}

export function generateAnswer(
  question: string,
  sources: Array<{ slug: string; text: string }>,
  intentProfile: IntentProfile,
): string {
  let answer = `
    <h2>Answer: ${question}</h2>
    <p>This response is tailored for Irish homeowners with a ${intentProfile?.tone || 'helpful'} tone.</p>
  `;

  sources.forEach((src) => {
    answer += `
      <section>
        <h3>From: ${src.slug}</h3>
        <p>${src.text.substring(0, 500)}...</p>
      </section>
    `;
  });

  answer += `
    <section class="cta">
      <h3>${intentProfile?.cta || 'Contact EcoSmartHomes for expert retrofit advice'}</h3>
      <p>Learn more about your options and next steps.</p>
    </section>
  `;

  return answer;
}

// -------------------------------
// PHASE 16 — AUTONOMOUS MULTI-SITE EXPANSION ENGINE
// -------------------------------
export interface DomainConfig {
  name: string;
  repo: string;
  deployUrl: string;
  tone: string;
  cta: string;
}

export const domainFleet: Record<string, DomainConfig> = {
  ecosmarthomes: {
    name: 'EcoSmartHomes',
    repo: 'github.com/joe/ecosmarthomes-site',
    deployUrl: 'https://ecosmarthomes.ie',
    tone: 'warm',
    cta: 'Book your free retrofit consultation',
  },
  solarsmarthomes: {
    name: 'SolarSmartHomes',
    repo: 'github.com/joe/solarsmarthomes-site',
    deployUrl: 'https://solarsmarthomes.ie',
    tone: 'optimistic',
    cta: 'Calculate your solar savings',
  },
  heatpumphub: {
    name: 'HeatPumpHub',
    repo: 'github.com/joe/heatpumphub-site',
    deployUrl: 'https://heatpumphub.ie',
    tone: 'expert',
    cta: 'Compare heat pump options',
  },
  insulationadvisor: {
    name: 'InsulationAdvisor',
    repo: 'github.com/joe/insulationadvisor-site',
    deployUrl: 'https://insulationadvisor.ie',
    tone: 'technical',
    cta: 'Find the right insulation',
  },
};

export async function publishToFleet(
  slug: string,
  html: string,
): Promise<void> {
  for (const domain of Object.values(domainFleet)) {
    await publishPageToGitHub(slug, html);
    console.log(`Published ${slug} to ${domain.name} (${domain.repo})`);
  }
}

export function personaliseForDomain(
  html: string,
  domain: DomainConfig,
): string {
  return html.replace(
    '</body>',
    `
      <section class="domain-cta">
        <h2>${domain.cta}</h2>
        <p>This content is tailored for ${domain.name} visitors.</p>
      </section>
    </body>`,
  );
}

export function mergeKnowledgeGraphs(): {
  nodes: Record<string, any>;
  edges: any[];
} {
  const merged: { nodes: Record<string, any>; edges: any[] } = {
    nodes: {},
    edges: [],
  };

  for (const _domain of Object.values(domainFleet)) {
    Object.assign(merged.nodes, authorityGraph.nodes);
    merged.edges.push(...authorityGraph.edges);
  }

  return merged;
}

export function detectNetworkGaps(mergedGraph: {
  nodes: Record<string, any>;
  edges: any[];
}): string[] {
  const nodeKeys = Object.keys(mergedGraph.nodes);
  const candidateGaps = [
    'heat pump electricity tariff ireland',
    'solar panel battery storage payback',
    'attic insulation grant eligibility 2026',
  ];
  return candidateGaps.filter(
    (gap) => !nodeKeys.includes(gap.replace(/\s+/g, '-')),
  );
}

export interface SerpChange {
  url: string;
  type: 'new_entry' | 'rank_change';
  rank?: number;
  from?: number;
  to?: number;
}

export function detectVolatility(keyword: string): SerpChange[] | null {
  const history = serpHistory[keyword];
  if (!history || history.length < 2) return null;

  const latest = history[history.length - 1].snapshot;
  const previous = history[history.length - 2].snapshot;

  const changes: SerpChange[] = [];

  latest.forEach((result) => {
    const prev = previous.find((p) => p.url === result.url);
    if (!prev) {
      changes.push({ url: result.url, type: 'new_entry', rank: result.rank });
    } else if (prev.rank !== result.rank) {
      changes.push({
        url: result.url,
        type: 'rank_change',
        from: prev.rank,
        to: result.rank,
      });
    }
  });

  return changes;
}

// -------------------------------
// PHASE 10 — ADAPTIVE CONTENT PERSONALISATION ENGINE
// -------------------------------
export interface IntentProfile {
  tone: string;
  cta: string;
  examples: string[];
  entities: string[];
  emphasis: string[];
}

export const intentProfiles: Record<string, IntentProfile> = {
  grants: {
    tone: 'supportive',
    cta: 'Check your eligibility for SEAI grants',
    examples: ['SEAI Heat Pump Grant', 'Better Energy Homes Scheme'],
    entities: ['SEAI', 'CRU', 'BER'],
    emphasis: ['cost reduction', 'financial support'],
  },
  costs: {
    tone: 'practical',
    cta: 'Calculate your estimated retrofit costs',
    examples: ['€12,000 heat pump install', '€8,000 insulation package'],
    entities: ['BER', 'NZEB', 'U-value'],
    emphasis: ['price ranges', 'payback period'],
  },
  solar: {
    tone: 'optimistic',
    cta: 'See how much solar could save you',
    examples: ['3kW PV system', 'Hybrid inverter'],
    entities: ['Solar PV Grant', 'kWh consumption'],
    emphasis: ['energy independence', 'bill reduction'],
  },
  insulation: {
    tone: 'technical',
    cta: 'Find the right insulation for your home',
    examples: ['cavity wall insulation', 'attic insulation'],
    entities: ['U-value', 'airtightness', 'Part L'],
    emphasis: ['heat loss', 'building fabric'],
  },
  heatPumps: {
    tone: 'expert',
    cta: 'Compare heat pump types for your home',
    examples: ['air-to-water', 'ground-source'],
    entities: ['COP', 'SCOP', 'SEAI Heat Pump Grant'],
    emphasis: ['efficiency', 'running costs'],
  },
};

export function detectIntent(seoBrief: any): string {
  const text = (
    (seoBrief?.topic || '') +
    ' ' +
    (seoBrief?.description || '') +
    ' ' +
    (Array.isArray(seoBrief?.keywords) ? seoBrief.keywords.join(' ') : '')
  ).toLowerCase();

  if (text.includes('grant')) return 'grants';
  if (
    text.includes('cost') ||
    text.includes('price') ||
    text.includes('payback')
  )
    return 'costs';
  if (text.includes('solar') || text.includes('pv')) return 'solar';
  if (
    text.includes('insulation') ||
    text.includes('attic') ||
    text.includes('wall')
  )
    return 'insulation';
  if (text.includes('heat pump') || text.includes('air-to-water'))
    return 'heatPumps';

  return 'general';
}

export function personaliseContent(
  articleDraft: string,
  intentProfile: IntentProfile,
): string {
  if (!intentProfile) return articleDraft;
  let personalised = articleDraft;

  // Inject tone
  if (personalised.includes('<h1>')) {
    personalised = personalised.replace(
      '<h1>',
      `<p class="tone-intro">This guide is written in a ${intentProfile.tone} tone to help Irish homeowners make informed decisions.</p><h1>`,
    );
  } else {
    personalised =
      `<p class="tone-intro">This guide is written in a ${intentProfile.tone} tone to help Irish homeowners make informed decisions.</p>` +
      personalised;
  }

  // Add examples
  personalised += `
    <section class="intent-examples">
      <h2>Real Irish Examples</h2>
      <ul>${intentProfile.examples.map((e) => `<li>${e}</li>`).join('')}</ul>
    </section>
  `;

  // Add CTA
  personalised += `
    <section class="intent-cta">
      <h2>${intentProfile.cta}</h2>
      <p>Learn more about your options and next steps.</p>
    </section>
  `;

  // Add emphasis section
  personalised += `
    <section class="intent-emphasis">
      <h2>Key Focus Areas</h2>
      <ul>${intentProfile.emphasis.map((e) => `<li>${e}</li>`).join('')}</ul>
    </section>
  `;

  return personalised;
}

// -------------------------------
// PHASE 11 — BEHAVIOURAL TELEMETRY ENGINE
// -------------------------------
export interface TelemetryEvent {
  dwellTime: number;
  scrollDepth: number;
  timestamp: number;
}

export const behaviouralTelemetry: Record<string, TelemetryEvent[]> = {};

export function analyseBehaviour(
  slug: string,
): { avgDwell: number; avgScroll: number } | null {
  const data = behaviouralTelemetry[slug];
  if (!data || data.length < 5) return null;

  const avgDwell = data.reduce((a, b) => a + b.dwellTime, 0) / data.length;
  const avgScroll = data.reduce((a, b) => a + b.scrollDepth, 0) / data.length;

  return { avgDwell, avgScroll };
}

// Your site’s known topics (expand as needed)
const mySiteTopics: Record<string, number> = {};

// Track visited URLs + domain timestamps
const visited = new Set<string>();
const lastDomainHit: Record<string, number> = {};

// -------------------------------
// URL QUEUE (expandable)
// -------------------------------
const urlQueue = [
  'https://www.lidl.ie',
  'https://www.supervalu.ie',
  'https://www.electricireland.ie',
  'https://www.seai.ie',
  'https://www.gov.ie/en/publication/home-energy-upgrades/',
];

// -------------------------------
// HELPERS
// -------------------------------
function domainOf(url: string) {
  return new URL(url).hostname;
}

function throttleDomain(url: string) {
  const domain = domainOf(url);
  const now = Date.now();
  const last = lastDomainHit[domain] || 0;

  const diff = now - last;
  if (diff < DOMAIN_DELAY) {
    return DOMAIN_DELAY - diff;
  }
  return 0;
}

function markDomain(url: string) {
  lastDomainHit[domainOf(url)] = Date.now();
}

function hashContent(content: string) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

// -------------------------------
// FETCH WITH RETRY + HEADERS
// -------------------------------
async function fetchWithRetry(url: string, retries = MAX_RETRIES) {
  const delay = throttleDomain(url);
  if (delay > 0) await new Promise((r) => setTimeout(r, delay));

  try {
    const res = await axios.get(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml',
      },
      timeout: 15000,
    });

    markDomain(url);
    return res;
  } catch (err) {
    if (retries > 0) {
      return fetchWithRetry(url, retries - 1);
    }
    throw err;
  }
}

// -------------------------------
// SITEMAP DISCOVERY
// -------------------------------
async function discoverSitemap(url: string) {
  const root = `${new URL(url).origin}/sitemap.xml`;

  try {
    const res = await axios.get(root, {
      headers: { 'User-Agent': USER_AGENT },
    });
    const xml = res.data;

    const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
    urlQueue.push(...urls);
  } catch {
    // ignore if no sitemap
  }
}

// -------------------------------
// SEO EXTRACTION
// -------------------------------
function extractSEO(html: string, url: string) {
  const $ = cheerio.load(html);

  const title = $('title').text() || '';
  const description = $('meta[name="description"]').attr('content') || '';
  const keywords = $('meta[name="keywords"]').attr('content') || '';

  const h1 = $('h1').first().text() || '';
  const links = $('a')
    .map((_, a) => $(a).attr('href'))
    .get()
    .filter((x) => x && x.startsWith('http'));

  const backlinks = links.filter((l) => domainOf(l) !== domainOf(url));

  const wordCount = $('body').text().split(/\s+/).length;

  const score = Math.min(100, Math.floor(wordCount / 20));

  return {
    title,
    description,
    keywords,
    h1,
    backlinks,
    wordCount,
    score,
  };
}

// -------------------------------
// CONTENT GAP DETECTION ENGINE
// -------------------------------

// Simple topic extraction from title, description, H1, keywords
function extractTopics(seo: any) {
  const text = [seo.title, seo.description, seo.h1, seo.keywords]
    .join(' ')
    .toLowerCase();

  const tokens = text.split(/\W+/).filter((t) => t.length > 3);

  const stopwords = new Set([
    'this',
    'that',
    'with',
    'from',
    'your',
    'have',
    'home',
    'energy',
    'upgrade',
    'grant',
    'ireland',
    'irish',
    'service',
    'about',
    'information',
    'website',
  ]);

  const filtered = tokens.filter((t) => !stopwords.has(t));

  const freq: Record<string, number> = {};
  filtered.forEach((t) => (freq[t] = (freq[t] || 0) + 1));

  return freq;
}

// Compare competitor topics vs your own site topics
function detectContentGaps(
  competitorTopics: Record<string, number>,
  myTopics: Record<string, number>,
) {
  const gaps: string[] = [];

  for (const topic in competitorTopics) {
    if (!myTopics[topic] && competitorTopics[topic] > 1) {
      gaps.push(topic);
    }
  }

  return gaps.slice(0, 20); // top 20 gaps
}

function updateMySiteTopics(seo: any, url: string) {
  if (url.includes('ecosmarthomes.ie')) {
    const topics = extractTopics(seo);
    for (const t in topics) {
      mySiteTopics[t] = (mySiteTopics[t] || 0) + topics[t];
    }
  }
}

// -------------------------------
// URL GENERATOR FOR CONTENT GAPS
// -------------------------------

function generateUrlSlug(topic: string) {
  return topic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumerics with hyphens
    .replace(/^-+|-+$/g, ''); // trim hyphens
}

function generateLandingPageUrls(gaps: string[]) {
  return gaps.map((topic) => {
    const slug = generateUrlSlug(topic);
    return `/` + slug;
  });
}

// -------------------------------
// SEO BRIEF GENERATOR
// -------------------------------

function generateSeoTitle(topic: string) {
  return `${topic.charAt(0).toUpperCase() + topic.slice(1)} Guide for Irish Homeowners`;
}

function generateMetaDescription(topic: string) {
  return `Learn about ${topic} for Irish homes — grants, upgrades, costs, and SEAI requirements explained clearly.`;
}

function generateH1(topic: string) {
  return `${topic.charAt(0).toUpperCase() + topic.slice(1)} Explained`;
}

function generateKeywordCluster(topic: string) {
  return [
    `${topic} ireland`,
    `${topic} guide`,
    `${topic} grants`,
    `${topic} cost`,
    `${topic} upgrade`,
    `${topic} seai`,
    `${topic} homeowners`,
  ];
}

function generateContentOutline(topic: string) {
  return [
    `Introduction to ${topic}`,
    `Why ${topic} matters for Irish homes`,
    `SEAI rules and grant eligibility`,
    `${topic} upgrade options`,
    `Costs and savings`,
    `Common mistakes`,
    `How EcoSmartHomes can help`,
  ];
}

function generateFaq(topic: string) {
  return [
    `What is ${topic}?`,
    `How much does ${topic} cost in Ireland?`,
    `Is there an SEAI grant for ${topic}?`,
    `Do I need a BER assessment for ${topic}?`,
    `How long does a ${topic} upgrade take?`,
  ];
}

function generateSchemaType(topic: string) {
  return 'FAQPage';
}

function generateSeoBrief(topic: string, url: string) {
  return {
    topic,
    suggestedUrl: url,
    title: generateSeoTitle(topic),
    metaDescription: generateMetaDescription(topic),
    h1: generateH1(topic),
    keywords: generateKeywordCluster(topic),
    outline: generateContentOutline(topic),
    fullOutline: generateFullContentOutline(topic),
    faq: generateFaq(topic),
    schema: generateSchemaType(topic),
  };
}

// -------------------------------
// AUTO-GENERATED CONTENT OUTLINE ENGINE
// -------------------------------

function generateFullContentOutline(topic: string) {
  const cap = topic.charAt(0).toUpperCase() + topic.slice(1);

  return [
    {
      section: `1. What is ${cap}?`,
      bullets: [
        `Clear definition of ${topic} in the context of Irish homes`,
        `Why ${topic} matters for energy efficiency`,
        `Common misconceptions`,
      ],
    },
    {
      section: `2. Why ${cap} Matters for Irish Homeowners`,
      bullets: [
        `Impact on comfort, heating bills, and BER rating`,
        `How ${topic} affects retrofit planning`,
        `Typical problems found in older Irish homes`,
      ],
    },
    {
      section: `3. SEAI Rules, Grants & Eligibility`,
      bullets: [
        `Relevant SEAI grant schemes`,
        `Eligibility criteria`,
        `Required documentation`,
        `BER requirements`,
        `How EcoSmartHomes handles grant paperwork`,
      ],
    },
    {
      section: `4. ${cap} Upgrade Options`,
      bullets: [
        `Available upgrade paths`,
        `Materials, methods, or technologies`,
        `Pros and cons of each option`,
        `Expected timelines`,
      ],
    },
    {
      section: `5. Costs, Savings & ROI`,
      bullets: [
        `Typical Irish pricing ranges`,
        `Grant offsets`,
        `Long-term savings`,
        `Payback period`,
      ],
    },
    {
      section: `6. Common Mistakes & How to Avoid Them`,
      bullets: [
        `Frequent homeowner errors`,
        `Contractor pitfalls`,
        `Compliance issues`,
      ],
    },
    {
      section: `7. How EcoSmartHomes Can Help`,
      bullets: [
        `Assessment process`,
        `Retrofit planning`,
        `Grant application support`,
        `Installation partners`,
      ],
    },
    {
      section: `8. Frequently Asked Questions`,
      bullets: [`Top 5 FAQs auto-generated from generateFaq(topic)`],
    },
    {
      section: `9. Recommended Internal Links`,
      bullets: [
        `/retrofit-guide`,
        `/ber-assessment`,
        `/heat-pump-installation`,
        `/solar-panels-ireland`,
      ],
    },
    {
      section: `10. Call to Action`,
      bullets: [
        `“Book your free home energy assessment”`,
        `“Check your grant eligibility”`,
        `“Talk to an EcoSmartHomes advisor”`,
      ],
    },
  ];
}

// -------------------------------
// LANDING PAGE TEMPLATE GENERATOR
// -------------------------------

function generateLandingPageTemplate(
  topic: string,
  seoBrief: any,
  outline: any,
) {
  const cap = topic.charAt(0).toUpperCase() + topic.slice(1);

  return {
    url: seoBrief.suggestedUrl,
    title: seoBrief.title,
    metaDescription: seoBrief.metaDescription,
    h1: seoBrief.h1,

    sections: outline.map((sectionObj: any) => ({
      heading: sectionObj.section,
      bullets: sectionObj.bullets,
    })),

    faq: seoBrief.faq,

    schema: {
      type: seoBrief.schema,
      faq: seoBrief.faq.map((q: string) => ({
        question: q,
        answer: `Information about ${topic} for Irish homeowners.`,
      })),
    },

    internalLinks: [
      '/retrofit-guide',
      '/ber-assessment',
      '/heat-pump-installation',
      '/solar-panels-ireland',
    ],

    cta: {
      heading: 'Ready to Improve Your Home’s Energy Performance?',
      buttons: [
        'Book Your Free Home Energy Assessment',
        'Check Your SEAI Grant Eligibility',
        'Talk to an EcoSmartHomes Advisor',
      ],
    },
  };
}

// -------------------------------
// INTERNAL LINKING PLAN GENERATOR
// -------------------------------

function generateInternalLinkingPlan(topic: string, suggestedUrl: string) {
  const cap = topic.charAt(0).toUpperCase() + topic.slice(1);

  // Core pages on your site
  const corePages = [
    '/retrofit-guide',
    '/ber-assessment',
    '/heat-pump-installation',
    '/solar-panels-ireland',
    '/grants',
    '/contact',
  ];

  // Anchor text suggestions
  const anchorTexts = [
    `${cap} guide`,
    `${cap} upgrade options`,
    `${cap} SEAI grants`,
    `${cap} cost in Ireland`,
    `${cap} for Irish homeowners`,
  ];

  return {
    topic,
    targetUrl: suggestedUrl,

    primaryLinks: [
      {
        from: '/retrofit-guide',
        anchor: `${cap} and retrofit planning`,
        placement: 'mid-content',
      },
      {
        from: '/ber-assessment',
        anchor: `${cap} impact on BER rating`,
        placement: 'intro',
      },
    ],

    secondaryLinks: corePages.map((page) => ({
      from: page,
      anchor: anchorTexts[Math.floor(Math.random() * anchorTexts.length)],
      placement: 'footer',
    })),

    reverseLinks: [
      {
        to: '/retrofit-guide',
        anchor: `Retrofit guide`,
      },
      {
        to: '/ber-assessment',
        anchor: `BER assessment`,
      },
    ],

    recommendedAnchors: anchorTexts,
  };
}

// -------------------------------
// SCHEMA VALIDATION ENGINE & BUILDERS
// -------------------------------

function validateSchemaBlock(schema: any) {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!schema) {
    return { isValid: true, errors, warnings };
  }

  let obj: any = {};
  try {
    if (typeof schema.json === 'string') {
      obj = JSON.parse(schema.json);
    } else if (schema['@type']) {
      obj = schema;
    } else if (schema.json && typeof schema.json === 'object') {
      obj = schema.json;
    }
  } catch {
    errors.push('Failed to parse JSON-LD string.');
    return { isValid: false, errors, warnings };
  }

  // Basic JSON-LD structure check
  if (!obj['@context'] || !obj['@type']) {
    errors.push('Missing @context or @type in JSON-LD schema.');
  }

  // FAQPage validation
  if (obj['@type'] === 'FAQPage') {
    if (!Array.isArray(obj.mainEntity) || obj.mainEntity.length === 0) {
      errors.push(
        'FAQPage schema must include mainEntity array with at least one question.',
      );
    } else {
      obj.mainEntity.forEach((q: any, idx: number) => {
        if (!q.name) errors.push(`FAQPage question ${idx + 1} missing 'name'.`);
        if (!q.acceptedAnswer || !q.acceptedAnswer.text) {
          errors.push(
            `FAQPage question ${idx + 1} missing acceptedAnswer.text.`,
          );
        }
      });
    }
  }

  // BreadcrumbList validation
  if (obj['@type'] === 'BreadcrumbList') {
    if (!Array.isArray(obj.itemListElement)) {
      errors.push('BreadcrumbList must include itemListElement array.');
    }
  }

  // Article validation
  if (obj['@type'] === 'Article') {
    if (!obj.headline) warnings.push('Article schema missing headline.');
    if (!obj.description) warnings.push('Article schema missing description.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

function buildFaqSchema(faqList: string[]): FAQPageSchema {
  const questions = faqList.map((faq) => {
    const [question, answer] = faq.includes('|')
      ? faq.split('|')
      : [
          faq,
          `Official EcoSmartHomes guide for Irish homeowners, including SEAI grant rules and costs.`,
        ];
    return { question: question.trim(), answer: answer.trim() };
  });

  const json = JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: questions.map((q) => ({
        '@type': 'Question',
        name: q.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: q.answer,
        },
      })),
    },
    null,
    2,
  );

  return {
    type: 'FAQPage',
    json,
    meta: { questions },
    valid: true,
  };
}

function buildArticleSchema(
  topic: string,
  suggestedUrl: string,
): ArticleSchema {
  const headline = `${topic} — EcoSmartHomes Ireland`;
  const description = `Learn about ${topic} with expert guidance from EcoSmartHomes Ireland.`;

  const json = JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: headline,
      description: description,
      url: suggestedUrl,
      publisher: {
        '@type': 'Organization',
        name: 'EcoSmartHomes Ireland',
      },
    },
    null,
    2,
  );

  return {
    type: 'Article',
    json,
    meta: {
      headline,
      description,
      url: suggestedUrl,
      publisher: 'EcoSmartHomes Ireland',
    },
    valid: true,
  };
}

function buildServiceSchema(topic: string): ServiceSchema {
  const json = JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      serviceType: topic,
      provider: {
        '@type': 'LocalBusiness',
        name: 'EcoSmartHomes Ireland',
        areaServed: 'Ireland',
      },
    },
    null,
    2,
  );

  return {
    type: 'Service',
    json,
    meta: {
      serviceType: topic,
      provider: {
        name: 'EcoSmartHomes Ireland',
        areaServed: 'Ireland',
      },
    },
    valid: true,
  };
}

function buildBreadcrumbSchema(
  topic: string,
  suggestedUrl: string,
): BreadcrumbListSchema {
  const items = [
    { name: 'Home', url: 'https://ecosmarthomes.ie', position: 1 },
    { name: topic, url: suggestedUrl, position: 2 },
  ];

  const json = JSON.stringify(
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item) => ({
        '@type': 'ListItem',
        position: item.position,
        name: item.name,
        item: item.url,
      })),
    },
    null,
    2,
  );

  return {
    type: 'BreadcrumbList',
    json,
    meta: { items },
    valid: true,
  };
}

function buildRawJsonLdSchema(blocks: string[]): RawJsonLdSchema {
  const json = blocks.join('\n');

  return {
    type: 'RawJsonLd',
    json,
    valid: true,
  };
}

// -------------------------------
// AUTO-GENERATED SCHEMA BLOCKS (FULL JSON-LD)
// -------------------------------

export function generateFullJsonLdSchema(
  topic: string,
  suggestedUrl: string,
  faqList: string[],
): FullJsonLdSchema {
  const faq = buildFaqSchema(faqList);
  const article = buildArticleSchema(topic, suggestedUrl);
  const service = buildServiceSchema(topic);
  const breadcrumbs = buildBreadcrumbSchema(topic, suggestedUrl);

  const raw = buildRawJsonLdSchema([
    faq.json,
    article.json,
    service.json,
    breadcrumbs.json,
  ]);

  faq.valid = validateSchemaBlock(faq).isValid;
  article.valid = validateSchemaBlock(article).isValid;
  service.valid = validateSchemaBlock(service).isValid;
  breadcrumbs.valid = validateSchemaBlock(breadcrumbs).isValid;
  raw.valid = true;

  return {
    faq,
    article,
    service,
    breadcrumbs,
    raw,
  };
}

// -------------------------------
// SCHEMA SELECTION MATRIX
// -------------------------------

export function selectSchemasForPageType(
  pageType: PageType,
  builders: FullJsonLdSchema,
): Partial<FullJsonLdSchema> {
  switch (pageType) {
    case 'article':
      return {
        article: builders.article,
        faq: builders.faq,
        breadcrumbs: builders.breadcrumbs,
      };

    case 'service':
      return {
        service: builders.service,
        breadcrumbs: builders.breadcrumbs,
      };

    case 'faq':
      return {
        faq: builders.faq,
      };

    case 'category':
      return {
        breadcrumbs: builders.breadcrumbs,
        raw: builders.raw,
      };
  }
}

// -------------------------------
// FULL ARTICLE DRAFT GENERATOR
// -------------------------------

function generateArticleDraft(
  topic: string,
  seoBrief: any,
  outline: any,
  template: any,
): string {
  const cap = topic.charAt(0).toUpperCase() + topic.slice(1);

  let draft = `# ${seoBrief.h1}\n\n`;
  draft += `${seoBrief.metaDescription}\n\n`;

  outline.forEach((section: any) => {
    draft += `## ${section.section}\n\n`;
    section.bullets.forEach((bullet: string) => {
      draft += `- ${bullet}\n`;
    });
    draft += `\n`;
  });

  draft += `## Frequently Asked Questions\n\n`;
  seoBrief.faq.forEach((q: string) => {
    draft += `### ${q}\n`;
    draft += `Information about ${topic} for Irish homeowners.\n\n`;
  });

  draft += `## Call to Action\n\n`;
  draft += `${template.cta.heading}\n\n`;
  template.cta.buttons.forEach((btn: string) => {
    draft += `- ${btn}\n`;
  });

  return draft;
}

// -------------------------------
// HTML LANDING PAGE TEMPLATE GENERATOR
// -------------------------------

function generateHtmlLandingPage(
  topic: string,
  seoBrief: any,
  outline: any,
  template: any,
  schema: any,
): string {
  const cap = topic.charAt(0).toUpperCase() + topic.slice(1);

  const faqSchemaObj = schema?.faq
    ? typeof schema.faq.json === 'string'
      ? JSON.parse(schema.faq.json)
      : schema.faq
    : {};
  const articleSchemaObj = schema?.article
    ? typeof schema.article.json === 'string'
      ? JSON.parse(schema.article.json)
      : schema.article
    : {};
  const breadcrumbSchemaObj = schema?.breadcrumbs
    ? typeof schema.breadcrumbs.json === 'string'
      ? JSON.parse(schema.breadcrumbs.json)
      : schema.breadcrumbs
    : {};

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${seoBrief.title}</title>
  <meta name="description" content="${seoBrief.metaDescription}" />

  <!-- JSON-LD Schema -->
  <script type="application/ld+json">
  ${JSON.stringify(faqSchemaObj, null, 2)}
  </script>

  <script type="application/ld+json">
  ${JSON.stringify(breadcrumbSchemaObj, null, 2)}
  </script>

  <script type="application/ld+json">
  ${JSON.stringify(articleSchemaObj, null, 2)}
  </script>
  <script>
    document.addEventListener("DOMContentLoaded", () => {
      const start = Date.now();
      let maxScroll = 0;

      window.addEventListener("scroll", () => {
        const scrolled = window.scrollY + window.innerHeight;
        const total = document.body.scrollHeight || 1;
        maxScroll = Math.max(maxScroll, Math.min(1, scrolled / total));
      });

      window.addEventListener("beforeunload", () => {
        try {
          const payload = JSON.stringify({
            slug: window.location.pathname.replace("/content/", "").replace(".html", "").replace(/^[/]/, ""),
            dwellTime: Date.now() - start,
            scrollDepth: maxScroll
          });
          if (navigator.sendBeacon) {
            navigator.sendBeacon("http://localhost:3000/telemetry", payload);
          } else {
            fetch("http://localhost:3000/telemetry", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: payload,
              keepalive: true
            });
          }
        } catch (e) {}
      });
    });
  </script>
</head>

<body>

  <header>
    <h1>${seoBrief.h1}</h1>
    <p>${seoBrief.metaDescription}</p>
  </header>

  <main>
    ${outline
      .map(
        (section: any) => `
      <section>
        <h2>${section.section}</h2>
        <ul>
          ${section.bullets.map((b: string) => `<li>${b}</li>`).join('')}
        </ul>
      </section>
    `,
      )
      .join('')}

    <section>
      <h2>Frequently Asked Questions</h2>
      ${seoBrief.faq
        .map(
          (q: string) => `
        <div class="faq-item">
          <h3>${q}</h3>
          <p>Information about ${topic} for Irish homeowners.</p>
        </div>
      `,
        )
        .join('')}
    </section>

    <section class="cta">
      <h2>${template.cta.heading}</h2>
      <ul>
        ${template.cta.buttons.map((btn: string) => `<li>${btn}</li>`).join('')}
      </ul>
    </section>

  </main>

  <footer>
    <nav>
      <ul>
        ${template.internalLinks
          .map(
            (link: string) =>
              `<li><a href="${link}">${link.replace('/', '')}</a></li>`,
          )
          .join('')}
      </ul>
    </nav>
  </footer>

</body>
</html>
`;

  return html.trim();
}

// -------------------------------
// PAGE TYPE AUTO-CLASSIFIER
// -------------------------------

function classifyPageType(
  topic: string,
  outline: any,
  seoBrief: any,
): PageType {
  const t = topic.toLowerCase();

  // FAQ pages
  if (seoBrief.faq.length >= 6 || t.includes('faq')) {
    return 'faq';
  }

  // Service pages (retrofit, heat pumps, BER, insulation, solar)
  const serviceKeywords = [
    'retrofit',
    'heat pump',
    'insulation',
    'airtightness',
    'solar',
    'ber',
    'assessment',
    'upgrade',
    'installation',
    'service',
  ];

  if (serviceKeywords.some((k) => t.includes(k))) {
    return 'service';
  }

  // Category pages (broad topics)
  if (outline.length <= 4 || t.includes('guide') === false) {
    return 'category';
  }

  // Article pages (default)
  return 'article';
}

// -------------------------------
// SERP COMPETITIVENESS SCORING ENGINE
// -------------------------------

function scoreSerpCompetitiveness(
  topic: string,
  seoBrief: any,
  outline: any,
  pageType: PageType,
) {
  const t = topic.toLowerCase();

  let score = 0;

  // Keyword competitiveness heuristics
  const highCompetitionKeywords = [
    'heat pump',
    'solar',
    'ber',
    'retrofit',
    'insulation',
    'grants',
    'energy upgrade',
  ];

  if (highCompetitionKeywords.some((k) => t.includes(k))) {
    score += 35; // highly competitive
  }

  // Outline depth (longer outlines = easier ranking)
  if (outline.length >= 10) {
    score -= 15; // easier to rank
  } else if (outline.length <= 4) {
    score += 10; // harder to rank
  }

  // FAQ density (more FAQs = easier ranking)
  if (seoBrief.faq.length >= 6) {
    score -= 10;
  }

  // Page type difficulty
  if (pageType === 'service') score += 20; // service pages are competitive
  if (pageType === 'faq') score -= 10; // FAQ pages are easier
  if (pageType === 'category') score += 15;

  // Keyword length (short keywords = harder)
  if (topic.split(' ').length <= 2) {
    score += 10;
  }

  // Clamp score between 0–100
  score = Math.max(0, Math.min(100, score));

  return {
    topic,
    difficulty: score,
    level: score >= 70 ? 'Hard' : score >= 40 ? 'Moderate' : 'Easy',
  };
}

// -------------------------------
// CONTENT QUALITY SCORING ENGINE
// -------------------------------

function scoreContentQuality(
  topic: string,
  seoBrief: any,
  outline: any,
  articleDraft: string,
  schemaBundle: any,
) {
  let score = 0;

  // Readability: long drafts = better coverage
  const wordCount = articleDraft.split(/\s+/).length;
  if (wordCount >= 1200) score += 25;
  else if (wordCount >= 800) score += 15;
  else score += 5;

  // Outline completeness
  if (outline.length >= 10) score += 20;
  else if (outline.length >= 6) score += 10;

  // FAQ richness
  if (seoBrief.faq.length >= 6) score += 10;
  else if (seoBrief.faq.length >= 3) score += 5;

  // Schema completeness
  const schemaChecks = [
    schemaBundle?.faq,
    schemaBundle?.service,
    schemaBundle?.breadcrumbs,
    schemaBundle?.article,
  ];

  schemaChecks.forEach((schema) => {
    if (schema && (schema.json || schema['@type'] || schema.type)) score += 5;
  });

  // CTA strength
  if (seoBrief.cta && seoBrief.cta.heading) score += 5;

  // Keyword density (simple heuristic)
  const keyword = topic.toLowerCase();
  const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const keywordCount = (
    articleDraft.toLowerCase().match(new RegExp(escapedKeyword, 'g')) || []
  ).length;

  if (keywordCount >= 8) score += 10;
  else if (keywordCount >= 4) score += 5;

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  return {
    topic,
    score,
    grade:
      score >= 85
        ? 'A — Excellent'
        : score >= 70
          ? 'B — Strong'
          : score >= 55
            ? 'C — Needs Improvement'
            : 'D — Weak',
  };
}

// -------------------------------
// SERP SIMULATION (simple)
// -------------------------------
function serpScore(seo: any) {
  let score = 0;

  if (seo.title.length > 10) score += 10;
  if (seo.description.length > 20) score += 10;
  if (seo.keywords.length > 5) score += 10;
  if (seo.h1.length > 5) score += 10;
  if (seo.wordCount > 300) score += 20;
  if (seo.backlinks.length > 3) score += 20;

  return Math.min(score, 100);
}

function broadcastMessage(target: any, data: string) {
  if (target && 'clients' in target && target.clients) {
    target.clients.forEach((client: any) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  } else if (
    target &&
    typeof target.send === 'function' &&
    target.readyState === WebSocket.OPEN
  ) {
    target.send(data);
  }
}

// -------------------------------
// CRAWL LOOP
// -------------------------------
async function crawlUrl(ws: any, url: string) {
  if (visited.has(url)) return;
  visited.add(url);

  try {
    const res = await fetchWithRetry(url);
    const html = res.data;

    const seo = extractSEO(html, url);
    const serp = serpScore(seo);

    updateMySiteTopics(seo, url);
    const topics = extractTopics(seo);
    const contentGaps = detectContentGaps(topics, mySiteTopics);
    const proposedUrls = generateLandingPageUrls(contentGaps);

    xp += serp;
    visibility += Math.floor(seo.score / 10);

    broadcastMessage(
      ws,
      JSON.stringify({
        type: 'crawl_event',
        url,
        status: 'indexed',
        code: res.status,
        size: html.length,
        xp,
        visibility,
        seo,
        serp,
        topics,
        contentGaps,
        proposedUrls,
        timestamp: Date.now(),
      }),
    );

    console.log(`Indexed: ${url}`);

    if (!url.includes('ecosmarthomes.ie')) {
      const gaps = detectContentGaps(topics, mySiteTopics);

      if (gaps.length > 0) {
        const suggestedUrls = generateLandingPageUrls(gaps);
        const seoBriefs = gaps.map((topic, i) =>
          generateSeoBrief(topic, suggestedUrls[i]),
        );
        const contentOutlines = gaps.map((topic) =>
          generateFullContentOutline(topic),
        );
        const pageTypes = gaps.map((topic, i) =>
          classifyPageType(topic, contentOutlines[i], seoBriefs[i]),
        );
        const serpScores = gaps.map((topic, i) =>
          scoreSerpCompetitiveness(
            topic,
            seoBriefs[i],
            contentOutlines[i],
            pageTypes[i],
          ),
        );
        const landingPageTemplates = gaps.map((topic, i) =>
          generateLandingPageTemplate(topic, seoBriefs[i], contentOutlines[i]),
        );
        const internalLinkingPlans = gaps.map((topic, i) =>
          generateInternalLinkingPlan(topic, suggestedUrls[i]),
        );
        const selectedSchemas = gaps.map((topic, i) => {
          const allSchemas = generateFullJsonLdSchema(
            topic,
            suggestedUrls[i],
            seoBriefs[i].faq,
          );
          return selectSchemasForPageType(pageTypes[i], allSchemas);
        });
        const articleDrafts = gaps.map((topic, i) =>
          generateArticleDraft(
            topic,
            seoBriefs[i],
            contentOutlines[i],
            landingPageTemplates[i],
          ),
        );
        const contentQualityScores = gaps.map((topic, i) =>
          scoreContentQuality(
            topic,
            seoBriefs[i],
            contentOutlines[i],
            articleDrafts[i],
            selectedSchemas[i],
          ),
        );

        contentQualityScores.forEach((qScore, i) => {
          if (qScore.score < 70) {
            const slug = suggestedUrls[i].replace('/', '');
            rewriteQueue.push({
              slug,
              articleDraft: articleDrafts[i],
              seoBrief: seoBriefs[i],
              outline: contentOutlines[i],
              schemaBundle: selectedSchemas[i],
              createdAt: Date.now(),
            });
            console.log(
              `Content Gap Detector: Page '${slug}' scored ${qScore.score} (${qScore.grade}). Added to rewriteQueue.`,
            );
          }
        });
        const htmlTemplates = gaps.map((topic, i) =>
          generateHtmlLandingPage(
            topic,
            seoBriefs[i],
            contentOutlines[i],
            landingPageTemplates[i],
            selectedSchemas[i],
          ),
        );

        const schemaValidation = selectedSchemas.map((bundle: any) => {
          return {
            faq: validateSchemaBlock(bundle.faq),
            article: validateSchemaBlock(bundle.article),
            service: validateSchemaBlock(bundle.service),
            breadcrumb: validateSchemaBlock(bundle.breadcrumbs),
            raw: validateSchemaBlock(bundle.raw),
          };
        });

        // SERP Competitor Diff Engine Patching
        for (let i = 0; i < gaps.length; i++) {
          const topic = gaps[i];
          const primaryKeyword =
            (seoBriefs[i] as any)?.primaryKeyword ||
            seoBriefs[i]?.topic ||
            topic;
          try {
            const competitors = await getTopCompetitors(primaryKeyword);
            const missingTopics = diffCompetitors(
              competitors,
              contentOutlines[i],
            );

            if (missingTopics.length > 0) {
              const patchedDraft = patchContent(
                articleDrafts[i],
                missingTopics,
              );

              const newScore = scoreContentQuality(
                topic,
                seoBriefs[i],
                contentOutlines[i],
                patchedDraft,
                selectedSchemas[i],
              );

              if (newScore.score > contentQualityScores[i].score) {
                const slug = suggestedUrls[i].replace('/', '');
                articleDrafts[i] = patchedDraft;
                htmlTemplates[i] = generateHtmlLandingPage(
                  topic,
                  seoBriefs[i],
                  contentOutlines[i],
                  landingPageTemplates[i],
                  selectedSchemas[i],
                );
                contentQualityScores[i] = newScore;

                console.log(
                  `SERP Diff Patch: ${slug} improved to Grade ${newScore.grade} (${newScore.score}/100) with ${missingTopics.length} missing topics`,
                );

                // Broadcast WS event
                const payload = JSON.stringify({
                  type: 'serp_diff',
                  slug,
                  missingTopics,
                  message: `SERP Diff: Added ${missingTopics.length} missing competitor topics to ${slug}.html`,
                  timestamp: Date.now(),
                });

                if (wss && wss.clients) {
                  wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                      client.send(payload);
                    }
                  });
                }
              }
            }
          } catch (err) {
            console.error(`SERP Diff Patch failed for ${topic}:`, err);
          }
        }

        // Phase 7 — Semantic Entity Enrichment Pipeline
        for (let i = 0; i < gaps.length; i++) {
          const topic = gaps[i];
          const entities = findRelevantEntities(articleDrafts[i], seoBriefs[i]);

          if (entities.length > 0) {
            const enrichedDraft = injectEntities(articleDrafts[i], entities);

            const newScore = scoreContentQuality(
              topic,
              seoBriefs[i],
              contentOutlines[i],
              enrichedDraft,
              selectedSchemas[i],
            );

            if (newScore.score > contentQualityScores[i].score) {
              const slug = suggestedUrls[i].replace('/', '');
              articleDrafts[i] = enrichedDraft;
              htmlTemplates[i] = generateHtmlLandingPage(
                topic,
                seoBriefs[i],
                contentOutlines[i],
                landingPageTemplates[i],
                selectedSchemas[i],
              );
              contentQualityScores[i] = newScore;

              console.log(
                `Semantic Enrichment: ${slug} improved to Grade ${newScore.grade} (${newScore.score}/100) with ${entities.length} entities`,
              );

              // Step 5 — Dashboard Events
              const payload = JSON.stringify({
                type: 'semantic_enrichment',
                slug,
                entities,
                message: `Semantic Enrichment: Added ${entities.slice(0, 3).join(', ')} to ${slug}.html`,
                timestamp: Date.now(),
              });

              if (wss && wss.clients) {
                wss.clients.forEach((client) => {
                  if (client.readyState === WebSocket.OPEN) {
                    client.send(payload);
                  }
                });
              }
            }
          }
        }

        // Phase 10 — Adaptive Content Personalisation Pipeline
        for (let i = 0; i < gaps.length; i++) {
          const topic = gaps[i];
          const seoBrief = seoBriefs[i];
          const intent = detectIntent(seoBrief);
          const profile = intentProfiles[intent];

          if (profile) {
            const personalisedDraft = personaliseContent(
              articleDrafts[i],
              profile,
            );

            const newScore = scoreContentQuality(
              topic,
              seoBrief,
              contentOutlines[i],
              personalisedDraft,
              selectedSchemas[i],
            );

            if (newScore.score > contentQualityScores[i].score) {
              const slug = suggestedUrls[i].replace('/', '');
              articleDrafts[i] = personalisedDraft;
              htmlTemplates[i] = generateHtmlLandingPage(
                topic,
                seoBrief,
                contentOutlines[i],
                landingPageTemplates[i],
                selectedSchemas[i],
              );
              contentQualityScores[i] = newScore;

              console.log(
                `Adaptive Personalisation: ${slug} improved to Grade ${newScore.grade} (${newScore.score}/100) for '${intent}' intent`,
              );

              // Step 5 — Dashboard Events
              const payload = JSON.stringify({
                type: 'adaptive_personalisation',
                slug,
                intent,
                profile,
                message: `Adaptive Personalisation: ${slug}.html personalized for '${intent}' intent`,
                timestamp: Date.now(),
              });

              if (wss && wss.clients) {
                wss.clients.forEach((client) => {
                  if (client.readyState === WebSocket.OPEN) {
                    client.send(payload);
                  }
                });
              }
            }
          }
        }

        const publishedPages = gaps.map((topic, i) => {
          const slug = suggestedUrls[i].replace('/', '');
          const seoBrief = seoBriefs[i];
          const keywords = seoBrief?.keywords || [topic];

          // Steps 2 & 3: Topic Cluster Registration & Pillar Page Auto-Generation
          const core = extractCoreTopic(seoBrief);
          if (!topicClusters[core]) {
            topicClusters[core] = {
              pillar: null,
              clusters: [],
            };
          }

          // Authority Graph: Cluster Node
          authorityGraph.nodes[core] = {
            id: core,
            type: 'cluster',
            score: 10,
            label: core,
            updatedAt: Date.now(),
          };

          if (!topicClusters[core].pillar) {
            const pillarSlug = `${core}-guide`;
            const pillarHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${seoBrief?.topic || core} — Complete Guide for Irish Homeowners</title>
</head>
<body>
  <h1>${seoBrief?.topic || core} — Complete Guide for Irish Homeowners</h1>
  <p>This is the master pillar guide covering everything related to ${seoBrief?.topic || core} in Ireland.</p>
  <section id="cluster-links"></section>
</body>
</html>`;
            topicClusters[core].pillar = pillarSlug;
            publishPageToGitHub(pillarSlug, pillarHtml);

            // Authority Graph: Pillar Node
            authorityGraph.nodes[pillarSlug] = {
              id: pillarSlug,
              type: 'pillar',
              score: 20,
              label: `${seoBrief?.topic || core} Guide`,
              updatedAt: Date.now(),
            };

            console.log(
              `Topic Cluster Builder: Created Pillar Page '${pillarSlug}' for core topic '${core}'`,
            );
          }

          // Step 4: Add Cluster Pages
          if (!topicClusters[core].clusters.includes(slug)) {
            topicClusters[core].clusters.push(slug);
          }

          // Authority Graph: Entity Nodes & Page Node
          const pageEntities = findRelevantEntities(articleDrafts[i], seoBrief);
          pageEntities.forEach((entity) => {
            authorityGraph.nodes[entity] = {
              id: entity,
              type: 'entity',
              score: 1,
              label: entity,
              updatedAt: Date.now(),
            };

            // Edge: Page -> Entity
            authorityGraph.edges.push({
              from: slug,
              to: entity,
              type: 'mentions',
            });
          });

          authorityGraph.nodes[slug] = {
            id: slug,
            type: 'page',
            score: contentQualityScores[i]?.score || 75,
            cluster: core,
            entities: pageEntities,
            label: slug,
            updatedAt: Date.now(),
          };

          // Edge: Page -> Cluster
          authorityGraph.edges.push({
            from: slug,
            to: core,
            type: 'belongs_to',
          });

          const pillarSlug = topicClusters[core].pillar;
          if (pillarSlug) {
            // Edge: Cluster -> Pillar
            authorityGraph.edges.push({
              from: core,
              to: pillarSlug,
              type: 'pillar_of',
            });

            // Edge: Pillar -> Cluster Pages
            topicClusters[core].clusters.forEach((c) => {
              authorityGraph.edges.push({
                from: pillarSlug,
                to: c,
                type: 'links_to',
              });
            });
          }

          // Step 5: Auto-Link Clusters → Pillar
          let finalHtml = htmlTemplates[i];
          if (pillarSlug && !finalHtml.includes(pillarSlug)) {
            finalHtml = finalHtml.replace(
              '</body>',
              `<p class="cluster-pillar-link">Learn more in our complete guide: <a href="/content/${pillarSlug}.html">${seoBrief?.topic || core} Guide</a></p></body>`,
            );
          }

          publishingQueue.push({
            slug,
            html: finalHtml,
            keywords,
            createdAt: Date.now(),
          });

          const pub = publishPageToGitHub(slug, finalHtml);
          injectInternalLinks(slug, keywords);

          // Step 6: Auto-Link Pillar → Clusters
          updatePillar(core);

          // Step 7: Dashboard Events
          const payload = JSON.stringify({
            type: 'topic_cluster',
            core,
            pillar: topicClusters[core].pillar,
            clusters: topicClusters[core].clusters,
            message: `Pillar Updated: ${topicClusters[core].clusters.length} cluster page(s) linked to ${topicClusters[core].pillar}.html`,
            timestamp: Date.now(),
          });

          if (wss && wss.clients) {
            wss.clients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(payload);
              }
            });
          }

          return pub;
        });

        broadcastQueueUpdate();

        broadcastMessage(
          ws,
          JSON.stringify({
            type: 'content_gap',
            url,
            gaps,
            suggestedUrls,
            pageTypes,
            serpScores,
            contentQualityScores,
            seoBriefs,
            contentOutlines,
            landingPageTemplates,
            internalLinkingPlans,
            schemaBlocks: selectedSchemas,
            jsonLdSchemas: selectedSchemas,
            schemaValidation,
            articleDrafts,
            htmlTemplates,
            publishedPages,
            timestamp: Date.now(),
          }),
        );

        console.log('HTML Landing Page Templates generated:', htmlTemplates);
      }
    }

    // Add discovered links to queue
    seo.backlinks.forEach((l) => urlQueue.push(l));

    // Try sitemap
    discoverSitemap(url);
  } catch (err: any) {
    broadcastMessage(
      ws,
      JSON.stringify({
        type: 'crawl_event',
        url,
        status: 'error',
        code: err.response?.status || 500,
        xp,
        visibility,
        timestamp: Date.now(),
      }),
    );

    console.log(`Error indexing: ${url}`);
  }
}

// -------------------------------
// HEARTBEAT
// -------------------------------
function startHeartbeat(ws: WebSocket) {
  setInterval(() => {
    ws.send(
      JSON.stringify({
        type: 'heartbeat',
        timestamp: Date.now(),
        status: 'alive',
      }),
    );
  }, 2000);
}

// -------------------------------
// MAIN LOOP
// -------------------------------
function startCrawler(ws: WebSocket) {
  setInterval(async () => {
    const url = urlQueue.shift();
    if (!url) return;

    await crawlUrl(ws, url);
  }, 3500);
}

// -------------------------------
// CRAWL SCHEDULING & PERSISTENCE
// -------------------------------
const scheduleStateFile = './schedule-state.json';

interface ScheduleState {
  daily: number;
  weekly: number;
  monthly: number;
}

function loadScheduleState(): ScheduleState {
  try {
    return JSON.parse(fs.readFileSync(scheduleStateFile, 'utf8'));
  } catch {
    return { daily: 0, weekly: 0, monthly: 0 };
  }
}

function saveScheduleState(state: ScheduleState) {
  try {
    fs.writeFileSync(scheduleStateFile, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error('Failed to save schedule state:', err);
  }
}

const scheduleState = loadScheduleState();

// Daily crawl at 03:00
schedule.scheduleJob('0 3 * * *', () => {
  const now = Date.now();
  if (now - scheduleState.daily < 20 * 60 * 60 * 1000) {
    console.log('⏰ Daily crawl skipped (already executed recently)');
    return;
  }
  scheduleState.daily = now;
  saveScheduleState(scheduleState);
  console.log('⏰ Daily crawl triggered (03:00)');
  urlQueue.push(
    'https://www.seai.ie',
    'https://www.electricireland.ie',
    'https://www.supervalu.ie',
    'https://www.lidl.ie',
  );
});

// Weekly crawl every Monday at 04:00
schedule.scheduleJob('0 4 * * 1', () => {
  const now = Date.now();
  if (now - scheduleState.weekly < 6 * 24 * 60 * 60 * 1000) {
    console.log('📅 Weekly crawl skipped (already executed recently)');
    return;
  }
  scheduleState.weekly = now;
  saveScheduleState(scheduleState);
  console.log('📅 Weekly crawl triggered (Monday 04:00)');
  urlQueue.push(
    'https://www.gov.ie/en/publication/home-energy-upgrades/',
    'https://www.seai.ie/home-energy/',
    'https://www.seai.ie/grants/',
  );
});

// Monthly audit on the 1st at 05:00
schedule.scheduleJob('0 5 1 * *', () => {
  const now = Date.now();
  if (now - scheduleState.monthly < 25 * 24 * 60 * 60 * 1000) {
    console.log('🧾 Monthly audit skipped (already executed recently)');
    return;
  }
  scheduleState.monthly = now;
  saveScheduleState(scheduleState);
  console.log('🧾 Monthly audit triggered (1st of month 05:00)');
  urlQueue.push(
    'https://www.seai.ie',
    'https://www.gov.ie',
    'https://www.electricireland.ie',
    'https://www.bordgaisenergy.ie',
    'https://www.sseairtricity.com',
  );
});

// Scheduled Publishing Engine (Daily at 09:00)
schedule.scheduleJob('0 9 * * *', async () => {
  console.log('⏰ Scheduled Publishing: Running daily job…');

  if (publishingQueue.length === 0) {
    console.log('No queued pages to publish.');
    return;
  }

  const nextPage = publishingQueue.shift(); // FIFO
  if (!nextPage) return;

  const { slug, html, keywords } = nextPage;

  // Publish to GitHub
  await publishPageToGitHub(slug, html);

  // Inject internal links
  injectInternalLinks(slug, keywords);

  // Dashboard WebSocket Event
  const payload = JSON.stringify({
    type: 'scheduled_publish',
    slug,
    message: `Scheduled Publish: ${slug}.html released`,
    timestamp: Date.now(),
  });

  if (wss && wss.clients) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }

  broadcastQueueUpdate();

  console.log(`⏰ Scheduled Publishing: Published ${slug}`);
});

// Scheduled Content Rewrite Engine (Daily at 09:30)
schedule.scheduleJob('30 9 * * *', async () => {
  console.log('🛠️ Scheduled Rewrite: Running daily job…');

  if (rewriteQueue.length === 0) {
    console.log('No pages to rewrite.');
    return;
  }

  const next = rewriteQueue.shift();
  if (!next) return;

  const { slug, articleDraft, seoBrief, outline, schemaBundle } = next;

  const improvedDraft = rewriteContent(articleDraft, seoBrief, outline);

  // Re-score content quality
  const newScore = scoreContentQuality(
    seoBrief?.topic || slug,
    seoBrief || {},
    outline || [],
    improvedDraft,
    schemaBundle || {},
  );

  // Publish only if improved to Grade A or B (>= 70)
  if (newScore.score >= 70) {
    const fullHtml = generateHtmlLandingPage(
      seoBrief?.topic || slug,
      seoBrief || {},
      outline || [],
      '',
      schemaBundle || {},
    );
    await publishPageToGitHub(slug, fullHtml);
    injectInternalLinks(slug, seoBrief?.keywords || []);

    console.log(
      `🛠️ Rewrite Success: ${slug} upgraded to Grade ${newScore.grade} (Score: ${newScore.score})`,
    );
  } else {
    console.log(
      `🛠️ Rewrite Incomplete: ${slug} still below threshold (${newScore.score}). Re-queuing for future iteration.`,
    );
    rewriteQueue.push(next); // retry later
  }

  // Dashboard WebSocket event
  const payload = JSON.stringify({
    type: 'rewrite_event',
    slug,
    newGrade: newScore.grade,
    newScore: newScore.score,
    message: `Scheduled Rewrite: ${slug} updated to Grade ${newScore.grade} (${newScore.score}/100)`,
    timestamp: Date.now(),
  });

  if (wss && wss.clients) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }
});

// Authority Graph Engine Auto-Boost Job (Daily at 11:00)
schedule.scheduleJob('0 11 * * *', async () => {
  console.log(
    '⚡ Authority Graph Engine: Running daily weak node auto-boost job…',
  );
  const weakNodes = findWeakNodes();

  if (weakNodes.length === 0) {
    console.log('Authority Graph: No weak nodes detected.');
    return;
  }

  for (const nodeKey of weakNodes) {
    const node = authorityGraph.nodes[nodeKey];
    if (!node) continue;

    if (node.type === 'page') {
      console.log(
        `Authority Graph: Boosting weak page node '${nodeKey}' via rewriteQueue.`,
      );
      const exists = rewriteQueue.some((item) => item.slug === nodeKey);
      if (!exists) {
        rewriteQueue.push({
          slug: nodeKey,
          articleDraft: `<section><h1>${nodeKey.replace(/-/g, ' ')}</h1><p>Home energy retrofitting overview.</p></section>`,
          seoBrief: { topic: nodeKey.replace(/-/g, ' '), keywords: [nodeKey] },
          outline: ['Overview', 'SEAI Grants', 'Installation'],
          schemaBundle: {},
          createdAt: Date.now(),
        });
      }
    }

    if (node.type === 'entity') {
      console.log(
        `Authority Graph: Boosting entity node '${nodeKey}' by distributing across page network.`,
      );
      node.score = (node.score || 0) + 10;
    }

    if (node.type === 'cluster') {
      console.log(
        `Authority Graph: Boosting cluster node '${nodeKey}' with new sub-topics.`,
      );
      node.score = (node.score || 0) + 15;
    }
  }

  // Dashboard WebSocket event
  const payload = JSON.stringify({
    type: 'authority_graph_update',
    weakNodes: findWeakNodes(),
    message: `Authority Graph: Auto-boosted ${weakNodes.length} weak node(s) across site`,
    timestamp: Date.now(),
  });

  if (wss && wss.clients) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }
});

// Real-Time SERP Volatility Monitor Automated Response Job (Every 30 mins)
schedule.scheduleJob('*/30 * * * *', async () => {
  const keyword = 'heat pump costs ireland';
  const snapshot = await getSerpSnapshot(keyword);

  const volatility = detectVolatility(keyword);
  if (!volatility || volatility.length === 0) return;

  console.log('⚡ SERP Volatility Detected:', volatility);

  // Trigger automated fixes
  volatility.forEach((change) => {
    if (change.type === 'new_entry') {
      console.log(
        `SERP Volatility: Competitor surge for '${keyword}'. Triggering competitor diff patch.`,
      );
    }

    if (
      change.type === 'rank_change' &&
      change.to &&
      change.from &&
      change.to > change.from
    ) {
      console.log(
        `SERP Volatility: Rank drop for '${keyword}' (${change.from} -> ${change.to}). Boosting page quality and links.`,
      );
      const targetSlug = keyword.toLowerCase().split(' ').slice(0, 2).join('-');
      const exists = rewriteQueue.some((item) => item.slug === targetSlug);
      if (!exists) {
        rewriteQueue.push({
          slug: targetSlug,
          articleDraft: `<section><h1>${keyword}</h1><p>Comprehensive guide to ${keyword} in Ireland.</p></section>`,
          seoBrief: { topic: keyword, keywords: [keyword] },
          outline: ['Costs Overview', 'SEAI Grants', 'Installation Options'],
          schemaBundle: {},
          createdAt: Date.now(),
        });
      }
    }
  });

  // Dashboard WebSocket event
  const payload = JSON.stringify({
    type: 'serp_volatility',
    keyword,
    volatility,
    message: `SERP Volatility: Detected ${volatility.length} ranking shift(s) for '${keyword}'`,
    timestamp: Date.now(),
  });

  if (wss && wss.clients) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }
});

// Behaviour-Driven Content Fixes Job (Every 20 mins)
schedule.scheduleJob('*/20 * * * *', async () => {
  for (const slug of Object.keys(behaviouralTelemetry)) {
    const behaviour = analyseBehaviour(slug);
    if (!behaviour) continue;

    const { avgDwell, avgScroll } = behaviour;

    // Low engagement triggers fixes
    if (avgDwell < 15000 || avgScroll < 0.4) {
      console.log(
        `⚡ Behavioural Fix Triggered for ${slug} (Dwell: ${Math.round(avgDwell / 1000)}s, Scroll: ${Math.round(avgScroll * 100)}%)`,
      );

      const exists = rewriteQueue.some((item) => item.slug === slug);
      if (!exists) {
        rewriteQueue.push({
          slug,
          articleDraft: `<section><h1>${slug.replace(/-/g, ' ')}</h1><p>Optimized energy efficiency retrofitting guide.</p></section>`,
          seoBrief: { topic: slug.replace(/-/g, ' '), keywords: [slug] },
          outline: ['Overview', 'SEAI Grants', 'Installation'],
          schemaBundle: {},
          createdAt: Date.now(),
        });
      }

      // Dashboard event
      const payload = JSON.stringify({
        type: 'behavioural_telemetry',
        slug,
        avgDwell,
        avgScroll,
        action: 'boost_triggered',
        message: `Behavioural Telemetry: Low engagement on ${slug}.html (Dwell: ${Math.round(avgDwell / 1000)}s, Scroll: ${Math.round(avgScroll * 100)}%). Triggered content boost.`,
        timestamp: Date.now(),
      });

      if (wss && wss.clients) {
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
          }
        });
      }
    }
  }
});

// Predictive Ranking Engine Automated Pre-Emptive Fixes Job (Every 45 mins)
schedule.scheduleJob('*/45 * * * *', async () => {
  const keyword = 'heat pump costs ireland';

  const trend = analyseRankingTrend(keyword);
  const prediction = predictMovement(trend);

  if (!prediction) return;

  console.log(`⚡ Predictive Ranking: ${prediction} detected for '${keyword}'`);

  if (prediction === 'likely_drop') {
    console.log(
      `Predictive Ranking: Pre-emptively patching '${keyword}' before drop occurs.`,
    );
    const targetSlug = keyword.toLowerCase().split(' ').slice(0, 2).join('-');
    const exists = rewriteQueue.some((item) => item.slug === targetSlug);
    if (!exists) {
      rewriteQueue.push({
        slug: targetSlug,
        articleDraft: `<section><h1>${keyword}</h1><p>Comprehensive guide to ${keyword} in Ireland.</p></section>`,
        seoBrief: { topic: keyword, keywords: [keyword] },
        outline: ['Costs Overview', 'SEAI Grants', 'Installation Options'],
        schemaBundle: {},
        createdAt: Date.now(),
      });
    }
  }

  if (prediction === 'likely_rise') {
    console.log(
      `Predictive Ranking: Strengthening topic cluster for '${keyword}' to amplify momentum.`,
    );
  }

  // Dashboard event
  const payload = JSON.stringify({
    type: 'predictive_ranking',
    keyword,
    trend,
    prediction,
    message: `Predictive Ranking: ${prediction} detected for '${keyword}'. Triggered pre-emptive action.`,
    timestamp: Date.now(),
  });

  if (wss && wss.clients) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }
});

// Autonomous Content Expansion Engine Loop Job (Every 6 hours)
schedule.scheduleJob('0 */6 * * *', async () => {
  console.log(
    '⚡ Autonomous Content Expansion: Running 6-hour cluster gap expansion scan…',
  );
  const core = 'heat-pump'; // example cluster
  try {
    const competitors = await getTopCompetitors(core);
    const gaps = detectClusterContentGaps(core, competitors);

    for (const gap of gaps) {
      const seoBrief = generateAutonomousSeoBrief(gap);
      const articleDraft = createAutonomousArticleDraft(seoBrief);
      const slug = gap.replace(/\s+/g, '-');

      await publishPageToGitHub(slug, articleDraft);
      injectInternalLinks(slug, seoBrief.keywords);
      updatePillar(core);

      console.log(
        `Autonomous Expansion: Created & published ${slug}.html for cluster '${core}'`,
      );
    }

    const payload = JSON.stringify({
      type: 'autonomous_expansion',
      core,
      newPages: gaps,
      message: `Autonomous Expansion: Generated & published ${gaps.length} new cluster page(s) for '${core}'`,
      timestamp: Date.now(),
    });

    if (wss && wss.clients) {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(payload);
        }
      });
    }
  } catch (err) {
    console.error('Autonomous Content Expansion error:', err);
  }
});

// Cross-Domain Knowledge Fusion Integration Job (Every 12 hours)
schedule.scheduleJob('0 */12 * * *', async () => {
  console.log(
    '⚡ Cross-Domain Knowledge Fusion: Running 12-hour data fusion cycle…',
  );
  const sources = Object.values(fusionSources);
  const fusionData: Array<{ title?: string; description?: string }> = [];

  for (const src of sources) {
    const data = await fetchFusionData(src);
    fusionData.push(...data);
  }

  for (const slug of Object.keys(authorityGraph.nodes)) {
    if (authorityGraph.nodes[slug].type === 'page') {
      try {
        const filePath = `./content/${slug}.html`;
        if (fs.existsSync(filePath)) {
          const articleDraft = fs.readFileSync(filePath, 'utf-8');
          const enrichedDraft = fuseKnowledge(articleDraft, fusionData);

          await publishPageToGitHub(slug, enrichedDraft);
          console.log(`Cross-Domain Fusion: Enriched & updated ${slug}.html`);
        }
      } catch (e) {
        // file reading fallback
      }
    }
  }

  const payload = JSON.stringify({
    type: 'cross_domain_fusion',
    sources: Object.keys(fusionSources),
    updatedPages: Object.keys(authorityGraph.nodes),
    message: `Cross-Domain Fusion: Enriched content graph with data from ${Object.keys(fusionSources).length} verified Irish energy endpoints`,
    timestamp: Date.now(),
  });

  if (wss && wss.clients) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }
});

// Autonomous Multi-Site Expansion Job (Every 4 hours)
schedule.scheduleJob('0 */4 * * *', async () => {
  console.log(
    '⚡ Multi-Site Expansion: Running 4-hour network gap expansion scan…',
  );
  try {
    const mergedGraph = mergeKnowledgeGraphs();
    const gaps = detectNetworkGaps(mergedGraph);

    for (const gap of gaps) {
      const seoBrief = generateAutonomousSeoBrief(gap);
      const draft = createAutonomousArticleDraft(seoBrief);
      const slug = gap.replace(/\s+/g, '-');

      for (const domain of Object.values(domainFleet)) {
        const personalised = personaliseForDomain(draft, domain);
        await publishPageToGitHub(slug, personalised);
      }

      console.log(
        `Network Expansion: Created & published ${gap} across all domains`,
      );
    }

    const payload = JSON.stringify({
      type: 'multi_site_expansion',
      gaps,
      domains: Object.keys(domainFleet),
      message: `Multi-Site Expansion: Created ${gaps.length} gap expansion(s) across all ${Object.keys(domainFleet).length} fleet domains`,
      timestamp: Date.now(),
    });

    if (wss && wss.clients) {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(payload);
        }
      });
    }
  } catch (err) {
    console.error('Multi-Site Expansion error:', err);
  }
});

console.log('Starting EcoSmartHomes Advanced SEO Crawler...');
if (wss) {
  startCrawler(wss as any);
} else {
  const ws = new WebSocket(WS_URL);
  ws.on('open', () => {
    console.log('Crawler connected to backend WebSocket');
    startCrawler(ws as any);
  });
  ws.on('error', (err) => {
    console.log('WebSocket connection info:', err.message || err);
  });
}
