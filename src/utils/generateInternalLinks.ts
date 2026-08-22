export interface InternalLinkSuggestion {
  source: string;
  target: string;
  anchor: string;
  reason: string;
  placement: string;
}

export const fallbackInternalLinks: InternalLinkSuggestion[] = [
  {
    source:
      'Pillar Page: Ultimate 2026 Irish Home Retrofit & BER Rating Upgrade Bible',
    target: 'Link Bait: 2026 SEAI Grant & Retrofit Investment Calculator',
    anchor: 'calculate your exact 2026 SEAI grant payout',
    reason:
      'Direct hub-to-spoke conversion link providing dynamic financial ROI metrics for homeowners.',
    placement: 'Under Section 2: SEAI Grant Measures & Payout Structures',
  },
  {
    source: 'Link Bait: Heat Pump Readiness Assessment',
    target: 'Location Page: Limerick V94 Eircode Retrofit Guide',
    anchor: 'heat pump grant eligibility in Limerick & Castletroy',
    reason:
      'Connects interactive diagnostic tool to local geo-targeted location hub.',
    placement: 'In the Quiz Result summary callout box',
  },
  {
    source: 'Article Draft: Air-to-Water Heat Pump Sizing for Pre-1980 Houses',
    target:
      'Pillar Page: Ultimate 2026 Irish Home Retrofit & BER Rating Upgrade Bible',
    anchor: 'complete BER upgrade roadmap',
    reason:
      'Spoke-to-hub topical authority booster passing link equity back to the primary pillar page.',
    placement: 'In the concluding section under Recommended Next Steps',
  },
];

export async function generateInternalLinks(
  inputPayload: any = {},
  apiKey: string = '',
): Promise<InternalLinkSuggestion[]> {
  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `
SYSTEM INSTRUCTION — Internal Linking AI

You generate internal linking suggestions for EcoSmartHomes SEO Hub.

Inputs:
- pillar page metadata + markdown: ${JSON.stringify(inputPayload.pillarPage || {})}
- link bait ideas: ${JSON.stringify(inputPayload.linkBaitIdeas || [])}
- location pages: ${JSON.stringify(inputPayload.locationPages || [])}
- writer article draft: ${JSON.stringify(inputPayload.articleDraft || {})}

Your job:
- Identify the best internal links from pillar → link bait → writer
- Suggest anchor text
- Suggest section placement
- Suggest “hub → spoke” structure

OUTPUT FORMAT (MANDATORY)
Return ONLY:

{
  "links": [
    {
      "source": "",
      "target": "",
      "anchor": "",
      "reason": "",
      "placement": ""
    }
  ]
}
`,
          },
        ],
      },
    ],
  };

  try {
    const res = await fetch('/api/seo/internal-linking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inputPayload),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.links && Array.isArray(data.links)) {
        return data.links;
      }
    }

    if (apiKey && apiKey !== 'YOUR_API_KEY') {
      const directRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=${apiKey}`,
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
      const parsed = JSON.parse(cleanJson);
      return parsed.links || fallbackInternalLinks;
    }
  } catch (err) {
    console.warn('generateInternalLinks error:', err);
  }

  return fallbackInternalLinks;
}

export default generateInternalLinks;
