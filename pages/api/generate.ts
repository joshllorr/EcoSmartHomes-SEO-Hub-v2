import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI } from '@google/genai';

function getEnterpriseClient(): GoogleGenAI | null {
  const useVertex =
    process.env.GOOGLE_GENAI_USE_VERTEXAI === 'true' ||
    Boolean(process.env.GOOGLE_CLOUD_PROJECT);
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

  // 1. Enterprise Vertex AI Mode (lowercase vertexai)
  if (useVertex && project) {
    try {
      return new GoogleGenAI({
        vertexai: true,
        project,
        location,
      });
    } catch (e) {
      console.warn('Vertex AI initialization fallback to API Key:', e);
    }
  }

  // 2. Enterprise Gemini API Key Mode
  if (apiKey) {
    return new GoogleGenAI({ apiKey });
  }

  return null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,OPTIONS,PATCH,DELETE,POST,PUT',
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
  );

  if (req.method === 'OPTIONS') {
    res.status(200);
    return res.end();
  }

  try {
    const { keyword, topic, targetAudience, outline } = req.body || {};
    const effectiveKeyword = keyword || topic || 'solar pv grants ireland';

    const ai = getEnterpriseClient();
    let generatedArticle = null;

    if (ai) {
      const prompt = `You are the Lead SEO Content Strategist for EcoSmartHomes Ireland.
Write a comprehensive, highly authoritative, conversion-optimized Irish home energy article for the topic: "${effectiveKeyword}".
Target Audience: ${targetAudience || 'Irish Homeowners seeking SEAI Grants'}.
Include:
- High-intent H2 and H3 sections matching Google Ireland SERP search intent
- Official SEAI grant deductions (€2,100 Solar PV, €6,500 Heat Pump, up to €25,000 One-Stop-Shop)
- Payback calculations and ROI timelines
- Vetted contractor recommendation callouts
- FAQ schema section
Format strictly as JSON with keys: title, slug, metaDescription, outline (array), content (markdown), tags (array).`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (response && response.text) {
        try {
          generatedArticle = JSON.parse(response.text);
        } catch {
          generatedArticle = {
            title: `Guide to ${effectiveKeyword}`,
            slug: effectiveKeyword.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            content: response.text,
            outline: outline || [
              'Overview',
              'SEAI Grants',
              'Costs & Savings',
              'Next Steps',
            ],
            metaDescription: `Complete Irish homeowner guide to ${effectiveKeyword}.`,
            tags: ['SEAI Grants', 'Energy Efficiency', 'Ireland Retrofit'],
          };
        }
      }
    }

    if (!generatedArticle) {
      const cleanSlug = effectiveKeyword
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      generatedArticle = {
        title: `Comprehensive Guide to ${effectiveKeyword.charAt(0).toUpperCase() + effectiveKeyword.slice(1)} (2026)`,
        slug: cleanSlug,
        outline: outline || [
          '1. Overview of SEAI Grant Schemes in Ireland',
          '2. System Specifications & Eligibility Criteria',
          '3. Estimated Energy Savings & Payback Timeline',
          '4. Step-by-Step Grant Application Process',
          '5. Frequently Asked Questions',
        ],
        content: `## Complete Guide to ${effectiveKeyword}\n\nHomeowners across Ireland can take advantage of updated 2026 SEAI grant subsidies to upgrade their homes to BER A-ratings.\n\n### Grant Breakdown\n- **Solar PV Grant**: Up to €2,100 deducted at source\n- **Heat Pump Grant**: Up to €6,500 with technical assessment\n- **Insulation Subsidies**: Up to €4,000 for external wall insulation\n\n### Annual Savings\nAverage Irish homes achieve between €800 and €1,450 in annual electricity and heating bill reductions.\n\n### How to Apply\n1. Review your current BER assessment\n2. Select a registered SEAI contractor\n3. Submit your application before commencing work.`,
        metaDescription: `Discover how to maximize ${effectiveKeyword} in Ireland with vetted installers and SEAI grant deductions.`,
        tags: ['SEAI Grants', 'Energy Efficiency', 'Ireland Retrofit'],
        isLiveAI: false,
      };
    }

    return res.status(200).json({
      ok: true,
      success: true,
      data: generatedArticle,
      isLiveAI: Boolean(ai),
      authMode:
        process.env.GOOGLE_GENAI_USE_VERTEXAI === 'true'
          ? 'vertex-enterprise'
          : 'gemini-api-key',
      timestamp: Date.now(),
    });
  } catch (err: any) {
    return res.status(500).json({
      ok: false,
      error: err.message || 'Generation failed',
      route: 'api/generate',
    });
  }
}
