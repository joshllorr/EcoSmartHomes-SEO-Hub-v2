import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from './server-test-helper';

vi.mock('../services/harborSync', () => ({
  syncToHarbor: vi.fn(),
}));

beforeEach(() => {
  delete (process.env as any).GEMINI_ACCESS_TOKEN;
  delete (process.env as any).GEMINI_API_KEY;
  delete (process.env as any).VITE_GEMINI_API_KEY;
});

describe('Security Headers', () => {
  it('returns security headers on all responses', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('DENY');
    expect(res.headers['referrer-policy']).toBe(
      'strict-origin-when-cross-origin',
    );
  });

  it('returns Content-Security-Policy header', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['content-security-policy']).toBeDefined();
  });

  it('returns Strict-Transport-Security header', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['strict-transport-security']).toBeDefined();
  });

  it('strips X-Powered-By header', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});

describe('GET /health', () => {
  it('returns 200 with online status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('online');
    expect(res.body.service).toBe('EcoSmartHomes Local Hub');
    expect(res.body.version).toBe('Phase 16');
    expect(typeof res.body.uptime).toBe('number');
    expect(typeof res.body.timestamp).toBe('number');
  });

  it('returns harbor state metrics', async () => {
    const res = await request(app).get('/health');
    expect(res.body).toHaveProperty('totalEventsSynced');
    expect(res.body).toHaveProperty('lastSyncAt');
  });

  it('includes dependencies status', async () => {
    const res = await request(app).get('/health');
    expect(res.body).toHaveProperty('dependencies');
    expect(typeof res.body.dependencies.gemini).toBe('boolean');
    expect(typeof res.body.dependencies.sentry).toBe('boolean');
  });
});

describe('GET /ready', () => {
  it('returns 200 with ready status', async () => {
    const res = await request(app).get('/ready');
    expect(res.status).toBe(200);
    expect(res.body.ready).toBe(true);
    expect(typeof res.body.uptime).toBe('number');
    expect(typeof res.body.timestamp).toBe('number');
  });
});

describe('POST /api/hub-sync', () => {
  it('returns 400 when event type is missing', async () => {
    const res = await request(app).post('/api/hub-sync').send({});
    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
    expect(res.body.error).toBe('Missing event type');
  });

  it('returns 200 with event id for valid event', async () => {
    const res = await request(app).post('/api/hub-sync').send({
      type: 'draft_created',
      slug: 'test-post',
      message: 'Test event',
    });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.id).toBeDefined();
    expect(res.body.id).toContain('draft_created');
  });
});

describe('GET /api/hub-state', () => {
  it('returns 200 with harbor state', async () => {
    const res = await request(app).get('/api/hub-state');
    expect(res.status).toBe(200);
    expect(res.body).toBeDefined();
  });
});

describe('GET /api/unified-analytics', () => {
  it('returns 200 with unified analytics payload', async () => {
    const res = await request(app).get('/api/unified-analytics');
    expect(res.status).toBe(200);
    expect(res.body.harbor).toBeDefined();
    expect(res.body.hub).toBeDefined();
    expect(res.body.fleet).toBeDefined();
    expect(res.body.insights).toBeDefined();
    expect(res.body.autonomousState).toBeDefined();
    expect(res.body.ts).toBeDefined();
  });

  it('includes harbor metrics', async () => {
    const res = await request(app).get('/api/unified-analytics');
    expect(res.body.harbor.backlinksBuilt).toBeDefined();
    expect(res.body.harbor.domainAuthority).toBeDefined();
  });

  it('includes fleet metrics', async () => {
    const res = await request(app).get('/api/unified-analytics');
    expect(res.body.fleet['ecosmarthomes.ie']).toBeDefined();
    expect(res.body.fleet['future-site-1.ie']).toBeDefined();
  });
});

