export interface LinkBaitIdea {
  icon: string;
  title: string;
  desc: string;
  area: string;
  type: string;
  value: string;
}

export const fallbackIdeas: LinkBaitIdea[] = [
  {
    icon: '🎨',
    title: 'The 2026 Report: How BER Ratings Impact Irish Property Values',
    desc: 'A visual data representation showing the correlation between energy ratings and sale prices in the 2026 Irish property market.',
    area: 'Limerick',
    type: 'infographic',
    value:
      'Attracts citations from Irish property portals, green mortgage advisors, and housing market journalists.',
  },
  {
    icon: '❓',
    title:
      'Heat Pump Readiness Assessment: Will You Qualify for the 2026 Grant?',
    desc: 'A quiz evaluating if a home meets the Heat Loss Indicator requirement and is heat pump ready.',
    area: 'Dooradoyle',
    type: 'quiz',
    value:
      'High social share rate among homeowners evaluating heat pump retrofits.',
  },
  {
    icon: '⚖️',
    title: 'Comparison Guide: One-Stop-Shop vs Individual Grant Measures',
    desc: 'A side-by-side breakdown of Ireland’s two main retrofit pathways.',
    area: 'Castletroy',
    type: 'comparison',
    value:
      'Consistently referenced by trade publications and contractor directories.',
  },
  {
    icon: '🧮',
    title: '2026 SEAI Grant & Retrofit Investment Calculator',
    desc: 'An interactive tool estimating retrofit costs, grants, and savings.',
    area: 'Raheen',
    type: 'calculator',
    value:
      'Embeddable widget linked by financial columnists and local mortgage brokers.',
  },
  {
    icon: '📖',
    title: 'The 2026 Irish Homeowner’s Retrofit Glossary',
    desc: 'A dictionary explaining retrofit jargon in plain English.',
    area: 'Corbally',
    type: 'glossary',
    value:
      'Ranks naturally for definition terms and earns contextual Wikipedia-style links.',
  },
  {
    icon: '📊',
    title: 'SEAI Grant Limits & U-Value Requirements (2026)',
    desc: 'A reference chart listing all 2026 SEAI grants and required U-values.',
    area: 'Adare',
    type: 'chart',
    value:
      'Essential cheat-sheet bookmarked and linked by architects & energy auditors.',
  },
  {
    icon: '📍',
    title: 'Independent Home Energy Retrofit Advisory: Dublin',
    desc: 'A location page targeting Dublin homeowners and local housing archetypes.',
    area: 'Dublin',
    type: 'location page',
    value: 'Local authority citations and regional business index backlinks.',
  },
  {
    icon: '📍',
    title: 'Retrofit Roadmaps & Energy Consulting: Cork',
    desc: 'A location page tailored to Cork’s climate and housing stock.',
    area: 'Cork',
    type: 'location page',
    value: 'Regional directory citations and local eco-initiative links.',
  },
];

export async function generateLinkBaitIdeas(
  site: string = 'ecosmarthomes.ie',
  pillarTopic: string = '',
  apiKey: string = '',
): Promise<LinkBaitIdea[]> {
  const textPrompt = pillarTopic.trim()
    ? `Generate pillar page ideas for:\nsite: ${site}\ntopic: ${pillarTopic}`
    : `Generate new link bait ideas.\n\nsite: ${site}\nareas: Limerick, Castletroy, Dooradoyle, Raheen, Corbally, Adare, Patrickswell, Annacotty, Mungret, Shannon, Nenagh, Tipperary Town`;

  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: textPrompt,
          },
        ],
      },
    ],
  };

  try {
    const res = await fetch('/api/seo/link-bait-scanner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: site, body }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.ideas && Array.isArray(data.ideas)) {
        return data.ideas;
      }
    }

    if (apiKey) {
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
      return JSON.parse(cleanJson);
    }
  } catch (err) {
    console.warn(
      'Link bait generation call encountered issue, returning structured safe-mode ideas:',
      err,
    );
  }

  return fallbackIdeas;
}

export default generateLinkBaitIdeas;
