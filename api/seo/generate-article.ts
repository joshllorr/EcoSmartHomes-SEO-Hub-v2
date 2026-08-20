import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI } from '@google/genai';

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
      body.keyword || body.title || body.topic || 'solar pv grants ireland';

    // ⭐ THE SINGLE MOST IMPORTANT LINE
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_ACCESS_TOKEN, // ← ENTERPRISE KEY (THE FIX)
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a detailed, high-authority Irish SEO article for EcoSmartHomes Ireland about: "${keyword}". Include official SEAI grant deductions (€2,100 Solar PV, €6,500 Heat Pump, up to €25,000 One-Stop-Shop), ROI payback calculations, BER impact, and vetted contractor guidelines. Format in clean markdown with H1, H2, and H3 headings.`,
    });

    const articleText = response?.text || '';

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
        content: articleText,
        article: articleText,
        keyword,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Gemini Enterprise Error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
