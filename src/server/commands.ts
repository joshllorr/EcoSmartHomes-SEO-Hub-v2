/**
 * src/server/commands.ts
 *
 * Harbor → Hub Command Router
 * Mounted at POST /api/command in server.ts.
 *
 * Harbor sends: { action: "generate_draft", payload: { slug, title, ... } }
 * The router dispatches to the correct engine and returns { ok: true, result }.
 * Every command is also broadcast over WebSocket and synced back to Harbor.
 */

import express, { Request, Response } from 'express';
import {
  runDraftGenerator,
  runRewriteEngine,
  runCompetitorDiff,
  queueExpansion,
  publishToGitHub,
  runLinkBaitGenerator,
  runOptimizationPipeline,
  type DraftPayload,
  type RewritePayload,
  type CompetitorDiffPayload,
  type ExpansionPayload,
  type PublishPayload,
  type LinkBaitPayload,
  type OptimizePipelinePayload,
} from '../engines/index';

export type CommandAction =
  | 'generate_draft'
  | 'rewrite_article'
  | 'competitor_diff'
  | 'queue_expansion'
  | 'publish'
  | 'link_bait'
  | 'optimize_pipeline'
  | 'optimize_all';

export interface CommandRequest {
  action: CommandAction;
  payload: Record<string, unknown>;
}

const router = express.Router();

router.post('/command', async (req: Request, res: Response) => {
  const { action, payload = {} } = req.body as CommandRequest;

  if (!action) {
    return res.status(400).json({ ok: false, error: 'Missing action' });
  }

  console.log(`[command] Received from Harbor: ${action}`, payload);

  try {
    let result: unknown;

    switch (action) {
      case 'generate_draft':
        result = await runDraftGenerator(payload as DraftPayload);
        break;

      case 'rewrite_article':
        result = await runRewriteEngine(payload as RewritePayload);
        break;

      case 'competitor_diff':
        result = await runCompetitorDiff(payload as CompetitorDiffPayload);
        break;

      case 'queue_expansion':
        result = await queueExpansion(payload as ExpansionPayload);
        break;

      case 'publish':
        result = await publishToGitHub(payload as PublishPayload);
        break;

      case 'link_bait':
        result = await runLinkBaitGenerator(payload as LinkBaitPayload);
        break;

      case 'optimize_pipeline':
        result = await runOptimizationPipeline(
          payload as OptimizePipelinePayload,
        );
        break;

      case 'optimize_all': {
        const siteIds = (payload.siteIds as string[]) || [];
        const results = [];
        for (const siteId of siteIds) {
          results.push(await runOptimizationPipeline({ siteId, ...payload }));
        }
        result = { optimizedSites: siteIds, results };
        break;
      }

      default:
        return res.status(400).json({
          ok: false,
          error: `Unknown command: "${action}". Valid actions: generate_draft, rewrite_article, competitor_diff, queue_expansion, publish, link_bait, optimize_pipeline`,
        });
    }

    console.log(`[command] Completed: ${action}`);
    return res.json({ ok: true, action, result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[command] Failed: ${action} —`, message);
    return res.status(500).json({ ok: false, action, error: message });
  }
});

export default router;
