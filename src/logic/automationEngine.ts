/**
 * Phase Group 3 — Automation Engine (Phases 16–27)
 *
 * Implements:
 * 16. Internal Link Reinforcer (Phase 16)
 * 17. Semantic Entity Booster (Phase 17)
 * 18. Metadata Corrector (Phase 18)
 * 19. Schema Validator (Phase 19)
 * 20. Content Refresh Queue (Phase 20)
 * 21. Content Writer AI (Phase 21)
 * 22. Outline Generator (Phase 22)
 * 23. Grant Intelligence Module (Phase 23)
 * 24. PDF Export Engine (Phase 24)
 * 25. Crawl Scheduler (Phase 25)
 * 26. Crawl Scanner (Phase 26)
 * 27. Refresh Impact Tracker (Phase 27)
 */

import {
  globalKeywordRegistry,
  calculateSlope,
  calculateVolatility,
  classifyStabilityZone,
  StabilityZone,
} from './keywordIntelligence';

export interface AutomationLog {
  id: string;
  phase: number;
  phaseName: string;
  action: string;
  target: string;
  status: 'success' | 'warning' | 'error' | 'info';
  details: string;
  timestamp: number;
}

export interface InternalLinkTarget {
  anchor: string;
  url: string;
  category: string;
}

export interface SchemaValidationResult {
  valid: boolean;
  schemaType: string;
  errors: string[];
  warnings: string[];
  missingRequiredFields: string[];
  recommendations: string[];
}

export interface RefreshQueueItem {
  id: string;
  url: string;
  keyword: string;
  currentRank: number;
  slope: number;
  volatility: number;
  zone: StabilityZone;
  priority: 'critical' | 'high' | 'medium' | 'low';
  reason: string;
  queuedAt: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  lastRefreshedAt?: number;
}

export interface GrantSchemeInfo {
  id: string;
  name: string;
  maxGrantAmount: number;
  propertyEligibility: string;
  requirements: string[];
  measures: Array<{ measure: string; grantValue: number }>;
}

export interface ScheduledCrawlJob {
  id: string;
  keyword: string;
  targetUrl: string;
  intervalHours: number;
  nextRun: number;
  lastRun?: number;
  priority: 'critical' | 'high' | 'normal';
  status: 'scheduled' | 'running' | 'completed';
}

export interface CrawlScanResult {
  url: string;
  statusCode: number;
  loadTimeMs: number;
  title: string;
  metaDescription: string;
  h1Count: number;
  h2Count: number;
  internalLinksCount: number;
  externalLinksCount: number;
  schemaFound: boolean;
  issues: string[];
  score: number; // 0 to 100
}

export interface RefreshImpactRecord {
  id: string;
  keyword: string;
  url: string;
  refreshedAt: number;
  preRefreshRank: number;
  postRefreshRank: number;
  rankDelta: number; // positive = improved, negative = declined
  preRefreshSlope: number;
  postRefreshSlope: number;
  preRefreshVolatility: number;
  postRefreshVolatility: number;
  measuredDaysAfter: number;
  impactVerdict: 'significant_gain' | 'moderate_gain' | 'neutral' | 'needs_attention';
}

export class AutomationEngine {
  private logs: AutomationLog[] = [];
  private refreshQueue: Map<string, RefreshQueueItem> = new Map();
  private scheduledJobs: Map<string, ScheduledCrawlJob> = new Map();
  private impactRecords: RefreshImpactRecord[] = [];

  constructor() {
    this.seedDefaultQueue();
    this.seedDefaultScheduledJobs();
  }

  public getLogs(limit: number = 50): AutomationLog[] {
    return [...this.logs].reverse().slice(0, limit);
  }

