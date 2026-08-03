export interface BacklinkOpportunityItem {
  site: string;
  url: string;
  reason: string;
  match: string;
  contact: string;
  warm_score: number;
}

export const fallbackBacklinkOpportunities: BacklinkOpportunityItem[] = [
  {
    site: 'Construct Ireland',
    url: 'https://constructireland.ie/retrofitting-news',
    reason:
      'High authority Irish sustainable building portal covering BER standards.',
    match: 'The Ultimate 2026 Irish Home Retrofit & BER Rating Upgrade Bible',
    contact: 'info@constructireland.ie',
    warm_score: 96,
  },
  {
    site: 'Energy Performance Database',
    url: 'https://energyperformancedatabase.ie/advisory',
    reason:
      'Registered SEAI advisory directory linking heat pump COP cost models.',
    match: 'Heat Pump vs Kerosene vs Gas Running Cost Simulator',
    contact: 'editor@energyperformancedatabase.ie',
    warm_score: 92,
  },
  {
    site: 'Self Build Ireland',
    url: 'https://selfbuild.ie/features/solar-pv-roi',
    reason:
      'Popular home extension publication seeking battery storage ROI calculators.',
    match: '2026 SEAI Grant & Retrofit Investment Calculator',
    contact: 'features@selfbuild.ie',
    warm_score: 89,
  },
  {
    site: 'Limerick Leader',
    url: 'https://limerickleader.ie/property/v94-retrofit-grants',
    reason:
      'Regional Mid-West newspaper covering V94 Eircode deep retrofit energy bill savings.',
    match: 'Limerick Postcode Deep Retrofit Data Infographic',
    contact: 'news@limerickleader.ie',
    warm_score: 85,
  },
];

export async function scanBacklinks(
  site: string = 'ecosmarthomes.ie',
  apiKey: string = '',
): Promise<BacklinkOpportunityItem[]> {
  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `
SYSTEM INSTRUCTION — Backlink Scanner AI

You are the Backlink Scanner AI for EcoSmartHomes SEO Hub, focused on Limerick and surrounding areas.

Your job is to identify real backlink opportunities for ${site} by analysing:
- Irish retrofit blogs
- Local Limerick news sites
- Community groups
- Housing associations
- Energy agencies
- SEAI-related content
- Local trades and contractors
- Home improvement sites
- Local councils
- Educational institutions
- Environmental organisations

You must match these sites to:
- The user’s pillar pages
- The user’s link bait ideas
- The user’s location pages
- The user’s calculators, glossaries, charts, quizzes, infographics

OUTPUT FORMAT (MANDATORY)
Return ONLY this JSON array (no code fences):
[
  {
    "site": "",
    "url": "",
    "reason": "",
    "match": "",
    "contact": "",
    "warm_score": 0
  }
]
`,
          },
        ],
      },
    ],
  };

  try {
    const res = await fetch('/api/seo/backlink-scanner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ site, body }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.opportunities && Array.isArray(data.opportunities)) {
        return data.opportunities;
      }
    }

    if (apiKey && apiKey !== 'YOUR_API_KEY') {
      const directRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
      );

      const directData = await directRes.json();
      const rawText =
        directData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const cleanJson = rawText
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();
      return JSON.parse(cleanJson);
    }
  } catch (err) {
    console.warn('scanBacklinks error:', err);
  }

  return fallbackBacklinkOpportunities;
}

export default scanBacklinks;
