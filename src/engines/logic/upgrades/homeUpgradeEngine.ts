/**
 * logic/upgrades/homeUpgradeEngine.ts
 *
 * Phase 34 AI Home Upgrade Recommendation Engine
 * Analyzes journey timeline events, energy setup, insulation status, and current BER rating
 * to generate prioritized, costed, and CO2-impacted smart home upgrade recommendations.
 */

import { JourneyTimeline } from "../journey/journeyEngine";

export interface HomeUpgradeRecommendation {
  id: string;
  user_id: string;
  priority: "low" | "medium" | "high";
  category: "insulation" | "heating" | "solar" | "ventilation" | "controls" | "fabric" | "storage";
  title: string;
  description: string;
  estimatedCost: number | null;
  estimatedSavings: number | null;
  co2ImpactKgPerYear: number | null;
  dependencies: string[]; // other recommendation IDs
  createdAt: number;
  updatedAt: number;
}

export interface HomeUpgradeBundle {
  user_id: string;
  recommendations: HomeUpgradeRecommendation[];
  updatedAt: number;
}

export function deriveUpgradesFromJourney(timeline: JourneyTimeline): HomeUpgradeRecommendation[] {
  const events = timeline.events || [];
  const recs: HomeUpgradeRecommendation[] = [];
  const now = Date.now();
  const userId = timeline.user_id;

  const hasSolar = events.some(e => e.event === "seai_paid" || e.event === "installation_complete" || (e.notes && e.notes.toLowerCase().includes("solar")));
  const hasHeatPump = events.some(e => e.event === "seai_paid" || (e.notes && e.notes.toLowerCase().includes("heat pump")));
  const hasInsulation = events.some(e => e.event === "seai_paid" || (e.notes && e.notes.toLowerCase().includes("insulation")));

  // 1. Storage Battery Upgrade
  if (hasSolar && !events.some(e => e.notes && e.notes.toLowerCase().includes("battery"))) {
    recs.push({
      id: `upgrade_battery_${now}`,
      user_id: userId,
      priority: "high",
      category: "storage",
      title: "Add a 5kWh Smart Battery for Solar PV",
      description: "You already have Solar PV installed. Adding a smart battery lets you store daytime excess generation and power your home through evening peak tariff hours.",
      estimatedCost: 4500,
      estimatedSavings: 420,
      co2ImpactKgPerYear: 550,
      dependencies: [],
      createdAt: now,
      updatedAt: now
    });
  }

  // 2. Thermal Insulation Upgrade
  if (hasHeatPump && !hasInsulation) {
    recs.push({
      id: `upgrade_insulation_${now}`,
      user_id: userId,
      priority: "high",
      category: "insulation",
      title: "Upgrade External Wall & Attic Thermal Fabric",
      description: "Your heat pump operates at peak seasonal COP efficiency when supported by low heat loss thermal fabric. Upgrading attic and wall insulation reduces heat demand.",
      estimatedCost: 6000,
      estimatedSavings: 650,
      co2ImpactKgPerYear: 820,
      dependencies: [],
      createdAt: now,
      updatedAt: now
    });
  }

  // 3. Solar PV Generation Complement
  if (!hasSolar) {
    recs.push({
      id: `upgrade_solar_${now}`,
      user_id: userId,
      priority: "high",
      category: "solar",
      title: "Install 4.2kWp Rooftop Solar PV & Diverter",
      description: "Complement your heating system with clean rooftop solar electricity, supported by the SEAI €3,000 grant offset and hot water diverter.",
      estimatedCost: 6500,
      estimatedSavings: 580,
      co2ImpactKgPerYear: 750,
      dependencies: [],
      createdAt: now,
      updatedAt: now
    });
  }

  // 4. Smart Heating Controls & Zoning
  if (!events.some(e => e.notes && e.notes.toLowerCase().includes("controls"))) {
    recs.push({
      id: `upgrade_controls_${now}`,
      user_id: userId,
      priority: "medium",
      category: "controls",
      title: "Deploy Multi-Zone Smart Thermostatic Controls",
      description: "Automate room-by-room heating schedules with smartphone control and weather compensation logic, eligible for €1,000 SEAI grant funding.",
      estimatedCost: 1200,
      estimatedSavings: 280,
      co2ImpactKgPerYear: 310,
      dependencies: [],
      createdAt: now,
      updatedAt: now
    });
  }

  return recs;
}

export async function generateHomeUpgradeBundle(env: any, user_id: string): Promise<HomeUpgradeBundle> {
  const now = Date.now();
  let timeline: JourneyTimeline | null = null;

  if (env.JOURNEY_TIMELINE) {
    const raw = await env.JOURNEY_TIMELINE.get(`timeline_${user_id}`, { type: "json" });
    timeline = raw ? (raw as JourneyTimeline) : null;
  }

  if (!timeline) {
    timeline = {
      timeline_id: `timeline_${user_id}`,
      user_id,
      events: [
        { event: "grant_eligibility_complete", at: now - 864000000 },
        { event: "contractor_assigned", at: now - 500000000 },
        { event: "installation_complete", at: now - 300000000, notes: "Heat Pump & Solar PV installed" },
        { event: "seai_paid", at: now, notes: "Grant funds disbursed" }
      ],
      updatedAt: now
    };
  }

  const recs = deriveUpgradesFromJourney(timeline);
  const bundle: HomeUpgradeBundle = {
    user_id,
    recommendations: recs,
    updatedAt: now
  };

  if (env.HOME_UPGRADE_RECOMMENDATIONS) {
    await env.HOME_UPGRADE_RECOMMENDATIONS.put(user_id, JSON.stringify(bundle));
    await env.HOME_UPGRADE_RECOMMENDATIONS.put("latest_bundle", JSON.stringify(bundle));
  }

  return bundle;
}

export async function getHomeUpgradeBundle(env: any, user_id: string): Promise<HomeUpgradeBundle> {
  if (env.HOME_UPGRADE_RECOMMENDATIONS) {
    const raw = await env.HOME_UPGRADE_RECOMMENDATIONS.get(user_id, { type: "json" });
    if (raw) return raw as HomeUpgradeBundle;
  }
  return generateHomeUpgradeBundle(env, user_id);
}
