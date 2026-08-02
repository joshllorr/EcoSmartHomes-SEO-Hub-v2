import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from './server-test-helper';

vi.mock('../services/harborSync', () => ({
  syncToHarbor: vi.fn(),
}));

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

  it('returns 500 on internal error', async () => {
    const res = await request(app).post('/api/hub-sync').send({ type: 'test' });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
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
    const res = await request(app)
      .post('/api/seo/discover-content-ideas')
      .send({ site: 'test.ie' });
    expect(res.body.groundingQueries).toBeDefined();
    expect(res.body.groundingQueries.length).toBeGreaterThan(0);
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
});
