export interface BacklinkOpportunity {
  site: string;
  url: string;
  reason: string;
  match: string;
  contact: string;
  warm_score: number;
}

export const fallbackBacklinkOpportunities: BacklinkOpportunity[] = [
  {
    site: "Construct Ireland",
    url: "https://constructireland.ie/retrofitting-news",
    reason: "Topical authority match for Irish BER rating upgrade guide.",
    match: "BER Upgrade Bible & Grant Payout Sequence Flowchart",
    contact: "info@constructireland.ie",
    warm_score: 96
  },
  {
    site: "Energy Performance Database",
    url: "https://energyperformancedatabase.ie/advisory",
    reason: "Registered SEAI advisory directory linking heat pump COP cost models.",
    match: "Heat Pump vs Kerosene vs Gas Running Cost Simulator",
    contact: "editor@energyperformancedatabase.ie",
    warm_score: 92
  },
  {
    site: "Self Build Ireland",
    url: "https://selfbuild.ie/features/solar-pv-roi",
    reason: "Popular home extension publication seeking battery storage ROI calculators.",
    match: "2026 SEAI Grant & Retrofit Investment Calculator",
    contact: "features@selfbuild.ie",
    warm_score: 89
  },
  {
    site: "Limerick Leader",
    url: "https://limerickleader.ie/property/v94-retrofit-grants",
    reason: "Regional Mid-West newspaper covering V94 Eircode deep retrofit energy bill savings.",
    match: "Limerick Postcode Deep Retrofit Data Infographic",
    contact: "news@limerickleader.ie",
    warm_score: 85
  }
];

export async function runBacklinkScanner(linkBaitIdeas: any[] = [], apiKey: string = ""): Promise<BacklinkOpportunity[]> {
  const body = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `
Scan for backlink opportunities.

site: ecosmarthomes.ie
location: Limerick + surrounding areas

link_bait_ideas: ${JSON.stringify(linkBaitIdeas)}

Return ONLY the JSON array.
`
          }
        ]
      }
    ]
  };

  try {
    const res = await fetch("/api/seo/backlink-scanner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site: "ecosmarthomes.ie", linkBaitIdeas, body })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.opportunities && Array.isArray(data.opportunities)) {
        return data.opportunities;
      }
    }

    if (apiKey && apiKey !== "YOUR_API_KEY") {
      const directRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        }
      );

      const directData = await directRes.json();
      const rawText = directData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const cleanJson = rawText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      return JSON.parse(cleanJson);
    }
  } catch (err) {
    console.warn("runBacklinkScanner error:", err);
  }

  return fallbackBacklinkOpportunities;
}

export default runBacklinkScanner;
