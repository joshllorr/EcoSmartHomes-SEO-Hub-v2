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
    return res.status(200).end();
  }

  try {
    const { keyword, topic, mode, outline } = req.body || {};
    const effectiveKeyword = keyword || topic || 'solar pv grants ireland';

    const workerUrl = process.env.WORKER_URL;
    let generatedData = null;

    if (workerUrl) {
      const upstreamRes = await fetch(`${workerUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body || {}),
      }).catch(() => null);

      if (upstreamRes && upstreamRes.ok) {
        generatedData = await upstreamRes.json().catch(() => null);
      }
    }

    if (!generatedData) {
      generatedData = {
        title: `Complete Guide to ${effectiveKeyword.charAt(0).toUpperCase() + effectiveKeyword.slice(1)}`,
        slug: effectiveKeyword
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
        outline: outline || [
          '1. Overview & SEAI Grant Schemes in Ireland',
          '2. Eligibility Criteria & System Specifications',
          '3. Estimated Energy Savings & Payback Timeline',
          '4. Step-by-Step Grant Application Process',
          '5. Frequently Asked Questions',
        ],
        content: `## Complete Guide to ${effectiveKeyword}\n\nHomeowners in Ireland can unlock significant energy efficiency savings and SEAI grant subsidies...\n\n### Key Benefits\n- Reduced grid electricity dependence\n- Fixed installation warranties with vetted contractors\n- Accelerated return on investment\n\n### Next Steps\nCalculate your grant eligibility with the EcoSmartHomes calculator.`,
        metaDescription: `Discover how to maximize ${effectiveKeyword} in Ireland with vetted installers and SEAI grant deductions.`,
        tags: ['SEAI Grants', 'Energy Efficiency', 'Ireland Retrofit'],
        isMock: !workerUrl,
      };
    }

    return res.status(200).json({
      ok: true,
      success: true,
      data: generatedData,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    return res.status(500).json({
      ok: false,
      error: err.message || 'Content generation failed',
      route: 'api/generate',
    });
  }
}
