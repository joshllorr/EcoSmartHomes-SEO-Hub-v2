/**
 * Readability and Reading Time Utilities
 * Computes Flesch-Kincaid Grade Level, Flesch Reading Ease, reading time, and readability diagnostics.
 */

export interface ReadabilityMetrics {
  totalWords: number;
  totalSentences: number;
  totalSyllables: number;
  totalCharacters: number;
  complexWordsCount: number; // Words with >= 3 syllables
  complexWordsPercentage: number;
  avgWordsPerSentence: number;
  avgSyllablesPerWord: number;
  fleschKincaidGradeLevel: number; // e.g. 7.4 (7th grade)
  fleschReadingEase: number; // 0-100
  estimatedReadingTimeMinutes: number;
  estimatedReadingTimeFormatted: string;
  estimatedSpeakingTimeFormatted: string;
  accessibilityStatus: 'excellent' | 'good' | 'moderate' | 'difficult';
  accessibilityLabel: string;
  gradeDescription: string;
  targetAudienceMatch: string;
  recommendations: string[];
}

/**
 * Counts syllables in an English word using phonetic heuristic rules
 */
export function countWordSyllables(word: string): number {
  const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!cleanWord) return 0;
  if (cleanWord.length <= 3) return 1;

  // Remove trailing silent e, es, ed
  const stripped = cleanWord
    .replace(/(?:[^laeiouy]|ed|es|e)$/, '')
    .replace(/^y/, '');

  const matches = stripped.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(1, matches.length) : 1;
}

/**
 * Calculates complete readability metrics, Flesch-Kincaid grade level, and reading time for given text
 */
