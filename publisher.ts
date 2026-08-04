import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

export function publishPageToGitHub(slug: string, html: string) {
  const contentDir = path.join(process.cwd(), 'content');
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
  }

  const cleanSlug = slug.replace(/^\/+|\/+$/g, '') || 'index';
  const filePath = path.join(contentDir, `${cleanSlug}.html`);

  // Write file
  fs.writeFileSync(filePath, html, 'utf8');

  // Commit + push
  exec(
    `git add "${filePath}" && git commit -m "Auto-publish: ${cleanSlug}" && git push`,
    (err, stdout, stderr) => {
      if (err) {
        console.error('Publish error:', err);
        return;
      }
      console.log('Publish output:', stdout);
    },
  );

  return {
    slug: cleanSlug,
    filePath,
    status: 'published',
  };
}

export function injectInternalLinks(newSlug: string, keywords: string[] = []) {
  const contentDir = path.resolve('./content');
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
    return;
  }

  const cleanSlug = newSlug.replace(/^\/+|\/+$/g, '') || 'index';
  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith('.html'));

  files.forEach((file) => {
    if (file === `${cleanSlug}.html`) return;
    const filePath = path.join(contentDir, file);
    let html = fs.readFileSync(filePath, 'utf-8');

    keywords.forEach((keyword) => {
      if (!keyword || keyword.trim() === '') return;
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(html) && !html.includes(`/content/${cleanSlug}.html`)) {
        html = html.replace(
          regex,
          `<a href="/content/${cleanSlug}.html" class="text-blue-600 hover:underline font-medium">${keyword}</a>`,
        );
      }
    });

    fs.writeFileSync(filePath, html, 'utf-8');
  });

  console.log(`Internal links injected for ${cleanSlug}`);
}
