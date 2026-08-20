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

    const keyword =
      body.keyword ||
      body.title ||
      body.topic ||
      body.query ||
      'solar pv grants ireland';

    // Check Permanent Key First, then Access Token
    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      process.env.GEMINI_ACCESS_TOKEN;

    let articleText = '';
    let isLiveAI = false;
    let apiStatus = 'fallback';

    if (apiKey) {
      const prompt = `Write a comprehensive, high-authority Irish SEO article for EcoSmartHomes Ireland about: "${keyword}". Include official SEAI grant deductions (€2,100 Solar PV, €6,500 Heat Pump, up to €25,000 One-Stop-Shop), ROI payback calculations, BER rating impact, and vetted contractor guidelines. Format in clean markdown with H1, H2, and H3 headings.`;

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey,
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          },
        );

        if (response.ok) {
          const data = await response.json();
          articleText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (articleText) {
            isLiveAI = true;
            apiStatus = 'live-gemini-2.5';
          }
        } else {
          const errBody = await response.text();
          console.warn('Google API returned status:', response.status, errBody);
          apiStatus = `google-api-status-${response.status}`;
        }
      } catch (e: any) {
        console.warn('Fetch error to Gemini:', e.message);
        apiStatus = `fetch-error-${e.message}`;
      }
    }

    // High-Authority Fallback
    if (!articleText) {
      articleText = `# Complete Guide to ${keyword.charAt(0).toUpperCase() + keyword.slice(1)} in Ireland (2026)

Homeowners across Ireland can significantly lower electricity bills and improve building energy ratings (BER) by taking advantage of official Sustainable Energy Authority of Ireland (SEAI) grant schemes.

## SEAI Grant Deductions Available in 2026
- **Solar PV Grant**: Up to **€2,100** deducted directly from your installer's invoice.
- **Heat Pump Grant**: Up to **€6,500** for upgrading old fossil fuel boilers to renewable heat pumps.
- **Deep Retrofit One-Stop-Shop**: Up to **€25,000** for comprehensive whole-home retrofits.

## Estimated Payback & ROI
With current Irish residential electricity tariffs and the Clean Export Guarantee (CEG) feed-in tariff, an average 4kWp Solar PV system delivers **€750 to €1,200** in annual savings, achieving complete payback within **5 to 7 years**.

## Next Steps
1. Request a technical site assessment from an SEAI-approved installer like EcoSmartHomes Ireland.
2. Confirm grant pre-approval prior to starting any installation work.
3. Complete the BER assessment to certify your A-rating upgrade.`;
    }

    const cleanSlug = keyword
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    return res.status(200).json({
      ok: true,
      success: true,
      keyword,
      article: articleText,
      content: articleText,
      draft: articleText,
      markdown: articleText,
      data: {
        title: `Comprehensive Guide to ${keyword}`,
        slug: cleanSlug,
        content: articleText,
        article: articleText,
        keyword,
      },
      isLiveAI,
      apiStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
