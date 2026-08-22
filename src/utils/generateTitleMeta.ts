/**
 * EcoSmartHomes SEO Hub - Client-side Gemini API Proxy Wrapper
 *
 * Generates compelling SEO-optimised titles, slugs, and 150-160 character meta descriptions
 * safely using the server-side API proxy.
 */
export async function generateTitleMeta(
  topic: string,
  tone: string = 'Professional',
  content?: string,
): Promise<{
  title: string;
  slug: string;
  meta_description: string;
  alternatives: string[];
}> {
  const response = await fetch('/api/seo/generate-title-meta', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic,
      tone,
      content: content ? content.substring(0, 2500) : undefined,
      audience: 'Irish homeowners',
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(
      `Failed to generate title and meta tags: ${response.status} - ${errText}`,
    );
  }

  const result = await response.json();
  if (result.success && result.data) {
    return result.data;
  }
  throw new Error(result.error || 'Failed to generate title and meta tags.');
}
