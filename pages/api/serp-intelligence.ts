import type { VercelRequest, VercelResponse } from '@vercel/node';
import { globalSERPIntelligenceEngine } from '../../src/logic/serpIntelligence';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method === 'POST') {
      const { keyword } = req.body || {};
      if (!keyword) {
        return res
          .status(400)
          .json({ ok: false, error: 'Keyword is required' });
      }
      const snapshot = await globalSERPIntelligenceEngine.compileSnapshot({
        keyword: String(keyword).trim(),
        difficulty: 32,
        search_volume: 18600,
        top_results: [
          {
            position: 1,
            title: `SEAI ${keyword} Ireland | Official Guidance`,
            url: `https://www.seai.ie/${String(keyword).replace(/\s+/g, '-')}`,
            meta_description: `Complete government details on ${keyword} grants in Ireland.`,
            themes: ['SEAI Grants', 'Government Subsidies'],
            strengths: ['High domain authority', 'Direct grant portal link'],
            weaknesses: ['Lacks interactive cost calculator'],
            features: ['featured_snippet'],
          },
          {
            position: 2,
            title: `${keyword} Installers & Grant Calculator`,
            url: `https://ecosmarthomes.ie/${String(keyword).replace(/\s+/g, '-')}`,
            meta_description: `Compare vetted installers and calculate your grant deduction instantly.`,
            themes: ['Installers', 'Cost Calculator'],
            strengths: ['Interactive tools', 'Fast quote generation'],
            weaknesses: ['Lower backlink volume'],
          },
        ],
      });
      return res.status(200).json({ ok: true, success: true, snapshot });
    }

    const keyword = (req.query?.keyword as string) || 'solar pv grants ireland';
    const snapshot = globalSERPIntelligenceEngine.getLatestSnapshot(keyword);
    return res.status(200).json({
      ok: true,
      success: true,
      snapshot: snapshot || null,
      message: snapshot
        ? 'Snapshot retrieved'
        : 'No snapshot found for keyword',
    });
  } catch (err: any) {
    return res
      .status(500)
      .json({ ok: false, error: err.message || 'Internal Server Error' });
  }
}
