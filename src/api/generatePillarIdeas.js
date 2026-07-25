import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  try {
    const { pillarTopic = "", url = "https://ecosmarthomes.ie" } = req.body || {};

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "";
    console.log("Gemini key loaded:", apiKey ? "✅ yes" : "❌ no");
    if (!apiKey) {
      // Fallback structured ideas if API key is not configured directly
      const fallbackIdeas = Array.from({ length: 12 }, (_, i) => ({
        title: i === 0 
          ? `The Ultimate Masterclass: ${pillarTopic || "BER Rating Ireland Upgrade"}`
          : i === 1 
          ? `2026 SEAI Grant & Financial Roadmap for ${pillarTopic || "BER Upgrades"}`
          : i === 2 
          ? `Step-by-Step Technical Execution for ${pillarTopic || "Home Retrofitting"}`
          : `Pillar Concept ${i + 1}: ${pillarTopic || "BER Upgrade Guide"} - Strategy ${i + 1}`,
        description: `Comprehensive authority guide covering technical specifications, SEAI grant deductions, BER jump metrics, and contractor compliance for ${url}.`,
        keywords: ["BER Rating Ireland", "SEAI Grants 2026", "Heat Pump Retrofit", "Home Energy Audit"]
      }));
      return res.status(200).json({ ideas: fallbackIdeas });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Generate 32 pillar page ideas for:

Site: ${url}
Topic: ${pillarTopic}

Return JSON ONLY in this format:
[
  {
    "title": "string",
    "description": "string",
    "keywords": ["kw1", "kw2", "kw3"]
  }
]
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const cleanJson = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const ideas = JSON.parse(cleanJson);

    res.status(200).json({ ideas });
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: "Failed to generate ideas" });
  }
}
