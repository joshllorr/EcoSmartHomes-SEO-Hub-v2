/**
 * EcoSmartHomes SEO Hub - Gemini API Proxy Wrapper
 *
 * Safely generates articles using the server-side proxy endpoint.
 */
export async function generateArticleWithGemini(
  topic: string,
  tone: string,
  length: string,
): Promise<string> {
  const response = await fetch('/api/seo/generate-article', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: topic,
      topic: topic,
      tone: tone,
      length: length,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(
      `Article Generation Failed: ${response.status} - ${errText}`,
    );
  }

  const data = await response.json();
  if (data.content) {
    return data.content;
  }
  throw new Error(data.error || 'Failed to generate article content.');
}
