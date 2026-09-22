import type { VercelRequest, VercelResponse } from '@vercel/node';

export function createTitleMetaData(topic: string, tone?: string) {
  const cleanTopic = (topic || 'Raising BER from G to A').trim();
  const selectedTone = tone || 'professional';

  const slug = cleanTopic
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  let title = `${cleanTopic}: Complete Irish Retrofit Guide 2026`;
  if (cleanTopic.toLowerCase().includes('ber')) {
    title = `${cleanTopic}: Step-by-Step Irish SEAI Retrofit Guide 2026`;
  } else if (cleanTopic.toLowerCase().includes('heat pump')) {
    title = `${cleanTopic}: 2026 SEAI Grants Up to €12,500 & Savings`;
  } else if (cleanTopic.toLowerCase().includes('solar')) {
    title = `${cleanTopic}: SEAI Grants, Costs & Microgeneration 2026`;
  }

  const metaDescription =
    `Complete Irish homeowner guide to ${cleanTopic}. Discover SEAI 2026 grants up to €12,500 for heat pumps and €50k for One Stop Shop retrofits to cut bills.`.substring(
      0,
      158,
    );

  const alternatives = [
    `How Irish Homeowners Can Master ${cleanTopic} in 2026`,
    `SEAI Retrofit Blueprint: Practical Steps for ${cleanTopic}`,
    `Cost, Grants & Execution Guide: ${cleanTopic} Ireland`,
    `Achieving Net-Zero: Expert Advisor Roadmap for ${cleanTopic}`,
  ];

  return {
    title,
    slug: slug.startsWith('guide-') ? slug : `guide-${slug}`,
    meta_description: metaDescription,
    alternatives,
    tone: selectedTone,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method || 'GET';
  if (method !== 'POST' && method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (_) {
        body = {};
      }
    }

    const topic =
      body?.topic || (req.query?.topic as string) || 'Raising BER from G to A';
    const tone = body?.tone || (req.query?.tone as string) || 'professional';

    const data = createTitleMetaData(topic, tone);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err: any) {
    console.error('generate-title-meta error:', err);
    const fallback = createTitleMetaData('Raising BER from G to A');
    return res.status(200).json({
      success: true,
      data: fallback,
      warning: 'Generated resilient metadata in offline safe mode.',
    });
  }
}
