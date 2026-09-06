import { describe, it, expect, beforeEach } from 'vitest';
import {
  detectSERPFeatures,
  classifySearchIntent,
  computeCompetitorDiff,
  predictSERPVolatility,
  evaluateSERPAlerts,
  SERPIntelligenceEngine,
  SERPCompetitor,
  getSERPState,
  repairSERPEngine,
  globalSERPIntelligenceEngine,
} from '../serpIntelligence';

describe('Phase Group 2 — SERP Intelligence Engine (Phases 8–15)', () => {
  let engine: SERPIntelligenceEngine;

  const mockCompetitors: SERPCompetitor[] = [
    {
      position: 1,
      title: 'SEAI Solar Electricity Grant (Up to €2,100) | SEAI Ireland',
      url: 'https://www.seai.ie/grants/home-energy-grants/solar-electricity-grant/',
      meta_description:
        'Discover SEAI solar PV grants for Irish domestic properties.',
      domain_authority: 88,
      monthly_traffic: 125000,
      content_type: 'Government Portal',
      themes: ['Solar Electricity Grant', 'Clean Export Guarantee'],
      strengths: ['Ultimate domain authority', 'Clear official grant rates'],
      weaknesses: ['Bureaucratic jargon', 'No live calculators'],
      ranking_gaps: ['Lacks battery vs standalone payback comparisons'],
    },
    {
      position: 2,
      title: 'Solar Panels Ireland: Costs & Grants 2026 | Citizens Information',
      url: 'https://www.citizensinformation.ie/en/housing/solar_panels.html',
      meta_description:
        'Objective homeowner advice on energy upgrades in Ireland.',
      domain_authority: 82,
      monthly_traffic: 98000,
      content_type: 'Civic Advice Guide',
      themes: ['Homeowner Rights', 'Step-by-Step Sequence'],
      strengths: ['Highly structured content'],
      weaknesses: ['No real-time cost estimators'],
      ranking_gaps: ['No specific BER upgrade letter calculations'],
    },
    {
      position: 3,
      title: 'Activ8 Solar Energies | Ireland Premier Solar PV Installer',
      url: 'https://www.activ8energies.com/solar-pv-grants',
      meta_description:
        'SEAI approved solar PV installations in Limerick & Munster.',
      domain_authority: 48,
      monthly_traffic: 34000,
      content_type: 'Commercial Installer',
      themes: ['Triple Action Solar', 'Commercial Retrofit'],
      strengths: ['Strong customer reviews'],
      weaknesses: ['High package prices'],
      ranking_gaps: ['Requires telephone consultation before pricing'],
    },
  ];

  beforeEach(() => {
    engine = new SERPIntelligenceEngine();
  });

  // ---------------------------------------------
  // Phase 8: SERP Snapshot Engine
  // ---------------------------------------------
  describe('Phase 8 — SERP Snapshot Engine', () => {
    it('compiles full organic snapshot and archives in history', () => {
      const snapshot = engine.compileSnapshot({
        keyword: 'solar pv grants ireland',
        top_results: mockCompetitors,
        opportunities: ['Provide interactive grant calculator'],
      });

      expect(snapshot.id).toBeDefined();
      expect(snapshot.keyword).toBe('solar pv grants ireland');
      expect(snapshot.top_results.length).toBe(3);
      expect(snapshot.features.length).toBeGreaterThan(0);
      expect(snapshot.intent).toBe('Informational & Commercial');
      expect(snapshot.diff).toBeDefined();
      expect(snapshot.volatilityIndex).toBeDefined();

      const latest = engine.getLatestSnapshot('solar pv grants ireland');
      expect(latest?.id).toBe(snapshot.id);
    });
  });

  // ---------------------------------------------
  // Phase 9: Competitor Diff Engine
  // ---------------------------------------------
  describe('Phase 9 — Competitor Diff Engine', () => {
    it('computes rank deltas, new entrants, and position drops between snapshots', () => {
      const firstSnapshot = engine.compileSnapshot({
        keyword: 'heat pump costs limerick',
        top_results: [
          { ...mockCompetitors[0], position: 1, url: 'https://seai.ie/hp' },
          {
            ...mockCompetitors[1],
            position: 2,
            url: 'https://citizensinformation.ie/hp',
          },
          { ...mockCompetitors[2], position: 3, url: 'https://activ8.ie/hp' },
        ],
      });

      // Second pass: Activ8 jumped to #1, SEAI dropped to #2, Citizens dropped off, New entrant Energlaze at #3
      const secondCompetitors: SERPCompetitor[] = [
        { ...mockCompetitors[2], position: 1, url: 'https://activ8.ie/hp' },
        { ...mockCompetitors[0], position: 2, url: 'https://seai.ie/hp' },
        {
          position: 3,
          title: 'Energlaze Heat Pumps',
          url: 'https://energlaze.ie/heat-pumps',
          meta_description: 'Heat pump upgrades Ireland',
          themes: ['Heat Pumps'],
          strengths: ['Good pricing'],
          weaknesses: ['Small team'],
        },
      ];

      const diff = computeCompetitorDiff(
        firstSnapshot,
        secondCompetitors,
        'heat pump costs limerick',
      );

      expect(diff.climbedCount).toBe(1); // Activ8 jumped from #3 to #1 (+2)
      expect(diff.fallenCount).toBe(1); // SEAI dropped from #1 to #2 (-1)
      expect(diff.newEntrantsCount).toBe(1); // Energlaze is new
      expect(diff.droppedCount).toBe(1); // Citizens dropped out
      expect(diff.volatilityShift).toBeGreaterThan(0.2);

      const activ8Diff = diff.diffs.find((d) => d.domain.includes('activ8'));
      expect(activ8Diff?.positionChange).toBe(2);
      expect(activ8Diff?.status).toBe('climbed');
    });
  });

  // ---------------------------------------------
  // Phase 10: SERP Feature Detector
  // ---------------------------------------------
  describe('Phase 10 — SERP Feature Detector', () => {
    it('detects Featured Snippet, People Also Ask, Local Pack, and Calculator widget', () => {
      const features = detectSERPFeatures(
        'solar pv grants Limerick V94 cost',
        mockCompetitors,
      );
      const featureTypes = features.map((f) => f.type);

      expect(featureTypes).toContain('featured_snippet');
      expect(featureTypes).toContain('people_also_ask');
      expect(featureTypes).toContain('local_pack');
      expect(featureTypes).toContain('calculator_widget');
      expect(featureTypes).toContain('sitelinks');
    });
  });

  // ---------------------------------------------
  // Phase 11: Intent Classifier
  // ---------------------------------------------
  describe('Phase 11 — Intent Classifier', () => {
    it('classifies Commercial & Local intent for regional cost queries', () => {
      expect(classifySearchIntent('heat pump cost Limerick V94')).toBe(
        'Commercial & Local',
      );
    });

    it('classifies Transactional & Local intent for contractor booking queries', () => {
      expect(classifySearchIntent('install solar panels Dublin quote')).toBe(
        'Transactional & Local',
      );
    });

    it('classifies Informational & Commercial intent for general grant queries', () => {
      expect(classifySearchIntent('solar pv grants ireland 2026')).toBe(
        'Informational & Commercial',
      );
    });

    it('classifies Navigational intent for portal search queries', () => {
      expect(classifySearchIntent('seai.ie grant application login')).toBe(
        'Navigational',
      );
    });

    it('classifies Informational intent for basic guide queries', () => {
      expect(classifySearchIntent('what is a heat loss indicator')).toBe(
        'Informational',
      );
    });
  });

  // ---------------------------------------------
  // Phase 12: Content Gap Analyzer
  // ---------------------------------------------
  describe('Phase 12 — Content Gap Analyzer', () => {
    it('structures gap keywords with difficulty and opportunity scoring', () => {
      const snapshot = engine.compileSnapshot({
        keyword: 'ber rating upgrade steps',
        top_results: mockCompetitors,
        ranking_gap_keywords: [
          {
            keyword: 'ber rating g to a upgrade cost ireland',
            competitor: 'SEAI',
            competitorRank: 1,
            volume: 3400,
            difficulty: 24,
            opportunityScore: 94,
            suggestedAction: 'Create dedicated cost breakdown table.',
          },
        ],
      });

      expect(snapshot.ranking_gap_keywords.length).toBe(1);
      expect(snapshot.ranking_gap_keywords[0].opportunityScore).toBe(94);
      expect(snapshot.ranking_gap_keywords[0].suggestedAction).toContain(
        'cost breakdown',
      );
    });
  });

  // ---------------------------------------------
  // Phase 13: SERP Volatility Predictor
  // ---------------------------------------------
  describe('Phase 13 — SERP Volatility Predictor', () => {
    it('predicts turbulence categories accurately', () => {
      const lowDiff = {
        keyword: 'test',
        timestamp: Date.now(),
        totalChanges: 0,
        climbedCount: 0,
        fallenCount: 0,
        newEntrantsCount: 0,
        droppedCount: 0,
        diffs: [],
        volatilityShift: 0.15,
      };
      expect(predictSERPVolatility('test', lowDiff).category).toBe('stable');

      const medDiff = { ...lowDiff, volatilityShift: 0.45 };
      expect(predictSERPVolatility('test', medDiff).category).toBe(
        'moderate_shift',
      );

      const highDiff = { ...lowDiff, volatilityShift: 0.85 };
      expect(predictSERPVolatility('test', highDiff).category).toBe(
        'high_turbulence',
      );
    });
  });

  // ---------------------------------------------
  // Phase 14: SERP Change Alerts Engine
  // ---------------------------------------------
  describe('Phase 14 — SERP Change Alerts Engine', () => {
    it('generates alert when competitor surges into Top 3', () => {
      const diff = {
        keyword: 'solar grants',
        timestamp: Date.now(),
        totalChanges: 1,
        climbedCount: 1,
        fallenCount: 0,
        newEntrantsCount: 1,
        droppedCount: 0,
        diffs: [
          {
            domain: 'pvgen.ie',
            title: 'PV Gen',
            url: 'https://pvgen.ie',
            newPosition: 2,
            positionChange: 4,
            status: 'climbed' as const,
          },
        ],
        volatilityShift: 0.35,
      };

      const alerts = evaluateSERPAlerts('solar grants', diff, [
        {
          type: 'featured_snippet',
          title: 'Snippet',
          description: '',
          relevanceScore: 90,
        },
      ]);

      expect(alerts.some((a) => a.type === 'COMPETITOR_OVERTAKE')).toBe(true);
      expect(
        alerts.some((a) => a.type === 'FEATURED_SNIPPET_OPPORTUNITY'),
      ).toBe(true);
    });

    it('generates all 5 alert types based on severe shifts', () => {
      const complexDiff = {
        keyword: 'heat pump grants',
        timestamp: Date.now(),
        totalChanges: 4,
        climbedCount: 1,
        fallenCount: 1,
        newEntrantsCount: 2,
        droppedCount: 1,
        diffs: [
          {
            domain: 'pvgen.ie',
            title: 'PV Gen Top 3 Surge',
            url: 'https://pvgen.ie',
            newPosition: 2,
            positionChange: 3,
            status: 'climbed' as const,
          },
          {
            domain: 'newheat.ie',
            title: 'New Page 1 Player',
            url: 'https://newheat.ie',
            newPosition: 6,
            positionChange: 0,
            status: 'new_entrant' as const,
          },
          {
            domain: 'oldinstaller.ie',
            title: 'Old Installer Dropped',
            url: 'https://oldinstaller.ie',
            oldPosition: 4,
            newPosition: 11,
            positionChange: -7,
            status: 'dropped_out' as const,
          },
        ],
        volatilityShift: 0.65,
      };

      const alerts = evaluateSERPAlerts('heat pump grants', complexDiff, [
        {
          type: 'featured_snippet',
          title: 'Answer Box',
          description: '',
          relevanceScore: 95,
        },
      ]);

      const alertTypes = alerts.map((a) => a.type);
      expect(alertTypes).toContain('COMPETITOR_OVERTAKE');
      expect(alertTypes).toContain('NEW_PAGE1_ENTRANT');
      expect(alertTypes).toContain('CRITICAL_DROP');
      expect(alertTypes).toContain('VOLATILITY_SPIKE');
      expect(alertTypes).toContain('FEATURED_SNIPPET_OPPORTUNITY');
    });
  });

  // ---------------------------------------------
  // Comprehensive Edge Cases (Phases 8–14)
  // ---------------------------------------------
  describe('Phases 8–14 — Comprehensive Edge Cases', () => {
    it('maintains rolling window of snapshots and supports retrieval', () => {
      const kw = 'insulation grants cork';
      for (let i = 0; i < 25; i++) {
        engine.compileSnapshot({
          keyword: kw,
          top_results: mockCompetitors,
        });
      }

      const all = engine.getAllSnapshots(kw);
      expect(all.length).toBe(20); // capped at 20 snapshots

      const latest = engine.getLatestSnapshot(kw);
      expect(latest?.keyword).toBe(kw);
    });

    it('handles competitor diff baseline generation without crashing', () => {
      // First run with no previous snapshot and empty competitors
      const diffEmpty = computeCompetitorDiff(null, [], 'solar grants');
      expect(diffEmpty.totalChanges).toBe(0);
      expect(diffEmpty.volatilityShift).toBe(0);

      // Diff with malformed URLs falls back to raw strings
      const malformedCompetitors: SERPCompetitor[] = [
        {
          position: 1,
          title: 'Direct Brand Title',
          url: 'not-a-valid-url-format',
          meta_description: 'Test description',
          themes: [],
          strengths: [],
          weaknesses: [],
        },
      ];
      const diffMalformed = computeCompetitorDiff(
        null,
        malformedCompetitors,
        'solar grants',
      );
      expect(diffMalformed.diffs.length).toBeGreaterThan(0);
      expect(diffMalformed.diffs[0].domain).toBe('not-a-valid-url-format');
    });

    it('detects video pack and sitelinks features correctly', () => {
      const features = detectSERPFeatures(
        'how to install solar pv heat pump guide',
        mockCompetitors,
      );
      const types = features.map((f) => f.type);
      expect(types).toContain('video_pack');
      expect(types).toContain('sitelinks');
    });

    it('inspects SERP state and executes self-healing calibration repair', () => {
      const repair = repairSERPEngine();
      expect(repair.repaired).toBe(true);

      const state = getSERPState();
      expect(state).toHaveProperty('cachedSnapshotsCount');
      expect(state.cachedSnapshotsCount).toBeGreaterThan(0);
      expect(state.drift).toBe(0);
      expect(state.status).toBe('calibrated');
    });
  });
});
