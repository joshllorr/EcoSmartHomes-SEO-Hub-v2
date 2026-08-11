import fs from 'fs';
import path from 'path';

/**
 * Endpoint handler for POST /api/publish
 * Saves published HTML articles to the VM's articles directory.
 */
export default async function publishHandler(req, res) {
  try {
    let body = req.body;

    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        // keep as is
      }
    }

    if (!body && typeof req.json === 'function') {
      try {
        body = await req.json();
      } catch (e) {
        body = {};
      }
    }

    body = body || {};
    const { slug, html, content, title } = body;

    if (!slug) {
      const errPayload = { error: 'Slug is required' };
      if (res && typeof res.status === 'function') {
        return res.status(400).json(errPayload);
      }
      return new Response(JSON.stringify(errPayload), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cleanSlug = String(slug)
      .replace(/^\/+|\/+$/g, '')
      .replace(/[^a-zA-Z0-9_-]/g, '-');
    const articlesDir = path.join(process.cwd(), 'articles');

    if (!fs.existsSync(articlesDir)) {
      fs.mkdirSync(articlesDir, { recursive: true });
    }

    const filePath = path.join(articlesDir, `${cleanSlug}.html`);

    let articleHtml = html || content;
    if (!articleHtml) {
      const errPayload = { error: 'HTML or content is required' };
      if (res && typeof res.status === 'function') {
        return res.status(400).json(errPayload);
      }
      return new Response(JSON.stringify(errPayload), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!articleHtml.includes('<html') && !articleHtml.includes('<!DOCTYPE')) {
      articleHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || cleanSlug} | EcoSmartHomes Ireland</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; color: #1e293b; }
    h1 { color: #0f172a; border-bottom: 2px solid #34d399; padding-bottom: 0.5rem; }
    h2 { color: #0f172a; margin-top: 1.5rem; }
    a { color: #059669; }
  </style>
</head>
<body>
  <h1>${title || cleanSlug}</h1>
  <div>${articleHtml}</div>
</body>
</html>`;
    }

    fs.writeFileSync(filePath, articleHtml, 'utf8');

    const successPayload = {
      success: true,
      message: `Article '${cleanSlug}' published successfully`,
      slug: cleanSlug,
      url: `/articles/${cleanSlug}`,
      filePath: `/var/www/seo-hub/articles/${cleanSlug}.html`,
    };

    if (res && typeof res.json === 'function') {
      return res.json(successPayload);
    }

    return new Response(JSON.stringify(successPayload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in publishHandler:', error);
    const errPayload = { error: error.message || 'Failed to publish article' };
    if (res && typeof res.status === 'function') {
      return res.status(500).json(errPayload);
    }
    return new Response(JSON.stringify(errPayload), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
