/**
 * src/utils/autoLinker.ts
 *
 * Semantic Auto-Linker Engine
 * Scans draft content, identifies high-relevance internal linking opportunities
 * to existing content library articles, and provides one-click markdown link insertion.
 */

export interface ContentLibraryEntry {
  id: string;
  title: string;
  slug: string;
  url: string;
  topic?: string;
  categoryType?: 'Article' | 'Landing Page' | 'Pillar' | 'Link Bait' | 'Idea' | 'Tool';
  metaDescription?: string;
  keywords?: string[];
  anchorPhrases?: string[];
}

export interface LinkMatchOccurrence {
  index: number;
  length: number;
  text: string;
  contextSnippet: string;
  isAlreadyLinked: boolean;
}

export interface AutoLinkSuggestion {
  id: string;
  targetArticle: ContentLibraryEntry;
  anchorText: string;
  targetUrl: string;
  relevanceScore: number; // 0.0 to 1.0 (e.g. 0.95)
  reason: string;
  occurrences: LinkMatchOccurrence[];
  bestOccurrenceIndex: number;
  isLinked: boolean;
}

export interface AutoLinkScanResult {
  suggestions: AutoLinkSuggestion[];
  totalOpportunities: number;
  alreadyLinkedCount: number;
  linkDensity: {
    totalWords: number;
    existingLinksCount: number;
    suggestedLinksCount: number;
    linksPerThousandWords: number;
    densityStatus: 'low' | 'optimal' | 'high';
  };
}

/**
 * Standard content library index for EcoSmartHomes SEO Hub
 */
