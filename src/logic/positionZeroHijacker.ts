/**
 * Position 0 & AI Overview Hijacker (Autonomous Generative Answer Engine)
 *
 * Re-engineers Google Ireland Featured Snippets & AI Overviews:
 * - 40–55 word optimal concise answer definition
 * - W3C SpeakableSpecification & FAQPage JSON-LD microdata
 * - Irish residential retrofit compliance citations (SEAI, Part L, S.R. 54:2014)
 * - Algorithmic 0–100 Position 0 Hijack Score
 */

export type Position0SnippetType =
  | 'definition'
  | 'step_by_step'
  | 'table_comparison'
  | 'grant_calculator_answer';

export interface ComparisonTableRow {
  category: string;
  grantAmount: string;
  netCostEstimate: string;
  berImpact: string;
  paybackPeriod: string;
}

export interface Position0AnswerCard {
  id: string;
  keyword: string;
  snippetType: Position0SnippetType;
  targetUrl: string;
  conciseAnswer: string;
  wordCount: number;
  keyEntities: string[];
  bulletSteps?: string[];
  comparisonTable?: {
    headers: string[];
    rows: string[][];
  };
  speakableCssSelectors: string[];
  schemaJsonLd: Record<string, any>;
  hijackScore: number; // 0 to 100
  scoreBreakdown: {
    lengthScore: number; // max 35 (ideal: 40-55 words)
    entityScore: number; // max 25 (Irish regulatory/grant entities)
    schemaScore: number; // max 25 (Speakable & FAQ microdata)
    readabilityScore: number; // max 15 (direct syntax & clarity)
  };
  recommendations: string[];
  createdAt: number;
}

/**
 * Detects the optimal Featured Snippet format for a given search query.
 */
export function detectSnippetType(keyword: string): Position0SnippetType {
  const kw = keyword.toLowerCase().trim();

  if (
    kw.includes('vs') ||
    kw.includes('compare') ||
    kw.includes('cost') ||
    kw.includes('rates') ||
    kw.includes('prices') ||
    kw.includes('breakdown')
  ) {
    return 'table_comparison';
  }

  if (
    kw.includes('how to') ||
    kw.includes('steps') ||
    kw.includes('process') ||
    kw.includes('apply') ||
    kw.includes('requirements') ||
    kw.includes('sequence')
  ) {
    return 'step_by_step';
  }

  if (
    kw.includes('calculator') ||
    kw.includes('payback') ||
    kw.includes('savings') ||
    kw.includes('how much')
  ) {
    return 'grant_calculator_answer';
  }

  return 'definition';
}

/**
 * Extracts key Irish retrofit, regulatory, and Eircode entities.
 */
export function extractIrishRetrofitEntities(text: string): string[] {
  const normalized = text.toLowerCase();
  const knownEntities = [
    {
      entity: 'SEAI Better Energy Homes Grant',
      patterns: ['seai', 'grant', 'better energy homes'],
    },
    {
      entity: 'SEAI Solar PV & Microgeneration Grant',
      patterns: ['solar', 'pv', 'photovoltaic', 'microgeneration'],
    },
    {
      entity: 'Part L Building Regulations',
      patterns: ['part l', 'building regulation', 'conservation of fuel'],
    },
    {
      entity: 'S.R. 54:2014 Code of Practice',
      patterns: ['s.r. 54', 'code of practice', 'sr 54'],
    },
    {
      entity: 'Building Energy Rating (BER)',
      patterns: ['ber', 'building energy rating', 'b2', 'a-rated'],
    },
    {
      entity: 'Clean Export Guarantee (CEG)',
      patterns: ['clean export', 'ceg', 'feed-in tariff', 'microgeneration'],
    },
    {
      entity: 'Heat Loss Indicator (HLI ≤ 2.0)',
      patterns: ['heat loss indicator', 'hli', 'technical assessment'],
    },
    {
      entity: 'Triple Action Retrofit',
      patterns: ['fabric first', 'triple action', 'insulation'],
    },
    {
      entity: 'Limerick V94 Postal District',
      patterns: ['limerick', 'v94', 'munster', 'shannonside'],
    },
    {
      entity: 'One-Stop-Shop (OSS) Subsidies',
      patterns: ['one-stop-shop', 'oss', 'national retrofit'],
    },
  ];

  const matched: string[] = [];
  knownEntities.forEach((item) => {
    if (item.patterns.some((p) => normalized.includes(p))) {
      matched.push(item.entity);
    }
  });

  // Guarantee high-value domain entities if none matched
  if (matched.length === 0) {
    matched.push(
      'SEAI Better Energy Homes Grant',
      'Building Energy Rating (BER)',
    );
  }

  return matched;
}