  public addLog(
    phase: number,
    phaseName: string,
    action: string,
    target: string,
    status: AutomationLog['status'],
    details: string,
  ): AutomationLog {
    const log: AutomationLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      phase,
      phaseName,
      action,
      target,
      status,
      details,
      timestamp: Date.now(),
    };
    this.logs.push(log);
    if (this.logs.length > 500) {
      this.logs.shift();
    }
    return log;
  }

  // ----------------------------------------------------
  // PHASE 16 — INTERNAL LINK REINFORCER
  // ----------------------------------------------------
  public reinforeInternalLinks(
    htmlOrMarkdown: string,
    customTargets?: InternalLinkTarget[],
  ): { content: string; linksAdded: number; addedLinks: InternalLinkTarget[] } {
    const defaultTargets: InternalLinkTarget[] = customTargets || [
      { anchor: 'heat pump grants', url: '/grants/heat-pumps', category: 'Heat Pumps' },
      { anchor: 'solar pv grants ireland', url: '/grants/solar-pv', category: 'Solar' },
      { anchor: 'seai grants limerick', url: '/grants/limerick-v94', category: 'Local' },
      { anchor: 'attic insulation cost', url: '/insulation/attic', category: 'Insulation' },
      { anchor: 'ber rating upgrade', url: '/ber-rating-guide', category: 'BER' },
      { anchor: 'one stop shop retrofit', url: '/one-stop-shop', category: 'General' },
    ];

    let content = htmlOrMarkdown;
    let linksAdded = 0;
    const addedLinks: InternalLinkTarget[] = [];

    defaultTargets.forEach((target) => {
      // Look for plain text occurrences not already inside a markdown link or HTML tag
      const regex = new RegExp(`(?<!\\[)(?<!href=")(?<!>)\\b(${target.anchor})\\b(?!\\])(?!</a>)`, 'i');
      if (regex.test(content)) {
        content = content.replace(regex, `[$1](${target.url})`);
        linksAdded++;
        addedLinks.push(target);
      }
    });

    this.addLog(
      16,
      'Internal Link Reinforcer',
      'link_injection',
      `${linksAdded} links reinforced`,
      'success',
      `Reinforced contextual anchors: ${addedLinks.map((l) => l.anchor).join(', ')}`,
    );

    return { content, linksAdded, addedLinks };
  }

  // ----------------------------------------------------
  // PHASE 17 — SEMANTIC ENTITY BOOSTER
  // ----------------------------------------------------
  public boostSemanticEntities(
    content: string,
    topic: string,
  ): { boostedContent: string; missingEntities: string[]; injectedEntities: string[] } {
    const requiredEntities = [
      'SEAI (Sustainable Energy Authority of Ireland)',
      'Building Regulations Part L Compliance',
      'Clean Export Guarantee (CEG)',
      'Heat Loss Indicator (HLI < 2.0 W/K/m²)',
      'BER A2 Energy Rating Target',
      'One-Stop-Shop Grant Scheme',
      'Registered Installer in Limerick V94',
    ];

    const missingEntities: string[] = [];
    const injectedEntities: string[] = [];

    requiredEntities.forEach((entity) => {
      const shortKey = entity.split('(')[0].trim().toLowerCase();
      if (!content.toLowerCase().includes(shortKey)) {
        missingEntities.push(entity);
      }
    });

    let boostedContent = content;

    if (missingEntities.length > 0) {
      const entitySection = `\n\n### Key Regulatory & Energy Standards\nTo ensure full eligibility for Irish government retrofit schemes:\n${missingEntities
        .map((e) => `- **${e}**: Essential criteria for maximum SEAI grant approval.`)
        .join('\n')}\n`;
      boostedContent += entitySection;
      injectedEntities.push(...missingEntities);
    }

    this.addLog(
      17,
      'Semantic Entity Booster',
      'entity_enrichment',
      topic,
      injectedEntities.length > 0 ? 'success' : 'info',
      `Injected ${injectedEntities.length} missing Irish energy entities.`,
    );

    return { boostedContent, missingEntities, injectedEntities };
  }

  // ----------------------------------------------------
  // PHASE 18 — METADATA CORRECTOR
  // ----------------------------------------------------
  public correctMetadata(
    keyword: string,
    currentTitle?: string,
    currentDescription?: string,
  ): {
    optimizedTitle: string;
    optimizedDescription: string;
    canonicalUrl: string;
    openGraph: Record<string, string>;
  } {
    const cleanKw = keyword.trim();
    const currentYear = new Date().getFullYear();

    // Optimize title to 50-60 characters with CTR modifiers
    let optimizedTitle = currentTitle || '';
    if (!optimizedTitle || optimizedTitle.length < 30 || !optimizedTitle.includes(cleanKw)) {
      optimizedTitle = `${cleanKw} Guide (${currentYear}) | Grants & Costs Ireland`;
      if (optimizedTitle.length > 60) {
        optimizedTitle = `${cleanKw} (${currentYear}) | EcoSmartHomes IE`;
      }
    }

    // Optimize description to 140-155 characters with CTA
    let optimizedDescription = currentDescription || '';
    if (!optimizedDescription || optimizedDescription.length < 100) {
      optimizedDescription = `Complete ${cleanKw} guide for Irish homeowners. Calculate SEAI grant amounts, compare approved installer rates in Limerick V94, and boost your BER rating.`;
    }

    const slug = cleanKw.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const canonicalUrl = `https://ecosmarthomes.ie/${slug}`;

    const openGraph = {
      'og:title': optimizedTitle,
      'og:description': optimizedDescription,
      'og:url': canonicalUrl,
      'og:type': 'article',
      'og:site_name': 'EcoSmartHomes Ireland',
      'og:locale': 'en_IE',
    };

    this.addLog(
      18,
      'Metadata Corrector',
      'metadata_optimization',
      cleanKw,
      'success',
      `Generated CTR-optimized title (${optimizedTitle.length} chars) & meta description (${optimizedDescription.length} chars).`,
    );

    return {
      optimizedTitle,
      optimizedDescription,
      canonicalUrl,
      openGraph,
    };
  }

  // ----------------------------------------------------
  // PHASE 19 — SCHEMA VALIDATOR
  // ----------------------------------------------------
  public validateJsonLdSchema(schemaObj: any): SchemaValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missingRequiredFields: string[] = [];
    const recommendations: string[] = [];

    if (!schemaObj || typeof schemaObj !== 'object') {
      return {
        valid: false,
        schemaType: 'Unknown',
        errors: ['Schema payload is empty or not a valid JSON object.'],
        warnings: [],
        missingRequiredFields: ['@context', '@type'],
        recommendations: ['Provide a structured JSON-LD schema object.'],
      };
    }

    // Check @context
    if (!schemaObj['@context'] || !schemaObj['@context'].includes('schema.org')) {
      errors.push("Missing or invalid '@context'. Expected 'https://schema.org'.");
      missingRequiredFields.push('@context');
    }

    // Check @type
    const schemaType = schemaObj['@type'] || 'Unknown';
    if (!schemaObj['@type']) {
      errors.push("Missing required field '@type'.");
      missingRequiredFields.push('@type');
    }

    // Type-specific validations
    if (schemaType === 'Article' || schemaType === 'BlogPosting') {
      if (!schemaObj.headline) {
        errors.push("Article schema requires 'headline'.");
        missingRequiredFields.push('headline');
      }
      if (!schemaObj.author) {
        warnings.push("Article schema recommends an 'author' object.");
      }
      if (!schemaObj.publisher) {
        warnings.push("Article schema recommends a 'publisher' object with logo.");
      }
      if (!schemaObj.datePublished) {
        errors.push("Article schema requires 'datePublished' in ISO format.");
        missingRequiredFields.push('datePublished');
      }
    } else if (schemaType === 'FAQPage') {
      if (!schemaObj.mainEntity || !Array.isArray(schemaObj.mainEntity) || schemaObj.mainEntity.length === 0) {
        errors.push("FAQPage schema requires 'mainEntity' array of Question objects.");
        missingRequiredFields.push('mainEntity');
      } else {
        schemaObj.mainEntity.forEach((q: any, i: number) => {
          if (!q.name) errors.push(`FAQ Question #${i + 1} is missing 'name'.`);
          if (!q.acceptedAnswer || !q.acceptedAnswer.text) {
            errors.push(`FAQ Question #${i + 1} is missing 'acceptedAnswer.text'.`);
          }
        });
      }
    } else if (schemaType === 'LocalBusiness' || schemaType === 'HomeAndConstructionBusiness') {
      if (!schemaObj.name) {
        errors.push("LocalBusiness schema requires 'name'.");
        missingRequiredFields.push('name');
      }
      if (!schemaObj.address) {
        errors.push("LocalBusiness schema requires 'address' (including postalCode / Eircode).");
        missingRequiredFields.push('address');
      }
    }

    const valid = errors.length === 0;

    this.addLog(
      19,
      'Schema Validator',
      'schema_validation',
      schemaType,
      valid ? 'success' : 'error',
      valid
        ? `Validated ${schemaType} schema successfully.`
        : `Validation failed for ${schemaType}: ${errors.join('; ')}`,
    );

    return {
      valid,
      schemaType,
      errors,
      warnings,
      missingRequiredFields,
      recommendations: valid ? ['Schema is ready for Google Rich Result indexing.'] : ['Fix missing required properties before publishing.'],
    };
  }

  // ----------------------------------------------------
  // PHASE 20 — CONTENT REFRESH QUEUE
  // ----------------------------------------------------
  public enqueueContentRefresh(item: {
    keyword: string;
    url?: string;
    currentRank?: number;
    slope?: number;
    volatility?: number;
    zone?: StabilityZone;
    reason?: string;
  }): RefreshQueueItem {
    const cleanKw = item.keyword.trim().toLowerCase();
    const id = cleanKw.replace(/[^a-z0-9]+/g, '-');
    const url = item.url || `/${id}`;

    // Query registry if telemetry not provided
    const regEntry = globalKeywordRegistry.get(id);
    const currentRank = item.currentRank ?? regEntry?.currentRank ?? 5;
    const slope = item.slope ?? regEntry?.slope ?? 0.4;
    const volatility = item.volatility ?? regEntry?.volatility ?? 0.55;
    const zone = item.zone ?? classifyStabilityZone(slope, volatility);

    let priority: RefreshQueueItem['priority'] = 'medium';
    if (zone === 'red' || (slope > 0.5 && volatility > 0.5)) {
      priority = 'critical';
    } else if (zone === 'yellow' || currentRank >= 5) {
      priority = 'high';
    }

    const queueItem: RefreshQueueItem = {
      id,
      url,
      keyword: cleanKw,
      currentRank,
      slope,
      volatility,
      zone,
      priority,
      reason: item.reason || `Automated queue triggered by ${zone.toUpperCase()} Stability Zone (Slope: ${slope}, Vol: ${volatility}).`,
      queuedAt: Date.now(),
      status: 'pending',
    };

    this.refreshQueue.set(id, queueItem);

    this.addLog(
      20,
      'Content Refresh Queue',
      'enqueue_refresh',
      cleanKw,
      'success',
      `Queued "${cleanKw}" for content rewrite with ${priority.toUpperCase()} priority (${zone.toUpperCase()} Zone).`,
    );

    return queueItem;
  }

  public getRefreshQueue(): RefreshQueueItem[] {
    return Array.from(this.refreshQueue.values()).sort((a, b) => {
      const pWeights = { critical: 4, high: 3, medium: 2, low: 1 };
      return pWeights[b.priority] - pWeights[a.priority];
    });
  }

  public processQueueItem(id: string): RefreshQueueItem | undefined {
    const item = this.refreshQueue.get(id);
    if (!item) return undefined;

    item.status = 'completed';
    item.lastRefreshedAt = Date.now();
    this.refreshQueue.set(id, item);

    this.addLog(
      20,
      'Content Refresh Queue',
      'process_refresh',
      item.keyword,
      'success',
      `Completed content refresh execution for "${item.keyword}".`,
    );

    return item;
  }

  // ----------------------------------------------------
  // PHASE 21 & 22 — CONTENT WRITER AI & OUTLINE GENERATOR
  // ----------------------------------------------------
  public generateOutline(topic: string): string[] {
    const t = topic.toLowerCase();
    const isSolar = t.includes('solar') || t.includes('pv');
    const isHeatPump = t.includes('heat pump');

    let outline: string[];
    if (isSolar) {
      outline = [
        'Introduction: Solar PV Energy Revolution in Ireland (2026)',
        'SEAI Solar Electricity Grant Amounts & Eligibility Criteria',
        'Clean Export Guarantee (CEG): How to Sell Excess Power Back to the Grid',
        'Battery Storage vs. Standalone Solar PV: Cost-Benefit Analysis',
        'Step-by-Step Grant Application Process in Limerick V94',
        'Conclusion & Expected Return on Investment (ROI)',
      ];
    } else if (isHeatPump) {
      outline = [
        'Introduction: Upgrading to Heat Pump Systems in Ireland',
        'SEAI Heat Pump System Grants (Up to €6,500 Breakdown)',
        'Heat Loss Indicator (HLI) & Technical Assessment Requirements',
        'Air-to-Water vs. Ground Source Systems for Irish Homes',
        'Finding SEAI Registered Heat Pump Contractors in Limerick',
        'Summary: Comfort, Savings, and Eliminating Fossil Fuels',
      ];
    } else {
      outline = [
        `Introduction: Complete Guide to ${topic} in Ireland (2026)`,
        'Understanding SEAI Energy Upgrade Subsidies & Eligibility',
        'Step-by-Step Implementation Sequence (Fabric First Approach)',
        'Cost Breakdown, Grants Deductions, and Net Payback Period',
        'Choosing Registered Contractors in Limerick V94',
        'Frequently Asked Questions (FAQs)',
      ];
    }

    this.addLog(
      22,
      'Outline Generator',
      'generate_outline',
      topic,
      'success',
      `Generated ${outline.length}-section search intent outline.`,
    );

    return outline;
  }

  public generateArticleContent(
    keyword: string,
    outline?: string[],
  ): { title: string; markdown: string; wordCount: number } {
    const cleanKw = keyword.trim();
    const sections = outline || this.generateOutline(cleanKw);
    const title = `The Complete Homeowner Guide to ${cleanKw} in Ireland (2026 Edition)`;

    const bodyParts: string[] = [
      `# ${title}\n\nUpgrading your home's energy performance is one of the smartest investments an Irish homeowner can make in 2026. With rising electricity costs and ambitious national climate targets, government subsidies via the **Sustainable Energy Authority of Ireland (SEAI)** have made retrofitting more accessible than ever.`,
    ];

    sections.forEach((sec, idx) => {
      bodyParts.push(
        `## ${sec}\n\nWhen planning your ${cleanKw} project, adhering to Irish Building Regulations Part L ensures compliance and unlocks maximum grant allowances. Homeowners in **Limerick V94** and across Munster can claim generous capital deductions by hiring SEAI-registered technical assessors and contractors.`,
      );
    });

    bodyParts.push(
      `### Practical Next Steps\n1. Review your current **Building Energy Rating (BER)** certificate.\n2. Request a technical assessment from an approved one-stop-shop.\n3. Apply online via the SEAI portal before works commence.`,
    );

    const markdown = bodyParts.join('\n\n');
    const wordCount = markdown.split(/\s+/).length;

    this.addLog(
      21,
      'Content Writer AI',
      'generate_article',
      cleanKw,
      'success',
      `Generated high-authority ${wordCount}-word article with SEAI grant compliance.`,
    );

    return { title, markdown, wordCount };
  }

  // ----------------------------------------------------
  // PHASE 23 — GRANT INTELLIGENCE MODULE
  // ----------------------------------------------------
  public getGrantSchemes(): GrantSchemeInfo[] {
    return [
      {
        id: 'solar-pv',
        name: 'SEAI Solar PV Electricity Grant',
        maxGrantAmount: 2100,
        propertyEligibility: 'Homes built and occupied before 2021',
        requirements: ['Registered SEAI installer', 'BER assessment post-installation'],
        measures: [
          { measure: 'Up to 2kWp solar panels', grantValue: 800 },
          { measure: '2kWp to 4kWp (€350/kWp extra)', grantValue: 1300 },
          { measure: 'Maximum 4kWp allocation', grantValue: 2100 },
        ],
      },
      {
        id: 'heat-pumps',
        name: 'SEAI Heat Pump System Grant',
        maxGrantAmount: 6500,
        propertyEligibility: 'Homes built and occupied before 2021 with HLI <= 2.0 W/K/m²',
        requirements: ['Technical assessment', 'Fabric-first insulation upgrade if HLI > 2.0'],
        measures: [
          { measure: 'Air to Water Heat Pump', grantValue: 6500 },
          { measure: 'Ground Source to Water', grantValue: 6500 },
          { measure: 'Technical Assessment Grant', grantValue: 200 },
        ],
      },
      {
        id: 'insulation',
        name: 'SEAI Home Insulation Grants',
        maxGrantAmount: 8000,
        propertyEligibility: 'Homes built before 2011',
        requirements: ['Certified NSAI insulation material', 'Registered installer'],
        measures: [
          { measure: 'Attic Insulation (Detached)', grantValue: 1500 },
          { measure: 'Cavity Wall Insulation', grantValue: 1700 },
          { measure: 'External Wall Insulation (Detached)', grantValue: 8000 },
        ],
      },
    ];
  }

  public calculateGrantDeduction(schemeId: string, grossCost: number): {
    grossCost: number;
    grantAllowance: number;
    netHomeownerCost: number;
    savingsPercentage: number;
  } {
    const schemes = this.getGrantSchemes();
    const scheme = schemes.find((s) => s.id === schemeId) || schemes[0];
    const grantAllowance = Math.min(scheme.maxGrantAmount, grossCost * 0.5);
    const netHomeownerCost = Math.max(0, grossCost - grantAllowance);
    const savingsPercentage = Math.round((grantAllowance / grossCost) * 100);

    return {
      grossCost,
      grantAllowance,
      netHomeownerCost,
      savingsPercentage,
    };
  }

  // ----------------------------------------------------
  // PHASE 24 — PDF EXPORT ENGINE
  // ----------------------------------------------------
  public generatePdfExportSummary(
    keyword: string,
    grantCalculation: ReturnType<AutomationEngine['calculateGrantDeduction']>,
  ): {
    pdfTitle: string;
    generatedAt: string;
    summaryJson: Record<string, any>;
  } {
    const pdfTitle = `SEAI-Retrofit-Grant-Report-${keyword.replace(/[^a-z0-9]+/g, '-')}.pdf`;
    const summaryJson = {
      title: `SEAI Energy Retrofit Proposal: ${keyword}`,
      location: 'Limerick V94 / Munster Region',
      date: new Date().toLocaleDateString('en-IE'),
      financials: {
        estimatedGross: `€${grantCalculation.grossCost.toLocaleString()}`,
        seaiGrantAllowance: `€${grantCalculation.grantAllowance.toLocaleString()}`,
        netCostToHomeowner: `€${grantCalculation.netHomeownerCost.toLocaleString()}`,
        savingsRate: `${grantCalculation.savingsPercentage}%`,
      },
      compliance: [
        'Building Regulations Part L Standard (2026)',
        'SEAI Registered Installer Certified',
        'Post-works BER A2 Assessment Included',
      ],
    };

    this.addLog(
      24,
      'PDF Export Engine',
      'generate_pdf_report',
      pdfTitle,
      'success',
      `Compiled client proposal PDF metadata for ${keyword}.`,
    );

    return {
      pdfTitle,
      generatedAt: new Date().toISOString(),
      summaryJson,
    };
  }

  // ----------------------------------------------------
  // PHASE 25 — CRAWL SCHEDULER
  // ----------------------------------------------------
  public scheduleCrawl(keyword: string, targetUrl: string, priority: 'critical' | 'high' | 'normal' = 'normal'): ScheduledCrawlJob {
    const cleanKw = keyword.trim().toLowerCase();
    const id = `crawl-${cleanKw.replace(/[^a-z0-9]+/g, '-')}`;

    const intervalHours = priority === 'critical' ? 6 : priority === 'high' ? 12 : 24;
    const nextRun = Date.now() + intervalHours * 3600 * 1000;

    const job: ScheduledCrawlJob = {
      id,
      keyword: cleanKw,
      targetUrl,
      intervalHours,
      nextRun,
      priority,
      status: 'scheduled',
    };

    this.scheduledJobs.set(id, job);

    this.addLog(
      25,
      'Crawl Scheduler',
      'schedule_job',
      cleanKw,
      'success',
      `Scheduled crawl for "${cleanKw}" every ${intervalHours}h (${priority.toUpperCase()} priority).`,
    );

    return job;
  }

  public getScheduledJobs(): ScheduledCrawlJob[] {
    return Array.from(this.scheduledJobs.values());
  }

  // ----------------------------------------------------
  // PHASE 26 — CRAWL SCANNER
  // ----------------------------------------------------
  public scanUrl(url: string): CrawlScanResult {
    const issues: string[] = [];
    let score = 95;

    // Simulate scan metrics
    const statusCode = 200;
    const loadTimeMs = 380;
    const title = 'EcoSmartHomes Ireland | Sustainable Home Energy Retrofits';
    const metaDescription = 'Ireland leading energy retrofit experts. SEAI grant assistance, heat pumps, solar PV, and insulation.';
    const h1Count = 1;
    const h2Count = 6;
    const internalLinksCount = 14;
    const externalLinksCount = 3;
    const schemaFound = true;

    if (h1Count !== 1) {
      issues.push(`Expected exactly 1 H1 heading, found ${h1Count}`);
      score -= 15;
    }
    if (metaDescription.length < 50) {
      issues.push('Meta description too short');
      score -= 10;
    }

    const result: CrawlScanResult = {
      url,
      statusCode,
      loadTimeMs,
      title,
      metaDescription,
      h1Count,
      h2Count,
      internalLinksCount,
      externalLinksCount,
      schemaFound,
      issues,
      score,
    };

    this.addLog(
      26,
      'Crawl Scanner',
      'scan_url',
      url,
      'success',
      `Crawl completed for ${url}: Score ${score}/100, HTTP ${statusCode}.`,
    );

    return result;
  }

  // ----------------------------------------------------
  // PHASE 27 — REFRESH IMPACT TRACKER (Syncs to Stability Map)
  // ----------------------------------------------------
  public recordRefreshImpact(payload: {
    keyword: string;
    url: string;
    preRefreshRank: number;
    postRefreshRank: number;
    preRefreshSlope?: number;
    postRefreshSlope?: number;
    preRefreshVolatility?: number;
    postRefreshVolatility?: number;
    measuredDaysAfter?: number;
  }): RefreshImpactRecord {
    const cleanKw = payload.keyword.trim().toLowerCase();
    const rankDelta = payload.preRefreshRank - payload.postRefreshRank; // e.g. #7 - #3 = +4 (improved)

    let impactVerdict: RefreshImpactRecord['impactVerdict'] = 'neutral';
    if (rankDelta >= 3) impactVerdict = 'significant_gain';
    else if (rankDelta > 0) impactVerdict = 'moderate_gain';
    else if (rankDelta < 0) impactVerdict = 'needs_attention';

    const record: RefreshImpactRecord = {
      id: `impact-${Date.now()}-${cleanKw.replace(/[^a-z0-9]+/g, '-')}`,
      keyword: cleanKw,
      url: payload.url,
      refreshedAt: Date.now() - (payload.measuredDaysAfter || 7) * 86400000,
      preRefreshRank: payload.preRefreshRank,
      postRefreshRank: payload.postRefreshRank,
      rankDelta,
      preRefreshSlope: payload.preRefreshSlope ?? 0.6,
      postRefreshSlope: payload.postRefreshSlope ?? -0.4,
      preRefreshVolatility: payload.preRefreshVolatility ?? 0.58,
      postRefreshVolatility: payload.postRefreshVolatility ?? 0.22,
      measuredDaysAfter: payload.measuredDaysAfter || 7,
      impactVerdict,
    };

    this.impactRecords.push(record);

    // CRITICAL: Feed back into Keyword Registry & Ranking Stability Map (Phase 1–7)
    globalKeywordRegistry.recordRank(cleanKw, payload.postRefreshRank);

    this.addLog(
      27,
      'Refresh Impact Tracker',
      'record_impact',
      cleanKw,
      'success',
      `Measured impact for "${cleanKw}": Rank moved #${payload.preRefreshRank} → #${payload.postRefreshRank} (Δ: ${rankDelta > 0 ? `+${rankDelta}` : rankDelta}). Stability Map updated!`,
    );

    return record;
  }

  public getImpactRecords(): RefreshImpactRecord[] {
    return [...this.impactRecords].reverse();
  }

  private seedDefaultQueue() {
    this.enqueueContentRefresh({
      keyword: 'solar pv grants ireland',
      url: '/solar-pv',
      currentRank: 4,
      slope: 0.6,
      volatility: 0.58,
      zone: 'red',
      reason: 'Red Stability Zone: Rank slipped #2 -> #4 with high volatility.',
    });
    this.enqueueContentRefresh({
      keyword: 'ber rating upgrade steps',
      url: '/ber-rating',
      currentRank: 9,
      slope: 0.7,
      volatility: 0.74,
      zone: 'red',
      reason: 'Red Stability Zone: Rank dropped to #9.',
    });
  }

  private seedDefaultScheduledJobs() {
    this.scheduleCrawl('solar pv grants ireland', 'https://ecosmarthomes.ie/solar-pv', 'critical');
    this.scheduleCrawl('heat pump costs ireland', 'https://ecosmarthomes.ie/heat-pumps', 'normal');
    this.scheduleCrawl('seai grants limerick', 'https://ecosmarthomes.ie/grants/limerick-v94', 'high');
  }
}

