/**
 * src/engines/index.ts
 *
 * Engine adapters — each function calls the corresponding existing
 * API endpoint on the local Hub server (localhost:3000).
 *
 * This pattern avoids circular imports: the engines live in src/
 * but talk to server.ts via HTTP, keeping a clean dependency graph.
 */

const HUB_BASE = 'http://localhost:3000';

async function hubPost(
  path: string,
  body: Record<string, unknown>,
): Promise<unknown> {
  const res = await fetch(`${HUB_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Hub POST ${path} failed (${res.status}): ${err}`);
  }
  return res.json();
}

// ─── Draft Generator ─────────────────────────────────────────────────────────
export interface DraftPayload {
  siteId?: string;
  slug?: string;
  title?: string;
  topic?: string;
  pillar?: string;
  keywords?: string[];
  tone?: string;
  audience?: string;
  length?: string;
}

export async function runDraftGenerator(
  payload: DraftPayload,
): Promise<unknown> {
  return hubPost('/api/seo/generate-article', {
    siteId: payload.siteId ?? 'ecosmarthomes.ie',
    title: payload.title ?? slugToTitle(payload.slug ?? 'New Article'),
    topic: payload.topic ?? payload.slug ?? '',
    pillar: payload.pillar ?? 'BER Rating Ireland',
    keywords: payload.keywords ?? [],
    tone: payload.tone ?? 'Professional',
    audience: payload.audience ?? 'Irish homeowners',
    length: payload.length ?? 'medium',
  });
}

// ─── Rewrite Engine ───────────────────────────────────────────────────────────
export interface RewritePayload {
  siteId?: string;
  slug?: string;
  originalContent?: string;
  title?: string;
  reworkGoal?: string;
  tone?: string;
}

export async function runRewriteEngine(
  payload: RewritePayload,
): Promise<unknown> {
  return hubPost('/api/seo/rework-content', {
    siteId: payload.siteId ?? 'ecosmarthomes.ie',
    originalContent:
      payload.originalContent ??
      `Existing content for ${payload.slug ?? 'article'} — rewrite triggered by Harbor command.`,
    title: payload.title ?? slugToTitle(payload.slug ?? 'Reworked Article'),
    reworkGoal: payload.reworkGoal ?? 'Fresh & Unique Rewrite',
    tone: payload.tone ?? 'Professional',
    audience: 'Irish homeowners',
  });
}

// ─── Competitor Diff ──────────────────────────────────────────────────────────
export interface CompetitorDiffPayload {
  siteId?: string;
  slug?: string;
  keyword?: string;
}

export async function runCompetitorDiff(
  payload: CompetitorDiffPayload,
): Promise<unknown> {
  return hubPost('/api/seo/serp-analysis', {
    keyword:
      payload.keyword ??
      slugToKeyword(payload.slug ?? 'heat pump costs ireland'),
    site: payload.siteId ?? 'ecosmarthomes.ie',
  });
}

// ─── Autonomous Expansion Queue ───────────────────────────────────────────────
export interface ExpansionPayload {
  siteId?: string;
  slug?: string;
  topic?: string;
  reason?: string;
}

export async function queueExpansion(
  payload: ExpansionPayload,
): Promise<unknown> {
  return hubPost('/api/seo/discover-content-ideas', {
    topic:
      payload.topic ?? slugToKeyword(payload.slug ?? 'home retrofit ireland'),
    site: payload.siteId ?? 'ecosmarthomes.ie',
  });
}

// ─── Publish to GitHub ────────────────────────────────────────────────────────
export interface PublishPayload {
  siteId?: string;
  slug?: string;
  html?: string;
  title?: string;
}

export async function publishToGitHub(
  payload: PublishPayload,
): Promise<unknown> {
  return hubPost('/api/seo/push-schema-cms', {
    siteId: payload.siteId ?? 'ecosmarthomes.ie',
    slug: payload.slug ?? 'untitled',
    title: payload.title ?? slugToTitle(payload.slug ?? 'Untitled Page'),
    html: payload.html ?? '',
  });
}

// ─── Link-Bait Generator ──────────────────────────────────────────────────────
export interface LinkBaitPayload {
  siteId?: string;
  slug?: string;
  topic?: string;
  pillar?: string;
}

export async function runLinkBaitGenerator(
  payload: LinkBaitPayload,
): Promise<unknown> {
  return hubPost('/api/seo/generate-link-bait', {
    siteId: payload.siteId ?? 'ecosmarthomes.ie',
    topic:
      payload.topic ?? slugToKeyword(payload.slug ?? 'home retrofit ireland'),
    pillar: payload.pillar ?? 'Heat Pump Retrofit Ireland',
  });
}

// ─── Full Optimization Pipeline ───────────────────────────────────────────────
export interface OptimizePipelinePayload {
  siteId?: string;
  slug?: string;
  content?: string;
  keywords?: string[];
}

export async function runOptimizationPipeline(
  payload: OptimizePipelinePayload,
): Promise<unknown> {
  return hubPost('/api/seo/optimize-content', {
    siteId: payload.siteId ?? 'ecosmarthomes.ie',
    content: payload.content ?? `Content for ${payload.slug ?? 'article'}`,
    slug: payload.slug ?? 'article',
    keywords: payload.keywords ?? [],
  });
}

// ─── Utilities ────────────────────────────────────────────────────────────────
function slugToTitle(slug: string): string {
  return slug
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function slugToKeyword(slug: string): string {
  return slug.replace(/[-_]/g, ' ');
}