export const DEFAULT_CONTENT_LIBRARY: ContentLibraryEntry[] = [
  {
    id: 'lib-seai-grants-2026',
    title: 'The 2026 SEAI Home Energy Upgrade Grants & BER Scale Guide',
    slug: 'seai-home-energy-upgrade-grants-2026-ber-scale-guide',
    url: '/articles/seai-home-energy-upgrade-grants-2026-ber-scale-guide',
    topic: 'SEAI Retrofit Grants 2026',
    categoryType: 'Landing Page',
    metaDescription:
      'Everything you need to know about claiming up to €12,500 in heat pump grants, €8,000 for external insulation, and €50,000 One Stop Shop deep retrofits.',
    keywords: [
      'SEAI grant',
      'SEAI grants',
      'SEAI home energy upgrade grants',
      'heat pump grant',
      'heat pump grants',
      'One Stop Shop deep retrofit',
      'One Stop Shop',
      'Warmer Homes Scheme',
      'Warmer Homes',
      'Budget 2026 SEAI',
      'grant payout',
    ],
    anchorPhrases: [
      'SEAI home energy upgrade grants',
      'SEAI grants',
      'SEAI grant',
      'heat pump grant',
      'heat pump grants',
      'One Stop Shop deep retrofit',
      'One Stop Shop',
      'Warmer Homes Scheme',
      'Warmer Homes',
    ],
  },
  {
    id: 'lib-ber-conversion-guide',
    title: 'The New 8-Category BER Scale: 2026 Official Conversion Guide',
    slug: 'the-new-8-category-ber-scale-2026-official-conversion-guide',
    url: '/articles/the-new-8-category-ber-scale-2026-official-conversion-guide',
    topic: 'BER Rating Systems',
    categoryType: 'Article',
    metaDescription:
      'Detailed breakdown of the revised BER scale categories A0 to G, kWh/m²/yr primary energy thresholds, and compliance targets.',
    keywords: [
      'BER scale',
      'BER rating',
      'BER ratings',
      'Building Energy Rating',
      'BER assessment',
      'BER upgrade',
      'primary energy threshold',
      'kWh/m²/yr',
      'A0 to G',
      'BER certificate',
    ],
    anchorPhrases: [
      'Building Energy Rating',
      'new BER scale',
      'BER scale',
      'BER rating',
      'BER ratings',
      'BER assessment',
      'BER upgrade',
      'BER certificate',
    ],
  },
  {
    id: 'lib-air-to-water-humidity',
    title: "Air-to-Water vs Ireland's humidity: performance realities you should know",
    slug: 'air-to-water-vs-irelands-humidity-performance-realities',
    url: '/articles/air-to-water-vs-irelands-humidity-performance-realities',
    topic: 'Heat Pumps & Humidity',
    categoryType: 'Article',
    metaDescription:
      'How relative humidity impacts heat pump COP and defrost cycles in Irish homes during winter frost.',
    keywords: [
      'air-to-water heat pump',
      'air-to-water heat pumps',
      'air-to-water',
      'heat pump humidity',
      'defrost cycle',
      'defrost cycles',
      'heat pump COP',
      'frost cycle',
      'ambient humidity',
    ],
    anchorPhrases: [
      'air-to-water heat pump',
      'air-to-water heat pumps',
      'air-to-water',
      'heat pump COP',
      'defrost cycle',
      'defrost cycles',
    ],
  },
  {
    id: 'lib-airtightness-health',
    title: 'Leakiness, Airtightness & Building Health',
    slug: 'leakiness-airtightness-building-health',
    url: '/articles/leakiness-airtightness-building-health',
    topic: 'Airtightness & Ventilation',
    categoryType: 'Article',
    metaDescription:
      'Achieving airtightness without adequate mechanical ventilation (MVHR) can lead to indoor air decay and condensation risk.',
    keywords: [
      'airtightness',
      'air leakiness',
      'mechanical ventilation',
      'MVHR',
      'air permeability',
      'indoor air quality',
      'condensation risk',
      'building health',
      'draught proofing',
    ],
    anchorPhrases: [
      'mechanical ventilation',
      'indoor air quality',
      'airtightness',
      'MVHR',
      'air leakiness',
      'condensation risk',
    ],
  },
  {
    id: 'lib-short-cycling-diagnostics',
    title: 'The technical reason your heat pump cycles too frequently',
    slug: 'why-heat-pumps-short-cycle-in-cold-weather',
    url: '/articles/why-heat-pumps-short-cycle-in-cold-weather',
    topic: 'Heat Pump Diagnostics',
    categoryType: 'Article',
    metaDescription:
      'Diagnose heat pump short cycling causes, buffer tank sizing mismatches, and restricted flow rate fixes.',
    keywords: [
      'heat pump short cycling',
      'short cycling',
      'cycles too frequently',
      'buffer tank sizing',
      'buffer tank',
      'compressor output',
      'flow rate',
      'heat pump cycling',
    ],
    anchorPhrases: [
      'heat pump short cycling',
      'short cycling',
      'buffer tank sizing',
      'buffer tank',
      'heat pump cycling',
    ],
  },
  {
    id: 'lib-pillar-ber-bible',
    title: 'Ultimate 2026 Irish Home Retrofit & BER Rating Upgrade Bible',
    slug: 'ber-rating-ireland-pillar-guide',
    url: '/articles/ber-rating-ireland-pillar-guide',
    topic: 'Retrofit Master Pillar',
    categoryType: 'Pillar',
    metaDescription:
      'Comprehensive hub for deep retrofitting Irish residences, grant optimization, and high-performance energy sequencing.',
    keywords: [
      'home retrofit sequence',
      'retrofit sequence',
      'deep retrofit',
      'complete BER upgrade roadmap',
      'home energy retrofit',
      'retrofit roadmap',
    ],
    anchorPhrases: [
      'home retrofit sequence',
      'complete BER upgrade roadmap',
      'deep retrofit',
      'home energy retrofit',
    ],
  },
  {
    id: 'lib-calc-seai-grant-calculator',
    title: '2026 SEAI Grant & Retrofit Investment Calculator',
    slug: 'seai-grant-investment-calculator',
    url: '/tools/seai-grant-investment-calculator',
    topic: 'Interactive Diagnostic Tool',
    categoryType: 'Tool',
    metaDescription:
      'Dynamic interactive tool calculating exact 2026 SEAI grant payouts, net retrofit capital expenditure, and paybacks.',
    keywords: [
      'SEAI grant calculator',
      'grant payout calculator',
      'retrofit investment calculator',
      'calculate your exact SEAI grant',
      'calculate your grant',
      'grant calculator',
    ],
    anchorPhrases: [
      'SEAI grant calculator',
      'calculate your exact SEAI grant',
      'grant calculator',
      'calculate your grant',
    ],
  },
];

/**
 * Escapes special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extracts ranges of existing markdown links [anchor](url) and inline code `code`
 */
