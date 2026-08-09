/**
 * logic/contractors/metricsFromJourney.ts
 *
 * Phase 33 Real Journey Metrics Extractor
 * Converts real homeowner journey timelines into contractor performance metrics.
 */

import { JourneyEvent, getDuration } from '../journey/journeyEngine';
import { ContractorMetrics } from './contractorScoresEngine';

export function deriveContractorMetricsFromJourney(
  events: JourneyEvent[],
): Partial<ContractorMetrics> {
  const installationDuration = getDuration(
    events,
    'contractor_assigned',
    'installation_complete',
  );
  const berUploadDuration = getDuration(
    events,
    'installation_complete',
    'ber_uploaded',
  );
  const grantApprovalDuration = getDuration(
    events,
    'grant_submitted',
    'seai_approved',
  );

  const metrics: Partial<ContractorMetrics> = {};

  // Job Speed (installation)
  if (installationDuration !== null) {
    const days = Math.max(0.1, installationDuration / (1000 * 60 * 60 * 24));
    metrics.jobSpeed = Math.max(0, Math.min(100, Math.round(100 - days * 5))); // lose 5 points per day
  }

  // Paperwork Accuracy (BER upload speed)
  if (berUploadDuration !== null) {
    const days = Math.max(0.1, berUploadDuration / (1000 * 60 * 60 * 24));
    metrics.paperworkAccuracy = Math.max(
      0,
      Math.min(100, Math.round(100 - days * 4)),
    ); // lose 4 points per day
  }

  // Grant Approval Rate (fast approvals = good)
  if (grantApprovalDuration !== null) {
    const days = Math.max(0.1, grantApprovalDuration / (1000 * 60 * 60 * 24));
    metrics.grantApprovalRate = Math.max(
      0,
      Math.min(100, Math.round(100 - days * 3)),
    ); // lose 3 points per day
  }

  // Timeline Adherence (overall consistency)
  const expectedTimeline = {
    installation: 7, // days
    berUpload: 5,
    approval: 14,
  };

  let adherenceScore = 100;

  if (installationDuration !== null) {
    const days = installationDuration / (1000 * 60 * 60 * 24);
    if (days > expectedTimeline.installation)
      adherenceScore -= (days - expectedTimeline.installation) * 2;
  }

  if (berUploadDuration !== null) {
    const days = berUploadDuration / (1000 * 60 * 60 * 24);
    if (days > expectedTimeline.berUpload)
      adherenceScore -= (days - expectedTimeline.berUpload) * 2;
  }

  if (grantApprovalDuration !== null) {
    const days = grantApprovalDuration / (1000 * 60 * 60 * 24);
    if (days > expectedTimeline.approval)
      adherenceScore -= (days - expectedTimeline.approval) * 1.5;
  }

  metrics.timelineAdherence = Math.max(
    0,
    Math.min(100, Math.round(adherenceScore)),
  );

  return metrics;
}
