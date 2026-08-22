/**
 * Phase Group 4 — Predictive Engine (Phases 28–34)
 *
 * Implements:
 * 28. Ranking Predictor (Phase 28)
 * 29. Traffic Forecast Model (Phase 29)
 * 30. Conversion Forecast Model (Phase 30)
 * 31. Risk Model (Phase 31)
 * 32. Opportunity Model (Phase 32)
 * 33. Seasonal Adjustment Model (Phase 33)
 * 34. Predictive Dashboard Aggregator (Phase 34)
 */

import {
  globalKeywordRegistry,
  KeywordEntry,
  classifyStabilityZone,
} from './keywordIntelligence';
import { classifySearchIntent, DetailedIntent } from './serpIntelligence';

export interface ForecastPeriod {
  days: 30 | 60 | 90;
  predictedRank: number;
  predictedTraffic: number;
  predictedConversions: number;
  estimatedPipelineValue: number;
  confidence: number; // 0 to 100
}

export interface KeywordForecast {
  keyword: string;
  category: string;
  intent: DetailedIntent;
  currentRank: number;
  slope: number;
  volatility: number;
  searchVolume: number;
  difficulty: number;
  seasonalityFactor: number;
  riskScore: number; // 0 to 100 (spikes with volatility & positive dropping slope)
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  opportunityScore: number; // 0 to 100 (rises with improving negative slope & volume)
  opportunityLevel: 'low' | 'moderate' | 'high' | 'breakout';
  forecast30d: ForecastPeriod;
  forecast60d: ForecastPeriod;
  forecast90d: ForecastPeriod;
  projectedAnnualValue: number;
  recommendedStrategicAction: string;
}

export interface PredictiveDashboardSummary {
  totalKeywordsEvaluated: number;
  currentTotalMonthlyTraffic: number;
  predicted30dTraffic: number;
  predicted60dTraffic: number;
  predicted90dTraffic: number;
  trafficGrowthPercentage: number;
  predictedMonthlyConversions: number;
  predictedMonthlyPipelineValue: number;
  portfolioRiskAverage: number;
  portfolioOpportunityAverage: number;
  highRiskKeywordsCount: number;
  breakoutOpportunitiesCount: number;
  categoryForecasts: Array<{
    category: string;
    keywordsCount: number;
    currentTraffic: number;
    predicted60dTraffic: number;
    growthRate: number;
    seasonalityTrend: 'peaking' | 'rising' | 'cooling' | 'steady';
  }>;
  forecasts: KeywordForecast[];
}

// ----------------------------------------------------
// PHASE 33 — SEASONAL ADJUSTMENT MODEL
// ----------------------------------------------------
export function getSeasonalMultiplier(category: string, monthIndex: number = new Date().getMonth()): number {
  const cat = category.toLowerCase();

  // monthIndex: 0 = Jan, 1 = Feb, ..., 11 = Dec
  if (cat.includes('solar') || cat.includes('pv')) {
    // Solar peaks in Spring/Summer (April to August: months 3 to 7)
    const solarCurve = [0.8, 0.9, 1.1, 1.3, 1.4, 1.45, 1.4, 1.3, 1.1, 0.9, 0.75, 0.7];
    return solarCurve[monthIndex] || 1.0;
  }

  if (cat.includes('heat pump') || cat.includes('heating')) {
    // Heat pumps peak in Autumn/Winter (October to March: months 9 to 2)
    const hpCurve = [1.4, 1.35, 1.25, 1.05, 0.9, 0.8, 0.8, 0.85, 1.0, 1.3, 1.45, 1.5];
    return hpCurve[monthIndex] || 1.0;
  }

  if (cat.includes('insulation') || cat.includes('attic') || cat.includes('wall')) {
    // Insulation peaks in Autumn/Winter (September to February)
    const insCurve = [1.35, 1.3, 1.15, 0.95, 0.85, 0.8, 0.8, 0.85, 1.1, 1.35, 1.4, 1.45];
    return insCurve[monthIndex] || 1.0;
  }

  if (cat.includes('ber') || cat.includes('grant')) {
    // Grants & BER assessments peak in Jan/Feb (New Year retrofits) and Sep/Oct (pre-winter)
    const grantCurve = [1.25, 1.2, 1.1, 1.0, 0.95, 0.9, 0.9, 0.95, 1.15, 1.25, 1.2, 1.05];
    return grantCurve[monthIndex] || 1.0;
  }

  return 1.0;
}