/**
 * Calculates Position 0 Hijack Probability Score (0 to 100).
 * Optimal snippet criteria:
 * - 40 to 55 words (Google sweet-spot avoids truncation)
 * - 3+ high-intent Irish entities
 * - Valid speakable schema included
 */
export function calculateHijackScore(
  conciseAnswer: string,
  keyEntities: string[],
  hasSchema: boolean,
): { score: number; breakdown: Position0AnswerCard['scoreBreakdown'] } {
  const words = conciseAnswer.trim().split(/\s+/).filter(Boolean);
  const count = words.length;

  // 1. Length Score (max 35)
  let lengthScore = 35;
  if (count >= 40 && count <= 55) {
    lengthScore = 35;
  } else if ((count >= 35 && count < 40) || (count > 55 && count <= 62)) {
    lengthScore = 28;
  } else if ((count >= 25 && count < 35) || (count > 62 && count <= 75)) {
    lengthScore = 18;
  } else {
    lengthScore = Math.max(5, 35 - Math.abs(48 - count) * 1.5);
  }

  // 2. Entity Density Score (max 25)
  const entityScore = Math.min(25, Math.max(5, keyEntities.length * 8));

  // 3. Schema Completeness Score (max 25)
  const schemaScore = hasSchema ? 25 : 5;

  // 4. Readability & Syntax Score (max 15)
  // Penalize complex multi-clause sentence structures, reward direct definition openers
  let readabilityScore = 15;
  const firstSentence = conciseAnswer.split('.')[0] || '';
  if (
    firstSentence.toLowerCase().includes(' is ') ||
    firstSentence.toLowerCase().includes(' offers ') ||
    firstSentence.toLowerCase().includes(' allows ') ||
    firstSentence.toLowerCase().includes(' provides ')
  ) {
    readabilityScore = 15;
  } else {
    readabilityScore = 12;
  }

  const total = Math.round(
    lengthScore + entityScore + schemaScore + readabilityScore,
  );
  const boundedScore = Math.min(100, Math.max(10, total));

  return {
    score: boundedScore,
    breakdown: {
      lengthScore: Math.round(lengthScore),
      entityScore: Math.round(entityScore),
      schemaScore,
      readabilityScore,
    },
  };
}

/**
 * Builds W3C SpeakableSpecification & FAQPage JSON-LD schema microdata.
 */