function getProtectedRanges(text: string): Array<{ start: number; end: number; text: string; url?: string }> {
  const ranges: Array<{ start: number; end: number; text: string; url?: string }> = [];

  // Markdown links: [anchor](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = linkRegex.exec(text)) !== null) {
    ranges.push({
      start: match.index,
      end: match.index + match[0].length,
      text: match[1],
      url: match[2],
    });
  }

  // Code blocks: ```...``` or `...`
  const codeRegex = /(`+)([\s\S]*?)\1/g;
  while ((match = codeRegex.exec(text)) !== null) {
    ranges.push({
      start: match.index,
      end: match.index + match[0].length,
      text: match[0],
    });
  }

  return ranges;
}

/**
 * Checks if a span [start, end] overlaps with any protected ranges
 */
function isOverlapping(start: number, end: number, protectedRanges: Array<{ start: number; end: number }>): boolean {
  return protectedRanges.some(
    (range) => (start >= range.start && start < range.end) || (end > range.start && end <= range.end),
  );
}

/**
 * Extracts a surrounding sentence or snippet around the match
 */
function extractContextSnippet(fullText: string, index: number, length: number): string {
  const snippetWindow = 50;
  const start = Math.max(0, index - snippetWindow);
  const end = Math.min(fullText.length, index + length + snippetWindow);

  let prefix = fullText.substring(start, index);
  const match = fullText.substring(index, index + length);
  let suffix = fullText.substring(index + length, end);

  // Clean leading/trailing newlines
  prefix = prefix.replace(/^[\s\S]*?\n/, '').replace(/\s+/g, ' ');
  suffix = suffix.replace(/\n[\s\S]*?$/, '').replace(/\s+/g, ' ');

  const prefixDots = start > 0 ? '… ' : '';
  const suffixDots = end < fullText.length ? ' …' : '';

  return `${prefixDots}${prefix.trimStart()}[${match}]${suffix.trimEnd()}${suffixDots}`;
}

/**
 * Builds all anchor phrases for a library article
 */
function getArticlePhrases(article: ContentLibraryEntry): string[] {
  const phrases = new Set<string>();

  if (article.anchorPhrases) {
    article.anchorPhrases.forEach((p) => phrases.add(p.trim()));
  }
  if (article.keywords) {
    article.keywords.forEach((k) => phrases.add(k.trim()));
  }
  if (article.topic) {
    phrases.add(article.topic.trim());
  }

  // Filter out phrases that are too short (less than 3 characters)
  return Array.from(phrases)
    .filter((p) => p.length >= 3)
    .sort((a, b) => b.length - a.length); // Longest phrases first to match specific anchors first
}

/**
 * Scans a draft content string and generates internal linking suggestions
 */
export function scanDraftForInternalLinks(
  content: string,
  library: ContentLibraryEntry[] = DEFAULT_CONTENT_LIBRARY,
  options: {
    currentArticleId?: string;
    currentArticleTitle?: string;
    siteDomain?: string;
    minScore?: number;
    maxSuggestions?: number;
  } = {},
): AutoLinkScanResult {
  if (!content || !content.trim()) {
    return {
      suggestions: [],
      totalOpportunities: 0,
      alreadyLinkedCount: 0,
      linkDensity: {
        totalWords: 0,
        existingLinksCount: 0,
        suggestedLinksCount: 0,
        linksPerThousandWords: 0,
        densityStatus: 'low',
      },
    };
  }

  const {
    currentArticleId,
    currentArticleTitle,
    siteDomain = 'ecosmarthomes.ie',
    minScore = 0.7,
    maxSuggestions = 12,
  } = options;

  const totalWords = content.split(/\s+/).filter(Boolean).length;
  const protectedRanges = getProtectedRanges(content);
  const existingLinksCount = protectedRanges.filter((r) => r.url !== undefined).length;

  const rawSuggestions: AutoLinkSuggestion[] = [];

  // Filter out self if editing existing article
  const candidateArticles = library.filter((art) => {
    if (currentArticleId && art.id === currentArticleId) return false;
    if (
      currentArticleTitle &&
      art.title.toLowerCase().trim() === currentArticleTitle.toLowerCase().trim()
    ) {
      return false;
    }
    return true;
  });

  for (const article of candidateArticles) {
    const phrases = getArticlePhrases(article);
    const targetUrl = article.url.startsWith('http')
      ? article.url
      : `https://${siteDomain}${article.url.startsWith('/') ? '' : '/'}${article.url}`;

    // Check if target URL or title is already linked in the content
    const isAlreadyTargetLinked = protectedRanges.some(
      (r) => r.url && (r.url.includes(article.slug) || r.url === targetUrl),
    );

    let bestPhraseMatch: {
      phrase: string;
      occurrences: LinkMatchOccurrence[];
      score: number;
      reason: string;
    } | null = null;

    for (const phrase of phrases) {
      const escapedPhrase = escapeRegex(phrase);
      // Case-insensitive whole word boundary match
      const regex = new RegExp(`\\b${escapedPhrase}\\b`, 'gi');
      const occurrences: LinkMatchOccurrence[] = [];

      let match: RegExpExecArray | null;
      while ((match = regex.exec(content)) !== null) {
        const startIndex = match.index;
        const endIndex = startIndex + match[0].length;
        const isProtected = isOverlapping(startIndex, endIndex, protectedRanges);

        occurrences.push({
          index: startIndex,
          length: match[0].length,
          text: match[0],
          contextSnippet: extractContextSnippet(content, startIndex, match[0].length),
          isAlreadyLinked: isProtected || isAlreadyTargetLinked,
        });
      }

      if (occurrences.length > 0) {
        // Calculate semantic relevance score
        const phraseWordCount = phrase.split(/\s+/).length;
        let score = 0.85;

        if (phraseWordCount >= 3) {
          score = 0.96;
        } else if (phraseWordCount === 2) {
          score = 0.90;
        } else {
          score = 0.82;
        }

        // Higher weight for pillar guides & landing pages
        if (article.categoryType === 'Pillar') score = Math.min(0.99, score + 0.03);
        if (article.categoryType === 'Landing Page') score = Math.min(0.98, score + 0.02);
        if (article.categoryType === 'Tool') score = Math.min(0.97, score + 0.02);

        const reason =
          article.categoryType === 'Pillar'
            ? `Passes spoke-to-hub topical authority to the core "${article.title}" master pillar page.`
            : article.categoryType === 'Tool'
            ? `Provides dynamic user utility by linking to the "${article.title}" interactive tool.`
            : `Establishes contextual mesh linking to "${article.title}" (${article.topic || 'Retrofit Guide'}).`;

        if (!bestPhraseMatch || score > bestPhraseMatch.score || (score === bestPhraseMatch.score && phrase.length > bestPhraseMatch.phrase.length)) {
          bestPhraseMatch = {
            phrase,
            occurrences,
            score,
            reason,
          };
        }
      }
    }

    if (bestPhraseMatch && bestPhraseMatch.score >= minScore) {
      // Find unlinked occurrences first
      const unlinkedOccurrences = bestPhraseMatch.occurrences.filter((o) => !o.isAlreadyLinked);
      const isLinked = unlinkedOccurrences.length === 0;

      rawSuggestions.push({
        id: `auto-link-${article.id}`,
        targetArticle: article,
        anchorText: bestPhraseMatch.occurrences[0]?.text || bestPhraseMatch.phrase,
        targetUrl,
        relevanceScore: Math.round(bestPhraseMatch.score * 100) / 100,
        reason: bestPhraseMatch.reason,
        occurrences: bestPhraseMatch.occurrences,
        bestOccurrenceIndex: unlinkedOccurrences.length > 0 ? unlinkedOccurrences[0].index : bestPhraseMatch.occurrences[0].index,
        isLinked,
      });
    }
  }

  // Sort suggestions: unlinked first, then highest relevance score descending
  const sortedSuggestions = rawSuggestions
    .sort((a, b) => {
      if (a.isLinked !== b.isLinked) {
        return a.isLinked ? 1 : -1;
      }
      return b.relevanceScore - a.relevanceScore;
    })
    .slice(0, maxSuggestions);

  const totalOpportunities = sortedSuggestions.filter((s) => !s.isLinked).length;
  const alreadyLinkedCount = sortedSuggestions.filter((s) => s.isLinked).length;

  const totalLinksAfterSuggestions = existingLinksCount + totalOpportunities;
  const linksPerThousandWords =
    totalWords > 0 ? Math.round((totalLinksAfterSuggestions / totalWords) * 1000 * 10) / 10 : 0;

  let densityStatus: 'low' | 'optimal' | 'high' = 'optimal';
  if (linksPerThousandWords < 2) {
    densityStatus = 'low';
  } else if (linksPerThousandWords > 6) {
    densityStatus = 'high';
  }

  return {
    suggestions: sortedSuggestions,
    totalOpportunities,
    alreadyLinkedCount,
    linkDensity: {
      totalWords,
      existingLinksCount,
      suggestedLinksCount: totalOpportunities,
      linksPerThousandWords,
      densityStatus,
    },
  };
}