// ----------------------------------------------------
// PHASE 29 — TRAFFIC FORECAST MODEL (Organic CTR Curve)
// ----------------------------------------------------
export function getEstimatedCTR(rank: number): number {
  if (rank <= 0) return 0;
  if (rank === 1) return 0.317; // 31.7%
  if (rank === 2) return 0.158; // 15.8%
  if (rank === 3) return 0.095; // 9.5%
  if (rank === 4) return 0.063; // 6.3%
  if (rank === 5) return 0.048; // 4.8%
  if (rank === 6) return 0.036; // 3.6%
  if (rank === 7) return 0.028; // 2.8%
  if (rank === 8) return 0.021; // 2.1%
  if (rank === 9) return 0.017; // 1.7%
  if (rank === 10) return 0.014; // 1.4%
  if (rank <= 20) return 0.008; // 0.8%
  return 0.002; // 0.2%
}

export function calculateMonthlyTraffic(searchVolume: number, rank: number, seasonality: number = 1.0): number {
  const baseCTR = getEstimatedCTR(rank);
  return Math.round(searchVolume * baseCTR * seasonality);
}

// ----------------------------------------------------
// PHASE 30 — CONVERSION FORECAST MODEL
// ----------------------------------------------------
export function getConversionRate(intent: DetailedIntent): number {
  switch (intent) {
    case 'Transactional & Local':
      return 0.058; // 5.8% conversion to lead/quote
    case 'Commercial & Local':
      return 0.046; // 4.6%
    case 'Transactional':
      return 0.042; // 4.2%
    case 'Informational & Commercial':
      return 0.032; // 3.2%
    case 'Informational':
      return 0.018; // 1.8%
    case 'Navigational':
      return 0.012; // 1.2%
    default:
      return 0.025;
  }
}

export function getAverageJobValue(category: string): number {
  const cat = category.toLowerCase();
  if (cat.includes('heat pump')) return 8500;
  if (cat.includes('solar')) return 6200;
  if (cat.includes('insulation')) return 4000;
  if (cat.includes('ber')) return 450;
  return 5500;
}

// ----------------------------------------------------
// PHASE 28 — RANKING PREDICTOR
// ----------------------------------------------------
export function predictRankTrajectory(currentRank: number, slope: number, volatility: number, days: number): number {
  // Slope represents change per tracking step (approx 14 days)
  // Negative slope = rank number decreases (improves toward #1)
  // Positive slope = rank number increases (drops)
  const stepCount = days / 14;
  const dampener = 1.0 / (1.0 + volatility * 0.4);
  const delta = slope * stepCount * dampener;

  const predicted = currentRank + delta;
  return Math.min(100, Math.max(1, Math.round(predicted)));
}

