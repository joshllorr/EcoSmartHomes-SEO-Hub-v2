/**
 * EcoSmartHomes SEO Hub - Gemini API SERP Analysis Proxy
 *
 * Safely runs search analysis via server-side API endpoint.
 */
export async function runSERPAnalysis(keyword: string): Promise<string> {
  const response = await fetch('/api/seo/serp-analysis', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ keyword }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(
      `SERP Analysis Request Failed: ${response.status} - ${errText}`,
    );
  }

  const data = await response.json();
  if (data.serp) {
    const jsonBlock = JSON.stringify(data.serp, null, 2);
    const markdownBlock = data.markdown || '';
    return `${jsonBlock}\n\n${markdownBlock}`;
  }
  throw new Error(data.error || 'Failed to retrieve SERP analysis results.');
}
