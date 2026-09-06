import { describe, it, expect } from 'vitest';
import {
  detectSnippetType,
  extractIrishRetrofitEntities,
  calculateHijackScore,
  buildSpeakableJsonLd,
  generatePosition0AnswerCard,
} from '../positionZeroHijacker';

describe('Position 0 & AI Overview Hijacker Engine', () => {
  describe('detectSnippetType', () => {
    it('detects table_comparison for cost and comparison queries', () => {
      expect(detectSnippetType('heat pump cost vs gas boiler')).toBe(
        'table_comparison',
      );
      expect(detectSnippetType('solar pv prices ireland rates')).toBe(
        'table_comparison',
      );
    });

    it('detects step_by_step for instructional and process queries', () => {
      expect(detectSnippetType('how to apply for seai solar grant')).toBe(
        'step_by_step',
      );
      expect(detectSnippetType('ber rating upgrade sequence steps')).toBe(
        'step_by_step',
      );
    });

    it('detects grant_calculator_answer for savings and calculator queries', () => {
      expect(detectSnippetType('solar payback calculator munster')).toBe(
        'grant_calculator_answer',
      );
      expect(detectSnippetType('how much heat pump savings per year')).toBe(
        'grant_calculator_answer',
      );
    });

    it('defaults to definition for conceptual queries', () => {
      expect(detectSnippetType('what is a heat loss indicator')).toBe(
        'definition',
      );
    });
  });

  describe('extractIrishRetrofitEntities', () => {
    it('extracts regulatory and grant entities accurately', () => {
      const entities = extractIrishRetrofitEntities(
        'SEAI grant for heat pump requiring Part L and BER assessment in Limerick V94',
      );
      expect(entities).toContain('SEAI Better Energy Homes Grant');
      expect(entities).toContain('Part L Building Regulations');
      expect(entities).toContain('Building Energy Rating (BER)');
      expect(entities).toContain('Limerick V94 Postal District');
    });

    it('provides high-value default entities when none are explicitly mentioned', () => {
      const entities = extractIrishRetrofitEntities('home energy renovation');
      expect(entities.length).toBeGreaterThanOrEqual(2);
      expect(entities).toContain('SEAI Better Energy Homes Grant');
    });
  });

  describe('calculateHijackScore', () => {
    it('awards high score (90+) for optimal 40–55 word snippet with entities and schema', () => {
      const optimalAnswer =
        'SEAI solar electricity grants provide up to €2,100 for Irish domestic properties in 2026. Homeowners install roof-mounted photovoltaic panels to generate zero-carbon electricity, qualify for Clean Export Guarantee export payments, and achieve significant annual electricity bill savings under Part L building compliance standards.';
      const entities = [
        'SEAI Better Energy Homes Grant',
        'Part L Building Regulations',
        'Clean Export Guarantee (CEG)',
      ];

      const { score, breakdown } = calculateHijackScore(
        optimalAnswer,
        entities,
        true,
      );
      expect(score).toBeGreaterThanOrEqual(90);
      expect(breakdown.lengthScore).toBe(35);
      expect(breakdown.schemaScore).toBe(25);
    });

    it('penalizes snippets with poor word count and missing schema', () => {
      const tooShortAnswer = 'SEAI grants exist for solar panels in Ireland.';
      const { score, breakdown } = calculateHijackScore(
        tooShortAnswer,
        [],
        false,
      );
      expect(score).toBeLessThan(50);
      expect(breakdown.schemaScore).toBe(5);
    });
  });

  describe('buildSpeakableJsonLd', () => {
    it('builds valid W3C SpeakableSpecification and FAQPage schema', () => {
      const schema = buildSpeakableJsonLd({
        keyword: 'solar pv grants ireland',
        url: 'https://ecosmarthomes.ie/grants/solar-pv-grants',
        conciseAnswer:
          'SEAI solar grants provide up to €2,100 for residential properties.',
        bulletSteps: ['Apply online', 'Install panels', 'Claim grant'],
      });

      expect(schema['@context']).toBe('https://schema.org');
      expect(Array.isArray(schema['@graph'])).toBe(true);

      const faq = schema['@graph'].find(
        (item: any) => item['@type'] === 'FAQPage',
      );
      expect(faq).toBeDefined();
      expect(faq.mainEntity[0].name).toContain('Solar pv grants ireland');
      expect(faq.mainEntity[0].acceptedAnswer.text).toContain('Key steps');

      const webpage = schema['@graph'].find(
        (item: any) => item['@type'] === 'WebPage',
      );
      expect(webpage).toBeDefined();
      expect(webpage.speakable['@type']).toBe('SpeakableSpecification');
      expect(webpage.speakable.cssSelector).toContain('#position-zero-answer');
    });
  });

  describe('generatePosition0AnswerCard', () => {
    it('synthesizes complete Answer Card for Solar PV query with table and steps', () => {
      const card = generatePosition0AnswerCard({
        keyword: 'solar pv grants ireland',
      });

      expect(card.id).toBeDefined();
      expect(card.keyword).toBe('solar pv grants ireland');
      expect(card.wordCount).toBeGreaterThanOrEqual(35);
      expect(card.wordCount).toBeLessThanOrEqual(60);
      expect(card.keyEntities.length).toBeGreaterThan(0);
      expect(card.bulletSteps?.length).toBe(4);
      expect(card.comparisonTable?.headers.length).toBeGreaterThan(0);
      expect(card.schemaJsonLd).toBeDefined();
      expect(card.hijackScore).toBeGreaterThanOrEqual(85);
      expect(card.recommendations.length).toBeGreaterThan(0);
    });

    it('synthesizes complete Answer Card for Heat Pump query', () => {
      const card = generatePosition0AnswerCard({
        keyword: 'heat pump cost limerick v94',
      });

      expect(card.conciseAnswer).toContain('€6,500');
      expect(card.conciseAnswer).toContain('Heat Loss Indicator');
      expect(
        card.bulletSteps?.some((s) => s.includes('Technical Advisor')),
      ).toBe(true);
      expect(card.comparisonTable?.rows.length).toBeGreaterThan(0);
    });

    it('allows custom answer override while maintaining schema and scoring', () => {
      const customSnippet =
        'Irish homeowners can claim substantial grant deductions for attic insulation under the National Retrofit Plan. By upgrading mineral wool to 300mm depth, properties achieve Part L compliance and eliminate heat loss through the roof structure.';
      const card = generatePosition0AnswerCard({
        keyword: 'attic insulation grants',
        customConciseAnswer: customSnippet,
      });

      expect(card.conciseAnswer).toBe(customSnippet);
      expect(card.wordCount).toBe(customSnippet.split(/\s+/).length);
      expect(card.schemaJsonLd).toBeDefined();
    });
  });
});
