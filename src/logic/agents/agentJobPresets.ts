/**
 * src/logic/agents/agentJobPresets.ts
 *
 * Pre-configured Autonomous Agent Job Presets for EcoSmartHomes SEO Hub
 */

import { globalAgentDispatchEngine, AgentJob } from './agentDispatchEngine';

export interface JobPresetDefinition {
  id: string;
  name: string;
  description: string;
  badge: string;
  type: 'scout' | 'editorial' | 'compliance' | 'attribution' | 'orchestrator';
  defaultPriority: 'high' | 'normal' | 'low';
  estimatedDurationSecs: number;
}

export const AGENT_JOB_PRESETS: JobPresetDefinition[] = [
  {
    id: 'moat_sweep',
    name: '26-County Regional Moat Batch Sweep',
    description:
      'Dispatches Scout Agent to crawl SERP demand, extract keyword gaps, and verify landing pages across Dublin, Cork, Galway, Limerick & all 26 Irish counties.',
    badge: 'Regional Moat',
    type: 'scout',
    defaultPriority: 'high',
    estimatedDurationSecs: 4,
  },
  {
    id: 'editorial_warroom',
    name: 'Editorial War Room Content Generation',
    description:
      'Triggers the 4-agent collaborative drafting room (Grant Auditor, SEO Architect, Irish Voice Stylist, Compliance Critic) for high-intent retrofit guides.',
    badge: 'Editorial AI',
    type: 'editorial',
    defaultPriority: 'high',
    estimatedDurationSecs: 6,
  },
  {
    id: 'seai_audit',
    name: 'SEAI 2026 Statutory Compliance Sweep',
    description:
      'Runs Compliance Keeper to audit all grant figures against the March 2026 SEAI rulebook, checking €12,500 heat pump caps, €50,000 OSS ceilings, and BER scales.',
    badge: 'Compliance 2026',
    type: 'compliance',
    defaultPriority: 'normal',
    estimatedDurationSecs: 2,
  },
  {
    id: 'attribution_sync',
    name: 'Attribution & Conversion Telemetry Sync',
    description:
      'Runs Attribution Watchdog to evaluate SEAI Retrofit Blueprint PDF download rates and measure advisor booking conversion correlation across Irish regions.',
    badge: 'Attribution',
    type: 'attribution',
    defaultPriority: 'normal',
    estimatedDurationSecs: 3,
  },
  {
    id: 'orchestrator_cycle',
    name: 'Master Orchestrator Unified AI Cycle',
    description:
      'Executes the Phase 40 unified control loop across homeowner journeys, sentiment metrics, contractor scoring, and 6- & 12-month predictive forecasts.',
    badge: 'Phase 40 Core',
    type: 'orchestrator',
    defaultPriority: 'high',
    estimatedDurationSecs: 5,
  },
];

/**
 * Trigger an agent preset by ID
 */
export async function triggerAgentPreset(
  presetId: string,
  options?: {
    customTitle?: string;
    overridePayload?: any;
  },
): Promise<AgentJob> {
  const preset = AGENT_JOB_PRESETS.find((p) => p.id === presetId);
  if (!preset) {
    throw new Error(`Unknown agent preset: "${presetId}"`);
  }

  let payload = options?.overridePayload;
  if (!payload) {
    switch (preset.id) {
      case 'moat_sweep':
        payload = {
          counties: [
            'dublin',
            'cork',
            'galway',
            'limerick',
            'waterford',
            'kerry',
            'kildare',
            'meath',
          ],
          depth: 'comprehensive',
        };
        break;
      case 'editorial_warroom':
        payload = {
          title:
            'SEAI Heat Pump Grants Ireland 2026: Complete Homeowner Playbook',
          topic: 'Heat Pump Grants 2026',
          pillar: 'Grants & Subsidies',
          region: 'Republic of Ireland',
        };
        break;
      case 'seai_audit':
        payload = {
          standardsVersion: 'SEAI-2026-Q1',
          inspectPdfs: true,
        };
        break;
      case 'attribution_sync':
        payload = {
          windowDays: 30,
          targetRegions: ['Munster', 'Leinster', 'Connacht', 'Ulster'],
        };
        break;
      case 'orchestrator_cycle':
        payload = {
          runFullSuite: true,
        };
        break;
      default:
        payload = {};
    }
  }

  return globalAgentDispatchEngine.dispatchJob(preset.type, payload, {
    title: options?.customTitle || preset.name,
    priority: preset.defaultPriority,
  });
}
