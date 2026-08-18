import { describe, it, expect, beforeEach } from 'vitest';
import {
  AutomationEngine,
  globalAutomationEngine,
} from '../automationEngine';
import { globalKeywordRegistry } from '../keywordIntelligence';

describe('Phase Group 3 — Automation Engine (Phases 16–27)', () => {
  let engine: AutomationEngine;

  beforeEach(() => {
    engine = new AutomationEngine();
  });

  // ---------------------------------------------
  // Phase 16: Internal Link Reinforcer
  // ---------------------------------------------
  describe('Phase 16 — Internal Link Reinforcer', () => {
    it('injects internal markdown links for targeted keyword anchors', () => {
      const input = 'Irish homeowners can claim solar pv grants ireland to reduce electricity bills.';
      const result = engine.reinforeInternalLinks(input);

      expect(result.linksAdded).toBeGreaterThan(0);
      expect(result.content).toContain('[solar pv grants ireland](/grants/solar-pv)');
    });
  });

  // ---------------------------------------------
  // Phase 17: Semantic Entity Booster
  // ---------------------------------------------
  describe('Phase 17 — Semantic Entity Booster', () => {
    it('detects missing entities and appends regulatory energy section', () => {
      const basicContent = 'This is a basic home heating article without technical regulatory terms.';
      const result = engine.boostSemanticEntities(basicContent, 'Heat Pumps');

      expect(result.missingEntities.length).toBeGreaterThan(0);
      expect(result.injectedEntities.length).toBeGreaterThan(0);
      expect(result.boostedContent).toContain('Building Regulations Part L Compliance');
      expect(result.boostedContent).toContain('Clean Export Guarantee (CEG)');
    });
  });

  // ---------------------------------------------
  // Phase 18: Metadata Corrector
  // ---------------------------------------------
  describe('Phase 18 — Metadata Corrector', () => {
    it('generates CTR-optimized title, description, canonical link, and OpenGraph tags', () => {
      const result = engine.correctMetadata('Solar PV Grants Ireland');

      expect(result.optimizedTitle).toContain('Solar PV Grants Ireland');
      expect(result.optimizedDescription.length).toBeGreaterThan(100);
      expect(result.canonicalUrl).toBe('https://ecosmarthomes.ie/solar-pv-grants-ireland');
      expect(result.openGraph['og:locale']).toBe('en_IE');
    });
  });

  // ---------------------------------------------
  // Phase 19: Schema Validator
  // ---------------------------------------------
  describe('Phase 19 — Schema Validator', () => {
    it('validates correct Article JSON-LD schema', () => {
      const validSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Guide to Heat Pump Retrofits',
        datePublished: '2026-08-18T10:00:00Z',
        author: { '@type': 'Organization', name: 'EcoSmartHomes' },
      };

      const result = engine.validateJsonLdSchema(validSchema);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('detects missing required fields in invalid FAQPage schema', () => {
      const invalidSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        // missing mainEntity
      };

      const result = engine.validateJsonLdSchema(invalidSchema);
      expect(result.valid).toBe(false);
      expect(result.missingRequiredFields).toContain('mainEntity');
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  // ---------------------------------------------
  // Phase 20: Content Refresh Queue
  // ---------------------------------------------
  describe('Phase 20 — Content Refresh Queue', () => {
    it('enqueues decaying keyword with slope, volatility, and priority', () => {
      const item = engine.enqueueContentRefresh({
        keyword: 'wall insulation cost dublin',
        url: '/insulation/wall',
        currentRank: 8,
        slope: 0.65,
        volatility: 0.62,
        zone: 'red',
      });

      expect(item.id).toBe('wall-insulation-cost-dublin');
      expect(item.priority).toBe('critical');
      expect(item.status).toBe('pending');

      const queue = engine.getRefreshQueue();
      expect(queue.some((q) => q.id === 'wall-insulation-cost-dublin')).toBe(true);
    });

    it('processes queued item and marks as completed', () => {
      engine.enqueueContentRefresh({ keyword: 'attic insulation' });
      const processed = engine.processQueueItem('attic-insulation');

      expect(processed).toBeDefined();
      expect(processed?.status).toBe('completed');
      expect(processed?.lastRefreshedAt).toBeDefined();
    });
  });

  // ---------------------------------------------
  // Phase 21 & 22: Content Writer AI & Outline Generator
  // ---------------------------------------------
  describe('Phases 21 & 22 — Content Writer AI & Outline Generator', () => {
    it('generates structured outline and comprehensive article draft', () => {
      const outline = engine.generateOutline('Solar PV Grants Ireland');
      expect(outline.length).toBeGreaterThanOrEqual(5);

      const article = engine.generateArticleContent('Solar PV Grants Ireland', outline);
      expect(article.title).toContain('Solar PV Grants Ireland');
      expect(article.wordCount).toBeGreaterThan(100);
      expect(article.markdown).toContain('SEAI');
    });
  });

  // ---------------------------------------------
  // Phase 23 & 24: Grant Intelligence & PDF Export Engine
  // ---------------------------------------------
  describe('Phases 23 & 24 — Grant Intelligence & PDF Export', () => {
    it('computes SEAI grant allowances and homeowner net costs', () => {
      const calc = engine.calculateGrantDeduction('solar-pv', 4500);
      expect(calc.grossCost).toBe(4500);
      expect(calc.grantAllowance).toBe(2100);
      expect(calc.netHomeownerCost).toBe(2400);
      expect(calc.savingsPercentage).toBeGreaterThan(0);
    });

    it('generates proposal PDF export metadata', () => {
      const calc = engine.calculateGrantDeduction('solar-pv', 4500);
      const pdf = engine.generatePdfExportSummary('Solar PV Grants Ireland', calc);

      expect(pdf.pdfTitle).toContain('SEAI-Retrofit-Grant-Report');
      expect(pdf.summaryJson.financials.seaiGrantAllowance).toBe('€2,100');
    });
  });

  // ---------------------------------------------
  // Phase 25 & 26: Crawl Scheduler & Scanner
  // ---------------------------------------------
  describe('Phases 25 & 26 — Crawl Scheduler & Scanner', () => {
    it('schedules crawl job based on priority', () => {
      const job = engine.scheduleCrawl('heat pump grant limerick', 'https://ecosmarthomes.ie/hp', 'critical');
      expect(job.intervalHours).toBe(6);
      expect(job.priority).toBe('critical');
    });

    it('scans target URL and evaluates SEO health metrics', () => {
      const result = engine.scanUrl('https://ecosmarthomes.ie/solar-pv');
      expect(result.statusCode).toBe(200);
      expect(result.score).toBeGreaterThan(80);
      expect(result.schemaFound).toBe(true);
    });
  });

  // ---------------------------------------------
  // Phase 27: Refresh Impact Tracker & Stability Map Bridge
  // ---------------------------------------------
  describe('Phase 27 — Refresh Impact Tracker', () => {
    it('records impact delta and updates the Keyword Registry & Stability Map', () => {
      const record = engine.recordRefreshImpact({
        keyword: 'solar pv grants ireland',
        url: '/solar-pv',
        preRefreshRank: 7,
        postRefreshRank: 2,
        measuredDaysAfter: 14,
      });

      expect(record.rankDelta).toBe(5); // Moved from #7 to #2 (+5)
      expect(record.impactVerdict).toBe('significant_gain');

      // Check Keyword Registry was updated
      const regEntry = globalKeywordRegistry.get('solar-pv-grants-ireland');
      expect(regEntry?.currentRank).toBe(2);
    });
  });

  // ---------------------------------------------
  // Automation Logs
  // ---------------------------------------------
  describe('Automation Audit Logs', () => {
    it('records audit logs across all automated operations', () => {
      engine.addLog(16, 'Internal Link Reinforcer', 'test_action', 'test_target', 'success', 'test_details');
      const logs = engine.getLogs();
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].phaseName).toBe('Internal Link Reinforcer');
    });
  });
});