export function calculateReadabilityMetrics(
  text: string,
  wordsPerMinute: number = 200,
): ReadabilityMetrics {
  // Strip Markdown / formatting symbols
  const cleanText = text
    .replace(/[#*`_~[\]()]/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .trim();

  const words = cleanText.split(/\s+/).filter(Boolean);
  const totalWords = words.length;
  const totalCharacters = cleanText.replace(/\s+/g, '').length;

  if (totalWords === 0) {
    return {
      totalWords: 0,
      totalSentences: 0,
      totalSyllables: 0,
      totalCharacters: 0,
      complexWordsCount: 0,
      complexWordsPercentage: 0,
      avgWordsPerSentence: 0,
      avgSyllablesPerWord: 0,
      fleschKincaidGradeLevel: 0,
      fleschReadingEase: 100,
      estimatedReadingTimeMinutes: 0,
      estimatedReadingTimeFormatted: '0 min',
      estimatedSpeakingTimeFormatted: '0 min',
      accessibilityStatus: 'excellent',
      accessibilityLabel: 'No Content',
      gradeDescription: 'Ready for draft input',
      targetAudienceMatch: 'N/A',
      recommendations: ['Add draft content to calculate reading time and accessibility scores.'],
    };
  }

  // Sentences segmentation (minimum 2 words per valid sentence)
  const sentenceMatches = cleanText
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && s.split(/\s+/).length >= 2);
  const totalSentences = Math.max(1, sentenceMatches.length);

  let totalSyllables = 0;
  let complexWordsCount = 0;

  for (const w of words) {
    const syllables = countWordSyllables(w);
    totalSyllables += syllables;
    if (syllables >= 3) {
      complexWordsCount++;
    }
  }

  const avgWordsPerSentence = parseFloat((totalWords / totalSentences).toFixed(1));
  const avgSyllablesPerWord = parseFloat((totalSyllables / totalWords).toFixed(2));
  const complexWordsPercentage = parseFloat(
    ((complexWordsCount / totalWords) * 100).toFixed(1),
  );

  // Flesch-Kincaid Grade Level Formula:
  // 0.39 * (totalWords / totalSentences) + 11.8 * (totalSyllables / totalWords) - 15.59
  const rawFKGL =
    0.39 * (totalWords / totalSentences) +
    11.8 * (totalSyllables / totalWords) -
    15.59;
  const fleschKincaidGradeLevel = Math.max(
    0,
    parseFloat(rawFKGL.toFixed(1)),
  );

  // Flesch Reading Ease:
  // 206.835 - (1.015 * (totalWords / totalSentences)) - (84.6 * (totalSyllables / totalWords))
  const rawFRE =
    206.835 -
    1.015 * (totalWords / totalSentences) -
    84.6 * (totalSyllables / totalWords);
  const fleschReadingEase = Math.min(
    100,
    Math.max(0, Math.round(rawFRE)),
  );

  // Estimated Reading Time
  const exactReadingMinutes = totalWords / wordsPerMinute;
  const readingTotalSeconds = Math.round(exactReadingMinutes * 60);
  const readingMinutes = Math.floor(readingTotalSeconds / 60);
  const readingSeconds = readingTotalSeconds % 60;

  let estimatedReadingTimeFormatted = '';
  if (readingMinutes === 0) {
    estimatedReadingTimeFormatted = `${readingSeconds}s read`;
  } else if (readingSeconds === 0) {
    estimatedReadingTimeFormatted = `${readingMinutes} min read`;
  } else {
    estimatedReadingTimeFormatted = `${readingMinutes}m ${readingSeconds}s read`;
  }

  // Estimated Speaking Time (at ~130 WPM)
  const speakingTotalSeconds = Math.round((totalWords / 130) * 60);
  const speakingMinutes = Math.floor(speakingTotalSeconds / 60);
  const speakingSeconds = speakingTotalSeconds % 60;
  const estimatedSpeakingTimeFormatted =
    speakingMinutes === 0
      ? `${speakingSeconds}s audio`
      : `${speakingMinutes}m ${speakingSeconds}s audio`;

  // Accessibility Assessment & Grade Description
  let accessibilityStatus: 'excellent' | 'good' | 'moderate' | 'difficult' = 'good';
  let accessibilityLabel = 'Optimal Web Reading';
  let gradeDescription = '7th-8th Grade (Plain English)';
  let targetAudienceMatch = 'Ideal for Irish homeowners & grant applicants';
  const recommendations: string[] = [];

  if (fleschKincaidGradeLevel <= 6.0) {
    accessibilityStatus = 'excellent';
    accessibilityLabel = 'Highly Accessible (Universal)';
    gradeDescription = '5th-6th Grade (Very Easy)';
    targetAudienceMatch = 'Understood by 95%+ of all readers without friction';
  } else if (fleschKincaidGradeLevel <= 8.5) {
    accessibilityStatus = 'good';
    accessibilityLabel = 'Optimal Web Accessibility';
    gradeDescription = '7th-8th Grade (Plain English)';
    targetAudienceMatch = 'Perfect balance for retrofit guides, SEAI advice, and technical clarity';
  } else if (fleschKincaidGradeLevel <= 11.5) {
    accessibilityStatus = 'moderate';
    accessibilityLabel = 'Moderate Complexity';
    gradeDescription = '9th-11th Grade (High School)';
    targetAudienceMatch = 'Suitable for engineers, tradespeople, or technical readers';
    recommendations.push(
      'Consider shortening sentences exceeding 22 words to improve mobile readability.',
    );
  } else {
    accessibilityStatus = 'difficult';
    accessibilityLabel = 'High Academic Complexity';
    gradeDescription = '12th Grade+ / College Level';
    targetAudienceMatch = 'Academic or regulatory specialist audience';
    recommendations.push(
      'Break up dense compound sentences and simplify multi-syllable jargon.',
    );
  }

  if (avgWordsPerSentence > 20) {
    recommendations.push(
      `Average sentence length is ${avgWordsPerSentence} words (aim for 14-18 words).`,
    );
  }
  if (complexWordsPercentage > 20) {
    recommendations.push(
      `${complexWordsPercentage}% of words are 3+ syllables. Replace complex terms with direct equivalents where possible.`,
    );
  }
  if (recommendations.length === 0) {
    recommendations.push(
      'Content readability and grade level meet web accessibility benchmarks (WCAG AA clarity standards).',
    );
  }

  return {
    totalWords,
    totalSentences,
    totalSyllables,
    totalCharacters,
    complexWordsCount,
    complexWordsPercentage,
    avgWordsPerSentence,
    avgSyllablesPerWord,
    fleschKincaidGradeLevel,
    fleschReadingEase,
    estimatedReadingTimeMinutes: exactReadingMinutes,
    estimatedReadingTimeFormatted,
    estimatedSpeakingTimeFormatted,
    accessibilityStatus,
    accessibilityLabel,
    gradeDescription,
    targetAudienceMatch,
    recommendations,
  };
}
