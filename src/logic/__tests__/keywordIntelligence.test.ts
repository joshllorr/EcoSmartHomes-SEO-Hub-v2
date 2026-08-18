import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateSlope,
  calculateVolatility,
  classifyStabilityZone,
  getStabilityZoneMessage,
  calculateKeywordHealthScore,
  evaluateKeywordPriority,
  KeywordRegistry,
  RankSnapshot,
} from '../keywordIntelligence';

describe('Phase Group 1 — Keyword Intelligence Core (Phases 1–7)', () => {
  let registry: KeywordRegistry;

  beforeEach(() => {
    registry = new KeywordRegistry([]);
  });

  // ---------------------------------------------
  // Phase 1: Keyword Registry
  // ---------------------------------------------
  describe('Phase 1 — Keyword Registry', () => {
    it('registers a keyword and computes initial models', () => {
      const entry = registry.register({
        keyword: 'solar pv grants ireland',
        category: 'Solar PV',
        currentRank: 4,
        searchVolume: 18600,
      });

      expect(entry.id).toBe('solar-pv-grants-ireland');
      expect(entry.keyword).toBe('solar pv grants ireland');
      expect(entry.category).toBe('Solar PV');
      expect(entry.currentRank).toBe(4);
      expect(entry.healthScore).toBeGreaterThan(0);
      expect(entry.zone).toBeDefined();
      expect(entry.priority).toBeDefined();
    });

    it('queries and deletes registered keywords', () => {
      registry.register({ keyword: 'heat pump grants' });
      expect(registry.get('heat-pump-grants')).toBeDefined();

      const deleted = registry.delete('heat-pump-grants');
      expect(deleted).toBe(true);
      expect(registry.get('heat-pump-grants')).toBeUndefined();
    });
  });

  // ---------------------------------------------
  // Phase 2: Rank History Collector
  // ---------------------------------------------
  describe('Phase 2 — Rank History Collector', () => {
    it('records sequential rank snapshots and updates history correctly', () => {
      const now = Date.now();
      const entry = registry.register({
        keyword: 'attic insulation cost dublin',
        currentRank: 6,
        history: [{ timestamp: now, rank: 6 }],
      });

      registry.recordRank('attic-insulation-cost-dublin', 4, now + 1000);
      registry.recordRank('attic-insulation-cost-dublin', 2, now + 2000);

      const updated = registry.get('attic-insulation-cost-dublin');
      expect(updated?.currentRank).toBe(2);
      expect(updated?.history.length).toBe(3);
      expect(updated?.slope).toBeLessThan(0); // improving
      expect(updated?.trend).toBe('rising');
    });
  });

  // ---------------------------------------------
  // Phase 3: Slope Model
  // ---------------------------------------------
  describe('Phase 3 — Slope Model', () => {
    it('calculates negative slope for rising (improving) rankings', () => {
      // Ranks: #10 -> #7 -> #4 -> #2
      const history: RankSnapshot[] = [
        { timestamp: 1, rank: 10 },
        { timestamp: 2, rank: 7 },
        { timestamp: 3, rank: 4 },
        { timestamp: 4, rank: 2 },
      ];
      const slope = calculateSlope(history);
      expect(slope).toBeLessThan(0);
      expect(slope).toBeCloseTo(-2.7, 0);
    });

    it('calculates positive slope for dropping (degrading) rankings', () => {
      // Ranks: #2 -> #4 -> #6 -> #9
      const history: RankSnapshot[] = [
        { timestamp: 1, rank: 2 },
        { timestamp: 2, rank: 4 },
        { timestamp: 3, rank: 6 },
        { timestamp: 4, rank: 9 },
      ];
      const slope = calculateSlope(history);
      expect(slope).toBeGreaterThan(0);
      expect(slope).toBeCloseTo(2.3, 0);
    });

    it('returns 0 slope when data points are insufficient', () => {
      expect(calculateSlope([])).toBe(0);
      expect(calculateSlope([{ timestamp: 1, rank: 5 }])).toBe(0);
    });
  });

  // ---------------------------------------------
  // Phase 4: Volatility Model
  // ---------------------------------------------
  describe('Phase 4 — Volatility Model', () => {
    it('returns low volatility for steady, predictable ranks', () => {
      const history: RankSnapshot[] = [
        { timestamp: 1, rank: 3 },
        { timestamp: 2, rank: 3 },
        { timestamp: 3, rank: 3 },
        { timestamp: 4, rank: 3 },
      ];
      const vol = calculateVolatility(history);
      expect(vol).toBeLessThanOrEqual(0.1);
    });

    it('returns higher volatility for turbulent, swinging ranks', () => {
      const history: RankSnapshot[] = [
        { timestamp: 1, rank: 2 },
        { timestamp: 2, rank: 18 },
        { timestamp: 3, rank: 3 },
        { timestamp: 4, rank: 22 },
      ];
      const vol = calculateVolatility(history);
      expect(vol).toBeGreaterThan(0.5);
    });
  });

  // ---------------------------------------------
  // Phase 5: Stability Zone Classifier
  // ---------------------------------------------
  describe('Phase 5 — Stability Zone Classifier', () => {
    it('correctly classifies Green Zone', () => {
      expect(classifyStabilityZone(-0.5, 0.2)).toBe('green');
      expect(classifyStabilityZone(0, 0.3)).toBe('green');
      expect(getStabilityZoneMessage('green')).toContain('Automation strengthening active');
    });

    it('correctly classifies Red Zone', () => {
      expect(classifyStabilityZone(0.8, 0.65)).toBe('red');
      expect(getStabilityZoneMessage('red')).toContain('Manual SERP audit recommended');
    });

    it('correctly classifies Yellow Zone', () => {
      expect(classifyStabilityZone(0.2, 0.45)).toBe('yellow');
      expect(classifyStabilityZone(0.6, 0.25)).toBe('yellow');
      expect(getStabilityZoneMessage('yellow')).toContain('Monitor next cycle');
    });
  });

  // ---------------------------------------------
  // Phase 6: Keyword Health Score
  // ---------------------------------------------
  describe('Phase 6 — Keyword Health Score', () => {
    it('awards high health score to Top 3 rising stable keywords', () => {
      const health = calculateKeywordHealthScore(1, -0.6, 0.15);
      expect(health).toBeGreaterThanOrEqual(90);
    });

    it('penalizes health score for high volatility and positive dropping slope', () => {
      const health = calculateKeywordHealthScore(15, 0.8, 0.7);
      expect(health).toBeLessThan(45);
    });
  });

  // ---------------------------------------------
  // Phase 7: Keyword Priority Engine
  // ---------------------------------------------
  describe('Phase 7 — Keyword Priority Engine', () => {
    it('assigns Critical priority to high volume keywords in Red Zone', () => {
      const evalResult = evaluateKeywordPriority(8, 0.7, 0.65, 14200, 'red');
      expect(evalResult.priority).toBe('critical');
      expect(evalResult.trigger).toBe('trigger_serp_audit');
    });

    it('assigns High priority to striking distance Page 1 opportunities', () => {
      const evalResult = evaluateKeywordPriority(6, -0.2, 0.25, 4800, 'green');
      expect(evalResult.priority).toBe('high');
      expect(evalResult.trigger).toBe('trigger_content_refresh');
    });
  });

  // ---------------------------------------------
  // Downstream Propagation & Stability Map Aggregation
  // ---------------------------------------------
  describe('Downstream Stability Map Aggregation', () => {
    it('produces structured summary with zone counts, percentages, and priorities', () => {
      registry.register({ keyword: 'heat pump costs', currentRank: 2, slope: -0.8, volatility: 0.2 });
      registry.register({ keyword: 'solar grants', currentRank: 4, slope: 0.6, volatility: 0.58 });
      registry.register({ keyword: 'seai limerick', currentRank: 7, slope: 0.2, volatility: 0.41 });

      const summary = registry.getStabilityMapSummary();
      expect(summary.totalKeywords).toBe(3);
      expect(summary.zones.green.count).toBe(1);
      expect(summary.zones.red.count).toBe(1);
      expect(summary.zones.yellow.count).toBe(1);
      expect(summary.averageHealthScore).toBeGreaterThan(0);
      expect(summary.averageVolatility).toBeGreaterThan(0);
    });
  });
});
