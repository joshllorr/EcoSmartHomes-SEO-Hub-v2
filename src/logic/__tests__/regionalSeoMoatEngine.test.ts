/**
 * src/logic/__tests__/regionalSeoMoatEngine.test.ts
 *
 * Unit and integration tests for Programmatic Regional SEO Moat Engine
 */

import { describe, it, expect } from 'vitest';
import {
  IRISH_COUNTIES_DATA,
  getCountyBySlug,
  getCountiesByProvince,
  searchCountiesByEircodeOrName,
} from '../../data/irishCountiesData';
import {
  RegionalSeoMoatEngine,
  globalRegionalSeoMoatEngine,
} from '../regionalSeoMoatEngine';

describe('Programmatic Regional SEO Moat Engine', () => {
  const engine = new RegionalSeoMoatEngine();

  // 1. Data Integrity: All 26 Republic of Ireland Counties
  describe('26 Irish Counties Dataset Integrity', () => {
    it('contains exactly 26 counties in the Republic of Ireland', () => {
      expect(IRISH_COUNTIES_DATA.length).toBe(26);
    });

    it('covers all 4 provinces with the correct county breakdown', () => {
      const munster = getCountiesByProvince('Munster');
      const leinster = getCountiesByProvince('Leinster');
      const connacht = getCountiesByProvince('Connacht');
      const ulster = getCountiesByProvince('Ulster');

      expect(munster.length).toBe(6); // Clare, Cork, Kerry, Limerick, Tipperary, Waterford
      expect(leinster.length).toBe(12); // Carlow, Dublin, Kildare, Kilkenny, Laois, Longford, Louth, Meath, Offaly, Westmeath, Wexford, Wicklow
      expect(connacht.length).toBe(5); // Galway, Leitrim, Mayo, Roscommon, Sligo
      expect(ulster.length).toBe(3); // Cavan, Donegal, Monaghan
    });

    it('has valid Eircode routing keys and Irish language names for key regions', () => {
      const limerick = getCountyBySlug('limerick');
      expect(limerick).toBeDefined();
      expect(limerick?.eircode).toBe('V94');
      expect(limerick?.irishName).toBe('Luimneach');

      const cork = getCountyBySlug('cork');
      expect(cork?.eircode).toBe('T12');
      expect(cork?.irishName).toBe('Corcaigh');

      const dublin = getCountyBySlug('dublin');
      expect(dublin?.eircode).toBe('D01-D24');
      expect(dublin?.irishName).toBe('Áth Cliath');

      const galway = getCountyBySlug('galway');
      expect(galway?.eircode).toBe('H91');
      expect(galway?.irishName).toBe('Gaillimh');

      const donegal = getCountyBySlug('donegal');
      expect(donegal?.eircode).toBe('F92');
      expect(donegal?.irishName).toBe('Dún na nGall');
    });

    it('allows search by Eircode routing key or town name', () => {
      const v94Results = searchCountiesByEircodeOrName('V94');
      expect(v94Results.some((c) => c.slug === 'limerick')).toBe(true);

      const townResults = searchCountiesByEircodeOrName('Salthill');
      expect(townResults.some((c) => c.slug === 'galway')).toBe(true);

      const navanResults = searchCountiesByEircodeOrName('Navan');
      expect(navanResults.some((c) => c.slug === 'meath')).toBe(true);
    });
  });

  // 2. Programmatic County Page Generation
  describe('Programmatic Landing Page Generation', () => {
    it('generates rich, complete landing page for Limerick V94', () => {
      const page = engine.generateCountyPage('limerick');

      expect(page.slug).toBe('limerick');
      expect(page.county).toBe('Limerick');
      expect(page.canonicalUrl).toBe(
        'https://ecosmarthomes.ie/counties/limerick',
      );
      expect(page.metaTitle).toContain('Limerick');
      expect(page.metaTitle).toContain('V94');
      expect(page.metaDescription).toContain('€12,500');
      expect(page.metaDescription).toContain('€50k');
      expect(page.wordCount).toBeGreaterThan(400);

      // Markdown assertions
      expect(page.contentMarkdown).toContain('Castletroy');
      expect(page.contentMarkdown).toContain('€12,500');
      expect(page.contentMarkdown).toContain('€50,000');
      expect(page.contentMarkdown).toContain('A0, A, B, C, D, E, F, and G');
    });

    it('generates rich, complete landing page for Dublin', () => {
      const page = engine.generateCountyPage('dublin');

      expect(page.slug).toBe('dublin');
      expect(page.province).toBe('Leinster');
      expect(page.contentMarkdown).toContain('hollow-block');
      expect(page.metrics.monthlySearches).toBeGreaterThan(10000);
      expect(page.keyTakeaways.length).toBeGreaterThanOrEqual(4);
    });

    it('throws when county slug is invalid', () => {
      expect(() => engine.generateCountyPage('non-existent-county')).toThrow(
        /County not found/,
      );
    });
  });

  // 3. Structured Data / JSON-LD Validation
  describe('Structured JSON-LD Schema Validation', () => {
    it('builds valid LocalBusiness and FAQPage schemas with postalCode', () => {
      const page = engine.generateCountyPage('cork');
      const { localBusiness, faqPage, breadcrumbList } = page.jsonLdSchemas;

      // LocalBusiness / HomeAndConstructionBusiness
      expect(localBusiness['@context']).toBe('https://schema.org');
      expect(localBusiness['@type']).toBe('HomeAndConstructionBusiness');
      expect(localBusiness.address.addressLocality).toBe('Cork');
      expect(localBusiness.address.postalCode).toBe('T12');
      expect(localBusiness.address.addressCountry).toBe('IE');
      expect(localBusiness.geo.latitude).toBeCloseTo(51.8985, 2);

      // FAQPage
      expect(faqPage['@context']).toBe('https://schema.org');
      expect(faqPage['@type']).toBe('FAQPage');
      expect(Array.isArray(faqPage.mainEntity)).toBe(true);
      expect(faqPage.mainEntity.length).toBeGreaterThanOrEqual(3);
      expect(faqPage.mainEntity[0]['@type']).toBe('Question');
      expect(faqPage.mainEntity[0].acceptedAnswer['@type']).toBe('Answer');

      // BreadcrumbList
      expect(breadcrumbList['@type']).toBe('BreadcrumbList');
      expect(breadcrumbList.itemListElement.length).toBe(3);
      expect(breadcrumbList.itemListElement[2].name).toBe('Cork');
    });
  });

  // 4. Batch Generation & Regional XML Sitemap
  describe('Batch Generation & XML Sitemap', () => {
    it('generates all 26 counties with aggregated metrics', () => {
      const summary = engine.generateAllCountiesMoat();

      expect(summary.totalCounties).toBe(26);
      expect(summary.pages.length).toBe(26);
      expect(summary.totalMonthlySearches).toBeGreaterThan(70000);
      expect(summary.totalContractors).toBeGreaterThan(500);
      expect(summary.provinces.Munster).toBe(6);
      expect(summary.provinces.Leinster).toBe(12);
      expect(summary.provinces.Connacht).toBe(5);
      expect(summary.provinces.Ulster).toBe(3);
    });

    it('generates a valid XML sitemap containing all 26 county URLs', () => {
      const xml = engine.generateRegionalSitemapXml();

      expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(
        true,
      );
      expect(xml).toContain(
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
      );
      expect(xml).toContain('https://ecosmarthomes.ie/counties/limerick');
      expect(xml).toContain('https://ecosmarthomes.ie/counties/cork');
      expect(xml).toContain('https://ecosmarthomes.ie/counties/dublin');
      expect(xml).toContain('https://ecosmarthomes.ie/counties/galway');
      expect(xml).toContain('https://ecosmarthomes.ie/counties/donegal');
      expect(xml).toContain('<priority>0.9</priority>');

      // Count occurrences of <loc>
      const locMatches = xml.match(/<loc>/g) || [];
      expect(locMatches.length).toBe(26);
    });
  });
});
