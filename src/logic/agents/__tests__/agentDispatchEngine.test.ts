import { describe, it, expect } from 'vitest';
import {
  globalAgentDispatchEngine,
  AgentDispatchEngine,
} from '../agentDispatchEngine';
import { AGENT_JOB_PRESETS, triggerAgentPreset } from '../agentJobPresets';

describe('AgentDispatchEngine', () => {
  it('initializes with seed jobs and squad metrics', () => {
    const jobs = globalAgentDispatchEngine.getJobs();
    expect(jobs.length).toBeGreaterThanOrEqual(2);

    const squad = globalAgentDispatchEngine.getSquadStatus();
    expect(squad).toHaveLength(4);
    expect(squad.map((s) => s.name)).toContain('Scout Agent');
    expect(squad.map((s) => s.name)).toContain('Editorial War Room');
    expect(squad.map((s) => s.name)).toContain('Compliance Keeper');
    expect(squad.map((s) => s.name)).toContain('Attribution Watchdog');
  });

  it('dispatches and executes a Compliance Keeper agent job with MARL consensus', async () => {
    const job = await globalAgentDispatchEngine.dispatchJob(
      'compliance',
      { auditTargets: ['heat_pump', 'solar_pv'] },
      { title: 'Test Compliance Audit' },
    );

    expect(job).toBeDefined();
    expect(job.id).toMatch(/^job_/);
    expect(job.type).toBe('compliance');
    expect(job.title).toBe('Test Compliance Audit');

    // Wait for async execution
    await new Promise((r) => setTimeout(r, 200));

    const updatedJob = globalAgentDispatchEngine.getJobById(job.id);
    expect(updatedJob).toBeDefined();
    expect(updatedJob?.status).toBe('completed');
    expect(updatedJob?.progress).toBe(100);
    expect(updatedJob?.result?.complianceStatus).toBe('100% PASSED');
    expect(updatedJob?.consensus?.approved).toBe(true);
    expect(updatedJob?.consensus?.votes).toHaveLength(3);
  });

  it('dispatches and executes a Scout agent job across Irish counties', async () => {
    const job = await globalAgentDispatchEngine.dispatchJob(
      'scout',
      { counties: ['cork', 'limerick'] },
      { title: 'Test Munster Scout' },
    );

    await new Promise((r) => setTimeout(r, 200));

    const updated = globalAgentDispatchEngine.getJobById(job.id);
    expect(updated?.status).toBe('completed');
    expect(updated?.result?.totalCountiesScanned).toBe(2);
    expect(updated?.result?.totalEstimatedVolume).toBeGreaterThan(0);
    expect(updated?.steps.some((s) => s.agent === 'Scout Agent')).toBe(true);
  });

  it('dispatches and executes an Attribution Watchdog job', async () => {
    const job = await globalAgentDispatchEngine.dispatchJob('attribution', {});

    await new Promise((r) => setTimeout(r, 100));

    const updated = globalAgentDispatchEngine.getJobById(job.id);
    expect(updated?.status).toBe('completed');
    expect(updated?.result?.advisorBookingCorrelation).toBe('81.2%');
    expect(updated?.result?.highestConvertingCounties).toBeInstanceOf(Array);
  });

  it('evaluates MARL consensus correctly', () => {
    const engine = AgentDispatchEngine.getInstance();
    const mockJob: any = {
      id: 'mock_job',
      type: 'editorial',
      title: 'Mock Editorial Task',
    };

    const consensus = engine.evaluateConsensus(mockJob);
    expect(consensus.approved).toBe(true);
    expect(consensus.score).toBeGreaterThanOrEqual(consensus.threshold);
    expect(consensus.votes).toHaveLength(3);
    expect(consensus.recommendation).toBe('publish');
  });

  it('triggers registered presets correctly', async () => {
    expect(AGENT_JOB_PRESETS.length).toBeGreaterThanOrEqual(4);

    const moatJob = await triggerAgentPreset('moat_sweep');
    expect(moatJob.type).toBe('scout');

    const seaiJob = await triggerAgentPreset('seai_audit');
    expect(seaiJob.type).toBe('compliance');

    await expect(triggerAgentPreset('non_existent_preset')).rejects.toThrow(
      /Unknown agent preset/,
    );
  });
});
