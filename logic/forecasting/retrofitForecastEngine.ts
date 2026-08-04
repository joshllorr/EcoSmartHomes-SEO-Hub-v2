/**
 * logic/forecasting/retrofitForecastEngine.ts
 *
 * Phase 36 Predictive Retrofit Forecasting Engine
 * Generates 6-12 month predictive forecasts for national/regional retrofit demand,
 * technology adoption, upgrade categories, contractor capacities, and bottleneck risks at Cloudflare Edge.
 */

import { NationalInsights, getNationalInsights } from "../insights/nationalInsightsEngine";

export interface RetrofitForecast {
  generatedAt: number;
  horizonMonths: number;

  demandForecast: Record<string, number>; // region → predicted retrofits
  upgradeForecast: Record<string, number>; // category → predicted demand
  techAdoptionForecast: Record<string, number>; // solar, heat pump, insulation, battery
  contractorCapacityForecast: {
    elite: number;
    strong: number;
    risky: number;
  };

  avgApprovalTimeForecastDays: number;
  avgInstallationTimeForecastDays: number;

  carbonOffsetForecastTonnes: number;
  savingsForecastEuro: number;

  bottleneckRisk: {
    contractorShortage: number; // 0–100
    berAssessorShortage: number; // 0–100
    seaiQueuePressure: number; // 0–100
  };
}

export function generateForecastFromInsights(insights: NationalInsights, months: number): RetrofitForecast {
  const growthFactor = 1 + (months * 0.03); // 3% monthly compounding baseline growth

  const demandForecast: Record<string, number> = {};
  for (const [region, count] of Object.entries(insights.regionalDemand || {})) {
    demandForecast[region] = Math.round(count * growthFactor);
  }

  const upgradeForecast: Record<string, number> = {};
  for (const [cat, count] of Object.entries(insights.upgradeCategoryDemand || {})) {
    upgradeForecast[cat] = Math.round(count * growthFactor);
  }

  const techAdoptionForecast: Record<string, number> = {};
  for (const [tech, count] of Object.entries(insights.techMix || {})) {
    techAdoptionForecast[tech] = Math.round(count * growthFactor);
  }

  const eliteCapacity = insights.contractorCapacity?.elite || 3;
  const strongCapacity = insights.contractorCapacity?.strong || 2;
  const riskyCapacity = insights.contractorCapacity?.risky || 0;

  const contractorCapacityForecast = {
    elite: Math.round(eliteCapacity * growthFactor),
    strong: Math.round(strongCapacity * growthFactor),
    risky: Math.round(riskyCapacity * growthFactor)
  };

  const carbonOffsetForecastTonnes = Math.round((insights.totalCarbonOffsetTonnes || 214.8) * growthFactor * 10) / 10;
  const savingsForecastEuro = Math.round((insights.avgAnnualSavings || 1280) * growthFactor);

  const totalHomeowners = insights.totalHomeowners || 114;
  const avgApprovalDays = insights.avgSEAIApprovalTimeDays || 4;

  const bottleneckRisk = {
    contractorShortage: Math.min(100, Math.round((totalHomeowners / Math.max(1, contractorCapacityForecast.elite)) * 2.5)),
    berAssessorShortage: Math.min(100, Math.round((totalHomeowners / 50) * 8)),
    seaiQueuePressure: Math.min(100, Math.round(avgApprovalDays * 4.5))
  };

  return {
    generatedAt: Date.now(),
    horizonMonths: months,
    demandForecast,
    upgradeForecast,
    techAdoptionForecast,
    contractorCapacityForecast,
    avgApprovalTimeForecastDays: Math.round(avgApprovalDays * growthFactor),
    avgInstallationTimeForecastDays: Math.round((insights.avgInstallationTimeDays || 6) * growthFactor),
    carbonOffsetForecastTonnes,
    savingsForecastEuro,
    bottleneckRisk
  };
}

export async function generateAndStoreForecast(env: any, months: number = 6): Promise<RetrofitForecast> {
  const insights = await getNationalInsights(env);
  const forecast = generateForecastFromInsights(insights, months);

  if (env.RETROFIT_FORECASTS) {
    await env.RETROFIT_FORECASTS.put(`forecast_${months}`, JSON.stringify(forecast));
    await env.RETROFIT_FORECASTS.put("latest_forecast", JSON.stringify(forecast));
  }

  return forecast;
}

export async function getForecast(env: any, months: number = 6): Promise<RetrofitForecast> {
  if (env.RETROFIT_FORECASTS) {
    const raw = await env.RETROFIT_FORECASTS.get(`forecast_${months}`, { type: "json" });
    if (raw) return raw as RetrofitForecast;
  }
  return generateAndStoreForecast(env, months);
}
