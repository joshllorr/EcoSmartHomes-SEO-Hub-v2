import { describe, it, expect } from 'vitest';
import {
  generateGaussianRandom,
  calculateValueAtRisk,
  runMonteCarloSimulation,
  generateDefensivePlaybook,
  executeWarRoomStressTest,
  PRESET_WAR_ROOM_SCENARIOS,
  getCTR,
} from '../competitorWarRoomEngine';
import { KeywordEntry } from '../keywordIntelligence';

describe('Generative Competitor War-Room & Monte Carlo Stress-Tester', () => {
  describe('Gaussian Stochastic Generator & CTR Curve', () => {
    it('generates normally distributed random numbers without NaN', () => {
      const numbers = Array.from({ length: 100 }, () =>
        generateGaussianRandom(0, 1),
      );
      expect(numbers.every((n) => !isNaN(n) && isFinite(n))).toBe(true);

      const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
      expect(Math.abs(mean)).toBeLessThan(0.8); // within expected sample bounds
    });

    it('returns standard CTR decay from Rank #1 to deep rankings', () => {
      expect(getCTR(1)).toBe(0.34);
      expect(getCTR(2)).toBe(0.18);
      expect(getCTR(10)).toBe(0.015);
      expect(getCTR(20)).toBeLessThan(getCTR(10));
    });
  });

  describe('Value at Risk (VaR) Analyzer', () => {
    it('calculates traffic and revenue pipeline at risk when rank drops', () => {
      // Keyword drops from Rank #2 to Rank #6 with 10,000 monthly volume
      const result = calculateValueAtRisk(2, 6, 10000, 120);

      expect(result.baselineTraffic).toBe(1800); // 10,000 * 0.18
      expect(result.simulatedTraffic).toBe(450); // 10,000 * 0.045
      expect(result.trafficAtRisk).toBe(1350);
      expect(result.pipelineAtRisk).toBeGreaterThan(0);
    });

    it('returns 0 traffic at risk when rank improves or holds steady', () => {
      const improved = calculateValueAtRisk(5, 2, 5000);
      expect(improved.trafficAtRisk).toBe(0);
      expect(improved.pipelineAtRisk).toBe(0);
    });
  });

  describe('Preset Irish Retrofit Scenarios', () => {
    it('provides all 4 strategic war-room scenarios with complete specifications', () => {
      const scenarios = Object.values(PRESET_WAR_ROOM_SCENARIOS);
      expect(scenarios.length).toBe(4);

      const ids = scenarios.map((s) => s.id);
      expect(ids).toContain('activ8_munster_offensive');
      expect(ids).toContain('seai_policy_overhaul');
      expect(ids).toContain('google_core_update');
      expect(ids).toContain('cpc_bidding_surge');

      scenarios.forEach((s) => {
        expect(s.name.length).toBeGreaterThan(5);
        expect(s.adversary.length).toBeGreaterThan(3);
        expect(s.affectedRegions.length).toBeGreaterThan(0);
        expect(s.intensity).toBeGreaterThan(0);
        expect(s.displacementBias).toBeGreaterThan(0);
      });
    });
  });

  describe('Monte Carlo Simulation Engine', () => {
    const mockKeywords: KeywordEntry[] = [
      {
        id: 'solar-pv-grants-ireland',
        keyword: 'solar pv grants ireland',
        targetUrl: '/solar-pv',
        intent: 'Informational',
        searchVolume: 18600,
        difficulty: 34,
        currentRank: 3,
        category: 'Solar PV',
        trackedSince: Date.now(),
        tags: ['solar'],
        history: [{ timestamp: 1, rank: 3 }],
        slope: 0.2,
        volatility: 0.35,
        trend: 'steady',
        zone: 'yellow',
        healthScore: 78,
        priority: 'high',
        actionTrigger: 'trigger_content_refresh',
        recommendedAction: 'Optimize',
      },
      {
        id: 'heat-pump-costs-ireland',
        keyword: 'heat pump costs ireland',
        targetUrl: '/heat-pumps',
        intent: 'Commercial',
        searchVolume: 14200,
        difficulty: 42,
        currentRank: 2,
        category: 'Heat Pumps',
        trackedSince: Date.now(),
        tags: ['heat-pumps'],
        history: [{ timestamp: 1, rank: 2 }],
        slope: -0.5,
        volatility: 0.18,
        trend: 'rising',
        zone: 'green',
        healthScore: 92,
        priority: 'medium',
        actionTrigger: 'monitor_next_cycle',
        recommendedAction: 'Maintain',
      },
    ];

    it('executes 500-iteration Monte Carlo stress test and produces confidence intervals', () => {
      const scenario = PRESET_WAR_ROOM_SCENARIOS.activ8_munster_offensive;
      const report = runMonteCarloSimulation(mockKeywords, scenario, 500);

      expect(report.iterations).toBe(500);
      expect(report.totalKeywordsEvaluated).toBe(2);
      expect(report.convergenceConfidence).toBe('98.2%');
      expect(report.keywordResults.length).toBe(2);

      report.keywordResults.forEach((res) => {
        expect(res.meanSimulatedRank).toBeGreaterThan(res.baselineRank); // adversary displaced ranks
        expect(res.confidenceInterval95[0]).toBeLessThanOrEqual(
          res.confidenceInterval95[1],
        );
        expect(res.confidenceInterval95[0]).toBeGreaterThanOrEqual(1);
        expect(res.confidenceInterval95[1]).toBeLessThanOrEqual(50);
        expect(res.dropProbability).toBeGreaterThanOrEqual(0);
        expect(res.dropProbability).toBeLessThanOrEqual(100);
        expect(res.riskLevel).toBeDefined();
      });

      expect(report.totalTrafficAtRisk).toBeGreaterThan(0);
      expect(report.totalPipelineValueAtRisk).toBeGreaterThan(0);
    });

    it('synthesizes specialized defensive playbooks for stressed keywords', () => {
      const scenario = PRESET_WAR_ROOM_SCENARIOS.google_core_update;
      const report = runMonteCarloSimulation(mockKeywords, scenario, 200);

      expect(Array.isArray(report.defensivePlaybook)).toBe(true);
      if (report.defensivePlaybook.length > 0) {
        const firstAction = report.defensivePlaybook[0];
        expect(firstAction).toHaveProperty('actionType');
        expect(firstAction).toHaveProperty('tacticalRecommendation');
        expect(firstAction.estimatedRiskReduction).toBeGreaterThan(0);
      }
    });

    it('executes war-room test on global registry seamlessly', () => {
      const liveReport = executeWarRoomStressTest('seai_policy_overhaul', 250);
      expect(liveReport.scenario.id).toBe('seai_policy_overhaul');
      expect(liveReport.totalKeywordsEvaluated).toBeGreaterThan(0);
      expect(liveReport.averageRankDisplacement).toBeGreaterThan(0);
    });
  });
});
