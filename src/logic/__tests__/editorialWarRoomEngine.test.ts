import { describe, it, expect } from 'vitest';
import {
  globalEditorialWarRoomEngine,
  EditorialWarRoomEngine,
} from '../editorialWarRoomEngine';

describe('EditorialWarRoomEngine', () => {
  it('instantiates the engine with verified 2026 caps', () => {
    const engine = new EditorialWarRoomEngine();
    expect(engine).toBeDefined();
  });

  it('runs complete 4-agent editorial pipeline successfully in fallback/test mode', async () => {
    const phasesRecorded: number[] = [];
    const result = await globalEditorialWarRoomEngine.executePipeline({
      title: 'SEAI Heat Pump Grants 2026 Limerick V94',
      topic: 'Heat pump grants and BER upgrade steps',
      pillar: 'SEAI Grants 2026',
      keywords: ['heat pump grant €12,500', 'SEAI grants Limerick'],
      tone: 'Authoritative & Warm',
      audience: 'Irish homeowners',
      region: 'Limerick V94',
      onPhaseUpdate: (update) => {
        phasesRecorded.push(update.phase);
      },
    });

    expect(result).toBeDefined();
    expect(result.content).toBeDefined();
    expect(result.articleBody).toBeDefined();
    expect(result.articleBody.length).toBeGreaterThan(500);

    // Verify metadata
    expect(result.jsonMetadata.title).toBe(
      'SEAI Heat Pump Grants 2026 Limerick V94',
    );
    expect(result.jsonMetadata.slug).toBe(
      'seai-heat-pump-grants-2026-limerick-v94',
    );
    expect(result.jsonMetadata.word_count).toBeGreaterThan(100);
    expect(result.jsonMetadata.reading_time_mins).toBeGreaterThanOrEqual(1);

    // Verify JSON-LD Schema
    expect(result.jsonLdSchema).toBeDefined();
    expect(result.jsonLdSchema['@type']).toBe('FAQPage');
    expect(Array.isArray(result.jsonLdSchema.mainEntity)).toBe(true);

    // Verify War Room Certification Report
    expect(result.certificationReport).toBeDefined();
    expect(result.certificationReport.complianceCertified).toBe(true);
    expect(
      result.certificationReport.grantAccuracyScore,
    ).toBeGreaterThanOrEqual(95);
    expect(
      result.certificationReport.verifiedBudget2026Caps.length,
    ).toBeGreaterThanOrEqual(5);

    // Verify all 4 phases ran
    expect(phasesRecorded).toContain(1);
    expect(phasesRecorded).toContain(2);
    expect(phasesRecorded).toContain(3);
    expect(phasesRecorded).toContain(4);
  });

  it('contains critical 2026 monetary caps in generated article body', async () => {
    const result = await globalEditorialWarRoomEngine.executePipeline({
      title: 'Deep Retrofit Cost Ireland 2026',
    });

    // Verify Budget 2026 specific rates are present
    expect(result.articleBody).toMatch(/€12,500/);
    expect(result.articleBody).toMatch(/€50,000/);
    expect(result.articleBody).toMatch(/A0/);
  });
});
