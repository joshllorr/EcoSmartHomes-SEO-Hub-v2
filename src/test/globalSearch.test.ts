import { describe, it, expect, beforeEach } from 'vitest';
import {
  searchGlobalIndex,
  getSearchIndexStats,
  getRecentSearches,
  addRecentSearch,
  clearRecentSearches,
  getSuggestedItems,
} from '../services/globalSearchIndex';
import { parseVoiceCommand } from '../services/voiceSearch';

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

  it('handles empty query by prioritizing recent drafts and frequent navigation destinations in Suggested section', () => {
    const results = searchGlobalIndex('', 'all');
    expect(results.length).toBeGreaterThan(20);

    // The top results must be recent drafts
    const topDrafts = results.slice(0, 3);
    expect(topDrafts.every((r) => r.category === 'draft' && r.suggestedSection === 'recent_draft')).toBe(true);

    // Subsequent results must include frequent navigation destinations
    const frequentNavs = results.filter((r) => r.suggestedSection === 'frequent_nav');
    expect(frequentNavs.length).toBeGreaterThan(0);
    expect(frequentNavs.some((r) => r.title.includes('SEO Dashboard'))).toBe(true);
    expect(frequentNavs.some((r) => r.title.includes('AI Writer'))).toBe(true);
  });

  it('provides helper getSuggestedItems that extracts prioritized drafts and destinations', () => {
    const suggested = getSuggestedItems();
    expect(suggested.recentDrafts.length).toBeGreaterThan(0);
    expect(suggested.frequentDestinations.length).toBeGreaterThan(0);
    expect(suggested.allSuggested.length).toBe(
      suggested.recentDrafts.length + suggested.frequentDestinations.length,
    );
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

  it('supports narrowing search results by category: Drafts, Audits, Research, and Navigation', () => {
    // Drafts
    const draftsOnly = searchGlobalIndex('', 'draft');
    expect(draftsOnly.length).toBeGreaterThan(0);
    expect(draftsOnly.every((r) => r.category === 'draft')).toBe(true);

    // Audits
    const auditsOnly = searchGlobalIndex('', 'audit');
    expect(auditsOnly.length).toBeGreaterThan(0);
    expect(auditsOnly.every((r) => r.category === 'audit')).toBe(true);

    // Research / Keywords
    const researchOnly = searchGlobalIndex('', 'keyword');
    expect(researchOnly.length).toBeGreaterThan(0);
    expect(researchOnly.every((r) => r.category === 'keyword')).toBe(true);

    // Navigation
    const navOnly = searchGlobalIndex('', 'nav');
    expect(navOnly.length).toBeGreaterThan(0);
    expect(navOnly.every((r) => r.category === 'nav')).toBe(true);
  });

  it('parses voice commands to filter by category: Drafts, Audits, and Research', () => {
    const draftCmd = parseVoiceCommand('filter drafts');
    expect(draftCmd.action.type).toBe('filter');
    if (draftCmd.action.type === 'filter') {
      expect(draftCmd.action.category).toBe('draft');
    }

    const auditCmd = parseVoiceCommand('filter audits');
    expect(auditCmd.action.type).toBe('filter');
    if (auditCmd.action.type === 'filter') {
      expect(auditCmd.action.category).toBe('audit');
    }

    const researchCmd = parseVoiceCommand('filter research');
    expect(researchCmd.action.type).toBe('filter');
    if (researchCmd.action.type === 'filter') {
      expect(researchCmd.action.category).toBe('keyword');
    }

    const allCmd = parseVoiceCommand('show all');
    expect(allCmd.action.type).toBe('filter');
    if (allCmd.action.type === 'filter') {
      expect(allCmd.action.category).toBe('all');
    }
  });
});
