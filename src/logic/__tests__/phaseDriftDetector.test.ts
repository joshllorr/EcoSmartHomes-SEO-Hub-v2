import { describe, it, expect, beforeEach } from 'vitest';
import {
  detectPhaseDrift,
  autoRepairDrift,
  computeDriftScore,
} from '../phaseDriftDetector';

describe('Option A — Phase Drift Detector & Auto-Repair Sentinel', () => {
  it('computes baseline delta drift score with tolerance dampener', () => {
    const zeroDrift = computeDriftScore(0.2, 0.25, 0.1);
    expect(zeroDrift).toBe(0);

    const realDrift = computeDriftScore(0.8, 0.2, 0.1);
    expect(realDrift).toBe(0.5);
  });

  it('runs complete 49-phase drift audit and returns structured report', () => {
    const report = detectPhaseDrift();

    expect(report).toHaveProperty('overallStabilityScore');
    expect(report).toHaveProperty('totalDrift');
    expect(report).toHaveProperty('phases');
    expect(Array.isArray(report.phases)).toBe(true);
    expect(report.phases.length).toBe(5);

    // Verify all 5 phase groups are audited
    const groupNames = report.phases.map((p) => p.phaseGroup);
    expect(groupNames).toContain('Phase Group 1 (1–7)');
    expect(groupNames).toContain('Phase Group 2 (8–15)');
    expect(groupNames).toContain('Phase Group 3 (16–27)');
    expect(groupNames).toContain('Phase Group 4 (28–34)');
    expect(groupNames).toContain('Phase Group 6 (43–49)');
  });

  it('executes auto-repair routines and maintains high stability score', () => {
    const repairResult = autoRepairDrift();

    expect(repairResult).toHaveProperty('repairsAttempted');
    expect(repairResult).toHaveProperty('postRepairStabilityScore');
    expect(repairResult.postRepairStabilityScore).toBeGreaterThanOrEqual(90);
  });
});
