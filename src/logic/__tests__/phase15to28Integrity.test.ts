import { describe, it, expect, beforeEach } from 'vitest';
import { AutomationEngine } from '../automationEngine';
import { aiPlanner } from '../retrofit/aiPlanner';
import { PredictiveEngine, predictRankTrajectory } from '../predictiveEngine';
import { normalizeBERBand, BER_SCALE } from '../eircodeEngine';

describe('Audit & Integrity: Strategy & Retrofit (Phases 15–28)', () => {
  let automation: AutomationEngine;
  let predictive: PredictiveEngine;

  beforeEach(() => {
    automation = new AutomationEngine();
    predictive = new PredictiveEngine();
  });

  describe('Phase 15: SERP Intelligence & Multi-Agent Negotiation Data Bridge', () => {
    it('initializes and manages automation log records cleanly across cycles', () => {
      automation.addLog(
        15,
        'Multi-Agent Council',
        'consensus_vote',
        'Heat Pumps Limerick',
        'success',
        'Approved by all agents',
      );
      const logs = automation.getLogs(15);
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].phase).toBe(15);
      expect(logs[0].phaseName).toBe('Multi-Agent Council');
    });
  });

  describe('Phase 16 & 17: Internal Linking & Semantic Booster with 2026 EPBD Standards', () => {
    it('enforces 2026 EPBD and SEAI entity targets during semantic content boosting', () => {
      const sample =
        'Learn about insulation and home heating upgrades in Munster.';
      const boosted = automation.boostSemanticEntities(
        sample,
        'Heat Pump Retrofit',
      );
      expect(boosted.boostedContent).toContain('BER A0 Energy Rating Target');
      expect(boosted.boostedContent).toContain(
        'Building Regulations Part L Compliance',
      );
      expect(boosted.boostedContent).toContain('Clean Export Guarantee (CEG)');
    });

    it('injects contextual internal links into Irish retrofit guides', () => {
      const content =
        'Irish homeowners can claim solar pv grants ireland to reduce electricity bills.';
      const result = automation.reinforeInternalLinks(content);
      expect(result.linksAdded).toBeGreaterThan(0);
      expect(result.content).toContain(
        '[solar pv grants ireland](/grants/solar-pv)',
      );
    });
  });

  describe('Phase 18 & 19: Metadata Corrector & Schema Validator', () => {
    it('generates high-CTR metadata adhering to Irish canonical standards', () => {
      const meta = automation.correctMetadata('Solar PV Munster');
      expect(meta.canonicalUrl).toBe(
        'https://ecosmarthomes.ie/solar-pv-munster',
      );
      expect(meta.openGraph['og:locale']).toBe('en_IE');
      expect(meta.optimizedDescription.length).toBeGreaterThan(80);
    });

    it('validates schema markup and flags missing required structured fields', () => {
      const validSchema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Heat Pump Retrofit Consultation',
        provider: { '@type': 'Organization', name: 'EcoSmartHomes' },
        areaServed: 'IE',
      };
      const res = automation.validateJsonLdSchema(validSchema);
      expect(res.valid).toBe(true);
      expect(res.schemaType).toBe('Service');
    });
  });

  describe('Phase 20, 21 & 22: Content Lifecycle & Search Intent Outlines', () => {
    it('generates structured outline addressing compliance and local Eircode relevance', () => {
      const outline = automation.generateOutline('Heat Pump Grants Limerick');
      expect(outline.length).toBeGreaterThanOrEqual(4);
      expect(
        outline.some((s) => s.includes('€12,500') || s.includes('Heat Pump')),
      ).toBe(true);
    });

    it('generates compliant content draft referencing SEAI 2026 guidelines', () => {
      const draft = automation.generateArticleContent(
        'Heat Pump Grants Limerick',
      );
      expect(draft.markdown).toContain('SEAI');
      expect(draft.wordCount).toBeGreaterThan(100);
    });
  });

  describe('Phase 23 & 24: 2026 SEAI Grant Intelligence & Proposal PDF Export', () => {
    it('accurately calculates 2026 SEAI domestic grant allowances', () => {
      const hp = automation.calculateGrantDeduction('heat-pump', 16000);
      expect(hp.grantAllowance).toBe(12500);
      expect(hp.netHomeownerCost).toBe(3500);

      const solar = automation.calculateGrantDeduction('solar-pv', 5000);
      expect(solar.grantAllowance).toBe(2100);
      expect(solar.netHomeownerCost).toBe(2900);

      const attic = automation.calculateGrantDeduction(
        'attic-insulation',
        2500,
      );
      expect(attic.grantAllowance).toBe(2000);
      expect(attic.netHomeownerCost).toBe(500);

      const oss = automation.calculateGrantDeduction('one-stop-shop', 45000);
      expect(oss.grantAllowance).toBe(26000);
      expect(oss.netHomeownerCost).toBe(19000);
    });

    it('generates proposal PDF metadata with modern 2026 Part L compliance notes', () => {
      const calc = automation.calculateGrantDeduction('heat-pump', 16000);
      const pdf = automation.generatePdfExportSummary(
        'Heat Pump Upgrade Proposal',
        calc,
      );
      expect(pdf.summaryJson.compliance).toContain(
        'Post-works BER A0 Assessment Included',
      );
      expect(pdf.summaryJson.financials.seaiGrantAllowance).toBe('€12,500');
    });
  });

  describe('Phase 25 & 26: Crawl Monitoring & Technical Verification', () => {
    it('manages crawl scheduling intervals and priority queues', () => {
      const urgent = automation.scheduleCrawl(
        'heat pump grant',
        'https://ecosmarthomes.ie/hp',
        'critical',
      );
      const normal = automation.scheduleCrawl(
        'solar info',
        'https://ecosmarthomes.ie/solar',
        'normal',
      );
      expect(urgent.intervalHours).toBe(6);
      expect(normal.intervalHours).toBe(24);
    });

    it('scans URLs and verifies SEO health scoring', () => {
      const scan = automation.scanUrl(
        'https://ecosmarthomes.ie/grants/solar-pv',
      );
      expect(scan.score).toBeGreaterThan(70);
      expect(Array.isArray(scan.issues)).toBe(true);
    });
  });

  describe('Phase 27: Refresh Impact Tracking & AI Retrofit Planner', () => {
    it('generates compliant 2026 AI Retrofit Plan with G -> A uplift and updated bonuses', () => {
      const plan = aiPlanner(
        { id: 'test_grant_01' },
        { user_id: 'test_user_01' },
      );
      expect(plan.berImpact).toBe('G → A');
      expect(plan.costEstimate.total).toBe(30100);
      expect(plan.grantOffsets.total).toBe(22100);
      expect(plan.grantOffsets.heatPump).toBe(8000);
      expect(plan.grantOffsets.fullRetrofitBonus).toBe(2500);
      expect(plan.materials.length).toBeGreaterThanOrEqual(4);
      expect(plan.contractorsNeeded.length).toBeGreaterThanOrEqual(4);
    });

    it('records refresh impact accurately and logs to historical register', () => {
      const impact = automation.recordRefreshImpact({
        keyword: 'ber upgrade cost limerick',
        url: '/ber-upgrade-cost',
        preRefreshRank: 12,
        postRefreshRank: 3,
        measuredDaysAfter: 7,
      });
      expect(impact.rankDelta).toBe(9);
      expect(impact.impactVerdict).toBe('significant_gain');
    });
  });

  describe('Phase 28: Multi-Period Ranking Predictor & 8-Step Scale Integration', () => {
    it('normalizes legacy BER sub-bands to canonical 8-step scale', () => {
      expect(normalizeBERBand('D2')).toBe('D');
      expect(normalizeBERBand('E1')).toBe('E');
      expect(normalizeBERBand('A2')).toBe('A');
      expect(normalizeBERBand('A0')).toBe('A0');
      expect(BER_SCALE.A0.label).toContain('Zero-Emission');
    });

    it('predicts multi-period ranking trajectories using dampening models', () => {
      const rankIn30Days = predictRankTrajectory(10, -1.2, 0.2, 30);
      expect(rankIn30Days).toBeLessThan(10);
      expect(rankIn30Days).toBeGreaterThanOrEqual(1);
    });

    it('computes portfolio dashboard summary with predictive metrics', () => {
      const summary = predictive.generateDashboardSummary();
      expect(summary.totalKeywordsEvaluated).toBeGreaterThan(0);
      expect(summary.predicted30dTraffic).toBeGreaterThan(0);
    });
  });
});
