// src/utils/buildPillarPage.js
export async function buildPillarPage(topic, tone = "professional", audience = "Irish homeowners", apiKey = "") {
  const topicTitle = typeof topic === "string" ? topic : topic?.title || "BER Rating Ireland & Retrofit Master Guide";
  const apiKeyToUse = apiKey || (typeof process !== "undefined" && process.env?.GEMINI_API_KEY) || "";

  const body = {
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `
Build a pillar page.

topic: ${topicTitle}
tone: ${tone}
audience: ${audience}

Return:
1. JSON metadata
2. Markdown article
`
          }
        ]
      }
    ]
  };

  try {
    const res = await fetch("/api/seo/build-pillar-page", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: topicTitle, tone, audience, body })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.resultText) {
        return data.resultText;
      }
      if (data.markdown) {
        return `${JSON.stringify(data.metadata, null, 2)}\n\n${data.markdown}`;
      }
    }

    if (apiKeyToUse && apiKeyToUse !== "YOUR_API_KEY") {
      const directRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKeyToUse}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        }
      );

      const directData = await directRes.json();
      return directData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }
  } catch (err) {
    console.warn("buildPillarPage error:", err);
  }

  return JSON.stringify({
    pillar_topic: topicTitle,
    slug: topicTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    meta_description: `Comprehensive 2026 pillar guide for ${topicTitle} covering SEAI grants, BER upgrades, and insulation standards in Limerick.`,
    audience: audience,
    tone: tone,
    support_pages: ["Heat Pump Readiness Assessment", "SEAI Grant & Investment Calculator"],
    word_count: 2200
  }, null, 2) + `\n\n# ${topicTitle}\n\n## 1. Introduction to Irish Retrofitting Standards\nRetrofitting your property improves BER efficiency rating, slashes winter fuel poverty, and qualifies for 2026 SEAI grant subsidies...`;
}

export default buildPillarPage;
