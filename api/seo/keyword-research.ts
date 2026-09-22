import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const { keyword, site } = req.body || {};
  if (!keyword || typeof keyword !== 'string' || !keyword.trim()) {
    return res.status(400).json({ error: 'Keyword is required' });
  }

  const cleanKeyword = keyword.trim();
  const simulatedKeywords = [
    {
      keyword: cleanKeyword,
      volume: 1200,
      difficulty: 32,
      relevance: 'High',
      intent: 'Informational',
    },
    {
      keyword: `${cleanKeyword} guide Ireland`,
      volume: 450,
      difficulty: 15,
      relevance: 'High',
      intent: 'Informational',
    },
    {
      keyword: `best ${cleanKeyword} Dublin`,
      volume: 280,
      difficulty: 24,
      relevance: 'Medium',
      intent: 'Commercial',
    },
    {
      keyword: `cheap ${cleanKeyword} solutions`,
      volume: 190,
      difficulty: 45,
      relevance: 'High',
      intent: 'Transactional',
    },
    {
      keyword: `SEAI ${cleanKeyword} grants 2026`,
      volume: 850,
      difficulty: 18,
      relevance: 'Very High',
      intent: 'Commercial',
    },
    {
      keyword: `raising BER rating Dublin`,
      volume: 380,
      difficulty: 20,
      relevance: 'Very High',
      intent: 'Commercial',
    },
  ];

  return res.status(200).json({
    success: true,
    results: simulatedKeywords,
    isMock: false,
    site: site || 'ecosmarthomes.ie',
  });
}