/**
 * Inserts a single markdown link into the content at the best or specified occurrence
 */
export function insertLinkIntoContent(
  content: string,
  suggestion: AutoLinkSuggestion,
  occurrenceIndex?: number,
): { newContent: string; success: boolean; replacedAnchor: string } {
  if (!content || !suggestion) {
    return { newContent: content, success: false, replacedAnchor: '' };
  }

  const occurrences = suggestion.occurrences;
  if (!occurrences || occurrences.length === 0) {
    return { newContent: content, success: false, replacedAnchor: '' };
  }

  // Target occurrence
  const targetOcc =
    occurrenceIndex !== undefined && occurrences[occurrenceIndex]
      ? occurrences[occurrenceIndex]
      : occurrences.find((o) => !o.isAlreadyLinked) || occurrences[0];

  const startIndex = targetOcc.index;
  const length = targetOcc.length;
  const anchorText = targetOcc.text || suggestion.anchorText;
  const markdownLink = `[${anchorText}](${suggestion.targetUrl})`;

  // Verify slice matches anchor text case-insensitively
  const existingSlice = content.substring(startIndex, startIndex + length);
  if (existingSlice.toLowerCase() !== anchorText.toLowerCase()) {
    // Fallback: simple search and replace of first unlinked occurrence
    const regex = new RegExp(`\\b${escapeRegex(anchorText)}\\b`, 'i');
    const protectedRanges = getProtectedRanges(content);
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
      if (!isOverlapping(match.index, match.index + match[0].length, protectedRanges)) {
        const newText =
          content.substring(0, match.index) +
          `[${match[0]}](${suggestion.targetUrl})` +
          content.substring(match.index + match[0].length);
        return { newContent: newText, success: true, replacedAnchor: match[0] };
      }
    }

    return { newContent: content, success: false, replacedAnchor: '' };
  }

  const newContent =
    content.substring(0, startIndex) + markdownLink + content.substring(startIndex + length);

  return { newContent, success: true, replacedAnchor: anchorText };
}

