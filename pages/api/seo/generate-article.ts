import type { NextApiRequest, NextApiResponse } from 'next';

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
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    body = body || {};

    const targetKeyword =
      body.keyword ||
      body.title ||
      body.topic ||
      body.prompt ||
      req.query?.keyword ||
      req.query?.title ||
      'Solar PV Grants Ireland 2026';

    const context =
      body.context ||
      body.targetAudience ||
      'Irish Homeowners seeking SEAI Grants';

    // Enterprise GCC Token Resolution
    const enterpriseToken =
      process.env.GEMINI_ACCESS_TOKEN ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY;

    let generatedArticle: any = null;
    let isLiveAI = false;

    if (enterpriseToken) {
      try {
        const prompt = `You are the Lead SEO Content Strategist for EcoSmartHomes Ireland.
Write an in-depth, authoritative Irish home energy SEO article for: "${targetKeyword}".
Context: ${context}.
Include:
- High-intent H2/H3 headings targeting Irish homeowner queries
- Official SEAI grant deductions (€2,100 Solar PV, €6,500 Heat Pump, up to €25,000 One-Stop-Shop)
- Payback calculations and ROI timelines
- Vetted contractor recommendation callouts
- FAQ schema section
Format strictly as JSON with keys: title, slug, metaDescription, outline (array of strings), content (pure markdown string), tags (array of strings).`;

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'x-goog-api-key': enterpriseToken,
          Authorization: `Bearer ${enterpriseToken}`,
        };

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${enterpriseToken}`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: 'application/json' },
            }),
          },
        );

        if (response.ok) {
          const data = await response.json();
          const candidateText =
            data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            try {
              const parsed = JSON.parse(candidateText);
              generatedArticle = {
                title: parsed.title || `Guide to ${targetKeyword}`,
                slug:
                  parsed.slug ||
                  targetKeyword.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                content: parsed.content || candidateText,
                outline: Array.isArray(parsed.outline)
                  ? parsed.outline
                  : [
                      'Overview',
                      'SEAI Grants',
                      'Costs & Savings',
                      'Next Steps',
                    ],
                metaDescription:
                  parsed.metaDescription ||
                  `Complete Irish homeowner guide to ${targetKeyword}.`,
                tags: Array.isArray(parsed.tags)
                  ? parsed.tags
                  : ['SEAI Grants', 'Energy Efficiency', 'Ireland Retrofit'],
              };
              isLiveAI = true;
            } catch {
              generatedArticle = {
                title: `Guide to ${targetKeyword}`,
                slug: targetKeyword.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                content: candidateText,
                outline: [
                  'Overview',
                  'SEAI Grants',
                  'Costs & Savings',
                  'Next Steps',
                ],
                metaDescription: `Complete Irish homeowner guide to ${targetKeyword}.`,
                tags: ['SEAI Grants', 'Energy Efficiency', 'Ireland Retrofit'],
              };
              isLiveAI = true;
            }
          }
        }
      } catch (e: any) {
        console.warn('Enterprise Gemini generation warning:', e.message);
      }
    }

    if (!generatedArticle) {
      const cleanSlug = targetKeyword
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const markdown = `## Complete Guide to ${targetKeyword}\n\nHomeowners across Ireland can take advantage of updated 2026 SEAI grant subsidies to upgrade their homes to BER A-ratings.\n\n### Grant Breakdown\n- **Solar PV Grant**: Up to €2,100 deducted at source\n- **Heat Pump Grant**: Up to €6,500 with technical assessment\n- **Insulation Subsidies**: Up to €4,000 for external wall insulation\n\n### Annual Savings\nAverage Irish homes achieve between €800 and €1,450 in annual electricity and heating bill reductions.\n\n### How to Apply\n1. Review your current BER assessment\n2. Select a registered SEAI contractor\n3. Submit your application before commencing work.`;

      generatedArticle = {
        title: `Comprehensive Guide to ${targetKeyword.charAt(0).toUpperCase() + targetKeyword.slice(1)} (2026)`,
        slug: cleanSlug,
        outline: [
          '1. Overview of SEAI Grant Schemes in Ireland',
          '2. System Specifications & Eligibility Criteria',
          '3. Estimated Energy Savings & Payback Timeline',
          '4. Step-by-Step Grant Application Process',
          '5. Frequently Asked Questions',
        ],
        content: markdown,
        metaDescription: `Discover how to maximize ${targetKeyword} in Ireland with vetted installers and SEAI grant deductions.`,
        tags: ['SEAI Grants', 'Energy Efficiency', 'Ireland Retrofit'],
      };
    }

    return res.status(200).json({
      ok: true,
      success: true,
      data: generatedArticle,
      draft: generatedArticle.content,
      content: generatedArticle.content,
      markdown: generatedArticle.content,
      article: generatedArticle,
      title: generatedArticle.title,
      outline: generatedArticle.outline,
      metaDescription: generatedArticle.metaDescription,
      slug: generatedArticle.slug,
      tags: generatedArticle.tags,
      isLiveAI,
      authMode: 'enterprise-gcc-token',
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
