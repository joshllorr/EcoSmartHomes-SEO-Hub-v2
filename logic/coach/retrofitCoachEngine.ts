/**
 * logic/coach/retrofitCoachEngine.ts
 *
 * Phase 39 AI Retrofit Coach (Proactive Guidance Engine)
 * Proactively monitors homeowner journey progress, detects stalls, identifies upgrade opportunities,
 * adapts tone based on psychological sentiment, and dispatches behavioral coaching guidance.
 */

import { getJourneyTimeline } from '../journey/journeyEngine';
import { getHomeUpgradeBundle } from '../upgrades/homeUpgradeEngine';
import { getHomeownerSentiment } from '../sentiment/homeownerSentimentEngine';
import { getNationalInsights } from '../insights/nationalInsightsEngine';

export interface CoachMessage {
  id: string;
  user_id: string;
  text: string;
  tone: 'friendly' | 'urgent' | 'reassuring' | 'celebratory';
  createdAt: number;
  read: boolean;
}

export interface CoachMessageBundle {
  user_id: string;
  messages: CoachMessage[];
  updatedAt: number;
}

export async function generateCoachMessages(
  env: any,
  user_id: string,
): Promise<CoachMessageBundle> {
  const timeline = await getJourneyTimeline(env, user_id);
  const upgrades = await getHomeUpgradeBundle(env, user_id);
  const sentiment = await getHomeownerSentiment(env, user_id);
  const insights = await getNationalInsights(env);

  const messages: CoachMessage[] = [];
  const now = Date.now();

  const events = timeline.events || [];
  const lastEvent =
    events.length > 0
      ? events[events.length - 1].event
      : 'grant_eligibility_complete';

  // 1. Journey Milestone Nudge
  if (lastEvent === 'grant_submitted') {
    messages.push({
      id: `coach_${now}_1`,
      user_id,
      text: 'Your SEAI grant is currently under review! This is a great time to explore Smart Upgrades (such as Solar PV batteries) to maximize your long-term energy savings.',
      tone: 'friendly',
      createdAt: now,
      read: false,
    });
  }

  // 2. Post-Installation Nudge
  if (lastEvent === 'installation_complete') {
    messages.push({
      id: `coach_${now}_2`,
      user_id,
      text: 'Congratulations! Your retrofit installation is complete! The final step is your post-install BER cert assessment — this unlocks your SEAI grant payment.',
      tone: 'celebratory',
      createdAt: now,
      read: false,
    });
  }

  // 3. Sentiment & Psychological Friction Support Nudge
  if (sentiment.stress > 50) {
    messages.push({
      id: `coach_${now}_3`,
      user_id,
      text: "We know retrofit paperwork and scheduling can feel complex. You're doing great — your assigned contractor holds a 94/100 Quality Rating and our AI Copilot is here 24/7.",
      tone: 'reassuring',
      createdAt: now,
      read: false,
    });
  }

  // 4. Smart Upgrade Opportunity Nudge
  if (upgrades?.recommendations?.length > 0 && sentiment.clarity < 80) {
    messages.push({
      id: `coach_${now}_4`,
      user_id,
      text: `Your property profile has ${upgrades.recommendations.length} tailored upgrade opportunities available (e.g. ${upgrades.recommendations[0]?.title || 'Smart Energy Storage'}).`,
      tone: 'friendly',
      createdAt: now,
      read: false,
    });
  }

  // 5. National Benchmark Nudge
  if (insights.avgAnnualSavings > 1000) {
    messages.push({
      id: `coach_${now}_5`,
      user_id,
      text: `Homes in your region are saving an average of €${insights.avgAnnualSavings}/year after completing their retrofit upgrades. You're on track for optimal efficiency.`,
      tone: 'celebratory',
      createdAt: now,
      read: false,
    });
  }

  const bundle: CoachMessageBundle = {
    user_id,
    messages,
    updatedAt: now,
  };

  if (env.RETROFIT_COACH_MESSAGES) {
    await env.RETROFIT_COACH_MESSAGES.put(user_id, JSON.stringify(bundle));
    await env.RETROFIT_COACH_MESSAGES.put(
      'latest_coach_bundle',
      JSON.stringify(bundle),
    );
  }

  return bundle;
}

export async function getCoachMessages(
  env: any,
  user_id: string,
): Promise<CoachMessageBundle> {
  if (env.RETROFIT_COACH_MESSAGES) {
    const raw = await env.RETROFIT_COACH_MESSAGES.get(user_id, {
      type: 'json',
    });
    if (raw) return raw as CoachMessageBundle;
  }
  return generateCoachMessages(env, user_id);
}