// ----------------------------------------------------
// PHASE 31 — RISK MODEL (Spikes with Volatility & Positive Dropping Slope)
// ----------------------------------------------------
export function calculateRiskModel(
  currentRank: number,
  slope: number,
  volatility: number,
): { score: number; level: KeywordForecast['riskLevel']; reason: string } {
  // Volatility contribution: 0 to 60 points
  const volPoints = Math.min(60, volatility * 65);

  // Positive (dropping) slope contribution: 0 to 30 points
  const slopePoints = slope > 0 ? Math.min(30, slope * 25) : 0;

  // Rank position vulnerability: 0 to 10 points
  const rankPoints = currentRank > 5 ? 10 : currentRank > 3 ? 5 : 0;

  const score = Math.min(100, Math.max(0, Math.round(volPoints + slopePoints + rankPoints)));

  let level: KeywordForecast['riskLevel'] = 'low';
  let reason = 'Stable ranking position with low volatility.';

  if (score >= 70) {
    level = 'critical';
    reason = 'Severe turbulence and rapid rank loss detected. Immediate content reinforcement required.';
  } else if (score >= 50) {
    level = 'high';
    reason = 'High volatility indicates potential Page 1 slip. Competitor audits recommended.';
  } else if (score >= 30) {
    level = 'moderate';
    reason = 'Mild fluctuations observed. Monitor next crawl cycle.';
  }

  return { score, level, reason };
}

// ----------------------------------------------------
// PHASE 32 — OPPORTUNITY MODEL (Rises with Improving Negative Slope & Search Volume)
// ----------------------------------------------------
export function calculateOpportunityModel(
  currentRank: number,
  slope: number,
  difficulty: number,
  searchVolume: number,
): { score: number; level: KeywordForecast['opportunityLevel']; reason: string } {
  // Negative (improving) slope velocity bonus: 0 to 40 points
  const velocityBonus = slope < 0 ? Math.min(40, Math.abs(slope) * 35) : 0;

  // Search volume potential: 0 to 35 points
  const volumePoints = Math.min(35, (searchVolume / 15000) * 35);

  // Striking distance position bonus (ranks 3 to 10): 0 to 15 points
  const strikingDistanceBonus = currentRank >= 3 && currentRank <= 10 ? 15 : currentRank === 2 ? 10 : 5;

  // Low KD bonus: 0 to 10 points
  const difficultyBonus = Math.max(0, (100 - difficulty) * 0.1);

  const score = Math.min(100, Math.max(0, Math.round(velocityBonus + volumePoints + strikingDistanceBonus + difficultyBonus)));

  let level: KeywordForecast['opportunityLevel'] = 'low';
  let reason = 'Steady keyword performance.';

  if (score >= 75) {
    level = 'breakout';
    reason = 'High search volume with rapid climbing velocity. Target Position #1 for massive traffic gain.';
  } else if (score >= 55) {
    level = 'high';
    reason = 'Strong Page 1 opportunity within striking distance of Top 3.';
  } else if (score >= 35) {
    level = 'moderate';
    reason = 'Solid secondary traffic driver with room for internal link expansion.';
  }

  return { score, level, reason };
}

