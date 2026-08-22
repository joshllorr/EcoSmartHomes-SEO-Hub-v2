import type { Request, Response } from 'express';
import { publishToCMS } from './cmsPublisher';
import fs from 'fs';
import path from 'path';

export default async function publishHandler(req: Request, res: Response) {
  try {
    const { slug, title, content, html, excerpt, status, siteId, platform } =
      req.body || {};

    if (!slug) {
      return res
        .status(400)
        .json({ success: false, error: 'Slug is required' });
    }

    const articleHtml = html || content || '';
    const articleTitle = title || slug.replace(/-/g, ' ');

    // Store in articles directory for /articles/:slug serving
    try {
      const articlesDir = path.join(process.cwd(), 'articles');
      if (!fs.existsSync(articlesDir)) {
        fs.mkdirSync(articlesDir, { recursive: true });
      }
      fs.writeFileSync(
        path.join(articlesDir, `${slug}.html`),
        `<!DOCTYPE html><html><head><title>${articleTitle}</title></head><body><h1>${articleTitle}</h1>${articleHtml}</body></html>`,
      );
    } catch {
      // safe fallback
    }

    const result = await publishToCMS({
      siteId: siteId || 'ecosmarthomes-main',
      slug,
      title: articleTitle,
      content: articleHtml,
      metaDescription: excerpt,
      platform: platform || 'wordpress',
      status: status === 'draft' ? 'draft' : 'publish',
    });

    return res.json({
      success: true,
      slug,
      url: `/articles/${slug}`,
      result,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Publishing failed',
    });
  }
}