export function buildSpeakableJsonLd(params: {
  keyword: string;
  url: string;
  conciseAnswer: string;
  bulletSteps?: string[];
  comparisonTable?: { headers: string[]; rows: string[][] };
  cssSelectors?: string[];
}): Record<string, any> {
  const cssSelectors = params.cssSelectors || [
    '#position-zero-answer',
    '.featured-snippet-definition',
    '.speakable-summary',
  ];

  const fullAnswer =
    params.bulletSteps && params.bulletSteps.length > 0
      ? `${params.conciseAnswer} Key steps: ${params.bulletSteps.join('; ')}.`
      : params.conciseAnswer;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FAQPage',
        '@id': `${params.url}#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name:
              params.keyword.charAt(0).toUpperCase() +
              params.keyword.slice(1) +
              ' in Ireland?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: fullAnswer,
            },
          },
        ],
      },
      {
        '@type': 'WebPage',
        '@id': params.url,
        url: params.url,
        name: `${params.keyword} | EcoSmartHomes Ireland Guide`,
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: cssSelectors,
        },
      },
    ],
  };
}

/**
 * Generates an optimized, topic-aware 42-48 word concise answer for Irish retrofit topics.
 */
function synthesizeConciseAnswer(
  keyword: string,
  type: Position0SnippetType,
): {
  conciseAnswer: string;
  bulletSteps?: string[];
  comparisonTable?: { headers: string[]; rows: string[][] };
} {
  const kw = keyword.toLowerCase();

  if (kw.includes('solar') || kw.includes('pv')) {
    return {
      conciseAnswer:
        'SEAI solar electricity grants provide up to €2,100 for Irish domestic properties in 2026. Homeowners install roof-mounted photovoltaic panels to generate zero-carbon electricity, qualify for Clean Export Guarantee export payments, and achieve significant annual electricity bill savings under Part L building compliance standards.',
      bulletSteps: [
        'Complete preliminary BER technical assessment with registered advisor',
        'Secure SEAI grant pre-approval before contractor commencement',
        'Install approved Tier 1 panels with micro-inverters or battery storage',
        'Submit post-works BER certification to claim €2,100 grant reimbursement',
      ],
      comparisonTable: {
        headers: [
          'System Size',
          'SEAI Grant',
          'Est. Net Cost',
          'BER Upgrade',
          'Payback Period',
        ],
        rows: [
          [
            '2kWp (5 Panels)',
            '€900',
            '€3,200',
            '+1 BER Sub-Grade',
            '6.2 Years',
          ],
          [
            '4kWp (10 Panels)',
            '€1,800',
            '€4,800',
            '+2 BER Sub-Grades',
            '5.1 Years',
          ],
          [
            '6kWp + 5kWh Battery',
            '€2,100',
            '€7,600',
            '+3 BER Sub-Grades',
            '4.4 Years',
          ],
        ],
      },
    };
  }

  if (kw.includes('heat pump')) {
    return {
      conciseAnswer:
        'Irish homeowners can claim up to €6,500 in SEAI heat pump grants to replace fossil fuel heating. Eligibility requires a Heat Loss Indicator rating of 2.0 W/K/m² or lower, verified by an independent SEAI Technical Advisor through a preliminary home technical assessment.',
      bulletSteps: [
        'Commission registered Technical Advisor for Heat Loss Indicator (HLI) test',
        'Upgrade attic and cavity wall insulation to reach HLI ≤ 2.0 W/K/m²',
        'Contract SEAI-registered heat pump installer for air-to-water installation',
        'Complete final BER assessment to unlock grant payout and €200 advisor fee repayment',
      ],
      comparisonTable: {
        headers: [
          'Property Type',
          'SEAI Grant',
          'Est. Gross Cost',
          'Net Cost',
          'Annual Energy Saving',
        ],
        rows: [
          ['Detached Home', '€6,500', '€14,500', '€8,000', '€1,450 / year'],
          [
            'Semi-Detached (Munster)',
            '€6,500',
            '€12,000',
            '€5,500',
            '€1,180 / year',
          ],
          ['Terraced / Apartment', '€4,500', '€9,500', '€5,000', '€820 / year'],
        ],
      },
    };
  }

  if (
    kw.includes('insulation') ||
    kw.includes('attic') ||
    kw.includes('wall')
  ) {
    return {
      conciseAnswer:
        'SEAI insulation grants fund up to 80% of costs for attic and cavity wall upgrades in Irish homes built before 2011. Grants range from €1,500 for attic insulation to €8,000 for external wall insulation, significantly reducing heating bills and preventing thermal bridging.',
      bulletSteps: [
        'Schedule home insulation survey with registered insulation contractor',
        'Apply for SEAI individual energy upgrade grant online',
        'Execute 300mm mineral wool or pumped cavity wall insulation',
        'Publish updated post-retrofit BER certificate showing upgraded energy grade',
      ],
      comparisonTable: {
        headers: [
          'Insulation Type',
          'SEAI Grant',
          'Avg. Gross Cost',
          'Net Cost',
          'Heat Retention',
        ],
        rows: [
          [
            'Attic Insulation (300mm)',
            '€1,500',
            '€2,200',
            '€700',
            '25% Heat Loss Reduction',
          ],
          [
            'Cavity Wall Pumping',
            '€1,700',
            '€2,400',
            '€700',
            '35% Heat Loss Reduction',
          ],
          [
            'External Wall Insulation (EWI)',
            '€8,000',
            '€18,000',
            '€10,000',
            '50% Heat Loss Reduction',
          ],
        ],
      },
    };
  }

  if (
    kw.includes('ber') ||
    kw.includes('rating') ||
    kw.includes('assessment')
  ) {
    return {
      conciseAnswer:
        'A Building Energy Rating (BER) assesses the energy performance of an Irish residential property on an A-to-G scale. An official BER assessment is legally mandatory before applying for SEAI energy upgrade grants, selling, or renting any domestic property in Ireland.',
      bulletSteps: [
        'Book certified BER assessor via national SEAI register',
        'Assessor audits wall insulation, heating controls, glazing, and ventilation',
        'Receive official 10-year BER certificate and advisory report (cost €180–€300)',
        'Use advisory report to sequence grant-subsidised retrofit upgrades to B2 target',
      ],
      comparisonTable: {
        headers: [
          'BER Scale',
          'Primary Energy (kWh/m²/yr)',
          'Estimated Annual Fuel Spend',
          'Value Added',
        ],
        rows: [
          ['G to E', '> 300 kWh/m²', '€3,400+', 'Baseline Valuation'],
          ['C to B', '150–225 kWh/m²', '€1,800–€2,400', '+5% Market Premium'],
          [
            'A0 to B (Green Mortgage)',
            '< 125 kWh/m²',
            'Under €1,200',
            '+10% Value + Lower APR',
          ],
        ],
      },
    };
  }

  // Default Ireland Retrofit Answer
  return {
    conciseAnswer: `The SEAI residential grant scheme provides extensive financial subsidies for ${keyword} in Ireland. Homeowners can access government grants to cover up to 50% of capital upgrade costs, boosting property value and lowering carbon emissions under national climate targets.`,
    bulletSteps: [
      'Verify home build date is eligible (typically prior to 2011 or 2021 for solar PV)',
      'Apply online via SEAI portal prior to issuing contractor purchase orders',
      'Select registered and insured installation specialists',
      'Submit contractor Declaration of Works to receive direct bank transfer grant reimbursement',
    ],
  };
}

/**
 * Primary Generator for Position 0 Answer Cards (Autonomous Generative Answer Engine)
 */
export function generatePosition0AnswerCard(params: {
  keyword: string;
  targetUrl?: string;
  competitorSnippet?: string;
  preferredType?: Position0SnippetType;
  customConciseAnswer?: string;
}): Position0AnswerCard {
  const cleanKw = params.keyword.trim();
  const slug = cleanKw.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const url = params.targetUrl || `https://ecosmarthomes.ie/grants/${slug}`;

  const snippetType = params.preferredType || detectSnippetType(cleanKw);

  const synthesized = params.customConciseAnswer
    ? { conciseAnswer: params.customConciseAnswer }
    : synthesizeConciseAnswer(cleanKw, snippetType);

  const conciseAnswer = synthesized.conciseAnswer;
  const keyEntities = extractIrishRetrofitEntities(
    `${cleanKw} ${conciseAnswer}`,
  );
  const words = conciseAnswer.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const speakableCssSelectors = [
    '#position-zero-card',
    '.featured-snippet-definition',
    '.speakable-summary',
  ];

  const schemaJsonLd = buildSpeakableJsonLd({
    keyword: cleanKw,
    url,
    conciseAnswer,
    bulletSteps: synthesized.bulletSteps,
    comparisonTable: synthesized.comparisonTable,
    cssSelectors: speakableCssSelectors,
  });

  const { score: hijackScore, breakdown: scoreBreakdown } =
    calculateHijackScore(conciseAnswer, keyEntities, true);

  const recommendations = [
    `Inject this 45-word snippet directly underneath the primary <h1> heading inside an <aside id="position-zero-card"> element.`,
    `Embed the generated JSON-LD script containing SpeakableSpecification to qualify for voice searches and Google AI Overview citations.`,
    `Ensure the target URL "${url}" passes Google Core Web Vitals with LCP under 2.5 seconds.`,
  ];

  if (wordCount < 40) {
    recommendations.push(
      `Snippet length is ${wordCount} words; consider expanding slightly to 45 words for maximum snippet container fill.`,
    );
  } else if (wordCount > 55) {
    recommendations.push(
      `Snippet length is ${wordCount} words; tighten phrasing to prevent Google search snippet truncation.`,
    );
  }

  return {
    id: `p0-${Date.now()}-${slug}`,
    keyword: cleanKw,
    snippetType,
    targetUrl: url,
    conciseAnswer,
    wordCount,
    keyEntities,
    bulletSteps: synthesized.bulletSteps,
    comparisonTable: synthesized.comparisonTable,
    speakableCssSelectors,
    schemaJsonLd,
    hijackScore,
    scoreBreakdown,
    recommendations,
    createdAt: Date.now(),
  };
}
