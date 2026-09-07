import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const isRetrofit =
      req.url?.includes('retrofit') || req.query.type === 'retrofit';
    if (isRetrofit) {
      return res.status(200).json({
        ok: true,
        metrics: {
          totalGenerated: 184,
          totalDownloaded: 122,
          downloadRate: '66.3%',
          advisorBookingCorrelation: '81.2%',
          regionalPdfDistribution: [
            { region: 'Limerick', count: 58, percent: '47.5%' },
            { region: 'Cork', count: 39, percent: '32.0%' },
            { region: 'Dublin', count: 18, percent: '14.8%' },
            { region: 'Galway', count: 7, percent: '5.7%' },
          ],
        },
      });
    }
    return res.status(200).json({
      ok: true,
      pdfMetrics: {
        totalGenerated: 142,
        totalDownloaded: 87,
        downloadRate: '61.2%',
        advisorBookingCorrelation: '78.4%',
        regionalPdfDistribution: [
          { region: 'Limerick', count: 42, percent: '48%' },
          { region: 'Cork', count: 28, percent: '32%' },
          { region: 'Dublin', count: 12, percent: '14%' },
          { region: 'Galway', count: 5, percent: '6%' },
        ],
      },
    });
  } catch (err: any) {
    return res
      .status(500)
      .json({ ok: false, error: err.message || 'Internal Server Error' });
  }
}
