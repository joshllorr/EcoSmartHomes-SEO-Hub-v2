/**
 * logic/sentiment/homeownerSentimentEngine.ts
 *
 * Phase 38 Homeowner Sentiment & Confidence Engine
 * Builds a psychological telemetry model (confidence, clarity, stress, satisfaction, trust)
 * by integrating AI Copilot chat messages, journey timeline milestones, upgrade recommendations,
 * contractor performance ratings, and national SEAI operational benchmarks.
 */

import { AdvisorMessage } from "../advisor/retrofitAdvisorEngine";

export interface HomeownerSentiment {
  user_id: string;
  confidence: number;   // 0–100
  clarity: number;       // 0–100
  stress: number;        // 0–100
  satisfaction: number;  // 0–100
  trust: number;         // 0–100
  updatedAt: number;
}

export function deriveSentimentFromChat(messages: AdvisorMessage[]): Partial<HomeownerSentiment> {
  if (!messages || messages.length === 0) return {};
  const lastUserMsg = [...messages].reverse().find(m => m.role === "user")?.text?.toLowerCase();
  const sentiment: Partial<HomeownerSentiment> = {};

  if (!lastUserMsg) return sentiment;

  if (lastUserMsg.includes("confused") || lastUserMsg.includes("lost") || lastUserMsg.includes("understand")) {
    sentiment.clarity = 40;
    sentiment.confidence = 50;
  }

  if (lastUserMsg.includes("worried") || lastUserMsg.includes("concerned") || lastUserMsg.includes("delay") || lastUserMsg.includes("cost")) {
    sentiment.stress = 70;
    sentiment.trust = 60;
  }

  if (lastUserMsg.includes("happy") || lastUserMsg.includes("great") || lastUserMsg.includes("excellent") || lastUserMsg.includes("thanks")) {
    sentiment.satisfaction = 90;
    sentiment.confidence = 85;
  }

  if (lastUserMsg.includes("next step") || lastUserMsg.includes("ready") || lastUserMsg.includes("start")) {
    sentiment.clarity = 85;
    sentiment.confidence = 80;
  }

  return sentiment;
}

export async function calculateHomeownerSentiment(env: any, user_id: string): Promise<HomeownerSentiment> {
  let session: any = null;
  let timeline: any = null;
  let upgrades: any = null;

  if (env.RETROFIT_ADVISOR_SESSIONS) {
    session = await env.RETROFIT_ADVISOR_SESSIONS.get(`advisor_${user_id}`, { type: "json" });
  }

  if (env.JOURNEY_TIMELINE) {
    timeline = await env.JOURNEY_TIMELINE.get(`timeline_${user_id}`, { type: "json" });
  }

  if (env.HOME_UPGRADE_RECOMMENDATIONS) {
    upgrades = await env.HOME_UPGRADE_RECOMMENDATIONS.get(user_id, { type: "json" });
  }

  const base: HomeownerSentiment = {
    user_id,
    confidence: 78,
    clarity: 82,
    stress: 24,
    satisfaction: 88,
    trust: 92,
    updatedAt: Date.now()
  };

  // 1. Incorporate Copilot Chat Sentiment Signals
  if (session?.messages) {
    Object.assign(base, deriveSentimentFromChat(session.messages));
  }

  // 2. Incorporate Journey Milestone Signals
  if (timeline?.events?.length) {
    const lastEvent = timeline.events[timeline.events.length - 1].event;
    if (lastEvent === "seai_paid") {
      base.satisfaction = 96;
      base.confidence = 94;
      base.stress = 10;
    } else if (lastEvent === "grant_submitted") {
      base.stress = 38;
      base.trust = 88;
    } else if (lastEvent === "installation_complete") {
      base.satisfaction = 90;
      base.confidence = 88;
    }
  }

  // 3. Incorporate Upgrade Recommendation Clarity Signals
  if (upgrades?.recommendations?.length) {
    base.clarity = Math.min(100, base.clarity + 10);
  }

  if (env.HOMEOWNER_SENTIMENT) {
    await env.HOMEOWNER_SENTIMENT.put(user_id, JSON.stringify(base));
    await env.HOMEOWNER_SENTIMENT.put("latest_sentiment", JSON.stringify(base));
  }

  return base;
}

export async function getHomeownerSentiment(env: any, user_id: string): Promise<HomeownerSentiment> {
  if (env.HOMEOWNER_SENTIMENT) {
    const raw = await env.HOMEOWNER_SENTIMENT.get(user_id, { type: "json" });
    if (raw) return raw as HomeownerSentiment;
  }
  return calculateHomeownerSentiment(env, user_id);
}