describe('POST /api/seo/keyword-research', () => {
  it('returns 400 when keyword is missing', async () => {
    const res = await request(app).post('/api/seo/keyword-research').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Keyword is required');
  });

  it('returns mock results when Gemini is not configured', async () => {
    const res = await request(app)
      .post('/api/seo/keyword-research')
      .send({ keyword: 'heat pump' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.isMock).toBe(true);
    expect(res.body.results.length).toBeGreaterThan(0);
    expect(res.body.results[0]).toHaveProperty('keyword');
    expect(res.body.results[0]).toHaveProperty('volume');
    expect(res.body.results[0]).toHaveProperty('difficulty');
    expect(res.body.results[0]).toHaveProperty('relevance');
    expect(res.body.results[0]).toHaveProperty('intent');
  });

  it('includes warning when in mock mode', async () => {
    const res = await request(app)
      .post('/api/seo/keyword-research')
      .send({ keyword: 'ber rating' });
    expect(res.body.warning).toBeDefined();
    expect(typeof res.body.warning).toBe('string');
  });
});

describe('POST /api/seo/discover-content-ideas', () => {
  it('returns mock ideas when Gemini is not configured', async () => {
    const res = await request(app)
      .post('/api/seo/discover-content-ideas')
      .send({ site: 'ecosmarthomes.ie' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.isMock).toBe(true);
    expect(res.body.ideas.length).toBeGreaterThan(0);
    expect(res.body.ideas[0]).toHaveProperty('title');
    expect(res.body.ideas[0]).toHaveProperty('summary');
    expect(res.body.ideas[0]).toHaveProperty('tags');
  });

  it('uses default site when not provided', async () => {
    const res = await request(app)
      .post('/api/seo/discover-content-ideas')
      .send({});
    expect(res.body.site).toBe('ecosmarthomes.ie');
  });

  it('includes grounding queries in mock mode', async () => {
    const origToken = process.env.GEMINI_ACCESS_TOKEN;
    const origKey = process.env.GEMINI_API_KEY;
    delete (process.env as any).GEMINI_ACCESS_TOKEN;
    delete (process.env as any).GEMINI_API_KEY;

    const res = await request(app)
      .post('/api/seo/discover-content-ideas')
      .send({ site: 'test.ie' });
    expect(res.body.groundingQueries).toBeDefined();
    expect(res.body.groundingQueries.length).toBeGreaterThan(0);

    if (origToken !== undefined) process.env.GEMINI_ACCESS_TOKEN = origToken;
    if (origKey !== undefined) process.env.GEMINI_API_KEY = origKey;
  });
});

describe('POST /api/seo/serp-analysis', () => {
  it('returns 400 when keyword is missing', async () => {
    const res = await request(app).post('/api/seo/serp-analysis').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Keyword is required for SERP analysis');
  });

  it('returns mock SERP data when Gemini is not configured', async () => {
    const res = await request(app)
      .post('/api/seo/serp-analysis')
      .send({ keyword: 'heat pump Ireland' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.isMock).toBe(true);
    expect(res.body.serp.keyword).toBe('heat pump Ireland');
    expect(res.body.serp.intent).toBeDefined();
    expect(res.body.serp.difficulty).toBeDefined();
    expect(res.body.serp.search_volume).toBeDefined();
    expect(res.body.serp.top_results).toBeDefined();
    expect(res.body.serp.top_results.length).toBeGreaterThan(0);
  });

  it('returns top results with required fields', async () => {
    const res = await request(app)
      .post('/api/seo/serp-analysis')
      .send({ keyword: 'ber rating' });
    const topResult = res.body.serp.top_results[0];
    expect(topResult).toHaveProperty('position');
    expect(topResult).toHaveProperty('title');
    expect(topResult).toHaveProperty('url');
    expect(topResult).toHaveProperty('domain_authority');
    expect(topResult).toHaveProperty('strengths');
    expect(topResult).toHaveProperty('weaknesses');
    expect(topResult).toHaveProperty('ranking_gaps');
  });

  it('performs specialized topic-aware SERP audit for solar pv grants ireland', async () => {
    const res = await request(app)
      .post('/api/seo/serp-analysis')
      .send({ keyword: 'solar pv grants ireland' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.serp.keyword).toBe('solar pv grants ireland');
    expect(res.body.serp.top_results.length).toBe(10);
    expect(res.body.serp.ranking_gap_keywords.length).toBeGreaterThanOrEqual(3);
    expect(res.body.serp.opportunities.length).toBeGreaterThanOrEqual(3);
    expect(res.body.serp.recommended_outline.length).toBeGreaterThanOrEqual(5);
    // Check that solar theme is present
    const hasSolarTheme = res.body.serp.top_results.some(
      (r: any) => r.title.toLowerCase().includes('solar') || r.meta_description.toLowerCase().includes('solar')
    );
    expect(hasSolarTheme).toBe(true);
  });
});

describe('Article Serving & Publishing Endpoints', () => {
  it('GET /articles/:slug returns 404 for non-existent article', async () => {
    const res = await request(app).get('/articles/non-existent-article-12345');
    expect(res.status).toBe(404);
    expect(res.text).toBe('Article not found');
  });

  it('GET /articles/:slug returns 200 and html content when test article exists', async () => {
    const res = await request(app).get('/articles/test-article');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Test Article');
  });

  it('POST /api/publish returns 400 if slug is missing', async () => {
    const res = await request(app)
      .post('/api/publish')
      .send({ html: '<p>Content</p>' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Slug is required');
  });

  it('POST /api/publish creates and publishes an article successfully', async () => {
    const res = await request(app).post('/api/publish').send({
      slug: 'unit-test-article',
      title: 'Unit Test Article',
      html: '<p>This is a unit test published article.</p>',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.slug).toBe('unit-test-article');
    expect(res.body.url).toBe('/articles/unit-test-article');

    // Verify GET route now serves the published article
    const getRes = await request(app).get('/articles/unit-test-article');
    expect(getRes.status).toBe(200);
    expect(getRes.text).toContain('Unit Test Article');
  });
});

describe('POST /api/seo/sitemap-scan', () => {
  it('returns 400 when website URL is missing', async () => {
    const res = await request(app).post('/api/seo/sitemap-scan').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Website URL is required');
  });

  it('returns success status and indexes routes for ecosmarthomes.ie', async () => {
    const res = await request(app).post('/api/seo/sitemap-scan').send({
      url: 'https://ecosmarthomes.ie',
      customSitemapPath: '/sitemap.xml',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBe('success');
    expect(res.body.routesIndexed).toBe(12);
    expect(res.body.error).toBeNull();
  });

  it('accepts custom sitemap paths ending in .xml', async () => {
    const res = await request(app).post('/api/seo/sitemap-scan').send({
      url: 'https://mysite.ie',
      customSitemapPath: '/custom-sitemap.xml',
    });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.routesIndexed).toBe(12);
  });
});

describe('Phase Group 1 — Keyword Intelligence Core Endpoints (Phases 1–7)', () => {
  it('GET /api/keywords returns list of registered keywords with computed models', async () => {
    const res = await request(app).get('/api/keywords');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.keywords)).toBe(true);
    expect(res.body.keywords.length).toBeGreaterThan(0);

    const first = res.body.keywords[0];
    expect(first).toHaveProperty('keyword');
    expect(first).toHaveProperty('slope');
    expect(first).toHaveProperty('volatility');
    expect(first).toHaveProperty('zone');
    expect(first).toHaveProperty('healthScore');
    expect(first).toHaveProperty('priority');
  });

  it('GET /api/keywords/stability-map returns grouped zones and metrics', async () => {
    const res = await request(app).get('/api/keywords/stability-map');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stabilityMap).toHaveProperty('zones');
    expect(res.body.stabilityMap.zones).toHaveProperty('green');
    expect(res.body.stabilityMap.zones).toHaveProperty('yellow');
    expect(res.body.stabilityMap.zones).toHaveProperty('red');
    expect(res.body.stabilityMap).toHaveProperty('averageHealthScore');
  });

  it('POST /api/keywords registers a new keyword with computed slope & volatility', async () => {
    const res = await request(app).post('/api/keywords').send({
      keyword: 'limerick heat pump retrofitting',
      category: 'Heat Pumps',
      currentRank: 5,
      searchVolume: 3200,
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.keyword.keyword).toBe('limerick heat pump retrofitting');
    expect(res.body.keyword.healthScore).toBeGreaterThan(0);
    expect(res.body.keyword.zone).toBeDefined();
  });

  it('POST /api/keywords/:id/rank-history appends observation and updates dynamic velocity', async () => {
    const res = await request(app)
      .post('/api/keywords/solar-pv-grants-ireland/rank-history')
      .send({ rank: 2 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.keyword.currentRank).toBe(2);
    expect(res.body.keyword.history.length).toBeGreaterThan(1);
  });
});

describe('Phase Group 2 — SERP Intelligence Endpoints (Phases 8–15)', () => {
  it('POST /api/seo/serp-analysis compiles full snapshot with rich features and competitor diff', async () => {
    const res = await request(app)
      .post('/api/seo/serp-analysis')
      .send({ keyword: 'solar pv grants ireland' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.serp).toHaveProperty('keyword', 'solar pv grants ireland');
    expect(res.body.serp).toHaveProperty('features');
    expect(res.body.serp).toHaveProperty('diff');
    expect(res.body.serp).toHaveProperty('volatilityIndex');
    expect(res.body.serp).toHaveProperty('intent');
  });

  it('GET /api/seo/serp-features/:keyword detects rich search features and intent', async () => {
    const res = await request(app).get('/api/seo/serp-features/heat-pump-grants-limerick-v94');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.intent).toBe('Commercial & Local');
    expect(res.body.features.length).toBeGreaterThan(0);
    expect(res.body.features.some((f: any) => f.type === 'local_pack')).toBe(true);
  });

  it('GET /api/seo/serp-diff/:keyword calculates competitor diff and volatility', async () => {
    const res = await request(app).get('/api/seo/serp-diff/solar-pv-grants-ireland');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.diff).toBeDefined();
    expect(res.body.volatilityIndex).toBeDefined();
    expect(res.body.volatilityCategory).toBeDefined();
  });
});

describe('Phase Group 3 — Automation Engine Endpoints (Phases 16–27)', () => {
  it('GET /api/automation/logs returns audit logs', async () => {
    const res = await request(app).get('/api/automation/logs');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.logs)).toBe(true);
  });

  it('GET /api/automation/refresh-queue returns queued items', async () => {
    const res = await request(app).get('/api/automation/refresh-queue');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.queue)).toBe(true);
    expect(res.body.queue.length).toBeGreaterThan(0);
  });

  it('POST /api/automation/refresh-queue enqueues keyword with slope and volatility', async () => {
    const res = await request(app).post('/api/automation/refresh-queue').send({
      keyword: 'attic insulation cost dublin',
      currentRank: 6,
      slope: 0.6,
      volatility: 0.58,
      zone: 'red',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.item.keyword).toBe('attic insulation cost dublin');
    expect(res.body.item.priority).toBe('critical');
  });

  it('POST /api/automation/validate-schema detects errors in invalid schema', async () => {
    const res = await request(app).post('/api/automation/validate-schema').send({
      schema: { '@type': 'Article' }, // missing @context, headline, datePublished
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.result.valid).toBe(false);
    expect(res.body.result.errors.length).toBeGreaterThan(0);
  });

  it('POST /api/automation/record-impact updates keyword ranking stability', async () => {
    const res = await request(app).post('/api/automation/record-impact').send({
      keyword: 'heat pump costs ireland',
      preRefreshRank: 5,
      postRefreshRank: 1,
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.record.rankDelta).toBe(4);
    expect(res.body.record.impactVerdict).toBe('significant_gain');
  });
});

describe('Phase Group 4 — Predictive Engine Endpoints (Phases 28–34)', () => {
  it('GET /api/predictive/dashboard returns aggregate forecasts and risk/opportunity metrics', async () => {
    const res = await request(app).get('/api/predictive/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.summary).toHaveProperty('predicted30dTraffic');
    expect(res.body.summary).toHaveProperty('predicted60dTraffic');
    expect(res.body.summary).toHaveProperty('portfolioRiskAverage');
    expect(res.body.summary).toHaveProperty('portfolioOpportunityAverage');
    expect(Array.isArray(res.body.summary.categoryForecasts)).toBe(true);
  });

  it('GET /api/predictive/keyword/:idOrKeyword returns multi-period rank and conversion projections', async () => {
    const res = await request(app).get('/api/predictive/keyword/solar-pv-grants-ireland');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.forecast).toHaveProperty('forecast30d');
    expect(res.body.forecast).toHaveProperty('forecast60d');
    expect(res.body.forecast).toHaveProperty('riskScore');
    expect(res.body.forecast).toHaveProperty('opportunityScore');
  });

  it('GET /api/predictive/seasonality returns monthly coefficient matrix', async () => {
    const res = await request(app).get('/api/predictive/seasonality');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.seasonalityMatrix)).toBe(true);
    expect(res.body.seasonalityMatrix.length).toBeGreaterThan(0);
  });
});

describe('Phase Group 6 — Infrastructure & Data Endpoints (Phases 43–49)', () => {
  it('GET /api/infrastructure/health returns full system health report', async () => {
    const res = await request(app).get('/api/infrastructure/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.health.status).toBe('healthy');
    expect(res.body.health.components.keywordIntelligence).toBe(true);
    expect(res.body.health.components.predictiveEngine).toBe(true);
  });

  it('POST /api/infrastructure/normalize-data sanitizes URLs and metrics', async () => {
    const res = await request(app).post('/api/infrastructure/normalize-data').send({
      url: 'http://ecosmarthomes.ie/solar-pv/?utm_medium=social',
      keyword: '  Solar PV Grants Ireland! ',
      metrics: { rank: 120, slope: -0.3219, volatility: 2.5 },
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.normalized.url).toBe('https://ecosmarthomes.ie/solar-pv');
    expect(res.body.normalized.keyword.id).toBe('solar-pv-grants-ireland');
    expect(res.body.normalized.metrics.rank).toBe(100);
    expect(res.body.normalized.metrics.volatility).toBe(1.0);
  });

  it('POST & GET /api/infrastructure/kv/:namespace/:key sets and retrieves KV items', async () => {
    const postRes = await request(app)
      .post('/api/infrastructure/kv/KEYWORD_REGISTRY/test_key_123')
      .send({ value: { rank: 3, slope: -0.4 } });
    expect(postRes.status).toBe(200);
    expect(postRes.body.stored).toBe(true);

    const getRes = await request(app).get('/api/infrastructure/kv/KEYWORD_REGISTRY/test_key_123');
    expect(getRes.status).toBe(200);
    expect(getRes.body.value).toEqual({ rank: 3, slope: -0.4 });
  });

  it('GET /api/infrastructure/errors returns error telemetry stream', async () => {
    const res = await request(app).get('/api/infrastructure/errors');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.logs)).toBe(true);
  });
});

describe('Option A — Phase Drift Detector & Auto-Repair Endpoints', () => {
  it('GET /api/drift/report returns cross-phase drift report and stability score', async () => {
    const res = await request(app).get('/api/drift/report');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.report).toHaveProperty('overallStabilityScore');
    expect(res.body.report).toHaveProperty('phases');
    expect(res.body.report.phases.length).toBeGreaterThan(0);
  });

  it('POST /api/drift/auto-repair executes multi-phase auto-repair', async () => {
    const res = await request(app).post('/api/drift/auto-repair');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.result).toHaveProperty('repairsSuccessful');
    expect(res.body.result).toHaveProperty('postRepairStabilityScore');
  });
});

describe('Rate Limiting', () => {
  it('returns 429 after exceeding rate limit in production', async () => {
    const requests = Array.from({ length: 1005 }, () =>
      request(app).get('/api/hub-state'),
    );
    const responses = await Promise.all(requests);
    const limited = responses.find((r) => r.status === 429);
    expect(limited).toBeDefined();
    expect(limited?.body.ok).toBe(false);
  }, 15000);
});
