import { describe, it, expect } from 'vitest';
import {
  scanDraftForInternalLinks,
  insertLinkIntoContent,
  insertAllHighConfidenceLinks,
  removeLinkFromContent,
  DEFAULT_CONTENT_LIBRARY,
} from '../autoLinker';

describe('AutoLinker Engine (src/utils/autoLinker.ts)', () => {
  const sampleDraft = `
# How to Claim SEAI Home Energy Upgrade Grants in 2026

If you are looking to improve your home's BER rating and reduce your winter heating bills, you should explore the SEAI home energy upgrade grants. 

Installing an air-to-water heat pump can significantly boost energy efficiency, but you must ensure your home achieves adequate airtightness with controlled mechanical ventilation. 

Without proper sizing, you might experience heat pump short cycling during cold spells.
`;

  it('scans draft text and finds semantic internal linking opportunities', () => {
    const result = scanDraftForInternalLinks(sampleDraft, DEFAULT_CONTENT_LIBRARY, {
      siteDomain: 'ecosmarthomes.ie',
    });

    expect(result.suggestions.length).toBeGreaterThan(0);
    expect(result.totalOpportunities).toBeGreaterThan(0);
    expect(result.linkDensity.totalWords).toBeGreaterThan(40);

    // Verify key suggestions are detected
    const titles = result.suggestions.map((s) => s.targetArticle.title);
    expect(titles).toContain('The 2026 SEAI Home Energy Upgrade Grants & BER Scale Guide');
    expect(titles).toContain("Air-to-Water vs Ireland's humidity: performance realities you should know");
    expect(titles).toContain('Leakiness, Airtightness & Building Health');
  });

  it('calculates higher semantic relevance for multi-word phrases and pillars', () => {
    const result = scanDraftForInternalLinks(sampleDraft, DEFAULT_CONTENT_LIBRARY);
    const seaiSuggestion = result.suggestions.find((s) =>
      s.targetArticle.title.includes('SEAI Home Energy Upgrade Grants'),
    );

    expect(seaiSuggestion).toBeDefined();
    expect(seaiSuggestion?.relevanceScore).toBeGreaterThanOrEqual(0.9);
    expect(seaiSuggestion?.reason).toBeDefined();
  });

  it('inserts a single markdown link into the draft text', () => {
    const result = scanDraftForInternalLinks(sampleDraft, DEFAULT_CONTENT_LIBRARY, {
      siteDomain: 'ecosmarthomes.ie',
    });
    const seaiSuggestion = result.suggestions.find((s) =>
      s.targetArticle.title.includes('SEAI Home Energy Upgrade Grants'),
    );

    expect(seaiSuggestion).toBeDefined();
    if (seaiSuggestion) {
      const insertion = insertLinkIntoContent(sampleDraft, seaiSuggestion);
      expect(insertion.success).toBe(true);
      expect(insertion.newContent).toContain(
        `[${insertion.replacedAnchor}](${seaiSuggestion.targetUrl})`,
      );
    }
  });

  it('protects existing markdown links from being double-linked', () => {
    const contentWithLink = `
Check out the [SEAI home energy upgrade grants](https://ecosmarthomes.ie/articles/seai-guide) for 2026.
Also inspect airtightness for your building.
`;

    const result = scanDraftForInternalLinks(contentWithLink, DEFAULT_CONTENT_LIBRARY);
    const seaiSuggestion = result.suggestions.find((s) =>
      s.targetArticle.title.includes('SEAI Home Energy Upgrade Grants'),
    );

    expect(seaiSuggestion?.isLinked).toBe(true);

    const airtightnessSuggestion = result.suggestions.find((s) =>
      s.targetArticle.title.includes('Airtightness'),
    );
    expect(airtightnessSuggestion?.isLinked).toBe(false);
  });

  it('inserts all high-confidence links in batch mode', () => {
    const batchResult = insertAllHighConfidenceLinks(sampleDraft, DEFAULT_CONTENT_LIBRARY.map((art) => ({
      id: art.id,
      targetArticle: art,
      anchorText: art.anchorPhrases?.[0] || art.title,
      targetUrl: `https://ecosmarthomes.ie${art.url}`,
      relevanceScore: 0.95,
      reason: 'Batch test',
      occurrences: [
        {
          index: 50,
          length: 10,
          text: art.anchorPhrases?.[0] || art.title,
          contextSnippet: 'test',
          isAlreadyLinked: false,
        },
      ],
      bestOccurrenceIndex: 0,
      isLinked: false,
    })));

    expect(batchResult.insertedCount).toBeGreaterThanOrEqual(1);
    expect(batchResult.newContent).toContain('https://ecosmarthomes.ie');
  });

  it('removes markdown links cleanly when unlinked', () => {
    const linkedText = 'Here are the [SEAI grants](https://ecosmarthomes.ie/articles/seai-guide) for 2026.';
    const unlinked = removeLinkFromContent(
      linkedText,
      'https://ecosmarthomes.ie/articles/seai-guide',
      'SEAI grants',
    );

    expect(unlinked.success).toBe(true);
    expect(unlinked.newContent).toBe('Here are the SEAI grants for 2026.');
  });
});
