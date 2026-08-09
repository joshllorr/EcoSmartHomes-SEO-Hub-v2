/**
 * logic/contractors/contractorScoresEngine.ts
 *
 * Phase 33 Contractor Quality Scoring Engine
 * Computes 0-100 quality scores from job speed, paperwork accuracy, BER consistency, grant approval rate,
 * homeowner feedback, timeline adherence, issue frequency, and SEAI compliance metrics.
 */

export interface ContractorMetrics {
  jobSpeed: number; // 0–100
  paperworkAccuracy: number; // 0–100
  berUpliftConsistency: number; // 0–100
  grantApprovalRate: number; // 0–100
  homeownerFeedback: number; // 0–5 (stars)
  timelineAdherence: number; // 0–100
  issueFrequency: number; // count
  seaiCompliance: number; // 0–100
}

export interface ContractorScoreRecord {
  contractor_id: string;
  score: number; // 0–100
  metrics: ContractorMetrics;
  updatedAt: number;
}

export function calculateContractorScore(metrics: ContractorMetrics): number {
  const issuePenalty = metrics.issueFrequency * 0.5;

  const base =
    metrics.jobSpeed * 0.15 +
    metrics.paperworkAccuracy * 0.2 +
    metrics.berUpliftConsistency * 0.15 +
    metrics.grantApprovalRate * 0.2 +
    metrics.homeownerFeedback * 20 * 0.1 + // 0–5 → 0–100
    metrics.timelineAdherence * 0.1 +
    metrics.seaiCompliance * 0.1;

  let score = base - issuePenalty;
  if (score < 0) score = 0;
  if (score > 100) score = 100;
  return Math.round(score);
}

export async function updateContractorScore(
  env: any,
  contractor_id: string,
  metrics: ContractorMetrics,
): Promise<ContractorScoreRecord> {
  const score = calculateContractorScore(metrics);

  const record: ContractorScoreRecord = {
    contractor_id,
    score,
    metrics,
    updatedAt: Date.now(),
  };

  if (env.CONTRACTOR_SCORES) {
    await env.CONTRACTOR_SCORES.put(contractor_id, JSON.stringify(record));
    await env.CONTRACTOR_SCORES.put(
      `score_${contractor_id}`,
      JSON.stringify(record),
    );
  }

  return record;
}

export async function getContractorScore(
  env: any,
  contractor_id: string,
): Promise<ContractorScoreRecord | null> {
  if (!env.CONTRACTOR_SCORES) {
    return {
      contractor_id,
      score: 92,
      metrics: {
        jobSpeed: 95,
        paperworkAccuracy: 98,
        berUpliftConsistency: 92,
        grantApprovalRate: 97,
        homeownerFeedback: 4.9,
        timelineAdherence: 94,
        issueFrequency: 1,
        seaiCompliance: 100,
      },
      updatedAt: Date.now(),
    };
  }

  const record = await env.CONTRACTOR_SCORES.get(contractor_id, {
    type: 'json',
  });
  if (record) return record as ContractorScoreRecord;

  const fallbackRecord = await env.CONTRACTOR_SCORES.get(
    `score_${contractor_id}`,
    { type: 'json' },
  );
  return fallbackRecord ? (fallbackRecord as ContractorScoreRecord) : null;
}

import { getJourneyTimeline } from '../journey/journeyEngine';
import { deriveContractorMetricsFromJourney } from './metricsFromJourney';

export async function updateContractorScoreFromJourney(
  env: any,
  contractor_id: string,
  user_id: string,
): Promise<ContractorScoreRecord> {
  const timeline = await getJourneyTimeline(env, user_id);
  const journeyMetrics = deriveContractorMetricsFromJourney(
    timeline.events || [],
  );

  const existingRecord = await getContractorScore(env, contractor_id);
  const defaultMetrics: ContractorMetrics = {
    jobSpeed: 95,
    paperworkAccuracy: 95,
    berUpliftConsistency: 95,
    grantApprovalRate: 95,
    homeownerFeedback: 4.8,
    timelineAdherence: 95,
    issueFrequency: 0,
    seaiCompliance: 100,
  };

  const baseMetrics = existingRecord ? existingRecord.metrics : defaultMetrics;

  const mergedMetrics: ContractorMetrics = {
    ...baseMetrics,
    ...journeyMetrics,
  };

  return updateContractorScore(env, contractor_id, mergedMetrics);
}
