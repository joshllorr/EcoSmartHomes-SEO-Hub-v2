/**
 * harborSync.ts
 * Pushes live events from the local Hub to the hosted Harbor Dashboard
 * at https://tools.ecosmarthomes.ie/api/hub-sync
 */

export type HarborEventType =
  | "draft_created"
  | "rewrite_success"
  | "serp_diff_patch"
  | "link_bait_generated"
  | "autonomous_expansion"
  | "expansion_queued"
  | "scheduled_publish"
  | "visibility_spike"
  | "semantic_enrichment"
  | "authority_graph_update"
  | "multi_site_expansion"
  | "conversational_knowledge"
  | "article_generated"
  | "article_draft";

export interface HarborPayload {
  type: HarborEventType;
  slug?: string;
  message: string;
  timestamp?: number;
  [key: string]: unknown;
}

const HARBOR_ENDPOINT = "https://tools.ecosmarthomes.ie/api/hub-sync";

/**
 * Sync a single event payload to the Harbor Dashboard.
 * Fire-and-forget — never throws, so it cannot disrupt local automation.
 */
export async function syncToHarbor(payload: HarborPayload): Promise<void> {
  try {
    await fetch(HARBOR_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        timestamp: payload.timestamp ?? Date.now()
      })
    });
  } catch (err) {
    // Silent fail — local automation must never block on Harbor availability
    console.error("Harbor sync failed:", err);
  }
}

/**
 * Convenience helpers — one per event type for clean call-sites.
 */

export const harborSync = {
  articleDraft: (slug: string, extra?: Partial<HarborPayload>) =>
    syncToHarbor({ type: "article_draft", slug, message: `New article draft created: ${slug}`, ...extra }),

  rewriteSuccess: (slug: string, newGrade: string, extra?: Partial<HarborPayload>) =>
    syncToHarbor({ type: "rewrite_success", slug, newGrade, message: `Rewrite success: ${slug} upgraded to Grade ${newGrade}`, ...extra }),

  serpDiffPatch: (slug: string, topicsAdded: number, extra?: Partial<HarborPayload>) =>
    syncToHarbor({ type: "serp_diff_patch", slug, topicsAdded, message: `SERP diff: Added ${topicsAdded} missing competitor topics to ${slug}`, ...extra }),

  linkBaitGenerated: (slug: string, extra?: Partial<HarborPayload>) =>
    syncToHarbor({ type: "link_bait_generated", slug, message: `Link-bait hook generated for: ${slug}`, ...extra }),

  autonomousExpansion: (gaps: string[], extra?: Partial<HarborPayload>) =>
    syncToHarbor({ type: "autonomous_expansion", gaps, message: `Autonomous expansion: queued ${gaps.length} new cluster page(s)`, ...extra }),

  scheduledPublish: (slug: string, extra?: Partial<HarborPayload>) =>
    syncToHarbor({ type: "scheduled_publish", slug, message: `Scheduled publish: ${slug}.html released`, ...extra }),

  visibilitySpike: (increment: number, source: string, extra?: Partial<HarborPayload>) =>
    syncToHarbor({ type: "visibility_spike", increment, source, message: `Visibility spike: +${increment} visits — ${source}`, ...extra }),

  semanticEnrichment: (slug: string, entities: string[], extra?: Partial<HarborPayload>) =>
    syncToHarbor({ type: "semantic_enrichment", slug, entities, message: `Semantic enrichment: Added ${entities.join(", ")} to ${slug}`, ...extra }),

  multiSiteExpansion: (gaps: string[], domains: string[], extra?: Partial<HarborPayload>) =>
    syncToHarbor({ type: "multi_site_expansion", gaps, domains, message: `Multi-site expansion: Created ${gaps.length} page(s) across ${domains.length} fleet domains`, ...extra }),

  conversationalKnowledge: (question: string, intent: string, sources: string[], extra?: Partial<HarborPayload>) =>
    syncToHarbor({ type: "conversational_knowledge", question, intent, sources, message: `Q&A: "${question}" → ${sources.length} sources used`, ...extra })
};
