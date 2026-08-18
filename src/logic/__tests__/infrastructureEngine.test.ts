import { describe, it, expect, beforeEach } from 'vitest';
import {
  UnifiedKVStore,
  DataNormalizationLayer,
  CentralErrorTelemetry,
  generateDeploymentHealthReport,
  applyEdgeSecurityHeaders,
} from '../infrastructureEngine';

describe('Phase Group 6 — Infrastructure & Data Layer (Phases 43–49)', () => {
  // ---------------------------------------------
  // Phase 43: KV Namespace Binding
  // ---------------------------------------------
  describe('Phase 43 — KV Namespace Binding', () => {
    let kv: UnifiedKVStore;

    beforeEach(() => {
      kv = new UnifiedKVStore('TEST_NAMESPACE');
    });

    it('stores and retrieves JSON objects by key', async () => {
      await kv.put('snapshot_solar_pv', { keyword: 'solar pv', rank: 2 });
      const val = await kv.get('snapshot_solar_pv');
      expect(val).toEqual({ keyword: 'solar pv', rank: 2 });
    });

    it('lists keys with optional prefix filtering', async () => {
      await kv.put('serp:solar', { rank: 1 });
      await kv.put('serp:heat-pump', { rank: 3 });
      await kv.put('config:main', { active: true });

      const serpKeys = await kv.list('serp:');
      expect(serpKeys).toHaveLength(2);
      expect(serpKeys).toContain('serp:solar');
      expect(serpKeys).toContain('serp:heat-pump');
    });

    it('deletes keys properly', async () => {
      await kv.put('temp_key', 'temporary');
      expect(await kv.get('temp_key')).toBe('temporary');

      await kv.delete('temp_key');
      expect(await kv.get('temp_key')).toBeNull();
    });
  });

  // ---------------------------------------------
  // Phase 44: Worker Routing & Edge Security
  // ---------------------------------------------
  describe('Phase 44 — Worker Routing & Edge Security', () => {
    it('applies robust HTTP security headers to response', () => {
      const headers = applyEdgeSecurityHeaders({});
      expect(headers['X-Content-Type-Options']).toBe('nosniff');
      expect(headers['X-Frame-Options']).toBe('DENY');
      expect(headers['Strict-Transport-Security']).toContain('max-age=31536000');
    });
  });

  // ---------------------------------------------
  // Phase 46: Data Normalization Layer
  // ---------------------------------------------
  describe('Phase 46 — Data Normalization Layer', () => {
    it('normalizes URLs by stripping tracking query params and trailing slashes', () => {
      const dirtyUrl = 'http://ecosmarthomes.ie/heat-pumps/?utm_source=google&utm_medium=cpc';
      const clean = DataNormalizationLayer.normalizeUrl(dirtyUrl);

      expect(clean).toBe('https://ecosmarthomes.ie/heat-pumps');
    });

    it('sanitizes keyword queries into clean strings and deterministic slug IDs', () => {
      const dirtyKw = '  Solar PV Grants Ireland (2026!!)  ';
      const { cleanKeyword, id } = DataNormalizationLayer.normalizeKeyword(dirtyKw);

      expect(cleanKeyword).toBe('solar pv grants ireland 2026');
      expect(id).toBe('solar-pv-grants-ireland-2026');
    });

    it('clamps and bounds numerical SEO metrics', () => {
      const sanitized = DataNormalizationLayer.sanitizeMetrics({
        rank: 150, // should clamp to 100
        slope: -0.849281, // should round
        volatility: 1.8, // should clamp to 1.0
        healthScore: 120, // should clamp to 100
      });

      expect(sanitized.rank).toBe(100);
      expect(sanitized.slope).toBe(-0.849);
      expect(sanitized.volatility).toBe(1.0);
      expect(sanitized.healthScore).toBe(100);
    });
  });

  // ---------------------------------------------
  // Phase 47: Error Logging & Telemetry Bridge
  // ---------------------------------------------
  describe('Phase 47 — Central Error Telemetry', () => {
    beforeEach(() => {
      CentralErrorTelemetry.clear();
    });

    it('records and returns system error logs with contextual metadata', () => {
      CentralErrorTelemetry.recordError('error', 'SERP_CRAWLER', 'Failed to fetch upstream SERP HTML', {
        keyword: 'solar pv',
        statusCode: 503,
      });

      const logs = CentralErrorTelemetry.getLogs();
      expect(logs.length).toBe(1);
      expect(logs[0].source).toBe('SERP_CRAWLER');
      expect(logs[0].level).toBe('error');
      expect(logs[0].context?.keyword).toBe('solar pv');
    });
  });

  // ---------------------------------------------
  // Phase 48: Deployment Sync & Health Monitor
  // ---------------------------------------------
  describe('Phase 48 — Deployment Health Monitor', () => {
    it('generates deployment health report with active components', () => {
      const health = generateDeploymentHealthReport();
      expect(health.status).toBe('healthy');
      expect(health.components.keywordIntelligence).toBe(true);
      expect(health.components.serpIntelligence).toBe(true);
      expect(health.components.automationEngine).toBe(true);
      expect(health.components.predictiveEngine).toBe(true);
    });
  });

  // ---------------------------------------------
  // Phase 49: Regression Test Suite
  // ---------------------------------------------
  describe('Phase 49 — Regression Fault Injection', () => {
    it('handles empty or malformed inputs without throwing unhandled exceptions', () => {
      const emptyUrl = DataNormalizationLayer.normalizeUrl('');
      expect(emptyUrl).toBe('https://ecosmarthomes.ie');

      const nullKw = DataNormalizationLayer.normalizeKeyword(null as any);
      expect(nullKw.cleanKeyword).toBe('unknown');

      const emptyMetrics = DataNormalizationLayer.sanitizeMetrics({});
      expect(emptyMetrics.rank).toBe(10);
      expect(emptyMetrics.volatility).toBe(0.3);
    });
  });
});
