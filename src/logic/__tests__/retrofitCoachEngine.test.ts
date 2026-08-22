/**
 * src/logic/__tests__/retrofitCoachEngine.test.ts
 *
 * Unit & Integration tests for Phase 39 RetrofitCoachEngine
 * Validates site visit preparation generation, NZEB Part L compliance evaluation,
 * interactive consultation, and proactive behavioral guidance bundles.
 */

import { describe, it, expect } from 'vitest';
import {
  generateCoachMessages,
  getCoachMessages,
  generateSiteVisitPrepPlan,
  evaluateNZEBCompliance,
  askRetrofitCoach,
  retrofitCoachEngine,
  RetrofitCoachEngine,
} from '../coach/retrofitCoachEngine';

describe('RetrofitCoachEngine - Core Capabilities', () => {
  const mockEnv = {
    JOURNEY_TIMELINE: {
      get: async () => ({
        user_id: 'user_test_123',
        events: [{ event: 'grant_eligibility_complete', at: Date.now() }],
      }),
      put: async () => {},
    },
    RETROFIT_COACH_MESSAGES: {
      get: async () => null,
      put: async () => {},
    },
  };

  it('generates proactive coach messages with NZEB & site visit awareness', async () => {
    const bundle = await generateCoachMessages(mockEnv, 'user_test_123');

    expect(bundle).toBeDefined();
    expect(bundle.user_id).toBe('user_test_123');
    expect(Array.isArray(bundle.messages)).toBe(true);
    expect(bundle.messages.length).toBeGreaterThan(0);

    const hasSiteVisitOrNzeb = bundle.messages.some(
      (m) => m.category === 'site_visit' || m.category === 'nzeb_compliance',
    );
    expect(hasSiteVisitOrNzeb).toBe(true);
  }, 30000);

  it('generates site visit preparation plan for technical assessment', async () => {
    const plan = await generateSiteVisitPrepPlan(
      mockEnv,
      'user_test_123',
      'technical_assessment',
      {
        propertyType: 'Semi-Detached',
        yearBuilt: 1985,
        targetBER: 'A2 NZEB',
      },
    );

    expect(plan).toBeDefined();
    expect(plan.visitType).toBe('technical_assessment');
    expect(plan.visitTitle).toContain('Technical Assessment');
    expect(plan.checklist.length).toBeGreaterThan(0);
    expect(plan.requiredDocuments.length).toBeGreaterThan(0);
    expect(plan.crucialQuestionsToAsk.length).toBeGreaterThan(0);
    expect(plan.accessAreas.length).toBeGreaterThan(0);
    expect(typeof plan.readinessScore).toBe('number');
    expect(plan.llmGuidanceNotes.length).toBeGreaterThan(20);

    // Verify key checklist item existence
    const hasAtticCheck = plan.checklist.some((c) =>
      c.task.toLowerCase().includes('attic'),
    );
    expect(hasAtticCheck).toBe(true);
  }, 30000);

  it('evaluates NZEB compliance against Irish Building Regulations Part L thresholds', async () => {
    const report = await evaluateNZEBCompliance(mockEnv, 'user_test_123', {
      propertyType: '3-Bed Semi-Detached',
      roofUValue: 0.14, // <= 0.16 (pass)
      wallUValue: 0.18, // <= 0.18 (pass)
      windowUValue: 1.1, // <= 1.2 (pass)
      airtightnessQ50: 3.8, // <= 5.0 (pass)
      heatingSystem: 'Air-to-Water Heat Pump',
      heatPumpCOP: 3.6, // >= 3.2 (pass)
      solarPVKwp: 3.2,
    });

    expect(report).toBeDefined();
    expect(report.overallStatus).toBe('compliant');
    expect(report.complianceScore).toBeGreaterThanOrEqual(90);
    expect(report.targetBER).toContain('A2');
    expect(report.epc).toBeLessThanOrEqual(0.3);
    expect(report.rerPercentage).toBeGreaterThanOrEqual(20);
    expect(report.pillars.length).toBe(5);

    // Verify all 5 pillars
    const pillars = report.pillars.map((p) => p.pillar);
    expect(pillars).toContain('Roof & Attic Insulation');
    expect(pillars).toContain('External Wall Thermal Fabric');
    expect(pillars).toContain('Glazing & External Openings');
    expect(pillars).toContain('Air Permeability & Airtightness');
    expect(pillars).toContain('Renewable Energy Contribution (RER)');
  }, 30000);

  it('detects NZEB non-compliance when fabric parameters exceed limits', async () => {
    const report = await evaluateNZEBCompliance(mockEnv, 'user_test_poor_fabric', {
      roofUValue: 0.45, // fail (>0.16)
      wallUValue: 0.55, // fail (>0.18)
      windowUValue: 2.8, // fail (>1.2)
      airtightnessQ50: 9.5, // fail (>5.0)
      heatingSystem: 'Old Oil Boiler',
      solarPVKwp: 0,
    });

    expect(report.overallStatus).toBe('non_compliant');
    expect(report.complianceScore).toBeLessThan(60);
    expect(report.remedialActions.length).toBeGreaterThan(0);
  }, 30000);

  it('provides interactive coaching advice with site visit and NZEB grounding', async () => {
    const res = await askRetrofitCoach(
      mockEnv,
      'user_test_123',
      'What are the NZEB Part L requirements for my A2 retrofit?',
    );

    expect(res).toBeDefined();
    expect(res.answer.length).toBeGreaterThan(30);
    expect(res.siteVisitTips.length).toBeGreaterThan(0);
    expect(res.nzebComplianceInsights.length).toBeGreaterThan(0);
    expect(res.answer).toMatch(/45 kWh|NZEB|Part L|primary energy|A2/i);
  }, 30000);

  it('instantiates and provides complete methods via RetrofitCoachEngine class instance', async () => {
    expect(retrofitCoachEngine).toBeInstanceOf(RetrofitCoachEngine);

    const messages = await retrofitCoachEngine.getMessages(mockEnv, 'user_test_123');
    expect(messages.messages.length).toBeGreaterThan(0);

    const sitePlan = await retrofitCoachEngine.prepareSiteVisit(
      mockEnv,
      'user_test_123',
      'heat_pump_sizing',
    );
    expect(sitePlan.visitType).toBe('heat_pump_sizing');

    const audit = await retrofitCoachEngine.auditNZEBCompliance(mockEnv, 'user_test_123');
    expect(audit.pillars.length).toBe(5);

    const consult = await retrofitCoachEngine.consult(
      mockEnv,
      'user_test_123',
      'How to prepare attic hatch?',
    );
    expect(consult.answer).toBeDefined();
  }, 60000);
});
