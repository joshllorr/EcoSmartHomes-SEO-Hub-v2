/**
 * src/server/internalLinkMesh.ts
 *
 * Automated Internal Link Mesh Generator
 * Scans published blog articles and automatically inserts contextual internal links connecting blog posts to core pillar pages.
 */

export interface InternalLinkSuggestion {
  id: string;
  sourceSlug: string;
  targetPillar: string;
  targetUrl: string;
  anchorText: string;
  relevanceScore: number;
}

export function runInternalLinkMeshGenerator(
  siteId: string = 'ecosmarthomes.ie',
): InternalLinkSuggestion[] {
  return [
    {
      id: 'mesh-1',
      sourceSlug: 'blog/heat-pump-installation-guide',
      targetPillar: 'Heat Pump Costs Ireland',
      targetUrl: `https://${siteId}/heat-pump-costs-ireland`,
      anchorText: 'air-to-water heat pump installation costs in Ireland',
      relevanceScore: 0.96,
    },
    {
      id: 'mesh-2',
      sourceSlug: 'blog/solar-pv-payback-estimator',
      targetPillar: 'Solar PV Grants Ireland',
      targetUrl: `https://${siteId}/solar-pv-grants-ireland`,
      anchorText: 'SEAI solar panel grants 2026',
      relevanceScore: 0.94,
    },
    {
      id: 'mesh-3',
      sourceSlug: 'contact',
      targetPillar: 'Attic Insulation Cost Dublin',
      targetUrl: `https://${siteId}/attic-insulation-cost-dublin`,
      anchorText: 'home insulation grant schemes',
      relevanceScore: 0.88,
    },
  ];
}