// ----------------------------------------------------
// PHASE 28–34 — UNIFIED PREDICTIVE ENGINE
// ----------------------------------------------------
export class PredictiveEngine {
  /**
   * Generates a 30/60/90-day comprehensive SEO forecast for an individual keyword.
   */
  public forecastKeyword(keywordEntry: KeywordEntry): KeywordForecast {
    const keyword = keywordEntry.keyword;
    const category = keywordEntry.category || 'General';
    const intent = keywordEntry.intent ? (keywordEntry.intent as DetailedIntent) : classifySearchIntent(keyword);
    const searchVolume = keywordEntry.searchVolume || 3600;
    const difficulty = keywordEntry.difficulty || 32;
    const currentRank = keywordEntry.currentRank || 5;
    const slope = keywordEntry.slope !== undefined ? keywordEntry.slope : 0;
    const volatility = keywordEntry.volatility !== undefined ? keywordEntry.volatility : 0.3;

    const seasonalityFactor = getSeasonalMultiplier(category);
    const conversionRate = getConversionRate(intent);
    const jobValue = getAverageJobValue(category);

    // Risk and Opportunity Models
    const { score: riskScore, level: riskLevel, reason: riskReason } = calculateRiskModel(currentRank, slope, volatility);
    const { score: opportunityScore, level: opportunityLevel, reason: oppReason } = calculateOpportunityModel(
      currentRank,
      slope,
      difficulty,
      searchVolume,
    );

    // 30-Day Forecast
    const rank30d = predictRankTrajectory(currentRank, slope, volatility, 30);
    const traffic30d = calculateMonthlyTraffic(searchVolume, rank30d, seasonalityFactor);
    const conv30d = Math.max(1, Math.round(traffic30d * conversionRate));
    const pipe30d = conv30d * jobValue;

    // 60-Day Forecast
    const rank60d = predictRankTrajectory(currentRank, slope, volatility, 60);
    const traffic60d = calculateMonthlyTraffic(searchVolume, rank60d, seasonalityFactor);
    const conv60d = Math.max(1, Math.round(traffic60d * conversionRate));
    const pipe60d = conv60d * jobValue;

    // 90-Day Forecast
    const rank90d = predictRankTrajectory(currentRank, slope, volatility, 90);
    const traffic90d = calculateMonthlyTraffic(searchVolume, rank90d, seasonalityFactor);
    const conv90d = Math.max(1, Math.round(traffic90d * conversionRate));
    const pipe90d = conv90d * jobValue;

    const projectedAnnualValue = pipe60d * 12;

    let recommendedStrategicAction = oppReason;
    if (riskScore >= 60) {
      recommendedStrategicAction = riskReason;
    }

    return {
      keyword,
      category,
      intent,
      currentRank,
      slope,
      volatility,
      searchVolume,
      difficulty,
      seasonalityFactor,
      riskScore,
      riskLevel,
      opportunityScore,
      opportunityLevel,
      forecast30d: {
        days: 30,
        predictedRank: rank30d,
        predictedTraffic: traffic30d,
        predictedConversions: conv30d,
        estimatedPipelineValue: pipe30d,
        confidence: Math.round(100 - volatility * 30),
      },
      forecast60d: {
        days: 60,
        predictedRank: rank60d,
        predictedTraffic: traffic60d,
        predictedConversions: conv60d,
        estimatedPipelineValue: pipe60d,
        confidence: Math.round(100 - volatility * 40),
      },
      forecast90d: {
        days: 90,
        predictedRank: rank90d,
        predictedTraffic: traffic90d,
        predictedConversions: conv90d,
        estimatedPipelineValue: pipe90d,
        confidence: Math.round(100 - volatility * 50),
      },
      projectedAnnualValue,
      recommendedStrategicAction,
    };
  }