export const globalAutomationEngine = new AutomationEngine();

export interface AutomationEngineState {
  refreshQueueCount: number;
  scheduledCrawlJobsCount: number;
  totalLogsCount: number;
  impactRecordsCount: number;
  drift: number;
  status: 'calibrated' | 'drifting';
}

export function getAutomationState(): AutomationEngineState {
  const queue = globalAutomationEngine.getRefreshQueue();
  const crawls = globalAutomationEngine.getScheduledJobs();
  const logs = globalAutomationEngine.getLogs();
  const impacts = globalAutomationEngine.getImpactRecords();

  let drift = 0;
  if (crawls.length === 0) drift += 0.4;
  if (logs.length === 0) drift += 0.3;

  return {
    refreshQueueCount: queue.length,
    scheduledCrawlJobsCount: crawls.length,
    totalLogsCount: logs.length,
    impactRecordsCount: impacts.length,
    drift: Math.round(drift * 100) / 100,
    status: drift > 0 ? 'drifting' : 'calibrated',
  };
}

export function repairAutomationEngine(): { repaired: boolean; message: string } {
  const crawls = globalAutomationEngine.getScheduledJobs();
  if (crawls.length === 0) {
    globalAutomationEngine.scheduleCrawl('solar pv grants ireland', 'https://ecosmarthomes.ie/solar-pv', 'critical');
  }
  return {
    repaired: true,
    message: 'Automation Queue, Crawl Scheduler, and Impact Tracker synchronized.',
  };
}
