/**
 * src/services/hubCommands.ts
 *
 * Harbor -> Hub Command Service
 *
 * This service is called from the Harbor Dashboard (or local React UI)
 * to trigger actions on the local Hub backend. It sends POST requests to
 * the Vite proxy (localhost:5173/api/command), which routes them to the
 * local express server (localhost:3000/api/command).
 */

import { type CommandAction } from '../server/commands';

export async function sendHubCommand(
  action: CommandAction,
  payload: Record<string, unknown> = {},
): Promise<void> {
  try {
    const res = await fetch('/api/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(
        `[Hub Command] ${action} failed with status ${res.status}:`,
        errorText,
      );
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[Hub Command] Network error triggering ${action}:`, message);
  }
}

// ─── Convenience Wrappers ──────────────────────────────────────────────────

export const hubCommands = {
  generateDraft: (slug: string, extra?: Record<string, unknown>) =>
    sendHubCommand('generate_draft', { slug, ...extra }),

  rewriteArticle: (slug: string, extra?: Record<string, unknown>) =>
    sendHubCommand('rewrite_article', { slug, ...extra }),

  competitorDiff: (slug: string, extra?: Record<string, unknown>) =>
    sendHubCommand('competitor_diff', { slug, ...extra }),

  queueExpansion: (slug: string, extra?: Record<string, unknown>) =>
    sendHubCommand('queue_expansion', { slug, ...extra }),

  publishToGitHub: (slug: string, extra?: Record<string, unknown>) =>
    sendHubCommand('publish', { slug, ...extra }),

  triggerLinkBait: (slug: string, extra?: Record<string, unknown>) =>
    sendHubCommand('link_bait', { slug, ...extra }),

  optimizePipeline: (slug: string, extra?: Record<string, unknown>) =>
    sendHubCommand('optimize_pipeline', { slug, ...extra }),

  optimizeAll: (siteIds: string[], extra?: Record<string, unknown>) =>
    sendHubCommand('optimize_all', { siteIds, ...extra }),

  triggerAutonomousCycle: async () => {
    try {
      const res = await fetch('/api/autonomous-decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'trigger_cycle' }),
      });
      return await res.json();
    } catch (err) {
      console.error('[Autonomous Engine] Failed to trigger cycle:', err);
    }
  },

  toggleAutoPilot: async (enabled: boolean) => {
    try {
      const res = await fetch('/api/autonomous-decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_autopilot', enabled }),
      });
      return await res.json();
    } catch (err) {
      console.error('[Autonomous Engine] Failed to toggle autopilot:', err);
    }
  },

  setDomainAutonomyMode: async (
    siteId: string,
    mode: 'passive' | 'assisted' | 'full_autonomous',
  ) => {
    try {
      const res = await fetch('/api/autonomous-decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_domain_mode', siteId, mode }),
      });
      return await res.json();
    } catch (err) {
      console.error(
        '[Autonomous Engine] Failed to set domain autonomy mode:',
        err,
      );
    }
  },
};
