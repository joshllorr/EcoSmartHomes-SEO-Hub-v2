import { describe, it, expect, beforeEach } from 'vitest';
import {
  searchGlobalIndex,
  getSearchIndexStats,
  getRecentSearches,
  addRecentSearch,
  clearRecentSearches,
} from '../services/globalSearchIndex';

describe('Global Search Index Engine', () => {
  beforeEach(() => {
    clearRecentSearches();
    localStorage.clear();
  });

  it('indexes drafts, keywords, audit logs, and navigation items', () => {
    const stats = getSearchIndexStats();
    expect(stats.total).toBeGreaterThan(20);
    expect(stats.drafts).toBeGreaterThan(0);
    expect(stats.keywords).toBeGreaterThan(0);
    expect(stats.audits).toBeGreaterThan(0);
    expect(stats.navs).toBeGreaterThan(0);
  });

  it('finds content drafts by title, topic, or keyword', () => {
    const results = searchGlobalIndex('SEAI Grants Explained', 'draft');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].category).toBe('draft');
    expect(results[0].targetTab).toBe('writer');
    expect(results[0].title).toContain('SEAI Grants Explained');
  });

  it('finds keyword research items by search query and cluster', () => {
    const results = searchGlobalIndex('heat pump', 'keyword');
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.category === 'keyword')).toBe(true);
    expect(results[0].targetTab).toBe('keywords');
    expect(results[0].metrics?.some((m) => m.label === 'Vol/mo')).toBe(true);
  });

  it('finds site audit logs by error/issue name or category', () => {
    const results = searchGlobalIndex('Sitemap', 'audit');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].category).toBe('audit');
    expect(results[0].targetTab).toBe('audit');
    expect(results[0].title).toContain('Sitemap');
  });

  it('filters results strictly by selected category', () => {
    const allResults = searchGlobalIndex('SEAI', 'all');
    const draftResults = searchGlobalIndex('SEAI', 'draft');
    const kwResults = searchGlobalIndex('SEAI', 'keyword');
    const auditResults = searchGlobalIndex('SEAI', 'audit');

    expect(allResults.length).toBeGreaterThan(0);
    expect(draftResults.every((r) => r.category === 'draft')).toBe(true);
    expect(kwResults.every((r) => r.category === 'keyword')).toBe(true);
    expect(auditResults.every((r) => r.category === 'audit')).toBe(true);
  });

  it('handles empty query by returning all items ranked', () => {
    const results = searchGlobalIndex('', 'all');
    expect(results.length).toBeGreaterThan(20);
  });

  it('manages recent search queries properly', () => {
    addRecentSearch('Heat pump efficiency');
    addRecentSearch('BER grant Limerick');
    addRecentSearch('Heat pump efficiency'); // Duplicate should deduplicate

    const recents = getRecentSearches();
    expect(recents[0]).toBe('Heat pump efficiency');
    expect(recents[1]).toBe('BER grant Limerick');

    clearRecentSearches();
    const cleared = getRecentSearches();
    expect(cleared.length).toBe(0);
  });
});