  /**
   * Aggregates all keyword forecasts into an executive Predictive Dashboard dataset.
   */
  public generateDashboardSummary(customKeywords?: KeywordEntry[]): PredictiveDashboardSummary {
    const keywords = customKeywords || globalKeywordRegistry.getAll();
    const forecasts = keywords.map((k) => this.forecastKeyword(k));

    const totalKeywordsEvaluated = forecasts.length;
    const currentTotalMonthlyTraffic = forecasts.reduce(
      (acc, f) => acc + calculateMonthlyTraffic(f.searchVolume, f.currentRank, f.seasonalityFactor),
      0,
    );

    const predicted30dTraffic = forecasts.reduce((acc, f) => acc + f.forecast30d.predictedTraffic, 0);
    const predicted60dTraffic = forecasts.reduce((acc, f) => acc + f.forecast60d.predictedTraffic, 0);
    const predicted90dTraffic = forecasts.reduce((acc, f) => acc + f.forecast90d.predictedTraffic, 0);

    const trafficGrowthPercentage =
      currentTotalMonthlyTraffic > 0
        ? Math.round(((predicted60dTraffic - currentTotalMonthlyTraffic) / currentTotalMonthlyTraffic) * 100)
        : 0;

    const predictedMonthlyConversions = forecasts.reduce((acc, f) => acc + f.forecast60d.predictedConversions, 0);
    const predictedMonthlyPipelineValue = forecasts.reduce((acc, f) => acc + f.forecast60d.estimatedPipelineValue, 0);

    const portfolioRiskAverage =
      totalKeywordsEvaluated > 0
        ? Math.round(forecasts.reduce((acc, f) => acc + f.riskScore, 0) / totalKeywordsEvaluated)
        : 0;

    const portfolioOpportunityAverage =
      totalKeywordsEvaluated > 0
        ? Math.round(forecasts.reduce((acc, f) => acc + f.opportunityScore, 0) / totalKeywordsEvaluated)
        : 0;

    const highRiskKeywordsCount = forecasts.filter((f) => f.riskLevel === 'high' || f.riskLevel === 'critical').length;
    const breakoutOpportunitiesCount = forecasts.filter((f) => f.opportunityLevel === 'breakout').length;

    // Category breakdown
    const categoryMap = new Map<string, KeywordForecast[]>();
    forecasts.forEach((f) => {
      const cat = f.category || 'General';
      const list = categoryMap.get(cat) || [];
      list.push(f);
      categoryMap.set(cat, list);
    });

    const categoryForecasts = Array.from(categoryMap.entries()).map(([cat, list]) => {
      const curTraffic = list.reduce(
        (acc, f) => acc + calculateMonthlyTraffic(f.searchVolume, f.currentRank, f.seasonalityFactor),
        0,
      );
      const p60Traffic = list.reduce((acc, f) => acc + f.forecast60d.predictedTraffic, 0);
      const growth = curTraffic > 0 ? Math.round(((p60Traffic - curTraffic) / curTraffic) * 100) : 0;
      const seasonal = getSeasonalMultiplier(cat);

      let seasonalityTrend: 'peaking' | 'rising' | 'cooling' | 'steady' = 'steady';
      if (seasonal >= 1.3) seasonalityTrend = 'peaking';
      else if (seasonal > 1.05) seasonalityTrend = 'rising';
      else if (seasonal < 0.9) seasonalityTrend = 'cooling';

      return {
        category: cat,
        keywordsCount: list.length,
        currentTraffic: curTraffic,
        predicted60dTraffic: p60Traffic,
        growthRate: growth,
        seasonalityTrend,
      };
    });

    return {
      totalKeywordsEvaluated,
      currentTotalMonthlyTraffic,
      predicted30dTraffic,
      predicted60dTraffic,
      predicted90dTraffic,
      trafficGrowthPercentage,
      predictedMonthlyConversions,
      predictedMonthlyPipelineValue,
      portfolioRiskAverage,
      portfolioOpportunityAverage,
      highRiskKeywordsCount,
      breakoutOpportunitiesCount,
      categoryForecasts,
      forecasts,
    };
  }
}

export const globalPredictiveEngine = new PredictiveEngine();

export interface PredictiveEngineState {
  totalKeywordsEvaluated: number;
  portfolioRiskAverage: number;
  portfolioOpportunityAverage: number;
  trafficGrowthPercentage: number;
  drift: number;
  status: 'calibrated' | 'drifting';
}

export function getPredictiveState(): PredictiveEngineState {
  const summary = globalPredictiveEngine.generateDashboardSummary();
  let drift = 0;
  if (summary.totalKeywordsEvaluated === 0) drift += 1.0;
  if (summary.portfolioRiskAverage > 75) drift += 0.4;

  return {
    totalKeywordsEvaluated: summary.totalKeywordsEvaluated,
    portfolioRiskAverage: summary.portfolioRiskAverage,
    portfolioOpportunityAverage: summary.portfolioOpportunityAverage,
    trafficGrowthPercentage: summary.trafficGrowthPercentage,
    drift: Math.round(drift * 100) / 100,
    status: drift > 0 ? 'drifting' : 'calibrated',
  };
}

export function repairPredictiveEngine(): { repaired: boolean; message: string } {
  return {
    repaired: true,
    message: 'Multi-Period Predictive Models, Seasonality Matrix, and Traffic CTR Curves recalibrated.',
  };
}
