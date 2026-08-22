import { describe, it, expect, beforeEach } from 'vitest';
import {
  PredictiveEngine,
  getSeasonalMultiplier,
  getEstimatedCTR,
  calculateMonthlyTraffic,
  predictRankTrajectory,
  calculateRiskModel,
  calculateOpportunityModel,
} from '../predictiveEngine';
import { KeywordEntry } from '../keywordIntelligence';

describe('Phase Group 4 — Predictive Engine (Phases 28–34)', () => {
  let engine: PredictiveEngine;

  beforeEach(() => {
    engine = new PredictiveEngine();
  });

  // ---------------------------------------------
  // Phase 28: Ranking Predictor
  // ---------------------------------------------
  describe('Phase 28 — Ranking Predictor', () => {
    it('predicts improved rank for keywords with negative velocity slope', () => {
      // Current Rank #6, Slope -0.8 (rapidly climbing), Low Volatility 0.15
      const rank30d = predictRankTrajectory(6, -0.8, 0.15, 30);
      const rank60d = predictRankTrajectory(6, -0.8, 0.15, 60);

      expect(rank30d).toBeLessThan(6); // Rank improves to ~#4
      expect(rank60d).toBeLessThan(rank30d); // Rank improves to ~#2
    });

    it('predicts deteriorating rank for keywords with positive velocity slope', () => {
      // Current Rank #3, Slope +0.9 (dropping), Volatility 0.40
      const rank30d = predictRankTrajectory(3, 0.9, 0.40, 30);
      const rank60d = predictRankTrajectory(3, 0.9, 0.40, 60);

      expect(rank30d).toBeGreaterThan(3); // Rank drops to ~#5
      expect(rank60d).toBeGreaterThan(rank30d); // Rank drops to ~#6-#7
    });
  });

  // ---------------------------------------------
  // Phase 29: Traffic Forecast Model
  // ---------------------------------------------
  describe('Phase 29 — Traffic Forecast Model', () => {
    it('applies standard organic CTR curve based on rank position', () => {
      expect(getEstimatedCTR(1)).toBeGreaterThan(0.30); // ~31.7%
      expect(getEstimatedCTR(2)).toBeGreaterThan(0.15); // ~15.8%
      expect(getEstimatedCTR(3)).toBeGreaterThan(0.09); // ~9.5%
      expect(getEstimatedCTR(10)).toBeLessThan(0.02); // ~1.4%
    });

    it('calculates monthly organic traffic accurately', () => {
      const traffic = calculateMonthlyTraffic(10000, 1, 1.0);
      expect(traffic).toBe(3170);
    });
  });

  // ---------------------------------------------
  // Phase 30: Conversion Forecast Model
  // ---------------------------------------------
  describe('Phase 30 — Conversion Forecast Model', () => {
    it('calculates higher conversion rate for local transactional queries', () => {
      const entry: KeywordEntry = {
        id: 'heat-pumps-limerick',
        keyword: 'heat pump installer limerick v94',
        targetUrl: '/heat-pumps',
        intent: 'Transactional & Local',
        searchVolume: 4800,
        difficulty: 28,
        currentRank: 2,
        category: 'Heat Pumps',
        trackedSince: Date.now(),
        tags: ['retrofit'],
        isTargetPillar: true,
        history: [{ timestamp: Date.now(), rank: 2 }],
        slope: -0.4,
        volatility: 0.2,
        healthScore: 92,
        zone: 'green',
        trend: 'rising',
        priority: 'high',
        actionTrigger: 'let_automation_run',
        recommendedAction: 'Maintain position 2',
      };

      const forecast = engine.forecastKeyword(entry);
      expect(forecast.forecast30d.predictedConversions).toBeGreaterThan(0);
      expect(forecast.forecast30d.estimatedPipelineValue).toBeGreaterThan(0);
    });
  });

  // ---------------------------------------------
  // Phase 31: Risk Model (Spikes with Volatility)
  // ---------------------------------------------
  describe('Phase 31 — Risk Model', () => {
    it('spikes risk score when volatility and positive slope are high', () => {
      const highRisk = calculateRiskModel(8, 0.8, 0.75);
      expect(highRisk.score).toBeGreaterThan(60);
      expect(['high', 'critical']).toContain(highRisk.level);
    });

    it('maintains low risk score for steady keywords with low volatility', () => {
      const lowRisk = calculateRiskModel(2, -0.6, 0.12);
      expect(lowRisk.score).toBeLessThan(25);
      expect(lowRisk.level).toBe('low');
    });
  });

  // ---------------------------------------------
  // Phase 32: Opportunity Model (Rises with Slope & Volume)
  // ---------------------------------------------
  describe('Phase 32 — Opportunity Model', () => {
    it('awards high opportunity score to climbing keywords in striking distance', () => {
      // Rank 4, Slope -0.8 (improving), Low KD, 18600 volume
      const opp = calculateOpportunityModel(4, -0.8, 28, 18600);
      expect(opp.score).toBeGreaterThanOrEqual(75);
      expect(opp.level).toBe('breakout');
    });

    it('gives lower opportunity score to stagnant or low-volume keywords', () => {
      const opp = calculateOpportunityModel(15, 0.2, 70, 800);
      expect(opp.score).toBeLessThan(35);
      expect(opp.level).toBe('low');
    });
  });

  // ---------------------------------------------
  // Phase 33: Seasonal Adjustment Model
  // ---------------------------------------------
  describe('Phase 33 — Seasonal Adjustment Model', () => {
    it('returns high multiplier for Solar PV in summer months', () => {
      // Month 5 = June
      const solarSummer = getSeasonalMultiplier('Solar PV', 5);
      // Month 11 = December
      const solarWinter = getSeasonalMultiplier('Solar PV', 11);

      expect(solarSummer).toBeGreaterThan(1.2);
      expect(solarWinter).toBeLessThan(0.9);
    });

    it('returns high multiplier for Heat Pumps and Insulation in winter months', () => {
      // Month 11 = December
      const hpWinter = getSeasonalMultiplier('Heat Pumps', 11);
      // Month 5 = June
      const hpSummer = getSeasonalMultiplier('Heat Pumps', 5);

      expect(hpWinter).toBeGreaterThan(1.3);
      expect(hpSummer).toBeLessThan(0.95);
    });
  });

  // ---------------------------------------------
  // Phase 34: Predictive Dashboard Summary Aggregator
  // ---------------------------------------------
  describe('Phase 34 — Predictive Dashboard Aggregator', () => {
    it('generates complete multi-period executive summary across keyword registry', () => {
      const summary = engine.generateDashboardSummary();

      expect(summary.totalKeywordsEvaluated).toBeGreaterThan(0);
      expect(summary.currentTotalMonthlyTraffic).toBeGreaterThan(0);
      expect(summary.predicted30dTraffic).toBeGreaterThan(0);
      expect(summary.predicted60dTraffic).toBeGreaterThan(0);
      expect(summary.predictedMonthlyConversions).toBeGreaterThan(0);
      expect(summary.portfolioRiskAverage).toBeGreaterThan(0);
      expect(summary.portfolioOpportunityAverage).toBeGreaterThan(0);
      expect(summary.categoryForecasts.length).toBeGreaterThan(0);
    });
  });
});