/**
 * Inserts all unlinked suggestions above a given relevance score into the content
 */
export function insertAllHighConfidenceLinks(
  content: string,
  suggestions: AutoLinkSuggestion[],
  minScoreThreshold: number = 0.80,
): { newContent: string; insertedCount: number; insertedTitles: string[] } {
  let workingContent = content;
  let insertedCount = 0;
  const insertedTitles: string[] = [];

  const eligibleSuggestions = suggestions
    .filter((s) => !s.isLinked && s.relevanceScore >= minScoreThreshold)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  for (const suggestion of eligibleSuggestions) {
    // Re-scan with working content to get fresh indices and avoid overlapping replacements
    const scan = scanDraftForInternalLinks(workingContent, [suggestion.targetArticle], {
      minScore: 0.5,
    });

    const freshSuggestion = scan.suggestions.find((s) => s.targetArticle.id === suggestion.targetArticle.id && !s.isLinked);
    if (freshSuggestion && freshSuggestion.occurrences.length > 0) {
      const result = insertLinkIntoContent(workingContent, freshSuggestion);
      if (result.success) {
        workingContent = result.newContent;
        insertedCount++;
        insertedTitles.push(suggestion.targetArticle.title);
      }
    }
  }

  return {
    newContent: workingContent,
    insertedCount,
    insertedTitles,
  };
}

/**
 * Removes a markdown link [anchor](targetUrl) and restores the plain anchor text
 */
export function removeLinkFromContent(
  content: string,
  targetUrl: string,
  anchorText?: string,
): { newContent: string; success: boolean } {
  if (!content || !targetUrl) return { newContent: content, success: false };

  // Match [anchor](targetUrl)
  const escapedUrl = escapeRegex(targetUrl);
  const regex = anchorText
    ? new RegExp(`\\[(${escapeRegex(anchorText)})\\]\\(${escapedUrl}\\)`, 'g')
    : new RegExp(`\\[([^\\]]+)\\]\\(${escapedUrl}\\)`, 'g');

  if (!regex.test(content)) {
    return { newContent: content, success: false };
  }

  const newContent = content.replace(regex, '$1');
  return { newContent, success: true };
}
